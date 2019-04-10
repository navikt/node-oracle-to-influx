const rawConfigs = require('./testConfigs')
const logger = require('./logger')
const bootstrap = require('../../src').bootstrap
const port = process.env.PORT || 8082
const createInfluxClient = require('../../src/influx/createClient')

rawConfigs.forEach(async conf => {
  const influx = createInfluxClient(conf)
  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
  })
  logger(`Cleaned up ${conf.measurementName}`)
})
bootstrap(rawConfigs).listen(port)
