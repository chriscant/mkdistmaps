const mkdistmaps = require('../mkdistmaps')
const testhelper = require('./testhelper');

test('IRISH GRID REFS #2', async () => {
  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/irish-test2-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/Irish-Species2.png','tests/output/Irish-Species2.png')
  }

  expect(rv).toBe(1)
})
