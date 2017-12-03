import Vue from 'vue'
import App from './components/app.js'
import './index.styl'

// HMR friendly bootstrapping
(function bootstrap(anchorElement){
    if(!Vue.component('Anchor')){
        Vue.component('Anchor', {
            components: { App },
            render( ){ return <App/> },
        });
        let Anchor = {
            components: { App },
            render( ){ return <App/> },
        };
        let vm = new Vue({ 
            el: anchorElement,
            components: { Anchor },
            render( ){ return <Anchor/> },
        });
        window.__bootstrap__ = {
            update: (__) => vm.$forceUpdate(vm),
            id: module.id,
        };
    } else if((window.__bootstrap__||{}).id == module.id){ 
        window.__bootstrap__.update();
    }
})(document.getElementById('anchor'));

// enables HMR at this root
if( module.hot ){ 
    module.hot.accept();
}
