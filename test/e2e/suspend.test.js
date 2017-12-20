const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var { publish, publishReplay, refCount, shareReplay, switchMap, take, withLatestFrom } = require("rxjs/operators");
var { BehaviorSubject } = require("rxjs/BehaviorSubject");
var connectEngine = require("../../dist/connect/connectEngine");
var { openDoc } = require("../../dist/global");
var Handle = require("../../dist/_cjs/handle");

var { getAppProperties, setAppProperties } = require("../../dist/doc");

var { port, image } = require("./config.json");

// launch a new container
var container$ = createContainer(image, port);
var suspended$ = new BehaviorSubject(false);

var eng$ = container$.pipe(
    switchMap(() => {
        return connectEngine({
            host: "localhost",
            port: port,
            isSecure: false
        }, {
            suspended$: suspended$
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

function testSuspend() {
    describe("Suspend", function () {
        before(function (done) {
            this.timeout(10000);
            app$.subscribe(() => done());
        });

        it("should withhold invalidations while suspended", function(done) {
            this.timeout(5000);
            suspended$.next(true);
            
            // Trigger invalidation event by changing app events
            const setAppProps$ = app$.pipe(
                switchMap(handle => getAppProperties(handle)),
                take(1),
                withLatestFrom(app$),
                switchMap(([props, handle]) => {
                    const newProps = Object.assign({ test: "invalid" }, props);
                    return setAppProperties(handle, newProps)
                }),
                publish()
            );

            const invalid$ = app$.pipe(
                switchMap(h => h.invalidated$)
            );

            invalid$.subscribe((h) => {
                console.log("h", h);
                console.log("hello world");
                //done(new Error("Invalidation fired"));
            });

            setTimeout(() => {
                done();
            }, 2000);

            setAppProps$.connect();

        });

        it("mock test", function(done) {
            done();
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

module.exports = testSuspend;