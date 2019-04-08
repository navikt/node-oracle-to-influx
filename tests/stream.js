const testStream = require('../src/oracle/stream')
const findConfig = require('./config').find
const createInfluxClient = require('../src/influx/createClient')

async function testStreaming (conf) {
  conf.params = { UPDATED_TIME: new Date('2018-01-01') }
  conf.params.UPDATED_TIME = conf.params.UPDATED_TIME.toISOString().replace('Z', '-00:00')
  const influx = createInfluxClient(conf)
  await testStream(conf, (points) => {
    return influx.writePoints(points.splice(0, points.length))
  })
}

const conf = findConfig('someMeasurement', 'prod')

testStreaming(conf)
