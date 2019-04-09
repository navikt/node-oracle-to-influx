const rawConfig = require('./testConfigs')
const bootstrap = require('../src').bootstrap
const port = process.env.PORT || 8082
const createInfluxClient = require('../src/influx/createClient')

rawConfig.forEach(async conf => {
  const influx = createInfluxClient(conf)
  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
  })
  console.log(`Cleaned up ${conf.measurementName}`)
})
bootstrap(rawConfig).listen(port)
