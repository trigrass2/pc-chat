<template>
  <div class="loading" style="margin-right:8px;">
    <div class="ing" v-show="status == 0">
      <img width="24" height="24" src="./loading.gif">
    </div>
    <div class="fail" v-show="status == 2">
      <div class="status"><i></i></div>
      <div class="resend">重新发送</div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  export default {
    props: {
      status: {
        type: Number,
        default: 1
      }
    }
  }
</script>
<style lang='scss' scoped>
    .loading{
      .ing{
        width: 25px;
        height: 25px;
      }
      .fail{
        color: $red;
        font-size: 14px;
        display: flex;
        align-items: center;
        .status{
          i{
            background: url('./fail.png');
            background-size: contain;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-top: 4px;
          }
        }
        .resend:hover{
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
    
</style>
