////////////////////////////
// UI
////////////////////////////

// Search input
var input = document.querySelector("#app-search");

// Curried function for filtering a doc list by name
var filterDL = curry(function(str,dl) {
    return dl.filter(function(d) {
        return d.qDocName.toLowerCase().indexOf(str) >=0;
    });
});

// Producer of filter function based on input text
var filterFn$ = Rx.Observable.fromEvent(input, 'keyup')
    .map(function (e) {
        return e.target.value.toLowerCase();
    })
    .startWith("")
    .map(function(str) {
        return filterDL(str);
    });

// App sort direction button
var sortDir = document.querySelector("#sort-dir");

var sortDir$ = Rx.Observable.fromEvent(sortDir,"click")
    .scan(function(acc,curr) {
        return acc*-1;
    },1)
    .startWith(1);

// App sort criteria dropdown
var select = document.querySelector("#select-sort select");

var select$ = Rx.Observable.fromEvent(select,"change")
    .map(function(e) {
        return e.target.value;
    })
    .startWith("qDocName");

// Curried function for sorting app by a property
var sortFn = curry(function(accessor,dir,dl) {
    return dl.sort(function(a,b) {
        var ptA = access(accessor,a);
        var ptB = access(accessor,b);
        var sig = ptA > ptB ? 1 : -1;
        return dir*sig;
    });
});

// Producer of sort function based on a property and direction
var sortFn$ = select$
    .map(function(accessor) {
        return sortFn(accessor);
    })
    .combineLatest(sortDir$,function(fn,dir) {
        return fn(dir);
    });

// Server list
var serverItems = document.querySelectorAll(".server-item");

// Server list click event
var serverActiveItem$ = Rx.Observable.fromEvent(serverItems,"click")
    .map(function(m) {
        return m.currentTarget;
    });

// Producer of server filter function
var serverFilterFn$ = serverActiveItem$
    .map(function(m) {
        return m.getAttribute("alias");
    })
    .startWith("")
    .distinctUntilChanged()
    .map(function(m) {
        return function(dl) {
            return dl.filter(function(f) {
                return m === "" ? true : f.server === m;
            });
        };
    });





////////////////////////////
// DATA FLOWS
////////////////////////////

// Define the servers
var configs = [
    {
        host: "sense.axisgroup.com",
        isSecure: false,
        alias: "Axis Demo",
        color: "rgb(158,96,213)"
    },
    {
        host: "pe.qlik.com",
        isSecure: false,
        alias: "Qlik Demo",
        color: "#4BD6B8"
    }
];

// Connect to the engines
var engines$ = Rx.Observable.from(configs)
    .map(function(c) {
        return RxQ.connectEngine(c)
    })
    .publishReplay()
    .refCount();

var allDocs$ = engines$
    .map(function(o) {
        return o.getDocList();
    })
    .combineAll()
    .map(function(dlList) {
        return dlList.reduce(function(acc,curr) {
            var server = curr.source.session.config.alias;
            return acc.concat(curr.response.qDocList.map(function(doc) {
                doc.server = server;
                return doc;
            }));
        },[]);
    })
    .publishLast()
    .refCount();

var allStreams$ = engines$
    .map(function(o) {
        return o.getStreamList();
    })
    .combineAll()
    .map(function(streamList) {
        return streamList.reduce(function(acc,curr) {
            var server = curr.source.session.config.alias;
            return acc.concat(curr.response.qStreamList.map(function(stream) {
                stream.server = server;
                return stream;
            }));
        },[]);
    })
    .publishLast()
    .refCount();

// Get the doc list for the servers
var docList$ = allDocs$
    // filter the list based on search terms
    .combineLatest(filterFn$,function(dl,filFn) {
        return filFn(dl);
    })
    // sort the list
    .combineLatest(sortFn$,function(dl,sortFn) {
        return sortFn(dl)
    });

// Get the stream list for the servers and add the docs
var streamList$ = allStreams$
    // map docs to the streams
    .combineLatest(docList$,function(sl,dl) {
        return sl.map(function(s) {
            s.docs = dl.filter(function(d) {return s.qId === d.qMeta.stream.id;});
            return s;
        });
    });


var renderList$ = streamList$
    // filter streams with no docs
    .map(function(m) {
        return m.filter(function(f) { return f.docs.length > 0; });
    })
    // filter based on server selected
    .combineLatest(serverFilterFn$,function(sl,filFn) {
        return filFn(sl);
    });
    

////////////////////////////
// SIDE EFFECTS
////////////////////////////

// Flip direction of sort indicator
sortDir$.subscribe(function(s) {
    var img = sortDir.querySelector("img");
    if(s===-1) {
        img.classList.add("flipped");
    }
    else {
        img.classList.remove("flipped");
    }
});

// Style the server selection list
serverActiveItem$.subscribe(function(node) {
    serverItems.forEach(function(e) {
        e.classList.remove("active");
    });
    node.classList.add("active");

    document.querySelector("#server-title").innerHTML = node.querySelector("span").innerHTML;
});

// Update the server app cts
streamList$.subscribe(function(sL) {
    serverItems.forEach(function(node) {
        var server = node.getAttribute("alias");
        var ct = sL.filter(function(f) {return server === "" ? true : f.server === server})
        .reduce(function(acc,curr) {
            return acc + curr.docs.length;
        },0);

        node.querySelector(".app-ct").innerHTML = ct;
    });
});

// Render the streams
renderList$.subscribe(function(rL) {
    var html = rL.reduce(function(acc,curr) {
        var server = configs.filter(function(c) { return c.alias === curr.server})[0];
        var color = server.color;
        var baseUrl = (server.isSecure ? "https" : "http") + "://" + server.host + (server.prefix ? "/" + server.prefix : "") + "/sense/app/";
        var row = "";
        row += "<div class='stream-row'>";
            row += "<div class='stream-title-bar'>";
                row += "<div class='stream-title'>" + curr.qName.toUpperCase() + "</div>";
                row += "<div class='server-banner' style='background-color:" + color + "'>" + curr.server.toUpperCase() + "</div>";
            row +="</div>"
            row += curr.docs.reduce(function(acc,curr) {
                var doc = "<a href='" + baseUrl + curr.qDocId + "' target='blank'>";
                doc += "<div class='doc-tile'>";
                    doc += "<div class='doc-tnail'><img src='resources/chalkboard.svg'/><div class='doc-tnail-anchor' style='background-color: " + color + "'><div class='doc-desc'>" +(curr.qMeta.description === "" ? "No description" : curr.qMeta.description) + "</div></div></div>";
                    doc += "<div class='doc-title'>" + curr.qDocName + "</div>";
                    doc += "<div class='doc-publish-date'>Published " + formatDate(new Date(curr.qMeta.publishTime)) + "</div>";
                doc += "</div></a>";
                return acc.concat(doc);
            },"");
        row += "</div>"
        return acc.concat(row);
    },"");

    document.querySelector("#streams").innerHTML = html;
});




////////////////////////////
// HELPER FUNCTIONS
////////////////////////////

// Curry functions
function curry(fn) {
    var args = [].slice.call(arguments, 1);

    function curried(fnArgs) {
        if (fnArgs.length >= fn.length) {
            return fn.apply(null, fnArgs);
        }

        return function () {
            return curried(fnArgs.concat([].slice.apply(arguments)));
        };
    }

    return curried(args);
}

// Get nested property from object based on period delimited accessor
function access(accessor,obj) {
    var accessors = accessor.split(".");
    var value = accessors.reduce(function(acc,curr) {
        return acc[curr];
    },obj);
    if(typeof value === "string") value = value.toLowerCase();
    return value;
}

// Format dates to Month Day, Year
function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}