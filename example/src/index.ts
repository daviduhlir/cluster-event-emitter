import { ClusterEventEmitter } from '@david.uhlir/cluster-event-emitter'
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

    setInterval(() => {
      i.emit('event', { index: 'master' })
    }, 2000)

  } else {
    const index = parseInt(process.env['index'] as any, 10)
    i.on('event', (e) => console.log('worker ' + index, e))

    setInterval(() => {
      i.emit('event', { index })
    }, 2000)
  }
})()
