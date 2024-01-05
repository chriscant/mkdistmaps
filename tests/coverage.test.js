import fs from 'fs'
import * as mkdistmaps from '../mkdistmaps.js'
import { jest } from '@jest/globals';

test('COVERAGE: DUFF DATA', async () => {
  const output = []
  const accumulogger = function (...err) {
    let line = ''
    for (const e of err) {
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
  const argv = ['node', '.', 'tests/data/coverage-test-config.json']
  let rv = await mkdistmaps.run(argv)
  if (rv === 1) {
    if (!fs.existsSync('tests/output/Bacidia_assulata_sensu_auct._brit.,_non_(Körb.)_Vezda.png')) {
      console.log('Filename with diacritic not found')
      rv = 100
    }
  }
  spyclog.mockRestore()
  spycerror.mockRestore()
  console.log('All console output\n', output.join("\n"))
  expect(rv).toBe(1)
})
