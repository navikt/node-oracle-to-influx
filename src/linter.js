const lintConfig = function (queryConfig) {

}
/**
 * @todo write linter
 * @param configs
 */
module.exports = function (configs) {
  configs.foreach((config) => {
    lintConfig(config)
  })
}
