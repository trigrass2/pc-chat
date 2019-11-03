<template>
  <div class="wrap">
    <ul class="tab-box">
      <li
        :class="[tabSelected == 1 ? 'active' : '', sessionNew ? 'new' : ''  ]"
        @click="changeTab(1)"
      >
        <span>会话</span>
        <div class="unread" v-show="isSesMsgUnRead"></div>
      </li>
      <li
        :class="[tabSelected == 2 ? 'active' : '', groupNew ? 'new' : ''  ]"
        @click="changeTab(2)"
      >
        <span>群组</span>
        <div class="unread" v-show="isGroMsgUnRead"></div>
      </li>
      <li
        :class="[tabSelected == 4 ? 'active' : '', friendNew ? 'new' : ''  ]"
        @click="changeTab(4)"
      >
        <span>同伴</span>
        <div class="unread" v-show="isFriMsgUnRead"></div>
      </li>
    </ul>
    <div class="tab-list">
      <!-- 会话 -->
      <div class="session-content" v-show="tabSelected == 1">
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
      <div class="group-content" v-show="tabSelected == 2">
        <!-- 群组列表 -->
        <ul class="group-chat-content">
          <template v-if="!groupList">
            <spinner-content class="spinner"></spinner-content>
          </template>
          <template v-else-if="groupList && groupList.length > 0">
            <li
              :class="item.isSelected ? 'selected': ''"
              v-for="(item, index) in groupList"
              :key="item.teamid"
              @click.stop="selectGroupChat(item)"
            >
              <img :src="item.headurl" />
              <div v-show="Number(item.unReadInfo.unReadNum) > 0" class="unread">{{item.unReadInfo.unReadNum}}</div>
              <!-- <div class="unread">2</div> -->
              <div class="text">{{item.teamname}}({{item.memberCount}})</div>
              <div class="time">{{item.lastMsgTime}}</div>
            </li>
          </template>
          <div v-else class="noData">暂无群聊列表</div>
        </ul>
        <!-- 私聊列表 -->
        <div class="private-chat-content">
          <div class="title">私聊列表</div>
          <ul class="private-list">
            <template v-if="!privateList">
              <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
            </template>
            <template v-else-if="privateList && privateList.length > 0">
              <li
                :class="item.isSelected ? 'selected': ''"
                v-for="(item, index) in privateList"
                :key="item.id"
                @click.stop="selectPrivateChat(item)"
              >
                <img :src="item.headUrl" />
                <div
                  v-show="Number(item.unReadInfo.unReadNum) > 0"
                  class="unread"
                >{{item.unReadInfo.unReadNum}}</div>
                <div class="text">{{item.name}}</div>
                <div class="time">{{item.lastMsgTime}}</div>
              </li>
            </template>
            <div v-else class="noData">暂无私聊列表～</div>
          </ul>
        </div>
        <!-- @我的列表 -->
        <div class="at-chat-content">
          <div class="title">at我的</div>
          <ul class="at-list">
            <template v-if="atMeList && atMeList.length > 0">
              <li v-for="(item, index) in atMeList" :key="item.id">
                <div class="text">{{item.sendTime}} {{item.userName}} 在 {{item.groupName}} 提到了我</div>
              </li>
            </template>
            <div v-else class="noData">还没有人@我~</div>
          </ul>
        </div>
      </div>
      <!-- 同伴 -->
      <div class="friend-content" v-show="tabSelected == 4">
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
              <div
                  v-show="Number(item.unReadNum) > 0"
                  class="unread"
                >{{item.unReadNum}}</div>
              <div class="text">{{item.nickname}}</div>
              <div class="time">{{item.updatetime}}</div>
            </li>
          </template>
          <div v-else class="noData">暂无同伴列表~</div>
        </ul>
      </div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { copy, copy2, debounce, formatDate } from 'common/js/util.js'
import Session from 'common/js/session.js'
import Friend from 'common/js/friend.js'
import Group from 'common/js/group.js'
import Private from 'common/js/private.js'
import { GROUPAPI } from 'api/http/groupChat'
import { SessionMessage, fiendMessage } from 'common/js/message.js'
import { mapGetters, mapMutations } from 'vuex'
import { friendList } from 'api/http/friendChat'
import {
  SESSION_CHATTYPE, // 当前聊天类型——会话
  GROUP_CHATTYPE, // 当前聊天类型——群聊
  PRIVATE_CHATTYPE, // 当前聊天类型——私聊
  FRIEND_CHATTYPE, // 当前聊天类型——同伴
  SESSION_ING, // 会话tab类型——进行中
  SESSION_OVER, // 会话tab类型——已结束
  FRIEND_MSG, // 消息类型——同伴消息
  GROUP_MSG, // 消息类型——群聊消息
  PRIVATE_MSG, // 消息类型——私聊消息
  SESSION_MSG //  消息类型——会话消息
} from 'common/js/business.js'
import {
  sessionList,
  ip2area,
  realInfo,
  sessionChatList
} from 'api/http/sessionChat'

export default {
  computed: {
    ...mapGetters([
      'groupInfoShow', // 群聊相关信息显示
      'gUserInfo', // 群聊登录信息
      'sUserInfo', // 会话登录信息
      'chatType', // 聊天类型
      'sessionList', // 会话列表
      'friendList', // 同伴列表
      'groupList', // 群聊列表
      'privateList', // 私聊列表
      'atMeList' // at列表
    ]),
    isSesMsgUnRead() {
      console.log('哈哈12321哈哈')
      return this.isUnRead(this.sessionList)
    },
    isGroMsgUnRead() {
      console.log('哈哈12321哈哈')
      return this.isUnRead([].concat(this.privateList).concat(this.groupList))
    },
    isFriMsgUnRead() {
      console.log('哈哈12321哈哈')
      return this.isUnRead(this.friendList)
    }
  },
  data() {
    return {
      // tab栏选中状态
      tabSelected: SESSION_CHATTYPE,
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
    // 获取群列表
    this.getGroupList('first')
    // 获取私聊列表
    this.getPrivateList('first')
    // 监听会话进入
    this.listenNewSession()
    // 监听会话结束
    this.listenOverSession()
    // 搜索防抖初始化
    // this.selectSessionChat = debounce(this.selectSessionChat, 300)
    // this.selseFriendChat = debounce(this.selseFriendChat, 300)
    // this.selectGroupChat = debounce(this.selectGroupChat, 300)
    // this.selectPrivateChat = debounce(this.selectPrivateChat, 300)
  },
  methods: {
    // 会话/群聊/同伴 tab切换
    changeTab(num) {
      console.log('1')
      // console.log(this.friendList)
      // tab(会话/群聊/同伴)切换
      this.tabSelected = num
      // 群聊和私聊区分
      let isGroupSelect, isPrivateSelect
      if (num == GROUP_CHATTYPE) {
        isGroupSelect = this.groupList.find(e => {
          return e.isSelected
        })
        isPrivateSelect = this.privateList.find(e => {
          return e.isSelected
        })
        // 群聊有选中项
        if (isGroupSelect) {
          num = GROUP_CHATTYPE
          // 私聊有选中项
        } else if (isPrivateSelect) {
          num = PRIVATE_CHATTYPE
        }
      }
      // 当前聊天类型(会话/群聊/同伴/私聊)切换
      this.SET_CHATTYPE({
        chatType: num
      })
      // 右侧信息栏内容显隐
      let sessionShow, groupShow, privateShow
      if (num == SESSION_CHATTYPE) {
        groupShow = false
        privateShow = false
        sessionShow = true
      }
      if (num == GROUP_CHATTYPE) {
        sessionShow = false
        groupShow = true
        privateShow = false
      }
      if (num == PRIVATE_CHATTYPE) {
        sessionShow = false
        groupShow = false
        privateShow = true
      }
      if (num == FRIEND_CHATTYPE) {
        sessionShow = false
        groupShow = false
        privateShow = false
      }
      this.SET_SESSIONINFO({
        sessionInfoShow: sessionShow
      })
      this.SET_GROUPINFO({
        groupInfoShow: groupShow
      })
      this.SET_PRIVATEINFO({
        privateInfoShow: privateShow
      })
      // 群聊——群聊复位
      if (num == GROUP_CHATTYPE) {
        if (this.groupInfo) {
          this.selectGroupChat(this.groupInfo)
        }
        //  else {
        //   if (this.groupList && this.groupList.length > 0) {
        //     this.selectGroupChat(this.groupList[0])
        //   }
        // }
      }
    },
    // 获取会话列表
    getSessionList() {
      sessionList({ userid: this.sUserInfo.userid })
        .then(res => {
          if (res.data.returncode === '0') {
            let sessionList = this.sessionList
            // 原sessionList不存在,就初始化sessionList
            if (!sessionList) {
              sessionList = []
              this.SET_SESSIONLIST({
                sessionList: []
              })
            }
            // 新获取会话列表为空时, 不执行下面逻辑
            if (
              !res.data.list ||
              (res.data.list && res.data.list.length == 0)
            ) {
              return
            }
            // 原sessionList中,session已存在就更新/session不存在就新增
            res.data.list.forEach((newSession, newI, arr) => {
              let oldSession, index
              if (sessionList.length > 0) {
                oldSession = sessionList.find((oldSession, oldI) => {
                  return oldSession.sesid == newSession.sesid
                })
                index = sessionList.findIndex((oldSession, oldI) => {
                  return oldSession.sesid == newSession.sesid
                })
              }
              // session已存在,更新状态
              if (oldSession) {
                if (oldSession.status != newSession.status) {
                  oldSession.status = newSession.status
                  console.log('更新会话', oldSession)
                  this.SET_EDITSESSION({
                    index: index,
                    session: oldSession
                  })
                }
              } else {
                // session不存在,新增session
                let addSession = new Session(newSession)
                // console.log('新增会话', addSession)
                this.SET_ADDSESSION({
                  session: addSession
                })
              }
            })
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
    // 获取群列表
    async getGroupList(isFirst) {
      await GROUPAPI.gChatList({ userId: this.gUserInfo.userId })
        .then(res => {
          if (res.data.code === '0000') {
            let groupList = this.groupList
            // 原groupList不存在,就初始化groupList
            if (!groupList) {
              groupList = []
              this.SET_GROUPLIST({
                groupList: []
              })
            }
            // 新获取群列表为空时, 不执行下面逻辑
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
            if (!resData || (resData && resData.length == 0)) {
              return
            }
            // 原groupList中,group已存在就不做操作/group不存在就新增
            resData.forEach((newGroup, newI, arr) => {
              // group已存在,不做操作
              let isHas = false
              if (groupList.length > 0) {
                isHas = groupList.find((oldGroup, oldI) => {
                  return oldGroup.teamid == newGroup.teamid
                })
              }
              // group不存在就新增
              if (!isHas) {
                var addGroup = new Group(newGroup)
                // console.log('新增群', addGroup)
                this.SET_ADDGROUP({
                  group: addGroup
                })
              }
              // 刚进入主界面时获取一次群消息
              if (isFirst) {
                this.$emit('getGroupMsgFirst', copy2(addGroup))
              }
            })
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
      // 每隔60秒重新获取群列表
      setTimeout(() => {
        this.getGroupList()
      }, 60000)
    },
    // 获取私聊列表——从最新消息列表去获取
    async getPrivateList(isFirst) {
      await GROUPAPI.gLastMsg({
        userId: this.gUserInfo.userId
      })
        .then(res => {
          if (res.data.code === '0000') {
            let privateList = this.privateList
            // 原privateList不存在,就初始化privateList
            if (!privateList) {
              privateList = []
              this.SET_PRIVATELIST({
                privateList: []
              })
            }
            // 新获取私聊列表为空时, 不执行下面逻辑
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            if (!resData || (resData && resData.length == 0)) {
              return
            }
            // 最新消息列表——获取到私聊消息
            var addPrivate
            resData.forEach((newPrivate, i, arr) => {
              // 原PrivateList中,session已存在就更新/session不存在就新增
              if (newPrivate.messageType == PRIVATE_MSG) {
                let isHas = false
                if (privateList.length > 0) {
                  isHas = privateList.find((oldPrivate, oldI) => {
                    return oldPrivate.id == newPrivate.id
                  })
                }
                // private不存在就新增
                if (!isHas) {
                  addPrivate = new Private(newPrivate)
                  console.log('新增私聊', addPrivate)
                  this.SET_ADDPRIVATE({
                    private: addPrivate
                  })
                }
              }
              // 刚进入主界面时获取一次私聊消息
              if (isFirst) {
                this.$emit('getPrivateMsgFirst', copy2(addPrivate))
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
    // 获取同伴列表
    getFriendList() {
      console.log('5')
      friendList({ userid: this.sUserInfo.userid })
        .then(res => {
          if (res.data.returncode === '0') {
            let friendList = this.friendList
            // 原friendList不存在,就初始化friendList
            if (!friendList) {
              friendList = []
              this.SET_FRIENDLIST({
                friendList: []
              })
            }
            // 新获取同伴列表为空时, 不执行下面逻辑
            if (
              !res.data.data ||
              (res.data.data && res.data.data.length == 0)
            ) {
              return
            }
            // 原friendList中,friend已存在就不做操作/friend不存在就新增
            res.data.data.forEach((newFriend, newI, arr) => {
              // group已存在,不做操作
              let isHas = false
              if (friendList.length > 0) {
                isHas = friendList.find((oldFriend, oldI) => {
                  return oldFriend.userid == newFriend.userid
                })
              }
              // friend不存在就新增
              if (!isHas) {
                // console.log('同伴列表——新增同伴', newFriend)
                let addFriend = new Friend(newFriend)
                // console.log('新增同伴', addFriend)
                this.SET_ADDFRIEND({
                  friend: addFriend
                })
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
    // 监听新会话进入
    listenNewSession() {
      this.$wsBus.$on('1201', res => {
        console.log('6')
        if (res.returncode === '0') {
          let sessionList = this.sessionList
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
          // 不存在新增会话（字段重写）
          newSession.guestsid = newSession.userid
          newSession.terminal = newSession.sesorigin.terminal
          newSession.category = newSession.sesorigin.category
          newSession.lastmsgtime = Date.now()
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
          console.log('新接入会话', addSession)
          this.SET_ADDSESSION({
            session: addSession
          })
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
    // 监听会话结束
    listenOverSession() {
      this.$wsBus.$on('1202', res => {
        if (res.returncode === '0') {
          let overSessionId = res.data.sesid
          let overSession = this.sessionList.find(session => {
            return session.sesid == overSessionId
          })
          let index = this.sessionList.findIndex(session => {
            return session.sesid == overSessionId
          })
          overSession.status = '1'
          this.SET_EDITSESSION({
            index: index,
            session: overSession
          })
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 会话搜索
    sessionSearch(session) {
      console.log('8')
      if (session.nickname.toLowerCase().indexOf(this.sessionSearchText) > -1) {
        // console.log('进来搜索了')
        return true
      }
      return false
    },
    // 选中会话
    async selectSessionChat(session, index) {
      let sessionList = this.sessionList
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
        chatType: SESSION_CHATTYPE
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
      // 去上级组件请求会话信息(会话历史消息)
      this.$emit('getSessionInfo', copy2(session), 1)
      // 滚动到底部
      setTimeout(() => {
        this.$emit('scrollToBottom')
      }, 1000)
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
    // 选中同伴
    selseFriendChat(friend, index) {
      console.log('10')
      let friendList = this.friendList
      // 更新所有会话状态
      friendList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      friend.isSelected = true
      // 未读消息清空
      friend.unReadNum = 0
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: FRIEND_CHATTYPE
      })
      // 更新同伴列表
      friendList[index] = friend
      this.SET_FRIENDLIST({
        friendList: friendList
      })
      // 滚动到底部
      setTimeout(() => {
        this.$emit('scrollToBottom')
      }, 1000)
    },
    // 选中群聊——请求相关信息
    selectGroupChat(groupInfo) {
      this.$emit('getGroupInfo', copy2(groupInfo), 'first')
      // 滚动到底部
      setTimeout(() => {
        this.$emit('scrollToBottom')
      }, 1000)
    },
    // 选中聊天——样式改变
    selectGroup(groupInfo) {
      if (this.privateList) {
        this.privateList.forEach((e, i, arr) => {
          e.isSelected = false
        })
      }
      if (this.groupList) {
        this.groupList.forEach((e, i, arr) => {
          e.isSelected = false
        })
      }
      let index = this.groupList.findIndex(e => {
        return groupInfo.teamid == e.teamid
      })
      console.log('选中的群', index, this.groupList[index])
      // 未读消息清空
      this.groupList[index].isSelected = true
      this.groupList[index].unReadInfo.unReadNum = 0
      this.groupList[index].unReadInfo.myMsgNum = 0
      this.groupList[index].unReadInfo.allUnReadNum = 0
      // 展示群详情内容
      this.SET_GROUPINFO({
        groupInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: GROUP_CHATTYPE
      })
      // 更新群列表
      this.SET_GROUPLIST({
        groupList: this.groupList
      })
      // 更新私聊列表
      this.SET_PRIVATELIST({
        privateList: this.privateList
      })
    },
    // 选中私聊
    selectPrivateChat(privateInfo) {
      if (this.privateList) {
        this.privateList.forEach((e, i, arr) => {
          e.isSelected = false
        })
      }
      if (this.groupList) {
        this.groupList.forEach((e, i, arr) => {
          e.isSelected = false
        })
      }
      let index = this.privateList.findIndex(e => {
        return privateInfo.id == e.id
      })
      console.log('选中的私聊', index, this.privateList[index])
      // 未读消息清空
      this.privateList[index].isSelected = true
      this.privateList[index].unReadInfo.unReadNum = 0
      this.privateList[index].unReadInfo.myMsgNum = 0
      this.privateList[index].unReadInfo.allUnReadNum = 0
      // 展示私聊详情内容
      this.SET_PRIVATEINFO({
        privateInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: PRIVATE_CHATTYPE
      })
      // 更新私聊列表
      this.SET_PRIVATELIST({
        privateList: this.privateList
      })
      // 更新群列表
      this.SET_GROUPLIST({
        groupList: this.groupList
      })
      // 去上级组件请求私聊信息(私聊历史消息)
      this.$emit('getPrivateInfo', copy2(privateInfo), 1)
      // 滚动到底部
      setTimeout(() => {
        this.$emit('scrollToBottom')
      }, 1000)
    },
    // 是否存在未读消息
    isUnRead(list) {
      if (!list) {
        return false
      }
      var index = list.findIndex((e) => {
        if (e && e.unReadInfo && e.unReadInfo.unReadNum) {
          return e.unReadInfo.unReadNum > 0
        } else if (e && e.unReadNum) {
          return e.unReadNum > 0
        } else {
          return false
        }
      })
      console.log('是否存在未读消息', index)
      if (index > -1) {
        return true
      } else {
        return false
      }
    },
    
    // // 选中私聊——样式改变
    // selectPrivate(privateInfo) {
      
    // },
    ...mapMutations({
      SET_CHATTYPE: 'SET_CHATTYPE',
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSIONINFO: 'SET_SESSIONINFO',
      SET_PRIVATEINFO: 'SET_PRIVATEINFO',
      SET_GROUPLIST: 'SET_GROUPLIST',
      SET_ADDGROUP: 'SET_ADDGROUP',
      SET_EDITGROUP: 'SET_EDITGROUP',
      SET_PRIVATELIST: 'SET_PRIVATELIST',
      SET_ADDPRIVATE: 'SET_ADDPRIVATE',
      SET_EDITPRIVATE: 'SET_EDITPRIVATE',
      SET_SESSIONLIST: 'SET_SESSIONLIST',
      SET_EDITSESSION: 'SET_EDITSESSION',
      SET_ADDSESSION: 'SET_ADDSESSION',
      SET_FRIENDLIST: 'SET_FRIENDLIST',
      SET_ADDFRIEND: 'SET_ADDFRIEND'
    })
  },
  filters: {
    format(date, type) {
      if (type == 'all') {
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
  .unread {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: red;
    position: absolute;
    margin-top: -32px;
    margin-left: 52px;
  }
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
.tab-list {
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
.group-content {
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
    overflow: auto;
    .spinner {
      margin-top: 20px;
    }
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
  }
  .private-chat-content {
    // position: relative;
    .private-list{
      position: relative;
      height: 200px;
      overflow: auto;
    }
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
  }
  .friend-list {
    height: 100%;
    border-bottom: 1px solid $border;
    overflow: auto;
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
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
        &:hover {
          background-color: #fff;
        }
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
        width: 20px;
        height: 20px;
        line-height: 20px;
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