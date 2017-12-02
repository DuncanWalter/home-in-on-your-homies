const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
// const pkg = require('./../package.json');
const path = require('path');
const options = require('minimist')(process.argv.slice(2));

const pkg = require('./../package.json');
const env = require('babel-preset-env');
// // const webpack = require('webpack');


const plugins = (options => {
    let fragments = {
        dev: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new HtmlWebpackPlugin({
                filename: 'index.bundle.html',
                template: './src/index.html',
                inject: true,
            }),
            new FriendlyErrorsPlugin(),
        ],
        prod: [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            }),
            new webpack.optimize.UglifyJsPlugin({
                beautify: false,
                mangle: {
                    screw_ie8: true,
                    keep_fnames: true,
                },
                compress: {
                    screw_ie8: true,
                },
                comments: false,
            }),
            new HtmlWebpackPlugin({
                filename: 'index.bundle.html',
                template: './src/index.html',
                inject: true,
            }),
        ],
        test: [

        ],
    };

    return Object.keys(options).reduce((a, k) => {
        return fragments[k] ? a.concat(fragments[k]) : a;
    }, [
        new webpack.DefinePlugin({
            'process.env.__OPTIONS__': JSON.stringify(options._),
        }),
    ]);
})(options);

const entry = (() => {
    return !options.dev ? './src/index.js' : [
        './src/index.js',
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    ];
})();

const config = {
    entry,
    output: {
        path: path.join(__dirname, './../dist'),
        filename: 'index.bundle.js',
        libraryTarget: 'umd',
    },
    module: { 
        rules: [{
            test: /\.js$/,
            exclude: /node_modules\//,
            use: [{
                loader: 'babel-loader',
                options: {
                    plugins: ['transform-vue-jsx'],
                    presets: [[env, {
                        targets: {
                            browsers: [
                                '> 5%',
                            ],
                            node: 'current',
                        }
                    }], 'flow'],
                    cacheDirectory: true,
                }
            }],
        },{
            test: /\.(styl|css)$/,
            use: [{
                loader: 'style-loader',
            },{
                loader: 'css-loader',
            },{
                loader: 'stylus-loader',
                options: { use: [require('nib')()] }
            }],
        },{
            exclude: /\.(styl|css|js|html)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 2000,
                    name: 'static/[name].[hash:8].[ext]',
                }
            }],
        }],
    },
    resolve: {
        alias: {
            '~': path.join(__dirname, './../'),
        },
    },
    plugins,
};


console.log(options);

if(options.dev){
    const Express = require('express');

    var app = new Express();
    var compiler = webpack(config);
    
    var devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: '/',
        quiet: true,
        index: __dirname + 'index.bundle.html',
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
        },
    });
    
    var hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log: msg => console.log(msg),
        path: '/__webpack_hmr', 
        heartbeat: 2000,
    });
    
    // force page reload when html-webpack-plugin template changes
    compiler.plugin('compilation', function (/*compilation*/) {
        hotMiddleware.publish({ action: 'reload' });
    });
    
    // serve webpack bundle output
    app.use(devMiddleware);
    
    // enable hot-reload and state-preserving
    // compilation error display
    app.use(hotMiddleware);
    
    app.use(function (req, res, next){
        let filePath;
        if(/.*([a-zA-Z0-9_-]+)\.plugin\.js$/.test(req.path)){
            filePath = __dirname + './../dist/index.bundle.js';
            // TODO enable plugin services
            res.send('console.log(\'plugin services not yet enabled\')');
            res.end();
        } else if(/index\.bundle\.js/.test(req.path)){
            filePath = __dirname + './../dist/index.bundle.js';
            compiler.outputFileSystem.readFile(filePath, function(err, result){
                if(err){ return next(err); }
                res.send(result);
                res.end();
            });
        } else if(/\.json$/.test(req.path)){
            console.log('> HMR json requested...')
            next();
        } else {
            filePath = __dirname + './../dist/index.bundle.html';
            compiler.outputFileSystem.readFile(filePath, function(err, result){
                if(err){ return next(err); }
                res.set('content-type','text/html');
                res.send(result);
                res.end();
            });
        }
    });
    
    var uri = 'http://localhost:3674';
    
    console.log('> Starting dev server...');
    devMiddleware.waitUntilValid(() => {
        console.log('> Listening at ' + uri + '\n');
    });
    
    app.listen(3674);
} else {
    console.log("> Starting production build...");
    
    webpack(config, ()=>{
        console.log("> Completed production build!");
    });
}









// // TODO magic with package json to exclude other client templates


// const webpack = require('webpack');

// var HtmlWebpackPlugin = require('html-webpack-plugin');

// var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

// const pkg = require('./../package.json');

// const path = require('path');

// const open_module = require('open-module/openModule');
// let { runDevServer, OpenModule, configureOptions } = open_module;

// let config = configureOptions({
//     entry: [
//         './src/index.js'
//     ],
//     output: {
//         path: path.join(__dirname, './../dist'),
//         filename: 'index.bundle.js',
//         library: pkg.name,
//         libraryTarget: 'this',
//     },
//     module: { 
//         rules: [{
//             test: /\.js$/,
//             exclude: /node_modules\//,
//             use: [{
//                 loader: 'babel-loader',
//                 options: {
//                     plugins: ['transform-vue-jsx'],
//                     presets: [['env', {
//                         targets: {
//                             browsers: [
//                                 '> 5%',
//                             ],
//                             node: 'current',
//                         }
//                     }], 'flow'],
//                     cacheDirectory: true,
//                 }
//             }],
//         },{
//             test: /\.(styl|css)$/,
//             use: [{
//                 loader: 'style-loader',
//             },{
//                 loader: 'css-loader',
//             },{
//                 loader: 'stylus-loader',
//                 options: { use: [require('nib')()] }
//             }],
//         },{
//             exclude: /\.(styl|css|js|html)$/,
//             use: [{
//                 loader: 'url-loader',
//                 options: {
//                     limit: 2000,
//                     name: 'static/[name].[hash:8].[ext]',
//                 }
//             }],
//         }],
//     },
//     resolve:{
//         alias: {
//             '~': path.join(__dirname, './../'),
//         },
//     },
// }, {
//     dev: {
//         plugins: [
//             new webpack.HotModuleReplacementPlugin(),
//             new webpack.NoEmitOnErrorsPlugin(),
//             new HtmlWebpackPlugin({
//                 filename: 'index.bundle.html',
//                 template: './src/index.html',
//                 inject: true,
//             }),
//             new FriendlyErrorsPlugin(),
//         ],
//     },
//     prod: {

//     },
//     test: {
//         // TODO 
//     }
// });



// OpenModule(config, module);





// const base = {
//     entry: [
//         './src/index.js'
//     ],
//     output: {
//         path: __dirname + './../dist',
//         filename: 'index.bundle.js',
//         library: pkg.name,
//         libraryTarget: 'this',
//     },
//     module: { 
//         rules: [{
//             test: /\.js$/,
//             exclude: /node_modules\//,
//             use: [{
//                 loader: 'babel-loader',
//                 options: {
//                     plugins: ['transform-vue-jsx'],
//                     presets: [['env', {
//                         targets: {
//                             browsers: [
//                                 '> 5%',
//                             ],
//                             node: 'current',
//                         }
//                     }], 'flow'],
//                     cacheDirectory: true,
//                 }
//             }],
//         },{
//             test: /\.(styl|css)$/,
//             use: [{
//                 loader: 'style-loader',
//             },{
//                 loader: 'css-loader',
//             },{
//                 loader: 'stylus-loader',
//                 options: { use: [require('nib')()] }
//             }],
//         },{
//             exclude: /\.(styl|css|js|html)$/,
//             use: [{
//                 loader: 'url-loader',
//                 options: {
//                     limit: 2000,
//                     name: 'static/[name].[hash:8].[ext]',
//                 }
//             }],
//         }],
//     },
//     resolve:{
//         alias: {
//             '~': __dirname + './../',
//         },
//     },
// };

// // module.exports = (function extend(base, ext){
// //     // mixin the base config underneath the dev config object

// //     switch(true){
// //         case base === undefined: 
// //         return ext;

// //         case ext === undefined:
// //         return base;

// //         case base instanceof Array && ext instanceof Array:
// //         return base.reduce((a, e) => {
// //             a.push(e);
// //             return a;
// //         }, ext);

// //         case base instanceof Object && ext instanceof Object:
// //         return Object.keys(base).reduce((acc, key) => {
// //             acc[key] = extend(base[key], acc[key]);
// //             return acc;
// //         }, ext);

// //         default:
// //         return base;
// //     }

// // }).bind({ }, base);



// runDevServer(config, './index.bundle.html', 3674);