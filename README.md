# mkdistmaps

[![Build Status](https://api.travis-ci.com/chriscant/mkdistmaps.svg?branch=master)](https://travis-ci.com/github/chriscant/mkdistmaps)
[![Coverage Status](https://coveralls.io/repos/github/chriscant/mkdistmaps/badge.svg?branch=master)](https://coveralls.io/github/chriscant/mkdistmaps?branch=master)

Command line tool to make species distribution maps on top of a base layer image from species records with 
grid references.

Your data can (currently) contain either [GB](https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid)
or [Irish](https://en.wikipedia.org/wiki/Irish_grid_reference_system) grid references, but not both.
GB grid references start with two letters; Irish grid references start with one letter.
The code handles 2, 4, 6, 8 or 10 numbers after the initial letter(s).

# Usage

Ensure you have [git](https://git-scm.com/downloads) and [nodejs](https://nodejs.org/en/download/) installed.
You will also need your records in CSV format and a base map image.

At a suitable command line prompt:
```
git clone https://github.com/chriscant/mkdistmaps.git
cd mkdistmaps
npm install

```

* Now get your CSV of records and a basemap image into the new `mkdistmaps` directory
* Make a text file to configure the run eg [sample-config.json](sample-config.json) which you can rename to have a txt extension if that's easier eg `vc101-config.txt`
* Edit your config file to specify your CSV file(s), an output directory and other options
* Now run mkdistmaps at the command line, specifying your config file:

```
node mkdistmaps.js vc101-config.txt
```
Or more simply:
```
node . vc101-config.txt
```

The code reads all the records in the specified CSV file(s) and then creates one PNG map for each found species in the output folder.
A monad or hectad is coloured in if there are records for that species in that square.
The fill colour is determined by the date of the most recent record for that square.

If you opt to make monad maps, then:
* the monad is shown as a circle if there is only one record for the monad
* any records that are only at hectad level are shown as outline squares, rather than filled squares

The mkdistmaps version string and the runtime date and time are added in grey at the top left of each generated map.

**Example monad maps:**

Both these monad-level maps use the same data (all records of *Aspicilia calcarea* in VC69 and VC70, Cumbria, as of January 2020).
The first shows the data on a map of Cumbria.
The second shows the data on a map of most of Great Britain.

![Example monad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/Aspicilia-calcarea-VC69-VC70.png)

![Example monad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/Aspicilia-calcarea-GB.png)

**Example hectad map:**

This map shows some records of *Peltigera horizontalis* across GB, displayed at hectad resolution.

![Example hectad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/Peltigera-horizontalis.png)

**Example Irish hectad map:**

![Example Irish hectad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/Irish-Species.png)

**Runtime output**

The code generates basic output as it processes the data, finishing like this:

```
...
Parsed 56980 rows
Errors 1
#0 LC0003050000XIWC Date invalid:undefined Year:NaN
Species: 1165
Records: 56980
Empty rows: 0
Boxes: 949
Runtime: 189 seconds
```
## Updates

If the code at github has been updated, you can update your local copy using this command in the `mkdistmaps` directory:

```
git pull
```



## Configuration

Specify what you want done in a configuration file.
The config file must be in [JavaScript Object Notation (JSON) format](https://www.w3schools.com/js/js_json.asp).
The sample config file [sample-config.json](sample-config.json) shows some of the options available.

### limit

* If you want to test what the maps look like without generating them all, specify the number of species maps that you want to produce, eg 1. Zero means all.

### outputFolder

* Specify the output folder, which is created if need be

### recordset

* **csv** - path to csv, optionally including wildcard asterisks
* **title** - text that is added to every generated map
* **GRCol** - name of the CSV column that contains the grid reference
* **TaxonCol** - name of the CSV column that contains the species name
* **ObsKeyCol** - optional name of the CSV column containing an observation key - used to show errors
* **DateCol** - specify either this or **YearCol** as the name of the CSV column containing the date
* **YearCol** - name of the CSV column containing the year
* **DateFormats** - optional date formats tried. The default is `[ "DD/MM/YYYY", "YYYY" ]` - [see here for format details](https://momentjs.com/docs/#/parsing/string-formats/)
* **headers** - optional array of strings containing the CSV column names
* **renameHeaders** - optional specify true to replace the CSV header line with that in **headers**. The default is `false`

If your CSV file doesn't contains a header line, then supply the column names in **headers**.

If your CSV files does contain a header line but it contains duplicate column names, then you can replace it with the 
column names given in **headers** and set **renameHeaders** to `true`.  Here is an example for **headers**:

`[ "Location", "Grid ref", "VC", "checked?", "Recorders", "Date(s)", "Altitude", "Site and visit comments", "BLS no.", "Species", "BLS no.2", "Taxon name", "Group", "Status", "Substrate", "Small scale habitats", "Abundance", "Record notes", "Herbarium", "Specimen", "Determiner" ]`

Note: if the CSV file has columns `Eastings` and `Northings` then these are cross-checked against the grid reference.

### useMonadsNotHectads

* Optionally specify `true` to map records to monads. Default is `false` for hectads.

### makeGenusMaps

* Optionally specify `true` to make maps for each genus ie the first word of all species names. Default is `false`.

The genus maps will have "-all" added after the first word (which should result in the genus map displaying first in a directory listing).
If there is one record each of "Bacidia" and "Bacidia rubella" then three maps will be produced:
"Bacidia", "Bacidia rubella" and "Bacidia -all" with the last one showing 2 records.

### font_filename

* Specify the filename of a font eg a TTF file. The tests directory contains an open source font "tests/fonts/SourceSansPro-Regular.ttf".

### font_colour

* Specify the colour of the written text eg as "#000000" or "rgba(0,255,0, 1)"

### basemap

The base map would typically be generated in QGIS using "Export as image", noting the N/W/E/S values

* **file** - path to the base map: must be PNG, JPG or JPEG
* **north** - north bound of supplied base map
* **west** - west bound of supplied base map
* **east** - east bound of supplied base map
* **south** - south bound of supplied base map
* **scaledown** - scale reduction factor for output 
* **showhectadname** - set to `true` to show the hectad name on each map

The following basemap parameters determine where and how descriptive text and the legend are written onto the map

* **legend_hide** - set to true to not show a legend
* **title_x**: X position of start of text. Default: 10
* **title_y**: Y position of start of text. Default: 10
* **title_y_inc**: Y increment for next lines of text. Default: 25
* **title_fontsize**: Title text fontsize. Default: "24pt"
* **legend_x**: X position of start of legend. Default: 10
* **legend_y**: Y position of start of legend. Default: half way down map
* **legend_inc**: Y increment for next legend line. Default: 15
* **legend_fontsize**: Legend text fontsize. Default: "12pt"
* **hectad_fontsize**: Hectad name fontsize. Default: "12pt"

### datecolours

* Optionally, specify the date range colours. The default is:

```
[
  { "minyear": 0, "maxyear": 1959, "colour": "rgba(255,255,0, 1)", "legend": "pre-1960" },  // Yellow
  { "minyear": 1960, "maxyear": 1999, "colour": "rgba(0,0,255, 1)", "legend": "1960-1999" }, // Blue
  { "minyear": 2000, "maxyear": 2019, "colour": "rgba(255,0,0, 1)", "legend": "2000-2019" }, // Red
  { "minyear": 2020, "maxyear": 2039, "colour": "rgba(0,255,0, 1)", "legend": "2020-2039" }  // Green
]
```

## Used with thanks

* Josh Marinacci's [pureimage](https://www.npmjs.com/package/pureimage) - [docs](http://joshmarinacci.github.io/node-pureimage/) and contributors
* C2FO's  [fast-csv](https://www.npmjs.com/package/fast-csv) - [docs](https://c2fo.io/fast-csv/docs/introduction/getting-started) and contributors
* Other nodejs modules - see code

I built base maps using [QGIS](https://qgis.org/en/site/), [Ordnance Survey open data](https://www.ordnancesurvey.co.uk/opendatadownload/products.html),
[OpenDataNI](https://www.opendatani.gov.uk/dataset?q=osni) and
[Ordnance Survey Ireland open data](https://www.osi.ie/about/open-data/) - thanks.

Vice-county data from https://github.com/BiologicalRecordsCentre/vice-counties and https://github.com/SK53/Irish-Vice-Counties - thanks.

I used data from the [British Lichen Society](https://www.britishlichensociety.org.uk/) - thanks.

The tests use the font "SourceSansPro-Regular.ttf" from https://github.com/google/fonts - thanks.

# To do

* Support tetrad format grid references
* Possibly: cope with having Irish and GB grid references displayed on the same map
* Possibly: cope with map inserts for out-of-main-area locations
* Improve tests, eg split into smaller units

# License

[MIT](LICENCE)
