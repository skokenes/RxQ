# Notifications
RxQ provides an Observable `session.notifications$`. This Observable provides messages related to the inner workings of RxQ and the Engine session. It is especially useful for debugging purposes. It sends messages in the format:
```
{
  type: a string indicating the type of notification
  data: any data associated with the notification
}
```

The following type of notifications are emitted:
* `"traffic:sent"` – messages received in the WebSocket
* `"traffic:received"` – messages sent through the WebSocket
* `"traffic:change"` – lists of change handles sent by the Engine
* `"traffic:suspend-status"` – the suspense state of the session
* `"socket:close"` – the WebSocket event when the socket is closed