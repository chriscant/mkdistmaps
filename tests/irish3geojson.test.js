import * as mkdistmaps from '../mkdistmaps.js'
import * as testhelper from './testhelper.js'
import { jest } from '@jest/globals'

test('IRISH GRID REFS GEOJSON #3', async () => {
  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', '.', 'tests/data/irish-geojson-test-config.json']
  let rv = await mkdistmaps.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/Irish-Species.geojson','tests/output/Irish-Species.geojson')
  }

  expect(rv).toBe(1)
})
