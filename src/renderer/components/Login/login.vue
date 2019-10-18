<template>
  <div @click="wrapHandler">
    <div class="content">
      <img src="./imgs/logo.png" class="logo" />
      <div class="login-info">
        <div class="user-box">
          <input v-model="loginInfo.credential" placeholder="请输入用户名" />
          <img
            v-show="userList && userList.length > 0"
            class="arrow-d"
            src="./imgs/arrow_d.png"
            @click.stop="userListOnOff"
          />
          <ul class="user-list" v-show="userListShow">
            <li v-for="(item, index) in userList" :key="item" @click="changeUser(item)">
              <img src="./imgs/logo.png" />
              <span class="name">{{item}}</span>
              <div class="delete" @click="deleteUser(item)">删除</div>
            </li>
          </ul>
        </div>
        <input class="password" type="password" v-model="loginInfo.password" placeholder="请输入密码" />
        <label class="checkbox">
          <input type="checkbox" v-model="pswRemember" @click.stop="remember" />
          <img v-show="rememberPsw" src="./imgs/checkbox-on.png" />
          <img v-show="!rememberPsw" src="./imgs/checkbox-off.png" />
          <span>记住密码</span>
        </label>
      </div>
      <div class="btn login" @click="doLogin">登录</div>
      <div class="btn logout" @click="close">退出</div>
      <div class="tips">
        <p>Copyright© 浙江金融交易中心股份有限公司</p>
        <p class="update" @click="updateStaus">综合客服系统 更新说明</p>
      </div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
import { GROUPAPI } from 'api/http/groupChat'

export default {
  name: 'login',
  created() {
    // v-model不能直接绑定vuex数据
    // data里直接赋vuex值为undefined,所以在这里赋值
    this.pswRemember = this.rememberPsw
    // console.log(this.userList[0].name)
    // 检查 是否记住密码/是否有已登过账户
    this.checkAccount()
  },
  data() {
    return {
      // 弹框内容
      // layerText: '',
      // 用户列表下拉框是否显示
      userListShow: false,
      // 是否记住密码
      pswRemember: false,
      // 登录用户信息
      loginInfo: {
        credential: '',
        password: ''
      }
      // 用户列表
      // userList: ['zj001', 'zj002', 'zj003']
    }
  },
  computed: {
    ...mapGetters([
      // 账号列表  array
      'userList',
      // 是否记住密码 boolean
      'rememberPsw',
      // 记住的登录密码 string
      'loginPsw'
    ])
  },
  methods: {
    // 点击登录全页
    wrapHandler() {
      // 关闭userList列表
      this.userListShow = false
    },
    // 登录
    doLogin() {
      // var bb = CryptoJS.encryption('wangjuntao')
      // console.log(CryptoJS.decrypt(bb))
      GROUPAPI.login(this.loginInfo)
        .then(res => {
          // 登录成功
          if (res.data.code === '0000') {
            var userInfo = JSON.parse(this.$crypto.decrypt(res.data.body))
            // console.log('登录成功', resData)
            // 去获取用户详情
            GROUPAPI.gUserInfo({
              userid: userInfo.userId,
              fundAccount: userInfo.fundAccount
            })
              .then(res => {
                if (res.data.code === '0000') {
                  var userDetailInfo = JSON.parse(this.$crypto.decrypt(res.data.body))
                  // console.log('获取用户信息成功', userInfo)
                  userInfo.cookie = userDetailInfo.cookie
                  userInfo.headurl = userDetailInfo.headurl
                  userInfo.kxcode = userDetailInfo.kxcode
                  userInfo.lv = userDetailInfo.lv
                  userInfo.nickname = userDetailInfo.nickname
                  this.SET_USERINFO({
                    userInfo: userInfo
                  })
                  let userList = JSON.parse(JSON.stringify(this.userList))
                  // 如果userList中不存在当前登录账户，就把当前登录账户记录缓存，用于用户名下拉框
                  if (!Array.isArray(userList)) {
                    userList = []
                  }
                  let isHave = userList.find((e, i, arr) => {
                    return e === this.loginInfo.credential
                  })
                  if (!isHave) {
                    userList.push(this.loginInfo.credential)
                    this.SET_USERLIST({
                      userList: userList
                    })
                  }
                  // 如果记住当前密码勾选，记住当前登录密码
                  if (this.rememberPsw) {
                    this.SET_LOGINPSW({
                      loginPsw: this.loginInfo.password
                    })
                  }
                  // 打开主界面
                  this.$electron.ipcRenderer.send('login')
                } else {
                  // 查询用户信息失败
                  this.$refs.layer.show(res.data.message)
                }
              })
              .catch(res => {
                this.$refs.layer.show(res)
              })
          } else {
            // 登录失败
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 退出程序
    close() {
      this.$electron.ipcRenderer.send('close', '哈达的')
    },
    // 改变 登录用户
    changeUser(item) {
      this.loginInfo.credential = item
      this.userListShow = false
    },
    // 删除 用户登录列表-可选项
    deleteUser(item) {
      let userList = JSON.parse(JSON.stringify(this.userList))
      let index = userList.findIndex((e, i, arr) => {
        return e === item
      })
      userList.splice(index, 1)
      this.SET_USERLIST({
        userList: userList
      })
    },
    // 用户登录列表——显隐
    userListOnOff() {
      this.userListShow = !this.userListShow
    },
    // 是否记住密码——状态记录
    remember() {
      this.SET_REMEMBERPSW({
        rememberPsw: !this.pswRemember
      })
    },
    // 更新说明——打开
    updateStaus() {
      this.$electron.ipcRenderer.send('updateStatus')
    },
    // 弹框提示——显示
    // layerShow(text) {
    //   this.layerText = text
    //   this.$refs.layer.show()
    // },
    // 检查 是否记住密码/是否有已登过账户
    checkAccount() {
      // 检查是否记住密码-密码自动输入
      if (this.rememberPsw && this.loginPsw) {
        this.loginInfo.password = this.loginPsw
      } else {
        // 清空记住的密码
        this.SET_LOGINPSW({
          loginPsw: ''
        })
      }
      // 检查是否有已登录过的账户-账户自动输入
      if (this.userList && this.userList.length > 0) {
        this.loginInfo.credential = this.userList[0]
      }
    },
    ...mapMutations({
      SET_USERINFO: 'SET_USERINFO', // 当前登录用户信息
      SET_REMEMBERPSW: 'SET_REMEMBERPSW', // 是否记住密码 Boolean
      SET_LOGINPSW: 'SET_LOGINPSW', // 记住的登录密码 String
      SET_USERLIST: 'SET_USERLIST' // 记住的已经登录过账户列表 // Array
    })
  }
}
</script>
<style scoped lang="scss" rel="stylesheet/scss">
.content {
  width: 260px;
  height: auto;
  margin: 0 auto;
  text-align: center;

  .logo {
    width: 150px;
    height: 150px;
    margin-bottom: 20px;
  }

  .btn {
    width: 100%;
    height: 40px;
    border-radius: 6px;
    text-align: center;
    line-height: 40px;
    color: #fff;
    font-weight: bold;
    background-color: $red;
    opacity: 0.8;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .login {
    margin-top: 60px;
  }

  .logout {
    margin-top: 20px;
  }

  .tips {
    margin-top: 60px;
    font-size: 12px;
    color: #333;
    font-weight: bold;

    .update {
      cursor: pointer;
    }
  }
}

.login-info {
  position: relative;

  input {
    width: 100%;
    height: 40px;
    padding: 10px;
    border: 1px solid $border;
    border-radius: 4px;
    letter-spacing: 2px;
    @include placeholder-color($placeholder);
  }

  .checkbox {
    position: absolute;
    right: 0;
    bottom: -35px;
    display: flex;
    align-items: center;
    font-size: 12px;
    z-index: 1;

    img {
      margin-right: 6px;
    }

    input {
      position: absolute;
      left: -9999px;
    }
  }
}

.user-box {
  margin-bottom: 30px;
  position: relative;

  .arrow-d {
    position: absolute;
    width: 20px;
    height: 20px;
    right: 20px;
    bottom: 8px;
    cursor: pointer;
  }

  .user-list {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
    width: 100%;
    border: 1px solid $border;
    border-top: none;
    z-index: 2;

    li {
      position: relative;
      height: 50px;
      width: 100%;
      display: flex;
      align-items: center;
      background-color: $blank;
      padding-left: 10px;

      &:hover {
        background-color: rgb(234, 234, 234);

        .delete {
          display: block;
        }
      }

      img {
        width: 30px;
        height: 30px;
        border: 1px solid $border;
        margin-right: 15px;
      }

      .delete {
        display: none;
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 50px;
        text-align: center;
        background-color: $red;
        line-height: 50px;
        color: $blank;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
}
</style>