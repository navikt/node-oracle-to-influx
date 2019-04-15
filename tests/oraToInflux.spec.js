const assert = require('assert')
const findConfig = require('./utils/config').find
const seedDatabase = require('./utils/seed')
const createInfluxClient = require('../src/influx/createClient')
const oraToInflux = require('../src/oraToInflux')

describe('Oracle To Influx', function () {
  it('ora to influx skal fungere for store datasett', async () => {
    const testTable = 'TEST_TABLE_NAME'
    await seedDatabase(100000, testTable)
    const conf = findConfig('someMeasurement', 'prod')
    const influx = createInfluxClient(conf)
    await influx.dropDatabase(conf.influx.database)
    await oraToInflux.push(conf, res => {
      assert.strictEqual(res.batchedWrittenToInflux, 20)
    })
  }).timeout(60000)
})
