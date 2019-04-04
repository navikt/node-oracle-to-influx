module.exports = function () {
  const argumentsString = JSON.stringify(arguments)
  return require('crypto')
    .createHash('md5')
    .update(argumentsString)
    .digest('hex')
}
