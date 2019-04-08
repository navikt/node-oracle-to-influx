let config = []
const prepConfig = require('../prepConfig')

module.exports = {
  find: function (name, environment) {
    const conf = config.find(conf => conf.measurementName === name && conf.environment === environment)
    if (conf) {
      return JSON.parse(JSON.stringify(conf))
    }
  },
  set: function (rawConfig) {
    config = prepConfig(rawConfig)
    return JSON.parse(JSON.stringify(config))
  },
  get: function () {
    return JSON.parse(JSON.stringify(config))
  },
}
