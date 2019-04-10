const assert = require('assert')
const findConfig = require('./utils/config').find
const seedDatabase = require('./utils/seed')
const oraToInflux = require('../src/oraToInflux')

describe('Oracle To Influx', function () {
  it('ora to influx skal fungere for store datasett', (done) => {
    const testTable = 'TEST_TABLE_NAME'
    seedDatabase(100000, testTable).then(() => {
      const conf = findConfig('someMeasurement', 'prod')
      oraToInflux.push(conf, function (res) {
        assert.strictEqual(res.batchedWrittenToInflux > 0, true)
        done()
      })
    })
  }).timeout(60 * 1000) // should take less than 60 seconds
})
