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
        <img src="./img/editor-tools-material.png" @click.stop="openFace" />
        <div v-show="chatType === 1" class="session-record" @click="sessionInfoOpen">聊天记录&摘要</div>
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
        <div v-show="chatType === 1" class="session-end" @click="sessionEnd">结束会话</div>
        <div class="common-phrases">
          <div v-show="chatType === 1" class="enter" @click="openPhrases">常用语</div>
          <ul v-show="commonPhrasesShow && chatType === 1" @mouseleave="closePhrases">
            <li v-for="(item, index) in phrasesList" @click="usePhrases(item)">{{item.content}}</li>
          </ul>
        </div>
        <div class="send" @click="send()">发送(Ctrl+Enter)</div>
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
const SESSION = 1
const GROUP = 2
const PRIVATE = 3

export default {
  props: {
    // 当前群聊信息
    groupInfo: {
      type: Object,
      default: null
    },
    // 当前群聊消息
    groupMsgList: {
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
    },
    // 群列表我发送的消息数量
    groupMyMsgNum: {
      type: Object,
      default: null
    },
    // 私聊列表我发送的消息数量
    privateMyMsgNum: {
      type: Object,
      default: null
    }
  },
  created() {
    // 监听截图成功后返回图片信息
    this.listenCaptureImg()
  },
  data() {
    return {
      //   表情是否显示
      //   faceImgShow: true,
      // 消息内容
      message: '',
      // 群聊——@列表
      atList: [],
      // 常用语是否显示
      commonPhrasesShow: false,
      // 常用语列表
      phrasesList: [
        {
          id: 1,
          content: '您好，请问有什么可以帮您？'
        },
        {
          id: 2,
          content: '马上帮您查询看看，请稍等一下'
        },
        {
          id: 3,
          content: '您别着急，这里立刻帮您核实一下情况。请您耐心等待一下。'
        },
        {
          id: 4,
          content:
            '请您不要着急，我非常理解您的心情，我们一定会竭尽全力为您解决的。'
        },
        {
          id: 5,
          content: '非常感谢您这么好的建议，我们会不断改进服务，让您满意。'
        },
        {
          id: 6,
          content: '您客气了，我们该做的，请问还有其他问题可以帮到您的吗？'
        },
        {
          id: 7,
          content: '为了更好地为您服务，请对我的服务做出评价。谢谢！'
        },
        {
          id: 8,
          content: '您好，今天天气不错呀！出去爬山吗？'
        }
      ]
    }
  },
  computed: {
    // 用户信息 表情是否显示  会话相关信息显示  会话聊天内容  群聊聊天内容  私聊聊天内容
    ...mapGetters([
      'userInfo',
      'faceImgShow',
      'sessionInfoShow',
      'chatType',
      'sessionMsgList'
      // 'groupMsgList',
      // 'privateMsgList'
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
      console.log('结束会话')
    },
    // 发送消息
    send(mediatype, msgbody) {
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
      if (mediatype === '1') {
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
      // console.log('发送消息——chatType', this.chatType)
      if (this.chatType === SESSION) {
        //   // 会话
        //   let message = {
        //     id: 100,
        //     time: '2019-07-09 12:00:00',
        //     fromid: '1',
        //     fromName: '小王',
        //     content: this.message,
        //     isRecall: false,
        //     isDelete: false
        //   }
        //   let newMessage = copy(this.sessionMsgList)
        //   newMessage.push(message)
        //   this.SET_SESSIONMSG({
        //     sessionMsgList: newMessage
        //   })
        //   this.message = ''
      } else if (this.chatType === GROUP) {
        // @at列表处理
        if (this.atList.length > 0) {
          this.atList.forEach((e, i, arr) => {
            if (msgbody.indexOf(`@${e.nickname}`) < 0) {
              console.log('没找到@', e.nickname)
              this.atList.splice(i, 1)
            } else {
              console.log('@全都找到')
            }
          })
        }
        // console.log('进入发送了', msgbody)
        // 消息内容
        let message = {
          fromid: this.userInfo.userId, // 发送者id
          toid: this.groupInfo.teamid, // 群id
          msgtype: '2', // 消息类型(2群聊/3私聊)
          mediatype: mediatype, // 消息内容类型(1文本表情/3图片url/5推文)
          sendtime: Date.now(), // 发送消息时间(getTime)
          msgbody: msgbody, // 消息内容
          atlist: this.atList, // at列表
          msgkey: uuid(32, 16) // 32位随机数
        }
        // console.log('去发送了')
        // 去展示消息
        let goMyMsg = {
          id: message.toid, // 群id
          fromid: this.userInfo.userId,
          messageType: message.msgtype, // 消息类型(2群聊/3私聊)
          name: this.userInfo.nickname, // 发送者用户名
          headurl: this.userInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          recall: '0', // 是否撤回(0正常/1已撤回)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss') // 发送消息的时间
        }
        // let resData = JSON.parse(this.$crypto.decrypt(res.data.body)
        // console.log(resData)
        // this.groupTeamList = JSON.parse(resData)
        // console.log(res)
        // let newMessage = copy(this.groupMsgList)
        // this.SET_GROUPMSG({
        //   groupMsgList: newMessage
        // })
        this.groupMsgList.push(goMyMsg)
        console.log('去发送的消息内容', message)
        // 去发送消息
        GROUPAPI.gGoMsg(message)
          .then(res => {
            if (res.data.code === '0000') {
              console.log(
                '群聊消息发送成功',
                JSON.parse(this.$crypto.decrypt(res.data.body))
              )
              // 消息初始化
              this.$refs.editdiv.clearText()
              this.atList = []
              // 我在该群发送的消息+1——用来处理未读消息
              this.groupMyMsgNum[this.groupInfo.teamid].my += 1
            } else {
              // 文件上传失败
              this.$refs.layer.show(res.data.message)
            }
          })
          .catch(e => {
            this.$refs.layer.show(e)
          })
        // this.message = ''
      } else if (this.chatType === PRIVATE) {
        console.log('私聊', this.privateInfo)
        // console.log('进入发送了', msgbody)
        // 消息内容
        let message = {
          fromid: this.userInfo.userId, // 发送者id
          toid: this.privateInfo.id, // 接收者id
          msgtype: '3', // 消息类型(2群聊/3私聊)
          mediatype: mediatype, // 消息内容类型(1文本表情/3图片url/5推文)
          sendtime: Date.now(), // 发送消息时间(getTime)
          msgbody: msgbody, // 消息内容
          msgkey: uuid(32, 16) // 32位随机数
        }
        // console.log('去发送了')
        // 去展示消息
        let goMyMsg = {
          // id: message.toid, // 群id
          fromid: this.userInfo.userId,
          messageType: message.msgtype, // 消息类型(2群聊/3私聊)
          nickname: this.userInfo.nickname, // 发送者用户名
          headurl: this.userInfo.headurl, // 发送者头像
          msgbody: message.msgbody, // 消息内容
          mediatype: Number(message.mediatype), // 消息内容类型(1文本表情/3图片url/5推文)
          recall: '0', // 是否撤回(0正常/1已撤回)
          sendTime: formatDate(message.sendtime, 'yyyy-MM-dd hh:mm:ss') // 发送消息的时间
        }
        // let resData = JSON.parse(this.$crypto.decrypt(res.data.body)
        // console.log(resData)
        // this.groupTeamList = JSON.parse(resData)
        // console.log(res)
        // let newMessage = copy(this.groupMsgList)
        console.log(message, goMyMsg)
        this.privateMsgList.push(goMyMsg)
        // this.SET_GROUPMSG({
        //   groupMsgList: newMessage
        // })
        // 去发送消息
        GROUPAPI.gGoPrivateMsg(message)
          .then(res => {
            console.log(res)
            if (res.data.code === '0000') {
              let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              console.log(
                '私聊消息发送成功',
                JSON.parse(this.$crypto.decrypt(res.data.body))
              )
              // 消息初始化
              this.$refs.editdiv.clearText()
              // 我在该私聊发送的消息+1——用来处理未读消息
              // console.log(this.privateMyMsgNum, this.privateInfo.id)
              this.privateMyMsgNum[this.privateInfo.id].my += 1
            } else {
              // 文件上传失败
              this.$refs.layer.show(res.data.message)
            }
          })
          .catch(e => {
            this.$refs.layer.show(e)
          })
      }
    },
    handleFileChange() {},
    captureScreen() {
      this.$electron.ipcRenderer.send('openCaptureScreen')
      // console.log(9999)
    },
    // 会话——聊天摘要/聊天记录 打开
    sessionInfoOpen() {
      this.SET_SESSIONINFO({
        sessionInfoShow: !this.sessionInfoShow
      })
    },
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
      this.send('3', res)
    },
    // 图片上传失败——提示
    uploadError(msg) {
      this.$refs.layer.show(msg)
    },
    // @ta
    atTa(data) {
      console.log('@ta', data)
      // 消息加入
      this.message += `@${data.nickname}`
      // at列表加入
      this.atList.push({ userid: data.memberid, nickname: data.nickname })
    },
    ...mapMutations({
      SET_FACEIMG: 'SET_FACEIMG', // 表情是否显示
      SET_SESSIONINFO: 'SET_SESSIONINFO', // 会话相关信息显示
      SET_SESSIONMSG: 'SET_SESSIONMSG', // 会话消息列表
      SET_GROUPMSG: 'SET_GROUPMSG', // 群聊消息列表
      SET_PRIVATEMSG: 'SET_PRIVATEMSG' // 私聊消息列表
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
  position: absolute;
  bottom: 82px;
  left: 0;
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