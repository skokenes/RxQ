# Delta Mode

## What is Delta Mode
Qlik's Engine API has the ability to provide responses in what is known as "delta mode". In delta mode, rather than sending the entire API response back for a call, the Engine will send a list of changes to apply from a previous API call instead. For example, imagine you have received the layout of an app from the Engine in a JSON structure that includes properties like `lastReloadTime`:
```json
{
  qId: "app-id",
  title: "My App",
  // ...other props
  lastReloadTime: "date"
}
```

Now imagine the app is reloaded. This app layout is no longer valid, so you make an API request for another layout. Normally, you would receive the entire object back again, which would included an updated reload time:
```json
{
  qId: "app-id",
  title: "My App",
  //...other props
  lastReloadTime: "new date"
}
```

In this scenario, only one property actually changes from the first layout call to the second: `lastReloadTime`. Therefore, it's redundant to send all of the other info again. Enter delta mode.

In delta mode, the Engine only sends instructions back on how to update the previously seen value. In this case, it would send a message indicating that the "lastReloadTime" property has been updated, along with its new value. These instructions are similar to the JSON-Patch specification.

The benefit of using delta mode is that less information will be sent over the network as an app is used, leading to faster API calls. On the other hand, delta mode requires more work on the client to process the changes and keep track of previous values. Realistically, this is a trade-off you will probably not notice in your typical application built with the Engine.

## Usage in RxQ
By default, delta mode is not used in RxQ. The library provides two mechanisms for opting into delta mode:
1. **Session-level**: Delta mode can be enabled across the session for every API call. This is done by setting the session config `delta` property to true:
```javascript
const session = connectSession({
    host: "localhost",
    port: 9076,
    delta: true
})
```

2. **Method-level**: Rather than opting the entire session into delta mode, you can also selectively pick which methods that you want to leverage delta mode by providing an object with the Qlik class as a key and the method names that should use delta mode. For example, to enable delta mode for GenericObject `GetLayout` and `GetProperties` calls, you could configure your session like so:
```javascript
const session = connectSession({
    host: "localhost",
    port: 9076,
    delta: {
      GenericObject: ["GetLayout", "GetProperties"]
    }
})
```