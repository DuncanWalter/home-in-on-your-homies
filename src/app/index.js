import Vue from 'vue'
import App from './components/app.js'
import { view } from './services/store.js'
import './index.styl'

// HMR friendly bootstrapping for the modern era
(function bootstrap(anchorElement){
    if(Vue.component('az-root')){
        Vue.component('az-root', {
            components: { App },
            render: (__) => <App/>,
        });
        var vm = new Vue({ 
            anchorElement, 
            render: (__) => <az-root/>,
        });
        window.__bootstrap__ = {
            update: (__) => vm.$forceUpdate(vm),
            id: module.id,
        };
    } else if(window.__bootstrap__.id == module.id){ 
        window.__bootstrap__.update();
    }
})(document.getElementById('anchor'));

// enables HMR at this root
if( module.hot ){ 
    module.hot.accept();
}
