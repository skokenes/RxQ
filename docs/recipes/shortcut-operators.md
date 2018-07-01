# Using the Shortcut Operators for Layout Streams
[Code Sandbox](https://codesandbox.io/embed/71oj6rj10x)
```javascript
import { connectSession, qAsk, qAskReplay, invalidations } from "rxq";
import { OpenDoc } from "rxq/Global";
import { CreateSessionObject } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject";


const config = {
  host: "sense.axisgroup.com",
  isSecure: true,
  appname: "aae16724-dfd9-478b-b401-0d8038793adf"
};

const session = connectSession(config);
const global$ = session.global$;

const app$ = global$.pipe(qAskReplay(OpenDoc, config.appname));

const object$ = app$.pipe(
  qAskReplay(CreateSessionObject, {
    qInfo: {
      qType: "object"
    },
    foo: "bar"
  })
);

const layouts$ = object$.pipe(invalidations(true), qAsk(GetLayout));

layouts$.subscribe(console.log);

```