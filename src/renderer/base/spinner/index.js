import spinnerComponent from './index.vue'

const spinnerContent = {
    install: (Vue) => {
        Vue.component('spinnerContent', spinnerComponent);
    }
}

export default spinnerContent
