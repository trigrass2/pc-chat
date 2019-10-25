<template>
  <div class="upload-box">
    <label for="upload" class="upload-btn">
      <input
        accept="image/jpeg, image/jpg, image/png"
        @change="handleFileChange"
        ref="inputer"
        type="file"
        id="upload"
      />
      <img src="../../components/Main/sub/textbox/img/editor-tools-img.png" />
      <!-- <div class="add">＋</div> -->
      <!-- <img v-show="imgSrc" :src="imgSrc"> -->
    </label>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { imgUploader } from 'api/http/groupChat.js'

export default {
  data() {
    return {
      imgSrc: ''
    }
  },
  props: {
    action: String,
    types: Array,
    maxSize: Number,
    uploadedUrl: String
  },
  created() {
    if (this.uploadedUrl) {
      this.imgSrc = this.uploadedUrl
    }
  },
  methods: {
    // 执行上传文件时触发
    async handleFileChange(e) {
      let inputDOM = this.$refs.inputer
      // 通过DOM取文件数据
      let file = inputDOM.files[0]
      // console.log(file);
      if (!file) {
        return false
      }
      let isTypeOk = this.fileTypeValid(file, this.types)
      let isSizeOk = this.fileSizeValid(file, this.maxSize)
      if (!isTypeOk || !isSizeOk) {
        return false
      }
      // 预览图片
      // await this.imgPreview(file);
      // FileReader兼容性IE10+
      if (!file || !window.FileReader) return
      // 创建一个reader
      let reader = new FileReader()
      // 将图片将转成 base64 格式
      await reader.readAsDataURL(file)
      // 读取成功后的回调——图片上传
      var vm = this
      reader.onloadend = function() {
        imgUploader(this.result)
          .then(res => {
            console.log(res)
            if (res.data.returncode === '0') {
              // 文件上传成功
              vm.$emit('uploadSuccess', res.data.data)
            } else {
              // 文件上传失败
              vm.$emit('uploadError', res.data.returnmsg)
            }
          })
          .catch(e => {
            vm.$emit('uploadError', e)
          })
      }
      // // 图片上传
      // await imgUploader(file).then(res => {
      //   if (res.data.code === 200) {
      //     // 图片预览
      //     // this.imgSrc = `https://vote.huwhy.cn/file${res.data.data}`
      //     // 文件上传成功
      //     this.uploadSuccess(res)
      //   } else {
      //     // 文件上传失败
      //     this.uploadError()
      //   }
      //   // 触发这个父组件的v-model事件(相当于oninput事件)
      //   this.$emit('input', file)
      // })
    },
    fileTypeValid(file, types) {
      if (!file || !file.type) {
        return
      }
      let type = file.type.split('/')[1]
      // console.log(type);
      let isType = types.some((e, i, arr) => {
        return type === e
      })
      if (!isType && this.typeError) {
        this.$emit('uploadError', '文件类型不符，请上传png/jpg/jpeg格式图片！')
        return false
      }
      return true
    },
    fileSizeValid(file) {
      if (!file || !file.size) {
        return
      }
      let size = Math.floor(file.size / 1024)
      // console.log(size);
      if (size > this.maxSize) {
        this.$emit('uploadError', '文件大小不符，请上传2M内大小图片！')
        return false
      }
      return true
    }
    // 图片预览
    // async imgPreview(file) {
    //   let self = this;
    //   // 用HTML5的 File API 的 FileReader 图片本地转成base64格式的url
    //   // FileReader兼容性IE10+
    //   if (!file || !window.FileReader) return;
    //   // 创建一个reader
    //   let reader = new FileReader();
    //   // 将图片将转成 base64 格式
    //   await reader.readAsDataURL(file);
    //   // 读取成功后的回调
    //   reader.onloadend = function() {
    //     self.imgSrc = this.result;
    //   };
    // }
  }
}
</script>
<style lang='scss' scoped>
.upload-box {
  display: inline-block;
  font-size: 0;
  .upload-btn {
    display: inline-block;
    box-sizing: border-box;
    z-index: 1;
    & > * {
      pointer-events: none;
    }
    input {
      position: absolute;
      left: -9999px;
      z-index: 999;
    }
    .add {
      text-align: center;
      line-height: 8vh;
      color: #333;
      z-index: -1;
      @include property-dpr(font-size, 50px);
    }
  }
  .tips {
    display: inline-block;
    vertical-align: middle;
    @include property-dpr(font-size, 26px);
  }
}
</style>