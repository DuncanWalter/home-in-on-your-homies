import Vue from 'vue'
import ElementUI from 'element-ui'
import TexPreproc from './helpers/texPreprocessor.js'
import Katex from 'katex'
import App from './components/app.js'
// import { inject } from './services/plugins.js'
import { view } from './services/store.js'

// Expose the global style glob for independent consumption
export { default as styles } from './index.styl'

// HMR friendly bootstrapping for the modern era
(function bootstrap(el: any){
    // inject({
    //     'alonzo-client-template': module.exports
    // });
    Vue.use(ElementUI)
    if(Vue.component('az-root') === undefined){
        Vue.component('az-root', {
            components: {
                App: App
            },
            render(){
                return ( <App sil={ view }/> );
            },
        });
        var vm = new Vue({ 
            el: el,
            render(){
                return( <az-root/>);
            },
        });
        (window||{}).__bootstrap__ = {
            update: vm.$forceUpdate.bind(vm),
            id: module.id,
        };
    } else {
        if(((window||{}).__bootstrap__||{}).id === module.id){ window.__bootstrap__.update(); }
    }
})(document.getElementById('anchor'));

if(module.hot){ 
    // enables HMR // $FlowFixMe
    module.hot.accept();
}

// todo: finish the texPreprocessor function in ./helpers/texPreprocessor file
// the goal is to preprocess strings using the Tex syntax so that it could be parsed by Katex
// the way is to change a backslash into double backslashes
// example: Tex string "\sqrt{64} \ = \ 8" -> Katex string "\\sqrt{64} \\ = \\ 8"

//todo: After you finish comment out the following line after you
Katex.render("\\sqrt{64} \\ = \\ 8", kat);
//todo: and then uncomment the last two lines wrapped in comments 

// var texStr = "\sqrt{64} \ = \ 8";
// Katex.render(TexPreproc(texStr),kat);

