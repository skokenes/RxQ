// Describe a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false
};

// Connect to global
var engine$ = RxQ.connectEngine(config);

// Get the doc list
var docList$ = engine$
    .qGetDocList()
    .map(function(m) {
        return m.response.qDocList
        .filter(function(f) { 
            return f.qMeta.stream.name==="Public"; // Filter apps to a specific stream
        });
    });

// Get the inputted text
var input = document.querySelector("#filter");

var filterInput = Rx.Observable.fromEvent(input, 'keyup')
    .map(function (e) {
        return e.target.value.toLowerCase();
    })
    .startWith("");

// Filter the doc list based on input text
var filterList = filterInput
    .combineLatest(docList$,function(t,dl) {
        return dl.filter(function(d) {
            return d.qDocName.toLowerCase().indexOf(t)>=0
        });
    });

// Render results to table
filterList.subscribe(function(dl) {
    renderDocList(dl);
});

function renderDocList(dl) {
    var baseUrl = (config.isSecure? "https://" : "http://") + config.host + "/sense/app/";
    var list = dl
        .map(function(m) {
            var docId = m.qDocId;
            var docName = m.qDocName;
            var spInd = docName.indexOf(" ");
            var abbrev = spInd >= 0 ? docName[0] + docName[spInd+1] : docName.slice(0,2);
            var str = "<a href='" + baseUrl + docId + "' target='_blank'><div class='doc-row'>";
            str += "<div class='doc-banner'>" + abbrev + "</div>"
            str += "<div class='doc-row-content'>";
            str += "<div class='doc-published'>" + formatDate(new Date(m.qMeta.publishTime)) + "</div>";
            str += "<div class='doc-title'>" + m.qDocName + "</div>";
            str += "<div class='doc-desc'>" + (m.qMeta.description != "" ? m.qMeta.description : "No description") + "</div>";
            str += "</div></div></a>";
            return str;
        })
        .join("");

    var docTable = document.querySelector("#doclist");
    docTable.innerHTML = list;
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