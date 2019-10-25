<template>
  <div class="group-info">
    <div class="tabs">
      <div
        :class="[status === 1 ? 'active' : ' ','text']"
        @click="changeTabs(1)"
      >群成员({{groupMembers && groupMembers.length || ''}})</div>
      <div :class="[status === 2 ? 'active' : ' ','text']" @click="changeTabs(2)">群聊记录</div>
    </div>
    <div class="member-container" v-show="status === 1">
      <ul class="members">
        <template v-if="!groupMembers">
          <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
        </template>
        <template v-else-if="groupMembers && groupMembers.length > 0">
          <li v-for="(item, index) in groupMembers" :key="item.id" @click.right="openMenu(item)">
            <img :src="item.headurl || defaultImg" />
            <div class="nick">{{item.nickname}}</div>
            <div v-if="item.admin === '1'" class="tips">管理员</div>
            <div v-if="item.usertype === '5'" class="tips">群主</div>
          </li>
        </template>
        <div v-else class="noData">暂无群成员</div>
      </ul>
    </div>
    <div class="record-container" v-show="status === 2">
      <div class="page">
        <div class="pre btn" @click="pre">上一页</div>
        <!-- <div class="text">页: 1/6 总记录数: 173</div> -->
        <div :class="[isNext ? '' : 'disable', 'next', 'btn']" @click="next">下一页</div>
      </div>
      <div class="record-wrap">
        <ul class="record">
          <template v-if="!groupMsgHistory">
            <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
          </template>
          <template v-else-if="groupMsgHistory && groupMsgHistory.length > 0">
            <li v-for="(item, index) in groupMsgHistory" :key="item.msgid">
              <div class="name">{{item.nickname}}</div>
              <div class="time">{{item.sendTime}}</div>
              <!-- 图片/表情/文字 -->
              <div class="content" v-html="msgDataHandler(item)"></div>
            </li>
          </template>
          <div v-else class="noData">暂无历史消息</div>
        </ul>
      </div>
      <!-- <div class="query">
        <div>
          范围:
          <select v-model="query.scope">
            <option v-for="(item, index) in scopeList" :value="item.val">{{item.name}}</option>
          </select>
        </div>
        <div>
          关键词:
          <input v-model="query.text" type="text" />
          <div class="btn" @click="queryRecrod">查询</div>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapGetters, mapMutations } from 'vuex'
import { copy, faceImgMap } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'
// import { gUserInfo } from 'os';
// const MEMBER = 1;

const Menu = remote.Menu
const MenuItem = remote.MenuItem

export default {
  props: {
    groupMembers: {
      type: Array,
      default: null
    },
    groupMsgHistory: {
      type: Array,
      default: null
    }
  },
  computed: {
    // 用户信息
    ...mapGetters(['gUserInfo'])
  },
  data() {
    return {
      // 禁眼
      noSpeakingParams: {
        teamId: '', // 群编号(number)
        memberid: '', // 需要被禁言的用户编号(string)
        userid: '', // 当前的用户编号(string)
        silence: '' // silence(string,0未禁言/1已禁言)
      },
      // 防止多次连续点击下一页
      isNext: true,
      // 右键群成员/历史消息
      clickRightData: '',
      // 默认/loading图片
      defaultImg: 'this.src="' + require('../../img/logo.png') + '"',
      // tab状态 member/record
      status: 1,
      // 聊天记录当前页数
      // recordPage: 1,
      query: {
        scope: '',
        text: ''
      },
      scopeList: [
        {
          val: '1',
          name: '今天'
        },
        {
          val: '2',
          name: '最近一周'
        },
        {
          val: '3',
          name: '最近一个月'
        },
        {
          val: '4',
          name: '所有'
        }
      ],
      // 右键菜单
      menuList: {
        // 群成员
        member: [
          {
            label: '私聊',
            click: () => {
              this.goPrivateChat(this.clickRightData)
            }
          },
          {
            label: '@ta',
            click: () => {
              this.atTa(this.clickRightData)
            }
          },
          {
            label: '禁言',
            click: () => {
              this.noSpeaking(this.clickRightData)
            }
          },
          {
            label: '查看资料',
            click: () => {
              this.viewProfile(this.clickRightData)
            }
          },
          {
            label: '移出该群',
            click: () => {
              this.removeGroup(this.clickRightData)
            }
          }
        ]
        // 群聊记录
        // other: [
        //   {
        //     label: '复制',
        //     click: () => {
        //       this.menuOperator('isDelete', this.clickRightMsg)
        //     }
        //   },
        //   {
        //     label: '导出',
        //     click: () => {
        //       this.menuOperator('isDelete', this.clickRightMsg)
        //     }
        //   }
        // ]
      }
    }
  },
  created() {
    // 初始化右键菜单栏
    this.initMenu()
  },
  watch: {
    groupMsgHistory: 'msgHandler'
  },
  methods: {
    // 初始化右键菜单
    initMenu() {
      this.menu_member = new Menu()
      this.menuList.member.forEach((e, i, arr) => {
        this.menu_member.append(new MenuItem(e))
      })
    },
    // 群成员右键打开菜单
    openMenu(data) {
      // 自己的话没弹窗
      if (data.memberid === this.gUserInfo.userId) {
        return false
      }
      this.clickRightData = data
      // if (type === MyMessage) {
      this.menu_member.popup(remote.getCurrentWindow())
      // } else {
      //   this.menu_other.popup(remote.getCurrentWindow())
      // }
    },
    // 群成员右键——私聊
    goPrivateChat(data) {
      // 私聊列表增加成员
      this.$emit('goPrivateChat', data)
      // 聊天窗口切换成私聊
      console.log('私聊' + JSON.stringify(data))
    },
    // 群成员右键——@ta
    atTa(data) {
      this.$emit('atTa', data)
      console.log('atTa' + JSON.stringify(data))
    },
    // 群成员右键——禁言
    noSpeaking(data) {
      GROUPAPI.gNoSpeak(this.noSpeakingParams)
        .then(res => {
          if (res.data.code === '0000') {
            console.log('禁言' + JSON.stringify(data))
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          // console.log(123123)
          this.$refs.layer.show(res)
        })
    },
    // 群成员右键——查看资料
    viewProfile(data) {
      console.log('查看资料' + JSON.stringify(data))
    },
    // 群成员右键——移出该群
    removeGroup(data) {
      console.log('移出该群' + JSON.stringify(data))
    },
    queryRecrod() {
      this.recordList = [
        {
          time: '2019-07-03 11:26:22',
          name: 'asdasdsa',
          content: '这里是聊天记录'
        },
        {
          time: '2019-07-03 11:26:22',
          name: 'asdasdsa',
          content: 'sadasd'
        }
      ]
    },
    // 切换tab
    changeTabs(num) {
      this.status = num
    },
    // 上一页
    pre() {
      if (this.groupMsgHistory && this.groupMsgHistory.length > 0) {
        let msgid = this.groupMsgHistory[0].msgid
        this.$emit('getGroupMsgHistory', null, msgid)
      }
    },
    // 下一页
    next() {
      if (!this.isNext) {
        return false
      }
      console.log('我来请求下一页了')
      this.isNext = false
      // 当前列表中离当前时间最远消息的uuid——用于分页
      // console.log(this.groupMsgHistory.length - 1)
      if (this.groupMsgHistory && this.groupMsgHistory.length > 0) {
        console.log(this.groupMsgHistory)
        let msgid = this.groupMsgHistory[this.groupMsgHistory.length - 1].msgid
        this.$emit('getGroupMsgHistory', null, msgid, 'next')
      }
    },
    // 放开下一页
    nextOpen() {
      this.isNext = true
    },
    // 锁定下一页
    nextClose() {
      this.isNext = false
    },
    // 消息处理
    msgHandler() {
      // 得到当前群的最新群消息
      if (!this.groupMsgHistory || this.groupMsgHistory.length === 0) {
        console.log('到此完结')
        return
      }
      this.groupMsgHistory.forEach((e, i, arr) => {
        this.groupMembers.forEach((em, im, arrm) => {
          if (e.fromid === em.memberid) {
            e.nickname = em.nickname
          }
        })
      })
      // this.msgData = this.groupMsgHistory
      // console.log('现在是群聊', JSON.stringify(this.groupMsgHistory))
      // msgData.hasMoreMsg = false
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
      padding: 10px 40px 10px;
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