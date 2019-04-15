const assert = require('assert')
const findConfig = require('./utils/config').find
const dropDatabaseIfExists = require('./utils/dropDatabaseIfExists')
const seedDatabase = require('./utils/seed')
const createInfluxClient = require('../src/influx/createClient')
const oraToInflux = require('../src/oraToInflux')
const testTable = 'TEST_TABLE_NAME'
const http = require('http')

// store a reference to the original request function
const originalRequest = http.request
// override the function
http.request = function wrapMethodRequest (req) {
  // console.log(".")
  return originalRequest.apply(this, arguments)
}

describe('Oracle To Influx', function () {
  it('skal fungere for store datasett', async () => {
    await seedDatabase(100000, testTable)
    const conf = findConfig('someMeasurement', 'prod')
    const influx = createInfluxClient(conf)
    await dropDatabaseIfExists(influx, conf.influx.database)
    const result = await oraToInflux.push(conf)
    assert.strictEqual(result.batchedWrittenToInflux, 20)
  }).timeout(10000)

  it('similar items should be removed from queue', async () => {
    await seedDatabase(2500, testTable)
    const conf = findConfig('someMeasurement', 'prod')
    conf.queryChecksum = 'RANDOMVALUE'
    const influx = createInfluxClient(conf)
    await dropDatabaseIfExists(influx, conf.influx.database)
    const tasks = [
      oraToInflux.push(conf),
      oraToInflux.push(conf),
      oraToInflux.push(conf),
    ]
    assert.strictEqual(oraToInflux.stats().pending, 1)
    await Promise.all(tasks)
  }).timeout(10000)
})
