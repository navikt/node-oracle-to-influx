const async = require('async')
const influxGetMaxTime = require('./influx/getMaxTime')
const ensureDatabase = require('./influx/ensureDatabase')
const dropMeasurement = require('./influx/dropMeasurement')
const oraStream = require('./oracle/stream')
const createInfluxClient = require('./influx/createClient')
const logger = require('./utils/Logger')

const oraToInflux = async function (conf) {
  const oraQueryParams = conf.oraQueryParams || {}
  const startProcessTime = Date.now()
  const functionResult = {
    message: `Running job ${conf.measurementName} in environment ${conf.environment}`,
    oraQueryParams: null,
    numberOfRowsRetrieved: null,
    batchedWrittenToInflux: 0,
    processingTime: 0,
  }
  try {
    await ensureDatabase(conf)

    // Removes outdated measurements
    await dropMeasurement(conf)
    if (conf.snapshotMode) {
      conf.oraQueryParams = {}
    } else {
      // Determine the start time for pulling
      oraQueryParams.UPDATED_TIME = await influxGetMaxTime(conf)
      conf.oraQueryParams = oraQueryParams
    }
    // Performing the query against Oracle.
    const influx = createInfluxClient(conf)
    const result = await oraStream(conf, function (points) {
      return influx.writePoints(points)
    })
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
      event: `BATCHJOB_FAILED`,
      operation: `ora-to-influx`,
      processing_time: Date.now() - startProcessTime,
    })
    functionResult.message = err.message
  }
  return functionResult
}

const oraToInfluxQueue = async.queue(function (task, callback) {
  oraToInflux(task).then(callback)
})

module.exports = oraToInfluxQueue
