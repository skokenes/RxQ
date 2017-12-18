# Connect to an Engine
```javascript
// Import the connectEngine function
import connectEngine from "rxq/connect/connectEngine";

// Define the configuration for your engine connection
const config = {
    host: "localhost",
    port: 9076,
    isSecure: false
};

// Call connectEngine with the config to produce an Observable for the Global handle
const eng$ = connectEngine(config);

// Console out the Global handle
eng$.subscribe(console.log);
```