const mkdistmaps = require('../mkdistmaps')
const testhelper = require('./testhelper');

test('IRISH GRID REFS #1', async () => {
  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/irish-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/Irish-Species.png','tests/output/Irish-Species.png')
  }

  expect(rv).toBe(1)
})
