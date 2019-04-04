const getConfig = require('../utils/config').get

module.exports = function (measurementName) {
  const validNames = []
  getConfig().forEach(function (measureConfig) {
    validNames.push(measureConfig.measurementName)
  })
  return validNames.includes(measurementName)
}
