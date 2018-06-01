const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var {
  publishReplay,
  refCount,
  shareReplay,
  switchMap,
  take,
  withLatestFrom
} = require("rxjs/operators");

var { openDoc } = require("../../dist/global");
var { connectSession } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");

var {
  createObject,
  createSessionObject,
  getAppProperties,
  getObject,
  setAppProperties
} = require("../../dist/doc");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

var eng$ = container$.pipe(
  switchMap(() => {
    return connectSession({
      host: "localhost",
      port: port,
      isSecure: false
    });
  }),
  publishReplay(1),
  refCount()
);

const app$ = eng$.pipe(
  switchMap(handle => openDoc(handle, "iris.qvf")),
  publishReplay(1),
  refCount()
);

function testDoc() {
  describe("Doc Class", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
    });

    describe("getAppProperties", function() {
      const appProps$ = app$.pipe(
        switchMap(handle => getAppProperties(handle)),
        publishReplay(1),
        refCount()
      );

      it("should return an object", function(done) {
        appProps$.subscribe(props => {
          expect(props).to.be.a("object");
          done();
        });
      });

      it("should have a property 'qTitle' that equals 'Iris'", function(done) {
        appProps$.subscribe(props => {
          expect(props.qTitle).to.equal("Iris");
          done();
        });
      });
    });

    describe("setAppProperties", function() {
      const appProps$ = app$.pipe(
        switchMap(handle => getAppProperties(handle)),
        publishReplay(1),
        refCount()
      );

      const updatedAppProps$ = appProps$.pipe(
        take(1),
        withLatestFrom(app$),
        switchMap(([props, handle]) => {
          const newProps = Object.assign({ foo: "bar" }, props);
          return setAppProperties(handle, newProps);
        }),
        switchMap(() =>
          app$.pipe(
            switchMap(handle => getAppProperties(handle)),
            publishReplay(1),
            refCount()
          )
        )
      );

      it("should add a property 'foo' that equals 'bar'", function(done) {
        updatedAppProps$.subscribe(props => {
          expect(props.foo).to.equal("bar");
          done();
        });
      });
    });

    describe("getObject", function() {
      const obj$ = app$.pipe(
        switchMap(h => getObject(h, "fpZbty")),
        shareReplay(1)
      );

      it("should return a Handle of type 'GenericObject'", function(done) {
        obj$.subscribe(h => {
          expect(h).to.be.instanceof(Handle);
          expect(h.qClass).to.equal("GenericObject");
          done();
        });
      });
    });

    describe("createSessionObject", function() {
      const obj$ = app$.pipe(
        switchMap(h =>
          createSessionObject(h, {
            qInfo: {
              qType: "e2e-test"
            }
          })
        ),
        shareReplay(1)
      );

      it("should return a Handle of type 'GenericObject'", function(done) {
        obj$.subscribe(h => {
          expect(h).to.be.instanceof(Handle);
          expect(h.qClass).to.equal("GenericObject");
          done();
        });
      });
    });

    describe("createObject", function() {
      const obj$ = app$.pipe(
        switchMap(h =>
          createObject(h, {
            qInfo: {
              qType: "e2e-test"
            }
          })
        ),
        shareReplay(1)
      );

      it("should return a Handle of type 'GenericObject'", function(done) {
        obj$.subscribe(h => {
          expect(h).to.be.instanceof(Handle);
          expect(h.qClass).to.equal("GenericObject");
          done();
        });
      });
    });

    describe("invalidation", function() {
      it("should receive an invalidation event when properties change", function(done) {
        // Listen for invalidation event
        app$.subscribe(h => {
          h.invalidated$.pipe(take(1)).subscribe(i => {
            done();
          });
        });

        // Trigger invalidation event by changing app events
        const appProps$ = app$.pipe(
          switchMap(handle => getAppProperties(handle)),
          publishReplay(1),
          refCount()
        );

        appProps$
          .pipe(
            take(1),
            withLatestFrom(app$),
            switchMap(([props, handle]) => {
              const newProps = Object.assign({ test: "invalid" }, props);
              return setAppProperties(handle, newProps);
            })
          )
          .subscribe();
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

module.exports = testDoc;
