// Usage eg:
// node transform.js basedata/VC69-VC70-OSGB36.geojson basedata/VC69-VC70-WGS64.geojson 7

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const geotools2m = require('./geotools2m') // http://www.nearby.org.uk/tests/GeoTools2.html

const osgb = new geotools2m.GT_OSGB()

let precision = 8

console.log('Transform geojson from OSGB36 to WGS84')

/*const wgs = new geotools2m.GT_WGS84()
//wgs.setDegrees(54.1223, -2.91951) // 469995 340000
wgs.setDegrees(54.25556, -3.216814) // 485115 320825
const os = wgs.getOSGB()
console.log(os.northings,os.eastings)
return

// 320825.02811229, 485115.62617599 */

function customCloner(value) {
  if (_.isArray(value) && value.length === 2 && _.isNumber(value[0])) {
    //console.log(value)
    osgb.setGridCoordinates(value[0], value[1])
    const wsg = osgb.getWGS84()
    const rv = []
    rv[0] = wsg.latitude.toPrecision(precision)
    rv[1] = wsg.longitude.toPrecision(precision)
    //console.log('-->',rv)
    return rv
  }
  if (_.isElement(value)) {
    return value.cloneNode(true)
  }
}


async function run(argv) {
  try {
    if (argv.length < 5) {
      console.error('usage: node transform.js <in.geojson> <out.geojson> <precision>')
      return 0
    }

    precision = parseInt(argv[4])

    let in_geojson_text = fs.readFileSync(path.resolve(__dirname, argv[2]), { encoding: 'utf8' })
    if (in_geojson_text.charCodeAt(0) === 65279) { // Remove UTF-8 start character
      in_geojson_text = in_geojson_text.slice(1)
    }
    let in_geojson = false
    try {
      in_geojson = JSON.parse(in_geojson_text)
    } catch (e) {
      console.error('in_geojson file not in JSON format')
      return 0
    }

    const out_geojson = _.cloneDeepWith(in_geojson, customCloner)
    delete out_geojson.crs
    const out_geojson_text = JSON.stringify(out_geojson)

    const outpath = path.resolve(__dirname, argv[3])
    const writeGeoJson = new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outpath)
      stream.on('close', function (fd) {
        resolve()
      })
      stream.on('open', function (fd) {
        stream.write(out_geojson_text)
        stream.end()
      })
    })
    await writeGeoJson
    console.error('DONE written', out_geojson_text.length)
    return 1
  }
  catch (e) {
    console.error('FAILED', e.message)
    return 2
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If testing, then don't.
if (require.main === module) {
  run(process.argv)
}

module.exports = { run }