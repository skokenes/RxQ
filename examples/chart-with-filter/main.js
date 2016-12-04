// Define a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false
};

// Observable that connects to the server
var eng$ = RxQ.connectEngine(config);

// Observable that opens the Executive Dashboard
var app$ = eng$
    .qOpenDoc("24703994-1515-4c2c-a785-d769a9226143")
    .publishReplay(1)
    .refCount();


// GenericObject Def 
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

var gO$ = app$
    .qCreateSessionObject(genObjProp);

var lbProp = {
    "qInfo": {
        "qType": "filter"
    },
    "qListObjectDef": {
        "qDef": {
            "qFieldDefs": [
                "Product Group"
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

var lb$ = app$
    .qCreateSessionObject(lbProp);

// Set up a chart
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
                    beginAtZero:true
                }
            }]
        }
    }
});

gO$
    .qLayouts()
    .subscribe(l=>{
        var data = l.response.qLayout.qHyperCube.qDataPages[0].qMatrix;
        myChart.data.labels = data.map(d=>d[0].qText);
        myChart.data.datasets[0].data = data.map(d=>d[1].qNum);
        myChart.update();
    });

lb$.subscribe(s=>console.log(s));