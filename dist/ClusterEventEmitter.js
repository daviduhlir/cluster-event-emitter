"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterEventEmitter = exports.INTERNAL_MESSAGE_BROADCAST = void 0;
const events_1 = __importDefault(require("events"));
const cluster_1 = __importDefault(require("./utils/cluster"));
exports.INTERNAL_MESSAGE_BROADCAST = 'CLUSTER-EVENT-EMITTER-INTERNAL-MESSAGE-BROADCAST';
let currentId = 0;
const map = new WeakMap();
const id = object => {
    if (!map.has(object)) {
        map.set(object, ++currentId);
    }
    return map.get(object);
};
class ClusterEventEmitter extends events_1.default {
    constructor(identifier) {
        super();
        this.initialize();
        if (identifier) {
            this.id = identifier;
        }
        else {
            this.id = `id:${id(this)}`;
        }
    }
    static initializeMaster() {
        if (!cluster_1.default.isWorker && !ClusterEventEmitter.initialized) {
            cluster_1.default.on('message', async (worker, message) => {
                if (message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    Object.keys(cluster_1.default.workers).forEach(workerId => {
                        const remoteWorker = cluster_1.default.workers[workerId];
                        if (worker.id !== remoteWorker.id) {
                            remoteWorker.send(message);
                        }
                    });
                }
            });
            ClusterEventEmitter.initialized = true;
        }
    }
    initialize() {
        if (cluster_1.default.isWorker) {
            process.on('message', async (message) => {
                if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    if (message.id === this.id) {
                        this.handleInternalEmit(message.eventName, ...message.args);
                    }
                }
            });
        }
        else {
            ClusterEventEmitter.initializeMaster();
            cluster_1.default.on('message', async (worker, message) => {
                if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    if (message.id === this.id) {
                        this.handleInternalEmit(message.eventName, ...message.args);
                    }
                }
            });
        }
    }
    emit(eventName, ...args) {
        const message = {
            INTERNAL_MESSAGE_BROADCAST: exports.INTERNAL_MESSAGE_BROADCAST,
            id: this.id,
            eventName,
            args,
        };
        if (cluster_1.default.isWorker) {
            process.send(message);
        }
        else {
            Object.keys(cluster_1.default.workers).forEach(workerId => {
                cluster_1.default.workers?.[workerId]?.send?.(message);
            });
        }
        return super.emit(eventName, ...args);
    }
    handleInternalEmit(eventName, ...args) {
        return super.emit(eventName, ...args);
    }
}
exports.ClusterEventEmitter = ClusterEventEmitter;
ClusterEventEmitter.initialized = false;
//# sourceMappingURL=ClusterEventEmitter.js.map