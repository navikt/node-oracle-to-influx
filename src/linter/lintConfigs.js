const lintConfig = require('./lintConfig')
const setConfig = require('../utils/config').set
/**
 * @todo write linter
 * @param configs
 */
module.exports = function (rawConfigs) {
  let isValid = true
  const configs = setConfig(rawConfigs)
  configs.forEach((config) => {
    const errors = lintConfig(config)
    if (errors.length > 0) {
      isValid = false
      console.log(errors)
    }
  })
  return isValid
}
