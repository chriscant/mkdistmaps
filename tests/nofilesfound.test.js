const mkdistmaps = require('../mkdistmaps')

test('CHECK MESSAGE WHEN RECORDSET FILES NOT FOUND', async () => {
  let lastOutput = false
  jest.spyOn(console, 'log').mockImplementation(err => { lastOutput = err });
  jest.spyOn(console, 'error').mockImplementation(err => { lastOutput = err });
  const argv = ['node', '.', 'tests/data/nofilesfound-test-config.json']
  await mkdistmaps.run(argv)
  expect(lastOutput).toBe('NO FILE(S) FOUND FOR: ')
})
