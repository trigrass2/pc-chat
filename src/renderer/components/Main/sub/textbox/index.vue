<template>
  <div class="wrap">
    <div class="toolsbar">
      <div class="chat-tools">
        <img src="./img/editor-tools-face.png" class="face" @click.stop="openFace" />
        <!-- <label class="face"> -->
        <!-- <div style="display: inline-block;position: relative"> -->
        <!-- <img src="./img/editor-tools-img.png" class="face" /> -->
        <img-uploader
          :types="['png','jpg','jpeg']"
          :maxSize="2048"
          @uploadSuccess="uploadSuccess"
          @uploadError="uploadError"
        ></img-uploader>
        <!-- </div> -->
        <!-- </label> -->
        <img src="./img/editor-tools-prtsc.png" @click="captureScreen" />
        <!-- <img src="./img/editor-tools-material.png" @click.stop="openFace" /> -->
        <!-- <div v-show="chatType === 1" class="session-record" @click="sessionInfoOpen">聊天记录&摘要</div> -->
      </div>
      <div class="faceimg-box" v-show="faceImgShow">
        <template v-for="n in 70">
          <img @click="faceSelect(n)" :src="getFaceImg(n)" />
        </template>
      </div>
    </div>
    <!-- <div>{{message}}</div> -->
    <div class="message-box">
      <edit-div class="message" v-model="message" ref="editdiv"></edit-div>
      <div class="operate">
        <div
          v-show="chatType == 1 && sessionInfo && sessionInfo.status == 0"
          class="session-end"
          @click="sessionEnd"
        >结束会话</div>
        <div class="common-phrases">
          <div
            v-show="chatType == 1 && sessionInfo && sessionInfo.status == 0"
            class="enter"
            @click="openPhrases"
          >常用语</div>
          <ul v-show="commonPhrasesShow && chatType === 1" @mouseleave="closePhrases">
            <li v-for="(item, index) in phrasesList" @click="usePhrases(item)">{{item.content}}</li>
          </ul>
        </div>
        <div class="send" @click="sendFirst()">发送(Ctrl+Enter)</div>
      </div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { uuid } from 'api/http/config'
import { GROUPAPI, imgUploader } from 'api/http/groupChat'
import { copy, copy2, faceImgMap, formatDate } from 'common/js/util'
import editDiv from './sub/editDiv'
import {
  sessionMessage,
  SESSION_CHATTYPE,
  GROUP_CHATTYPE,
  PRIVATE_CHATTYPE,
  FRIEND_CHATTYPE,
  MSG_ING,
  MSG_SUC,
  MSG_FAI,
  FRIEND_MSG,
  GROUP_MSG,
  PRIVATE_MSG,
  SESSION_MSG
} from 'common/js/business'

export default {
  props: {},
  created() {
    // 监听发送会话/同伴消息——回执
    this.listenMsgSend()
    // 监听截图成功后返回图片信息
    this.listenCaptureImg()
  },
  data() {
    return {
      sessionInfo: null,
      groupInfo: null,
      privateInfo: null,
      friendInfo: null,
      //   表情是否显示
      //   faceImgShow: true,
      // 消息内容
      message: '',
      // 群聊——@列表
      atList: [],
      // 常用语是否显示
      commonPhrasesShow: false,
      // 常用语列表
      phrasesList: sessionMessage
    }
  },
  // 监听当前session/group/private/friend的变化
  watch: {
    sessionList: {
      handler(newV) {
        if (this.sessionList) {
          this.sessionInfo =
            copy2(
              this.sessionList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
        } else {
          this.sessionInfo = null
        }
      },
      deep: true
    },
    groupList: {
      handler(newV) {
        if (this.groupList) {
          this.groupInfo =
            copy2(
              this.groupList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
        } else {
          this.groupList = null
        }
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
        } else {
          this.privateList = null
        }
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
        } else {
          this.friendInfo = null
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters([
      'sUserInfo', // 会话用户信息
      'gUserInfo', // 群聊用户信息
      'faceImgShow', // 表情是否显示
      'sessionInfoShow', // 会话相关信息显示
      'chatType',
      'sessionList', // 会话列表
      'groupList', // 群聊列表
      'privateList', // 私聊列表
      'friendList', // 同伴列表
      'locktext', // 锁住发送按钮
      'sendMsgList' // 发送的消息列表(发送中-失败)
    ])
  },
  methods: {
    getScreen() {
      // console.log(document.body)
    },
    // 选中表情
    faceSelect(n) {
      let src = this.getFaceImg(n)
      let faceImgHtml = `<img src='${src}' name='${n}' width='20px' height='20px' style="margin:4px 4px 0;"></img>`
      // div(contenteditable=true)时光标移到最后(因为focus默认光标在最前面)
      // this.$refs.editdiv.keepLastIndex()
      // 指定dom获得焦点时，光标处插入html
      this.$refs.editdiv.insertAtCursor(faceImgHtml)
      this.SET_FACEIMG({
        faceImgShow: false
      })
    },
    // 表情路径拼接
    getFaceImg(n) {
      return require('./img/' + n + '.png')
    },
    // 表情展示/隐藏
    openFace() {
      this.SET_FACEIMG({
        faceImgShow: !this.faceImgShow
      })
    },
    // 打开常用语
    openPhrases() {
      this.commonPhrasesShow = true
    },
    // 关闭常用语
    closePhrases() {
      this.commonPhrasesShow = false
    },
    // 使用常用语
    usePhrases(data) {
      this.message += data.content
      this.commonPhrasesShow = false
    },
    // 结束会话
    sessionEnd() {
      let _data = {
        sesid: this.sessionInfo.sesid,
        userid: this.sUserInfo.userid
      }
      let data = JSON.stringify({ cmdid: 1203, data: _data })
      // console.log('去结束会话', data)
      this.$ws.send(data)
    },
    // 监听会话结束
    listenSessionEnd() {
      this.$wsBus.$on('1202', res => {
        if (res.returncode === '0') {
          let sessionInfo = this.sessionList.find((e) => {
            return e.sesid == res.data.sesid
          })
          let index = this.sessionList.findIndex((e) => {
            return e.sesid == res.data.sesid
          })
          this.SET_EDITSESSION({
            index: index,
            session: sessionInfo
          })
        }
      })
    },
    // 监听会话/同伴消息发送——回执
    listenMsgSend() {
      this.$wsBus.$on('2002', res => {
        if (res.returncode === '0') {
          if (res.data.msgtype == SESSION_MSG) {
            // console.log('发送会话消息回执', res)
            // 消息状态改变——发送成功
            this.sessionInfo.messageList.find(e => {
              return e.msgid == res.data.msgkey
            }).sendStatus = MSG_SUC
            let sessionIndex = this.sessionList.findIndex((e, i, arr) => {
              return this.sessionInfo.sesid == e.sesid
            })
            // 更新该会话信息
            this.SET_EDITSESSION({
              index: sessionIndex,
              session: this.sessionInfo
            })
          }
          if (res.data.msgtype == FRIEND_MSG) {
            // console.log('发送同伴消息回执', res, this.friendInfo.messageList)
            // console.log(this.friendInfo.messageList.find(e => {
            //   return e.msgid == res.data.msgkey
            // }))
            // 消息状态改变——发送成功
            this.friendInfo.messageList.find(e => {
              return e.msgid == res.data.msgkey
            }).sendStatus = MSG_SUC
            let friendIndex = this.friendList.findIndex((e, i, arr) => {
              return this.friendInfo.userid == e.userid
            })
            // 更新该同伴信息
            this.SET_EDITFRIEND({
              index: friendIndex,
              friend: this.friendInfo
            })
          }
          // 消息清空
          this.$refs.editdiv.clearText()
          // 消息发送状态管理堆——清除该消息
          let index = this.sendMsgList.findIndex(e => {
            return e.msgid == res.data.msgid
          })
          this.SET_DELETESENDMSG({
            index: index
          })
          // 滚动到底部
          setTimeout(() => {
            this.$emit('scrollToBottom')
          }, 20)
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
    },
    // 发送消息
    send(message) {
      // console.log(this.chatType, this.friendInfo)
      // 发送会话/同伴消息
      if (
        this.chatType == SESSION_CHATTYPE ||
        this.chatType == FRIEND_CHATTYPE
      ) {
        let data = JSON.stringify({ cmdid: 2001, data: message })
        // console.log('我发送的会话/同伴消息', data)
        this.$ws.send(data)
      }
      // 发送群聊消息
      if (this.chatType == GROUP_CHATTYPE) {
        GROUPAPI.gGoMsg(message)
          .then(res => {
            if (res.data.code === '0000') {
              let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              // console.log('群聊消息发送成功', resData)
              // 消息初始化
              this.$refs.editdiv.clearText()
              this.atList = []
              // 我在该群发送的消息+1——用来处理未读消息
              if (!this.groupInfo.unReadInfo.myMsgNum) {
                this.groupInfo.unReadInfo.myMsgNum = 1
              } else {
                this.groupInfo.unReadInfo.myMsgNum += 1
              }
              // 消息状态改变——发送成功
              this.groupInfo.messageList.find(e => {
                return e.msgid == message.msgkey
              }).sendStatus = MSG_SUC
              let groupIndex = this.groupList.findIndex((e, i, arr) => {
                return this.groupInfo.teamid == e.teamid
              })
              // 更新该群信息
              this.SET_EDITGROUP({
                index: groupIndex,
                group: this.groupInfo
              })
              // 消息发送状态管理堆——清除该消息
              let index = this.sendMsgList.findIndex(e => {
                return e.msgid == message.msgkey
              })
              this.SET_DELETESENDMSG({
                index: index
              })
              // 滚动到底部
              setTimeout(() => {
                this.$emit('scrollToBottom')
              }, 20)
            } else {
              // 消息状态改变——发送失败
              this.groupInfo.messageList.find(e => {
                return e.msgid == message.msgkey
              }).sendStatus = MSG_FAI
              // // 文件上传失败
              // this.$refs.layer.show(res.data.message)
            }
          })
          .catch(e => {
            // 消息状态改变——发送失败
            this.groupInfo.messageList.find(e => {
              return e.msgid == message.msgkey
            }).sendStatus = MSG_FAI
            // this.$refs.layer.show(e)
          })
      }
      // 发送私聊消息
      if (this.chatType == PRIVATE_CHATTYPE) {
        GROUPAPI.gGoPrivateMsg(message)
          .then(res => {
            if (res.data.code === '0000') {
              let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              // console.log('私聊消息发送成功', resData)
              // 消息初始化
              this.$refs.editdiv.clearText()
              // 我在该私聊发送的消息+1——用来处理未读消息
              if (!this.privateInfo.unReadInfo.myMsgNum) {
                this.privateInfo.unReadInfo.myMsgNum = 1
              } else {
                this.privateInfo.unReadInfo.myMsgNum += 1
              }
              // 消息状态改变——发送成功
              this.privateInfo.messageList.find(e => {
                return e.msgid == message.msgkey
              }).sendStatus = MSG_SUC
              let privateIndex = this.privateList.findIndex((e, i, arr) => {
                return this.privateInfo.id == e.id
              })
              // 更新该私聊信息
              this.SET_EDITPRIVATE({
                index: privateIndex,
                private: this.privateInfo
              })
              // 消息发送状态管理堆——清除该消息
              let index = this.sendMsgList.findIndex(e => {
                return e.msgid == message.msgkey
              })
              this.SET_DELETESENDMSG({
                index: index
              })
              // 滚动到底部
              setTimeout(() => {
                this.$emit('scrollToBottom')
              }, 20)
            } else {
              // 消息状态改变——发送失败
              this.privateInfo.messageList.find(e => {
                return e.msgid == message.msgkey
              }).sendStatus = MSG_FAI
              // 文件上传失败
              // this.$refs.layer.show(res.data.message)
            }
          })
          .catch(e => {
            // 消息状态改变——发送失败
            this.privateInfo.messageList.find(e => {
              return e.msgid == message.msgkey
            }).sendStatus = MSG_FAI
            // this.$refs.layer.show(e)
          })
      }
    },
    // 准备消息发送
    sendFirst(mediatype, msgbody) {
      // 未选中聊天对象
      if (
        (this.chatType == SESSION_CHATTYPE && !this.sessionInfo) ||
        (this.chatType == GROUP_CHATTYPE && !this.groupInfo) ||
        (this.chatType == PRIVATE_CHATTYPE && !this.privateInfo) ||
        (this.chatType == FRIEND_CHATTYPE && !this.friendInfo)
      ) {
        this.$refs.layer.show('请选择聊天对象!')
        return false
      }
      // 会话已结束，不能聊天
      if (
        this.chatType == SESSION_CHATTYPE &&
        this.sessionInfo &&
        this.sessionInfo.status == '1'
      ) {
        this.$refs.layer.show('当前会话已结束！')
        return false
      }
      // 查看是否有消息存在
      if (!msgbody) {
        if (!this.message) {
          this.$refs.layer.show('请输入消息内容!')
          return false
        } else {
          msgbody = this.message
        }
      }
      // 消息类型默认是 文本/表情
      if (!mediatype) {
        mediatype = '1'
      }
      // 若是文本/表情类型——把表情img转化成文字
      if (mediatype == '1') {
        let div = document.createElement('div')
        div.innerHTML = msgbody
        Array.from(div.children).forEach(img => {
          if (img.name) {
            let name = faceImgMap[img.name - 1]
            // console.log('表情名字', name)
            div.replaceChild(document.createTextNode(`${name}`), img)
          } else {
            div.replaceChild(document.createTextNode(''), img)
          }
        })
        msgbody = div.innerHTML.replace(/\s/g, '')
        // console.log('处理完表情', msgbody)
      }
      // 发送会话消息
      if (this.chatType === SESSION_CHATTYPE) {
        // 要发送的会话消息
        let message = {
          fromid: this.sUserInfo.userid,
          toid: this.sessionInfo.guestsid,
          sesid: this.sessionInfo.sesid,
          msgtype: SESSION_MSG,
          mediatype: mediatype,
          msgkey: uuid(32, 16), // 32位随机数
          msgbody: msgbody,
          lastMsgid: '', // 重发消息时，带上上一条消息的msgid(不传/msgid)
          resend: '' // 是否重发消息(不传/String(true))
        }
        // 要展示的会话消息
        let goMyMsg = {
          sendStatus: MSG_ING,
          msgid: message.msgkey,
          fromid: this.sUserInfo.userid,
          messageType: SESSION_MSG, // 消息类型(2群聊/3私聊/5会话)
          name: this.sUserInfo.nickname, // 发送者用户名
          headurl: this.sUserInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          recall: '0', // 是否撤回(0正常/1已撤回)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss'), // 发送消息的时间
          lastMsgid: '', // 重发消息时，带上上一条消息的msgid(不传/msgid)
          resend: '' // 是否重发消息(不传/String(true))
          // id: message.toid, // 群id
        }
        // 更新会话
        this.sessionInfo.messageList.push(goMyMsg)
        let sessionIndex = this.sessionList.findIndex((e, i, arr) => {
          return this.sessionInfo.sesid == e.sesid
        })
        this.SET_EDITSESSION({
          index: sessionIndex,
          session: this.sessionInfo
        })
        // 消息发送状态管理堆
        this.SET_ADDSENDMSG({
          msgid: message.msgkey,
          sendMsg: message,
          showMsg: goMyMsg
        })
        this.send(message)
      }
      // 发送同伴消息
      if (this.chatType === FRIEND_CHATTYPE) {
        // 要去发送的消息
        let message = {
          fromid: this.sUserInfo.userid,
          toid: this.friendInfo.userid,
          msgtype: FRIEND_MSG,
          mediatype: mediatype,
          msgkey: uuid(32, 16), // 32位随机数
          msgbody: msgbody
        }
        // 要去展示的消息
        let goMyMsg = {
          sendStatus: MSG_ING,
          msgid: message.msgkey,
          fromid: this.sUserInfo.userid,
          messageType: FRIEND_MSG, // 消息类型(1同伴2群聊/3私聊/5会话)
          name: this.sUserInfo.nickname, // 发送者用户名
          headurl: this.sUserInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss') // 发送消息的时间
        }
        // 更新同伴信息
        this.friendInfo.messageList.push(goMyMsg)
        let friendIndex = this.friendList.findIndex((e, i, arr) => {
          return this.friendInfo.userid == e.userid
        })
        this.SET_EDITFRIEND({
          index: friendIndex,
          friend: this.friendInfo
        })
        // 消息发送状态管理堆
        this.SET_ADDSENDMSG({
          msgid: message.msgkey,
          sendMsg: message,
          showMsg: goMyMsg
        })
        this.send(message)
      }
      // 发送群消息
      if (this.chatType === GROUP_CHATTYPE) {
        // @at列表处理
        if (this.atList.length > 0) {
          this.atList.forEach((e, i, arr) => {
            if (msgbody.indexOf(`@${e.nickname}`) < 0) {
              // console.log('没找到@', e.nickname)
              this.atList.splice(i, 1)
            } else {
              // console.log('@全都找到')
            }
          })
        }
        // 要去发送的消息
        let message = {
          atMsg: this.atList && this.atList.length > 0 ? '1' : '0',
          fromid: this.gUserInfo.userId, // 发送者id
          toid: this.groupInfo.teamid, // 群id
          msgtype: String(GROUP_MSG), // 消息类型(2群聊/3私聊/5会话)
          mediatype: mediatype, // 消息内容类型(1文本表情/3图片url/5推文)
          sendtime: Date.now(), // 发送消息时间(getTime)
          msgbody: msgbody, // 消息内容
          atlist: this.atList, // at列表
          msgkey: uuid(32, 16) // 32位随机数
        }
        // 要去展示的消息
        let goMyMsg = {
          sendStatus: MSG_ING, // 消息发送状态
          msgid: message.msgkey,
          atMsg: message.atMsg,
          id: message.toid, // 群id
          fromid: this.gUserInfo.userId,
          messageType: message.msgtype, // 消息类型(2群聊/3私聊/5会话)
          name: this.gUserInfo.nickname, // 发送者用户名
          headurl: this.gUserInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          recall: '0', // 是否撤回(0正常/1已撤回)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss') // 发送消息的时间
        }
        // 更新群信息
        this.groupInfo.messageList.push(copy2(goMyMsg))
        let groupIndex = this.groupList.findIndex((e, i, arr) => {
          return this.groupInfo.teamid == e.teamid
        })
        this.SET_EDITGROUP({
          index: groupIndex,
          group: this.groupInfo
        })
        // 消息发送状态管理堆
        this.SET_ADDSENDMSG({
          msgid: message.msgkey,
          sendMsg: message,
          showMsg: goMyMsg
        })
        this.send(message)
      }
      // 发送私聊消息
      if (this.chatType === PRIVATE_CHATTYPE) {
        // 要发送的消息
        let message = {
          fromid: this.gUserInfo.userId, // 发送者id
          toid: this.privateInfo.id, // 接收者id
          msgtype: String(PRIVATE_MSG), // 消息类型(2群聊/3私聊)
          mediatype: mediatype, // 消息内容类型(1文本表情/3图片url/5推文)
          sendtime: Date.now(), // 发送消息时间(getTime)
          msgbody: msgbody, // 消息内容
          msgkey: uuid(32, 16) // 32位随机数
        }
        // 要展示的消息
        let goMyMsg = {
          sendStatus: MSG_ING, // 消息发送状态
          msgid: message.msgkey,
          fromid: this.gUserInfo.userId,
          messageType: message.msgtype, // 消息类型(2群聊/3私聊)
          nickname: this.gUserInfo.nickname, // 发送者用户名
          headurl: this.gUserInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          recall: '0', // 是否撤回(0正常/1已撤回)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss') // 发送消息的时间
          // id: message.toid, // 群id
        }
        // 更新私聊信息
        this.privateInfo.messageList.push(goMyMsg)
        let privateIndex = this.privateList.findIndex((e, i, arr) => {
          return this.privateInfo.id == e.id
        })
        this.SET_EDITPRIVATE({
          index: privateIndex,
          private: this.privateInfo
        })
        // 消息发送状态管理堆
        this.SET_ADDSENDMSG({
          msgid: message.msgkey,
          sendMsg: message,
          showMsg: goMyMsg
        })
        this.send(message)
      }
    },
    handleFileChange() {},
    captureScreen() {
      this.$electron.ipcRenderer.send('openCaptureScreen')
      // console.log(9999)
    },
    // 会话——聊天摘要/聊天记录 打开
    // sessionInfoOpen() {
    //   this.SET_SESSIONINFO({
    //     sessionInfoShow: !this.sessionInfoShow
    //   })
    // },
    // 监听截图成功后去上传
    listenCaptureImg() {
      this.$electron.ipcRenderer.on('captureImg', (e, imgSrc, scale) => {
        imgUploader(imgSrc)
          .then(res => {
            if (res.data.returncode === '0') {
              // 文件上传成功
              this.uploadSuccess(res.data.data)
            } else {
              // 文件上传失败
              this.$refs.layer.show(res.data.returnmsg)
            }
          })
          .catch(e => {
            this.$refs.layer.show(e)
          })
        // if (scale) {
        //   var width = 50 * scale
        // } else {
        //   width = 50
        // }
        // // width最大500px
        // if (width > 100) {
        //   width = 100
        // }
        // console.log(imgSrc)
        // let faceImgHtml = `<img class='capture' src='${imgSrc}' width='${width}px' height='50px' style="background-size: contain;margin: 0 4px"></img>`
        // div(contenteditable=true)时光标移到最后(因为focus默认光标在最前面)
        // this.keepLastIndex(this.$refs.input)
        // 指定dom获得焦点时，光标处插入html
        // this.insertAtCursor(this.$refs.input, faceImgHtml)
      })
    },
    // 图片上传成功——发消息
    uploadSuccess(res) {
      // console.log('图片上传成功', res)
      // 发消息
      this.sendFirst('3', res)
    },
    // 图片上传失败——提示
    uploadError(msg) {
      this.$refs.layer.show(msg)
    },
    // @ta
    atTa(data) {
      // console.log('@ta', data)
      // 消息加入
      this.message += `@${data.nickname}`
      // at列表加入
      this.atList.push({ userid: data.memberid, nickname: data.nickname })
    },
    ...mapMutations({
      SET_FACEIMG: 'SET_FACEIMG', // 表情是否显示
      SET_SESSIONINFO: 'SET_SESSIONINFO', // 会话相关信息显示
      SET_SESMSGLIST: 'SET_SESMSGLIST', // 当前会话消息设置
      SET_SESSIONLIST: 'SET_SESSIONLIST', // 更新会话列表
      SET_EDITSESSION: 'SET_EDITSESSION', // 修改指定会话
      SET_FRIENDLIST: 'SET_FRIENDLIST', // 更新同伴列表
      SET_EDITFRIEND: 'SET_EDITFRIEND', // 修改指定同伴
      SET_EDITGROUP: 'SET_EDITGROUP',
      SET_EDITPRIVATE: 'SET_EDITPRIVATE',
      SET_ADDSENDMSG: 'SET_ADDSENDMSG',
      SET_DELETESENDMSG: 'SET_DELETESENDMSG'
    })
  },
  components: {
    editDiv
  }
}
</script>
<style lang='scss' scoped>
.wrap {
  width: 100%;
  // position: absolute;
  // bottom: 82px;
  // left: 0;
  height: 143px;
  border-top: 1px solid $border;
}
.toolsbar {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: $blank;
  position: relative;
  .chat-tools {
    width: 100%;
    position: relative;
    .session-record {
      position: absolute;
      right: 0px;
      top: 0px;
      color: $content;
      font-size: 12px;
      line-height: 32px;
      text-align: right;
      margin-right: 10px;
      cursor: default;
      &:hover {
        color: $red;
      }
    }
  }
  .face {
    input {
      position: absolute;
      left: -9999px;
    }
  }
}
.message-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: $blank;
  width: 100%;
  height: 102px;
  border: none;
  padding: 6px 10px;
  .message {
    height: 65px;
    width: 100%;
    border: none;
    resize: none;
    color: $content;
  }
  .operate {
    display: block;
    width: 100%;
    position: relative;
    .send {
      position: absolute;
      right: 10px;
      top: 0;
      width: 120px;
      height: 25px;
      background-color: $listHover;
      border: 1px solid $border;
      font-size: 14px;
      text-align: center;
      line-height: 25px;
      color: $content;
      cursor: default;
    }
    .session-end {
      width: 64px;
      height: 24px;
      border-bottom: 1px solid #e5e5e5;
      cursor: default;
      color: $content;
    }
    .common-phrases {
      .enter {
        position: absolute;
        right: 150px;
        top: 0;
        width: 48px;
        height: 24px;
        border-bottom: 1px solid #e5e5e5;
        cursor: default;
        color: $content;
      }
      ul {
        z-index: 1;
        position: absolute;
        top: -350px;
        left: 100px;
        background-color: #fff;
        width: 500px;
        height: auto;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        li {
          padding: 6px 10px;
          line-height: 20px;
          cursor: default;
          &:hover {
            background-color: $listLightHover;
          }
        }
      }
    }
  }
}
.faceimg-box {
  padding: 4px;
  width: 250px;
  height: 175px;
  background-color: $blank;
  position: absolute;
  border: 1px solid $border;
  top: -175px;
  left: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  img {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}
</style>