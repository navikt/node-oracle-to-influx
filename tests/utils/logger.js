const chalk = require('chalk')
module.exports = function (message) {
  const formattedMessage = chalk.gray(`   👍 ${message}`)
  console.debug(formattedMessage)
}
