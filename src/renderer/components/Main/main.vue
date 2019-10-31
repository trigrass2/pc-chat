<template>
  <div class="main-wrap" @click="doSomeClose">
    <!-- 头部栏 -->
    <div class="user-info">
      <div class="info">
        <img class="headimg" :src="sUserInfo.headurl" />
        <span class="name">{{sUserInfo.nickname}}</span>
        <span class="skill">技能:({{sUserInfo.cusinfo.skills}})</span>
        <div class="status">
          <select v-model="sUserInfo.status" @change="changeStatus">
            <option value="1">正常</option>
            <option value="2">离开</option>
          </select>
          <img class="select-img" src="./img/arrow_d.png" />
        </div>
      </div>
      <div class="operator">
        <div @click="openHistory">历史</div>
        <div @click="openSetting">设置</div>
        <div @click="logout">注销</div>
      </div>
    </div>
    <div class="chat-wrap">
      <!-- 聊天入口 -->
      <Sidebar
        ref="sidebar"
        @getGroupInfo="getGroupInfo"
        @getPrivateInfo="getPrivateInfo"
        @getSessionInfo="getSessionInfo"
        @scrollToBottom="scrollToBottom"
      ></Sidebar>
      <div class="chat-main">
        <!-- 聊天头部栏 -->
        <div class="serve-status">
          <div class="max">
            <span>最大接待人数:</span>
            <span class="btn" @click="serviceNum(-1)">-</span>
            <span class="number">{{sUserInfo.cusinfo.maxsession}}</span>
            <span class="btn" @click="serviceNum(1)">+</span>
          </div>
          <div class="wait">
            <img src="./img/waiting.png" />
            <span>等待接入:{{waitNum}}人</span>
            <span class="btn" @click.stop="checkWait">查看</span>
          </div>
          <div class="wait-list" v-show="waitListShow">
            <ul>
              <template v-if="!waitList">
                <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
              </template>
              <template v-else-if="waitList && waitList.length > 0">
                <li v-for="(wait, index) in waitList" :key="wait.id">
                  <div class="top">
                    <!-- <div class="index">{{index+1}}</div> -->
                    <img
                      :src="[wait.headurl ? wait.headurl : require('./sub/message/img/noface.gif')]"
                    />
                    <div class="name">{{ wait.nickname }}</div>
                    <div class="time">{{wait.addtime}}</div>
                  </div>
                  <div class="bottom">
                    <div>{{wait.sesorigin.name}}</div>
                    VIP:{{wait.vip}}
                    <img v-for="i in wait.lv" src="./sub/sidebar/img/viplvl.png" />
                    <span v-if="wait.lv<=0">0</span>
                  </div>
                </li>
              </template>
              <div v-else class="noData">暂无数据</div>
            </ul>
          </div>
          <div class="rank">
            <p>
              今日已接
              <span>{{mysessions}}</span>人次，排名
              <span @click.stop="topCustListShow = true">{{myorder}}</span>
            </p>
          </div>
          <div class="rank-list" v-show="topCustListShow">
            <div class="top">
              <div>排行</div>
              <div>姓名</div>
              <div>数量</div>
            </div>
            <div class="ul-wrap">
              <ul>
                <template v-if="!topCustList">
                  <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
                </template>
                <template v-else-if="topCustList && topCustList.length > 0">
                  <li v-for="(cust, index) in topCustList" :key="cust.id">
                    <div class="index">{{index+1}}</div>
                    <div class="name">{{cust.nickname}}</div>
                    <div class="num">{{cust.c}}</div>
                  </li>
                </template>
                <div v-else class="noData">暂无数据</div>
              </ul>
            </div>
          </div>
        </div>
        <div class="main-con">
          <div class="con-left">
            <!-- 消息内容展示框 -->
            <Message ref="msg" @getGroupList="getGroupList" @getPrivateList="getPrivateList" ></Message>
            <!-- 内容输入栏 -->
            <Textbox ref="textbox" @scrollToBottom="scrollToBottom"></Textbox>
          </div>
          <div
            class="con-right"
            v-show="(groupInfoShow || privateInfoShow || sessionInfoShow) && conRightShow"
          >
            <!-- {{groupInfoShow}}/{{privateInfoShow}}/{{sessionInfoShow}}/{{chatType}} -->
            <!-- 群聊相关 -->
            <groupInfo
              ref="groupInfo"
              v-show="groupInfoShow && chatType === 2"
              @atTa="atTa"
              @selectPrivateChat="selectPrivateChat"
            ></groupInfo>
            <!-- 私聊相关 -->
            <privateInfo ref="privateInfo" v-show="privateInfoShow && chatType === 3"></privateInfo>
            <!-- 会话相关 -->
            <sessionInfo ref="sessionInfo" v-show="sessionInfoShow && chatType === 1"></sessionInfo>
          </div>
        </div>
      </div>
    </div>
    <div class="loseConnect" v-show="connectNum == 3">
      <div class="status">{{connectStatus}}</div>
      <div class="connect" @click="newWsConnect('click')">重新连接</div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { GROUPAPI } from 'api/http/groupChat'
import { sessionRank } from 'api/http/sessionChat'
import { copy, copy2, debounce, formatDate } from 'common/js/util'
import { addId } from 'common/js/business'

// import Info from "./sub/info";
import Sidebar from './sub/sidebar'
import Message from './sub/message'
import Textbox from './sub/textbox'
import groupInfo from './sub/groupInfo'
import sessionInfo from './sub/sessionInfo'
import privateInfo from './sub/privateInfo'
import { setTimeout } from 'timers'

export default {
  data() {
    return {
      // ws重新连接次数
      connectNum: 0,
      // ws连接状态
      connectStatus: '与服务器连接中断!',
      // 会话——排队人数
      waitNum: 0,
      // 会话——排队列表
      // waitList: [
      //   {
      //     id: 1,
      //     nickname: '哈哈哈哈哈',
      //     addtime: '12:12:12',
      //     sesorigin: {
      //       name: '???/asd'
      //     },
      //     vip: 'asd',
      //     lv: 4
      //   }
      // ],
      waitList: null,
      waitListShow: false,
      // 会话——已经接待人数
      mysessions: '未知',
      // 会话——接待人数排名
      myorder: '未知',
      // 会话——接待人数排行榜
      // topCustList: [
      //   {
      //     id: 1,
      //     nickname: '哈是的哈是的哈实打实的',
      //     c: 1021
      //   }
      // ],
      topCustList: null,
      topCustListShow: false,
      // 长轮询，未读消息数量/member操作——用来决定是否重新请求最新消息列表
      hertBeat: {
        unReadPrivateMessage: null,
        teamMember: null,
        unReadTeamMessage: null
      }
    }
  },
  created() {
    // ws重连
    this.newWsConnect()
    // 监听客服状态改变——回执
    this.listenStatus()
    // 监听登出——回执
    this.listenLogout()
    // 监听修改最大接待人数——回执
    this.listenServiceNum()
    // 监听会话排队人数变化——回执
    this.listenWaitNum()
    // 监听会话排队列表——回执
    this.listenGetWaitList()
    // 获取会话排行
    this.getSessionRank()
    // 监听ws重新连接——回执
    this.listenNewConnect()
    // this.getHertBeat()
    // this.getGroupChatList()
    // 最新消息列表
    // this.getMsgLast()
    // 群未读消息
    // this.getGropNoReadMsg()
  },
  mounted() {},
  computed: {
    // 群组相关内容 会话相关内容  私聊相关内容  聊天类型  用户信息  未读私聊消息  未读群聊消息  群操作  会话聊天内容  群聊聊天内容  私聊聊天内容
    ...mapGetters([
      'conRightShow',
      'groupInfoShow',
      'sessionInfoShow',
      'privateInfoShow',
      'chatType',
      'gUserInfo',
      'sUserInfo',
      'unReadPrivateMsg',
      'unReadGroupMsg',
      'groupOperate',
      'sessionMsgList',
      'groupList'
      // 'groupMsgList',
      // 'privateMsgList'
    ])
  },
  components: {
    Sidebar,
    Message,
    Textbox,
    groupInfo,
    sessionInfo,
    privateInfo
  },
  methods: {
    // ws重新连接
    newWsConnect(num) {
      // 手动
      if (num == 'click') {
        // 防止多次点击
        if (this.isConnectOk) {
          return
        }
        this.isConnectOk = true
        num = 2
        this.connectStatus = '正在尝试重新与服务器重新建立连接...'
        setTimeout(() => {
          if (this.connectNum != 0) {
            this.isConnectOk = false
            this.connectStatus = '尝试连接失败'
          }
        }, 3000)
      }
      if (num) {
        this.connectNum = num
      }
      if (this.connectNum >= 3) {
        return
      }
      this.connectNum++
      let _data = {
        userid: this.sUserInfo.userid,
        cookie: this.sUserInfo.tokenid
      }
      let data = JSON.stringify({ cmdid: 1024, data: _data })
      this.$ws.send(data)
    },
    // 监听ws发送重新连接——回执
    listenNewConnect() {
      this.$wsBus.$on('1024', res => {
        if (res.returncode === '0') {
          // 连接成功
          this.connectNum = 0
          this.isConnectOk = false
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 改变客服状态
    changeStatus() {
      let _data = {
        userid: this.sUserInfo.userid,
        status: this.sUserInfo.status
      }
      let data = JSON.stringify({ cmdid: 1022, data: _data })
      // console.log('我发送的会话消息', data)
      this.$ws.send(data)
    },
    // 监听客服状态改变——回执
    listenStatus() {
      this.$wsBus.$on('1022', res => {
        if (res.returncode === '0') {
          // console.log('监听客服状态改变——回执', this.sUserInfo)
          this.SET_SUSERINFO({
            sUserInfo: this.sUserInfo
          })
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 登出
    logout() {
      let _data = {
        userid: this.sUserInfo.userid
      }
      let data = JSON.stringify({ cmdid: 1010, data: _data })
      // console.log('登出', data)
      this.$ws.send(data)
    },
    // 监听登出——回执
    listenLogout() {
      this.$wsBus.$on('1010', res => {
        if (res.returncode === '0') {
          this.$electron.ipcRenderer.send('logout')
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 修改最大接待人数
    serviceNum(num) {
      let maxNum = Number(this.sUserInfo.cusinfo.maxsession + num)
      if (maxNum < 1) {
        maxNum = 1
      }
      this.sUserInfo.cusinfo.maxsession = maxNum
      let _data = {
        userid: this.sUserInfo.userid,
        maxsession: maxNum
      }
      let data = JSON.stringify({ cmdid: 1208, data: _data })
      // console.log('修改最大接待人数', data)
      this.$ws.send(data)
    },
    // 监听修改最大接待人数——回执
    listenServiceNum() {
      this.$wsBus.$on('1208', res => {
        if (res.returncode === '0') {
          // console.log('监听修改最大接待人数——回执', this.sUserInfo)
          this.SET_SUSERINFO({
            sUserInfo: this.sUserInfo
          })
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 查看会话排队列表
    checkWait() {
      // 获取会话排队列表
      this.getWaitList()
      this.waitListShow = true
    },
    // 监听会话排队人数变化
    listenWaitNum() {
      this.$wsBus.$on('1205', res => {
        if (res.returncode === '0') {
          // console.log('监听会话排队人数变化')
          this.waitNum = res.data.num
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 获取会话排队列表
    getWaitList() {
      let _data = {
        userid: this.sUserInfo.userid
      }
      let data = JSON.stringify({ cmdid: 1206, data: _data })
      // console.log('获取会话排队列表', data)
      this.$ws.send(data)
    },
    // 监听会话排队列表——回执
    listenGetWaitList() {
      this.$wsBus.$on('1206', res => {
        // console.log(res, '监听会话排队列表——回执')
        if (res.returncode === '0') {
          let list = res.data
          if (list && list > 0) {
            let id = 1
            list.forEach((e, i, arr) => {
              e.id = id
              e.addtime = formatDate('hh:mm:ss', e.addtime)
              id++
            })
          }
          this.waitList = list
          this.waitNum = list.length
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 获取会话排行
    getSessionRank() {
      sessionRank()
        .then(res => {
          if (res.data.returncode === '0') {
            this.myorder = res.data.myorder
            this.mysessions = res.data.mysessions
            this.topCustList = addId(res.data.list)
          } else {
            this.$refs.layer.show(res.returnmsg)
          }
        })
        .catch(res => {
          this.newWsConnect()
          this.$refs.layer.show(res)
        })
      // 每隔10秒获取排行列表
      setTimeout(() => {
        this.getSessionRank()
      }, 10000)
    },
    // 请求私聊列表
    getPrivateList() {
      this.$refs.sidebar.getPrivateList()
    },
    // 请求群列表
    getGroupList() {
      this.$refs.sidebar.getGroupList()
    },
    // 打开历时记录
    openHistory() {
      this.$electron.ipcRenderer.send('openHistory')
    },
    // 打开设置
    openSetting() {
      this.$electron.ipcRenderer.send('openSetting')
    },
    // 群成员——私聊
    selectPrivateChat(privateInfo) {
      this.$refs.sidebar.selectPrivateChat(privateInfo)
    },
    // 群成员——atTa
    atTa(data) {
      // console.log('@', this.$refs.textbox)
      this.$refs.textbox.atTa(data)
    },
    // 获取会话相关信息(聊天记录)
    async getSessionInfo(sessionInfo, page) {
      // 会话历史消息
      await this.$refs.sessionInfo.getSessionMsg(sessionInfo, page)
    },
    // 获取群相关信息(成员/聊天记录)
    async getGroupInfo(groupInfo, type) {
      // 群成员
      await this.$refs.groupInfo.getGroupMember(groupInfo)
      // 群历史消息
      await this.$refs.groupInfo.getGroupMsg(groupInfo, type)
      // 群即时消息
      await this.$refs.msg.getGroupMsg(groupInfo)
    },
    // 获取私聊相关信息(聊天记录)
    getPrivateInfo(privateInfo, page) {
      // 私聊历史消息
      this.$refs.privateInfo.getPrivateMsg(privateInfo, page)
      // 私聊即时消息
      this.$refs.msg.getPrivateMsg(privateInfo)
    },
    doSomeClose() {
      this.waitListShow = false
      this.topCustListShow = false
      this.$refs.groupInfo.colseProfile()
    },
    // 第一次群未读消息
    async getGropNoReadMsg() {
      await GROUPAPI.gNoReadMsgNumber({
        userId: this.gUserInfo.userId,
        fundAccount: this.gUserInfo.fundAccount
      })
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            // console.log('第一次群未读消息', resData)
            var teamp = resData.teamMessage.teamUnReadMessageMap
            // if (JSON.stringify(teamp) !== '{}') {
            //   for (let key in teamp) {
            //     let val = teamp[key]
            // this.groupTeamList.forEach((e, i, arr) => {
            // if(val.)
            // })
            //   }
            // }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 滚动到底部
    scrollToBottom() {
      // console.log('滚动到底部')
      this.$refs.msg.scrollToBottom()
    },
    ...mapMutations({
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_PRIVATEINFO: 'SET_PRIVATEINFO',
      SET_SESSIONINFO: 'SET_SESSIONINFO',
      SET_SESSION_MSG: 'SET_SESSION_MSG',
      SET_CHATTYPE: 'SET_CHATTYPE',
      SET_SUSERINFO: 'SET_SUSERINFO'
    })
  }
}
</script>

<style lang='scss' scoped rel="stylesheet/scss">
.loseConnect{
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding-top: 200px;
  background-color: rgba(0,0,0,.5);
  text-align: center;
  .status{
    color: $red;
    font-size: 26px;
    font-weight: bold;
    text-align: center;
  }
  .connect{
    color: $red;
    font-size: 26px;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }
}
.noData {
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: rgb(83, 83, 83);
}
.main-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  .user-info {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    align-items: center;
    background-color: $red;
  }
  .chat-wrap {
    flex: 1;
  }
}
.chat-wrap {
  display: flex;
  .chat-main {
    display: flex;
    flex-direction: column;
    flex: 3;
    .main-con {
      flex: 1;
      display: flex;
      .con-left {
        display: flex;
        flex-direction: column;
        // position: relative;
        height: 100%;
        border-right: 1px solid $border;
        flex: 2;
      }
      .con-right {
        flex: 1;
      }
    }
  }
}
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .headimg {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  .name {
    color: $blank;
    font-size: 12px;
    font-weight: bold;
    margin: 0 10px;
  }
  .skill {
    color: $blank;
    font-size: 12px;
    margin-right: 10px;
  }
  .status {
    position: relative;
    select {
      width: 50px;
      height: 22px;
      padding: 2px;
      font-size: 12px;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    .select-img {
      width: 12px;
      height: 12px;
      position: absolute;
      right: 6px;
      bottom: 4px;
      background: transparent;
      pointer-events: none;
    }
  }
}
.operator {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  width: 120px;
  justify-content: space-between;
  div {
    cursor: pointer;
  }
}
.serve-status {
  display: flex;
  align-items: center;
  width: 100%;
  height: 41px;
  border: 1px solid $border;
  border-left: 1px;
  background-color: $listHover;
  padding-left: 10px;
  font-size: 14px;
  .top {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      height: 40px;
      margin-right: 6px;
      border-radius: 50%;
    }
    .time {
      margin-top: -20px;
      color: rgb(83, 83, 83);
    }
    .index {
      font-size: 20px;
      color: $green;
      margin-right: 10px;
    }
    .name {
      flex: 1;
      font-size: 14px;
      width: 60px;
      @include ellipsis(1);
    }
  }
  .bottom {
    font-size: 14px;
    margin-top: 5px;
    color: rgb(83, 83, 83);
  }
  .max {
    margin-right: 10px;
    .btn {
      cursor: default;
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: $blank;
      border: 1px solid $border;
      line-height: 20px;
      text-align: center;
    }
    .number {
      margin: 0 5px;
    }
  }
  .wait {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 170px;
    margin-right: 10px;
    .btn {
      cursor: default;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: $blank;
      border: 1px solid $border;
      text-align: center;
    }
  }
  .wait-list {
    margin-top: 200px;
    margin-left: 200px;
    width: 200px;
    background-color: #fff;
    height: 350px;
    position: absolute;
    z-index: 1;
    overflow: auto;
    border: 1px solid #e5e5e5;
    box-shadow: 0 0 10px rgba(0, 0, 10px, 0.4);
    li {
      border-bottom: 1px solid #e5e5e5;
      padding: 10px;
    }
  }
  .rank {
    span {
      display: inline-block;
      margin: 0 4px;
      color: $red;
    }
  }
  .rank-list {
    top: 100px;
    margin-left: 400px;
    width: 200px;
    background-color: #fff;
    height: 350px;
    position: absolute;
    z-index: 1;
    border: 1px solid #e5e5e5;
    box-shadow: 0 0 10px rgba(0, 0, 10px, 0.4);
    padding-top: 30px;
    display: flex;
    // position: relative;
    flex-direction: column;
    .top {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: space-between;
      top: 0;
      left: 0;
      width: 100%;
      border-bottom: 1px solid #e5e5e5;
      height: 30px;
      padding: 0 10px;
    }
    .ul-wrap {
      flex: 1;
      overflow: auto;
      ul {
        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e5e5;
          padding: 10px;
          font-size: 16px;
          .index {
            color: $red;
          }
          .name {
            width: 50px;
            @include ellipsis(1);
          }
          .num {
            color: $green;
          }
        }
      }
    }
  }
}
</style>