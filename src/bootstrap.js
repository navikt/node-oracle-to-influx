const logger = require('./utils/Logger')
const cron = require('./cronenberg')
const express = require('express')
const oraToInflux = require('./oraToInflux')
const setConfig = require('./utils/config').set
/**
 * Will start the cronjob and return the utility server.
 *
 * @param rawConfig
 * @returns {app}
 */
module.exports = function bootstrap (rawConfig) {
  const app = express()
  process.on('error', function (err) {
    logger.error(`Uncaught Exception: ${err.message}`, {
      event: 'UNCAUGHT_EXCEPTION',
    })
  })
  process.env.ORA_SDTZ = 'UTC'
  process.env.TZ = 'UTC'
  app.set('json spaces', 2)
  app.get('/', require('./routes/home'))
  app.get('/_admin', require('./routes/_admin'))
  app.get('/browse', require('./routes/configList'))
  app.get('/browse/:measurementName/:environment', require('./routes/configView'))
  app.get('/browse/:measurementName/:environment/influx-tail', require('./routes/influxTail'))
  app.get('/browse/:measurementName/:environment/ora-tail', require('./routes/oraTail'))
  app.get('/browse/:measurementName/:environment/run-job', require('./routes/runJob'))
  app.get('/browse/:measurementName/:environment/show-sql', require('./routes/showSql'))
  app.get('/db-info', require('./routes/dbInfo'))
  app.get('/its-alive', require('./routes/itsAlive'))

  /**
   *  Adding Cronjobs
   */
  const configs = setConfig(rawConfig)
  configs.forEach(function (queryConfig) {
    logger.info(`Query ${queryConfig.measurementName} scheduled (${queryConfig.schedule}).`, {
      log_name: queryConfig.measurementName,
      event: 'QUERY_SCHEDULED',
      operation: `bootstrap/schedule`,
    })
    cron.add(queryConfig.schedule, function () {
      oraToInflux.push(queryConfig, function (err) {
        if (err) {
          // console.error(err.message)
        }
      })
    })
  })

  cron.start()
  return app
}
