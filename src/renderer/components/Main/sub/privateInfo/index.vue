<template>
  <div class="group-info">
    <div class="tabs">
      <div class="active text">私聊记录</div>
    </div>
    <div class="record-container">
      <div class="page">
        <div :class="[isPreOk ? '': 'disable', 'pre', 'btn']" @click="pre">上一页</div>
        <div class="text">页: {{privateHistoryParams.page}}/{{privateHistoryParams.pages}}</div>
        <div :class="[isNextOk ? '' : 'disable', 'next', 'btn']" @click="next">下一页</div>
      </div>
      <div class="record-wrap">
        <ul class="record">
          <template v-if="!privateMsgHistory">
            <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
          </template>
          <template v-else-if="privateMsgHistory && privateMsgHistory.length > 0">
            <li v-for="(item, index) in privateMsgHistory" :key="item.msgid">
              <div class="name">{{item.nickname}}</div>
              <div class="time">{{item.sendTime}}</div>
              <!-- 图片/表情/文字 -->
              <div class="content" v-html="msgDataHandler(item)"></div>
            </li>
          </template>
          <div v-else class="noData">暂无历史消息</div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import { copy, faceImgMap, isJson } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'
// const MEMBER = 1;

const Menu = remote.Menu
const MenuItem = remote.MenuItem

export default {
  props: {
    privateMsgHistory: {
      type: Array,
      default: null
    },
    privateHistoryParams: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 防止多次连续点击下一页/上一页
      isReqOk: true,
      // 下一页是否可点击
      isNextOk: true,
      // 上一页是否可点击
      isPreOk: true,
      // 默认/loading图片
      defaultImg: 'this.src="' + require('../../img/logo.png') + '"',
      // 聊天记录当前页数
      // recordPage: 1,
      query: {
        scope: '',
        text: ''
      }
    }
  },
  watch: {
    privateMsgHistory: 'msgHandler'
  },
  methods: {
    // 上一页
    pre() {
      if (!this.isReqOk) {
        return false
      }
      this.isReqOk = false
      let page = Number(this.privateHistoryParams.page) - 1
      this.$emit('getPrivateMsgHistory', null, page, 'page')
    },
    // 下一页
    next() {
      if (!this.isReqOk) {
        return false
      }
      this.isNext = false
      let page = Number(this.privateHistoryParams.page) + 1
      console.log('我来请求下一页了')
      this.$emit('getPrivateMsgHistory', null, page, 'page')
    },
    // 放开请求
    reqOpen() {
      this.isReqOk = true
    },
    // 锁定请求
    reqClose() {
      this.isReqOk = false
    },
    // 下一页放开
    nextOpen() {
      this.isNextOk = true
    },
    // 下一页锁定
    nextClose() {
      this.isNextOk = false
    },
    // 上一页放开
    preOpen() {
      this.isPreOk = true
    },
    // 上一页锁定
    preClose() {
      this.isPreOk = false
    },
    // 消息处理
    msgHandler() {
      if (!this.privateMsgHistory || this.privateMsgHistory.length === 0) {
        return false
      }
      this.privateMsgHistory.forEach((e, i, arr) => {
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
      console.log('现在是私聊', this.msgData)
    },
    // 消息数据处理
    msgDataHandler(data) {
      console.log('历史消息数据处理', data)
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
      //   console.log('这里是处理好的消息：', newMsg.content)
      return newMsg.content
    }
  }
}
</script>
<style lang='scss' scoped>
.noData {
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: rgb(83, 83, 83);
}
.group-info {
  height: 100%;
  width: 250px;
  .tabs {
    height: 57px;
    line-height: 57px;
    display: flex;
    border-bottom: 1px solid $border;
    cursor: default;
    .active {
      background-color: $blank !important;
    }
    .text {
      flex: 1;
      text-align: center;
      font-size: 14px;
      background-color: $listHover;
    }
  }

  .member-container {
    height: 100%;
    overflow: auto;
    padding-bottom: 150px;
    background-color: #fff;
    .members {
      // height: 512px;
      // overflow: auto;
      li {
        display: flex;
        align-items: center;
        padding: 4px 10px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid $border;
        background-color: #fff;
        cursor: pointer;
        img {
          width: 25px;
          height: 25px;
          border-radius: 50%;
        }
        .tips {
          padding: 2px 4px;
          border-radius: 4px;
          background-color: $red;
          color: $blank;
          border-radius: 4px;
          color: #fff;
          height: 20px;
          font-size: 12px;
          line-height: 16px;
          margin-left: 12px;
        }
        .nick {
          margin-left: 12px;
        }
      }
    }
  }
  .record-container {
    height: 100%;
    background-color: #fff;
    .page {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 10px;
      border-bottom: 1px solid #e5e5e5;
      .text {
        margin: 0 4px;
      }
      .btn {
        width: 50px;
        height: 25px;
        line-height: 25px;
        text-align: center;
        border: 1px solid $border;
        cursor: default;
      }
      .disable {
        border: 1px solid #e5e5e5;
        color: #e5e5e5;
      }
    }
    .record-wrap {
      height: 100%;
      padding-bottom: 150px;
      overflow: auto;
      .record {
        // height: 400px;
        // overflow: auto;
        padding-bottom: 150px;
        li {
          padding: 10px;
          font-size: 14px;
          border-bottom: 1px solid $border;
          .time,
          .name {
            display: inline-block;
            color: $content;
          }
          .name {
            color: #333;
            margin-right: 4px;
          }
        }
      }
    }
    .query {
      padding: 10px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      select {
        margin-bottom: 10px;
      }
      .text {
        width: 100px;
      }
      .btn {
        display: inline-block;
        width: 50px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 4px;
        background-color: $red;
        color: $blank;
        cursor: default;
      }
    }
  }
}
</style>