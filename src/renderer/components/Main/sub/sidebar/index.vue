<template>
  <div class="wrap">
    <ul class="tab-box">
      <li
        :class="[tabSelected===1 ? 'active' : '', sessionNew ? 'new' : ''  ]"
        @click="changeTab(1)"
      >
        <span>会话</span>
      </li>
      <li :class="[tabSelected===2 ? 'active' : '', groupNew ? 'new' : ''  ]" @click="changeTab(2)">
        <span>群组</span>
      </li>
      <li
        :class="[tabSelected===3 ? 'active' : '', friendNew ? 'new' : ''  ]"
        @click="changeTab(3)"
      >
        <span>同伴</span>
      </li>
    </ul>
    <!-- 会话 -->
    <div class="tab-list">
      <div class="session-content" v-show="tabSelected === 1">
        <input v-model="sessionSearchText" type="text" placeholder="搜索会话" />
        <div class="status-box">
          <div
            :class="[!showFinished ? 'active' : 'default', 'status']"
            @click="showFinished = false"
          >
            <div class="ing img"></div>
            <div class="text">进行中</div>
          </div>
          <div
            :class="[showFinished ? 'active' : 'default', 'status']"
            @click="showFinished = true"
          >
            <div class="over img"></div>
            <div class="text">已结束</div>
          </div>
        </div>
        <ul class="chat-list">
          <template v-if="!sessionList">
            <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
          </template>
          <template v-else-if="sessionList && sessionList.length > 0">
            <li
              v-for="(item, index) in sessionList"
              :class="item.isSelected ? 'selected': ''"
              :key="item.sesid"
              v-show="sessionSearch(item) && ((item.status == '0' && !showFinished) || (item.status == '1' && showFinished))"
              @click="selectSessionChat(item, index)"
            >
              <div
                v-show="item.unReadNum && item.unReadNum > 0"
                class="unread"
              >{{ item.unReadNum || 0 }}</div>
              <div class="top">
                <img :src="[item.headurl ? item.headurl : require('./img/noface.gif')]" />
                <div class="top_center">
                  <div class="name">{{ item.nickname }}</div>
                  <!-- <span v-if="item.inputMessage" class="chat-session-item-caogao">[草稿]</span> -->
                  <div class="status">{{item.status | sessionStatus}}</div>
                </div>
                <div class="time">{{item.updatetime}}</div>
              </div>
              <div class="bottom">
                会话ID:{{item.sesid}} VIP:
                <img v-for="i in item.lv" src="./img/viplvl.png" />
                {{item.vip}}
                <span v-if="item.lv<=0">0</span>
              </div>
            </li>
          </template>
          <div v-else class="noData">暂无会话列表</div>
        </ul>
      </div>
      <!-- 群组 -->
      <div class="group-content" v-show="tabSelected === 2">
        <!-- 群组列表 -->
        <ul class="group-chat-content">
          <template v-if="!groupTeamList">
            <spinner-content class="spinner"></spinner-content>
          </template>
          <template v-else-if="groupTeamList && groupTeamList.length > 0">
            <li
              :class="item.isSelected ? 'selected': ''"
              v-for="(item, index) in groupTeamList"
              :key="item.teamid"
              @click.stop="selectGroupChat(item)"
            >
              <img :src="item.headurl" />
              <div v-show="Number(item.unReadNum) > 0" class="unread">{{item.unReadNum}}</div>
              <!-- <div class="unread">2</div> -->
              <div class="text">{{item.teamname}}({{item.memberCount}})</div>
              <div class="time">{{item.lastTime}}</div>
            </li>
          </template>
          <div v-else class="noData">暂无群聊列表</div>
        </ul>
        <!-- 私聊列表 -->
        <div class="private-chat-content">
          <div class="title">私聊列表</div>
          <ul class="private-list">
            <template v-if="!privateTeamList">
              <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
            </template>
            <template v-else-if="privateTeamList && privateTeamList.length > 0">
              <li
                :class="item.isSelected ? 'selected': ''"
                v-for="(item, index) in privateTeamList"
                :key="item.id"
                @click.stop="selectPrivateChat(item)"
              >
                <img :src="item.headUrl" />
                <div v-show="Number(item.unReadNum) > 0" class="unread">{{item.unReadNum}}</div>
                <div class="text">{{item.name}}</div>
                <div class="time">{{item.timeline | format('all')}}</div>
              </li>
            </template>
            <div v-else class="noData">暂无私聊列表～</div>
          </ul>
        </div>
        <!-- @我的列表 -->
        <div class="at-chat-content">
          <div class="title">at我的</div>
          <ul class="at-list">
            <template v-if="atMeList.length > 0">
              <li v-for="(item, index) in atMeList" :key="item.groupId">
                <div class="text">{{item.sendTime}} {{item.userName}} 在 {{item.groupName}} 提到了我</div>
              </li>
            </template>
            <div v-else class="noData">还没有人@我~</div>
          </ul>
        </div>
      </div>
      <!-- 同伴 -->
      <div class="friend-content" v-show="tabSelected === 3">
        <ul class="friend-list">
          <template v-if="!friendList">
            <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
          </template>
          <template v-else-if="friendList && friendList.length > 0">
            <li
              :class="item.isSelected ? 'selected': ''"
              v-for="(item, index) in friendList"
              :key="item.userid"
              @click.stop="selseFriendChat(item, index)"
            >
              <img :src="item.headurl" />
              <div class="text">{{item.nickname}}</div>
              <div class="time">{{item.updatetime}}</div>
            </li>
          </template>
          <div v-else class="noData">暂无同伴列表~</div>
        </ul>
      </div>
      <layer-content ref="layer"></layer-content>
    </div>
  </div>
</template>

<script>
import { copy, copy2, debounce, formatDate } from 'common/js/util.js'
import Session from 'common/js/session.js'
import Friend from 'common/js/friend.js'
import { SessionMessage, fiendMessage } from 'common/js/message.js'
import { mapGetters, mapMutations } from 'vuex'
import { friendList } from 'api/http/friendChat'
import {
  sessionList,
  ip2area,
  realInfo,
  sessionChatList
} from 'api/http/sessionChat'
// 会话——chatType
const SESSION = 1
// 群聊——chatType
const GROUP = 2
// 私聊——chatType
const PRIVATE = 3
// 同伴——chatType
const FRIEND = 4
// 会话-进行中
const SESSION_ING = 1
// 会话-已结束
const SESSION_OVER = 2

export default {
  computed: {
    ...mapGetters([
      'groupInfoShow', // 群聊相关信息显示
      'sUserInfo', // 会话登录信息
      'chatType', // 聊天类型
      'sessionList', // 会话列表
      'friendList' // 同伴列表
    ])
  },
  props: {
    // 当前群信息
    groupInfo: {
      type: Object,
      default: null
    },
    // 群聊列表
    groupTeamList: {
      type: Array,
      default: null
    },
    // 私聊列表
    privateTeamList: {
      type: Array,
      default: null
    },
    // @我的消息列表
    atMeList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      // tab栏选中状态
      tabSelected: SESSION,
      // 会话状态
      showFinished: false,
      // 会话搜索内容
      sessionSearchText: '',
      // 会话新消息
      sessionNew: false,
      // 群聊新消息
      groupNew: false,
      // 同伴新消息
      friendNew: true,
      // 群成员参数
      groupMemberParams: {
        teamid: '', // 群id
        userId: '' // 用户id
      }
    }
  },
  created() {
    // 获取会话列表
    this.getSessionList()
    // 获取同伴列表
    this.getFriendList()
    // 监听会话列表
    this.listenNewSession()
    // 监听会话消息
    this.listenNewSessionMsg()
    // 监听同伴消息
    this.listenNewFriendMsg()
    // 搜索防抖初始化
    // this.sessionSearch = debounce(this.sessionSearch, 500)
  },
  methods: {
    // 会话/群聊/同伴 tab切换
    changeTab(num) {
      // console.log(this.friendList)
      // tab(会话/群聊/同伴)切换
      this.tabSelected = num
      // 当前聊天类型(会话/群聊/同伴/私聊)切换
      this.SET_CHATTYPE({
        chatType: num
      })
      // 右侧信息栏内容显隐
      let sessionShow, groupShow
      num == SESSION ? sessionShow = true : sessionShow = false
      num == GROUP ? groupShow = true : groupShow = false
      this.SET_SESSIONINFO({
        sessionInfoShow: sessionShow
      })
      this.SET_GROUPINFO({
        groupInfoShow: groupShow
      })
      // 群聊——若未选中过群聊，默认选中第一个
      // if (num === GROUP) {
      //   if (this.groupInfo) {
      //     this.selectGroupChat(this.groupInfo)
      //   } else {
      //     if (this.groupTeamList && this.groupTeamList.length > 0) {
      //       this.selectGroupChat(this.groupTeamList[0])
      //     }
      //   }
      // }
    },
    // 获取会话列表
    getSessionList() {
      sessionList({ userid: this.sUserInfo.userid })
        .then(res => {
          if (res.data.returncode === '0') {
            let sessionList = copy2(this.sessionList)
            console.log('原session列表:', res)
            // 原sessionList不存在,就初始化sessionList
            if (!sessionList) {
              sessionList = []
              this.SET_SESSIONLIST({
                sessionList: []
              })
            }
            // 原sessionList中,session已存在就更新/session不存在就新增
            res.data.list.forEach((newSession, newI, arr) => {
              var exists = false
              // session已存在,更新状态
              if (sessionList.length > 0) {
                sessionList.forEach((oldSession, oldI) => {
                  if (newSession.sesid == oldSession.sesid) {
                    exists = true
                    if (oldSession.status != newSession.status) {
                      oldSession.status = newSession.status
                      this.SET_EDITSESSION({
                        index: oldI,
                        session: oldSession
                      })
                    }
                  }
                })
              }
              if (exists) {
                return
              }
              // session不存在,新增session
              newSession.messageList = []
              newSession.timeline = newSession.lastmsgtime
              newSession.isSelected = false
              newSession.unReadNum = 0
              newSession.realinfo = null
              let addSession = new Session(newSession)
              this.SET_ADDSESSION({
                session: addSession
              })
              // sessionList.push(addSession)
            })
            console.log('初始化请求会话列表', sessionList)
          } else {
            this.$refs.layer.show(res.data.message)
          }
          // 每隔10秒更新一次会话列表
          setTimeout(this.getSessionList, 10000)
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 获取同伴列表
    getFriendList() {
      friendList({ userid: this.sUserInfo.userid })
        .then(res => {
          if (res.data.returncode === '0') {
            // 收集同伴信息
            let fList = []
            if (res.data.data && res.data.data.length > 0) {
              res.data.data.forEach((e, i, arr) => {
                let friend = new Friend(e)
                fList.push(friend)
              })
            }
            // console.log('同伴列表:', fList)
            // 更新同伴列表
            this.SET_FRIENDLIST({
              friendList: fList
            })
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 监听新会话进入
    listenNewSession() {
      this.$wsBus.$on('1201', res => {
        if (res.returncode === '0') {
          let sessionList = copy2(this.sessionList)
          let newSession = res.data
          // 原sessionList不存在,就初始化sessionList
          if (!sessionList) {
            sessionList = []
            this.SET_SESSIONLIST({
              sessionList: []
            })
          }
          // 原sessionList中是否存在新会话
          let isHas = sessionList.find((oldSession, i, arr) => {
            return newSession.sesid == oldSession.sesid
          })
          // 存在就不继续执行
          if (isHas) {
            return
          }
          // 不存在就新增会话（字段重写）
          newSession.guestsid = newSession.userid
          newSession.terminal = newSession.sesorigin.terminal
          newSession.category = newSession.sesorigin.category
          newSession.timeline = Date.now()
          newSession.isSelected = false
          newSession.realinfo = null
          newSession.unReadNum = 1
          newSession.status = 0
          newSession.messageList = [
            {
              msgtype: 99,
              text: newSession.nickname + '接入了会话',
              timeline: new Date().getTime(),
              createtime: formatDate(Date.now(), 'hh:mm:ss')
            }
          ]
          let addSession = new Session(newSession)
          this.SET_ADDSESSION({
            session: addSession
          })
          // sessionList.push(addSession)
          // this.SET_SESSIONLIST({
          //   sessionList: sessionList
          // })
          // 回复欢迎语
          // if(this.welcomtext){
          //   var back = kx.send(0,d.userid,d.sesid,vm.welcomtext);
          //   if(back && back.msgkey){
          //     var msg = {
          //         mediatype:0,
          //         content:back.msgbody,
          //         headurl:vm.user.headurl,
          //         isMine:true,
          //         timeline:new Date().getTime(),
          //         msgkey:back.msgkey,
          //         msgid:null,
          //         sendfailed:false
          //       };
          //     session.messageList.push(msg);
          //   }
          // }
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 监听会话消息
    listenNewSessionMsg() {
      this.$wsBus.$on('2001', res => {
        if (res.returncode === '0') {
          let sessionList = copy2(this.sessionList)
          let newMsg = res.data
          // 会话消息的标志是有sesid
          if (!newMsg.sesid) {
            return
          }
          console.log('新会话消息', newMsg)
          // 原sessionList不存在,就初始化sessionList
          if (!sessionList) {
            sessionList = []
            this.SET_SESSIONLIST({
              sessionList: []
            })
          }
          // 消息对应的会话是否存在
          let oldSession = sessionList.find((oldSession, oldI) => {
            return newMsg.sesid == oldSession.sesid
          })
          let oldIndex = sessionList.findIndex((oldSession, oldI) => {
            return newMsg.sesid == oldSession.sesid
          })
          // 消息对应的会话已存在,新增消息
          if (oldSession) {
            // 新增消息
            newMsg.isMine = newMsg.fromid == oldSession.customerid
            let addMessage = new SessionMessage(newMsg)
            oldSession.messageList.push(addMessage)
            // 未读消息数量+1
            if (!oldSession.isSelected) {
              oldSession.unReadNum++
            }
            // 更新该会话的最新消息时间
            oldSession.updatetime = formatDate(newMsg.timeline, 'hh:mm:ss')
            this.SET_EDITSESSION({
              index: oldIndex,
              session: oldSession
            })
            // sessionList[oldIndex] = oldSession
          } else {
            // 消息对应的会话不存在,新增会话/新增消息
            // 新增会话
            let addSession = new Session({
              guestsid: newMsg.fromid,
              sesid: newMsg.sesid,
              lv: newMsg.lv,
              category: newMsg.category,
              isSelected: false,
              nickname: newMsg.fromname,
              headurl: newMsg.fromheadurl,
              timeline: newMsg.lastmsgtime,
              unReadNum: 1,
              status: 0,
              messageList: []
            })
            // 新增消息
            let addMessage = new SessionMessage(newMsg)
            addMessage.isMine = newMsg.fromid == this.sUserInfo.userid
            // 会话消息拼接
            addSession.messageList.push(addMessage)
            // 新增会话
            this.SET_ADDSESSION({
              session: addSession
            })
            // sessionList.push(addSession)
          }
          // 计算所有会话未读消息数量
          // vm.reportNewMsgCount();
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 会话搜索
    sessionSearch(session) {
      if (session.nickname.toLowerCase().indexOf(this.sessionSearchText) > -1) {
        // console.log('进来搜索了')
        return true
      }
      return false
    },
    // 选中会话
    async selectSessionChat(session, index) {
      let sessionList = copy2(this.sessionList)
      session = copy2(session)
      // 更新所有会话状态
      sessionList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      session.isSelected = true
      // 未读消息清空
      session.unReadNum = 0
      // 展示会话详情内容
      this.SET_SESSIONINFO({
        sessionInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: SESSION
      })
      // 真实信息查询
      if (!session.realinfo) {
        await realInfo({
          userid: this.sUserInfo.userid,
          custid: session.guestsid
        })
          .then(res => {
            if (res.data.returncode == '0') {
              session.realinfo = res.data.info
            } else {
              session.realinfo = {
                name: '未知',
                mobile: '未知'
              }
            }
          })
          .catch(res => {
            this.$refs.layer.show(res)
          })
      }
      // 如果会话消息为空,从接口取历史消息
      if (!session.messageList || session.messageList.length == 0) {
        await sessionChatList({
          userid: this.sUserInfo.userid,
          page: session.currMsgPage
        })
          .then(res => {
            if (res.data.returncode == '0') {
              console.log('消息列表', res.data.list)
              // 消息收集
              let msgs = []
              res.data.list.reverse()
              res.data.list.forEach((message, i) => {
                message.fromHistory = true
                message.isMine = message.fromid !== session.sesorigin.userid
                let msg = new SessionMessage(message)
                msgs.push(msg)
              })
              // 历史消息标签
              if (msgs.length > 0) {
                msgs.push({
                  msgtype: 99,
                  text: '以上为历史消息'
                })
              }
              // 加载更多
              if (session.currMsgPage < res.data.totalpage) {
                msgs.splice(0, 0, {
                  msgtype: 99,
                  text: '加载更多',
                  handleLoadHistory: true
                })
              }
              // 更新当前会话的消息
              session.messageList = msgs
            } else {
              this.$refs.layer.show(res.returnmsg)
            }
          })
          .catch(res => {
            this.$refs.layer.show(res)
          })
      }
      // 更新会话列表
      sessionList[index] = session
      this.SET_SESSIONLIST({
        sessionList: sessionList
      })
      // 把当前会话信息传递给外面使用
      // this.$emit('updateCurSession', copy2(session))
      // 如果地区为空,通过ip检索地区
      // if (
      //   item.sesorigin &&
      //   item.sesorigin.ip &&
      //   item.sesorigin.ip.indexOf('(') < 0
      // ) {
      // ip2area({ ip: item.sesorigin.ip })
      //   .then(res => {
      //     console.log('ip检索地区', res)
      //     let session = copy(this.sessionInfo)
      //     if (res.returncode == '0') {
      //       session.sesorigin.ip =
      //         session.sesorigin.ip +
      //         '(' +
      //         res.country +
      //         res.province +
      //         res.city +
      //         ')'
      //     } else {
      //       session.sesorigin.ip = session.sesorigin.ip + '(未知地区)'
      //     }
      //     // 更新当前会话信息
      //     this.SET_SESINFO({
      //       sessionInfo: session
      //     })
      //   })
      //   .catch(res => {
      //     this.$refs.layer.show(res)
      //   })
      // }
    },
    // 监听同伴消息
    listenNewFriendMsg() {
      this.$wsBus.$on('2001', res => {
        console.log('同伴消息', res)
        if (res.returncode === '0') {
          let friendList = copy2(this.friendList)
          let newMsg = res.data
          // 同伴消息标志,msgtype=1
          if (res.data.msgtype != 1) {
            return
          }
          // 原friendList不存在,就初始化friendList
          if (!friendList) {
            friendList = []
            this.SET_FRIENDLIST({
              friendList: []
            })
          }
          // 消息对应的同伴是否存在
          let oldFriend = friendList.find((oldFriend, oldI) => {
            return newMsg.fromid == oldFriend.userid
          })
          let oldIndex = friendList.findIndex((oldFriend, oldI) => {
            return newMsg.fromid == oldFriend.userid
          })
          // 消息对应的会话已存在,新增消息
          if (oldFriend) {
            // 新增消息
            let addMessage = new FriendMessage(newMsg)
            oldFriend.messageList.push(addMessage)
            // 未读消息数量+1
            if (!oldFriend.isSelected) {
              oldFriend.unReadNum++
            }
            // 更新该会话的最新消息时间
            oldFriend.timeline = ewMsg.timeline
            oldFriend.updatetime = formatDate(newMsg.timeline, 'hh:mm:ss')
            console.log('消息对应的会话已存在', oldIndex, oldFriend)
            this.SET_EDITFRIEND({
              index: oldIndex,
              session: oldFriend
            })
          } else {
            // 消息对应的同伴不存在,新增同伴/新增消息
            // 新增同伴
            let addFriend = new Friend({
              userid: newMsg.fromid,
              isSelected: false,
              nickname: newMsg.nickname,
              headurl: newMsg.headurl,
              unReadNum: 1,
              messageList: []
            })
            // 新增消息
            let addMessage = new FriendMessage(newMsg)
            // 同伴消息拼接
            addFriend.messageList.push(addMessage)
            console.log('消息对应的同伴不存在', addFriend)
            // 新增同伴
            this.SET_ADDFRIEND({
              friend: addFriend
            })
          }
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 选中同伴
    selseFriendChat(friend, index) {
      let friendList = copy2(this.friendList)
      friend = copy2(friend)
      // 更新所有会话状态
      friendList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      friend.isSelected = true
      // 未读消息清空
      friend.unReadNum = 0
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: FRIEND
      })
      // 更新同伴列表
      friendList[index] = friend
      this.SET_FRIENDLIST({
        friendList: friendList
      })
    },
    // 选中群聊
    selectGroupChat(item) {
      // 选中项样式改变
      this.privateTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      this.groupTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      item.isSelected = true
      // 未读消息清空
      this.$set(item, 'unReadNum', 0)
      // 展示群详情内容
      this.SET_GROUPINFO({
        groupInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: GROUP
      })
      console.log('选中群聊1', this.chatType)
      // 去上级组件请求群信息(群成员/群历史消息)
      this.$emit('getGroupInfo', item, null, 'first')
    },
    // 选中私聊
    selectPrivateChat(item) {
      // 选中项样式改变
      this.privateTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      this.groupTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      item.isSelected = true
      // 未读消息清空
      this.$set(item, 'unReadNum', 0)
      // 展示私聊详情内容
      this.SET_PRIVATEINFO({
        privateInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: PRIVATE
      })
      console.log('选中私聊1', this.chatType)
      // 去上级组件请求私聊信息(私聊历史消息)
      this.$emit('getPrivateInfo', item)
    },
    ...mapMutations({
      SET_CHATTYPE: 'SET_CHATTYPE',
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSIONINFO: 'SET_SESSIONINFO',
      SET_PRIVATEINFO: 'SET_PRIVATEINFO',
      SET_SESSIONLIST: 'SET_SESSIONLIST',
      SET_EDITSESSION: 'SET_EDITSESSION',
      SET_ADDSESSION: 'SET_ADDSESSION',
      SET_FRIENDLIST: 'SET_FRIENDLIST',
      SET_EDITFRIEND: 'SET_EDITFRIEND',
      SET_ADDFRIEND: 'SET_ADDFRIEND'
    })
  },
  filters: {
    format(date, type) {
      if (type === 'all') {
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      } else {
        return formatDate(date, 'yyyy-MM-dd')
      }
    },
    sessionStatus(data) {
      if (data == '0') {
        return '新接入会话'
      } else {
        return '会话已结束'
      }
    },
    phoneSecriet(data) {
      let pat = /(\d{3})\d*(\d{4})/
      return data.replace(pat, '$1****$2')
    }
  }
}
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap {
  flex: 1;
  display: flex;
  border-right: 1px solid $border;
  background-color: $blank;
  flex-direction: column;
}
.tab-box {
  display: flex;
  width: 100%;
  height: 40px;
  .active {
    background-color: $blank;
    box-shadow: 0 0 5px rgba(31, 28, 28, 0.3);
  }
  li {
    flex: 1;
    height: 40px;
    border-left: 1px solid $border;
    text-align: center;
    background-color: $listHover;
    line-height: 40px;
    font-size: 14px;
    cursor: default;
  }
}
.tab-list{
  flex: 1;
  display: flex;
  flex-direction: column;
}
.session-content {
  height: 100%;
  input {
    width: 100%;
    height: 28px;
    border: 1px solid $border;
    border-right: 0;
    font-size: 12px;
    padding: 4px 0 4px 6px;
  }
  .status-box {
    display: flex;
    border-bottom: 1px solid $border;
    height: 30px;
    line-height: 30px;
    .default {
      .ing {
        background: url('./img/doing.png');
      }
      .over {
        background: url('./img/finish.png');
      }
    }
    .active {
      color: $red;
      .ing {
        background: url('./img/doing-on.png');
      }
      .over {
        background: url('./img/finish-on.png');
      }
    }
    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      border-left: 1px solid $border;
      font-size: 12px;
      cursor: default;
      .img {
        width: 15px;
        height: 15px;
        margin-right: 4px;
        background-size: contain;
      }
    }
  }
  .chat-list {
    height: 100%;
    background-color: $blank;
    overflow: auto;
    .noData {
      width: 100%;
      text-align: center;
      margin-top: 40px;
      font-size: 16px;
      color: rgb(83, 83, 83);
    }
    .selected {
      background-color: $listHover !important;
      .status,
      .time {
        color: rgb(21, 21, 21) !important;
      }
    }
    li {
      padding: 8px 10px;
      font-size: 14px;
      position: relative;
      cursor: default;
      &:hover {
        background-color: $listLightHover;
      }
      .unread {
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: red;
        color: #fff;
        text-align: center;
      }
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
        .top_center {
          flex: 1;
          .phone {
            font-size: 14px;
            width: 130px;
            @include ellipsis(1);
          }
          .status {
            font-size: 12px;
            color: rgb(83, 83, 83);
          }
        }
      }
      .bottom {
        font-size: 14px;
        margin-top: 5px;
        color: rgb(83, 83, 83);
      }
    }
  }
}
.group-content{
  display: flex;
  flex-direction: column;
}
.group-content,
.friend-content {
  height: 100%;
  border-top: 1px solid $border;
  overflow: auto;
  .group-chat-content {
    position: relative;
    height: 260px;
    .spinner {
      margin-top: 20px;
    }
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
  }
  .private-chat-content {
    height: 200px;
    position: relative;
    overflow: auto;
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
  }
  .friend-list {
    height: 100%;
    border-bottom: 1px solid $border;
    overflow: auto;
  }
  .at-chat-content {
    flex: 1;
    border-bottom: 1px solid $border;
    .noData {
      width: 100%;
      text-align: left;
      font-size: 12px;
      margin-top: 0;
      color: rgb(83, 83, 83);
    }
    ul {
      padding: 10px;
      height: 120px;
      overflow: auto;
      li {
        font-size: 12px;
      }
    }
  }
  .selected {
    background-color: $listHover !important;
  }
  .title {
    background-color: $listHover !important;
    width: 100%;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    padding: 0 10px;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
  }
  ul {
    .noData {
      width: 100%;
      text-align: center;
      margin-top: 40px;
      font-size: 16px;
      color: rgb(83, 83, 83);
    }
    .selected {
      background-color: $listHover !important;
    }
    li {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: bold;
      cursor: default;
      &:hover {
        background-color: $listLightHover;
      }
      .unread {
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: red;
        color: #fff;
        text-align: center;
      }
      img {
        width: 40px;
        height: 40px;
        margin-right: 6px;
        border-radius: 50%;
      }
      .text {
        flex: 1;
      }
    }
  }
}
</style>