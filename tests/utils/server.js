const rawConfigs = require('./testConfigs')
const logger = require('./logger')
const bootstrap = require('../../src').bootstrap
const port = process.env.PORT || 8082
const createInfluxClient = require('../../src/influx/createClient')
const ensureDatabase = require('../../src/influx/ensureDatabase')
rawConfigs.forEach(async conf => {
  const influx = createInfluxClient(conf)
  await ensureDatabase(influx, 'metrics')
  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
  })
  logger(`Cleaned up ${conf.measurementName}`)
})
bootstrap(rawConfigs).listen(port, function (res) {
  logger(`server started on port: ${port}`)
})
