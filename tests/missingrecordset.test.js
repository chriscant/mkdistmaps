const mkdistmaps = require('../mkdistmaps')

test('CHECK MESSAGE WHEN NO RECORDSET GIVEN', async () => {
  let lastOutput = false
  jest.spyOn(console, 'log').mockImplementation(err => { lastOutput = err });
  jest.spyOn(console, 'error').mockImplementation(err => { lastOutput = err });
  const argv = ['node', '.', 'tests/data/missingrecordset-test-config.json']
  await mkdistmaps.run(argv)
  expect(lastOutput).toBe('No recordset config given')
})
