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

var { GetField } = require("../../dist/doc");
var { GetCardinal, GetNxProperties } = require("../../dist/field");

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

const field$ = app$.pipe(
  switchMap(handle => handle.ask(GetField, "species")),
  shareReplay(1)
);

function testField() {
  describe("Field Class", function() {
    before(function(done) {
      this.timeout(10000);
      container$.subscribe(() => done());
    });

    describe("GetNxProperties", function() {
      const fldProps$ = field$.pipe(
        switchMap(h => h.ask(GetNxProperties)),
        shareReplay(1)
      );

      it("should return an object", function(done) {
        fldProps$.subscribe(props => {
          expect(props).to.be.a("object");
          done();
        });
      });
    });

    describe("GetCardinal", function() {
      const fldCard$ = field$.pipe(
        switchMap(h => h.ask(GetCardinal)),
        shareReplay(1)
      );

      it("should equal 3 for the field 'species'", function(done) {
        fldCard$.subscribe(card => {
          expect(card).to.equal(3);
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

module.exports = testField;
