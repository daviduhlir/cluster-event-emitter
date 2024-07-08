import EventEmitter from 'events'
import cluster from './utils/cluster'

export const INTERNAL_MESSAGE_BROADCAST = 'CLUSTER-EVENT-EMITTER-INTERNAL-MESSAGE-BROADCAST'

let currentId = 0
const map = new WeakMap()
const id = object => {
  if (!map.has(object)) {
    map.set(object, ++currentId)
  }
  return map.get(object)
}

export class ClusterEventEmitter extends EventEmitter {
  protected id: string
  protected static initialized = false
  constructor(identifier?: string) {
    super()
    this.initialize()
    if (identifier) {
      this.id = identifier
    } else {
      this.id = `id:${id(this)}`
    }
  }

  static initializeMaster() {
    if (!cluster.isWorker && !ClusterEventEmitter.initialized) {
      cluster.on('message', async (worker, message) => {
        if (message['INTERNAL_MESSAGE_BROADCAST'] === INTERNAL_MESSAGE_BROADCAST) {
          Object.keys(cluster.workers).forEach(workerId => {
            const remoteWorker = cluster.workers[workerId]
            // do not send it back
            if (worker.id !== remoteWorker.id) {
              remoteWorker.send(message)
            }
          })
        }
      })
      ClusterEventEmitter.initialized = true
    }
  }

  protected initialize() {
    if (cluster.isWorker) {
      process.on('message', async (message: any) => {
        if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === INTERNAL_MESSAGE_BROADCAST) {
          if (message.id === this.id) {
            this.handleInternalEmit(message.eventName, ...message.args)
          }
        }
      })
    } else {
      ClusterEventEmitter.initializeMaster()
      cluster.on('message', async (worker, message) => {
        if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === INTERNAL_MESSAGE_BROADCAST) {
          if (message.id === this.id) {
            this.handleInternalEmit(message.eventName, ...message.args)
          }
        }
      })
    }
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const message = {
      INTERNAL_MESSAGE_BROADCAST,
      id: this.id,
      eventName,
      args,
    }
    if (cluster.isWorker) {
      process.send(message)
    } else {
      Object.keys(cluster.workers).forEach(workerId => {
        cluster.workers?.[workerId]?.send?.(message)
      })
    }
    return super.emit(eventName, ...args)
  }

  protected handleInternalEmit(eventName: string | symbol, ...args: any[]) {
    return super.emit(eventName, ...args)
  }
}
