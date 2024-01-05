import * as transform from '../transform.js'
import * as testhelper from './testhelper.js'
import { jest } from '@jest/globals'

test('TRANSFORM TEST #1', async () => {

  const spyclog = jest.spyOn(console, 'log').mockImplementation(testhelper.accumulog)
  const spycerror = jest.spyOn(console, 'error').mockImplementation(testhelper.accumulog)
  const argv = ['node', 'transform.js', 'tests/basemaps/VC69-VC70-OSGB36_test.geojson', 'tests/output/VC69-VC70-WGS64_test.geojson', '7']
  let rv = await transform.run(argv)
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', testhelper.accumulogged())

  if (rv === 1) {
    rv = await testhelper.checkFilesEqual('tests/expected/VC69-VC70-WGS64_test.geojson', 'tests/output/VC69-VC70-WGS64_test.geojson')
  }

  expect(rv).toBe(1)
})
