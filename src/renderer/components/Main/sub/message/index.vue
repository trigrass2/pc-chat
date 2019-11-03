<template>
  <div class="wrap">
    <div class="chat-con">
      <div class="chat-title">
        <!-- 会话头部栏 -->
        <div class="title" v-show="chatType == 1 && sessionInfo">
          <div class="name">
            <span>{{sessionInfo && sessionInfo.nickname}}</span>
            <span
              class="tag"
            >{{sessionInfo && sessionInfo.sesorigin && sessionInfo.sesorigin.categoryname}}</span>
          </div>
          <div class="detail">
            真实姓名:
            <span>{{sessionInfo && sessionInfo.realinfo && sessionInfo.realinfo.name}}</span>
            手机号：
            <span>{{sessionInfo && sessionInfo.realinfo && sessionInfo.realinfo.mobile}}</span>
            渠道：
            <span>{{sessionInfo && sessionInfo.terminal | transTerminal}}</span>
            IP：
            <span>{{sessionInfo && sessionInfo.sesorigin && sessionInfo.sesorigin.ip}}</span>
          </div>
          <!-- <div v-if="currentsession.status==0" class="custChange" v-on:click="showCust" >
            <img src="../components/chat-status/imgs/arrow_switch.png" />
            <span>转接</span>
          </div>
          <div v-if="showCustList" class="list" v-on:mouseleave="showCustList=false">
            <div v-for="cust in custList" v-on:click="changeTo(cust)" class="cust">
              <div class="head" ><img v-bind:src="cust.headurl" /></div>
              {{cust.nickname}}
              <span style="color:green">[{{cust.currentnum}}/{{cust.maxsession}}]</span>
              <span v-if="cust.status==1" style="color:green">[正常]</span>
              <span v-if="cust.status==2" style="color:#999">[离开]</span>
              <span v-if="cust.status==0" style="color:#ccc">[离线]</span>
            </div>
            <div v-if="!custList || custList.length==0" class="cust">
              <span>暂无可用客服</span>
            </div>
          </div> -->
        </div>
        <!-- 群聊头部栏 -->
        <div class="title" v-show="chatType == 2 && groupInfo">
          <div class="name">
            <span>{{groupInfo && groupInfo.teamname}}</span>
            <span class="tag">{{groupInfo && groupInfo.teamTypeName}}</span>
          </div>
          <div class="detail">
            创建于：
            <span>{{groupInfo && groupInfo.createDate}}</span>
          </div>
        </div>
        <!-- 同伴头部栏 -->
        <div class="title" v-show="chatType == 4">
          <div class="name">
            <span>{{friendInfo && friendInfo.nickname}}</span>
          </div>
          <div class="detail">
            <span>内部对话</span>
          </div>
        </div>
        <!-- 私聊头部栏 -->
        <div class="title" v-show="chatType == 3 && privateInfo">
          <div class="name">
            <span>{{privateInfo && privateInfo.name}}</span>
          </div>
        </div>
      </div>
      <!-- 消息内容展示 -->
      <div class="chat-content">
        <!-- <div class="load-more" v-show="msgData.hasMoreMsg" @click="moreMsg">加载更多</div> -->
        <div class="ul-wrap" v-if="msgData && msgData.length > 0" ref="msgcon">
          <ul>
            <template v-for="(item, index) in msgData">
              <!-- 系统的消息 -->
              <template v-if="item.msgtype && item.msgtype == '99'">
                <div class="sysmsg" @click="loadMoreHistory(item)">
                  <div class="time">{{item.createtime}}</div>
                  <div class="text">{{item.text}}</div>
                </div>
              </template>
              <template v-else-if="item.recall == '1' || item.isback">
                <li class="recall">
                  <div class="time">{{item.sendTime}}</div>
                  <div class="text" v-if="item.fromid == gUserInfo.userId || item.isMine">你撤回了一条消息</div>
                  <div class="text" v-else>{{item.nickname}}撤回了一条消息</div>
                </li>
              </template>
              <!-- 删除的消息 -->
              <!-- <template v-else-if="item.isDelete">
              <li class="delete">
                <div class="time">{{item.timeline}}</div>
              <div class="text">该条消息已被删除</div>-->
              <!-- <div class="text" v-if="item.fromid === user.id">你删除了一条消息</div>
              <div v-else>{{item.fromName}}删除了一条消息</div>-->
              <!-- </li>
              </template>-->
              <!-- 图片 -->
              <!-- <template v-else-if="item.recall === '0' && item.mediaType === '3'"> -->
              <!-- 图片 -->
              <!-- <div>这里是图片</div> -->
              <!-- //客服发送的单图文 -->
              <!-- <div class="material">
                <div v-on:click="openMaterial(message.msgbody)" class="chat-material-show-item">
                  <div class="chat-material-show-item-title">{{message.msgbody.title}}</div>
                  <img class="chat-material-show-item-cover" v-bind:src="message.msgbody.thumb_url" />
                </div>
              </div>-->
              <!-- //客服发送的多图文 -->
              <!-- <div class="material">
                <div
                  v-for="material in message.msgbody"
                  v-on:click="openMaterial(material)"
                  class="chat-material-show-item"
                >
                  <div class="chat-material-show-item-title">{{material.title}}</div>
                  <img class="chat-material-show-item-cover" v-bind:src="material.thumb_url" />
                </div>
              </div>-->
              <!-- </template> -->
              <!-- 图文 -->
              <!-- <template v-else-if="item.recall === '0' && item.mediaType === '5'">这里是图文</template> -->
              <!-- 文本表情 -->
              <template v-else>
                <!-- 我的消息 -->
                <li class="my" v-if="item.fromid == gUserInfo.userId || item.isMine">
                  <div class="con-wrap">
                    <div class="title" v-if="chatType !== 1 && chatType !== 4">
                      <span class="time">{{item.sendTime}}</span>
                      <span class="name">{{item.nickname}}</span>
                    </div>
                    <div class="con">
                      <msg-loading :status="item.sendStatus"></msg-loading>
                      <div class="content" @click.right="openMenu(item, 1)">
                        <div
                          @click="imgPreview($event)"
                          style="word-wrap:break-word"
                          v-html="showMsgDataHandler(item)"
                        ></div>
                        <span class="arrow"></span>
                      </div>
                      <img class="head" :src="item.headurl" />
                    </div>
                  </div>
                </li>
                <!-- 别人的消息 -->
                <li class="other" v-else>
                  <div class="con-wrap">
                    <div class="title" v-if="chatType != 1 && chatType != 4">
                      <span class="name">{{item.nickname}}</span>
                      <span class="time">{{item.sendTime}}</span>
                    </div>
                    <div class="con">
                      <img
                        v-if="chatType == 1"
                        class="head"
                        :src="item.headurl ? item.headurl : require('./img/noface.gif')"
                      />
                      <img v-else class="head" :src="item.headurl" />
                      <div class="content" @click.right="openMenu(item, 0)">
                        <div
                          @click="imgPreview($event)"
                          style="word-wrap:break-word"
                          v-html="showMsgDataHandler(item)"
                        ></div>
                        <span class="arrow"></span>
                      </div>
                    </div>
                  </div>
                </li>
              </template>
            </template>
          </ul>
        </div>
        <!-- 群聊/会话-相关信息 -->
        <div
          v-show="chatType == 2 || chatType == 1 || chatType == 3"
          class="go-group"
          @click.stop="rightShow"
        >
          <img v-show="!conRightShow" class="arrow" src="./img/arrow_left.png" />
          <img v-show="conRightShow" class="arrow" src="./img/arrow_right.png" />
        </div>
      </div>
    </div>
    <viewer v-show="imgViewShow" class="viewer" @inited="inited" :images="imgList" ref="viewer">
      <img width="0" height="0" v-for="(src, index) in imgList" :src="src" :key="index" />
    </viewer>
    <layer-content ref="layer"></layer-content>
  </div>
</template>
<script>
import { remote } from 'electron'
import { mapMutations, mapGetters } from 'vuex'
import { copy, copy2, faceImgMap, isJson, formatDate } from 'common/js/util'
import { msgDataHandler } from 'common/js/business'
import { GROUPAPI } from 'api/http/groupChat'
import Session from 'common/js/session.js'
import AtMe from 'common/js/atMe.js'
import { SessionMessage, FriendMessage } from 'common/js/message.js'
import msgLoading from 'base/msgLoading'
import {
  SESSION_CHATTYPE, // 当前聊天类型——会话
  GROUP_CHATTYPE, // 当前聊天类型——群聊
  PRIVATE_CHATTYPE, // 当前聊天类型——私聊
  FRIEND_CHATTYPE, // 当前聊天类型——同伴
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

const MyMessage = 1 // 我的消息
// 右键菜单初始化工具
const Menu = remote.Menu
const MenuItem = remote.MenuItem

export default {
  data() {
    return {
      // 图片预览列表
      imgList: [],
      // 请求群历史记录——参数
      groupMsgParams: {
        toid: '', // 群id
        fromid: '', // 用户id
        teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        // 翻页的时候,把列表中离当前时间最远的消息的msgid(第一次查询不用传)
        msgid: ''
      },
      // 请求群内单聊记录——参数
      privateMsgParams: {
        toid: '', // 接收者id
        fromid: '', // 发送者id
        // teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        page: 1, // 当前页
        pages: null // 总页数
      },
      sessionInfo: null,
      friendInfo: null,
      groupInfo: null,
      privateInfo: null,
      // 请求撤回参数
      recallParams: {
        msgid: '', // 消息id
        toid: '', // 群id
        fromid: '', // 发送者id
        recall: '1' // 是否撤回(1是/0否)
      },
      // 要展示的消息
      msgData: null,
      // 当前右键的消息
      clickRightMsg: '',
      // 是否有更多的消息
      hasMoreMsg: true,
      // 图片预览显隐
      imgViewShow: false,
      // 右键菜单
      menuList: {
        // 我的消息
        my: [
          {
            label: '撤回',
            click: () => {
              this.menuOperator('recall', this.clickRightMsg)
            }
          }
          //   {
          //     label: '删除',
          //     click: () => {
          //       this.menuOperator('isDelete', this.clickRightMsg)
          //     }
          //   }
        ]
        // 别人的消息
        // other: [
        //   {
        //     label: '删除',
        //     click: () => {
        //       this.menuOperator('isDelete', this.clickRightMsg)
        //     }
        //   }
        // ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'conRightShow', // 右侧信息栏显影
      'groupInfoShow',
      'chatType', // 当前聊天类型
      'sessionImg', // 会话图片列表
      'groupImg', // 群聊图片列表
      'privateImg', // 私聊图片列表
      'friendImg', // 同伴图片列表
      'gUserInfo', // 群聊登录信息
      'sUserInfo', // 会话登录信息
      'sessionList', // 会话列表
      'groupList', // 群聊列表
      'privateList', // 私聊列表
      'friendList', // 同伴列表
      'atMeList', // atMe列表
      'memberList', // 群成员列表
      'sessionInfoShow'
    ])
  },
  created() {
    this.initMenu()
    // 监听会话消息
    this.listenNewSessionMsg()
    // 监听同伴消息
    this.listenNewFriendMsg()
    this.getHertBeat()
  },
  watch: {
    chatType: 'msgHandler', // chatType切换时消息内容要重新计算
    sessionList: {
      handler(newV) {
        if (this.sessionList) {
          this.sessionInfo =
            copy2(
              this.sessionList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          // console.log('监听到会话列表变化，当前会话变更')
        } else {
          this.sessionInfo = null
        }
        // 消息处理
        this.msgHandler()
      },
      deep: true
    },
    groupList: {
      handler(newV) {
        if (this.groupList) {
          console.log('是这里吗')
          this.groupInfo =
            copy2(
              this.groupList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          console.log('监听到群聊列表变化，当前群聊变更')
        } else {
          this.groupList = null
        }
        // 消息处理
        this.msgHandler()
      },
      deep: true
    },
    privateList: {
      handler(newV) {
        if (this.privateList) {
          this.privateInfo =
            copy2(
              this.privateList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          // console.log('监听到私聊列表变化，当前私聊变更')
        } else {
          this.privateList = null
        }
        // 消息处理
        this.msgHandler()
      },
      deep: true
    },
    friendList: {
      handler(newV) {
        if (this.friendList) {
          this.friendInfo =
            copy2(
              this.friendList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          // console.log('监听到会话列表变化，当前同伴变更')
        } else {
          this.friendInfo = null
        }
        // 消息处理
        this.msgHandler()
      },
      deep: true
    }
  },
  methods: {
    // 心跳长轮询(未读私聊消息/未读群成员/未读群聊消息)
    async getHertBeat() {
      console.log('心跳长轮训')
      // 获取未读消息前，先把私聊列表更新一下
      // await this.getPrivateList()
      // 获取未读消息
      await GROUPAPI.gHertBeat({ userId: this.gUserInfo.userId })
        .then(res => {
          if (res.data.code === '0000') {
            console.log('心跳长轮训返回')
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
            var teampUnReads = resData.teamMessage.teamUnReadMessageMap
            var privateUnReads = resData.privateMessage.privateUnReadMessageMap
            // 遍历群未读消息
            let teamUnFind = false
            if (JSON.stringify(teampUnReads) !== '{}') {
              console.log('群消息未读', resData)
              for (let key in teampUnReads) {
                let teampUnRead = teampUnReads[key]
                let teampUnReadNum = teampUnRead.unReadTeamMessageNumber
                let team = this.groupList.find(e => {
                  return e.teamid == teampUnRead.teamId
                })
                let teamIndex = this.groupList.findIndex(e => {
                  return e.teamid == teampUnRead.teamId
                })
                // 记录下未读消息对应群不存在，稍后去请求群列表
                if (!team) {
                  teamUnFind = true
                  // this.$emit('getGroupList')
                  continue
                }
                // 如果有未读消息, 就去更新群消息 和 进行At列表处理
                if (teampUnReadNum && teampUnReadNum > 0) {
                  console.log('有未读消息就去更新消息', team)
                  this.getGroupMsg(team, true)
                }
              }
              // 如果未读群消息在群列表不存在, 重新请求群聊列表
              if (teamUnFind) {
                this.$emit('getGroupList')
              }
            }
            // 遍历私聊未读消息
            let privateUnFind = false
            if (JSON.stringify(privateUnReads) !== '{}') {
              // console.log('私聊有未读消息')
              for (let key in privateUnReads) {
                let privateUnRead = privateUnReads[key]
                let privateUnReadNum = privateUnRead.unReadPrivateMsgCount
                let prvat = this.privateList.find(e => {
                  return e.id == privateUnRead.fromUserId
                })
                let prvatIndex = this.privateList.findIndex(e => {
                  return e.id == privateUnRead.fromUserId
                })
                // 如果未读私聊消息在私聊列表也不存在, 重新请求私聊列表
                if (!prvat) {
                  privateUnFind = true
                  // this.$emit('getPrivateList')
                  continue
                }
                // 如果有未读消息, 就去更新私聊消息
                if (privateUnReadNum && privateUnReadNum > 0) {
                  console.log('有未读消息就去更新消息', prvat)
                  this.getPrivateMsg(prvat, true)
                }
              }
              // 如果未读群消息在私聊列表不存在, 重新请求群私聊列表
              if (privateUnFind) {
                this.$emit('getPrivateList')
              }
            }
            this.getHertBeat()
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 监听会话消息
    listenNewSessionMsg() {
      this.$wsBus.$on('2001', res => {
        if (res.returncode === '0') {
          let sessionList = this.sessionList
          let newMsg = res.data
          // 会话消息的标志是有sesid
          if (!newMsg.sesid) {
            return
          }
          // console.log('新会话消息', newMsg)
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
          } else {
            // 消息对应的会话不存在,新增会话/新增消息
            // 新增会话
            let addSession = new Session({
              guestsid: newMsg.fromid,
              sesid: newMsg.sesid,
              lv: newMsg.lv,
              category: newMsg.category,
              nickname: newMsg.fromname,
              headurl: newMsg.fromheadurl,
              timeline: newMsg.lastmsgtime,
              unReadNum: 1,
              status: 0
            })
            // 新增消息
            let addMessage = new SessionMessage(newMsg)
            addMessage.isMine = newMsg.fromid == this.sUserInfo.userid
            // console.log(addMessage)
            // 会话消息拼接
            addSession.messageList.push(addMessage)
            // 新增会话
            this.SET_ADDSESSION({
              session: addSession
            })
          }
          // 计算所有会话未读消息数量
          // vm.reportNewMsgCount();
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 监听同伴消息
    listenNewFriendMsg() {
      this.$wsBus.$on('2001', res => {
        if (res.returncode === '0') {
          let friendList = this.friendList
          let newMsg = res.data
          // 同伴消息标志,msgtype=1
          if (newMsg.msgtype != 1) {
            return
          }
          // console.log('新同伴消息', newMsg)
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
            oldFriend.timeline = newMsg.timeline
            oldFriend.updatetime = formatDate(newMsg.timeline, 'hh:mm:ss')
            // console.log('消息对应的同伴已存在', oldIndex, oldFriend)
            this.SET_EDITFRIEND({
              index: oldIndex,
              friend: oldFriend
            })
          } else {
            // 消息对应的同伴不存在,新增同伴/新增消息
            // 新增同伴
            // console.log('新增同伴', newMsg)
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
            // console.log('消息对应的同伴不存在', addFriend)
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
    /** 获取群消息(点击群列表 或者 有未读消息才进行请求, isUnRead来区分)
     *  groupInfo(object) 群信息
     *  isUnRead(boolean) 未读消息true(为了收集atMeList)/点击群列表false(为了新增群消息)
     */
    async getGroupMsg(groupInfo, isUnRead) {
      if (!groupInfo) {
        return
      }
      // console.log('获取群消息')
      // 请求参数赋值
      this.groupMsgParams.fromid = this.gUserInfo.userId
      this.groupMsgParams.toid = this.groupMsgParams.teamid = groupInfo.teamid
      await GROUPAPI.gMsgHistory(this.groupMsgParams)
        .then(res => {
          if (res.data.code === '0000') {
            // console.log('获取群消息完成')
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            // 若取得群消息列表为空，不继续执行
            if (!resData || (resData && resData.length == 0)) {
              return
            }
            // 查找每条消息在原群消息中是否存在。
            // 不存在，新增消息/找出@Me信息。存在，不做操作。
            var groupIndex
            resData.forEach(newMsg => {
              let isHas = groupInfo.messageList.find(oldMsg => {
                return newMsg.msgid == oldMsg.msgid
              })
              if (!isHas) {
                // 更新群消息
                // console.log('消息在原群不存在', newMsg)
                groupInfo.messageList.push(newMsg)
                groupIndex = this.groupList.findIndex(oldGroup => {
                  return groupInfo.teamid == oldGroup.teamid
                })
                // 若通过未读消息进入
                if (isUnRead) {
                  // console.log('进入未读消息设置', groupInfo, this.chatType)
                  if (this.groupInfo) {
                    console.log(this.groupInfo)
                  }
                  // 当前群打开时，不进行未读消息记录和@信息处理
                  if (
                    this.chatType == GROUP_CHATTYPE &&
                    this.groupInfo &&
                    groupInfo.teamid == this.groupInfo.teamid
                  ) {
                    // console.log('离开未读消息设置', groupInfo.teamId, groupInfo.teamid)
                    return
                  }
                  // 设置未读消息数量
                  if (newMsg.fromid == this.gUserInfo.userId) {
                    groupInfo.unReadInfo.myMsgNum += 1
                  }
                  groupInfo.unReadInfo.allUnReadNum += 1
                  groupInfo.unReadInfo.unReadNum =
                    groupInfo.unReadInfo.allUnReadNum -
                    groupInfo.unReadInfo.myMsgNum
                  // console.log('设置完未读消息数量')
                  // 找出@Me信息列表
                  if (newMsg.atMsg == '1' && newMsg.atlist.length > 0) {
                    // 循环atlist——找到@我的消息
                    this.getAtMeMsg(newMsg, newMsg.atlist)
                    // console.log('找出@Me信息列表')
                  }
                }
              }
            })
            if (groupIndex > -1) {
              // console.log('更新前', groupIndex, groupInfo)
              this.SET_EDITGROUP({
                index: groupIndex,
                group: groupInfo
              })
              // console.log('更新完毕')
            }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    /** 获取私聊消息(点击私聊列表 或者 有未读消息才进行请求)
     *  privateInfo(object) 群信息
     *  isUnRead(boolean) 未读消息true/点击群列表false(都是为了更新消息)
     */
    async getPrivateMsg(privateInfo, isUnRead) {
      if (!privateInfo) {
        return 
      }
      this.privateMsgParams.toid = this.gUserInfo.userId // 接收者id
      this.privateMsgParams.fromid = privateInfo.id // 发送者id
      await GROUPAPI.gPrivateMsg(this.privateMsgParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            // 若取得私聊消息列表为空，不继续执行
            if (!resData || (resData && resData.length == 0)) {
              return
            }
            // 查找每条消息在原私聊消息中是否存在。
            // 不存在，新增消息。存在，不做操作。
            var privateIndex
            resData.forEach(newMsg => {
              let isHas = privateInfo.messageList.find(oldMsg => {
                return newMsg.msgid == oldMsg.msgid
              })
              if (!isHas) {
                // 更新群消息
                console.log('消息在原私聊不存在', newMsg)
                privateInfo.messageList.push(newMsg)
                privateIndex = this.privateList.findIndex(oldPrivate => {
                  console.log(privateInfo, oldPrivate)
                  return privateInfo.id == oldPrivate.id
                })
                // 若通过未读消息进入
                if (isUnRead) {
                  console.log('进入未读消息设置', privateInfo)
                  // 当前私聊打开时，不进行未读消息记录
                  if (
                    this.chatType == PRIVATE_CHATTYPE &&
                    this.privateInfo &&
                    privateInfo.id == this.privateInfo.id
                  ) {
                    console.log('离开未读消息设置', privateInfo.id, this.privateInfo.id)
                    return
                  }
                  // 设置未读消息数量
                  if (newMsg.fromid == this.gUserInfo.userId) {
                    privateInfo.unReadInfo.myMsgNum += 1
                  }
                  privateInfo.unReadInfo.allUnReadNum += 1
                  privateInfo.unReadInfo.unReadNum =
                    privateInfo.unReadInfo.allUnReadNum -
                    privateInfo.unReadInfo.myMsgNum
                  console.log('设置完未读私聊消息数量')
                }
              }
            })
            if (privateIndex > -1) {
              console.log('更新私聊前', privateIndex, privateInfo)
              this.SET_EDITPRIVATE({
                index: privateIndex,
                private: privateInfo
              })
              console.log('更新私聊hou', privateIndex, privateInfo)
            }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 循环atlist——找到@我的消息
    /**
     * msgInfo: 包含此条atlist的消息对象
     * atList: atList内容
     */
    getAtMeMsg(msgInfo, atList) {
      // console.log('@me', msgInfo, atList)
      atList.forEach(newAt => {
        // 如果是at我的消息
        if (newAt.userid == this.gUserInfo.userId) {
          // 通过群信息/用户信息/消息信息 组成atMe对象
          let team = this.groupList.find(group => {
            return group.teamid == msgInfo.toid
          })
          // console.log('@me找到信息', team)
          // 请求用户信息
          GROUPAPI.gUserInfo({ userid: msgInfo.fromid })
            .then(res => {
              if (res.data.code === '0000') {
                let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
                // 如果@我的消息在缓存atList中已经存在(同群同人),不做操作。
                if (
                  this.atMeList && this.atMeList.length > 0 &&
                  this.atMeList.find(oldAt => {
                    // console.log(msgInfo, oldAt)
                    return (
                      oldAt.groupId == msgInfo.toid && oldAt.userId == msgInfo.fromid
                    )
                  })
                ) {
                  // console.log('已经存在？')
                  return false
                }
                // console.log('@me,请求用户信息', resData)
                // 在atList中新增at信息
                let addAtMe = new AtMe({
                  groupId: msgInfo.toid, // 群id
                  userId: msgInfo.fromid, // 发送者id
                  groupName: (team && team.teamname) || ' ', // 群名
                  userName: resData.nickname, // 用户名
                  sendTime: msgInfo.sendTime // 发送时间
                })
                // console.log('@me,请求用户信息1', addAtMe)
                this.SET_ADDATME({
                  atMe: addAtMe
                })
              } else {
                this.$refs.layer.show(res.data.message)
              }
            })
            .catch(res => {
              this.$refs.layer.show(res)
            })
        }
      })
    },
    // 消息处理
    msgHandler() {
      console.log('进入消息处理msgHandler')
      // 会话
      if (this.chatType == SESSION_CHATTYPE) {
        // 若当前会话存在，就去取消息列表，否则初始化为空数组
        if (!this.sessionInfo || !this.sessionInfo.messageList) {
          this.msgData = []
          return false
        }
        this.msgData = this.sessionInfo.messageList
        // 群聊
      } else if (this.chatType == GROUP_CHATTYPE) {
        // 若群消息列表存在，通过群成员列表完善信息，否则初始化为空数组
        if (!this.groupInfo || !this.groupInfo.messageList) {
          this.msgData = []
          return false
        }
        console.log(this.groupInfo.messageList, this.memberList)
        this.groupInfo.messageList.forEach((e, i, arr) => {
          this.memberList.forEach((em, im, arrm) => {
            if (e.fromid == em.memberid) {
              e.nickname = em.nickname
              e.headurl = em.headurl
            }
          })
        })
        this.msgData = this.groupInfo.messageList
        // 私聊
      } else if (this.chatType == PRIVATE_CHATTYPE) {
        // 若私聊列表存在，处理安卓消息格式，否则初始化空数组
        if (!this.privateInfo || !this.privateInfo.messageList) {
          this.msgData = []
          return false
        }
        this.privateInfo.messageList.forEach((e, i, arr) => {
          let isjson = isJson(e.msgbody)
          //   安卓发的是json格式 {msgtext, teamid, teamname}
          if (isjson) {
            let msgbody = JSON.parse(e.msgbody)
            e.msgbody = msgbody.msgtext
          }
          if (e.formatdate) {
            e.sendTime = e.formatdate
          }
        })
        this.msgData = this.privateInfo.messageList
        // 同伴
      } else if (this.chatType == FRIEND_CHATTYPE) {
        // 若当前同伴存在，就去取消息列表，否则初始化为空数组
        if (!this.friendInfo || !this.friendInfo.messageList) {
          this.msgData = []
          return false
        }
        this.msgData = this.friendInfo.messageList
      }
    },
    // 处理消息内容
    showMsgDataHandler(data) {
      console.log('同伴消息', data, this.chatType)
      let result = msgDataHandler(data, this.chatType)
      return result
    },
    // 会话加载更多历史消息
    loadMoreHistory(item) {
      if (item.handleLoadHistory) {
        var newPage = this.sessionInfo.currMsgPage + 1
        sessionChatList({
          userid: this.sessionInfo.guestsid,
          page: newPage
        })
          .then(res => {
            if (res.data.returncode == '0') {
              let sessionInfo = this.sessionInfo
              let oldMsgList = sessionInfo.messageList
              // 历史消息收集
              res.data.list.forEach((newMsg, i) => {
                // 新增消息
                newMsg.isMine = newMsg.fromid !== sessionInfo.sesorigin.userid
                newMsg.fromHistory = true
                let msg = new SessionMessage(newMsg)
                oldMsgList.splice(1, 0, msg)
              })
              // 是否还有历史消息判断
              if (newPage == res.data.totalpage) {
                oldMsgList.splice(0, 1, {
                  msgtype: 99,
                  text: '没有更多了'
                })
              }
              // 更新当前会话信息
              sessionInfo.currMsgPage = newPage
              let index = this.sessionList.findIndex((e, i, arr) => {
                return sessionInfo.sesid == e.sesid
              })
              // 更新会话消息
              this.SET_EDITSESSION({
                index: index,
                session: sessionInfo
              })
              // sessionList[index] = sessionInfo
              // 更新会话列表
              // this.SET_SESSIONLIST({
              //   sessionList: sessionList
              // })
            } else {
              this.$refs.layer.show(res.returnmsg)
            }
          })
          .catch(res => {
            this.$refs.layer.show(res)
          })
      }
    },
    // 初始化图片预览
    inited(viewer) {
      this.$viewer = viewer
    },
    // 图片预览
    imgPreview(event) {
      // console.log('图片信息', event)
      if (
        event.target.nodeName === 'IMG' &&
        event.target.classList[0] === 'capture'
      ) {
        let imgsrc = event.target.currentSrc
        this.imgList.splice(0, this.imgList.length)
        this.imgList.push(imgsrc)
        // 因为vue组件响应式渲染是异步的，viewer的update需要等渲染完再进行
        setTimeout(() => {
          this.$viewer.update()
          this.imgViewShow = true
          this.$viewer.view(0)
        }, 20)
        // let curIndex = this.imgList.findIndex((e, i, arr) => {
        //   return e === imgsrc
        // })
      }
    },
    // 初始化右键菜单
    initMenu() {
      this.menu_my = new Menu()
      //   this.menu_other = new Menu()
      this.menuList.my.forEach((e, i, arr) => {
        this.menu_my.append(new MenuItem(e))
      })
      //   this.menuList.other.forEach((e, i, arr) => {
      //     this.menu_other.append(new MenuItem(e))
      //   })
    },
    // 右键消息打开菜单
    openMenu(item, type) {
      // console.log('撤回的消息', item)
      this.clickRightMsg = item.msgid
      if (type === MyMessage) {
        this.menu_my.popup(remote.getCurrentWindow())
      }
      //    else {
      //     this.menu_other.popup(remote.getCurrentWindow())
      //   }
    },
    // 删除/撤回消息
    menuOperator(type, id) {
      // console.log('撤回消息id', id)
      this.recallParams.msgid = id
      this.recallParams.toid = this.groupInfo.teamid
      this.recallParams.fromid = this.gUserInfo.userId
      GROUPAPI.gMsgRecall(this.recallParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            // console.log('撤回结果', resData)
            // console.log(id, this.msgData)
            this.msgData.forEach((e, i, arr) => {
              if (e.msgid === id) {
                e[type] = '1'
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
    // 打开右侧信息栏
    rightShow() {
      this.SET_RIGHTSHOW({
        conRightShow: !this.conRightShow
      })
    },
    // 滚动到底部
    scrollToBottom() {
      if (this.$refs.msgcon && this.$refs.msgcon.scrollHeight) {
        this.$refs.msgcon.scrollTop = this.$refs.msgcon.scrollHeight
      }
      //   console.log(this.$refs.msgcon.scrollTop, this.$refs.msgcon.scrollHeight)
    },
    ...mapMutations({
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSION_MSG: 'SET_SESSION_MSG',
      SET_SESMSGLIST: 'SET_SESMSGLIST',
      SET_SESMSGPAGE: 'SET_SESMSGPAGE',
      SET_SESSIONLIST: 'SET_SESSIONLIST',
      SET_FRIENDLIST: 'SET_FRIENDLIST',
      SET_EDITSESSION: 'SET_EDITSESSION',
      SET_ADDSESSION: 'SET_ADDSESSION',
      SET_EDITFRIEND: 'SET_EDITFRIEND',
      SET_ADDFRIEND: 'SET_ADDFRIEND',
      SET_GROUPLIST: 'SET_GROUPLIST',
      SET_EDITGROUP: 'SET_EDITGROUP',
      SET_ADDATME: 'SET_ADDATME',
      SET_EDITPRIVATE: 'SET_EDITPRIVATE',
      SET_RIGHTSHOW: 'SET_RIGHTSHOW'
    })
  },
  components: {
    msgLoading
  },
  filters: {
    transTerminal: function(tname) {
      let str
      switch (tname) {
        case '1':
          str = 'iOS'
          break
        case '2':
          str = 'android'
          break
        case '3':
          str = 'PC客服'
          break
        case '4':
          str = 'PC浏览器'
          break
        case '5':
          str = '微信'
          break
        case '6':
          str = '手机浏览器-iOS'
          break
        case '7':
          str = '手机浏览器-android'
          break
        default:
          str = '未知'
      }
      return str
    }
  }
}
</script>
<style lang='scss' scoped>
.wrap {
  flex: 1;
  display: flex;

  .chat-con {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

.chat-title {
  // width: 66%;
  width: 100%;
  border-bottom: 1px solid $border;
  background-color: $blank;
  .title {
    height: 57px;
    padding: 6px 20px;
  }
  .tag {
    height: 30px;
    text-align: center;
    line-height: 25px;
    background-color: $pink;
    color: $blank;
    border-radius: 4px;
    margin-left: 6px;
    font-size: 12px;
    padding: 4px 10px;
    font-weight: bold;
  }

  .detail {
    font-size: 12px;
    display: flex;
    align-items: center;

    span {
      margin-right: 10px;
      margin-top: 2px;
      color: $placeholder;
    }

    .more {
      cursor: default;
      flex: 1;
      color: $black;
      text-align: right;
    }
  }
}

.chat-content {
  transform: translate(0, 0);
  width: 100%;
  flex: 1;
  position: relative;
  background-color: $listHover;
  border-bottom: 1px solid $border;
  overflow: auto;
  padding-top: 10px;

  .go-group {
    position: absolute;
    width: 0;
    right: 0px;
    height: 110px;
    border-width: 10px;
    border-style: solid;
    top: 50%;
    transform: translateY(-50%);
    border-color: transparent rgb(213, 213, 213) transparent transparent;
    cursor: pointer;
    &:hover {
      border-color: transparent #333 transparent transparent;
    }

    .arrow {
      width: 6px;
      height: 10px;
      position: absolute;
      top: 50%;
      margin-top: -5px;
      margin-left: 2px;
    }
  }

  .load-more {
    width: 100px;
    background-color: rgb(193, 193, 193);
    text-align: center;
    font-size: 12px;
    padding: 6px;
    margin: 10px auto;
    border-radius: 5px;
    cursor: default;
  }
  .ul-wrap {
    width: 100%;
    position: absolute;
    height: 100%;
    overflow: auto;
    padding-bottom: 20px;
  }
  ul {
    .recall,
    .delete,
    .sysmsg {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 14px;

      .time {
        color: $content;
      }

      .text {
        background-color: rgb(193, 193, 193);
        text-align: center;
        font-size: 12px;
        padding: 6px;
        margin: 14px auto;
        border-radius: 5px;
        cursor: default;
      }
    }

    li {
      margin-top: 10px;
      display: flex;

      .title {
        margin-bottom: 6px;
        font-size: 14px;
      }

      // position: relative;
      .head {
        // position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        vertical-align: top;
      }

      .content {
        position: relative;
        display: inline-block;
        width: auto;
        padding: 10px 6px;
        border-radius: 4px;
        max-width: 300px;
        font-size: 0;
        vertical-align: top;
        div {
          font-size: 16px;
        }
        // box-shadow: 0 0 5px rgba(0,0,0,.3);

        .arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-width: 10px;
          border-style: solid;
        }
      }
    }

    .my {
      justify-content: flex-end;
      .con-wrap {
        margin-right: 10px;
      }
      .con,
      .title {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      .name {
        margin-left: 10px;
      }

      .content {
        background-color: $messageBg;
        margin-right: 16px;

        .arrow {
          right: -16px;
          top: 6px;
          border-color: transparent transparent transparent $messageBg;
        }
      }
    }

    .other {
      justify-content: flex-start;

      .con-wrap {
        margin-left: 10px;
      }
      .con,
      .title {
        display: flex;
        justify-content: flex-start;
      }
      .name {
        margin-right: 10px;
      }

      .content {
        background-color: $blank;
        margin-left: 16px;

        .arrow {
          left: -16px;
          top: 6px;
          border-color: transparent $blank transparent transparent;
        }
      }
    }
  }
}
</style>
<style>
li .content span {
  font-size: 14px;
}
</style>