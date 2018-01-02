# Connect to an Engine
[Code Sandbox](https://codesandbox.io/embed/3v1883n5v1)

```javascript
// Import the connectSession function
import { connectSession } from "rxq/connect";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Call connectSession with the config to produce an Observable that
// will establish the session and return the Global handle
const sesh$ = connectSession(config);

// Console out the Global handle
sesh$.subscribe(console.log);
```