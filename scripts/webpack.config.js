const path = require('path');
const webpack = require('webpack');

const mixin = (base, overlay) => {
    Object.keys(overlay).forEach(k => {
        switch(true){
            case overlay[k] instanceof Array:{
                return overlay[k].forEach(v => base[k].push(v));
            }
            case overlay[k].__proto__ == Object.prototype:{
                return mixin(base[k], overlay[k]);
            }
            default:{
                return base[k] = overlay[k];
            }
        }
    });
    return base;
};

const baseConfig = options => ({
    entry: ['./src/index.js'],
    output: {
        path: options.output ? 
            path.join(process.cwd(), options.output) :
            path.join(__dirname, './../dist'),
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
                    presets: [[require('babel-preset-env'), {
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
    plugins: [
        (c => new c({
            filename: 'index.bundle.html',
            template: './src/index.html',
            inject: true,
        }))(require('html-webpack-plugin')),
        // TODO: figure out a naming convention for this stuff
        // new webpack.DefinePlugin({
        //     'process.env.__OPTIONS__': JSON.stringify(options._),
        // }),
    ],
});


const devOverlay = {
    entry: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000'],
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        (c => new c())(require('friendly-errors-webpack-plugin')),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
};

const prodOverlay = {
    plugins: [
        (c => new c())(require('uglifyjs-webpack-plugin')),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
    ],
};

const testOverlay = {
    externals: /^[^\.].+$/,
    entry: './src/index.test.js',
};

const createConfig = options => {
    switch(true){
        case options.prod:{
            return mixin(baseConfig(options), prodOverlay);
        }
        case options.dev:{
            return mixin(baseConfig(options), devOverlay);
        }
        case options.test:{
            return mixin(baseConfig(options), testOverlay);
        }
        default:{
            throw new Error('Expects prod, dev, or test build environment');
        }
    }
};

module.exports =  createConfig;
