module.exports = function isObject (a) {
  return (!!a) && (a.constructor === Object)
}
