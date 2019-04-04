const lintConfig = function (queryConfig) {

}
module.exports = function (configs) {
  configs.foreach((config) => {
    lintConfig(config)
  })
}
