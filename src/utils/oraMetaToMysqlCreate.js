const convertDataType = function (oracleMetaData) {
  switch (oracleMetaData.dbType) {
    case 2:
      return `BIGINT(${oracleMetaData.precision})`
    case 12:
      return 'DATE'
    case 187:
      return 'TIMESTAMP'
    case 1:
    case 96:
      return `VARCHAR(${oracleMetaData.byteSize})`
    default:
      console.warn('Unknown dbType:', oracleMetaData)
      return `VARCHAR(${oracleMetaData.byteSize})`
  }
}
const mysqlNullable = function (isNullable) {
  return isNullable ? 'NULL' : 'NOT NULL'
}
const addBackTicks = function (value) {
  return `\`${value}\``
}
module.exports = function (oracleMeta, tableName, primaryKey) {
  const statement = `CREATE TABLE IF NOT EXISTS ${addBackTicks(tableName)}(\n`
  const fields = []
  oracleMeta.forEach(function (metaData) {
    let fieldDeclaration = [
      addBackTicks(metaData.name),
      convertDataType(metaData),
      mysqlNullable(metaData.nullable)
    ]
    fields.push(fieldDeclaration.join(' '))
  })
  if (primaryKey && primaryKey.length > 0) {
    fields.push(`PRIMARY KEY (${primaryKey.join(', ')})`)
  }
  return statement.concat(fields.join(',\n'), '\n)')
}
