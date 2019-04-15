const config = require('../../src/utils/config')
const testConfig = require('./testConfigs')
config.set(testConfig)
process.env.NODE_ENV = 'test'
module.exports = config
