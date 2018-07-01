# Connect to an Engine
[Code Sandbox](https://codesandbox.io/embed/k2wz9px11v)

```javascript
// Import the connectSession function
import { connectSession } from "rxq";

// Define the configuration for your session
const config = {
  host: "sense.axisgroup.com",
  isSecure: true
};

// Call connectSession with the config to produce a Session object
const session = connectSession(config);

// Subscribe to the Global Handle Observable of the Session
session.global$.subscribe(console.log);
```