const findConfig = require('./utils/config').find
const seedDatabase = require('./utils/seedDatabase')

const testTable = 'TEST_TABLE_NAME'
const conf = findConfig('someMeasurement', 'prod')
seedDatabase(13337, testTable, conf)
