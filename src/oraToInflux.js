const async = require('async')
const influxGetMaxTime = require('./influx/getMaxTime')
const ensureDbExists = require('./influx/ensureDbExists')
const oraStream = require('./oracle/stream')
const createInfluxClient = require('./influx/createClient')
const constants = require('./constants')
const logger = require('./utils/Logger')
const createDate = require('./utils/createDate')

const oraToInfluxQueue = async.queue(function (conf, funcCallback) {
  const oraQueryParams = conf.oraQueryParams || {}
  const startProcessTime = Date.now()
  if (process.env.NODE_ENV === 'development') {
    oraQueryParams.UPDATED_TIME = createDate(new Date(), -7)
  } else {
    oraQueryParams.UPDATED_TIME = new Date('1970-01-01')
  }
  const functionResult = {
    message: `Running job ${conf.measurementName} in environment ${conf.environment}`,
    level: 'INFO',
    oraQueryParams: null,
    numberOfRowsRetrieved: null,
    batchedWrittenToInflux: 0,
    processingTime: 0,
  }
  try {
    const influx = createInfluxClient(conf)

    async.series([
      function (asynCallback) {
        ensureDbExists(conf, (err) => asynCallback(err))
      },
      /**
       * Fjerner serier som er utdatert.
       */
      function (asynCallback) {
        influx.dropSeries({
          measurement: m => m.name(conf.measurementName),
          where: e => {
            if (conf.snapshotMode) {
              return e
                .tag(constants.ENVIRONMENT).equals.value(conf.environment)
            } else {
              return e
                .tag(constants.ENVIRONMENT).equals.value(conf.environment).and
                .tag(constants.QUERY_CHECKSUM_FIELD_NAME).notEqual.value(conf.queryChecksum)
            }
          },
        }).then(result => {
          asynCallback(null, result)
        }).catch(err => {
          asynCallback(err)
        })
      },
      /**
       * Henter først max tiden
       */
      function (asynCallback) {
        if (conf.snapshotMode) {
          // do nothing
          asynCallback()
        } else {
          influxGetMaxTime(conf).then(function (updatedTime) {
            if (updatedTime) {
              oraQueryParams.UPDATED_TIME = updatedTime
            }
            asynCallback()
          }).catch(err => {
            asynCallback(err)
          })
        }
      },
      /**
       * Performing the query against Oracle.
       */
      async function () {
        if (conf.snapshotMode) {
          functionResult.oraQueryParams = {}
          conf.oraQueryParams = {}
        } else {
          oraQueryParams.UPDATED_TIME = oraQueryParams.UPDATED_TIME.toISOString().replace('Z', '-00:00')
          functionResult.oraQueryParams = oraQueryParams
          conf.oraQueryParams = oraQueryParams
        }
        const result = await oraStream(conf, function (points) {
          return influx.writePoints(points)
        })
        functionResult.numberOfRowsRetrieved = result.totalRows
        functionResult.processingTime = Date.now() - startProcessTime
        functionResult.batchedWrittenToInflux = result.numberOfBatches
        functionResult.startTime = result.startTime
        functionResult.endTime = result.endTime
      },
    ], function (err) {
      if (err) {
        logger.error(err.message, {
          event: `BATCHJOB_FAILED`,
          operation: `ora-to-influx/${conf.measurementName}`,
          processing_time: Date.now() - startProcessTime,
        })
      }
      funcCallback(functionResult)
    })
  } catch (err) {
    logger.error(err.message, {
      event: `BATCHJOB_FAILED`,
      operation: `ora-to-influx/${conf.measurementName}`,
      processing_time: Date.now() - startProcessTime,
    })
    funcCallback(functionResult)
  }
})

module.exports = oraToInfluxQueue
