<template>
  <div class="group-info">
    <div class="tabs">
      <div class="active text">私聊记录</div>
    </div>
    <div class="record-container">
      <div class="page">
        <div :class="[isPreOk ? '': 'disable', 'pre', 'btn']" @click="pre">上一页</div>
        <div class="text">页: {{privateMsgParams.page}}/{{privateMsgParams.pages}}</div>
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
              <div class="content" v-html="showMsgDataHandler(item)"></div>
            </li>
          </template>
          <div v-else class="noData">暂无历史消息</div>
        </ul>
      </div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { remote } from 'electron'
import { copy2, isJson } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'
import { mapGetters, mapMutations } from 'vuex'
import { msgDataHandler } from 'common/js/business'
// const MEMBER = 1;

const Menu = remote.Menu
const MenuItem = remote.MenuItem

export default {
  created() {
    // 翻页状态更新
    this.goPageStatus(this.privateMsgParams.page, this.privateMsgParams.pages)
  },
  computed: {
    // 用户信息
    ...mapGetters(['gUserInfo', 'privateList'])
  },
  data() {
    return {
      // 请求群内单聊记录——参数
      privateMsgParams: {
        toid: '', // 接收者id
        fromid: '', // 发送者id
        // teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        page: 1, // 当前页
        pages: 1 // 总页数
      },
      // 历史消息列表
      privateMsgHistory: null,
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
    privateMsgHistory: 'msgHandler',
    privateList: {
      handler(newV) {
        if (this.privateList) {
          this.privateInfo =
            copy2(
              this.privateList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          // console.log('监听到私聊列表变化，当前私聊历史消息变更')
        } else {
          this.privateInfo = null
        }
        // // 消息处理
        // this.msgHandler()
      },
      deep: true
    }
  },
  methods: {
    // 私聊历史消息记录
    /**
     * privateInfo: 当前私聊
     * page: 页数
     */
    async getPrivateMsg(privateInfo, page) {
      this.privateMsgParams.toid = this.gUserInfo.userId
      if (privateInfo) {
        this.privateMsgParams.fromid = privateInfo.id
      }
      if (page) {
        this.privateMsgParams.page = page
      }
      await GROUPAPI.gPrivateMsg(this.privateMsgParams).then(res => {
        if (res.data.code === '0000') {
          let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
          // console.log('私聊历史记录', resData)
          this.privateMsgParams.pages = resData.pages
          this.privateMsgParams.page = resData.pageNum
          // 翻页状态更新
          this.goPageStatus(resData.pageNum, resData.pages)
          // 分页数据更新
          this.privateMsgHistory = resData.messages
          // 放开请求
          this.isReqOk = true
        } else {
          // 放开请求
          this.isReqOk = true
          this.$refs.layer.show(res.data.message)
        }
      })
      .catch(res => {
        // 放开请求
        this.isReqOk = true
        this.$refs.layer.show(res)
      })
    },
    // 上一页
    pre() {
      if (!this.isReqOk || !this.isPreOk) {
        return false
      }
      this.isReqOk = false
      let page = Number(this.privateMsgParams.page) - 1
      this.getPrivateMsg(this.privateInfo, page)
    },
    // 下一页
    next() {
      if (!this.isReqOk || !this.isNextOk) {
        return false
      }
      this.isReqOk = false
      let page = Number(this.privateMsgParams.page) + 1
      this.getPrivateMsg(this.privateInfo, page)
    },
    // 翻页状态判断
    goPageStatus(curPage, totalPage) {
      // 下一页状态判断
      if (!totalPage || curPage >= totalPage) {
        // 下一页锁定
        this.isNextOk = false
      } else {
        // 下一页放开
        this.isNextOk = true
      }
      // 上一页状态判断
      if (curPage == 1) {
        // 上一页锁定
        this.isPreOk = false
      } else {
        // 上一页放开
        this.isPreOk = true
      }
    },
    // 消息处理
    msgHandler() {
      if (!this.privateMsgHistory || this.privateMsgHistory.length == 0) {
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
    },
    // 消息内容处理
    showMsgDataHandler(data) {
      let result = msgDataHandler(data)
      return result
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