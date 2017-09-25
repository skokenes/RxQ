import { Observable } from "rxjs";

export default class Handle {
    constructor(session, handle, qclass) {

        // Reference to the websocket session
        this.session = session;
        
        // Reference to the observable of the handle for the current instance
        this.handle = handle;

        // The qClass type
        this.qClass = qclass;

    }
};