const oracledb = require('oracledb')
const constants = require('../constants')
const logger = require('../utils/Logger')

const testStream = async function (config, flushFunc) {
  const startProcessTime = Date.now()
  const connection = await oracledb.getConnection(config.oraOptions)
  await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${config.schema} TIME_ZONE = DBTIMEZONE`)
  const stream = connection.queryStream(config.queryString, config.params)
  const ignoredFields = [constants.QUERY_CHECKSUM_FIELD_NAME, constants.ENVIRONMENT]
  const points = []
  const metadata = []
  const writePromises = []
  stream.on('metadata', function (meta) {
    meta.forEach(v => metadata.push(v.name))
    config.tags.forEach(function (tagName) {
      if (!ignoredFields.includes(tagName) && !metadata.includes(tagName)) {
        throw new Error(`Tag ${tagName} not found in query for ${config.measurementName}`)
      }
    })
    Object.keys(config.fields).forEach(function (fieldName) {
      if (!metadata.includes(fieldName)) {
        throw new Error(`Field ${fieldName} not found in query for ${conf.measurementName}`)
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
  })

  stream.on('error', function (error) {
    logger.error(error.message)
  })
  return new Promise(function (resolve, reject) {
    stream.on('end', async function () {
      writePromises.push(flushFunc(points))
      await connection.close()
      const processing_time = (Date.now() - startProcessTime) / 1000
      logger.info(`Measurement ${config.measurementName} pulled.`, {
        processing_time,
      })
      Promise.all(writePromises).then(resolve)
    })
  })
}

module.exports = testStream
