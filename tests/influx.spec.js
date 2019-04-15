const assert = require('assert')
const createInfluxClient = require('../src/influx/createClient')
const ensureDatabase = require('../src/influx/ensureDatabase')
const findConfig = require('./utils/config').find
const express = require('express')
const logger = require('./utils/logger')

describe('Influx functions', function () {
  it('ensure that database get created ', async () => {
    const conf = findConfig('someMeasurement', 'prod')
    const influx = createInfluxClient(conf)
    await influx.dropDatabase(conf.influx.database)
    await ensureDatabase(influx, conf.influx.database)
    const names = await influx.getDatabaseNames()
    assert.strictEqual(names.includes(conf.influx.database), true)
  })
  it('should handle error server', async () => {
    const conf = findConfig('someMeasurement', 'prod')
    const influx = createInfluxClient(conf)
    try {
      await ensureDatabase(influx, 'http://localhost:48089')
      await ensureDatabase(influx, conf.influx.database)
    } catch (e) {
      assert.strictEqual(e.message, 'Error from InfluxDB: invalid name')
    }
  })
})
