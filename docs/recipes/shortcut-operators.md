# Using the Shortcut Operators for Layout Streams
[Code Sandbox]()
```javascript
import { connectSession, qAsk, qAskReplay, qInvalidations } from "rxq";
import { OpenDoc, CreateSessionObject } from "rxq/Doc";
import { GetLayout } from "rxq/GenericObject"

const config = {
  host: "sense.axisgroup.com",
  isSecure: true,
  appname: "aae16724-dfd9-478b-b401-0d8038793adf"
};

const session = connectSession(config);
const global$ = session.global$;

const app$ = global$.pipe(
  qAskReplay(OpenDoc, config.appname)
);

const object$ = app$.pipe(
  qAskReplay(CreateSessionObject, {
    qInfo: {
      qType: "object"
    },
    foo: "bar"
  })
);

const layouts$ = object$.pipe(
  qInvalidations(true),
  qAsk(GetLayout)
);

layouts$.subscribe(console.log);

```