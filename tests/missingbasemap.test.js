import * as mkdistmaps from '../mkdistmaps.js'
import { jest } from '@jest/globals'

test('CHECK MESSAGE WHEN NO BASEMAP GIVEN', async () => {
  let lastOutput = false
  jest.spyOn(console, 'log').mockImplementation(err => { lastOutput = err });
  jest.spyOn(console, 'error').mockImplementation(err => { lastOutput = err });
  const argv = ['node', '.', 'tests/data/missingbasemap-test-config.json']
  await mkdistmaps.run(argv)
  expect(lastOutput).toBe('No basemap config given')
})
