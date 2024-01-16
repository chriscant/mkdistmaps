// Usage eg:
// node transform.js basedata/VC69-VC70-OSGB36.geojson basedata/VC69-VC70-WGS64.geojson 7
// node transform.js /d/QGIS/Projects/GB-vice-countiesVC60.geojson /d/QGIS/Projects/GB-vice-countiesVC60-WGS64.geojson 7

import fs from 'fs'
import path from 'path'
import * as geotools2em from './geotools2em.js' // http://www.nearby.org.uk/tests/GeoTools2.html
import _ from 'lodash'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const osgb = new geotools2em.GT_OSGB()

let precision = 8

console.log('Transform geojson from OSGB36 to WGS84')

/* const wgs = new geotools2em.GT_WGS84()
//wgs.setDegrees(54.1223, -2.91951) // 469995 340000
wgs.setDegrees(54.25556, -3.216814) // 485115 320825
const os = wgs.getOSGB()
console.log(os.northings,os.eastings)
return

// 320825.02811229, 485115.62617599 */

function customCloner (value) {
  if (Array.isArray(value) && value.length === 2 && _.isNumber(value[0])) {
    // console.log(value)
    osgb.setGridCoordinates(value[0], value[1])
    const wsg = osgb.getWGS84()
    const rv = []
    rv[0] = wsg.latitude.toPrecision(precision)
    rv[1] = wsg.longitude.toPrecision(precision)
    // console.log('-->',rv)
    return rv
  }
  if (_.isElement(value)) {
    return value.cloneNode(true)
  }
}

export async function run (argv) {
  try {
    if (argv.length < 5) {
      console.error('usage: node transform.js <in.geojson> <out.geojson> <precision>')
      return 0
    }

    precision = parseInt(argv[4])

    let inGeojsonText = fs.readFileSync(path.resolve(__dirname, argv[2]), { encoding: 'utf8' })
    if (inGeojsonText.charCodeAt(0) === 65279) { // Remove UTF-8 start character
      inGeojsonText = inGeojsonText.slice(1)
    }
    let inGeojson = false
    try {
      inGeojson = JSON.parse(inGeojsonText)
    } catch (e) {
      console.error('inGeojson file not in JSON format')
      return 0
    }

    const outGeojson = _.cloneDeepWith(inGeojson, customCloner)
    delete outGeojson.crs
    const outGeojsonText = JSON.stringify(outGeojson)

    const outpath = path.resolve(__dirname, argv[3])
    const writeGeoJson = new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outpath)
      stream.on('close', function (fd) {
        resolve()
      })
      stream.on('open', function (fd) {
        stream.write(outGeojsonText)
        stream.end()
      })
    })
    await writeGeoJson
    console.error('DONE written', outGeojsonText.length)
    return 1
  } catch (e) {
    console.error('FAILED', e.message)
    return 2
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If testing, then don't.
if (process.env.JEST_WORKER_ID === undefined) {
  run(process.argv)
}
