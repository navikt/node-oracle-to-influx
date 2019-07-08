const Influx = require('influx')
const URL = require('url').URL

/**
 * @param config
 * @returns {InfluxDB}
 */
module.exports = function (config) {
  const schemas = [
    {
      measurement: config.measurementName,
      fields: config.fields,
      tags: config.tags,
    },
  ]
  const parts = new URL(config.influx.url)
  const protocol = parts.protocol.replace(':', '')
  return new Influx.InfluxDB({
    host: parts.hostname,
    port: parts.port || 8086,
    protocol: protocol || 'http',
    database: config.influx.database,
    username: config.influx.username,
    password: config.influx.password,
    schema: schemas,
  })
}
