const chai = require("chai");
const spies = require("chai-spies");
chai.use(require("chai-generator"));
chai.use(spies);
const expect = chai.expect;

var createContainer = require("../util/create-container");
var {
  shareReplay,
  map,
  switchMap,
  tap,
  publish,
  take
} = require("rxjs/operators");
const { of } = require("rxjs");

var { OpenDoc } = require("../../dist/global");
var { CreateSessionObject, GetAppProperties } = require("../../dist/doc");
var { SetProperties } = require("../../dist/GenericObject");
var { connectSession, qAsk, qAskReplay, invalidations } = require("../../dist");

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
  shareReplay(1)
);

var eng$ = session$.pipe(switchMap(session => session.global$));

const app$ = eng$.pipe(
  switchMap(handle => handle.ask(OpenDoc, "iris.qvf")),
  shareReplay(1)
);

function testUtilityOperators() {
  describe("Utility Operators", function() {
    before(function(done) {
      this.timeout(10000);
      app$.subscribe(() => done());
    });

    describe("qAsk", () => {
      it("should make an Engine API call and deliver the response", done => {
        app$.pipe(qAsk(GetAppProperties)).subscribe(props => {
          expect(props.qTitle).to.equal("Iris");
          done();
        });
      });

      it("should throw an error when called on an Observable that doesn't emit a Handle", done => {
        of(null)
          .pipe(qAsk(GetAppProperties))
          .subscribe({
            error: err => {
              done();
            }
          });
      });
    });

    describe("qAskReplay", () => {
      it("should make an Engine API call and share the response across subscribers", done => {
        var count = 0;

        const appProps$ = app$.pipe(
          tap(() => count++),
          qAskReplay(GetAppProperties)
        );

        appProps$.subscribe(props => {
          appProps$.subscribe(props => {
            expect(props.qTitle).to.equal("Iris");
            expect(count).to.equal(1);
            done();
          });
        });
      });

      it("should throw an error when called on an Observable that doesn't emit a Handle", done => {
        of(null)
          .pipe(qAskReplay(GetAppProperties))
          .subscribe({
            error: err => {
              done();
            }
          });
      });
    });

    describe("invalidations", () => {
      it("should not start with an invalidation by default", done => {
        const obj$ = app$.pipe(
          qAskReplay(CreateSessionObject, {
            qInfo: { qType: "test" },
            foo: "bar"
          })
        );

        const testFn = chai.spy();
        const invalidations$ = obj$.pipe(
          invalidations(),
          tap(testFn),
          publish()
        );

        invalidations$.connect();

        // update app props
        const setProps$ = obj$.pipe(
          qAsk(SetProperties, {
            qInfo: { qType: "test" },
            foo: "baz"
          }),
          take(1)
        );

        setProps$.subscribe({
          complete: () => {
            expect(testFn).to.have.been.called.once;
            done();
          }
        });
      });

      it("should start with an invalidation when passed true", done => {
        const obj$ = app$.pipe(
          qAskReplay(CreateSessionObject, {
            qInfo: { qType: "test" },
            foo: "bar"
          })
        );

        const testFn = chai.spy();
        const invalidations$ = obj$.pipe(
          invalidations(true),
          tap(testFn),
          publish()
        );

        invalidations$.connect();

        // update app props
        const setProps$ = obj$.pipe(
          qAsk(SetProperties, {
            qInfo: { qType: "test" },
            foo: "baz"
          }),
          take(1)
        );

        setProps$.subscribe({
          complete: () => {
            expect(testFn).to.have.been.called.twice;
            done();
          }
        });
      });

      it("should throw an error when called on an Observable that doesn't emit a Handle", done => {
        of(null)
          .pipe(invalidations())
          .subscribe({
            error: err => {
              done();
            }
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

module.exports = testUtilityOperators;
