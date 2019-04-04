const createInfluxClient = require('./createClient')
const constants = require('../constants')

module.exports = function (config) {
  const influx = createInfluxClient(config)
  return influx.query(`
         SELECT * FROM "${config.measurementName}"
         WHERE "${constants.ENVIRONMENT}" = '${config.environment}'
         ORDER BY time desc
         limit 100
 `)
}
