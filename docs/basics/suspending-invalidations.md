# Suspending Invalidations
The previous section detailed how to hook into Handle invalidation events to create automatic updating streams from Handles. It is common to scale this pattern up when building an interactive dashboard; the dashboard may have several charts on it, all of which are hooking into various layout streams that are auto-updating from invalidation events.

This pattern works great when simple operations like applying a selection cause invalidation. However, sometimes we want to make several API calls that alter the app before we update everything. This can cause havoc with our auto-updating layouts: they may try to update after every API call, rather than waiting for all the calls to be finished first.

RxQ provides an operator to help with this situation: `suspendUntilCompleted`. This operator can be applied to an Observable that completes. It takes an Observable for a Global Handle as an input. When the resulting Observable is subscribed to, it will pause the invalidation event streams in the session, and then execute the Observable stream. When the Observable completes, it will unpause the session and pass down any invalidation events that occured during the paused period.

An example of this can be seen in the [Batch Invalidations with Suspend]() example. 

## Going Lower Level
If you need to write more complex logic around suspension, you can hook into a semi-supported property under the hood in RxQ. Each Handle that is returned has a reference to the underlying session that the Handle comes from. This session has a BehaviorSubject on it that controls the suspended state of invalidations in the session. When the state is true, the invalidation streams are suspended. When the state is false, they are unsuspended. You can access this underlying Subject like so:
```javascript
const sesh$; // assume you have an Observable for a session

sesh$.subscribe((globalHandle) => {
    const suspended$ = globalHandle.session.suspended$;
    suspended$.next(true); // suspends the invalidation streams
});
```