const testStream = require('../src/oracle/stream')
const findConfig = require('./config').find
const createInfluxClient = require('../src/influx/createClient')

async function testStreaming (conf) {
  conf.oraQueryParams = { UPDATED_TIME: new Date('2018-01-01') }
  conf.oraQueryParams.UPDATED_TIME = conf.params.UPDATED_TIME.toISOString().replace('Z', '-00:00')
  const influx = createInfluxClient(conf)
  const databaseNames = await influx.getDatabaseNames()
  if (!databaseNames.includes(conf.influx.database)) {
    await influx.createDatabase(conf.influx.database)
  }
  /**
   * Bare slette gamle data fra influx først.
   */
  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
  })
  await testStream(conf, (points) => {
    console.log(`Flushed ${points.length}to influx`)
    return influx.writePoints(points)
  })
}

const conf = findConfig('someMeasurement', 'prod')

testStreaming(conf)
