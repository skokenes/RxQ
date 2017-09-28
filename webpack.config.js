var path = require("path");
var webpack = require("webpack");
var library = "RxQ";

// Read in Qix Version
var versionParam = process.argv
    .filter(arg=>{
        return arg.indexOf("-v=")>-1;
    })
    .join()
    .split("=")[1];

// Add qlik version plugin
var plugins = [];

module.exports = function(env) {
    // Add minimize plugin if nessary
    var _env = env || {};
    
    var minimize = _env.minimize === "true";
    var filename = "rxq" + (minimize ? ".min" : "");
    if(minimize) plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));

    return {
        entry: ["./index.js"],
        output: {
            path: __dirname + "/dist/build/",
            filename: filename + ".js",
            libraryTarget: "umd",
            library: library,
            umdNamedDefine: true
        },
        externals: [{
            ws: true
        }],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                    options: {
                        presets: [["es2015", {"modules": "commonjs"}]],
                        plugins: [
                            "transform-runtime",
                            "babel-plugin-add-module-exports"
                        ]
                    }
                }
            ]
        },
        resolve: {
            extensions: [".js"]
        },
        plugins: plugins
    };
}