const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { publish, publishReplay, refCount, switchMap, withLatestFrom } = require("rxjs/operators");
var path = require("path");
var createContainer = require("../util/create-container");

var connectEngine = require("../../dist/connect/connectEngine");
var engineVersion = require("../../dist/global/engineVersion");

var port = "9079";
var image = "qlikea/engine:12.90.0";

// launch a new container
var container$ = createContainer(image, port);

var eng$ = container$.pipe(
    switchMap(()=>{
        return connectEngine({
            host: "localhost",
            port: port,
            isSecure: false
        });
    }),
    publishReplay(1),
    refCount()
);



describe("Global Class", function() {
    before(function(done) {
        this.timeout(10000);
        eng$.subscribe(()=>done());
    });

    describe("engineVersion", function() {

        const ev$ = eng$.pipe(
            switchMap(handle => engineVersion(handle)),
            publishReplay(1),
            refCount()
        );

        it("should return an object with prop 'qComponentVersion'", function(done) {
            ev$.subscribe(ev => {
                expect(ev).to.have.property("qComponentVersion");
                done();
            });
        });

        describe("qComponentVersion", function() {
            it("should be a string", function(done) {
                ev$.subscribe(ev => {
                    expect(ev.qComponentVersion).to.be.a("string");
                    done();
                });
            });
        });
        
    });
    
    after(function() {
        container$
            .subscribe(
                container => container.kill((err, result) => {
                    container.remove();
                })
            );
    });
});