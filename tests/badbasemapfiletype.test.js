﻿import * as mkdistmaps from '../mkdistmaps.js'
import { jest } from '@jest/globals'

test('CHECK MESSAGE WHEN BASEMAP FILE TYPE NOT ACCEPTED', async () => {
  let lastOutput = false
  jest.spyOn(console, 'log').mockImplementation(err => { lastOutput = err });
  jest.spyOn(console, 'error').mockImplementation(err => { lastOutput = err });
  const argv = ['node', '.', 'tests/data/badbasemapfiletype-test-config.json']
  await mkdistmaps.run(argv)
  expect(lastOutput).toBe('Basemap file must be PNG or JPG -')
})
