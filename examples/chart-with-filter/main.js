// Define a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false
};

// Observable that connects to the server and returns QixGlobal
var eng$ = RxQ.connectEngine(config, "warm");

// Observable that opens the Executive Dashboard QixApp and shares it
var app$ = eng$
    .qOpenDoc("24703994-1515-4c2c-a785-d769a9226143");

// GenericObject definition for the chart
var genObjProp = {
    qInfo: {
        qType: "chart"
    },
    qHyperCubeDef: {
        "qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "Region"
                    ]
                },
                "qNullSuppression": true
            }
        ],
        "qMeasures": [
            {
                "qDef": {
                    "qDef": "sum([Sales Amount])"
                }
            }
        ],
        "qInitialDataFetch": [
            {
                "qLeft": 0,
                "qTop": 0,
                "qWidth": 2,
                "qHeight": 1000
            }
        ]
    }
};

// Create the generic object for the chart
var gO$ = app$
    .qCreateSessionObject(genObjProp);

// Initialize the chart with empty data
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Revenue ($)',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function(label){return  ' $' + Math.round(label).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
                }
            }]
        }
    }
});



// Get an observable stream of generic object layouts when the data changes, and update the chart with latest data
gO$
    .qLayouts()
    .subscribe(function(layout) {
        var data = layout.qHyperCube.qDataPages[0].qMatrix;
        myChart.data.labels = data.map(function(d) { return  d[0].qText; });
        myChart.data.datasets[0].data = data.map(function(d) { return d[1].qNum; });
        myChart.update();
    });

// Define a generic object for the listbox
var lbProp = {
    "qInfo": {
        "qType": "filter"
    },
    "qListObjectDef": {
        "qDef": {
            "qFieldDefs": [
                "Product Group Desc"
            ]
        },
        "qInitialDataFetch": [
            {
                "qLeft": 0,
                "qTop": 0,
                "qWidth": 1,
                "qHeight": 1000
            }
        ]
    }
};



// Create the listbox generic object
var lb$ = app$
    .qCreateSessionObject(lbProp);

// Get listbox layouts and update the listbox UI
var ul = document.getElementById("myListbox");
var lbsub = lb$
    .qLayouts()
    .subscribe(function(layout) {
        var data = layout.qListObject.qDataPages[0].qMatrix;
        ul.innerHTML = data
            .map(function(m) { return "<li class='" +  m[0].qState + "' data-qelemno=" + m[0].qElemNumber + ">" + m[0].qText + "</li>"; })
            .join("");
    });



// Create a stream of selection calls based on click events
var select$ = Rx.Observable.fromEvent(ul,"click")
    .withLatestFrom(lb$)
    .map(function(vals) {
        var evt = vals[0];
        var lbObj = vals[1];
        var elemNo = parseInt(evt.target.getAttribute("data-qelemno"));
        return lbObj.selectListObjectValues("/qListObjectDef",[elemNo],true)
            .publish();
    });

// When selection call is created, execute it
select$.subscribe(function(sel) {
    sel.connect();
});
