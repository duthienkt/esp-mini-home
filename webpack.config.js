const path = require('path');

var processFolder = process.cwd().replace(/\\/, '/');
var relative = path.relative(processFolder, __dirname);


function resolveEntry(entryInProject) {
    var entryInProcess = path.join(relative, entryInProject);
    if (!entryInProcess.startsWith('./')) entryInProcess = './' + entryInProcess;
    return entryInProcess;

}

var packages = {
    default: {
        entry: ["./app/index.js"],
        filename: "./dist/esp-mini-home.js"
    }
}

const PACKAGE = 'default';


module.exports = {
    mode: process.env.MODE || "development",
    // mode: 'production',
    entry: packages[PACKAGE].entry.map(resolveEntry),
    output: {
        path: path.join(__dirname, "."),
        filename: packages[PACKAGE].filename
    },
    resolve: {
        modules: [
            path.join(__dirname, './node_modules')
        ]
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: { presets: [['@babel/preset-env', { modules: false }]] }
            },
            {
                test: /\.(tpl|txt|xml|rels)$/i,
                use: 'raw-loader'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    optimization: {
        // We do not want to minimize our code.
        minimize: false
    },
    devServer: {
        compress: true,
        disableHostCheck: true
    },
    performance: {
        hints: false
    }
};