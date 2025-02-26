// Usage eg:
// node makerecords.js GB 10000 500 largetest/testdata.csv afixedseedifyouwantit

import fs from 'fs'
import path from 'path'
import wordListPath from 'word-list'
import seedrandom from 'seedrandom'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

let gridtype = false
let desiredRecordCount = 0
let speciesCount = 0

console.log('Make test records in CSV format')

const GBletters = [
  'SV', 'SW', 'SX', 'SY', 'SZ',
  'TV',
  'SR', 'SS', 'ST', 'SU',
  'TQ', 'TR',
  'SM', 'SN', 'SO', 'SP',
  'TL', 'TM',
  'SH', 'SJ', 'SK',
  'TF', 'TG',
  'SC', 'SD', 'SE',
  'TA',
  'NW', 'NX', 'NY', 'NZ',
  'OV',
  'NR', 'NS', 'NT', 'NU',
  'NL', 'NM', 'NN', 'NO', 'NP',
  'NF', 'NG', 'NH', 'NI', 'NJ',
  'NA', 'NB', 'NC', 'ND', 'NE',
  'HW', 'HX', 'HY', 'HZ',
  'HT', 'HU',
  'HO', 'HP'
]

const IEletters = [
  'B', 'C', 'D',
  'F', 'G', 'H', 'J',
  'L', 'M', 'N', 'O',
  'Q', 'R', 'S', 'T',
  'V', 'W', 'X'
]

const GBIEletters = [...GBletters, ...IEletters]

export async function run (argv) {
  try {
    if (argv.length < 6) {
      console.error('usage: node makerecords.js GB|IE|GBIE <desired-record-count> <species-count> <output-csv-file> <random-seed>')
      return 0
    }

    gridtype = argv[2]
    if (String(gridtype) !== 'GB' && String(gridtype) !== 'IE' && String(gridtype) !== 'GBIE') {
      console.error('duff gridtype', gridtype)
      return 0
    }
    desiredRecordCount = parseInt(argv[3])
    speciesCount = parseInt(argv[4])
    console.log('makerecord', gridtype, desiredRecordCount, speciesCount, argv[5])

    console.log('Species list obtained from', wordListPath)
    const speciesArray = fs.readFileSync(wordListPath, 'utf8').split('\n')
    if (speciesCount > speciesArray.length) {
      console.error('Not enough species names in list', speciesArray.length)
      return 0
    }

    // Make linear distribution curve
    const distribution = []
    for (let speciesno = 0; speciesno < speciesCount; speciesno++) {
      for (let probability = 0; probability < speciesno; probability++) {
        distribution.push(speciesno)
      }
    }
    console.log('distribution spread', distribution.length)
    console.log('Least likely', speciesArray[distribution[0]])
    console.log('Most likely', speciesArray[distribution[distribution.length - 1]])

    let randomseed = null
    if (argv.length >= 6) randomseed = argv[6]
    console.log('randomseed', randomseed)

    const myrng = seedrandom(randomseed)

    const outpath = path.resolve(__dirname, argv[5])
    const letters = String(gridtype) === 'GBIE' ? GBIEletters : String(gridtype) === 'GB' ? GBletters : IEletters
    const letterslen = letters.length
    const generateRecords = new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outpath)
      stream.on('close', function (fd) {
        resolve()
      })
      stream.on('open', function (fd) {
        stream.write('Spatial Reference,Date,Taxon Name\r')

        for (let recno = 0; recno < desiredRecordCount; recno++) {
          const gr1 = letters[parseInt(myrng() * letterslen)]
          const gr2 = String(parseInt(myrng() * 10000)).padStart(4, '0')
          const speciesno = distribution[parseInt(myrng() * distribution.length)]
          const speciesname = speciesArray[speciesno]
          stream.write(gr1 + gr2 + ',01/04/2020,' + speciesname + '\r')
        }
        stream.end()
      })
      stream.on('error', function (err) {
        console.error('Write error', err.message)
        console.log(err.stack);
        reject("FILE ERROR")
      })
    })
    await generateRecords
    console.error('DONE')
    return 1
  } catch (e) {
    console.error('FAILED', e)
    return 2
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If testing, then don't.
if (process.env.JEST_WORKER_ID === undefined) {
  run(process.argv)
}
