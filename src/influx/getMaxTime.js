const createInfluxClient = require('./createClient')
const validateMesurementName = require('./validateMesurementName')
const logger = require('../utils/Logger')
const constants = require('../constants')

module.exports = function (config) {
  const influx = createInfluxClient(config)
  if (!validateMesurementName(config.measurementName)) {
    return Promise.reject(new Error(`Det finnes ingen measurement med navn ${config.measurementName} i configen.`))
  }
  const queryString = `
         SELECT * FROM "${config.measurementName}"
         WHERE "${constants.ENVIRONMENT}" = '${config.environment}'
         ORDER BY time desc
         LIMIT 1`
  return influx.query(queryString).then(result => {
    if (result[0]) {
      return result[0].time
    } else {
      return null
    }
  }).catch(err => {
    logger.error(`influx.getMaxTime() failed with error, ${err.message}`, {
      log_name: config.measurementName,
      operation: 'influx/get-max-time',
      event: 'INFLUXDB_ERROR',
    })
  })
}
