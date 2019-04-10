module.exports = function (params) {
  const output = params || {}
  if (output.UPDATED_TIME && output.UPDATED_TIME instanceof Date) {
    output.UPDATED_TIME = output.UPDATED_TIME.toISOString().replace('Z', '-00:00')
  }
  return output
}
