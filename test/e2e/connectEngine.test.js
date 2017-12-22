const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var createContainer = require("../util/create-container");
var { publishReplay, refCount, switchMap } = require("rxjs/operators");
var connectEngine = require("../../dist/connect/connectEngine");

var Handle = require("../../dist/_cjs/handle");


var { port, image } = require("./config.json");

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

function testConnect() {
    describe("Connect to an engine", function() {
        before(function(done) {
            this.timeout(10000);
            container$.subscribe(()=>done());
        });
    
        it("should return a Handle", function(done) {
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
            
            eng$.subscribe(
                h => {
                    expect(h).to.be.instanceof(Handle);
                    done();
                }
            );
        });

        describe("Returned Handle", function() {
            it("should have qClass property of 'Global'", function(done) {
                eng$.subscribe(
                    h=> {
                        expect(h.qClass).to.equal("Global");
                        done();
                    }
                )
            })
        });
    
        after(function(done) {
            container$
                .subscribe(
                    container => container.kill((err, result) => {
                        container.remove();
                        done();
                    })
                );
        });
    })
}

module.exports = testConnect;
