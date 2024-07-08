"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            cluster_1.default.on('message', (worker, message) => __awaiter(this, void 0, void 0, function* () {
                if (message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    Object.keys(cluster_1.default.workers).forEach(workerId => {
                        const remoteWorker = cluster_1.default.workers[workerId];
                        if (worker.id !== remoteWorker.id) {
                            remoteWorker.send(message);
                        }
                    });
                }
            }));
            ClusterEventEmitter.initialized = true;
        }
    }
    initialize() {
        if (cluster_1.default.isWorker) {
            process.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    if (message.id === this.id) {
                        this.handleInternalEmit(message.eventName, ...message.args);
                    }
                }
            }));
        }
        else {
            ClusterEventEmitter.initializeMaster();
            cluster_1.default.on('message', (worker, message) => __awaiter(this, void 0, void 0, function* () {
                if (typeof message === 'object' && !!message && message['INTERNAL_MESSAGE_BROADCAST'] === exports.INTERNAL_MESSAGE_BROADCAST) {
                    if (message.id === this.id) {
                        this.handleInternalEmit(message.eventName, ...message.args);
                    }
                }
            }));
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
                var _a, _b, _c;
                (_c = (_b = (_a = cluster_1.default.workers) === null || _a === void 0 ? void 0 : _a[workerId]) === null || _b === void 0 ? void 0 : _b.send) === null || _c === void 0 ? void 0 : _c.call(_b, message);
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