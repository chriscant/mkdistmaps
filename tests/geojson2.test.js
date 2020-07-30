const mkdistmaps = require('../mkdistmaps')
const testhelper = require('./testhelper');

test('GEOJSON COUNT #2', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/geojson2-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/GB1-Species-Count.geojson', 'tests/output2/GB1-Species.geojson')
    if (rv) {
      rv = await testhelper.checkFilesEqual('tests/expected/GB1-All-species.geojson', 'tests/output2/All species.geojson')
    }
  }

  expect(rv).toBe(1)
})
