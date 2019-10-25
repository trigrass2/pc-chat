<template>
  <div class="wrap">
    <div class="chat-con">
      <div class="chat-title">
        <!-- 会话头部栏 -->
        <div class="title" v-show="chatType === 1 && sessionInfo">
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
        </div>
        <!-- 群聊头部栏 -->
        <div class="title" v-show="chatType === 2 && groupInfo">
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
        <div class="title" v-show="chatType === 4">
          <div class="name">
            <span>{{friendInfo && friendInfo.nickname}}</span>
          </div>
          <div class="detail">
            <span>内部对话</span>
          </div>
        </div>
        <!-- 私聊头部栏 -->
        <div class="title" v-show="chatType === 3 && privateInfo">
          <div class="name">
            <span>{{privateInfo && privateInfo.name}}</span>
          </div>
        </div>
      </div>
      <!-- 消息内容展示 -->
      <div class="chat-content" ref="msgcon">
        <!-- <div class="load-more" v-show="msgData.hasMoreMsg" @click="moreMsg">加载更多</div> -->
        <ul v-if="msgData && msgData.length > 0">
          <template v-for="(item, index) in msgData">
            <!-- 系统的消息 -->
            <template v-if="item.msgtype && item.msgtype == '99'">
              <div class="sysmsg" @click="loadMoreHistory(item)">
                <div class="time">{{item.createtime}}</div>
                <div class="text">{{item.text}}</div>
              </div>
            </template>
            <template v-else-if="item.recall === '1' || item.isback">
              <li class="recall">
                <div class="time">{{item.sendTime}}</div>
                <div class="text" v-if="item.fromid === gUserInfo.userId || item.isMine">你撤回了一条消息</div>
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
              <li class="my" v-if="item.fromid === gUserInfo.userId || item.isMine">
                <div class="con-wrap">
                  <div class="title" v-if="chatType !== 1 && chatType !== 4">
                    <span class="time">{{item.sendTime}}</span>
                    <span class="name">{{item.nickname}}</span>
                  </div>
                  <div class="con">
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
                  <div class="title" v-if="chatType !== 1 && chatType !== 4">
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
        <!-- 群聊-群相关信息 -->
        <div v-show="chatType === 2" class="go-group" @click.stop="groupInfoOpen">
          <img v-show="!groupInfoShow" class="arrow" src="./img/arrow_left.png" />
          <img v-show="groupInfoShow" class="arrow" src="./img/arrow_right.png" />
        </div>
      </div>
    </div>
    <viewer
      v-show="imgViewShow"
      class="viewer"
      @inited="inited"
      :images="imgPreviewList"
      ref="viewer"
    >
      <img width="0" height="0" v-for="src in imgPreviewList" :src="src" :key="src" />
    </viewer>
    <layer-content ref="layer"></layer-content>
  </div>
</template>
<script>
import { remote } from 'electron'
import { mapMutations, mapGetters } from 'vuex'
import { copy, copy2, faceImgMap, isJson } from 'common/js/util'
import { msgDataHandler } from 'common/js/business'
import { GROUPAPI } from 'api/http/groupChat'
import Session from 'common/js/session.js'
import Message from 'common/js/message.js'
import {
  sessionList,
  ip2area,
  realInfo,
  sessionChatList
} from 'api/http/sessionChat'

// const SESSION = 3;
const MyMessage = 1
const Menu = remote.Menu
const MenuItem = remote.MenuItem
const SESSION = 1
const GROUP = 2
const PRIVATE = 3
const FRIEND = 4

export default {
  props: {
    // 当前群信息
    groupInfo: {
      type: Object,
      default: {
        teamname: '群聊名字',
        teamTypeName: '群类型',
        createDate: '2019-09-12'
      }
    },
    // 当前群聊消息
    groupMsgList: {
      type: Array,
      default: null
    },
    // 当前群成员信息
    groupMembers: {
      type: Array,
      default: null
    },
    // 当前私聊信息
    privateInfo: {
      type: Object,
      default: null
    },
    // 当前私聊消息
    privateMsgList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      sessionInfo: null,
      friendInfo: null,
      // 请求撤回参数
      recallParams: {
        msgid: '', // 消息id
        toid: '', // 群id
        fromid: '', // 发送者id
        recall: '1' // 是否撤回(1是/0否)
      },
      // 要展示的消息
      msgData: null,
      sessionData: {
        hasMoreMsg: true
      },
      groupData: {
        hasMoreMsg: true
      },
      privateData: {
        hasMoreMsg: true
      },
      // 当前右键的消息
      clickRightMsg: '',
      // 是否有更多的消息
      hasMoreMsg: true,
      nini: '13123',
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
    // 图片预览-图片数据准备
    imgPreviewList() {
      if (this.chatType === SESSION) {
        return this.sessionImg
      } else if (this.chatType === GROUP) {
        return this.groupImg
      } else if (this.chatType === PRIVATE) {
        return this.privateImg
      }
    },
    // 表情是否显示  当前聊天类型  会话聊天内容  群聊聊天内容  私聊聊天内容  当前用户信息  会话对象信息  同伴列表  会话登录信息
    ...mapGetters([
      'groupInfoShow',
      'chatType',
      // 'sessionMsgList',
      //   'groupMsgList',
      //   'privateMsgList',
      'sessionImg',
      'groupImg',
      'privateImg',
      'gUserInfo',
      'sessionList',
      'friendList',
      'sUserInfo'
    ])
  },
  created() {
    // console.log('哈哈哈哈:' + this.chatType)
    this.initMenu()
  },
  watch: {
    chatType: 'msgHandler',
    groupMsgList: 'msgHandler',
    privateMsgList: 'msgHandler',
    sessionList: {
      handler (newV) {
        if (this.sessionList) {
          this.sessionInfo = copy2(this.sessionList.find((e, i, arr) => {
            return e.isSelected 
          })) || null
          console.log('有反应了')
        } else {
          this.sessionInfo = null
        }
        this.msgHandler()
      },
      deep: true
    },
    friendList: {
      handler (newV) {
        if (this.friendList) {
          this.friendInfo = copy2(this.friendList.find((e, i, arr) => {
            return e.isSelected 
          })) || null
          console.log('有反应了')
        } else {
          this.friendInfo = null
        }
        this.msgHandler()
      },
      deep: true
    }
  },
  methods: {
    // 消息处理
    msgHandler() {
      // 会话
      if (this.chatType === SESSION) {
        // 若当前会话存在，就去取消息列表，否则初始化为空数组
        if (this.sessionInfo) {
          var sessionMsgList = this.sessionInfo.messageList
        }
        if (!sessionMsgList || sessionMsgList.length === 0) {
          this.msgData = []
          return false
        }
        this.msgData = sessionMsgList
      // 群聊
      } else if (this.chatType === GROUP) {
        // 若群消息列表存在，通过群成员列表完善信息，否则初始化为空数组
        if (!this.groupMsgList || this.groupMsgList.length === 0) {
          this.msgData = []
          return false
        }
        this.groupMsgList.forEach((e, i, arr) => {
          this.groupMembers.forEach((em, im, arrm) => {
            if (e.fromid === em.memberid) {
              e.nickname = em.nickname
              e.headurl = em.headurl
            }
          })
        })
        this.msgData = this.groupMsgList
      // 私聊
      } else if (this.chatType === PRIVATE) {
        // 若私聊列表存在，处理安卓消息格式，否则初始化空数组
        if (!this.privateMsgList || this.privateMsgList.length === 0) {
          this.msgData = []
          return false
        }
        this.privateMsgList.forEach((e, i, arr) => {
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
        this.msgData = this.privateMsgList
      // 同伴
      } else if (this.chatType === FRIEND) {
        // 若当前同伴存在，就去取消息列表，否则初始化为空数组
        if (this.friendInfo) {
          var friendMsgList = this.friendInfo.messageList
        }
        if (!friendMsgList || friendMsgList.length === 0) {
          this.msgData = []
          return false
        }
        this.msgData = friendMsgList
      }
    },
    // 处理消息内容
    showMsgDataHandler(data) {
      let result = msgDataHandler(data)
      setTimeout(() => {
        this.scrollToBottom()
      }, 20)
      return result
    },
    // 会话加载更多历史消息
    loadMoreHistory(item) {
      if (item.handleLoadHistory) {
        var newPage = this.sessionInfo.currMsgPage + 1
        sessionChatList({
          userid: this.sUserInfo.userid,
          page: newPage
        })
          .then(res => {
            if (res.data.returncode == '0') {
              let sessionInfo = copy2(this.sessionInfo)
              let oldMsgList = sessionInfo.messageList
              // 历史消息收集
              res.data.list.forEach((newMsg, i) => {
                // 新增消息
                newMsg.isMine =
                  newMsg.fromid !== sessionInfo.sesorigin.userid
                newMsg.fromHistory = true
                let msg = new Message(newMsg)
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
              let sessionList = copy2(this.sessionList)
              let index = this.sessionList.findIndex((e, i, arr) => {
                return sessionInfo.sesid == e.sesid
              })
              sessionList[index] = sessionInfo
              // 更新会话列表
              this.SET_SESSIONLIST({
                sessionList: sessionList
              })
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
      if (
        event.target.nodeName === 'IMG' &&
        event.target.classList[0] === 'capture'
      ) {
        let imgsrc = event.target.currentSrc
        let curIndex = this.imgPreviewList.findIndex((e, i, arr) => {
          return e === imgsrc
        })
        this.imgViewShow = true
        // console.log('哈哈', curIndex)
        this.$viewer.view(curIndex)
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
      console.log('撤回的消息', item)
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
      console.log('撤回消息id', id)
      this.recallParams.msgid = id
      this.recallParams.toid = this.groupInfo.teamid
      this.recallParams.fromid = this.gUserInfo.userId
      GROUPAPI.gMsgRecall(this.recallParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            console.log('撤回结果', resData)
            console.log(id, this.msgData)
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

    // 打开群聊详情
    groupInfoOpen() {
      this.SET_GROUPINFO({
        groupInfoShow: !this.groupInfoShow
      })
    },
    // 滚动到底部
    scrollToBottom() {
      //   console.log(this.$refs.msgcon.scrollTop, this.$refs.msgcon.scrollHeight)
      this.$refs.msgcon.scrollTop = this.$refs.msgcon.scrollHeight
    },
    ...mapMutations({
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSION_MSG: 'SET_SESSION_MSG',
      SET_SESMSGLIST: 'SET_SESMSGLIST',
      SET_SESMSGPAGE: 'SET_SESMSGPAGE',
      SET_SESSIONLIST: 'SET_SESSIONLIST',
      SET_FRIENDLIST: 'SET_FRIENDLIST'
    })
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
  .title{
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
    right: 0;
    height: 110px;
    border-width: 10px;
    border-style: solid;
    top: 28%;
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