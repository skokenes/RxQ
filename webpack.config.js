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
var plugins = [
    new webpack.DefinePlugin({
        "__qlikVersion__": '"' + versionParam + '"'
    }),
    new webpack.NormalModuleReplacementPlugin(/superagent|q/, (result) => {
        if (result.request === 'superagent') {
            result.request = 'empty-module';
        }
    })
];

// Add minimize plugin if nessary
var minimize = process.argv.indexOf('--minimize') !== -1;
var filename = "rxq" + (minimize ? ".min" : "");
if(minimize) plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));


module.exports = {
    entry: ["./index.js"],
    output: {
        path: __dirname + "/build/",
        filename: filename + ".js",
        libraryTarget: "umd",
        library: library,
        umdNamedDefine: true
    },
    externals: [{
        ws: true,
        http: true
    }],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel"
            }
        ]
    },
    resolve: {
        root: "./",
        extensions: ["",".js"]
    },
    plugins: plugins
};