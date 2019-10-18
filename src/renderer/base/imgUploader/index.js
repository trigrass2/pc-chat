import imgUploaderComponent from './index.vue'

const imgUploader = {
    install: (Vue) => {
        Vue.component('imgUploader', imgUploaderComponent);
    }
}

export default imgUploader
