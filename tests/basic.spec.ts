import { assert } from 'chai'
import { spawn } from 'child_process'

/**
 * Run node app to test cluster communication via IPC
 */
describe('Event in cluster', function() {
  it('Should be receiver in all processes', async function() {
    const result: string[] = await new Promise((resolve, reject) => {

      const child = spawn('ts-node', ['./tests/complex/cluster.ts'])
      let outputs: string[] = []
      let errors: string[] = []
      child.stdout.on('data', data => outputs.push(...data.toString().split('\n').filter(Boolean)))
      child.stderr.on('data', data => errors.push(data.toString()))
      child.on('exit', (code) => {
        if (code === 0) {
          resolve(outputs)
        } else {
          reject(errors)
        }
      })
    })

    const extecpted = [
      "master { index: 'master' }",
      'master { index: 3 }',
      'master { index: 0 }',
      'worker 3 { index: 3 }',
      'worker 0 { index: 0 }',
      'master { index: 1 }',
      'master { index: 2 }',
      "worker 3 { index: 'master' }",
      'worker 3 { index: 0 }',
      'worker 3 { index: 1 }',
      'worker 3 { index: 2 }',
      "worker 0 { index: 'master' }",
      'worker 1 { index: 1 }',
      'worker 0 { index: 3 }',
      'worker 0 { index: 1 }',
      'worker 0 { index: 2 }',
      'worker 2 { index: 2 }',
      "worker 1 { index: 'master' }",
      'worker 1 { index: 3 }',
      'worker 1 { index: 0 }',
      'worker 1 { index: 2 }',
      "worker 2 { index: 'master' }",
      'worker 2 { index: 3 }',
      'worker 2 { index: 0 }',
      'worker 2 { index: 1 }'
    ]

    const success = result.length === extecpted.length && result.every(i => extecpted.indexOf(i) !== -1)
    assert(success, 'All events should arrive to all processes')
  })
})