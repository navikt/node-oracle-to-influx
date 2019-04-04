const startTime = new Date()
module.exports = function (req, res) {
  res.json({
    status: 'alive',
    since: startTime
  }).status(200)
}
