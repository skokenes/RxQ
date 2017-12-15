const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var { concat, publish, publishReplay, refCount, shareReplay, switchMap, take, tap, withLatestFrom } = require("rxjs/operators");
var connectEngine = require("../../dist/connect/connectEngine");
var { openDoc } = require("../../dist/global");
var Handle = require("../../dist/_cjs/handle");

var { getField } = require("../../dist/doc");
var { getCardinal, getNxProperties } = require("../../dist/field");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);

var eng$ = container$.pipe(
    switchMap(() => {
        return connectEngine({
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

const field$ = app$.pipe(
    switchMap(handle => getField(handle, "species")),
    shareReplay(1)
);

function testField() {
    describe("Field Class", function () {
        before(function (done) {
            this.timeout(10000);
            container$.subscribe(() => done());
        });

        describe("getNxProperties", function() {

            const fldProps$ = field$.pipe(
                switchMap(h => getNxProperties(h)),
                shareReplay(1)
            );

            it("should return an object", function (done) {
                fldProps$.subscribe(props => {
                    expect(props).to.be.a("object");
                    done();
                });
            });
        });

        describe("getCardinal", function() {
            
            const fldCard$ = field$.pipe(
                switchMap(h => getCardinal(h)),
                shareReplay(1)
            );

            it("should equal 3 for the field 'species'", function(done) {
                fldCard$.subscribe(card => {
                    expect(card).to.equal(3);
                    done();
                });
            });
            
        });


        after(function () {
            container$
                .subscribe(
                container => container.kill((err, result) => {
                    container.remove();
                })
                );
        });
    });
}

module.exports = testField;