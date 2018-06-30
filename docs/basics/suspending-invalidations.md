# Suspending Invalidations
The previous section detailed how to hook into Handle invalidation events to create automatic updating streams from Handles. It is common to scale this pattern up when building an interactive dashboard; the dashboard may have several charts on it, all of which are hooking into various layout streams that are auto-updating from invalidation events.

This pattern works great when simple operations like applying a selection cause invalidation. However, sometimes we want to make several API calls that alter the app before we update everything. This can cause havoc with our auto-updating layouts: they may try to update after every API call, rather than waiting for all the calls to be finished first. RxQ can handle this scenario in two ways.

## Manually changing suspense status
The `session` object returned by RxQ contains methods `session.suspend()` and `session.unsuspend()` that can be called to manually change the suspense status of the session.

## Using the `suspendUntilCompleted` operator
RxQ provides an operator called `suspendUntilCompleted` that can handle the suspense side-effects for you. This operator can be applied to an Observable that completes. It takes a session as an input. When the resulting Observable is subscribed to, it will pause the invalidation event streams in the session, and then execute the Observable stream. When the Observable completes, it will unpause the session and pass down any invalidation events that occured during the paused period.

An example of this can be seen in the [Batch Invalidations with Suspend](../recipes/batch-invalidations.html) example. 