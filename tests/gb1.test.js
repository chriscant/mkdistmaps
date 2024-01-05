import * as mkdistmaps from '../mkdistmaps.js'
import * as testhelper from './testhelper.js'
import { jest } from '@jest/globals'

test('GB GRID REFS #1', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/gb1-date-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/GB1-Species.png', 'tests/output/GB1-Species.png')
  }

  expect(rv).toBe(1)
})
