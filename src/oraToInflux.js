const async = require('async')
const influxGetMaxTime = require('./influx/getMaxTime')
const ensureDbExists = require('./influx/ensureDbExists')
const oraStream = require('./oracle/stream')
const createInfluxClient = require('./influx/createClient')
const constants = require('./constants')
const logger = require('./utils/Logger')
const createDate = require('./utils/createDate')

const oraToInfluxQueue = async.queue(function (conf, funcCallback) {
  const ignoredFields = [constants.QUERY_CHECKSUM_FIELD_NAME, constants.ENVIRONMENT]
  const oraQueryParams = conf.oraQueryParams || {}
  const startProcessTime = Date.now()
  if (process.env.NODE_ENV === 'development') {
    // At dev servers, just replicate last 7 days.
    oraQueryParams.UPDATED_TIME = createDate(new Date(), -7)
  } else {
    oraQueryParams.UPDATED_TIME = new Date('2018-01-01')
  }
  const res = {
    message: `Running job ${conf.measurementName} in environment ${conf.environment}`,
    level: 'INFO',
    oraQueryParams: null,
    numberOfRowsRetrieved: null,
    pointsWrittenToInflux: [],
    processing_time: 0,
  }
  const influx = createInfluxClient(conf)

  async.series([
    function (asynCallback) {
      ensureDbExists(conf, (err) => asynCallback(err))
    },
    async function () {
      await influx.dropSeries({
        measurement: m => m.name(conf.measurementName),
      })
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
        res.oraQueryParams = {}
        conf.oraQueryParams = {}
      } else {
        oraQueryParams.UPDATED_TIME = oraQueryParams.UPDATED_TIME.toISOString().replace('Z', '-00:00')
        res.oraQueryParams = oraQueryParams
        conf.oraQueryParams = oraQueryParams
      }
      const someresult = await oraStream(conf, function (points) {
        return influx.writePoints(points)
      })
      console.log(someresult)
    },
  ], function (err) {
    if (err) {
      logger.error(err.message, {
        operation: 'ora-to-influx',
        event: conf.measurementName,
        processing_time: Date.now() - startProcessTime,
      })
    }
    funcCallback(res)
  })
})

module.exports = oraToInfluxQueue
