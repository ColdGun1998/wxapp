const path = require("path");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { 'modules': 'commonjs' }]],
                        plugins: ['@babel/plugin-proposal-object-rest-spread', 'add-module-exports']
                    }
                }
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    optimization: {
        // minimizer: [new UglifyJsPlugin()],
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "fftUtil.js",
        libraryTarget: "umd",
        globalObject: "this",
        library: "fftUtil"
    }
}
