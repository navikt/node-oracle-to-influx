const fs = require('fs')
const simpleCache = []
module.exports = function (dirName) {
  // Adding some simple unlimited caching.
  if (simpleCache[dirName] === undefined) {
    simpleCache[dirName] = []
    fs.readdirSync(dirName).forEach(fileName => {
      const fullFileName = dirName + fileName
      const fileStat = fs.lstatSync(fullFileName)
      if (fileStat.isFile()) {
        const fileContent = fs.readFileSync(fullFileName, 'utf8')
        simpleCache[dirName].push({
          fileName: fileName,
          fullFileName: fullFileName,
          birthtime: fileStat.birthtime,
          atime: fileStat.atime,
          mtime: fileStat.mtime,
          ctime: fileStat.ctime,
          content: fileContent,
        })
      }
    })
  }
  return simpleCache[dirName]
}
