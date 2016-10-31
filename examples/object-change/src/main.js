// Describe a server
var config = {
    host: "sense.axisgroup.com",
    isSecure: false,
    appname: "b3b7fc9e-e7d6-4da5-b066-e4219d881ab8"
};

// Connect to global
var engine$ = RxQ.connectEngine(config).share();


// Open an app and keep it hot
var app$ = engine$
    .openDoc(config.appname)
    .publishLast()
    .refCount();

// Create a KPI object and keep it hot
var kpi$ = app$
    .createSessionObject({
        qInfo: {
            qType: "kpi"
        },
        myKPI: {
            "qStringExpression": "=money(sum(Expression1))"
        }
    })
    .publishLast()
    .refCount();

////////////////////////////////////////////
// Long form getting layout on change //////
////////////////////////////////////////////

// Get notified of KPI changes
var kpiInvalidated$ = kpi$
    .invalidated();
    // -> will fire the KPI object whenever it is invalidated

var kpiLayoutLong$ = kpiInvalidated$
    .getLayout();
    // -> subscribing to kpiLayoutLong$ will provide a layout whenever the object is invalidated

///////////////////////////////////////////////
// Shortcut for getting layout on change //////
///////////////////////////////////////////////

// Get new layouts whenever the object is invalidated
var kpiLayout$ = kpi$
    .layouts();
    // -> delivers the layout whenever the object is invalidated

// Subscribe to shortcut KPI layouts $
kpiLayout$.subscribe(function(layout) {
    var qLayout = layout.qLayout;
    document.querySelector("span").innerHTML = qLayout.myKPI;
});


// Select a random field value
var field$ = app$
    .getField("Dim1")
    .publishLast()
    .refCount();

var fieldCardinal$ = field$
    .getCardinal()
    .map(function(m) {return m.qReturn;})
    .publishLast()
    .refCount();

var fieldSelectRandom$ = fieldCardinal$
    .mergeMap(function(card) {
        var randInt = Math.floor(Math.random()*card);
        return field$.lowLevelSelect([randInt],false)
    });

var randomSelection = Rx.Observable.fromEvent(document.querySelector("button"),"click")
    .mergeMap(function() {return fieldSelectRandom$;});

// Animate the change whenever the filter is successful
randomSelection.subscribe(function(s) {
    var elem = document.querySelector("span");
    elem.className = '';
    setTimeout(function () {
        elem.className = 'run-animation';
    }, 10);

});
