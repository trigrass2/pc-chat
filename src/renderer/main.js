import 'babel-polyfill'
import Vue from 'vue'
import axios from 'axios'
import 'common/scss/iconfont.css'
import App from './App'
import router from './router'
import store from './store'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { wsBus } from 'api/websocket/eventBus.js'
import CryptoJS from 'api/crypto'
// import { protocol } from 'electron'

// 自定义的全局组件
import layerContent from './base/layer' // 弹框插件
import spinnerContent from './base/spinner' // 加载中插件
import imgUploader from './base/imgUploader' // 上传图片插件

// console.log('123213', protocol)

// protocol.registerSchemesAsPrivileged([{
//     scheme: 'app',
//     privileges: {
//         standard: true,
//         secure: true
//     }
// }])

Vue.config.productionTip = false

Vue.use(layerContent);
Vue.use(spinnerContent);
Vue.use(imgUploader);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// AES解密
Vue.crypto = Vue.prototype.$crypto = CryptoJS
// http服务
Vue.http = Vue.prototype.$http = axios
// websocket服务
// let websocket = new WebSocket('ws://10.18.13.159:9011/websocket')
let websocket = new ReconnectingWebSocket('ws://10.18.13.159:9011/websocket')
Vue.ws = Vue.prototype.$ws = websocket
Vue.wsBus = Vue.prototype.$wsBus = wsBus

// websocket打开
websocket.onopen = function() {
    console.log('websocket open')
}
// websocket关闭
websocket.onclose = function(e) {
    console.log('websocket close')
    wsBus.$emit(`8888`)
}
// websocket出错
websocket.onerror = function(e) {
    console.log(e)
    console.log('websocket error')
}

// 图片预览-配置
Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
        // inline: false,
        // button: true,
        // navbar: false,
        title: false
        // toolbar: true,
        // tooltip: false,
        // movable: true,
        // zoomable: true,
        // rotatable: true,
        // scalable: false,
        // transition: true,
        // fullscreen: false,
        // keyboard: false
    }
})

/* eslint-disable no-new */
new Vue({
    components: { App },
    mounted() {
        // websocket消息
        websocket.onmessage = (res) => {
          let data = JSON.parse(res.data)
          console.log('有ws消息进来', data)
          wsBus.$emit(`${data.cmdid}`, data)
        }
    },
    router,
    store,
    template: '<App/>'
}).$mount('#app')
