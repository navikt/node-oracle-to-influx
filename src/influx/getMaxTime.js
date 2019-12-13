const validateMesurementName = require('./validateMesurementName')
const logger = require('../utils/Logger')
const constants = require('../constants')
const createDate = require('../utils/createDate')

/**
 * Determines startTime to start pulling data.
 * @param influx
 * @param config
 * @returns {Promise<never>|Promise<IResults<any> | never>}
 */
module.exports = function (influx, config) {
  if (!validateMesurementName(config.measurementName)) {
    return Promise.reject(new Error(`Det finnes ingen measurement med navn ${config.measurementName} i configen.`))
  }
  let defaultMaxTime = new Date('1970-01-01')
  if (process.env.NODE_ENV === 'development') {
    defaultMaxTime = createDate(new Date(), -7)
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
      return defaultMaxTime
    }
  }).catch(err => {
    logger.error(`influx.getMaxTime() failed with error, ${err.message}`, {
      log_name: `${config.measurementName}-${config.environment}`,
      operation: 'influx/get-max-time',
      event: 'INFLUXDB_ERROR',
      stack_trace: err.stack,
    })
  })
}
