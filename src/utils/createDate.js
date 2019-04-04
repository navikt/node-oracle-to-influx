module.exports = function createDate (startDate, dayDiff) {
  if (typeof startDate === 'string') {
    startDate = new Date(startDate)
  }
  const d = new Date(startDate)
  d.setDate(startDate.getDate() + dayDiff)
  return d
}
