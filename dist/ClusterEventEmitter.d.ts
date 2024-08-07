import EventEmitter from 'events';
export declare const INTERNAL_MESSAGE_BROADCAST = "CLUSTER-EVENT-EMITTER-INTERNAL-MESSAGE-BROADCAST";
export declare class ClusterEventEmitter extends EventEmitter {
    protected id: string;
    protected static initialized: boolean;
    constructor(identifier?: string);
    static initializeMaster(): void;
    protected initialize(): void;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    protected handleInternalEmit(eventName: string | symbol, ...args: any[]): boolean;
}
