const webpack = require('webpack');
const path = require('path');
const options = require('minimist')(process.argv.slice(2));
const createConfig = require('./webpack.config');
const { spawn } = require('child_process');

const runDevServer = createConfig => options => {
    const compiler = webpack(createConfig(options));
    const { app, useOptions } = require('home-in-on-your-homies-server');
    const DMW = require('koa-webpack-dev-middleware');
    const HMW = require('koa-webpack-hot-middleware');

    useOptions({
        publicPath: path.join(__dirname, '../dist'),
    });

    app.use(devMiddleware = DMW(compiler, {
        publicPath: '/',
        quiet: true,
        index: 'index.bundle.html',
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
        },
    }));
    
    app.use(hotMiddleware = HMW(compiler, {        
        msg: console.log,
        path: '/__webpack_hmr', 
        heartbeat: 2000,
    }));
    
    console.log('> Starting dev server...');
    devMiddleware.waitUntilValid(() => {
        const port = 3674;
        const uri = `http://localhost:${port}`;
        console.log(`> Listening at ${uri}\n`);      
        app.listen(port);
    });
};

const runProdBuild = createConfig => options => {
    console.log("> Starting production build...");
    webpack(createConfig(options), () => {
        console.log("> Completed production build!");
    });
};

const runTestSuite = createConfig => options => {
    webpack(createConfig(options), () => {
        const p = spawn('node', [path.join(__dirname, '../dist/index.bundle.js')]);
        p.stdout.on('data', d => console.log('' + d));
        p.stderr.on('data', d => console.log('' + d));
    });
};

const executeBundle = options => {
    switch(true){
        case options.dev:{
            return runDevServer(createConfig)(options);
        }
        case options.prod:{
            return runProdBuild(createConfig)(options);
        }
        case options.test:{
            return runTestSuite(createConfig)(options);
        }
    }
};

if(path.join(__dirname, 'webpack.js') === process.argv[1]){
    if(options.run){
        executeBundle(options);
    }
} else {
    module.exports = executeBundle;
}