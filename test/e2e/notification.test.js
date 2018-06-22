const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var {
  publish,
  publishReplay,
  refCount,
  shareReplay,
  switchMap,
  map,
  tap,
  take,
  takeUntil,
  withLatestFrom,
  filter,
  reduce,
  skip
} = require("rxjs/operators");
var { Subject } = require("rxjs");

var { EngineVersion, OpenDoc } = require("../../dist/global");
var { connectSession } = require("../../dist");

var { GetAppProperties, SetAppProperties } = require("../../dist/doc");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

var session$ = container$.pipe(
  map(() =>
    connectSession({
      host: "localhost",
      port: port,
      isSecure: false
    })
  ),
  publishReplay(1),
  refCount()
);

const eng$ = session$.pipe(switchMap(session => session.global$));

const app$ = eng$.pipe(
  switchMap(handle => handle.ask(OpenDoc, "iris.qvf")),
  publishReplay(1),
  refCount()
);

const notifications$ = session$.pipe(
  switchMap(session => session.notifications$)
);

function testNotification() {
  describe("Notifications", function() {
    before(function(done) {
      this.timeout(10000);
      app$.subscribe(() => done());
    });

    it("should emit any traffic sent", function(done) {
      this.timeout(10000);
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

      const eng$ = session$.pipe(switchMap(session => session.global$));

      // after app opened, start listening on notifications
      session$
        .pipe(
          switchMap(session => session.notifications$),
          filter(f => f.type === "traffic:sent"),
          skip(1), // skip the opening message
          take(1)
        )
        .subscribe(req => {
          expect(req.data.method).to.equal("EngineVersion");
          done();
        });

      // After app has been opened, send a call
      eng$
        .pipe(
          switchMap(h => h.ask(EngineVersion)),
          publish()
        )
        .connect();
    });

    it("should emit any traffic received", function(done) {
      this.timeout(10000);
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

      const eng$ = session$.pipe(switchMap(session => session.global$));
      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      const msgId$ = notifications$.pipe(
        filter(
          f => (f.type === "traffic:sent") & (f.data.method === "EngineVersion")
        ),
        map(req => req.data.id)
      );

      notifications$
        .pipe(
          filter(f => f.type === "traffic:received"),
          withLatestFrom(msgId$),
          take(1)
        )
        .subscribe(([resp, reqId]) => {
          expect(resp.data.id).to.equal(reqId);
          done();
        });

      // After app has been opened, send a call
      eng$
        .pipe(
          switchMap(h => h.ask(EngineVersion)),
          publish()
        )
        .connect();
    });

    it("should emit the suspended status", function(done) {
      notifications$
        .pipe(
          filter(f => f.type === "traffic:suspend-status"),
          map(f => f.data),
          take(3),
          reduce((acc, curr) => [...acc, curr], [])
        )
        .subscribe(statusHistory => {
          expect(statusHistory[0]).to.equal(false);
          expect(statusHistory[1]).to.equal(true);
          expect(statusHistory[2]).to.equal(false);
          done();
        });

      app$.subscribe(h => {
        h.session.suspended$.next(true);
        h.session.suspended$.next(false);
      });
    });

    it("should emit the changes that the session passes down", function(done) {
      const setAppProps$ = app$.pipe(
        switchMap(handle => handle.ask(GetAppProperties)),
        take(1),
        withLatestFrom(app$),
        switchMap(([props, handle]) => {
          const newProps = Object.assign({ test: "invalid" }, props);
          return handle.ask(SetAppProperties, newProps);
        }),
        publish()
      );

      const appHandle$ = app$.pipe(map(h => h.handle));

      notifications$
        .pipe(
          filter(f => f.type === "traffic:change"),
          withLatestFrom(appHandle$)
        )
        .subscribe(([notification, handle]) => {
          const didHandleChange = notification.data.indexOf(handle) > -1;
          expect(didHandleChange).to.equal(true);
          done();
        });

      setAppProps$.connect();
    });

    it("should emit a close event when the session socket closes", function(done) {
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

      const eng$ = session$.pipe(switchMap(session => session.global$));
      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      const ws$ = eng$.pipe(switchMap(h => h.session.ws$));

      notifications$
        .pipe(
          filter(f => f.type === "socket:close"),
          map(m => m.data),
          take(1)
        )
        .subscribe(evt => {
          expect(evt.type).to.equal("close");
          done();
        });

      ws$.subscribe(ws => ws.close());
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

module.exports = testNotification;
