import layerComponent from './index.vue'

const layerContent = {
    install: (Vue) => {
        Vue.component('layerContent', layerComponent);
    }
}

export default layerContent
