const mkdistmaps = require('../mkdistmaps')

test('CHECK MESSAGE WHEN DUFF CONFIG JSON PASSED', async () => {
  let lastOutput = false
  jest.spyOn(console, 'log').mockImplementation(err => { lastOutput = err });
  jest.spyOn(console, 'error').mockImplementation(err => { lastOutput = err });
  const argv = ['node', '.', 'tests/data/csv/Test-Irish.csv']
  await mkdistmaps.run(argv)
  expect(lastOutput).toBe('config file not in JSON format')
})
