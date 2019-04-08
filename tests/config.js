const config = require('../src/utils/config')
const testConfig = require('./testConfigs')
config.set(testConfig)
module.exports = config
