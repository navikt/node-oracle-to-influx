module.exports = function shouldBackOff (numberOfFails, lastFailed, timeNow) {
  if (86400000 + lastFailed < timeNow) {
    return false
  }
  const numb = Math.pow(numberOfFails, 2) * 1000 * 60

  return numb + lastFailed > timeNow
}
