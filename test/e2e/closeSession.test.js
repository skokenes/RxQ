const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var {
  publishReplay,
  refCount,
  switchMap,
  map,
  filter,
  shareReplay
} = require("rxjs/operators");
var { connectSession } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");
var { OpenDoc } = require("../../dist/_cjs/Global");

var { Observable } = require("rxjs");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

var session$ = container$.pipe(
  map(() => {
    return connectSession({
      host: "localhost",
      port: port,
      isSecure: false
    });
  }),
  publishReplay(1),
  refCount()
);

const eng$ = session$.pipe(
  switchMap(session => session.global$),
  shareReplay(1)
);
const notifications$ = session$.pipe(
  switchMap(session => session.notifications$)
);
const ws$ = eng$.pipe(switchMap(eng => eng.session.ws$));
const socketClosed$ = ws$.pipe(
  switchMap(ws =>
    Observable.create(observer => {
      ws.addEventListener("close", evt => {
        observer.next(evt);
      });
    })
  )
);

const app$ = eng$.pipe(
  switchMap(h => h.ask(OpenDoc, "iris.qvf")),
  publishReplay(1)
);

function testClose() {
  describe("Close", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
      // connect the app
      app$.connect();
    });

    it("should close the WebSocket when the close function is called", function(done) {
      socketClosed$.subscribe(closedEvt => {
        done();
      });

      // Get the engine handle and then close
      app$.pipe(switchMap(() => session$)).subscribe(session => {
        session.close();
      });
    });

    it("should complete invalidation Observables when the close function is called", function(done) {
      app$.pipe(switchMap(handle => handle.invalidated$)).subscribe({
        complete: () => done()
      });
    });

    it("should trigger the 'socket:close' notification", done => {
      const session$ = container$.pipe(
        map(() => {
          return connectSession({
            host: "localhost",
            port: port,
            isSecure: false
          });
        }),
        publishReplay(1),
        refCount()
      );

      const eng$ = session$.pipe(
        switchMap(session => session.global$),
        shareReplay(1)
      );
      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      notifications$
        .pipe(filter(f => f.type === "socket:close"))
        .subscribe(() => done());

      eng$
        .pipe(switchMap(() => session$))
        .subscribe(session => session.close());
    });

    it("should complete the responses stream", done => {
      const session$ = container$.pipe(
        map(() => {
          return connectSession({
            host: "localhost",
            port: port,
            isSecure: false
          });
        }),
        publishReplay(1),
        refCount()
      );

      const eng$ = session$.pipe(
        switchMap(session => session.global$),
        shareReplay(1)
      );
      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      eng$.pipe(switchMap(handle => handle.session.finalResponse$)).subscribe({
        complete: () => done()
      });

      eng$
        .pipe(switchMap(() => session$))
        .subscribe(session => session.close());
    });

    it("should complete the requests stream", done => {
      const session$ = container$.pipe(
        map(() => {
          return connectSession({
            host: "localhost",
            port: port,
            isSecure: false
          });
        }),
        publishReplay(1),
        refCount()
      );

      const eng$ = session$.pipe(
        switchMap(session => session.global$),
        shareReplay(1)
      );
      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      eng$.pipe(switchMap(handle => handle.session.requests$)).subscribe({
        complete: () => done()
      });

      eng$
        .pipe(switchMap(() => session$))
        .subscribe(session => session.close());
    });

    after(function(done) {
      container$.subscribe(container =>
        container.kill((err, result) => {
          container.remove();
          done();
        })
      );
    });
  });
}

module.exports = testClose;
