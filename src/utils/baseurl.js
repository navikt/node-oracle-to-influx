const URL = require('url').URL
module.exports = function (req) {
  const urlObj = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
  const protocol = (urlObj.hostname === 'localhost') ? 'http' : 'https'
  return `${protocol}://${urlObj.host}`
}
