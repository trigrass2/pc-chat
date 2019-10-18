<template>
  <div class="wrap">
    <div class="chat-con">
      <div class="chat-title">
        <!-- 会话头部栏 -->
        <div class="session-chat-title" v-show="chatType === 1">
          <div class="name">
            <span>GR000115601</span>
            <span class="tag" @click="xixi">咨询</span>
          </div>
          <div class="detail">
            创建于：
            <span>2019-05-21</span>
            手机号：
            <span>17826894060</span>
            渠道：
            <span>PC浏览器</span>
            IP：
            <span class="more">更多信息..</span>
          </div>
        </div>
        <!-- 群聊头部栏 -->
        <div class="group-chat-title" v-show="chatType === 2">
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
        <div class="friend-chat-title" v-show="chatType === 4">
          <div class="name">
            <span>zjy001</span>
          </div>
          <div class="detail">
            <span>内部对话</span>
          </div>
        </div>
        <!-- 私聊头部栏 -->
        <div class="privte-chat-title" v-show="chatType === 3">
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
            <!-- 撤回的消息 -->
            <template v-if="item.recall === '1'">
              <li class="recall">
                <div class="time">{{item.sendTime}}</div>
                <div class="text" v-if="item.fromid === userInfo.userId">你撤回了一条消息</div>
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
              <li class="my" v-if="item.fromid === userInfo.userId">
                <div class="con-wrap">
                  <div class="title">
                    <span class="time">{{item.sendTime}}</span>
                    <span class="name">{{item.nickname}}</span>
                  </div>
                  <div class="con">
                    <div class="content" @click.right="openMenu(item, 1)">
                      <div @click="imgPreview($event)" style="word-wrap:break-word" v-html="msgDataHandler(item)"></div>
                      <span class="arrow"></span>
                    </div>
                    <img class="head" :src="item.headurl" />
                  </div>
                </div>
              </li>
              <!-- 别人的消息 -->
              <li class="other" v-else>
                <div class="con-wrap">
                  <div class="title">
                    <span class="name">{{item.nickname}}</span>
                    <span class="time">{{item.sendTime}}</span>
                  </div>
                  <div class="con">
                    <img class="head" :src="item.headurl" />
                    <div class="content" @click.right="openMenu(item, 0)">
                      <div @click="imgPreview($event)" style="word-wrap:break-word" v-html="msgDataHandler(item)"></div>
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
import { copy, faceImgMap, isJson } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'

// const SESSION = 3;
const MyMessage = 1
const Menu = remote.Menu
const MenuItem = remote.MenuItem
const SESSION = 1
const GROUP = 2
const PRIVATE = 3

export default {
  props: {
    // 最新消息
    // msgLast: {
    //   type: Object,
    //   default: null
    // },
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
      // 请求撤回参数
      recallParams: {
        msgid: '', // 消息id
        toid: '', // 群id
        fromid: '', // 发送者id
        recall: '1' // 是否撤回(1是/0否)
      },
      // 测试 当前群聊信息
      //   groupInfo: {
      //     teamname: '群聊名字',
      //     teamTypeName: '群类型',
      //     createDate: '2019-09-12'
      //   },
      // 测试 本人信息
      //   user: {
      //     id: '1'
      //   },
      //   要展示的消息
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
      // 当前聊天类型
      // chatType: SESSION,
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
      // messageList: [
      //   {
      //     id: 1,
      //     time: "2019-07-09 12:00:00",
      //     fromid: "1",
      //     fromName: "小王",
      //     content: "大家好！我是小王,请多多关照关照。",
      //     isRecall: false,
      //     isDelete: false
      //   },
      //   {
      //     id: 2,
      //     time: "2019-07-09 12:00:00",
      //     fromid: "2",
      //     fromName: "小李",
      //     content: "大家好！我是小李,请多多关照关照。",
      //     isRecall: false,
      //     isDelete: false
      //   }
      // ]
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
    // 表情是否显示  当前聊天类型  会话聊天内容  群聊聊天内容  私聊聊天内容  当前用户信息
    ...mapGetters([
      'groupInfoShow',
      'chatType',
      'sessionMsgList',
      //   'groupMsgList',
      //   'privateMsgList',
      'sessionImg',
      'groupImg',
      'privateImg',
      'userInfo'
    ])
  },
  created() {
    // console.log('哈哈哈哈:' + this.chatType)
    this.initMenu()
  },
  watch: {
    chatType: 'msgHandler',
    groupMsgList: 'msgHandler',
    privateMsgList: 'msgHandler'
  },
  mounted() {
    // console.log(this.sessionMsgList)
  },
  methods: {
    // 消息处理
    msgHandler() {
      console.log('消息处理', this.chatType)
      if (this.chatType === SESSION) {
        this.msgData = this.sessionMsgList
        // console.log('现在是会话', JSON.stringify(this.msgData))
        // msgData.hasMoreMsg = false
      } else if (this.chatType === GROUP) {
        // console.log('消息处理进来1')
        // 得到当前群的最新群消息
        if (!this.groupMsgList || this.groupMsgList.length === 0) {
          this.msgData = []
          return false
        }
        // console.log('消息处理进来2', this.groupMsgList)
        // this.msgData = this.groupMsgList.filter((e, i, arr) => {
        //   return Number(e.id) === Number(this.groupInfo.teamid)
        // })
        this.groupMsgList.forEach((e, i, arr) => {
          this.groupMembers.forEach((em, im, arrm) => {
            if (e.fromid === em.memberid) {
              e.nickname = em.nickname
              e.headurl = em.headurl
            }
          })
        })
        this.msgData = this.groupMsgList
        // console.log('现在是群聊', JSON.stringify(this.msgData))
        // msgData.hasMoreMsg = false
      } else if (this.chatType === PRIVATE) {
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
          console.log('哈哈哈', e.msgbody, e)
        })
        this.msgData = this.privateMsgList
        console.log('现在是私聊', this.msgData)
        // msgData.hasMoreMsg = false
      }
    },
    // 加载更多消息
    moreMsg() {},
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
    xixi() {
      // 会话
      let message = {
        id: 100,
        time: '2019-07-09 12:00:00',
        fromid: '1',
        fromName: '小王',
        content: '哈哈',
        isRecall: false,
        isDelete: false
      }
      let newMessage = []
      newMessage.push(message)
      this.SET_SESSION_MSG({
        sessionMsgList: newMessage
      })
      // this.SET_SESSION_MSG({});
    },
    // 加载更多会话消息
    moreMsgSession() {},
    // 加载更多群聊消息
    moreMsgGroup() {},
    // 加载更多私聊消息
    moreMsgPrivate() {},
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
      this.recallParams.fromid = this.userInfo.userId
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
    // 消息数据处理
    msgDataHandler(data) {
      console.log('消息数据处理', data)
      var newMsg = copy(data)
      // 文本表情——表情字符串替换为图片img节点
      if (newMsg.mediatype === 1 || newMsg.mediatype === 0) {
        var regex = /\[(.+?)\]/g
        var result
        // console.log('消息处理中——文本', newMsg)
        while ((result = regex.exec(newMsg.msgbody)) !== null) {
          //   console.log(newMsg.content)
          let imgIndex = faceImgMap.findIndex((e, i, arr) => {
            return e === result[0]
          })
          //   console.log('表情index', imgIndex)
          if (imgIndex !== -1) {
            var src = require('common/img/' + Number(imgIndex + 1) + '.png')
          }
          //   let src = result[0].substr(2, result[0].length - 3)
          //   src = require('common/img/' + src + '.png')
          let faceImgHtml = `<img src='${src}' width='15px' height='15px' style="margin-top: 4px;"></img>`
          if (newMsg.content) {
            newMsg.content = newMsg.content.replace(result[0], faceImgHtml)
          } else {
            newMsg.content = newMsg.msgbody.replace(result[0], faceImgHtml)
          }
        }
        // console.log('qwewqe', newMsg.content)
        if (!newMsg.content) {
          newMsg.content = newMsg.msgbody
        }
        // console.log('ewwwwww', newMsg.content)
        // 图片
      } else if (newMsg.mediatype === 3) {
        // scale: Width/height
        // if (newMsg.scale) {
        //   var scale = newMsg.scale
        //   var width = 100 * scale
        // } else {
        //   width = 100
        // }
        // // width最大500px
        // if (width > 500) {
        //   width = 500
        // }
        // 图片 替换为图片img节点
        // console.log('消息处理中——图片', newMsg)
        newMsg.content = `<img class='capture' src='${newMsg.msgbody}' style="background-size: contain; width: 100px; height:100px;"></img>`
      } else if (newMsg.mediatype === 5) {
        newMsg.content = '我是图文'
      }
      // console.log(newMsg)
      setTimeout(() => {
        // console.log(123)
        this.scrollToBottom()
      }, 20)
      //   console.log('这里是处理好的消息：', newMsg.content)
      return newMsg.content
    },
    // 滚动到底部
    scrollToBottom() {
      //   console.log(this.$refs.msgcon.scrollTop, this.$refs.msgcon.scrollHeight)
      this.$refs.msgcon.scrollTop = this.$refs.msgcon.scrollHeight
    },
    ...mapMutations({
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSION_MSG: 'SET_SESSION_MSG'
    })
  }
}
</script>
<style lang='scss' scoped>
.wrap {
  height: 100%;
  display: flex;

  .chat-con {
    width: 100%;
  }
}

.chat-title {
  // width: 66%;
  width: 100%;
  height: 57px;
  padding: 6px 20px;
  border-bottom: 1px solid $border;
  background-color: $blank;

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
  height: 100%;
  position: relative;
  background-color: $listHover;
  border-bottom: 1px solid $border;
  overflow: auto;
  padding-bottom: 308px;

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
    .delete {
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
        margin: 10px auto;
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