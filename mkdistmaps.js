#!/usr/bin/env node

// mkdistmaps

// For each new release, update in package.json and create a new tag in GitHub - used in version string

let config = false
let SCALE = false
let usesGB = false
let usesIE = false

const dt_start = new Date()

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const csv = require('fast-csv')
const PImage = require('pureimage')
const execSync = require('child_process').execSync
const moment = require('moment')

const makeAllMapName = 'All species'

const UKletters1 = [
  { l: 'S', e: 0, n: 0 },
  { l: 'N', e: 0, n: 500 },
  { l: 'H', e: 0, n: 1000 },
  { l: 'T', e: 500, n: 0 }
]
const UKletters2 = [
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

// Get version from last git commit
const gitdescr = execSync('git describe --tags --long')
let version = 'mkdistmaps ' + gitdescr.toString('utf8', 0, gitdescr.length - 1) + ' - run at ' + moment().format('Do MMMM YYYY, h:mm:ss a')

///////////////////////////////////////////////////////////////////////////////////////
// run: called when run from command line

async function run(argv) {
  let rv = 1
  try {
    // Display usage
    if (argv.length <= 2) {
      console.error('usage: node index.js <config.json>')
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
      const endlinepos = configtext.indexOf("\n", dslashpos)
      if (endlinepos === -1) {
        configtext = configtext.substring(0, dslashpos)
        break
      }
      configtext = configtext.substring(0, dslashpos) + configtext.substring(endlinepos)
    }
    //console.log(configtext)
    try {
      config = JSON.parse(configtext)
    } catch (e) {
      console.error('config file not in JSON format')
      return 0
    }
    console.log(config)

    if (config.hasOwnProperty('versionoverride')) {
      version = config.versionoverride
    }
    
    // Make output folder if need be
    fs.mkdirSync(path.join(__dirname, config.outputFolder), { recursive: true })

    // Set scale factor for hectad or monad
    const hectadSCALE = {
      factor: 10000,
      factor2: 10000,
      gridreffigs: 2
    }
    const monadSCALE = {
      factor: 1000,
      factor2: 10000,
      gridreffigs: 4
    }
    if (!config.hasOwnProperty('useMonadsNotHectads')) {
      console.log('Using default: map to hectad')
      config.useMonadsNotHectads = false
    }
    SCALE = config.useMonadsNotHectads ? monadSCALE : hectadSCALE

    // Default makeGenusMaps to false
    if (!config.hasOwnProperty('makeGenusMaps')) {
      config.makeGenusMaps = false
    }
    // Default makeAllMap to false
    if (!config.hasOwnProperty('makeAllMap')) {
      config.makeAllMap = false
    }

    // Set default datecolours if need be
    if (!config.hasOwnProperty('datecolours')) {
      console.log('Using default datecolours')
      config.datecolours = [
        { 'minyear': 0, 'maxyear': 1959, 'colour': 'rgba(255,255,0, 1)', 'legend': 'pre-1960' },  // Yellow
        { 'minyear': 1960, 'maxyear': 1999, 'colour': 'rgba(0,0,255, 1)', 'legend': '1960-1999' }, // Blue
        { 'minyear': 2000, 'maxyear': 2019, 'colour': 'rgba(255,0,0, 1)', 'legend': '2000-2019' }, // Red
        { 'minyear': 2020, 'maxyear': 2039, 'colour': 'rgba(0,255,0, 1)', 'legend': '2020-2039' }  // Green
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

    /////////////////
    // Do everything!
    const headers = config.recordset.headers ? config.recordset.headers : true
    const renameHeaders = config.recordset.renameHeaders ? config.recordset.renameHeaders : false

    let totalrecords = 0
    const processFiles = new Promise((resolveAll, rejectAll) => {
      async function doAll() {
        const files = glob.sync(config.recordset.csv)
        if (files.length === 0) {
          console.error('NO FILE(S) FOUND FOR: ', config.recordset.csv)
          rv = 0
        } else {
          let donecount = 0
          const doFiles = new Promise((resolveFiles, rejectFiles) => {
            for (const file of Object.values(files)) {
              //console.log(file)
              const fileSpecieses = []
              fs.createReadStream(path.resolve(__dirname, file))
                .pipe(csv.parse({ headers: headers, renameHeaders: renameHeaders }))
                .on('error', error => console.error(error))
                .on('data', row => { processLine(file, row, fileSpecieses) })
                .on('end', function (rowCount) {
                  if (Object.keys(fileSpecieses).length === 0) {
                    errors.push(file + ' no species found')
                  }
                  console.log(file, 'species:', Object.keys(fileSpecieses).length)
                  totalrecords += rowCount
                  if (++donecount === files.length) {
                    resolveFiles()
                  }
                })
            }
          })
          await doFiles
          console.log('COMPLETED READING DATA')
          await importComplete(totalrecords)
        }
        resolveAll()
      }
      doAll()
    })
    await processFiles
    if( rv) console.log('SUCCESS')
    return 1
  } catch (e) {
    console.error('run EXCEPTION', e)
    return 2
  }
}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// processLine: Process a line of CSV data ie a single record
// updateSpeciesesGrids: Update the data for a species or genus

// 'Spatial Reference': 'NY30',     Eastings: '330001', Northings: '500000',
// 'Spatial Reference': 'NY3703',   Eastings: '337001', Northings: '503000',
// 'Spatial Reference': 'NY387034', Eastings: '338701', Northings: '503400',
//                       NY48311327            348311               513270
//                       NY50951510                                           Some 12 figure GRs appear as 10 figures
//                       NY7432046814

//                       J3438674590           334386               374590 
//                                       17646.6931-370000       0-467252

const speciesesGrids = {}
let speciesCount = 0
let taxonCount = 0
const errors = []
let lineno = 0
let records = 0
let empties = 0
const boxes = {}

function updateSpeciesesGrids(TaxonName, box, Year, isTaxon, fileSpecieses) {
  if (isTaxon) TaxonName += ' -all'
  let speciesGrids = speciesesGrids[TaxonName]
  if (!speciesGrids) {
    speciesGrids = {}
    speciesGrids[box] = { count: 0, minyear: 3000, maxyear: 0 }
    speciesesGrids[TaxonName] = speciesGrids
    if (isTaxon) taxonCount++
    else speciesCount++
  }
  if (!speciesGrids[box]) {
    speciesGrids[box] = { count: 0, minyear: 3000, maxyear: 0 }
  }
  speciesGrids[box].count++
  if (Year > speciesGrids[box].maxyear) {
    speciesGrids[box].maxyear = Year
  }
  if (Year < speciesGrids[box].minyear) {
    speciesGrids[box].minyear = Year
  }

  // Now remember per-file counts
  if (!fileSpecieses[TaxonName]) {
    fileSpecieses[TaxonName] = 0
  }
  fileSpecieses[TaxonName]++
}


function processLine(file, row, fileSpecieses) {
  //console.log(row)
  lineno++

  // Get GR (no spaces) and species name
  const SpatialReference = row[config.recordset.GRCol].toUpperCase().replace(/ /g, '')
  //console.log('SpatialReference', SpatialReference)
  const TaxonName = row[config.recordset.TaxonCol].trim()
  if (SpatialReference.length === 0 || TaxonName.length === 0 || TaxonName.substring(0,1)==='#') {
    empties++
    return
  }

  records++

  // Get other data fields
  const EastingsExplicit = parseInt(row['Eastings'])
  const NorthingsExplicit = parseInt(row['Northings'])
  const ExplicitGiven = EastingsExplicit !== 0 || NorthingsExplicit!==0
  let ObsKey = row[config.recordset.ObsKeyCol]
  let ObsDate = row[config.recordset.DateCol]
  let Year = parseInt(row[config.recordset.YearCol])
  //console.log('----------')
  //console.log('SpatialReference', SpatialReference)
  //console.log('EastingsExplicit', EastingsExplicit)
  //console.log('NorthingsExplicit', NorthingsExplicit)
  //console.log('TaxonName', TaxonName, TaxonName.length)

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

  // From grid reference, work out Eastings and Northings and box name eg NY51 or NY5714
  let Eastings = 0
  let Northings = 0
  let isGB = false
  let isIE = false

  let box = SpatialReference
  const grfig = SCALE.gridreffigs / 2
  if (box.length === 12) {
    Eastings += parseInt(box.substring(2, 7))
    Northings += parseInt(box.substring(7))
    box = box.substring(0, 2 + grfig) + box.substring(7, 7 + grfig)
    isGB = true
  }
  else if (box.length === 10) {
    Eastings += parseInt(box.substring(2, 6)) * 10
    Northings += parseInt(box.substring(6)) * 10
    box = box.substring(0, 2 + grfig) + box.substring(6, 6 + grfig)
    isGB = true
  }
  else if (box.length === 8) {
    Eastings += parseInt(box.substring(2, 5)) * 100
    Northings += parseInt(box.substring(5)) * 100
    box = box.substring(0, 2 + grfig) + box.substring(5, 5 + grfig)
    isGB = true
  }
  else if (box.length === 6) {
    Eastings += parseInt(box.substring(2, 4)) * 1000
    Northings += parseInt(box.substring(4)) * 1000
    box = box.substring(0, 2 + grfig) + box.substring(4, 4 + grfig)
    isGB = true
  }
  else if (box.length === 4) {
    Eastings += parseInt(box.substring(2, 3)) * 10000
    Northings += parseInt(box.substring(3)) * 10000
    isGB = true
  }
  else if (box.length === 11) {
    Eastings += parseInt(box.substring(1, 6))
    Northings += parseInt(box.substring(6))
    box = box.substring(0, 1 + grfig) + box.substring(6, 6 + grfig)
    isIE = true
  }
  else if (box.length === 9) {
    Eastings += parseInt(box.substring(1, 5)) * 10
    Northings += parseInt(box.substring(5)) * 10
    box = box.substring(0, 1 + grfig) + box.substring(5, 5 + grfig)
    isIE = true
  }
  else if (box.length === 7) {
    Eastings += parseInt(box.substring(1, 4)) * 100
    Northings += parseInt(box.substring(4)) * 100
    box = box.substring(0, 1 + grfig) + box.substring(4, 4 + grfig)
    isIE = true
  }
  else if (box.length === 5) {
    Eastings += parseInt(box.substring(1, 3)) * 1000
    Northings += parseInt(box.substring(3)) * 1000
    box = box.substring(0, 1 + grfig) + box.substring(3, 3 + grfig)
    isIE = true
  }
  else if (box.length === 3) {
    Eastings += parseInt(box.substring(1, 2)) * 10000
    Northings += parseInt(box.substring(2)) * 10000
    isIE = true
  }
  else {
    errors.push(ObsKey + ' Spatial Reference duff length: ' + box.length + ': ' + SpatialReference)
    return
  }
  if (isGB) usesGB = true
  if (isIE) usesIE = true
  if (usesGB && usesIE) {
    errors.push(ObsKey + ' Cannot use GB and IE grid references: ' + SpatialReference)
    return
  }

  const l1 = box.substring(0, 1)
  if (isGB) {
    for (let i = 0; i < UKletters1.length; i++) {
      const boxbl = UKletters1[i]
      if (boxbl.l == l1) {
        //console.log('boxbl', boxbl)
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }

    const l2 = box.substring(1, 2)
    for (let i = 0; i < UKletters2.length; i++) {
      const boxbl = UKletters2[i]
      if (boxbl.l == l2) {
        //console.log('boxbl', boxbl)
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }
  } else {
    for (let i = 0; i < IEletters.length; i++) {
      const boxbl = IEletters[i]
      if (boxbl.l == l1) {
        //console.log('boxbl', boxbl)
        Eastings += boxbl.e * 1000
        Northings += boxbl.n * 1000
        break
      }
    }
  }
  //console.log(SpatialReference, box, Eastings, Northings, EastingsExplicit, NorthingsExplicit)

  if (ExplicitGiven) {
    if ((Math.abs(Eastings - EastingsExplicit) > 2) || (Math.abs(Northings - NorthingsExplicit) > 2)) {
      errors.push(ObsKey + ' Explicit grid ref discrepancy: ' + SpatialReference + ' ExpE:' + EastingsExplicit + ' ExpN:' + NorthingsExplicit + ' E:' + Eastings + ' N:' + Northings)
      return
    }
  }
  //console.log('box', box)
  //console.log('Eastings', Eastings)
  //console.log('Northings', Northings)

  // Save box name and location
  if (!boxes[box]) {
    boxes[box] = {
      e: Math.floor(Eastings / SCALE.factor),
      n: Math.floor(Northings / SCALE.factor)
    }
  }

  // Add/Update record for species ie count, min and max year for each box
  updateSpeciesesGrids(TaxonName, box, Year, false, fileSpecieses)

  if (config.makeAllMap) {
    updateSpeciesesGrids(makeAllMapName, box, Year, false, fileSpecieses)
  }

  if (config.makeGenusMaps) {
    const words = TaxonName.split(' ')
    updateSpeciesesGrids(words[0], box, Year, true, fileSpecieses)
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// importComplete:  Having read all records, generate distribution maps for all found species

async function importComplete(rowCount) {
  // Load base map and work out main box dimensions (assumed to be square)
  const img = config.basemap.isPNG
    ? await PImage.decodePNGFromStream(fs.createReadStream(config.basemap.file))
    : await PImage.decodeJPEGFromStream(fs.createReadStream(config.basemap.file))
  const width = img.width / config.basemap.scaledown
  const height = img.height / config.basemap.scaledown
  const mapeastings = config.basemap.east - config.basemap.west     // eg 390500-293169
  const mapnorthings = config.basemap.north - config.basemap.south  // eg 589703-460155
  console.log(mapeastings, mapnorthings)
  const boxswidth = mapeastings / SCALE.factor
  console.log('boxswidth', boxswidth)
  let boxwidth = width / boxswidth  // boxheight should be the same if map in proportion
  console.log('boxwidth', boxwidth)
  const boxswidth2 = mapeastings / SCALE.factor2
  console.log('boxswidth2', boxswidth2)
  const boxwidth2 = width / boxswidth2  // boxheight should be the same if map in proportion
  console.log('boxwidth2', boxwidth2)

  if (!config.basemap.legend_y) config.basemap.legend_y = Math.trunc(height/2)

  // Now set image x and y for each box
  for (const [box, boxloc] of Object.entries(boxes)) {
    const n = (boxloc.n * SCALE.factor) - config.basemap.south
    const hn = n / SCALE.factor
    const hnp = hn * boxwidth
    boxloc.y = height - hnp - boxwidth
    const e = (boxloc.e * SCALE.factor) - config.basemap.west
    const he = e / SCALE.factor
    const hep = he * boxwidth
    boxloc.x = hep // - boxwidth
  }
  if (boxwidth < 2) boxwidth = 2
  const boxwidthhalf = boxwidth / 2
  console.log('boxwidthhalf', boxwidthhalf)

  // Load the font
  const loadFont = new Promise((resolve, reject) => {
    const fontpath = path.join(__dirname, config.font_filename)
    const fnt = PImage.registerFont(fontpath, 'TheFont')
    fnt.load(() => {
      resolve()
    })
  })
  await loadFont

  // Go through all species
  const hectadboxlen = usesIE?3:4
  let done = 0
  for (const [TaxonName, speciesGrids] of Object.entries(speciesesGrids)) {
    //console.log(TaxonName, speciesGrids)

    // Create output canvas from base map
    const img2 = PImage.make(width, height)
    const ctx = img2.getContext('2d')
    ctx.drawImage(img,
      0, 0, img.width, img.height,  // source dimensions
      0, 0, width, height           // destination dimensions
    )

    // Write summary text
    ctx.fillStyle = config.font_colour
    ctx.font = config.basemap.title_fontsize + " 'TheFont'"
    ctx.fillText(TaxonName, config.basemap.title_x, config.basemap.title_y)

    ctx.font = config.basemap.title_fontsize + " 'TheFont'"
    ctx.fillText(config.recordset.title, config.basemap.title_x, config.basemap.title_y + config.basemap.title_y_inc)

    // Go through all boxes found for this species
    let reccount = 0
    for (const [box, boxdata] of Object.entries(speciesGrids)) {

      reccount += boxdata.count
      const boxloc = boxes[box]

      // Determine box colour
      ctx.fillStyle = 'rgba(255,20, 147, 1)' // default to pink
      for (const datecolour of Object.values(config.datecolours)) {
        if (boxdata.maxyear >= datecolour.minyear && boxdata.maxyear <= datecolour.maxyear) {
          ctx.fillStyle = datecolour.colour
        }
      }
      ctx.strokeStyle = ctx.fillStyle

      // Draw solid or round box (and optional hectad outline)
      if (SCALE.gridreffigs === 4 && box.length === hectadboxlen) {
        ctx.strokeRect(boxloc.x, boxloc.y, boxwidth2, boxwidth2)
      } else {
        if (boxdata.count === 1 && config.useMonadsNotHectads) {
          ctx.beginPath()
          ctx.arc(boxloc.x + boxwidthhalf, boxloc.y + boxwidthhalf, boxwidthhalf, 0, 2 * Math.PI, false) // Math.PI
          ctx.closePath()
          ctx.fill()

        } else {
          ctx.fillRect(boxloc.x, boxloc.y, boxwidth, boxwidth)
        }
      }

      // Draw hectad name
      if (config.basemap.showhectadname) {
        ctx.fillStyle = config.font_colour
        ctx.font = config.basemap.hectad_fontsize + " 'TheFont'"
        ctx.fillText(box, boxloc.x, boxloc.y + boxwidth)
      }
    }
    // Write number of records
    ctx.fillStyle = config.font_colour
    ctx.font = config.basemap.title_fontsize + " 'TheFont'"
    ctx.fillText('Records: ' + reccount, config.basemap.title_x, config.basemap.title_y + 2 * config.basemap.title_y_inc)

    // Write version and today's date-time
    ctx.fillStyle = '#404040'
    ctx.font = config.basemap.legend_fontsize + " 'TheFont'"
    ctx.fillText(version, 10, 10)

    if (!config.basemap.legend_hide) {
      ctx.font = config.basemap.legend_fontsize + " 'TheFont'"
      let legend_y = config.basemap.legend_y
      for (const datecolour of Object.values(config.datecolours)) {
        ctx.fillStyle = datecolour.colour
        ctx.fillRect(config.basemap.legend_x, legend_y, config.basemap.legend_inc, config.basemap.legend_inc)
        ctx.strokeStyle = config.font_colour
        ctx.strokeRect(config.basemap.legend_x, legend_y, config.basemap.legend_inc, config.basemap.legend_inc)
        ctx.fillStyle = config.font_colour
        legend_y += config.basemap.legend_inc
        ctx.fillText(datecolour.legend, config.basemap.legend_x + 2 * config.basemap.legend_inc, legend_y)
      }
    }

    // Output the final species map
    const outpath = path.join(__dirname, config.outputFolder, TaxonName+'.png')
    await PImage.encodePNGToStream(img2, fs.createWriteStream(outpath))
    console.log('done', TaxonName, reccount)
    if (config.limit && ++done >= config.limit) {
      errors.push('Map generation stopped after reaching limit of ' + config.limit)
      break
    }
  }

  // Report record count, errors, species and boxes
  console.log(`Parsed ${rowCount} rows`)
  console.log(`Errors ${errors.length}`)
  for (let i = 0; i < errors.length; i++) {
    console.error('#' + i, errors[i])
  }
  if ((taxonCount + speciesCount) !== Object.keys(speciesesGrids).length) {
    console.error('Taxon/Species/Grids mismatch:', taxonCount, speciesCount, Object.keys(speciesesGrids).length)
  }
  console.log('Species:', speciesCount)
  if (config.makeGenusMaps) {
    console.log('Taxons:', taxonCount)
  }

  console.log('Records:', records)
  console.log('Empty rows:', empties)
  console.log('Boxes:', Object.keys(boxes).length)

  const dt_end = new Date()
  const runtime_seconds = Math.floor((dt_end - dt_start) / (1000))
  console.log('Runtime:', runtime_seconds, 'seconds')
}
///////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If testing, then don't.
if (require.main === module) {
  run(process.argv)
}

module.exports = { run, processLine, importComplete }