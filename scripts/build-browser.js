var webpack = require("webpack");
const path = require("path");
var StringReplacePlugin = require("string-replace-webpack-plugin");

webpack({
    entry: path.join(__dirname, "../index.js"),
    output: {
        path: path.resolve(__dirname, "../dist/bundle"),
        filename: "rxq.bundle.js",
        library: "RxQ",
        libraryTarget: "var"
    },
    module: {
        loaders: [
            // configure replacements for file patterns
            {
                enforce: "pre",
                test: /src\/|index.js$/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /import {([^;]*?)} from ([^;]*?)('|")rxjs([^;]*?)('|");/g,
                            replacement: function (match, p1, p2, p3, p4, p5, offset, string) {

                                // Check if loading an operator or not
                                var operatorsFlag = p4.split("/").indexOf("operators") > 0

                                // The source to load from
                                var srcBase = ["Rx"].concat(
                                    p4
                                        .split("/")
                                        .filter(f => f != "")
                                        
                                ).join(".");

                                // Get vars to map
                                var defs = p1.replace(/({|})/g, "")
                                    .split(",")
                                    .map(d => {
                                        var splits = d.split(" as ")
                                            .map(s => s.replace(/( |\n)/g, ""));

                                        return {
                                            name: splits[1] || splits[0],
                                            source: splits[0]
                                        }
                                    });
                                
                                // Turn the var definitions into statements
                                var globalImports = defs.map(d=> {
                                    var dec = `var ${d.name} = ${srcBase}`;
                                    if(operatorsFlag) dec += `.${d.source}`;
                                    dec += ";";
                                    return dec;
                                })
                                .join("\n");

                                return globalImports;
                            }
                        }
                    ]
                })
            },
            // Babel
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    "presets": ["es2015"],
                    "plugins": [
                        // "transform-runtime",
                        "babel-plugin-add-module-exports"
                    ]
                }
            }
        ]
    },
    plugins: [
        // an instance of the plugin must be present
        new StringReplacePlugin()
    ]
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log(err);
        // Handle errors here
    }
    console.log(stats);
    // Done processing
});