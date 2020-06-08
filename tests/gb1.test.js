const mkdistmaps = require('../mkdistmaps')

test('GB GRID REFS #1', async () => {
  const output = []
  const accumulogger = function (...err) {
    let line = ''
    for (e of err) {
      if (typeof e === 'object') {
        line += JSON.stringify(e)
      } else {
        line += e + ' '
      }
    }
    output.push(line)
  }
  const spyclog = jest.spyOn(console, 'log').mockImplementation(accumulogger)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(accumulogger)
  const argv = ['node', '.', 'tests/data/gb1-test-config.json']
  const rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', output.join("\n"))
  expect(rv).toBe(1)
})
