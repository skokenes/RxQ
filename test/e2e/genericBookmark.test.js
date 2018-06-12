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

var { CreateBookmark } = require("../../dist/doc");
var { GetProperties, SetProperties } = require("../../dist/genericBookmark");

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

const bkmk$ = app$.pipe(
  switchMap(handle =>
    handle.ask(CreateBookmark, {
      qInfo: { qType: "test-bkmk" },
      foo: "bar"
    })
  ),
  shareReplay(1)
);

function testGenericBookmark() {
  describe("GenericBookmark Class", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
    });

    describe("GetProperties", function() {
      const props$ = bkmk$.pipe(
        switchMap(h => h.ask(GetProperties)),
        shareReplay(1)
      );

      it("should return an object", done => {
        props$.subscribe(props => {
          expect(props).to.be.a("object");
          done();
        });
      });

      it("should return a property 'foo' with value 'bar'", done => {
        props$.subscribe(props => {
          expect(props.foo).to.equal("bar");
          done();
        });
      });
    });

    describe("SetProperties", function() {
      const setProps$ = bkmk$.pipe(
        switchMap(h =>
          h.ask(SetProperties, {
            qInfo: {
              qType: "test-bkmk"
            },
            foo: "baz"
          })
        ),
        publish()
      );

      it("should cause an invalidation", done => {
        bkmk$
          .pipe(
            switchMap(h => h.invalidated$),
            take(1)
          )
          .subscribe(i => {
            done();
          });

        setProps$.connect();
      });

      it("should change the 'foo' property to 'baz'", done => {
        bkmk$
          .pipe(
            switchMap(h => h.invalidated$),
            switchMap(h => h.ask(GetProperties))
          )
          .subscribe(props => {
            expect(props.foo).to.equal("baz");
            done();
          });

        setProps$.connect();
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

module.exports = testGenericBookmark;
