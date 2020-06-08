const fc = require('filecompare');

async function checkFilesEqual(path1, path2) {
  const areFilesEqual = new Promise((resolve, reject) => {
    fc(path1, path2, isEqual => {
        resolve(isEqual)
      })
  })
  if (!await areFilesEqual) {
    console.log('FILES NOT EQUAL', path1, path2)
    return -1
  }
  return 1
}

module.exports = { checkFilesEqual }
