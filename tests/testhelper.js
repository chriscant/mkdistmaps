﻿import fc from 'filecompare'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const output = []
export function accumulog(...err) {
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

export function accumulogged() {
  return output.join("\n")
}

export async function checkFilesEqual(path1, path2) {
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

    if (path2.endsWith('.geojson')) {
      let path2text = fs.readFileSync(path2, { encoding: 'utf8' })
      console.log(path2text)
    }

    return 0
  }
  return 1
}
