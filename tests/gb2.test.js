const mkdistmaps = require('../mkdistmaps')
const testhelper = require('./testhelper');

test('GB GRID REFS #2', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/gb2-count-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/GB2-Species.png', 'tests/output2/GB1-Species.png')
    if (rv) {
      rv = await testhelper.checkFilesEqual('tests/expected/GB2-All records.png', 'tests/output2/All records.png')
    }
    if (rv) {
      rv = await testhelper.checkFilesEqual('tests/expected/GB2-All species.png', 'tests/output2/All species.png')
    }
  }

  expect(rv).toBe(1)
})
