const rawConfig = require('./tests/config')
const bootstrap = require('./src/bootstrap')
const port = process.env.PORT || 8081

bootstrap(rawConfig).listen(port)
