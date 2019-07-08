const Ajv = require('ajv')
const configSchema = require('./config.schema')
const constants = require('../constants')
const lintQuery = require('./lintQuery')
const getRequiredFields = function (config) {
  const requiredFields = ['TIME']
  config.tags.forEach(tagName => {
    if (![
      constants.ENVIRONMENT,
      constants.QUERY_CHECKSUM_FIELD_NAME].includes(tagName)) {
      requiredFields.push(tagName)
    }
  })
  Object.keys(config.fields).forEach(fieldName => {
    requiredFields.push(fieldName)
  })
  return requiredFields
}

const lintConfig = function (queryConfig) {
  const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
  const validate = ajv.compile(configSchema)
  let valid = validate(queryConfig)
  let allErrors = []
  if (!valid) {
    allErrors = allErrors.concat(validate.errors)
  } else {
    const requiredFields = getRequiredFields(queryConfig)
    const errors = lintQuery(queryConfig.queryString, requiredFields)
    allErrors = allErrors.concat(errors)
  }
  allErrors.forEach(error => {
    error.measurementName = queryConfig.measurementName
  })
  return allErrors
}

module.exports = lintConfig
