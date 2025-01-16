#!/usr/bin/env node

// mkdistmaps

// For each new release, update in package.json and create a new tag in GitHub - used in version string

// ls -m | sed ':a;N;$!ba;s/\n//g' | sed 's/ //g' >../files.txt
// Remove .geojson and move All_species,All_records, to the start

import fs from 'fs'
import { glob } from 'glob'
import path from 'path'
import csv from 'fast-csv'
import PImage from 'pureimage'
import { execSync } from 'child_process'
import moment from 'moment'
import rgbHex from 'rgb-hex'
import * as geotools2em from './geotools2em.js' // http://www.nearby.org.uk/tests/GeoTools2.html
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

let config = false
let SCALE = false
let usesGB = false
let usesIE = false

const dtStart = new Date()

const makeAllMapName = 'All records'
const makeAllSpeciesMapName = 'All species'

const GBletters1 = [
  { l: 'S', e: 0, n: 0 },
  { l: 'N', e: 0, n: 500 },
  { l: 'H', e: 0, n: 1000 },
  { l: 'T', e: 500, n: 0 }
]
const GBletters2 = [
  { l: 'A', e: 0, n: 400 },
  { l: 'B', e: 100, n: 400 },
  { l: 'C', e: 200, n: 400 },
  { l: 'D', e: 300, n: 400 },
  { l: 'E', e: 400, n: 400 },
  { l: 'F', e: 0, n: 300 },
  { l: 'G', e: 100, n: 300 },
  { l: 'H', e: 200, n: 300 },
  { l: 'J', e: 300, n: 300 },
  { l: 'K', e: 400, n: 300 },
  { l: 'L', e: 0, n: 200 },
  { l: 'M', e: 100, n: 200 },
  { l: 'N', e: 200, n: 200 },
  { l: 'O', e: 300, n: 200 },
  { l: 'P', e: 400, n: 200 },
  { l: 'Q', e: 0, n: 100 },
  { l: 'R', e: 100, n: 100 },
  { l: 'S', e: 200, n: 100 },
  { l: 'T', e: 300, n: 100 },
  { l: 'U', e: 400, n: 100 },
  { l: 'V', e: 0, n: 0 },
  { l: 'W', e: 100, n: 0 },
  { l: 'X', e: 200, n: 0 },
  { l: 'Y', e: 300, n: 0 },
  { l: 'Z', e: 400, n: 0 }
]
const IEletters = [
  { l: 'A', e: 0, n: 400 },
  { l: 'B', e: 100, n: 400 },
  { l: 'C', e: 200, n: 400 },
  { l: 'D', e: 300, n: 400 },
  { l: 'E', e: 400, n: 400 },
  { l: 'F', e: 0, n: 300 },
  { l: 'G', e: 100, n: 300 },
  { l: 'H', e: 200, n: 300 },
  { l: 'J', e: 300, n: 300 },
  { l: 'K', e: 400, n: 300 },
  { l: 'L', e: 0, n: 200 },
  { l: 'M', e: 100, n: 200 },
  { l: 'N', e: 200, n: 200 },
  { l: 'O', e: 300, n: 200 },
  { l: 'P', e: 400, n: 200 },
  { l: 'Q', e: 0, n: 100 },
  { l: 'R', e: 100, n: 100 },
  { l: 'S', e: 200, n: 100 },
  { l: 'T', e: 300, n: 100 },
  { l: 'U', e: 400, n: 100 },
  { l: 'V', e: 0, n: 0 },
  { l: 'W', e: 100, n: 0 },
  { l: 'X', e: 200, n: 0 },
  { l: 'Y', e: 300, n: 0 },
  { l: 'Z', e: 400, n: 0 }
]
const tetradletters = [
  { l: 'A', e: 0, n: 0 },
  { l: 'B', e: 0, n: 200 },
  { l: 'C', e: 0, n: 400 },
  { l: 'D', e: 0, n: 600 },
  { l: 'E', e: 0, n: 800 },
  { l: 'F', e: 200, n: 0 },
  { l: 'G', e: 200, n: 200 },
  { l: 'H', e: 200, n: 400 },
  { l: 'I', e: 200, n: 600 },
  { l: 'J', e: 200, n: 800 },
  { l: 'K', e: 400, n: 0 },
  { l: 'L', e: 400, n: 200 },
  { l: 'M', e: 400, n: 400 },
  { l: 'N', e: 400, n: 600 },
  { l: 'P', e: 400, n: 800 },
  { l: 'Q', e: 600, n: 0 },
  { l: 'R', e: 600, n: 200 },
  { l: 'S', e: 600, n: 400 },
  { l: 'T', e: 600, n: 600 },
  { l: 'U', e: 600, n: 800 },
  { l: 'V', e: 800, n: 0 },
  { l: 'W', e: 800, n: 200 },
  { l: 'X', e: 800, n: 400 },
  { l: 'Y', e: 800, n: 600 },
  { l: 'Z', e: 800, n: 800 }
]
const BOXSIZES = {
  MONAD: 1,
  TETRAD: 2,
  HECTAD: 10,
  ALL: 0
}

const monadSize = 1000
const tetradSize = 2000
const quadrantSize = 5000
const hectadSize = 10000

const hectadSCALE = {
  smallBoxSize: hectadSize,
  gridreffigs: 2
}
const tetradSCALE = {
  smallBoxSize: tetradSize,
  gridreffigs: 4
}
const monadSCALE = {
  smallBoxSize: monadSize,
  gridreffigs: 4
}

const translateFrom = []
const translateTo = []

const taxonLookup = []
let taxonLookupName = false
let taxonLookupExtra = false
let taxonLookupCurrent = false

const propertiesLookup = []
let propertiesLookupName = false
const speciesNotMatchedToProperties = []

// Get version from last git commit
const gitdescr = execSync('git describe --tags --long')
let version = 'mkdistmaps ' + gitdescr.toString('utf8', 0, gitdescr.length - 1) + ' - run at ' + moment().format('Do MMMM YYYY, h:mm:ss a')

/// ////////////////////////////////////////////////////////////////////////////////////
// run: called when run from command line

export async function run (argv) {
  let rv = 1
  try {
    // Display usage
    if (argv.length <= 2) {
      console.error('usage: node mkdistmaps.js <config.json>')
      return 0
    }
    console.log(version)

    // Load config file and remove UTF-8 BOF and any comments starting with //
    let configtext = fs.readFileSync(path.resolve(__dirname, argv[2]), { encoding: 'utf8' })
    if (configtext.charCodeAt(0) === 65279) { // Remove UTF-8 start character
      configtext = configtext.slice(1)
    }
    while (true) {
      const dslashpos = configtext.indexOf('//')
      if (dslashpos === -1) break
      const endlinepos = configtext.indexOf('\n', dslashpos)
      if (endlinepos === -1) {
        configtext = configtext.substring(0, dslashpos)
        break
      }
      configtext = configtext.substring(0, dslashpos) + configtext.substring(endlinepos)
    }
    // console.log(configtext)
    try {
      config = JSON.parse(configtext)
    } catch (e) {
      console.error('config file not in JSON format')
      return 0
    }
    console.log(config)

    if (typeof config === 'object' && 'versionoverride' in config) {
      version = config.versionoverride
    }

    // Make output folder if need be
    fs.mkdirSync(path.join(__dirname, config.outputFolder), { recursive: true })

    // Set scale factor for hectad or monad
    if (typeof config === 'object' && 'boxSize' in config) {
      const boxsize = config.boxSize.toLowerCase()
      if (boxsize === 'all') config.boxSize = BOXSIZES.ALL
      else if (boxsize === 'monad') config.boxSize = BOXSIZES.MONAD
      else if (boxsize === 'tetrad') config.boxSize = BOXSIZES.TETRAD
      else if (boxsize === 'hectad') config.boxSize = BOXSIZES.HECTAD
      else {
        console.error('unrecognised config.boxSize', config.boxSize)
        return 0
      }
    } else if (typeof config === 'object' && 'useMonadsNotHectads' in config) {
      config.boxSize = config.useMonadsNotHectads ? BOXSIZES.MONAD : BOXSIZES.HECTAD
    } else {
      console.log('Using default: map to hectad')
      config.boxSize = BOXSIZES.HECTAD
    }
    switch (config.boxSize) {
      case BOXSIZES.ALL:
      case BOXSIZES.MONAD: SCALE = monadSCALE; break
      case BOXSIZES.TETRAD: SCALE = tetradSCALE; break
      case BOXSIZES.HECTAD: SCALE = hectadSCALE; break
    }
    // SCALE = (config.boxSize === BOXSIZES.HECTAD) ? hectadSCALE : ((config.boxSize === BOXSIZES.TETRAD) ? tetradSCALE : monadSCALE)

    // Default makeGenusMaps to false
    if (!(typeof config === 'object' && 'makeGenusMaps' in config)) {
      config.makeGenusMaps = false
    }
    // Default outputtype to 'map'
    if (!(typeof config === 'object' && 'outputtype' in config)) {
      config.outputtype = 'map'
    }
    // Default maptype to 'date'
    if (!(typeof config === 'object' && 'maptype' in config)) {
      config.maptype = 'date'
    }
    // Default makeAllMap to false
    if (!(typeof config === 'object' && 'makeAllMap' in config)) {
      config.makeAllMap = false
    }
    // Default geojsonprecision to false
    if (!(typeof config === 'object' && 'geojsonprecision' in config)) {
      config.geojsonprecision = false
    }
    // Default taxon to false
    if (!(typeof config === 'object' && 'taxon' in config)) {
      config.taxon = false
    }
    // Default onlysaveifinproperties to false
    if (!(typeof config === 'object' && 'onlysaveifinproperties' in config)) {
      config.onlysaveifinproperties = false
    }
    // Default saveallproperties to false
    if (!(typeof config === 'object' && 'saveallproperties' in config)) {
      config.saveallproperties = false
    }

    // Default saveSpacesAs to false
    if (!(typeof config === 'object' && 'saveSpacesAs' in config)) {
      config.saveSpacesAs = false
    }

    // If maptype is count and makeAllMap then make "All species" map
    config.makeAllSpeciesMap = config.maptype === 'count' && config.makeAllMap

    // Set default datecolours if need be
    if (!(typeof config === 'object' && 'datecolours' in config)) {
      console.log('Using default datecolours')
      config.datecolours = [
        { minyear: 0, maxyear: 1959, colour: 'rgba(255,255,0, 1)', legend: 'pre-1960' }, // Yellow
        { minyear: 1960, maxyear: 1999, colour: 'rgba(0,0,255, 1)', legend: '1960-1999' }, // Blue
        { minyear: 2000, maxyear: 2019, colour: 'rgba(255,0,0, 1)', legend: '2000-2019' }, // Red
        { minyear: 2020, maxyear: 2039, colour: 'rgba(0,255,0, 1)', legend: '2020-2039' } // Green
      ]
    }
    // Set default countcolours if need be
    if (!(typeof config === 'object' && 'countcolours' in config)) {
      console.log('Using default countcolours')
      config.countcolours = [
        { min: 1, max: '1%', colour: 'rgba(0,255,0, 1)', legend: '' }, // Green
        { min: '1%', max: '10%', colour: 'rgba(0,0,255, 1)', legend: '' }, // Blue
        { min: '10%', max: '50%', colour: 'rgba(0,0,0, 1)', legend: '' }, // Black
        { min: '50%', max: '100%', colour: 'rgba(255,0,0, 1)', legend: '' } // Red
      ]
    }

    if (!config.recordset) {
      console.error('No recordset config given')
      return 0
    }

    // Set default DateFormats if need be
    if (!config.recordset.DateFormats) {
      console.log('Using default DateFormats')
      config.recordset.DateFormats = ['DD/MM/YYYY', 'YYYY']
    }

    // Set default CSV encoding if need be
    if (!config.recordset.encoding) {
      config.recordset.encoding = 'utf8'
    }

    // delimiter must be a single character
    if (!config.recordset.delimiter) {
      config.recordset.delimiter = ','
    }

    if (!config.font_colour) {
      console.log('Using default font_colour')
      config.font_colour = '#000000'
    }

    if (!config.basemap) {
      console.error('No basemap config given')
      return 0
    }
    if (!config.basemap.file) {
      console.error('No basemap file given')
      return 0
    }
    config.basemap.filelc = config.basemap.file.toLowerCase()
    config.basemap.isPNG = config.basemap.filelc.indexOf('.png') !== -1
    config.basemap.isJPG = (config.basemap.filelc.indexOf('.jpg') !== -1) || (config.basemap.filelc.indexOf('.jpeg') !== -1)
    if (!config.basemap.isPNG && !config.basemap.isJPG) {
      console.error('Basemap file must be PNG or JPG -', config.basemap.file)
      return 0
    }
    if (!fs.existsSync(config.basemap.file)) {
      console.error('Basemap file does not exist -', config.basemap.file)
      return 0
    }

    if (!config.basemap.title_x) config.basemap.title_x = 10
    if (!config.basemap.title_y) config.basemap.title_y = 30
    if (!config.basemap.title_y_inc) config.basemap.title_y_inc = 25
    if (!config.basemap.title_fontsize) config.basemap.title_fontsize = '24pt'
    if (!config.basemap.legend_x) config.basemap.legend_x = 10
    if (!config.basemap.legend_x) config.basemap.legend_x = 10
    // config.basemap.legend_y later defaulted to half map height
    if (!config.basemap.legend_inc) config.basemap.legend_inc = 15
    if (!config.basemap.legend_fontsize) config.basemap.legend_fontsize = '12pt'
    if (!config.basemap.hectad_fontsize) config.basemap.hectad_fontsize = '12pt'

    /// //////////////
    if (config.recordset.translate) {
      const opts = config.recordset.translate.split(',')
      if (opts.length !== 3) {
        console.error('recordset.translate must have 3 fields')
        return 0
      }
      const translatecsv = opts[0]
      const oldnamecol = opts[1]
      const newnamecol = opts[2]
      if (!fs.existsSync(translatecsv)) {
        console.error('recordset.translate CSV does not exist -', translatecsv)
        return 0
      }
      console.log('Reading: ', translatecsv)
      const readTranslate = new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, translatecsv), { encoding: config.recordset.encoding })
          .pipe(csv.parse({ headers: true }))
          .on('data', row => {
            const from = row[oldnamecol]
            const to = row[newnamecol]
            if (from.length > 0 && to.length > 0 && (from !== to)) {
              translateFrom.push(from)
              translateTo.push(to)
            }
          })
          .on('end', function (rowCount) {
            resolve()
          })
      })
      await readTranslate
    }

    /// //////////////
    // Read optional taxon lookups
    if (config.taxon && ('csv' in config.taxon) && ('lookup' in config.taxon) && ('extra' in config.taxon)) {
      taxonLookupName = config.taxon.lookup
      taxonLookupExtra = config.taxon.extra
      taxonLookupCurrent = config.taxon.current
      const readTaxons = new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, config.taxon.csv), { encoding: 'utf8' })
          .pipe(csv.parse({ headers: true }))
          .on('data', row => {
            taxonLookup.push(row)
          })
          .on('end', function (rowCount) {
            resolve()
          })
      })
      await readTaxons
      for (const taxon of taxonLookup) {
        let extra = taxon[taxonLookupExtra].trim()
        if (extra === '0') extra = ''
        taxon[taxonLookupExtra] = extra
        if (extra === 'LC') extra = ''
        const lcpos = extra.indexOf('LC ')
        if (lcpos !== -1) extra = extra.substring(0, lcpos) + extra.substring(lcpos + 3)
        taxon[taxonLookupExtra + 'nolc'] = extra // without LC
        if (taxon[taxonLookupName] === taxon[taxonLookupCurrent]) taxon[taxonLookupCurrent] = ''
      }
      console.log('Read taxon lookup: ', taxonLookup.length)
      if (!taxonLookupName || !taxonLookupExtra || !taxonLookupCurrent) {
        console.log('Incomplete taxon setup')
        taxonLookup.length = 0 // Clear array
      }
    }

    /// //////////////
    // Read optional properties lookups
    const englishlookups = []
    let anyerrors = false
    if (config.properties && ('csv' in config.properties) && ('lookup' in config.properties)) {
      const englishlookup = 'englishlookup' in config.properties ? config.properties.englishlookup : false
      propertiesLookupName = config.properties.lookup
      const readProperties = new Promise((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, config.properties.csv), { encoding: 'utf8' })
          .pipe(csv.parse({ headers: true }))
          .on('data', row => {
            if (propertiesLookupName in row) {
              const taxon = row[propertiesLookupName].trim()
              row[propertiesLookupName] = taxon
              if (taxon) {
                row.found = false
                if (propertiesLookup.findIndex((r) => r[propertiesLookupName] === taxon) !== -1) {
                  console.error('Duplicate properties taxon', taxon)
                  anyerrors = true
                  return
                }
                propertiesLookup.push(row)
                if (englishlookup) {
                  if (englishlookup in row) {
                    const english = row[englishlookup]
                    if (english && english.trim().length > 0) {
                      englishlookups.push({ english: english.trim(), taxon, found: false })
                    }
                  }
                }
              }
            }
          })
          .on('end', function (rowCount) {
            resolve()
          })
      })
      await readProperties
      if (anyerrors) {
        console.log('Please fix these issues and try again')
        return 0
      }
    }

    /// //////////////
    // Do everything! One CSV file at a time.
    const headers = config.recordset.headers ? config.recordset.headers : true
    const renameHeaders = config.recordset.renameHeaders ? config.recordset.renameHeaders : false
    let totalrecords = 0
    const processFiles = new Promise((resolve, reject) => {
      async function doAll () {
        const files = glob.sync(config.recordset.csv)
        if (files.length === 0) {
          console.error('NO FILE(S) FOUND FOR: ', config.recordset.csv)
          rv = 0
        } else {
          const doFiles = new Promise((_resolve, _reject) => {
            async function asyncDoFiles () {
              // console.log('asyncDoFiles',files.length)
              for (const file of Object.values(files)) {
                console.log(file)
                const processFile = new Promise((__resolve, __reject) => { // eslint-disable-line promise/param-names
                  const fileSpecieses = []
                  fs.createReadStream(path.resolve(__dirname, file), { encoding: config.recordset.encoding })
                    .pipe(csv.parse({ headers, renameHeaders, delimiter: config.recordset.delimiter }))
                    .on('error', error => console.error(error))
                    .on('data', row => { processLine(file, row, fileSpecieses) })
                    .on('end', function (rowCount) {
                      if (Object.keys(fileSpecieses).length === 0) {
                        errors.push(file + ' no species found')
                      }
                      console.log(file, 'species:', Object.keys(fileSpecieses).length)
                      totalrecords += rowCount
                      __resolve() // processFile
                    })
                })
                await processFile
                console.log('DONE', file)
              }
              _resolve() // doFiles
            }
            asyncDoFiles()
          })
          await doFiles
          console.log('COMPLETED READING DATA')
          await importComplete(totalrecords)
        }
        resolve() // processFiles
      }
      doAll()
    })
    await processFiles

    if (englishlookups.length > 0) {
      englishlookups.sort((a, b) => a.english.localeCompare(b.english))
      for (const [MapName] of Object.entries(speciesesGrids)) {
        const el = englishlookups.find(el => el.taxon === MapName)
        if (el) el.found = true
      }
      let allenglishlookups = ''
      for (const el of englishlookups) {
        if (el.found) allenglishlookups += el.english + ':' + el.taxon + ';'
      }
      console.log('allenglishlookups', allenglishlookups)
      const saveFilename = 'english.txt'
      const outpath = path.join(__dirname, config.outputFolder, saveFilename)
      const writeEnglishLookups = new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outpath)
        stream.on('close', function (fd) {
          resolve()
        })
        stream.on('open', function (fd) {
          stream.write(allenglishlookups)
          stream.end()
          console.log('Written english to ', outpath)
        })
      })
      await writeEnglishLookups
    }

    if (rv) console.log('SUCCESS')
    return 1
  } catch (e) {
    console.error('run EXCEPTION', e)
    return 2
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////

const charcode0 = '0'.charCodeAt(0)
const charcode9 = '9'.charCodeAt(0)

// notNumeric: return true if any characters in string in given range are not numeric

function notNumeric (box, from, to) {
  const str = box.substring(from, to)
  for (let i = 0; i < str.length; i++) {
    const ich = str.charCodeAt(i)
    if (ich < charcode0 || ich > charcode9) {
      errors.push('Spatial Reference duff characters: ' + box)
      return true
    }
  }
  return false
}

// getGRtype: return various attributes of the given 'box' grid reference
// A10, A10V, A1234, A12NE, NY10, NY10X, NY1234, NY57NE
function getGRtype (box) {
  const rv = { isHectad: false, isQuadrant: false, isTetrad: false, isMonad: false, isIE: false, boxfull: box }
  const len = box.length
  const char2 = box.charCodeAt(1)
  const char2isdigit = char2 >= charcode0 && char2 <= charcode9
  const lastchar = box.charCodeAt(len - 1)
  const lastcharisdigit = lastchar >= charcode0 && lastchar <= charcode9
  if (!lastcharisdigit) {
    if ((len === 5 && char2isdigit) || len === 6) {
      const lasttwo = box.substring(len - 2)
      if (lasttwo === 'NE' || lasttwo === 'NW' || lasttwo === 'SE' || lasttwo === 'SW') {
        rv.isQuadrant = true
        let bf = box.substring(0, len - 3)
        bf += ((lasttwo === 'NE' || lasttwo === 'SE')) ? '5' : '0'
        bf += box.substring(3, 4)
        bf += ((lasttwo === 'NE' || lasttwo === 'NW')) ? '5' : '0'
        rv.boxfull = bf
        // console.log('getGRtype', box, bf)
        return rv
      } else throw new Error('Bad quadrant letters ' + lasttwo)
    }
    const tetradchar = box.substring(len - 1)
    const boxbl = tetradletters.find(boxbl2 => { return boxbl2.l === tetradchar })
    if (!boxbl) throw new Error('Tetrad letter not found ' + tetradchar)
    rv.boxfull = box.substring(0, len - 2) + (boxbl.e / 100) + box.substring(len - 2, len - 1) + (boxbl.n / 100)
  }

  switch (box.length) {
    case 3:
      rv.isIE = true
      rv.isHectad = true
      break
    case 4:
      if (lastcharisdigit) {
        rv.isHectad = true
      } else {
        rv.isIE = true
        rv.isTetrad = true
      }
      break
    case 5:
      if (!lastcharisdigit) {
        rv.isTetrad = true
      } else {
        rv.isMonad = true
        rv.isIE = true
      }
      break
    case 6:
      rv.isMonad = true
      break
    default:
      throw new Error('getGRtype duff box', box)
  }
  return rv
}

// updateSpeciesesGrids: Update the data for a species or genus

// 'Spatial Reference': 'NY30',     Eastings: '330001', Northings: '500000',
// 'Spatial Reference': 'NY3703',   Eastings: '337001', Northings: '503000',
// 'Spatial Reference': 'NY387034', Eastings: '338701', Northings: '503400',
//                       NY48311327            348311               513270
//                       NY50951510                                           Some 12 figure GRs appear as 10 figures
//                       NY7432046814

//                       J3438674590           334386               374590
//                                       17646.6931-370000       0-467252

const speciesesGrids = {} // gets a prop for each map generated with value object having per-map boxes etc
let speciesCount = 0
let genusCount = 0
let allCount = 0
const errors = []
let lineno = 0
let records = 0
let empties = 0
const boxes = {} // gets a prop for each square, eg A10, NY51, and SD23L or NC1234
let excluded = 0
let included = 0

function updateSpeciesesGrids(TaxonName, box, Year, DateOrRange, isGenus, fileSpecieses, inTotal, makeAllSpeciesMapTaxon, MoreInfo) {
  // console.log('updateSpeciesesGrids', TaxonName, box, MoreInfo)
  if (isGenus) TaxonName += ' -all'
  let speciesGrids = speciesesGrids[TaxonName]
  if (!speciesGrids) {
    speciesGrids = { max: 0, speciesmax: 0, boxes: {} }
    speciesGrids.boxes[box] = { count: 0, minyear: 3000, maxyear: 0, species: [], range: null }
    speciesesGrids[TaxonName] = speciesGrids
    if (inTotal) {
      if (isGenus) genusCount++
      else speciesCount++
    } else {
      allCount++
    }
  }
  if (!speciesGrids.boxes[box]) {
    speciesGrids.boxes[box] = { count: 0, minyear: 3000, maxyear: 0, species: [], moreinfo: false }
  }
  if (MoreInfo) {
    if (!speciesGrids.boxes[box].moreinfo) speciesGrids.boxes[box].moreinfo = [MoreInfo]
    else {
      const found = speciesGrids.boxes[box].moreinfo.find(mi => mi == MoreInfo) // eslint-disable-line eqeqeq
      if (!found) {
        speciesGrids.boxes[box].moreinfo.push(MoreInfo)
      }
    }
  }
  speciesGrids.boxes[box].count++
  if (speciesGrids.boxes[box].count > speciesGrids.max) {
    speciesGrids.max = speciesGrids.boxes[box].count
  }

  if (Year > speciesGrids.boxes[box].maxyear) {
    speciesGrids.boxes[box].maxyear = Year
  }
  if (Year < speciesGrids.boxes[box].minyear) {
    speciesGrids.boxes[box].minyear = Year
  }
  if (DateOrRange && (DateOrRange.substring(4, 7) === ' - ')) {
    speciesGrids.boxes[box].range = DateOrRange
  }

  // Now remember per-file counts
  if (!fileSpecieses[TaxonName]) {
    fileSpecieses[TaxonName] = 0
  }
  fileSpecieses[TaxonName]++

  // Remember what species found in "All species" map boxes
  if (makeAllSpeciesMapTaxon) {
    if (!speciesGrids.boxes[box].species.includes(makeAllSpeciesMapTaxon)) {
      speciesGrids.boxes[box].species.push(makeAllSpeciesMapTaxon)
      const totalspecies = speciesGrids.boxes[box].species.length
      speciesGrids.boxes[box].count = totalspecies
      if (totalspecies > speciesGrids.speciesmax) {
        speciesGrids.speciesmax = totalspecies
      }
    }
  }
}

// processLine: Process a line of CSV data ie a single record
function processLine (file, row, fileSpecieses) {
  // console.log(row)
  lineno++

  // Get GR (no spaces) and species name
  if (!(config.recordset.GRCol in row)) {
    errors.push('Grid reference not found in: ' + JSON.stringify(row))
    return
  }
  const SpatialReference = row[config.recordset.GRCol].toUpperCase().replace(/ /g, '')
  let TaxonName = row[config.recordset.TaxonCol].trim()
  if (SpatialReference.length === 0 || TaxonName.length === 0 || TaxonName.substring(0, 1) === '#') {
    empties++
    // console.log("Empty", records, JSON.stringify(row))
    return
  }

  if (translateFrom.length > 0) {
    const fromix = translateFrom.indexOf(TaxonName)
    if (fromix !== -1) {
      TaxonName = translateTo[fromix]
    }
  }

  function taxonmatchbasicwildcard (v) {
    // console.log(TaxonName, v)
    // console.log(TaxonName.substring(0, v.length - 1), v.substring(0, v.length - 1))
    // console.log(TaxonName.substring(v.length - 1), v.substring(v.length - 1))
    // exit
    if (v.endsWith('*')) { if (TaxonName.substring(0, v.length - 1) === v.substring(0, v.length - 1)) return true }
    if (v.startsWith('*')) { if (TaxonName.substring(v.length - 1) === v.substring(v.length - 1)) return true }
  }
  if (config.excludes) {
    if (config.excludes.find(taxonmatchbasicwildcard)) {
      excluded++
      return
    }
    included++
  }
  if (config.includes) {
    if (!config.includes.find(taxonmatchbasicwildcard)) {
      excluded++
      return
    }
    included++
  }

  records++

  // Get other data fields
  const EastingsExplicit = parseInt(row.Eastings)
  const NorthingsExplicit = parseInt(row.Northings)
  const ExplicitGiven = EastingsExplicit !== 0 || NorthingsExplicit !== 0
  let ObsKey = row[config.recordset.ObsKeyCol]
  const ObsDate = row[config.recordset.DateCol]
  let Year = parseInt(row[config.recordset.YearCol])
  let MoreInfo = false
  if ('MoreInfo' in config.recordset) MoreInfo = row[config.recordset.MoreInfo]
  if (MoreInfo && config.recordset.FixForBLS) {
    if (MoreInfo == 'BLS Mapping Scheme: Britain 2009') MoreInfo = false // eslint-disable-line eqeqeq
    else if (MoreInfo.startsWith('VC')) {
      let ch6 = MoreInfo.charAt(5)
      if (ch6 === 'a' || ch6 === 'c') MoreInfo = MoreInfo.substring(0, 5) + MoreInfo.substring(6) // Remove c from "VC 01c" - and same for a
      ch6 = MoreInfo.charAt(5)
      if (ch6 === 'a' || ch6 === 'c') MoreInfo = MoreInfo.substring(0, 5) + MoreInfo.substring(6) // Remove c from "VC 01c" - and same for a
    }
  }
  // console.log('----------')
  // console.log('SpatialReference', SpatialReference)
  // console.log('EastingsExplicit', EastingsExplicit)
  // console.log('NorthingsExplicit', NorthingsExplicit)
  // console.log('TaxonName', TaxonName, TaxonName.length)
  // console.log('MoreInfo', MoreInfo, MoreInfo.length)
  // console.log('ObsDate', ObsDate)

  if (!ObsKey) ObsKey = 'Line#' + lineno

  // Decode Date or Year
  let YearFound = Year
  if (!YearFound || !config.recordset.YearCol) {
    const ObsDate2 = moment(ObsDate, config.recordset.DateFormats)
    if (ObsDate2.isValid()) {
      YearFound = true
      Year = ObsDate2.year()
    }
  }
  if (!YearFound) {
    errors.push(ObsKey + ' Date invalid:' + ObsDate + ' Year:' + Year)
    return
  }
  let DateOrRange = null
  if (config.recordset.DateOrRangeCol) {
    DateOrRange = row[config.recordset.DateOrRangeCol] // May still be null
  }

  // From grid reference, work out Eastings and Northings and box name eg NY51 or NY5714
  let Eastings = 0
  let Northings = 0
  let isGB = false
  let isIE = false

  let box = SpatialReference
  const grfig = SCALE.gridreffigs / 2
  if (box.length === 12) { // ALL-OK
    if (notNumeric(box, 2)) return
    Eastings += parseInt(box.substring(2, 7))
    Northings += parseInt(box.substring(7))
    box = box.substring(0, 2 + grfig) + box.substring(7, 7 + grfig)
    isGB = true
  } else if (box.length === 10) { // ALL-OK
    if (notNumeric(box, 2)) return
    Eastings += parseInt(box.substring(2, 6)) * 10
    Northings += parseInt(box.substring(6)) * 10
    box = box.substring(0, 2 + grfig) + box.substring(6, 6 + grfig)
    isGB = true
  } else if (box.length === 8) { // ALL-OK
    if (notNumeric(box, 2)) return
    Eastings += parseInt(box.substring(2, 5)) * 100
    Northings += parseInt(box.substring(5)) * 100
    box = box.substring(0, 2 + grfig) + box.substring(5, 5 + grfig)
    isGB = true
  } else if (box.length === 6) { // ALL-OK
    const lasttwochars = box.substring(4, 6)
    const quadrantnw = lasttwochars === 'NW'
    const quadrantsw = lasttwochars === 'SW'
    const quadrantse = lasttwochars === 'SE'
    const quadrantne = lasttwochars === 'NE'
    if (quadrantnw || quadrantsw || quadrantse || quadrantne) {
      // console.log('lasttwochars', box, lasttwochars, quadrantnw, quadrantsw, quadrantse, quadrantne)
      if (notNumeric(box, 2, 4)) return
      Eastings += parseInt(box.substring(2, 3)) * 10000
      Northings += parseInt(box.substring(3)) * 10000
      if (quadrantne || quadrantse) Eastings += 5000
      if (quadrantne || quadrantnw) Northings += 5000
      // box = box.substring(0, 4) JUST LEAVE AS NY56SW
    } else {
      if (notNumeric(box, 2)) return
      Eastings += parseInt(box.substring(2, 4)) * 1000
      Northings += parseInt(box.substring(4)) * 1000
      box = box.substring(0, 2 + grfig) + box.substring(4, 4 + grfig)
    }
    isGB = true
  } else if (box.length === 4) { // ALL-OK-GB
    const tetradchar = box.substring(3).toUpperCase()
    if (tetradchar.match(/[A-Z]/)) {
      if (tetradchar === 'O') { errors.push(ObsKey + ' duff tetrad letter: ' + tetradchar + ': ' + SpatialReference); return }
      if (notNumeric(box, 1, 3)) return
      Eastings += parseInt(box.substring(1, 2)) * 10000
      Northings += parseInt(box.substring(2)) * 10000
      const boxbl = tetradletters.find(boxbl2 => { return boxbl2.l === tetradchar })
      if (!boxbl) { errors.push(ObsKey + ' duff tetrad letter: ' + tetradchar + ': ' + SpatialReference); return }
      Eastings += boxbl.e * 10
      Northings += boxbl.n * 10
      isIE = true
      if (config.boxSize !== BOXSIZES.TETRAD) { // If not showing tetrads then convert to show at hectad level
        box = box.substring(0, 3)
        Eastings = Math.floor(Eastings / 10000) * 10000
        Northings = Math.floor(Northings / 10000) * 10000
      }
    } else {
      if (notNumeric(box, 2)) return
      Eastings += parseInt(box.substring(2, 3)) * 10000
      Northings += parseInt(box.substring(3)) * 10000
      isGB = true
    }
  } else if (box.length === 11) { // IRISH
    if (notNumeric(box, 1)) return
    Eastings += parseInt(box.substring(1, 6))
    Northings += parseInt(box.substring(6))
    box = box.substring(0, 1 + grfig) + box.substring(6, 6 + grfig)
    isIE = true
  } else if (box.length === 9) { // IRISH
    if (notNumeric(box, 1)) return
    Eastings += parseInt(box.substring(1, 5)) * 10
    Northings += parseInt(box.substring(5)) * 10
    box = box.substring(0, 1 + grfig) + box.substring(5, 5 + grfig)
    isIE = true
  } else if (box.length === 7) { // IRISH
    if (notNumeric(box, 1)) return
    Eastings += parseInt(box.substring(1, 4)) * 100
    Northings += parseInt(box.substring(4)) * 100
    box = box.substring(0, 1 + grfig) + box.substring(4, 4 + grfig)
    isIE = true
  } else if (box.length === 5) { // CHECK
    const tetradchar = box.substring(4).toUpperCase()
    if (tetradchar.match(/[A-Z]/)) {
      if (tetradchar === 'O') { errors.push(ObsKey + ' duff tetrad letter: ' + tetradchar + ': ' + SpatialReference); return }
      if (notNumeric(box, 2, 4)) return
      Eastings += parseInt(box.substring(2, 3)) * 10000
      Northings += parseInt(box.substring(3)) * 10000
      const boxbl = tetradletters.find(boxbl2 => { return boxbl2.l === tetradchar })
      if (!boxbl) { errors.push(ObsKey + ' duff tetrad letter: ' + tetradchar + ': ' + SpatialReference); return }
      Eastings += boxbl.e * 10
      Northings += boxbl.n * 10
      isGB = true
      if ((config.boxSize !== BOXSIZES.ALL) &&
          (config.boxSize !== BOXSIZES.TETRAD)) { // If not showing tetrads then convert to show at hectad level
        box = box.substring(0, 4)
        Eastings = Math.floor(Eastings / 10000) * 10000
        Northings = Math.floor(Northings / 10000) * 10000
      }
    } else {
      if (notNumeric(box, 1)) return
      Eastings += parseInt(box.substring(1, 3)) * 1000
      Northings += parseInt(box.substring(3)) * 1000
      box = box.substring(0, 1 + grfig) + box.substring(3, 3 + grfig)
      isIE = true
    }
  } else if (box.length === 3) { // IRISH
    if (notNumeric(box, 1)) return
    Eastings += parseInt(box.substring(1, 2)) * 10000
    Northings += parseInt(box.substring(2)) * 10000
    isIE = true
  } else {
    errors.push(ObsKey + ' Spatial Reference duff length: ' + box.length + ': ' + SpatialReference)
    return
  }
  if ((usesGB && isIE) || (usesIE && isGB)) {
    errors.push(ObsKey + ' Cannot use GB and IE grid references: ' + SpatialReference)
    return
  }
  if (isGB) usesGB = true
  if (isIE) usesIE = true

  // console.log('box', SpatialReference.padEnd(12), box.padEnd(12), Eastings.toString().padStart(5, '0'), Northings.toString().padStart(5, '0'))

  const l1 = box.substring(0, 1)
  if (isGB) {
    for (const boxbl of GBletters1) {
      if (boxbl.l === l1) {
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }

    const l2 = box.substring(1, 2)
    for (const boxbl of GBletters2) {
      if (boxbl.l === l2) {
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }
  } else {
    for (const boxbl of IEletters) {
      if (boxbl.l === l1) {
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }
  }
  if (config.boxSize === BOXSIZES.TETRAD) { // If a monad, convert to tetrad form if need be
    const isMonad = (isGB && box.length === 6) || (isIE && box.length === 5)
    // const isTetrad = (isGB && box.length === 5) || (isIE && box.length === 4)
    if (isMonad) { // ie monad NY3329 or A1234
      const ebit = (Eastings % 10000) / 1000
      const nbit = (Northings % 10000) / 1000
      let tetradletter = Math.floor(nbit / 2)
      if (ebit < 2) tetradletter += 0
      else if (ebit < 4) tetradletter += 5
      else if (ebit < 6) tetradletter += 10
      else if (ebit < 8) tetradletter += 15
      else tetradletter += 20
      tetradletter = tetradletters[tetradletter].l
      if (isGB) {
        box = box.substring(0, 3) + box.substring(4, 5) + tetradletter
      } else {
        box = box.substring(0, 2) + box.substring(3, 4) + tetradletter
      }
    }
  }
  // console.log(SpatialReference, box, Eastings, Northings, EastingsExplicit, NorthingsExplicit)

  if (ExplicitGiven) {
    if ((Math.abs(Eastings - EastingsExplicit) > 2) || (Math.abs(Northings - NorthingsExplicit) > 2)) {
      errors.push(ObsKey + ' Explicit grid ref discrepancy: ' + SpatialReference + ' ExpE:' + EastingsExplicit + ' ExpN:' + NorthingsExplicit + ' E:' + Eastings + ' N:' + Northings)
      return
    }
  }

  // Save box name and location
  if (!boxes[box]) {
    const boxloc = {
      e: Math.floor(Eastings / 1000),
      n: Math.floor(Northings / 1000)
    }
    if (config.boxSize === BOXSIZES.HECTAD) {
      boxloc.e = Math.floor(boxloc.e / 10) * 10
      boxloc.n = Math.floor(boxloc.n / 10) * 10
    }
    if (config.boxSize === BOXSIZES.TETRAD) {
      boxloc.e = Math.floor(boxloc.e / 2) * 2
      boxloc.n = Math.floor(boxloc.n / 2) * 2
    }
    boxes[box] = boxloc
  }
  // console.log('boxloc', box.padStart(21), boxes[box].e.toString().padStart(3, '0'), ' ', boxes[box].n.toString().padStart(3, '0'))

  // Add/Update record for species ie count, min and max year for each box
  updateSpeciesesGrids(TaxonName, box, Year, DateOrRange, false, fileSpecieses, true, false, MoreInfo)

  if (config.makeAllMap) {
    updateSpeciesesGrids(makeAllMapName, box, Year, DateOrRange, false, fileSpecieses, false, false, MoreInfo)
  }

  if (config.makeAllSpeciesMap) {
    updateSpeciesesGrids(makeAllSpeciesMapName, box, Year, DateOrRange, false, fileSpecieses, false, TaxonName, MoreInfo)
  }

  if (config.makeGenusMaps) {
    const words = TaxonName.split(' ')
    updateSpeciesesGrids(words[0], box, Year, DateOrRange, true, fileSpecieses, true, false, MoreInfo)
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////
// importComplete:  Having read all records, generate distribution maps for all found species

async function importComplete (rowCount) {
  if (config.outputtype === 'geojson') {
    await makeGeojson(rowCount)
  } else {
    await makeImages(rowCount)
  }

  // Report record count, errors, species and boxes
  console.log(`Parsed ${rowCount} rows`)
  console.log(`Errors ${errors.length}`)
  for (let i = 0; i < errors.length; i++) {
    console.error('#' + i, errors[i])
  }
  if ((genusCount + speciesCount + allCount) !== Object.keys(speciesesGrids).length) {
    console.error('Taxon/Species/Grids mismatch:', genusCount, speciesCount, Object.keys(speciesesGrids).length)
  }
  console.log('Species:', speciesCount.toLocaleString('en'))
  if (config.makeGenusMaps) {
    console.log('Genera:', genusCount.toLocaleString('en'))
  }

  console.log('Records:', records.toLocaleString('en'))
  console.log('Empty rows:', empties)
  console.log('Excluded rows:', excluded)
  console.log('Included rows:', included)
  console.log('Boxes:', Object.keys(boxes).length)

  const dtEnd = new Date()
  const runtimeSeconds = Math.floor((dtEnd - dtStart) / (1000))
  console.log('Runtime:', runtimeSeconds, 'seconds')
}

/// ////////////////////////////////////////////////////////////////////////////////////
function setCountColours (speciesGrids, isAllSpeciesMap) {
  let next = 1
  const max = isAllSpeciesMap ? speciesGrids.speciesmax : speciesGrids.max
  for (const countcolour of Object.values(config.countcolours)) {
    countcolour.imin = countcolour.min
    if (typeof countcolour.min === 'string') {
      countcolour.imin = Math.floor(parseFloat(countcolour.min) * max / 100)
    }
    countcolour.imax = countcolour.max
    if (typeof countcolour.max === 'string') {
      countcolour.imax = Math.floor(parseFloat(countcolour.max) * max / 100)
    }
    if (countcolour.imin <= next) countcolour.imin = next
    if (countcolour.imax <= next) countcolour.imax = next++
    countcolour.legend = countcolour.imin.toLocaleString('en') + '-' + countcolour.imax.toLocaleString('en')
    if (countcolour.imax > max) countcolour.imax = max
    if (countcolour.imin > max) countcolour.legend = ''
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////

async function makeImages (rowCount) {
  // Load base map and work out main box dimensions (assumed to be square)
  const img = config.basemap.isPNG
    ? await PImage.decodePNGFromStream(fs.createReadStream(config.basemap.file))
    : await PImage.decodeJPEGFromStream(fs.createReadStream(config.basemap.file))
  const width = img.width / config.basemap.scaledown
  const height = img.height / config.basemap.scaledown
  const mapeastings = config.basemap.east - config.basemap.west // eg 390500-293169
  const mapnorthings = config.basemap.north - config.basemap.south // eg 589703-460155
  console.log(mapeastings, mapnorthings)
  const boxswidthSmall = mapeastings / SCALE.smallBoxSize
  console.log('boxswidthSmall', boxswidthSmall)
  let boxwidthSmall = width / boxswidthSmall // boxheight should be the same if map in proportion
  console.log('boxwidthSmall', boxwidthSmall)
  const boxswidthHectad = mapeastings / hectadSize
  console.log('boxswidthHectad', boxswidthHectad)
  const boxwidthHectad = width / boxswidthHectad // boxheight should be the same if map in proportion
  console.log('boxwidthHectad', boxwidthHectad)
  const boxswidthTetrad = mapeastings / tetradSize
  console.log('boxswidthTetrad', boxswidthTetrad)
  const boxwidthTetrad = width / boxswidthTetrad // boxheight should be the same if map in proportion
  console.log('boxwidthTetrad', boxwidthTetrad)
  const boxswidthQuadrant = mapeastings / quadrantSize
  console.log('boxswidthQuadrant', boxswidthQuadrant)
  const boxwidthQuadrant = width / boxswidthQuadrant // boxheight should be the same if map in proportion
  console.log('boxwidthQuadrant', boxwidthQuadrant)

  if (!config.basemap.legend_y) config.basemap.legend_y = Math.trunc(height / 2)

  // Now set image x and y for each box
  for (const boxloc of Object.values(boxes)) {
    const n = (boxloc.n * 1000) - config.basemap.south
    const hn = n / 1000
    const hnp = hn * boxwidthHectad / 10
    boxloc.y = height - hnp
    const e = (boxloc.e * 1000) - config.basemap.west
    const he = e / 1000
    const hep = he * boxwidthHectad / 10
    boxloc.x = hep
  }
  if (boxwidthSmall < 2) boxwidthSmall = 2
  const boxwidthSmallhalf = boxwidthSmall / 2
  console.log('boxwidthSmallhalf', boxwidthSmallhalf)

  // Load the font
  const fontpath = path.join(__dirname, config.font_filename)
  const fnt = PImage.registerFont(fontpath, 'TheFont')
  fnt.loadSync()

  // Go through all species
  let done = 0
  for (const [MapName, speciesGrids] of Object.entries(speciesesGrids)) {
    // console.log(MapName, speciesGrids)
    const isAllRecordsMap = MapName === makeAllMapName
    const isAllSpeciesMap = MapName === makeAllSpeciesMapName

    // Create output canvas from base map
    const img2 = PImage.make(Math.floor(width), Math.floor(height))
    const ctx = img2.getContext('2d')
    ctx.drawImage(img,
      0, 0, img.width, img.height, // source dimensions
      0, 0, width, height // destination dimensions
    )

    // Write summary text
    ctx.fillStyle = config.font_colour
    ctx.font = config.basemap.title_fontsize + " 'TheFont'"
    if (isAllSpeciesMap) {
      ctx.fillText('Count of species in each square', config.basemap.title_x, config.basemap.title_y)
    } else if (isAllRecordsMap) {
      if (config.maptype === 'count') {
        ctx.fillText('Count of records in each square', config.basemap.title_x, config.basemap.title_y)
      } else {
        ctx.fillText(MapName, config.basemap.title_x, config.basemap.title_y)
      }
    } else {
      ctx.fillText(MapName, config.basemap.title_x, config.basemap.title_y)
    }

    ctx.fillText(config.recordset.title, config.basemap.title_x, config.basemap.title_y + config.basemap.title_y_inc)

    if (config.maptype === 'count') {
      setCountColours(speciesGrids, isAllSpeciesMap)
    }

    // Go through all boxes found for this species
    let reccount = 0
    for (const [box, boxdata] of Object.entries(speciesGrids.boxes)) {
      reccount += boxdata.count
      const boxloc = boxes[box]
      const { isHectad, isQuadrant, isTetrad, isMonad } = getGRtype(box)

      // Determine box colour
      ctx.fillStyle = 'rgba(255,20, 147, 1)' // default to pink
      if (config.maptype === 'count') {
        const thecount = isAllSpeciesMap ? boxdata.species.length : boxdata.count
        for (const countcolour of Object.values(config.countcolours)) {
          if (((countcolour.imin === countcolour.imax) && (thecount === countcolour.imin)) ||
            (thecount >= countcolour.imin && ((countcolour.imax === 0) || (thecount <= countcolour.imax)))) {
            ctx.fillStyle = countcolour.colour
          }
        }
      } else {
        for (const datecolour of Object.values(config.datecolours)) {
          if (boxdata.maxyear >= datecolour.minyear && boxdata.maxyear <= datecolour.maxyear) {
            ctx.fillStyle = datecolour.colour
          }
        }
      }
      ctx.strokeStyle = ctx.fillStyle

      // Draw solid or round box (and optional hectad outline)
      // Remember: y goes wrong way so subtract that first
      if (isHectad) {
        if (config.boxSize === BOXSIZES.HECTAD) {
          ctx.fillRect(boxloc.x, boxloc.y - boxwidthHectad, boxwidthHectad, boxwidthHectad)
        } else {
          ctx.strokeRect(boxloc.x, boxloc.y - boxwidthHectad, boxwidthHectad, boxwidthHectad)
        }
      } else if (isQuadrant) {
        ctx.strokeRect(boxloc.x, boxloc.y - boxwidthQuadrant, boxwidthQuadrant, boxwidthQuadrant)
      } else if (isTetrad) {
        ctx.strokeRect(boxloc.x, boxloc.y - boxwidthTetrad, boxwidthTetrad, boxwidthTetrad)
      } else if (isMonad) {
        if ((boxdata.count === 1) && (config.boxSize !== BOXSIZES.HECTAD)) {
          ctx.beginPath()
          ctx.arc(boxloc.x + boxwidthSmallhalf, boxloc.y - boxwidthSmallhalf, boxwidthSmallhalf, 0, 2 * Math.PI, false) // Math.PI
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(boxloc.x, boxloc.y - boxwidthSmall, boxwidthSmall, boxwidthSmall)
        }
      }

      // Draw hectad name
      if (config.basemap.showhectadname) {
        ctx.fillStyle = config.font_colour
        ctx.font = config.basemap.hectad_fontsize + " 'TheFont'"
        ctx.fillText(box, boxloc.x, boxloc.y + boxwidthSmall)
      }
    }

    // Write number of records
    ctx.fillStyle = config.font_colour
    ctx.font = config.basemap.title_fontsize + " 'TheFont'"
    if (isAllSpeciesMap) {
      ctx.fillText('Species: ' + speciesCount.toLocaleString('en'), config.basemap.title_x, config.basemap.title_y + 2 * config.basemap.title_y_inc)
    } else {
      ctx.fillText('Records: ' + reccount.toLocaleString('en'), config.basemap.title_x, config.basemap.title_y + 2 * config.basemap.title_y_inc)
    }

    // Write version and today's date-time
    ctx.fillStyle = '#404040'
    ctx.font = config.basemap.legend_fontsize + " 'TheFont'"
    ctx.fillText(version, 10, 10)

    if (!config.basemap.legend_hide) {
      ctx.font = config.basemap.legend_fontsize + " 'TheFont'"
      let legendY = config.basemap.legend_y
      ctx.fillStyle = config.font_colour
      ctx.fillText(config.maptype, config.basemap.legend_x + 2 * config.basemap.legend_inc, legendY)
      // legendY += config.basemap.legend_inc

      const legenditems = (config.maptype === 'count') ? config.countcolours : config.datecolours
      for (const legenditem of Object.values(legenditems)) {
        ctx.fillStyle = legenditem.colour
        ctx.fillRect(config.basemap.legend_x, legendY, config.basemap.legend_inc, config.basemap.legend_inc)
        ctx.strokeStyle = config.font_colour
        ctx.strokeRect(config.basemap.legend_x, legendY, config.basemap.legend_inc, config.basemap.legend_inc)
        ctx.fillStyle = config.font_colour
        legendY += config.basemap.legend_inc
        ctx.fillText(legenditem.legend, config.basemap.legend_x + 2 * config.basemap.legend_inc, legendY)
      }
    }

    // Output the final species map
    let saveFilename = MapName
    if (config.saveSpacesAs) {
      saveFilename = saveFilename.replace(/ /g, config.saveSpacesAs)
    }
    const outpath = path.join(__dirname, config.outputFolder, saveFilename + '.png')
    await PImage.encodePNGToStream(img2, fs.createWriteStream(outpath))
    console.log('done', saveFilename, reccount)
    if (config.limit && ++done >= config.limit) {
      errors.push('Map generation stopped after reaching limit of ' + config.limit)
      break
    }
  }
}

async function makeOneGeojson (isAllRecordsMap, isAllSpeciesMap, MapName, speciesGrids) {
  const geojson = {}
  geojson.type = 'FeatureCollection'
  // https://wiki.openstreetmap.org/wiki/Geojson_CSS
  // geojson.style = { stroke: 'pink' }
  geojson.style = {
    color: '#000000',
    // fillColor: '#FFFFFF',
    fillOpacity: 0.1,
    weight: 1,
    opacity: 1
  }

  geojson.properties = {
    name: MapName,
    set: config.recordset.title,
    maptype: config.maptype,
    datecolours: config.datecolours,
    generator: version
  }
  let oktoinclude = false
  if (isAllSpeciesMap) {
    geojson.properties.name = 'Count of species in each square'
    oktoinclude = true
  } else if (isAllRecordsMap) {
    oktoinclude = true
    if (config.maptype === 'count') {
      geojson.properties.name = 'Count of records in each square'
    }
  }
  if (config.properties) {
    const property = propertiesLookup.find(p => p[propertiesLookupName] === MapName)
    if (property) {
      property.found = true
      for (const field in property) {
        if (field !== propertiesLookupName) {
          geojson.properties[field] = property[field]
        }
      }
    } else if (speciesNotMatchedToProperties.indexOf(MapName) === -1) {
      speciesNotMatchedToProperties.push(MapName)
      if (config.onlysaveifinproperties && !oktoinclude) {
        return // ie abort this map
      }
    }
  }

  geojson.features = []

  let reccount = 0
  if (speciesGrids) {
    for (let squaretype = 0; squaretype < 4; squaretype++) { // Process hectads then quadrants then tetrads then monads
      for (const [box, boxdata] of Object.entries(speciesGrids.boxes)) {
        const { isHectad, isQuadrant, isTetrad, isMonad, isIE, boxfull } = getGRtype(box)
        if (isHectad && squaretype !== 0) continue
        if (isQuadrant && squaretype !== 1) continue
        if (isTetrad && squaretype !== 2) continue
        if (isMonad && squaretype !== 3) continue
        reccount += boxdata.count

        let color = rgbHex('rgba(255,20, 147, 1)') // default to pink
        if (config.maptype === 'count') {
          const thecount = isAllSpeciesMap ? boxdata.species.length : boxdata.count
          for (const countcolour of Object.values(config.countcolours)) {
            if (((countcolour.imin === countcolour.imax) && (thecount === countcolour.imin)) ||
              (thecount >= countcolour.imin && ((countcolour.imax === 0) || (thecount <= countcolour.imax)))) {
              color = rgbHex(countcolour.colour)
            }
          }
        } else {
          for (const datecolour of Object.values(config.datecolours)) {
            if (boxdata.maxyear >= datecolour.minyear && boxdata.maxyear <= datecolour.maxyear) {
              color = rgbHex(datecolour.colour)
            }
          }
        }

        let boxside = 1000 // monad
        if (isTetrad) boxside = 2000 // tetrad
        else if (isQuadrant) boxside = 5000 // quadrant
        else if (isHectad) boxside = 10000 // hectad

        let osgbie = new geotools2em.GT_OSGB()
        if (isIE) osgbie = new geotools2em.GT_Irish()
        osgbie.parseGridRef(boxfull)

        const boxbl = osgbie.getWGS84()
        osgbie.northings += boxside
        const boxtl = osgbie.getWGS84()
        osgbie.eastings += boxside
        const boxtr = osgbie.getWGS84()
        osgbie.northings -= boxside
        const boxbr = osgbie.getWGS84()

        if (config.geojsonprecision) {
          boxbl.latitude = boxbl.latitude.toPrecision(config.geojsonprecision)
          boxbl.longitude = boxbl.longitude.toPrecision(config.geojsonprecision)
          boxtl.latitude = boxtl.latitude.toPrecision(config.geojsonprecision)
          boxtl.longitude = boxtl.longitude.toPrecision(config.geojsonprecision)
          boxtr.latitude = boxtr.latitude.toPrecision(config.geojsonprecision)
          boxtr.longitude = boxtr.longitude.toPrecision(config.geojsonprecision)
          boxbr.latitude = boxbr.latitude.toPrecision(config.geojsonprecision)
          boxbr.longitude = boxbr.longitude.toPrecision(config.geojsonprecision)
        }

        const feature = {}
        feature.type = 'Feature'
        feature.geometry = {}
        feature.geometry.type = 'Polygon'
        feature.geometry.coordinates = []
        const coords = []
        coords.push([boxbl.latitude, boxbl.longitude])
        coords.push([boxtl.latitude, boxtl.longitude])
        coords.push([boxtr.latitude, boxtr.longitude])
        coords.push([boxbr.latitude, boxbr.longitude])
        feature.geometry.coordinates.push(coords)

        let square = ''
        if (isMonad) square = 'monad'
        if (isTetrad) square = 'tetrad'
        if (isQuadrant) square = 'quadrant'
        if (isHectad) square = 'hectad'
        feature.properties = {
          square,
          color: '#' + color.substring(0, 6),
          text: box + ': '
        }
        if (isAllSpeciesMap) {
          feature.properties.text += boxdata.species.length + ' species '
          boxdata.species.sort()
          // Add on taxon conservation status letters if provided
          if (taxonLookup.length > 0) {
            const speciesWithExtra = []
            for (const species of boxdata.species) {
              let withextra = species
              const found = taxonLookup.find(taxon => taxon[taxonLookupName] === species)
              if (found) {
                const extra = found[taxonLookupExtra + 'nolc']
                if (extra.length > 0) withextra += ' ' + extra
              }
              speciesWithExtra.push(withextra)
            }
            feature.properties.species = speciesWithExtra.join(' | ')
          } else {
            feature.properties.species = boxdata.species.join(' | ')
          }
        } else {
          feature.properties.text += boxdata.count + (boxdata.count > 1 ? ' records ' : ' record ')
        }
        if (boxdata.count===1 && boxdata.range) {
          feature.properties.text += boxdata.range
        } else if (boxdata.minyear !== boxdata.maxyear) {
          feature.properties.text += boxdata.minyear + '-' + boxdata.maxyear
        } else {
          feature.properties.text += boxdata.minyear
        }
        if (boxdata.moreinfo) feature.properties.text += '.<br/> ' + boxdata.moreinfo.join('<br/>')

        geojson.features.push(feature)
        // if (boxcount++>1)break
      }
    }
  }
  if (isAllSpeciesMap) {
    geojson.properties.subtitle = 'Species: ' + speciesCount.toLocaleString('en')
  } else {
    geojson.properties.subtitle = 'Records: ' + reccount.toLocaleString('en')
    if (taxonLookupName && taxonLookupExtra && taxonLookup.length > 0) {
      const found = taxonLookup.find(taxon => taxon[taxonLookupName] === MapName)
      if (found) {
        geojson.properties.current = found[taxonLookupCurrent]
        geojson.properties.extra = found[taxonLookupExtra]
      }
    }
  }
  geojson.properties.countcolours = config.countcolours

  let saveFilename = MapName
  if (config.saveSpacesAs) {
    saveFilename = saveFilename.replace(/ /g, config.saveSpacesAs)
  }
  saveFilename = saveFilename.replaceAll('\u00D7', 'x') // '×'
  saveFilename = saveFilename.replaceAll('/', '^')
  const outpath = path.join(__dirname, config.outputFolder, saveFilename + '.geojson')
  const writeGeoJson = new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outpath, { encoding: 'utf8' })
    stream.on('close', function (fd) {
      resolve()
    })
    stream.on('open', function (fd) {
      stream.write(JSON.stringify(geojson))
      stream.end()
    })
  })
  await writeGeoJson
  console.log('done', saveFilename, reccount)
}

/// ////////////////////////////////////////////////////////////////////////////////////
// https://leafletjs.com/examples/geojson/

async function makeGeojson (rowCount) {
  // Go through all species
  let done = 0
  for (const [MapName, speciesGrids] of Object.entries(speciesesGrids)) {
    console.log(MapName)
    const isAllRecordsMap = MapName === makeAllMapName
    const isAllSpeciesMap = MapName === makeAllSpeciesMapName

    if (config.maptype === 'count') {
      setCountColours(speciesGrids, isAllSpeciesMap)
    }

    await makeOneGeojson(isAllRecordsMap, isAllSpeciesMap, MapName, speciesGrids)

    if (config.limit && ++done >= config.limit) {
      errors.push('Map generation stopped after reaching limit of ' + config.limit)
      break
    }
  }
  if (config.properties) {
    let propertiesNotMatched = 0
    for (const property of propertiesLookup) {
      if (!property.found) {
        const TaxonName = property[propertiesLookupName]
        propertiesNotMatched++
        if (config.saveallproperties) {
          await makeOneGeojson(false, false, TaxonName, false)
          speciesesGrids[TaxonName] = {}
          speciesCount++
          console.log('Property not matched but made:', TaxonName)
        } else console.log('Property not matched:', TaxonName)
      }
    }
    console.log('Properties not matched:', propertiesNotMatched)
    speciesNotMatchedToProperties.sort()
    console.log('Species not matched to properties:', speciesNotMatchedToProperties.length, speciesNotMatchedToProperties.join(', '))
  }
}
/// ////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If jest testing, then don't.
if (process.env.JEST_WORKER_ID === undefined) {
  run(process.argv)
}
