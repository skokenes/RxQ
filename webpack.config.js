var path = require("path");
var library = "RxQ";
var filename = "rxqap-engine";

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
        //ws: true
    }],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
            }
            /*,
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader"
            }
            */
        ]
    },
    resolve: {
        root: "./",
        extensions: ["",".js"]
    }
};