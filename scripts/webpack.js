const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const path = require('path');
const options = require('minimist')(process.argv.slice(2));
const env = require('babel-preset-env');

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
                    }]],
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

if(options.dev){
    const Express = require('express');

    var app = new Express();
    var compiler = webpack(config);
    
    var devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: '/',
        quiet: true,
        index: path.join(__dirname, 'index.bundle.html'),
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
    compiler.plugin('compilation', (__) => hotMiddleware.publish({ action: 'reload' }));
    
    // serve webpack bundle output
    app.use(devMiddleware);
    
    // enable hot-reload and state-preserving
    // compilation error display
    app.use(hotMiddleware);
    
    // TODO: Do we need anything here? How about the other libraries?
    // TODO: Should use a send file method, realistically
    app.use(function (req, res, next){
        const extensions = {
            js:   /index\.bundle\.js$/,
            html: /index\.bundle\.html$/,
            man_json: /manifest\.json$/,
            dev_json: /\.json$/,
            default: /./,            
        };
        const behaviors ={
            js: __ => {
                res.type('js');
                filePath = path.join(__dirname, `../dist/index.bundle.js`);                
                compiler.outputFileSystem.readFile(filePath, (err, result) => {
                    if (err) next(err); 
                    res.send(result).end();
                });
            },
            html: __ => {
                res.type('html');
                filePath = path.join(__dirname, `../dist/index.bundle.html`);
                compiler.outputFileSystem.readFile(filePath, (err, result) => {
                    if (err) next(err); 
                    res.send(result).end();
                });
            },
            man_json: __ => {
                res.sendFile(path.join(__dirname, '../src/manifest.json'));
            },
            dev_json: __ => next(),
            default(){ this.html() },
        };
        let done = 0;
        for(let key of Object.keys(extensions)){
            if(extensions[key].test(req.path) && !done++){
                behaviors[key]();
            }
        };
    });
    
    console.log('> Starting dev server...');
    devMiddleware.waitUntilValid(() => {
        // TODO: take as a CLI argument so that the
        // three libraries can interact via shelljs
        const port = 3674;
        const uri = `http://localhost:${port}`;
        console.log(`> Listening at ${uri}\n`);      
        app.listen(port);
    });

} else {
    console.log("> Starting production build...");
    webpack(config, ()=>{
        console.log("> Completed production build!");
    });
}









