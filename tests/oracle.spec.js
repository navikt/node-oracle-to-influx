const assert = require('assert')
const findConfig = require('./utils/config').find
const seedDatabase = require('./utils/seedDatabase')
const oracleStream = require('../src/oracle/stream')

describe('Oracle functions', function () {
  it('stream skal fungere', async () => {
    const conf = findConfig('someMeasurement', 'prod')
    conf.oraQueryParams = { UPDATED_TIME: new Date('2018-01-01') }
    const testTable = 'TEST_TABLE_NAME'
    await seedDatabase(6000, testTable, conf)
    const result = await oracleStream(conf, async points => {
      assert.strictEqual(true, Array.isArray(points))
      assert.strictEqual(true, points.length > 0)
    })
    assert.strictEqual(result.numberOfBatches, 2)
  }).timeout(10000)
})
