const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { Observable } = require("rxjs/Observable");
var { Subject } = require("rxjs/Subject");
var { pluck, take } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");

// RxQ
var connectEngine = require("../../dist/connect/connectEngine");
var Handle = require("../../dist/_cjs/handle");
var Session = require("../../dist/_cjs/session");


describe("connectEngine", function() {

    // Mock Engine for Testing
    var {server, ws} = mockEngine();
    var config = {
        ws
    };
    var eng$ = connectEngine(config);

    it("should be a function", function() {
        expect(connectEngine).to.be.a("function");
    });

    it("should return an Observable", function() {
        expect(eng$).to.be.instanceof(Observable);
    });

    describe("connectEngine response", function() {
        it("should return a Handle", function(done) {
            eng$.subscribe(
                h => {
                    expect(h).to.be.instanceof(Handle);
                    done();
                }
            )
        });

        it("the Handle should be -1", function(done) {
            eng$.subscribe(
                h => {
                    expect(h.handle).to.equal(-1);
                    done();
                }
            )
        });
    });

    after(function() {
        server.stop();
    });

});

