const lintQuery = function (query, requiredFields) {
  const errors = []
  const parts = query.split(/[\s,., ]+/)
  requiredFields.forEach(field => {
    if (!parts.includes(field)) {
      errors.push({
        message: `The field listed in config ${field} is missing from the query.`,
      })
    }
  })
  return errors
}

module.exports = lintQuery
