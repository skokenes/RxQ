var RxQ = require("../build/rxqap-engine");

// Describe a server
var config = {
    host: "qs-sk",
    isSecure: false,
    origin: "http://localhost"
};

// Connect to global
var global = RxQ.connectEngine(config);

// Get the doc list
var docList = global
    .mergeMap(function(g) { return g.GetDocList(); })
    .map(function(m) { return m.qDocList; });

// Print the doc list
docList.subscribe(s=>console.log(s));