<template>
  <div class="main-wrap" @click="()=>{this.waitListShow=false;this.topCustListShow=false}">
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
        :groupInfo="groupCurrent.groupInfo"
        :groupTeamList="groupTeamList"
        :privateTeamList="privateTempList"
        :atMeList="atMeList"
        @getGroupInfo="getGroupInfo"
        @getPrivateInfo="getPrivateInfo"
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
            <Message
              ref="msg"
              :groupInfo="groupCurrent.groupInfo"
              :groupMsgList="groupCurrent.groupMsgList"
              :groupMembers="groupCurrent.groupMembers"
              :privateInfo="currentPrivate.privateInfo"
              :privateMsgList="currentPrivate.privateMsgList"
            ></Message>
            <!-- 内容输入栏 -->
            <Textbox
              ref="textbox"
              :groupInfo="groupCurrent.groupInfo"
              :groupMsgList="groupCurrent.groupMsgList"
              :privateInfo="currentPrivate.privateInfo"
              :privateMsgList="currentPrivate.privateMsgList"
              :groupMyMsgNum="groupMyMsgNum"
              :privateMyMsgNum="currentSession.privateMyMsgNum"
            ></Textbox>
          </div>
          <div class="con-right" v-show="groupInfoShow || privateInfoShow">
            <!-- 群聊相关 -->
            <groupInfo
              ref="groupInfo"
              v-show="groupInfoShow && chatType === 2"
              :groupMsgHistory="groupCurrent.groupMsgHistory"
              :groupMembers="groupCurrent.groupMembers"
              @getGroupMsgHistory="getGroupMsg"
              @goPrivateChat="goPrivateChat"
              @atTa="atTa"
            ></groupInfo>
            <!-- 私聊相关 -->
            <privateInfo
              ref="privateInfo"
              :privateMsgHistory="currentPrivate.privateMsgHistory"
              :privateHistoryParams="privateHistoryParams"
              @getPrivateMsgHistory="getPrivateMsg"
              v-show="privateInfoShow && chatType === 3"
            ></privateInfo>
            <!-- 会话相关 -->
            <!-- <sessionInfo v-show="sessionInfoShow && chatType === 1"></sessionInfo> -->
          </div>
        </div>
      </div>
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

const FRIEND = 1 // 同伴
const GROUP = 2 // 群聊
const PRIVATE = 3 // 私聊
const VISITOR = 5 // 游客

const ONLINE = 1
// const OUTLINE = 2;

export default {
  data() {
    return {
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
      // 群@我的消息列表
      atMeList: [],
      // 群聊群列表信息
      groupTeamList: null,
      // 私聊列表信息
      privateTempList: null,
      // 群列表我发送的消息数量
      groupMyMsgNum: {},
      // 私聊列表我发送的消息数量
      privateMyMsgNum: {},
      // 全部群消息缓存
      groupsMsgCache: [],
      // 全部私聊消息缓存
      privatesMsgCache: [],
      // 当前会话
      currentSession: {
        // 当前群信息
        sessionInfo: null,
        // 当前群，群成员
        // groupMembers: null,
        // 当前群，消息
        sessionMsgList: null
        // 当前群，历史消息
        // sessionMsgHistory: null
      },
      // 当前群
      groupCurrent: {
        // 当前群信息
        groupInfo: null,
        // 当前群，群成员
        groupMembers: null,
        // 当前群，消息
        groupMsgList: null,
        // 当前群，历史消息
        groupMsgHistory: null
      },
      // 当前私聊
      currentPrivate: {
        // 当前私聊信息
        privateInfo: null,
        // 当前私聊消息列表
        privateMsgList: null,
        // 当前私聊历史消息
        privateMsgHistory: null
      },
      // 长轮询，未读消息数量/member操作——用来决定是否重新请求最新消息列表
      hertBeat: {
        unReadPrivateMessage: null,
        teamMember: null,
        unReadTeamMessage: null
      },
      // 最新消息列表
      // msgLast: {
      //   friendMsg: null, // 伙伴
      //   groupMsg: null, // 群聊内容列表
      //   privateMsg: null, // 私聊内容列表
      //   visitorMsg: null // 游客
      // },
      // 请求群历史记录——参数
      groupHistoryParams: {
        toid: '', // 群id
        fromid: '', // 用户id
        teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        // 翻页的时候,把列表中离当前时间最远的消息的msgid(第一次查询不用传)
        msgid: ''
      },
      // 请求群内单聊记录——参数
      privateHistoryParams: {
        toid: '', // 接收者id
        fromid: '', // 发送者id
        // teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        page: 1, // 当前页
        pages: null // 总页数
      },
      // 请求群成员——参数
      groupMemberParams: {
        teamid: '', // 群id
        userId: '' // 用户id
      }
    }
  },
  created() {
    // 初始化数据加载
    this.init()
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
    // this.getHertBeat()
    // this.getGroupChatList()
    // 最新消息列表
    // this.getMsgLast()
    // 群未读消息
    // this.getGropNoReadMsg()
  },
  mounted() {
    setTimeout(() => {
      console.log(
        this.chatType,
        this.groupInfoShow,
        this.sessionInfoShow,
        this.privateInfoShow
      )
    }, 2000)
  },
  computed: {
    // 群组相关内容 会话相关内容  私聊相关内容  聊天类型  用户信息  未读私聊消息  未读群聊消息  群操作  会话聊天内容  群聊聊天内容  私聊聊天内容
    ...mapGetters([
      'groupInfoShow',
      'sessionInfoShow',
      'privateInfoShow',
      'chatType',
      'gUserInfo',
      'sUserInfo',
      'unReadPrivateMsg',
      'unReadGroupMsg',
      'groupOperate',
      'sessionMsgList'
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
    // 改变客服状态
    changeStatus() {
      let _data = {
        userid: this.sUserInfo.userid,
        status: this.sUserInfo.status
      }
      let data = JSON.stringify({ cmdid: 1022, data: _data })
      console.log('我发送的会话消息', data)
      this.$ws.send(data)
    },
    // 监听客服状态改变——回执
    listenStatus() {
      this.$wsBus.$on('1022', res => {
        console.log(res)
        if (res.returncode === '0') {
          console.log('监听客服状态改变——回执', this.sUserInfo)
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
      console.log('登出', data)
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
      console.log('修改最大接待人数', data)
      this.$ws.send(data)
    },
    // 监听修改最大接待人数——回执
    listenServiceNum() {
      this.$wsBus.$on('1208', res => {
        if (res.returncode === '0') {
          console.log('监听修改最大接待人数——回执', this.sUserInfo)
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
        console.log(res)
        if (res.returncode === '0') {
          console.log('监听会话排队人数变化')
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
      console.log('获取会话排队列表', data)
      this.$ws.send(data)
    },
    // 监听会话排队列表——回执
    listenGetWaitList() {
      this.$wsBus.$on('1206', res => {
        console.log(res, '监听会话排队列表——回执')
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
          console.log(res)
          if (res.data.returncode === '0') {
            this.myorder = res.data.myorder
            this.mysessions = res.data.mysessions
            this.topCustList = addId(res.data.list)
          } else {
            this.$refs.layer.show(res.returnmsg)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
      // 每隔10秒获取排行列表
      setTimeout(() => {
        this.getSessionRank()
      }, 10000)
    },
    // 心跳长轮询(未读私聊消息/未读群成员/未读群聊消息)
    async getHertBeat() {
      // console.log('进来心跳长轮询')
      //   setTimeout(() => {
      //     // 未读私聊消息
      //     this.SET_UNREADPMSG({
      //       unReadPrivateMsgNum: 123,
      //       unReadPrivateMsg: {
      //         privateUnReadMessageNumberTotal: 1,
      //         privateUnReadMessageMap: [
      //           {
      //             id: 1,
      //             fromUserId: '123',
      //             unReadPrivateMsgCount: '12',
      //             currentMessageId: '1',
      //             readPrivateMessageId: ''
      //           }
      //         ]
      //       }
      //     })
      //     console.log('还可以吗')
      //   }, 1500)

      // 获取未读消息前，先把私聊列表更新一下
      // await this.getPrivateList()
      // 获取未读消息
      await GROUPAPI.gHertBeat({ userId: this.gUserInfo.userId })
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
            // console.log('未读消息数量', resData)
            var teampUnReads = resData.teamMessage.teamUnReadMessageMap
            var privateUnReads = resData.privateMessage.privateUnReadMessageMap
            // 遍历群未读消息
            if (JSON.stringify(teampUnReads) !== '{}') {
              for (let key in teampUnReads) {
                let teampUnRead = teampUnReads[key]
                let teampUnReadNum = teampUnRead.unReadTeamMessageNumber
                // 此前心跳传的未读消息
                let all = this.groupMyMsgNum[teampUnRead.teamId].all
                // 此前在该群我发送消息的数量
                let num = this.groupMyMsgNum[teampUnRead.teamId].my
                let team = this.groupTeamList.find((e, i, arr) => {
                  return Number(e.teamid) === Number(teampUnRead.teamId)
                })
                // 如果未读群消息在群列表不存在，就去重新请求群列表(需要去防止多次请求群列表)
                if (!team) {
                  this.getGroupChatList()
                  continue
                }
                // 如果有未读消息, 就去更新群消息 和 进行At列表处理
                if (teampUnReadNum && teampUnReadNum > 0) {
                  this.getGroupMsg(team, null, 'beatUpdate')
                }
                // 当前群的话，不加红色提醒
                if (
                  this.chatType === 2 &&
                  Number(teampUnRead.teamId) ===
                    Number(this.groupCurrent.groupInfo.teamid)
                ) {
                  continue
                }
                // 此前心跳传过值且和当前心跳传的值相同时, 未读消息为0
                if (all && all === teampUnReadNum) {
                  // 点击过该群聊列表,会清零
                  if (team.unReadNum && team.unReadNum === 0) {
                    num = 0
                  } else {
                    // 没点击过该群聊列表
                    num = teampUnReadNum - num
                  }
                } else {
                  // 此前心跳未传过值 或 和当前心跳传的值不相同时
                  this.groupMyMsgNum[teampUnRead.teamId].all = teampUnReadNum
                  // 该群未读总消息数量-我的消息数量
                  num = teampUnReadNum - num
                  // 我发送的消息数量清空
                  this.groupMyMsgNum[teampUnRead.teamId].my = 0
                }
                if (num < 0) {
                  num = 0
                }
                // 给群列表设置未读数量字段
                this.$set(team, 'unReadNum', num)
              }
            }
            // 遍历私聊未读消息
            if (JSON.stringify(privateUnReads) !== '{}') {
              for (let key in privateUnReads) {
                let privateUnRead = privateUnReads[key]
                let privateUnReadNum = privateUnRead.unReadPrivateMsgCount
                // 此前心跳传的未读消息
                let all = this.privateMyMsgNum[privateUnRead.fromUserId].all
                // 此前在该群我发送消息的数量
                let num = this.privateMyMsgNum[privateUnRead.fromUserId].my
                let prvat = this.privateTempList.find((e, i, arr) => {
                  return e.id === privateUnRead.fromUserId
                })
                // 如果未读私聊消息在私聊列表也不存在，就去重新请求私聊列表(需要去防止多次请求私聊列表)
                if (!prvat) {
                  this.getPrivateList()
                  continue
                }
                // 如果有未读消息, 就去更新私聊消息
                if (privateUnReadNum && privateUnReadNum > 0) {
                  this.getGroupMsg(team, null, 'beatUpdate')
                }
                // 当前私聊的话，不加红色提醒
                if (
                  this.chatType === 3 &&
                  privateUnRead.fromUserId ===
                    this.currentPrivate.privateInfo.id
                ) {
                  continue
                }
                // 此前心跳传过值且和当前心跳传的值相同时, 未读消息为0
                if (all && all === privateUnReadNum) {
                  // 点击过该私聊列表,会清零
                  if (prvat.unReadNum && prvat.unReadNum === 0) {
                    num = 0
                  } else {
                    // 没点击过该私聊列表
                    num = privateUnReadNum - num
                  }
                } else {
                  // 此前心跳未传过值或和当前心跳传的值不相同时
                  this.privateMyMsgNum[privateUnRead.fromUserId].all = privateUnReadNum
                  // 该群未读总消息数量-我的消息数量
                  num = privateUnReadNum - num
                  // 我发送的消息数量清空
                  this.privateMyMsgNum[privateUnRead.fromUserId].my = 0
                }
                if (num < 0) {
                  num = 0
                }
                // 给私聊列表设置未读数量字段
                this.$set(prvat, 'unReadNum', num)
              }
            }
            this.getHertBeat()
            // if (
            //   this.hertBeat.unReadTeamMessage !==
            //   resData.teamMessage.teamUnReadMessageNumberTotal
            // ) {
            //   this.getHertBeat()
            // }
            // this.SET_UNREADPMSG({
            //   unReadPrivateMsg: resData.privateMessage
            // })

            // console.log(this.groupTeamList)
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          // console.log(123123)
          this.$refs.layer.show(res)
        })
    },
    // haha() {
    //   this.$ws.send('我传信息过来了哦')
    // },
    // 获取群相关信息(成员/聊天记录)
    async getGroupInfo(data, msgid, page) {
      this.groupCurrent.groupInfo = data
      await this.getGroupMember(data)
      // 请求群历史消息
      await this.getGroupMsg(data, msgid, page)
    },
    // 获取私聊相关信息(聊天记录)
    async getPrivateInfo(data, page, type) {
      this.currentPrivate.privateInfo = data
      await this.getPrivateMsg(data, page, type)
    },
    // 初始化
    async init() {
      // 右侧信息栏都关上
      this.SET_GROUPINFO({
        groupInfoShow: false
      })
      this.SET_PRIVATEINFO({
        privateInfoShow: false
      })
      this.SET_SESSIONINFO({
        sessionInfoShow: false
      })
      // 获取群列表数据
      await this.getGroupChatList()
      // 去请求私聊消息列表
      await this.getPrivateList()
      // 对得到的群数据做处理
      await this.groupTeamsHandle()
      // 私聊历史消息
      // await this.getPrivateMsg()
      // 获取最新消息数据
      // await this.getMsgLast()
      // 第一次未读消息
      // await this.getGropNoReadMsg()
      // 心跳长轮询(私聊未读消息/群成员/群聊未读消息)
      await this.getHertBeat()
    },
    // 群列表
    async getGroupChatList() {
      await GROUPAPI.gChatList({ userId: this.gUserInfo.userId })
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            this.groupTeamList = JSON.parse(resData)
            console.log('我的群列表', this.groupTeamList)
            // 初始化我在每个群 发送的消息的数量
            this.groupTeamList.forEach((e, i, arr) => {
              if (!this.groupMyMsgNum[e.teamid]) {
                this.groupMyMsgNum[e.teamid] = {
                  my: 0,
                  all: null
                }
              }
            })
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
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
            console.log('第一次群未读消息', resData)
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
    // 群消息（即时聊天/历史记录）
    /**
     * data: 群信息
     * msgid: 当前列表中离当前时间最远消息的uuid
     * page: 是否下一页
     * type: chat当前聊天/history聊天历史
     * msgCache: 缓存下来的群消息列表
     */
    getGroupMsg(group, msgid, page) {
      console.log('来请求群历史记录了', group, msgid, page)
      this.groupHistoryParams.fromid = this.gUserInfo.userId
      // 当前列表中离当前时间最远消息的uuid——用于分页
      if (msgid) {
        this.groupHistoryParams.msgid = msgid
      } else {
        this.groupHistoryParams.msgid = ''
      }
      // 群信息
      if (group) {
        this.groupHistoryParams.toid = this.groupHistoryParams.teamid =
          group.teamid
      }
      GROUPAPI.gMsgHistory(this.groupHistoryParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            console.log('群消息数据', resData)
            if (page !== 'beatUpdate') {
              // 关闭下一页锁
              if (resData.length === 1 || resData.length === 0) {
                this.$refs.groupInfo.nextClose()
              } else {
                // 打开下一页锁
                this.$refs.groupInfo.nextOpen()
              }
            }
            // if (page === 'next' && type === 'chat') {
            //   this.groupCurrent.groupMsgList = this.groupCurrent.groupMsgList.concat(
            //     resData
            //   )
            //   console.log(console.log('即使聊天'))
            // } else
            // 群历史记录翻页
            if (page === 'next') {
              // 去掉重叠的一条
              let index = resData.findIndex((e, i, arr) => {
                this.groupHistoryParams.msgid === e.msgid
              })
              resData.splice(index, 1)
              this.groupCurrent.groupMsgHistory = this.groupCurrent.groupMsgHistory.concat(
                copy(resData).reverse()
              )
              // 打开下一页锁
              // this.$refs.info.nextOpen()
            } else {
              // 点击群列表——获取群历史记录/群即时消息 + 心跳更新
              // 获取/新增群缓存消息
              let msgCache
              if (this.groupsMsgCache.length > 0) {
                msgCache = this.groupsMsgCache.find((e, i, arr) => {
                  return e.id == group.teamid
                })
              }
              // 之前没该群缓存就新增缓存，并直接去消息里取atList
              if (!msgCache) {
                msgCache = {
                  id: group.teamid,
                  msgs: []
                }
                this.groupsMsgCache.push(msgCache)
                if (page == 'beatUpdate') {
                  // 当前消息请求群和当前打开群不一样的时候才去添加atList
                  if (this.groupCurrent.groupInfo.teamid != group.teamid) {
                    // 循环消息内容——判断消息中是否有at消息,有的话新增进atList
                    resData.forEach((e, i, arr) => {
                      if (e.atMsg == '1' && e.atlist.length > 0) {
                        console.log('at列表', atlist)
                        // 循环atlist——找到@我的消息
                        this.getAtMeMsg(e, e.atlist)
                      }
                    })
                  }
                }
              } else {
                if (page == 'beatUpdate') {
                  // 当前消息请求群和当前打开群不一样的时候才去添加atList
                  if (this.groupCurrent.groupInfo.teamid != group.teamid) {
                    // 之前有缓存就比较请求返回消息和缓存消息，去取新增消息的atList
                    resData.forEach((e, i, arr) => {
                      let isHas = msgCache.msgs.find((e1, i1, arr1) => {
                        return e.msgid == e1.msgid
                      })
                      // 如果有新增消息且有at信息
                      if (!isHas && e.atMsg === '1') {
                        console.log('未读群消息有at信息', e.atlist)
                        // 循环atlist——找到@我的消息
                        this.getAtMeMsg(e, e.atlist)
                      }
                    })
                  }
                }
              }
              // 更新消息缓存
              msgCache.msgs = resData
              // 群聊切换/群历史查询/当前消息请求群和当前打开群一样的时候才去更新消息
              if (this.groupCurrent.groupInfo.teamid != group.teamid) {
                return
              }
              if (resData.length === 0) {
                // null——>Object 可以被响应式监听到
                // Object1——>Object2 不可以
                if (this.groupCurrent.groupMsgHistory) {
                  this.groupCurrent.groupMsgHistory.splice(
                    0,
                    this.groupCurrent.groupMsgHistory.length
                  )
                } else {
                  this.groupCurrent.groupMsgHistory = []
                }
                if (this.groupCurrent.groupMsgList) {
                  this.groupCurrent.groupMsgList.splice(
                    0,
                    this.groupCurrent.groupMsgList.length
                  )
                } else {
                  this.groupCurrent.groupMsgList = []
                }
              } else {
                this.groupCurrent.groupMsgList = resData
                this.groupCurrent.groupMsgHistory = copy(resData).reverse()
              }
              console.log('重新点击', resData)
            }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 群成员列表
    /**
     * data: 群信息
     * groupInfo: 缓存下来的群信息
     */
    async getGroupMember(data) {
      // console.log(123123123)
      this.groupMemberParams.userId = this.gUserInfo.userId
      this.groupMemberParams.teamid = data.teamid
      // console.log(this.groupMemberParams)
      await GROUPAPI.gMembers(this.groupMemberParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            // 接口每次返回的群成员顺序不同，这里做个排序来保持相同
            resData = JSON.parse(resData).sort((a, b) => {
              return a.id - b.id
            })
            console.log('成员' + JSON.stringify(resData))
            this.groupCurrent.groupMembers = resData
            // console.log(JSON.parse(resData))
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 打开历时记录
    openHistory() {
      this.$electron.ipcRenderer.send('openHistory')
    },
    // 打开设置
    openSetting() {
      this.$electron.ipcRenderer.send('openSetting')
    },
    reduce() {
      console.log(111)
    },
    add() {
      console.log(222)
    },
    // 给每个群增加部分字段
    async groupTeamsHandle() {
      // 用户id赋值
      this.groupHistoryParams.fromid = this.gUserInfo.userId
      // 遍历群获取群数据
      for (let i = 0; i < this.groupTeamList.length; i++) {
        var e = this.groupTeamList[i]
        // 每个群增加是否选中字段
        this.$set(e, 'isSelected', false)
        // 默认第一个群被选中
        if (i === 0) {
          e.isSelected = true // 用于样式展示
          this.groupCurrent.groupInfo = e // 用于数据处理
        }
        // 群id赋值
        this.groupHistoryParams.toid = this.groupHistoryParams.teamid = e.teamid
        // 获取群历史消息记录(去获取最近一条消息的时间)
        await GROUPAPI.gMsgHistory(this.groupHistoryParams).then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            if (resData && resData.length > 0) {
              // 给每个群增加最新消息时间字段
              let lastTime = resData[resData.length - 1].sendTime.split(' ')[0]
              e.lastTime = lastTime
            }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
      }
    },
    // 私聊消息（即时聊天/历史记录）
    /**
     * data: 当前私聊
     */
    async getPrivateMsg(data, page, type) {
      this.privateHistoryParams.toid = this.gUserInfo.userId // 接收者id
      if (data) {
        this.privateHistoryParams.fromid = data.id // 发送者id
      }
      if (page) {
        this.privateHistoryParams.page = page
      }
      await GROUPAPI.gPrivateMsg(this.privateHistoryParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
            this.privateHistoryParams.pages = resData.pages
            console.log(
              '私聊历史',
              JSON.parse(this.$crypto.decrypt(res.data.body))
            )
            // 切换群/历史分页(非心跳)时才执行
            if (type != 'beatUpdate') {
              // 下一页状态判断
              if (!resData.pages || resData.pageNum === resData.pages) {
                this.$refs.privateInfo.nextClose()
              } else {
                this.$refs.privateInfo.nextOpen()
              }
              // 上一页状态判断
              if (resData.pageNum === 1) {
                this.$refs.privateInfo.preClose()
              } else {
                this.$refs.privateInfo.preOpen()
              }
            }
            // 分页逻辑——私聊历史记录
            if (type === 'page') {
              this.currentPrivate.privateMsgHistory = resData.messages
            } else {
              // 私聊切换/私聊历史查询/当前消息请求私聊和当前打开私聊一样的时候才去更新消息
              if (this.currentPrivate.privateInfo.id != data.id) {
                return
              }
              if (resData.messages.length === 0) {
                // null——>Object 可以被响应式监听到
                // Object1——>Object2 不可以
                if (this.currentPrivate.privateMsgHistory) {
                  this.currentPrivate.privateMsgHistory.splice(
                    0,
                    this.currentPrivate.privateMsgHistory.length
                  )
                } else {
                  this.currentPrivate.privateMsgHistory = []
                }
                if (this.currentPrivate.privateMsgList) {
                  this.currentPrivate.privateMsgList.splice(
                    0,
                    this.currentPrivate.privateMsgList.length
                  )
                } else {
                  this.currentPrivate.privateMsgList = []
                }
              } else {
                // console.log('私聊初次进入', resData)
                this.currentPrivate.privateMsgList = copy(
                  resData.messages
                ).reverse()
                this.currentPrivate.privateMsgHistory = resData.messages
              }
              this.$refs.privateInfo.reqOpen()
            }
          } else {
            this.$refs.privateInfo.reqOpen()
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.privateInfo.reqOpen()
          this.$refs.layer.show(res)
        })
      // this.currentPrivate.privateMsgList =
    },
    // 给每个私聊增加部分字段
    // async groupPrivateHandle() {
    //   // 用户id赋值
    //   this.groupHistoryParams.fromid = this.gUserInfo.userId
    //   // 遍历群获取群数据
    //   console.log(1111, this.groupTeamList)
    //   for (let i = 0; i < this.groupTeamList.length; i++) {
    //     console.log(222)
    //     var e = this.groupTeamList[i]
    //     // 每个群增加是否选中字段
    //     this.$set(e, 'isSelected', false)
    //     // 默认第一个群被选中
    //     if (i === 0) {
    //       e.isSelected = true // 用于样式展示
    //       this.groupCurrent.groupInfo = e // 用于数据处理
    //     }
    //     // 群id赋值
    //     this.groupHistoryParams.toid = this.groupHistoryParams.teamid = e.teamid
    //     // 获取群历史消息记录(去获取最近一条消息的时间)
    //     await GROUPAPI.gMsgHistory(this.groupHistoryParams).then(res => {
    //       if (res.data.code === '0000') {
    //         let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
    //           .messages
    //         if (resData && resData.length > 0) {
    //           // 给每个群增加最新消息时间字段
    //           let lastTime = resData[resData.length - 1].sendTime.split(' ')[0]
    //           e.lastTime = lastTime
    //         }
    //       } else {
    //         this.$refs.layer.show(res.data.message)
    //       }
    //     })
    //   }
    // },
    // 获取私聊列表——从最新消息列表去获取
    async getPrivateList() {
      await GROUPAPI.gLastMsg({
        userId: this.gUserInfo.userId
      })
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            if (!this.privateTempList) {
              this.privateTempList = []
            }
            // 最新消息列表——消息类型分类
            resData.forEach((e, i, arr) => {
              if (Number(e.messageType) === PRIVATE) {
                // 此前没消息列表时,直接新增
                if (this.privateTempList.length === 0) {
                  this.privateTempList.push({
                    name: e.name, // 消息发送者姓名
                    headUrl: e.headUrl, // 消息发送者头像
                    timeline: e.timeline, // 消息发送时间
                    id: e.id, // 消息发送者用户编号
                    isSelected: false // 是否选中
                  })
                } else {
                  // 此前有消息列表时,若新消息源在旧消息列表中不存在就加入
                  let isHas = this.privateTempList.find(
                    (oldE, oldI, oldArr) => {
                      return oldE.id === e.id
                    }
                  )
                  if (!isHas) {
                    this.privateTempList.push({
                      name: e.name, // 消息发送者姓名
                      headUrl: e.headUrl, // 消息发送者头像
                      timeline: e.timeline, // 消息发送时间
                      id: e.id, // 消息发送者用户编号
                      isSelected: false // 是否选中
                    })
                  } else {
                    // 做个时间判断, 有更新消息时间放最新的
                    if (e.timeline > isHas.timeline) {
                      isHas.timeline = e.timeline
                    }
                  }
                }
                // 消息内容列表，加入新信息
                // this.msgLast.privateMsg.push(e)
              }
              // switch (e.messageType) {
              // case FRIEND: // 同伴
              //   if (!this.msgLast.friendMsg) {
              //     this.msgLast.friendMsg = []
              //   }
              //   this.msgLast.friendMsg.push(e)
              //   break
              // case GROUP: // 群聊
              // 消息内容列表，加入新信息
              // groupMsg.push(e)
              // // 此前没消息列表时,直接新增
              // if (!this.msgLast.groupList) {
              //   this.msgLast.groupList = []
              //   this.msgLast.groupList.push({
              //     name: e.name,
              //     headUrl: e.headUrl,
              //     timeline: e.timeline
              //   })
              // } else {
              //   // 此前有消息列表时,若新消息源在旧消息列表中不存在就加入，否则更新时间
              //   let old = this.msgLast.groupList.find(
              //     (oldE, oldI, oldArr) => {
              //       return oldE.id === e.id
              //     }
              //   )
              //   if (!old) {
              //     this.msgLast.groupList.push({
              //       name: e.name,
              //       headUrl: e.headUrl,
              //       timeline: e.timeline
              //     })
              //   } else {
              //     // 做个时间判断
              //     // if() {
              //     old.timeline = e.timeline
              //     // }
              //   }
              // }
              //   break
              // case PRIVATE: // 私聊(群内单聊)
              // 此前没消息列表时,直接新增
              // if (this.msgLast.privateList.length === 0) {
              //   this.msgLast.privateList.push({
              //     name: e.name,
              //     headUrl: e.headUrl,
              //     timeline: e.timeline
              //   })
              // } else {
              //   // 此前有消息列表时,若新消息源在旧消息列表中不存在就加入
              //   let isHas = this.msgLast.privateList.find(
              //     (oldE, oldI, oldArr) => {
              //       return oldE.id === e.id
              //     }
              //   )
              //   if (!isHas) {
              //     this.msgLast.privateList.push({
              //       name: e.name,
              //       headUrl: e.headUrl,
              //       timeline: e.timeline
              //     })
              //   } else {
              // 做个时间判断
              // if() {
              //     old.timeline = e.timeline
              //     // }
              //   }
              // }
              // 消息内容列表，加入新信息
              // this.msgLast.privateMsg.push(e)
              // break
              // case VISITOR: // 游客
              //   if (!this.msgLast.visitorMsg) {
              //     this.msgLast.visitorMsg = []
              //   }
              //   this.msgLast.visitorMsg.push(e)
              //   break
              // }
            })
            // 初始化我在每个私聊 发送的消息的数量
            this.privateTempList.forEach((e, i, arr) => {
              if (!this.privateMyMsgNum[e.id]) {
                this.privateMyMsgNum[e.id] = {
                  my: 0,
                  all: null
                }
              }
            })
            console.log('哈哈哈', this.privateMyMsgNum)
            console.log('私聊消息列表', this.privateTempList)
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 群成员——私聊
    goPrivateChat(data) {
      console.log('私聊', data, this.groupCurrent.groupMembers)
      let item = this.privateTempList.find((e, i, arr) => {
        return e.id === data.memberid
      })
      // 若原私聊列表中存在该私聊对象——选中该对象
      if (item) {
        item.isSelected = true
        this.$refs.sidebar.selectPrivateChat(item)
      } else {
        // 若原私聊列表中不存在该私聊对象——加入该对象，选中该对象
        let newItem = {
          name: data.nickname, // 消息发送者姓名
          headUrl: data.headurl, // 消息发送者头像
          timeline: Date.now(), // 消息发送时间
          id: data.memberid, // 消息发送者用户编号
          isSelected: true // 是否选中
        }
        // 初始化我在私聊 发送的消息的数量
        if (!this.privateMyMsgNum[data.memberid]) {
          this.privateMyMsgNum[data.memberid] = {
            my: 0,
            all: null
          }
        }
        this.privateTempList.unshift(newItem)
        this.$refs.sidebar.selectPrivateChat(newItem)
      }
      // console.log(this.currentPrivate.privateInfo, this.privateTempList)
    },
    // 群成员——atTa
    atTa(data) {
      console.log('@', this.$refs.textbox)
      this.$refs.textbox.atTa(data)
    },
    // 循环atlist——找到@我的消息
    /**
     * msgInfo: 包含此条atlist的消息对象
     * atList: atList内容
     */
    getAtMeMsg(msgInfo, atList) {
      atList.forEach((e1, i1, arr1) => {
        // 如果是at我的消息
        if (e1.userid == this.gUserInfo.userId) {
          // 如果@我的消息在缓存atList中已经存在(同群同人),不做操作。
          if (
            this.atMeList.find((e2, i2, arr2) => {
              return e2.groupId == msgInfo.toid && e2.userId == msgInfo.fromid
            })
          ) {
            return false
          } else {
            // 找到群信息
            let team = this.groupTeamList.find((e3, i3, arr3) => {
              return e3.teamid == msgInfo.toid
            })
            // 请求用户信息
            GROUPAPI.gUserInfo({ userid: msgInfo.fromid })
              .then(res => {
                if (res.data.code === '0000') {
                  let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
                  // 在atList中新增at信息
                  let atData = {
                    groupId: msgInfo.toid, // 群id
                    userId: msgInfo.fromid, // 发送者id
                    groupName: (team && team.teamname) || ' ', // 群名
                    userName: resData.nickname, // 用户名
                    sendTime: msgInfo.sendTime // 发送时间
                  }
                  this.atMeList.unshift(atData)
                } else {
                  this.$refs.layer.show(res.data.message)
                }
              })
              .catch(res => {
                this.$refs.layer.show(res)
              })
          }
        }
      })
    },
    ...mapMutations({
      SET_UNREADPMSG: 'SET_UNREADPMSG',
      SET_UNREADGMSG: 'SET_UNREADGMSG',
      SET_GOPERATE: 'SET_GOPERATE',
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_PRIVATEINFO: 'SET_PRIVATEINFO',
      SET_SESSIONINFO: 'SET_SESSIONINFO',
      SET_GROUPMSG: 'SET_GROUPMSG',
      SET_SESSION_MSG: 'SET_SESSION_MSG',
      SET_PRIVATEMSG: 'SET_PRIVATEMSG',
      // SET_FACEIMG: "SET_FACEIMG",
      SET_CHATTYPE: 'SET_CHATTYPE',
      SET_SUSERINFO: 'SET_SUSERINFO'
      // SET_GROUPINFO: "SET_GROUPINFO",
      // SET_SESSIONINFO: "SET_SESSIONINFO"
    })
  }
}
</script>

<style lang='scss' scoped rel="stylesheet/scss">
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
      flex:1;
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
  .wait-list{
    margin-top: 200px;
    margin-left: 200px;
    width: 200px;
    background-color: #fff;
    height: 350px;
    position: absolute;
    z-index: 1;
    overflow: auto;
    border: 1px solid #e5e5e5;
    box-shadow: 0 0 10px rgba(0,0,10px,.4);
    li{
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
  .rank-list{
    top: 100px;
    margin-left: 400px;
    width: 200px;
    background-color: #fff;
    height: 350px;
    position: absolute;
    z-index: 1;
    border: 1px solid #e5e5e5;
    box-shadow: 0 0 10px rgba(0,0,10px,.4);
    padding-top: 30px;
    display: flex;
    // position: relative;
    flex-direction: column;
    .top{
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
    .ul-wrap{
      flex: 1;
      overflow: auto;
      ul{
        li{
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e5e5;
          padding: 10px;
          font-size: 16px;
          .index{
            color: $red;
          }
          .name{
            width: 50px;
            @include ellipsis(1);
          }
          .num{
            color: $green;
          }
        }
      }
    }
  }
}
</style>