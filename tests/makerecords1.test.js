const makerecords = require('../makerecords')
const testhelper = require('./testhelper');

test('MAKERECORDS TEST #1', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', 'makerecords.js', 'GB', '2000', '50', 'tests/output/largetest.csv', 'testseed']
  let rv = await makerecords.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/largetest.csv', 'tests/output/largetest.csv')
  }

  expect(rv).toBe(1)
})
