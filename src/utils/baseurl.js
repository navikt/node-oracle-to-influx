const url = require('url')
module.exports = function (req) {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  const protocol = (url.parse(fullUrl).hostname === 'localhost') ? 'http' : 'https'
  return `${protocol}://${url.parse(fullUrl).host}`
}
