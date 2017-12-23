const chai = require("chai");
const expect = chai.expect;

var { Observable } = require("rxjs/Observable");
var { shareReplay } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");

// RxQ
var connectSession = require("../../dist/connect/connectSession");
var global = require("../../dist/global");
var doc = require("../../dist/doc");
var field = require("../../dist/field");
var genericBookmark = require("../../dist/genericBookmark");
var genericDerivedFields = require("../../dist/genericDerivedFields");
var genericDimension = require("../../dist/genericDimension");
var genericMeasure = require("../../dist/genericMeasure");
var genericObject = require("../../dist/genericObject");
var genericVariable = require("../../dist/genericVariable");
var variable = require("../../dist/variable");


describe("Observable from Qix Calls", function() {

    // Mock Engine for Testing
    var {server, ws} = mockEngine();
    var config = {
        ws
    };
    var eng$ = connectSession(config).pipe(
        shareReplay(1)
    );

    describe("Global", function() {
        it("should have an engineVersion method", function() {
            expect(global).to.have.property("engineVersion");
        });

        describe("engineVersion", function() {
            
            it("should be a function", function() {
                expect(global.engineVersion).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(global.engineVersion(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        })
    });

    describe("Doc", function() {
        it("should have a clearAll method", function() {
            expect(doc).to.have.property("clearAll");
        });

        describe("clearAll", function() {
            
            it("should be a function", function() {
                expect(doc.clearAll).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(doc.clearAll(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        })
    });

    describe("Field", function() {
        it("should have a clear method", function() {
            expect(field).to.have.property("clear");
        });

        describe("clear", function() {
            
            it("should be a function", function() {
                expect(field.clear).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(field.clear(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericBookmark", function() {
        it("should have a getLayout method", function() {
            expect(genericBookmark).to.have.property("getLayout");
        });

        describe("getLayout", function() {
            
            it("should be a function", function() {
                expect(genericBookmark.getLayout).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericBookmark.getLayout(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericDerivedFields", function() {
        it("should have a getDerivedField method", function() {
            expect(genericDerivedFields).to.have.property("getDerivedField");
        });

        describe("getDerivedField", function() {
            
            it("should be a function", function() {
                expect(genericDerivedFields.getDerivedField).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericDerivedFields.getDerivedField(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericDimension", function() {
        it("should have a getProperties method", function() {
            expect(genericDimension).to.have.property("getProperties");
        });

        describe("getProperties", function() {
            
            it("should be a function", function() {
                expect(genericDimension.getProperties).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericDimension.getProperties(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericMeasure", function() {
        it("should have a getProperties method", function() {
            expect(genericMeasure).to.have.property("getProperties");
        });

        describe("getProperties", function() {
            
            it("should be a function", function() {
                expect(genericMeasure.getProperties).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericMeasure.getProperties(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericObject", function() {
        it("should have a getProperties method", function() {
            expect(genericObject).to.have.property("getProperties");
        });

        describe("getProperties", function() {
            
            it("should be a function", function() {
                expect(genericObject.getProperties).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericObject.getProperties(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("GenericVariable", function() {
        it("should have a getProperties method", function() {
            expect(genericVariable).to.have.property("getProperties");
        });

        describe("getProperties", function() {
            
            it("should be a function", function() {
                expect(genericVariable.getProperties).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(genericVariable.getProperties(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    describe("Variable", function() {
        it("should have a getNxProperties method", function() {
            expect(variable).to.have.property("getNxProperties");
        });

        describe("getNxProperties", function() {
            
            it("should be a function", function() {
                expect(variable.getNxProperties).to.be.a("function");
            });

            it("should return an Observable", function(done) {
                eng$.subscribe(
                    h => {
                        expect(variable.getNxProperties(h)).to.be.instanceof(Observable);
                        done();
                    }
                );
            });
        });
    });

    after(function() {
        server.stop();
    });

});

