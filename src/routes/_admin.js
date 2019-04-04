module.exports = function (req, res) {
  const ordered = {}
  Object.keys(process.env).sort().forEach(function (key) {
    if (/password/gi.test(key)) {
      ordered[key] = '**secret**'
    } else {
      ordered[key] = process.env[key]
    }
  })
  res.send(ordered)
}
