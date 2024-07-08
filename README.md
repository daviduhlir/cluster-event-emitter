# cluster event emitter for node.js clustered applications

Simple util to broadcast events in clustered application.
Its extending built-in event emitter, and just sending all the events by IPC to all
other processes. Connection between emitters is done by id, provided in constructor. Default id is
simple count of already create emitters, so if you code is linear, it will be enaught for you, but
in most of applications, this id to be defined is needed. Do not forget, if you are not using it in your
master process, `ClusterEventEmitter.initializeMaster()` must be called.

```ts
import { Sharedcluster-event-emitter } from '@david.uhlir/cluster-event-emitter'

class Test extends ClusterEventEmitter {
  constructor() {
    super('MyUniqueId')
  }
}

const i = new Test()
i.on('eventName', (e) => console.log(e))
i.emit('eventName', { data: 'Hello world' })

```

ISC