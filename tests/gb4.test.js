const mkdistmaps = require('../mkdistmaps')
const testhelper = require('./testhelper');

test('GB GRID REFS #4', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/gb4-all-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/GB4-Species.png', 'tests/output/GB4-Species.png')
  }

  expect(rv).toBe(1)
})
