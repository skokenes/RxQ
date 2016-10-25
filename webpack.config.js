var path = require("path");
var webpack = require("webpack");
var library = "RxQ";
var minimize = process.argv.indexOf('--minimize') !== -1;
var filename = "rxqap" + (minimize ? ".min" : "");
var plugins = (minimize ? [new webpack.optimize.UglifyJsPlugin({minimize: true})] : []);

module.exports = {
    entry: ["babel-polyfill","./index.js"],
    output: {
        path: __dirname + "/build/",
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