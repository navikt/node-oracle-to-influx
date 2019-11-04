const influxGetMaxTime = require('./influx/getMaxTime')
const ensureDatabase = require('./influx/ensureDatabase')
const dropMeasurement = require('./influx/dropMeasurement')
const oraStream = require('./oracle/stream')
const createInfluxClient = require('./influx/createClient')
const logger = require('./utils/Logger')
const makeCacheKey = require('./utils/makeCacheKey')
const { default: PQueue } = require('p-queue')

const queue = new PQueue({ concurrency: 1 })

const oraToInflux = async function (conf) {
  const oraQueryParams = conf.oraQueryParams || {}
  const startProcessTime = Date.now()
  const functionResult = {
    message: `Running job ${conf.measurementName} in environment ${conf.environment}`,
    success: true,
    oraQueryParams: null,
    numberOfRowsRetrieved: null,
    batchedWrittenToInflux: 0,
    processingTime: 0,
  }
  try {
    const influx = createInfluxClient(conf)
    await ensureDatabase(influx, conf.influx.database) // Checks if database is online and creates database if not.
    await dropMeasurement(influx, conf) // Removes outdated measurements
    if (conf.snapshotMode) {
      conf.oraQueryParams = {}
    } else {
      oraQueryParams.UPDATED_TIME = await influxGetMaxTime(influx, conf) // Determine the start time for pulling
      conf.oraQueryParams = oraQueryParams
    }
    const result = await oraStream(conf, points => influx.writePoints(points)) // Performing the query against Oracle.
    if (result) {
      functionResult.batchedWrittenToInflux = result.numberOfBatches
      functionResult.numberOfRowsRetrieved = result.totalRows
      functionResult.startTime = result.startTime
      functionResult.endTime = result.endTime
    }
    functionResult.processingTime = Date.now() - startProcessTime
    functionResult.oraQueryParams = conf.oraQueryParams
  } catch (err) {
    logger.error(err.message, {
      log_name: conf.measurementName,
      event: 'BATCHJOB_FAILED',
      operation: 'ora-to-influx',
      processing_time: Date.now() - startProcessTime,
      stack_trace: err.stack,
    })
    functionResult.message = err.message
    functionResult.success = false
  }
  return functionResult
}

const inQueue = {}

module.exports = {
  unshift: async function (task) {
    return queue.add(() => oraToInflux(task))
  },
  push: async function (task) {
    const signature = makeCacheKey(task.measurementName, task.environment, task.queryChecksum)
    let result = {
      success: true,
    }
    // Resetter køen om den faktisk er helt tom.
    if (queue.size === 0 && queue.pending === 0) {
      Object.keys(inQueue).forEach(signature => (inQueue[signature] = false))
    }
    if (!inQueue[signature]) {
      inQueue[signature] = true
      result = await queue.add(() => oraToInflux(task))
      inQueue[signature] = false
    }
    return result
  },
  stats: function () {
    return {
      size: queue.size,
      pending: queue.pending,
      isPaused: queue.isPaused,
    }
  },
}
