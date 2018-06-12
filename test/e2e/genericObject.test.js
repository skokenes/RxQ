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
  tap,
  withLatestFrom
} = require("rxjs/operators");

var { OpenDoc } = require("../../dist/global");
var { connectSession } = require("../../dist");
var Handle = require("../../dist/_cjs/handle");

var { CreateSessionObject, GetObject } = require("../../dist/doc");
var {
  ApplyPatches,
  GetLayout,
  GetProperties,
  SetProperties
} = require("../../dist/genericObject");

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
  switchMap(handle => handle.ask(OpenDoc, "iris.qvf")),
  publishReplay(1),
  refCount()
);

const obj$ = app$.pipe(
  switchMap(handle =>
    handle.ask(CreateSessionObject, {
      qInfo: {
        qType: "test-e2e"
      },
      metric: {
        qValueExpression: "=1+1"
      },
      foo: "bar"
    })
  ),
  shareReplay(1)
);

function testGenericObject() {
  describe("GenericObject Class", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
    });

    describe("GetProperties", function() {
      const objProps$ = obj$.pipe(
        switchMap(h => h.ask(GetProperties)),
        shareReplay(1)
      );

      it("should return an object", function(done) {
        objProps$.subscribe(props => {
          expect(props).to.be.a("object");
          done();
        });
      });

      it("should have a property called 'qInfo' that is an object", function(done) {
        objProps$.subscribe(props => {
          expect(props.qInfo).to.be.a("object");
          done();
        });
      });

      it("should have a property called 'foo' that equals 'bar'", function(done) {
        objProps$.subscribe(props => {
          expect(props.foo).to.equal("bar");
          done();
        });
      });
    });

    describe("SetProperties", function() {
      const objProps$ = obj$.pipe(
        switchMap(h => h.ask(GetProperties)),
        shareReplay(1)
      );

      const updatedObjProps$ = obj$.pipe(
        switchMap(h =>
          h.ask(SetProperties, {
            qInfo: {
              qType: "test-e2e"
            },
            metric: {
              qValueExpression: "=1+1"
            },
            foo: "baz"
          })
        ),
        switchMap(() => objProps$)
      );

      it("should set the property 'foo' to equal 'baz'", function(done) {
        updatedObjProps$.subscribe(props => {
          expect(props.foo).to.equal("baz");
          done();
        });
      });
    });

    describe("GetLayout", function() {
      const layout$ = obj$.pipe(
        switchMap(h => h.ask(GetLayout)),
        shareReplay(1)
      );

      it("should return an object", function(done) {
        layout$.subscribe(layout => {
          expect(layout).to.be.a("object");
          done();
        });
      });

      it("should have a property 'metric' that equals 2", function(done) {
        layout$.subscribe(layout => {
          expect(layout.metric).to.equal(2);
          done();
        });
      });
    });

    describe("ApplyPatches", function() {
      const patches$ = obj$.pipe(
        switchMap(h =>
          h.ask(ApplyPatches, [
            {
              qOp: "add",
              qPath: "/patch",
              qValue: "1"
            }
          ])
        ),
        publish()
      );

      it("should cause an invalidation", function(done) {
        obj$
          .pipe(
            switchMap(h => h.invalidated$),
            take(1)
          )
          .subscribe(i => {
            done();
          });

        patches$.connect();
      });

      it("should create a new property called 'patch' with a value of 1", function(done) {
        obj$
          .pipe(
            switchMap(h => h.invalidated$),
            switchMap(h => h.ask(GetLayout)),
            take(1)
          )
          .subscribe(layout => {
            expect(layout.patch).to.equal(1);
            done();
          });

        patches$.connect();
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

module.exports = testGenericObject;
