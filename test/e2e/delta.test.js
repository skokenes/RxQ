const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var {
  shareReplay,
  switchMap,
  filter,
  map,
  take,
  withLatestFrom
} = require("rxjs/operators");
var { combineLatest } = require("rxjs");

var { EngineVersion, OpenDoc, IsDesktopMode } = require("../../dist/global");
var { GetAppProperties, SetAppProperties } = require("../../dist/Doc");
var { connectSession } = require("../../dist");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

const session$ = container$.pipe(
  map(() => {
    return connectSession({
      host: "localhost",
      port: port,
      isSecure: false,
      delta: true
    });
  }),
  shareReplay(1)
);

const eng$ = session$.pipe(switchMap(session => session.global$));

const sessionSelectiveDelta$ = container$.pipe(
  map(() => {
    return connectSession({
      host: "localhost",
      port: port,
      isSecure: false,
      delta: {
        Global: ["IsDesktopMode"]
      }
    });
  }),
  shareReplay(1)
);

const engSelectiveDelta$ = sessionSelectiveDelta$.pipe(
  switchMap(session => session.global$)
);

function testDelta() {
  describe("Delta Mode", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
    });

    describe("Global Delta", function() {
      const ev$ = eng$.pipe(switchMap(handle => handle.ask(EngineVersion)));

      const notifications$ = session$.pipe(
        switchMap(session => session.notifications$)
      );

      describe("Engine Version", function() {
        it("should return an object with property qComponentVersion", done => {
          ev$.subscribe(ev => {
            expect(ev).to.have.property("qComponentVersion");
            done();
          });
        });

        it("should return the object when called a second time after receiving an empty patch from the engine", done => {
          const receivedPatch$ = notifications$.pipe(
            filter(notification => notification.type === "traffic:received"),
            map(notification => notification.data.result.qVersion),
            take(1)
          );

          combineLatest(ev$, receivedPatch$).subscribe(([ev, patch]) => {
            expect(ev).to.have.property("qComponentVersion");
            expect(patch.length).to.equal(0);
            done();
          });
        });
      });

      const doc$ = eng$.pipe(
        switchMap(handle => handle.ask(OpenDoc, "iris.qvf"))
      );

      describe("Getting a Doc Handle", function() {
        it("should return a handle with qClass 'Doc'", done => {
          doc$.subscribe(handle => {
            expect(handle.qClass).to.equal("Doc");
            done();
          });
        });

        it("should return the handle with qClass 'Doc' a second time", done => {
          doc$.subscribe(handle => {
            expect(handle.qClass).to.equal("Doc");
            done();
          });
        });
      });

      describe("Updating Props", function() {
        it("should return the app properties", done => {
          const appProps$ = doc$.pipe(
            switchMap(handle => handle.ask(GetAppProperties))
          );

          appProps$.subscribe(props => {
            expect(props.foo).to.be.undefined;
            done();
          });
        });

        it("should return updated app properties after a change is made", done => {
          const getAppProps$ = doc$.pipe(
            switchMap(handle => handle.ask(GetAppProperties))
          );

          getAppProps$
            .pipe(
              switchMap(props =>
                doc$.pipe(
                  switchMap(handle =>
                    handle.ask(SetAppProperties, { ...props, foo: "bar" })
                  )
                )
              ),
              switchMap(() => getAppProps$)
            )
            .subscribe(props => {
              expect(props.foo).to.equal("bar");
              done();
            });
        });
      });
    });

    describe("Selective Delta", function() {
      const selectiveNotifications$ = sessionSelectiveDelta$.pipe(
        switchMap(session => session.notifications$),
        filter(f => f.type === "traffic:received")
      );

      it("should not use delta for EngineVersion", done => {
        const ev$ = engSelectiveDelta$.pipe(
          switchMap(handle => handle.ask(EngineVersion))
        );

        ev$
          .pipe(
            withLatestFrom(selectiveNotifications$),
            take(1)
          )
          .subscribe(([response, notification]) => {
            expect(notification.data.delta).to.be.undefined;
            done();
          });
      });

      it("should use delta for IsDesktopMode", done => {
        const isDesktop$ = engSelectiveDelta$.pipe(
          switchMap(handle => handle.ask(IsDesktopMode))
        );

        isDesktop$
          .pipe(
            withLatestFrom(selectiveNotifications$),
            take(1)
          )
          .subscribe(([response, notification]) => {
            expect(notification.data.delta).to.equal(true);
            done();
          });
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

module.exports = testDelta;
