# mkdistmaps

Command line tool to make species distribution maps on top of a base layer image from 
[GB](https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid)
species records with grid references.
[Irish](https://en.wikipedia.org/wiki/Irish_grid_reference_system) grid references not supported yet.

# Usage

Ensure you have [nodejs](https://nodejs.org/en/download/) installed.
You will also need your records in CSV format and a base map image.

At a suitable command line prompt:
```
git clone https://github.com/chriscant/mkdistmaps.git
cd mkdistmaps
npm install

```

* Now get your CSV of records, basemap image and a font file into the new `mkdistmaps` directory
* Make a text file to configure the run eg [sample-config.json](sample-config.json) which you can rename to have a txt extension if that's easier eg `vc101-config.txt`
* Edit your config file to specify your CSV file(s), a font, an output directory and other options
* Now run mkdistmaps at the command line, specifying your config file:

```
node mkdistmaps.js vc101-config.txt
```
Or more simply:
```
node . vc101-config.txt
```

The code reads all the records in the specified CSV file(s) and then creates one map for each found species in the output folder.
A monad or hectad is coloured in if there are records for that species in that square.
The fill colour is determined by the date of the most recent record for that square.

If you opt to make monad maps, then:
* the monad is shown as a circle if there is only one record for the monad
* any records that are only at hectad level are shown as outline squares, rather than filled squares

**Example hectad map:**

![Example hectad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/example-hectad.png)

**Example monad map:**

![Example monad map](https://raw.githubusercontent.com/chriscant/mkdistmaps/master/docs/example-monad.png)

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

## Configuration

Specify what you want done in a configuration file.
The config file must be in [JavaScript Object Notation (JSON) format](https://www.w3schools.com/js/js_json.asp).
The sample config file [sample-config.json](sample-config.json) shows some of the options available.

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

### font_filename

* Specify the filename of a font eg TTF

### basemap

The base map would typically be generated in QGIS using "Export as image", noting the N/W/E/S values

* **file** - path to the base map
* **north** - north bound of supplied base map
* **west** - west bound of supplied base map
* **east** - east bound of supplied base map
* **south** - south bound of supplied base map
* **scaledown** - scale reduction factor for output 
* **showhectadname** - set to `true` to show the hectad name on each map

### datecolours

* Optionally, specify the date range colours. The default is:

```
[
  { "minyear": 0, "maxyear": 1959, "colour": "rgba(255,255,0, 1)" },  // Yellow
  { "minyear": 1960, "maxyear": 1999, "colour": "rgba(0,0,255, 1)" }, // Blue
  { "minyear": 2000, "maxyear": 2019, "colour": "rgba(255,0,0, 1)" }, // Red
  { "minyear": 2020, "maxyear": 2039, "colour": "rgba(0,255,0, 1)" }  // Green
]
```

## Used with thanks

* Josh Marinacci's [pureimage](https://www.npmjs.com/package/pureimage) - [docs](http://joshmarinacci.github.io/node-pureimage/) and contributors
* C2FO's  [fast-csv](https://www.npmjs.com/package/fast-csv) - [docs](https://c2fo.io/fast-csv/docs/introduction/getting-started) and contributors
* Other nodejs modules - see code

I built base maps using [QGIS](https://qgis.org/en/site/) and [Ordnance Survey open data](https://www.ordnancesurvey.co.uk/opendatadownload/products.html)

I used data from the [British Lichen Society](https://www.britishlichensociety.org.uk/)

# License

This code is licensed under the GPL v2.
