const async = require('async')
const influxGetMaxTime = require('./influx/getMaxTime')
const ensureDbExists = require('./influx/ensureDbExists')
const oraConnect = require('./oracle/connection')
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
     * Performing the query agains Oracle.
     */
    function (asynCallback) {
      if (conf.snapshotMode) {
        res.oraQueryParams = {}
        conf.oraQueryParams = {}
      } else {
        oraQueryParams.UPDATED_TIME = oraQueryParams.UPDATED_TIME.toISOString().replace('Z', '-00:00')
        res.oraQueryParams = oraQueryParams
        conf.oraQueryParams = oraQueryParams
      }

      oraConnect(conf, function (result, error) {
        res.numberOfRowsRetrieved = result.rows.length
        const points = []
        const writePromises = []
        result.rows.forEach(function (row) {
          const tags = {}
          const fields = {}
          conf.tags.forEach(function (tagName) {
            if (!ignoredFields.includes(tagName) && typeof row[tagName] === 'undefined') {
              error = new Error(`Tag ${tagName} not found in measurement config for ${conf.measurementName}`)
            }
            // Tags should always be cast to strings.
            tags[tagName] = `${row[tagName]}`
          })
          tags[constants.QUERY_CHECKSUM_FIELD_NAME] = conf.queryChecksum
          tags[constants.ENVIRONMENT] = conf.environment
          Object.keys(conf.fields).forEach(function (fieldName) {
            if (typeof row[fieldName] === 'undefined') {
              error = new Error(`Field ${fieldName} not found in measurementConfig ${conf.measurementName}`)
            }
            fields[fieldName] = row[fieldName]
          })
          points.push({
            timestamp: row.TIME,
            measurement: conf.measurementName,
            tags: tags,
            fields: fields,
          })
          if (!error && points.length === 1000) {
            res.pointsWrittenToInflux.push(points.length)
            writePromises.push(influx.writePoints(points.splice(0, points.length)))
          }
        })
        if (!error && points.length > 0) {
          res.pointsWrittenToInflux.push(points.length)
          writePromises.push(influx.writePoints(points))
        }
        return Promise.all(writePromises).then(function () {
          res.pointsWrittenToInflux = res.pointsWrittenToInflux.join()
          res.processing_time = Date.now() - startProcessTime
          if (result.numberOfRowsRetrieved === 10000) {
            /**
             * Requeue if not finished
             */
            oraToInfluxQueue.push(conf)
          }
          logger.log(null, null, res)
          asynCallback(error, res)
        })
      })
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
