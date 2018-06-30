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
  take,
  takeUntil,
  withLatestFrom,
  tap
} = require("rxjs/operators");
var { Subject } = require("rxjs");

var { OpenDoc } = require("../../dist/global");
var { connectSession, suspendUntilCompleted } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");

var { GetAppProperties, SetAppProperties } = require("../../dist/doc");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

var eng$ = container$.pipe(
  switchMap(() => {
    return connectSession({
      host: "localhost",
      port: port,
      isSecure: false
    }).global$;
  }),
  publishReplay(1),
  refCount()
);

const app$ = eng$.pipe(
  switchMap(handle => handle.ask(OpenDoc, "iris.qvf")),
  publishReplay(1),
  refCount()
);

function testSuspend() {
  describe("Suspend", function() {
    before(function(done) {
      this.timeout(10000);
      app$.subscribe(() => done());
    });

    it("should withhold invalidations while suspended", function(done) {
      this.timeout(5000);

      // Trigger invalidation event by changing app events
      const setAppProps$ = app$.pipe(
        withLatestFrom(eng$, (appH, engH) => {
          engH.session.suspended$.next(true);
          return appH;
        }),
        switchMap(handle => handle.ask(GetAppProperties)),
        take(1),
        withLatestFrom(app$),
        switchMap(([props, handle]) => {
          const newProps = Object.assign({ test: "invalid" }, props);
          return handle.ask(SetAppProperties, newProps);
        }),
        publish()
      );

      const invalid$ = app$.pipe(switchMap(h => h.invalidated$));

      var streamKill$ = new Subject();

      invalid$.pipe(takeUntil(streamKill$)).subscribe(h => {
        done(new Error("Invalidation fired"));
      });

      setTimeout(() => {
        streamKill$.next(undefined);
        done();
      }, 2000);

      setAppProps$.connect();
    });

    it("should share buffered invalidations when unsuspended", function(done) {
      const invalid$ = app$.pipe(switchMap(h => h.invalidated$));

      invalid$.subscribe(() => {
        done();
      });

      eng$.subscribe(h => {
        h.session.suspended$.next(false);
      });
    });

    describe("suspendUntilCompleted operator", function() {
      it("should buffer invalidations until the Observable completes", function(done) {
        this.timeout(10000);

        var eng$ = container$.pipe(
          switchMap(() => {
            return connectSession({
              host: "localhost",
              port: port,
              isSecure: false,
              appname: "iris.qvf"
            }).global$;
          }),
          publishReplay(1),
          refCount()
        );

        const app$ = eng$.pipe(
          switchMap(handle => handle.ask(OpenDoc, "iris.qvf")),
          publishReplay(1),
          refCount()
        );

        // Trigger invalidation event by changing app events
        const setAppProps$ = app$.pipe(
          switchMap(handle => handle.ask(GetAppProperties)),
          take(1),
          withLatestFrom(app$),
          switchMap(([props, handle]) => {
            const newProps = Object.assign({ test: "invalid" }, props);
            return handle.ask(SetAppProperties, newProps);
          }),
          suspendUntilCompleted(eng$),
          publish()
        );

        const invalid$ = app$.pipe(switchMap(h => h.invalidated$));

        invalid$.subscribe(h => {
          done();
        });

        setAppProps$.connect();
      });
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

module.exports = testSuspend;
