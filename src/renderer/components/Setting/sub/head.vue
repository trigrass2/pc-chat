<template>
  <div>
    <div class="preview">
      <img :src="imgSrc" :style="{zoom:range/100}"/>
    </div>
    <input class="range" type="range" v-model="range" />
    <div class="operator">
      <label for="upload" class="upload-btn">
        <input
          accept="image/jpeg, image/jpg, image/png"
          @change="handleFileChange"
          ref="inputer"
          type="file"
          id="upload"
        />
        <div class="btn" @click="handleFileChange">更换图片</div>
      </label>
      <div class="btn" @click="saveImg">保存</div>
    </div>
  </div>
</template>

<script>
// import { imgUpload } from "api/step";

export default {
  data() {
    return {
      // 允许图片类型
      types: ["png", "jpg", "jpeg"],
      // 图片大小最大值(M)
      maxSize: 2,
      // 缩放率
      range: "",
      // 图片本地上传至浏览器后取得的base64Url
      imgSrc: ""
      // 默认url（上传过）
      // uploadedUrl: String,
    };
  },
  props: {},
  created() {
    if (this.uploadedUrl) {
      this.imgSrc = this.uploadedUrl;
    }
  },
  methods: {
    // 执行上传文件时触发
    async handleFileChange(e) {
      let inputDOM = this.$refs.inputer;
      // 通过DOM取文件数据
      let file = inputDOM.files[0];
      console.log(file);
      if (!file) {
        return;
      }
      let isTypeOk = this.fileTypeValid(file, this.types);
      let isSizeOk = this.fileSizeValid(file, this.maxSize);
      if (!isTypeOk || !isSizeOk) {
        // 清空input-file中file
        inputDOM.value = ''
        return;
      }
      // 预览图片
      await this.imgPreview(file);
    },
    // 上传图片
    async saveImg() {
      // 图片上传
      // await imgUpload(file).then(res => {
      //   if (res.data.code === 200) {
      //     // 图片预览
      //     this.imgSrc = `https://vote.huwhy.cn/file${res.data.data}`;
      //     // 文件上传成功
      //     this.uploadSuccess(res.data);
      //   } else {
      //     // 文件上传失败
      //     this.uploadError();
      //   }
      //   // 触发这个父组件的v-model事件(相当于oninput事件)
      //   this.$emit("input", file);
      // });
    },
    // 图片类型校验
    fileTypeValid(file, types) {
      if (!file || !file.type) {
        return;
      }
      let type = file.type.split("/")[1];
      // console.log(type);
      let isType = types.some((e, i, arr) => {
        return type === e;
      });
      if (!isType && this.typeError) {
        this.error('上传错误', '图片格式不符合要求,请上传png/jpg/jpeg格式文件');
        return false;
      }
      return true;
    },
    // 图片大小校验
    fileSizeValid(file) {
      if (!file || !file.size) {
        return;
      }
      let size = Math.floor(file.size / 1024 / 1024);
      console.log(size);
      if (size > this.maxSize) {
        this.error('上传错误', '图片大小不符合要求,请上传小于2M大小的图片');
        return false;
      }
      return true;
    },
    // 图片预览
    async imgPreview(file) {
      let vm = this;
      // 用HTML5的 File API 的 FileReader 图片本地转成base64格式的url
      // FileReader兼容性IE10+
      if (!file || !window.FileReader) return
      // 创建一个reader
      let reader = new FileReader();
      // 将图片将转成 base64 格式
      await reader.readAsDataURL(file);
      // 读取成功后的回调
      reader.onloadend = function() {
        vm.imgSrc = this.result;
      };
    },
    // 报错
    error(title, content) {
      this.$electron.remote.dialog.showErrorBox(title, content);
    }
  }
};
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.preview {
  width: 200px;
  height: 200px;
  background-color: $black;
  margin: 0 auto;
  border-radius: 4px;
  overflow: auto;
}
.range {
  display: block;
  width: 250px;
  margin: 40px auto;
  height: 30px;
}
.operator {
  width: 200px;
  margin: 20px auto 0;
  display: flex;
  text-align: center;
  justify-content: space-around;
  input {
    position: absolute;
    left: -9999px;
  }
  .btn {
    width: 80px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: $red;
    border-radius: 4px;
    color: $blank;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>