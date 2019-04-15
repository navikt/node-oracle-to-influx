const oracledb = require('oracledb')
const constants = require('../constants')
const logger = require('../utils/Logger')
const prepParams = require('./prepParams')
const operation = 'oracle/stream'

const oraStream = async function (config, flushFunc) {
  const startProcessTime = Date.now()
  let connection, stream
  const ignoredFields = [constants.QUERY_CHECKSUM_FIELD_NAME, constants.ENVIRONMENT]
  const points = []
  const metadata = []
  const writePromises = []
  let startTime = null
  let endTime = null
  let totalRows = 0

  try {
    connection = await oracledb.getConnection(config.oraOptions)
    await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${config.schema} TIME_ZONE = DBTIMEZONE`)
    const queryParams = prepParams(config.oraQueryParams)
    stream = connection.queryStream(config.queryString, queryParams)
    stream.on('metadata', function (meta) {
      meta.forEach(v => metadata.push(v.name))
      config.tags.forEach(function (tagName) {
        if (!ignoredFields.includes(tagName) && !metadata.includes(tagName)) {
          throw new Error(`Tag ${tagName} not found in query for ${config.measurementName}`)
        }
      })
      Object.keys(config.fields).forEach(function (fieldName) {
        if (!metadata.includes(fieldName)) {
          throw new Error(`Field ${fieldName} not found in query for ${config.measurementName}`)
        }
      })
    })

    stream.on('data', function (data) {
      // data point that should be written to influxdb
      const point = {
        timestamp: data[metadata.indexOf('TIME')],
        measurement: config.measurementName,
        tags: {},
        fields: {},
      }
      if (point.timestamp < startTime || !startTime) { startTime = point.timestamp }
      if (point.timestamp > endTime || !endTime) { endTime = point.timestamp }
      config.tags.forEach(function (tagName) {
        // Tags should always be cast to strings.
        point.tags[tagName] = `${data[metadata.indexOf(tagName)]}`
      })
      point.tags[constants.QUERY_CHECKSUM_FIELD_NAME] = config.queryChecksum
      point.tags[constants.ENVIRONMENT] = config.environment
      Object.keys(config.fields).forEach(function (fieldName) {
        point.fields[fieldName] = data[metadata.indexOf(fieldName)]
      })
      points.push(point)
      if (points.length === 5000) {
        writePromises.push(flushFunc(points.splice(0, points.length)))
      }
      /**
       * Some statistics
       */
      totalRows++
    })
  } catch (err) {
    logger.error(err.message, {
      log_name: config.measurementName,
      event: 'ORACLE_ERROR',
      operation,
      stack_trace: err.stack,
    })
    return
  }

  return new Promise(function (resolve, reject) {
    stream.on('end', async function () {
      if (points.length > 0) {
        writePromises.push(flushFunc(points))
      }
      await connection.close()
      const processingTime = (Date.now() - startProcessTime) / 1000
      let message

      Promise.all(writePromises).then(res => {
        if (totalRows === 0) {
          message = `Measurement ${config.measurementName} did not return any new rows.`
        } else {
          message = `Measurement ${config.measurementName}(${startTime.toISOString()} - ${endTime.toISOString()}) fetched,` +
            ` and batched in ${writePromises.length} batches`
        }
        logger.info(message, {
          log_name: config.measurementName,
          event: 'BATCHJOB_SUCCESSFUL',
          operation,
          processing_time: processingTime,
          total_rows: totalRows,
        })
        resolve({
          totalRows,
          processingTime,
          numberOfBatches: writePromises.length,
          startTime,
          endTime,
        })
      })
    })
    stream.on('error', function (err) {
      logger.error(err.message, {
        log_name: config.measurementName,
        event: 'BATCHJOB_FAILED',
        operation,
        stack_trace: err.stack,
      })
      reject(error)
    })
  })
}

module.exports = oraStream
