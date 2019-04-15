const assert = require('assert')
const createInfluxClient = require('../src/influx/createClient')
const ensureDatabase = require('../src/influx/ensureDatabase')
const findConfig = require('./utils/config').find

describe('Influx functions', function () {
  it('ensure that database get created ', async () => {
    const conf = findConfig('someMeasurement', 'prod')
    const influx = createInfluxClient(conf)
    await influx.dropDatabase(conf.influx.database)
    await ensureDatabase(influx, conf.influx.database)
    const names = await influx.getDatabaseNames()
    assert.strictEqual(names.includes(conf.influx.database), true)
  })

  it('dsa', async () => {
    // console.log(process.env)
  })
})
