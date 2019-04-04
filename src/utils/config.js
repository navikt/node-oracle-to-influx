let config = []

module.exports = {
  find: function (name, environment) {
    const conf = config.find(conf => conf.measurementName === name && conf.environment === environment)
    if (conf) {
      return JSON.parse(JSON.stringify(conf))
    }
  },
  set: function (conf) {
    config = conf
  },
  get: function () {
    return JSON.parse(JSON.stringify(config))
  },
}
