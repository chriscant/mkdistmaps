const fc = require('filecompare');

const output = []
function accumulog(...err) {
  let line = ''
  for (const e of err) {
    if (typeof e === 'object') {
      line += JSON.stringify(e)
    } else {
      line += e + ' '
    }
  }
  output.push(line)
}

function accumulogged() {
  return output.join("\n")
}

async function checkFilesEqual(path1, path2) {
  const areFilesEqual = new Promise((resolve, reject) => {
    fc(path1, path2, isEqual => {
        resolve(isEqual)
      })
  })
  if (!await areFilesEqual) {
    console.log('FILES NOT EQUAL', path1, path2)
    const stats1 = fs.statSync(path1)
    const stats2 = fs.statSync(path2)
    console.log('FILE SIZES', stats1.size, stats2.size)
    return 0
  }
  return 1
}

module.exports = { checkFilesEqual, accumulog, accumulogged }
