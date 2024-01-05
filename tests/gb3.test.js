import * as mkdistmaps from '../mkdistmaps.js'
import * as testhelper from './testhelper.js'
import { jest } from '@jest/globals'

test('GB GRID REFS #3', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/gb3-tetrad-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/GB3-Species.png', 'tests/output/GB3-Species.png')
  }

  expect(rv).toBe(1)
})
