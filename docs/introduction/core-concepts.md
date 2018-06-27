# Core Concepts

RxQ provides functions that create Observables around Qlik Associative Engine (QAE) API calls. An API call to QAE happens asynchronously over a network, with some sort of value being returned later in time. These could be API calls like getting the engine version being used, opening a document, or calculating a value from a data model. 

The functions provided by RxQ are capable of making these API calls and returning the responses via Observables. A connection function is provided as well which will return an Observable representing the establishment of a session with QAE.

## QAE Background
To better understand how this works, a basic understanding of how Qlik's Engine API works is helpful. The Engine API uses the JSON-RPC 2.0 protocol via a WebSocket for bidirectional communication. Messages can be sent to the Engine to initiate API calls. Responses can be received from the Engine. The Engine can also push messages without a preceding request.

The Engine has various classes that can be interacted with via API calls. For example, the Global class represents a session with the Engine and has API methods for getting the engine version and opening a document. A Doc class exists for applications that are opened. This class has methods for application operations like clearing selections and getting app properties.

When making an API call to the Engine, the call must tell the Engine what method to use and on what class instance it should be executed on. This class instance is referred to as a Handle. For exmaple, when opening a document in QAE, the Engine will return an identifier for a Handle for the opened document. The developer can then make API calls on this document by referencing this Handle identifier.

For a more guided and in-depth review of these concepts, try this [Engine Tutorial](http://playground.qlik.com/learn/engine-tutorial/101.%20What%20is%20QIX%20and%20Why%20Should%20You%20Care.html).

## Using RxQ to Make API Calls
In RxQ, Handles are provided with an `ask` method that will accept a method name and parameters and execute an API call to the Engine. An Observable is returned that will provide the response and complete. Method names are provided as strings; for convenience, the list of possible methods in the Engine API schema are provided as enums. [Let's use the "EngineVersion" method of Qlik's "Global" class as an example.](http://help.qlik.com/en-US/sense-developer/November2017/Subsystems/EngineAPI/Content/Classes/GlobalClass/Global-class-EngineVersion-method.htm)

To make this call in RxQ, we can import the `EngineVersion` enum from RxQ and use it with a Global Handle's `ask` method. The `EngineVersion` method takes no parameters, so we don't need any other inputs. This call will return an Observable that can make the API call and return the response. We can subscribe to this Observable to execute it and get the response.
```javascript
import { EngineVersion } from "rxq/Global";

const version$ = myGlobalHandle.ask(EngineVersion);

version$.subscribe((version) => {
    console.log(`The version of the Engine is ${version}`);
});
```

If a method takes parameters, we just add them as arguments to our function call. For example, to open a document called "Sales.qvf", we would write:
```javascript
const app$ = myGlobalHandle.ask(OpenDoc, "Sales.qvf");
```

**This is essentially the core of RxQ: run a function that creates an Observable for a Qlik Engine API call response.**

 You may be wondering how to get Handles from the Engine to feed into these functions. This process is detailed in the [Making API Calls](../basics/making-api-calls.md) section.