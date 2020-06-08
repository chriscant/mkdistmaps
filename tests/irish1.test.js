const mkdistmaps = require('../mkdistmaps')

test('IRISH GRID REFS #1', async () => {
  const argv = ['node', '.', 'tests/data/irish-test-config.json']
  const rv = await mkdistmaps.run(argv)
  expect(rv).toBe(1)
})
