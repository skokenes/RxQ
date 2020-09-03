import { of, fromEvent, Subject, throwError, Observable } from "rxjs";
import { mapTo, takeUntil, map, take, filter } from "rxjs/operators";

type SessionOptions = {
    delta: boolean
}

type SessionConnection = string | WebSocket;

interface Session {
    ws: WebSocket;
    ask: (handle: string | number, method: string, params: any[]) => Observable<any>
}

type Request = {
    handle: number | string,
    method: string,
    params: any[],
    id: number,
    jsonrpc: "2.0"
}

export function createSession(connection: SessionConnection, options: SessionOptions): Session {

    // Create WebSocket connection to QIX Engine
    const ws = typeof connection === "string" ? new WebSocket(connection) : connection;

    const openedWS = ws.readyState === 1 ? of(ws) : fromEvent(ws, "open").pipe(
        mapTo(ws)
    );

    const wsClosed = fromEvent(ws, "close");

    // Pass requests to the QIX Engine
    const requestInput = new Subject<Request>();
    const requests = requestInput.asObservable();
    const requestSubscription = requests
    .pipe(takeUntil(wsClosed)).subscribe(
        request => {
            ws.send(JSON.stringify(request))
        }
    )

    const responses = fromEvent<MessageEvent>(ws, "message").pipe(
        map(evt => JSON.parse(evt.data))
    );

    // Request number generator
    const requestNumbers = integerGenerator();
    const ask = (handle: string | number, method: string, params: any[] = []) => {
        const requestId = requestNumbers.next().value;
        const request: Request = {
            jsonrpc: "2.0",
            id: requestId,
            handle,
            method,
            params
        }
        
        if(!requestInput.isStopped) {
            requestInput.next(request);
            return responses.pipe(
                filter(resp => resp.id === requestId),
                take(1)
            )
        }
        else return throwError(new Error("The request input is stopped and cannot receive anymore requests"));

    };

    const close = () => {};

    return {
        ws,
        ask
    }
}

const integerGenerator = function*() {
    let i = 0;
    while (true) {
        yield i++
    }
}