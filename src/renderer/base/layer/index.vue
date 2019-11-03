<template>
  <transition name="layer-fade">
    <div class="tips" v-show="showFlag" @click.stop>
      <div class="content">{{text}}</div>
    </div>
  </transition>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    // text: {
    //   type: String,
    //   default: ""
    // },
    time: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      text: '',
      showFlag: false
    };
  },
  methods: {
    show(text) {
      this.text = text
      this.showFlag = true
      return this.promise()
    },
    promise() {
      return new Promise((resolve, reject) => {
        let time = this.time * 1000;
        setTimeout(() => {
          this.showFlag = false;
          resolve();
        }, time);
      });
    }
  }
};
</script>
<style scoped lang="scss" rel="stylesheet/scss">
.tips {
  position: fixed;
  z-index: 99;
  top: 50%;
  left: 50%;
  // width: 7rem;
  padding: 0.6rem 0.4rem;
  line-height: 0.7rem;
  border-radius: 0.1333rem;
  text-align: center;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  -ms-transform: translate(-50%, -50%);
  /* IE 9 */
  -moz-transform: translate(-50%, -50%);
  /* Firefox */
  -webkit-transform: translate(-50%, -50%);
  /* Safari 和 Chrome */
  -o-transform: translate(-50%, -50%);
  /* Opera */
  &.layer-fade-enter-active {
    animation: fadeIn 0.3s;
  }

  &.layer-fade-leave-active {
    animation: fadeOut 0.3s;
  }

  .content {
    font-size: 16px;
    color: #fff;
    line-height: 20px;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
