<template>
  <div class="wrap">
    <div class="row">
      <span>原密码：</span>
      <input v-model="params.password" type="password" placeholder="请输入原密码" />
    </div>
    <div class="row">
      <span>新密码：</span>
      <input v-model="params.newpassword" type="pwd" placeholder="请输入新密码" />
    </div>
    <div class="row">
      <span>重复新密码：</span>
      <input v-model="params.rePwd" type="pwd" placeholder="请再次输入新密码" />
    </div>
    <div class="submit" @click.stop="goChangePsd">提交</div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { changePsd } from 'api/http/sessionChat'

export default {
  data() {
    return {
      params: {
        password: '',
        newpassword: '',
        rePwd: ''
      }
    }
  },
  methods: {
    // 修改密码
    goChangePsd() {
      if (!this.params.password || !this.params.newpassword || !this.params.rePwd) {
        this.$refs.layer.show('请输入完整信息!')
        return
      }
      if (this.params.newpassword != this.params.rePwd) {
        this.$refs.layer.show('两次新密码输入不一致!')
        return
      }
      changePsd(this.params).then(res => {
        if (res.data.returncode == '0') {
          this.params.password = ''
          this.params.newpassword = ''
          this.params.rePwd = ''
          this.$refs.layer.show('修改成功')
        } else {
          this.$refs.layer.show(res.data.returnmsg)
        }
      })
      .catch(res => {
        this.$refs.layer.show(res)
      })
    }
  }
}
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap {
  display: block !important;
  margin-left: 50px;
  .row {
    margin-top: 10px;
    span {
      display: inline-block;
      text-align: right;
      font-size: 16px;
      margin-right: 6px;
      width: 100px;
    }
    input {
      width: 200px;
      height: 40px;
      border: 1px solid $border;
      padding-left: 10px;
      color: 14px;
    }
  }
  .error {
    color: $red;
    margin: 15px auto;
    text-align: center;
    font-size: 14px;
  }
  .submit {
    width: 180px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    margin: 30px auto 0;
    font-weight: bold;
    color: #fff;
    background-color: $red;
    border-radius: 4px;
    font-size: 16px;
  }
}
</style>
