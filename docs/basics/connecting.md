# Connecting
In order to work with QAE, we need to establish a session with the Engine. This session is created by connecting to an Engine over a WebSocket.

RxQ provides a function called `connectSession` that will establish the session with the Engine. It returns a Session object that contains an Observable for the Global Handle, a `close` function for closing the session imperatively, and an Observable of notifications from the engine and RxQ (useful for debugging):

Session Object Properties
* **global$** - *(Observable)* An Observable for the Global Handle of the session
* **close** - *(Function)* A function that closes the WebSocket, ending the session
* **notifications$** - *(Observable) An Observable of notifications from the engine and RxQ

## Setup
The `connectSession` function takes in a configuration object that determines the session that is created. It can read the following properties:

* **host** - *(String)* Hostname of server
* **appname** - *(String)* Scoped connection to app.
* **isSecure** - *(Boolean)* If true uses wss and port 443, otherwise ws and port 80
* **port** - *(Integer)* Port of connection, defaults 443/80
* **prefix** - *(String)* Virtual Proxy, defaults to '/'
* **origin** - *(String)* Origin of requests, node only.
* **rejectUnauthorized** - *(Boolean)* False will ignore unauthorized self-signed certs.
* **headers** - *(Object)* HTTP headers
* **ticket** - *(String)* Qlik Sense ticket, consumes ticket on Connect()
* **key** - *(String)* Client Certificate key for QIX connections
* **cert** - *(String)* Client certificate for QIX connections
* **ca** - *(Array of String)* CA root certificates for QIX connections
* **identity** - *(String)* Session identity

## Usage
The following example shows how to use RxQ to connect to an Engine behind Qlik Sense Desktop:
```javascript
import { connectSession } from "rxq";

const session = connectSession({
    host: "localhost",
    port: 4848,
    isSecure: false
});

session.global$.subscribe((globalHandle) => {
    // Do something with the Global Handle
});
```