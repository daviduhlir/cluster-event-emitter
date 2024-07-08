import { ClusterEventEmitter } from '../../dist'
import cluster from 'cluster'

class Test extends ClusterEventEmitter {}

const i = new Test()

;(async function () {
  if (!cluster.isWorker) {
    i.on('event', (e) => console.log('master', e))
    for(let index = 0; index < 4; index++) {
      cluster.fork({ index })
        .on('exit', (e) => {
          if (e !== 0) {
            throw new Error('Cluster failed: ' + e.toString())
          }
        })
    }
    i.emit('event', { index: 'master' })
  } else {
    const index = parseInt(process.env['index'] as any, 10)
    i.on('event', (e) => console.log('worker ' + index, e))
    i.emit('event', { index })

    setTimeout(() => {
      process.exit()
    }, 20)
  }
})()
