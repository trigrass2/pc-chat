<template>
  <div class="group-info">
    <div class="tabs">
      <div
        :class="[status === 1 ? 'active' : ' ','text']"
        @click="changeTabs(1)"
      >群成员({{groupMembers && groupMembers.length || 0}})</div>
      <div :class="[status === 2 ? 'active' : ' ','text']" @click="changeTabs(2)">群聊记录</div>
    </div>
    <div class="member-container" v-show="status === 1">
      <ul class="members">
        <template v-if="!groupMembers">
          <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
        </template>
        <template v-else-if="groupMembers && groupMembers.length > 0">
          <li v-for="(item, index) in groupMembers" :key="item.id" @click.right="openMenu(item)">
            <img class="headurl" :src="item.headurl || defaultImg" />
            <div class="nick">{{item.nickname}}</div>
            <div v-if="item.admin == 1" class="tips">管理员</div>
            <div v-if="item.usertype == 5" class="tips">群主</div>
            <div v-if="item.silence == 1" class="tips">禁言</div>
            <div class="lv">
              <img v-for="i in item.lv" src="../sidebar/img/viplvl.png" />
            </div>
          </li>
        </template>
        <div v-else class="noData">暂无群成员</div>
      </ul>
    </div>
    <div class="record-container" v-show="status === 2">
      <div class="page">
        <!-- <div class="pre btn" @click="pre">上一页</div> -->
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
              <div class="content" v-html="showMsgDataHandler(item)"></div>
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
    <!-- 群成员信息 -->
    <div class="member-info" v-show="showMember">
      <div class="info">
        <div class="top">
          <div class="left">
            <div class="name">{{showMember && showMember.nickname}}</div>
            <div class="phone">{{showMember && showMember.mobilekey}}</div>
          </div>
          <img
            :src="[showMember && showMember.headurl ? showMember.headurl : require('../sidebar/img/noface.gif')]"
          />
        </div>
        <div class="bottom">
          <div>
            <span>用户类型: {{showMember && showMember.usertype | usertype}}</span>
            <span>用户级别: {{showMember && showMember.lv}}</span>
          </div>
        </div>
      </div>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapGetters, mapMutations } from 'vuex'
import { copy2, faceImgMap } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'
import { msgDataHandler } from 'common/js/business'
import Private from 'common/js/private.js'
// import {
//   GROUP_CHATTYPE, // 当前聊天类型——群聊
// } from 'common/js/business.js'
// import { gUserInfo } from 'os';
// const MEMBER = 1;

const Menu = remote.Menu
const MenuItem = remote.MenuItem

export default {
  props: {},
  computed: {
    // 用户信息
    ...mapGetters(['gUserInfo', 'groupList', 'memberList', 'privateList'])
  },
  data() {
    return {
      showMember: null, // 查看群成员信息
      groupMembers: [], // 群成员
      groupMsgHistory: [], // 群消息历史记录
      // 请求群历史记录——参数
      groupMsgParams: {
        toid: '', // 群id
        fromid: '', // 用户id
        teamid: '', // 群id(同上)
        pageSize: 20, // 每页数量
        // 翻页的时候,把列表中离当前时间最远的消息的msgid(第一次查询不用传)
        msgid: ''
      },
      // 请求群成员——参数
      groupMemberParams: {
        teamid: '', // 群id
        userId: '' // 用户id
      },
      // 请求禁言——参数
      // noSpeakingParams: {
      //   teamId: '', // 群编号(number)
      //   memberid: '', // 需要被禁言的用户编号(string)
      //   userid: '', // 当前的用户编号(string)
      //   silence: '' // silence(string,0取消禁言/1去禁言)
      // },
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
        member: []
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
  watch: {
    chatType: 'groupInfoHandler',
    groupMsgHistory: 'msgHandler',
    groupList: {
      handler(newV) {
        if (this.groupList) {
          this.groupInfo =
            copy2(
              this.groupList.find((e, i, arr) => {
                return e.isSelected
              })
            ) || null
          // console.log('监听到群聊列表变化，当前群聊历史变更')
        } else {
          this.groupList = null
        }
        // 消息处理
        this.msgHandler()
      },
      deep: true
    }
  },
  methods: {
    // 群成员列表
    /**
     * groupInfo: 群信息
     */
    async getGroupMember(groupInfo) {
      // 请求群历史消息/群成员列表
      this.groupMemberParams.userId = this.gUserInfo.userId
      this.groupMemberParams.teamid = groupInfo.teamid
      await GROUPAPI.gMembers(this.groupMemberParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = this.$crypto.decrypt(res.data.body)
            // 接口每次返回的群成员顺序不同，排序一下保持相同
            resData = JSON.parse(resData).sort((a, b) => {
              return a.id - b.id
            })
            this.groupMembers = resData || []
            // console.log('群成员列表', resData)
            this.SET_MEMBERLIST({
              memberList: this.groupMembers
            })
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    /** 获取群历史记录
     * groupInfo: 群信息
     * msgid: 当前列表中离当前时间最远消息的uuid——用于分页
     */
    async getGroupMsg(groupInfo, msgid) {
      this.groupMsgParams.fromid = this.gUserInfo.userId
      if (msgid == 'first') {
        this.groupMsgParams.msgid = ''
        this.isNext = true
      } else {
        this.groupMsgParams.msgid = msgid
      }
      if (groupInfo) {
        this.groupMsgParams.toid = this.groupMsgParams.teamid = groupInfo.teamid
      }
      // console.log(this.groupMsgParams)
      await GROUPAPI.gMsgHistory(this.groupMsgParams)
        .then(res => {
          if (res.data.code === '0000') {
            let resData = JSON.parse(this.$crypto.decrypt(res.data.body))
              .messages
            // console.log(JSON.stringify(copy2(this.groupMsgHistory)))
            // 关闭下一页锁
            if (resData.length === 1 || resData.length === 0) {
              this.isNext = false
            } else {
              // 打开下一页锁
              this.isNext = true
            }
            // 若群历史消息记录翻页
            if (msgid && msgid != 'first') {
              // 去掉重叠的一条
              let index = resData.findIndex((e, i, arr) => {
                this.groupMsgParams.msgid === e.msgid
              })
              resData.splice(index, 1)
              this.groupMsgHistory = this.groupMsgHistory.concat(
                copy2(resData).reverse()
              )
              // console.log(JSON.stringify(this.groupMsgHistory))
              // 打开下一页锁
              // this.$refs.info.nextOpen()
            } else {
              // 若刚进入群获取历史消息记录
              this.groupMsgHistory = resData.reverse()
            }
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 上一页
    pre() {
      if (this.groupMsgHistory && this.groupMsgHistory.length > 0) {
        let msgid = this.groupMsgHistory[0].msgid
      }
    },
    // 下一页
    next() {
      if (!this.isNext) {
        return false
      }
      this.isNext = false
      // 当前列表中离当前时间最远消息的uuid——用于分页
      if (this.groupMsgHistory && this.groupMsgHistory.length > 0) {
        let msgid = this.groupMsgHistory[this.groupMsgHistory.length - 1].msgid
        this.getGroupMsg(this.groupInfo, msgid)
      }
    },
    // 消息处理——给群消息加上发送者昵称字段
    msgHandler() {
      if (!this.groupMsgHistory || this.groupMsgHistory.length === 0) {
        return
      }
      this.groupMsgHistory.forEach((e, i, arr) => {
        this.groupMembers.forEach((em, im, arrm) => {
          if (e.fromid === em.memberid) {
            e.nickname = em.nickname
          }
        })
      })
    },
    // 消息内容处理
    showMsgDataHandler(data) {
      let result = msgDataHandler(data)
      return result
    },
    // 群成员右键打开菜单
    openMenu(member) {
      this.menu_member = new Menu()
      this.clickRightData = member
      let myInfo = this.groupMembers.find(member => {
        return member.memberid == this.gUserInfo.userId
      })
      // 点中的非本人
      if (member.memberid != this.gUserInfo.userId) {
        // 点中的非本人——@Ta
        this.menu_member.append(
          new MenuItem({
            label: '@ta',
            click: () => {
              this.atTa(this.clickRightData)
            }
          })
        )
        // 我是管理员或对方是管理员——私聊
        if (member.admin == 1 || myInfo.admin == 1) {
          this.menu_member.append(
            new MenuItem({
              label: '私聊',
              click: () => {
                this.goPrivateChat(this.clickRightData)
              }
            })
          )
        }
        // 对方非管理员且在非禁言状态——禁言
        if (member.admin != 1) {
          if (member.silence == '0') {
            this.menu_member.append(
              new MenuItem({
                label: '禁言',
                click: () => {
                  this.noSpeaking(this.clickRightData, 1)
                }
              })
            )
            // 对方非管理员且在禁言状态——取消禁言
          } else if (member.silence == '1') {
            this.menu_member.append(
              new MenuItem({
                label: '取消禁言',
                click: () => {
                  this.noSpeaking(this.clickRightData, 0)
                }
              })
            )
          }
        }
        // 我是管理员且对方非管理员——移出该群
        if (member.admin != 1 && myInfo.admin == 1) {
          this.menu_member.append(
            new MenuItem({
              label: '移出该群',
              click: () => {
                this.removeGroup(this.clickRightData)
              }
            })
          )
        }
      }
      // 始终可以——查看资料
      this.menu_member.append(
        new MenuItem({
          label: '查看资料',
          click: () => {
            this.viewProfile(this.clickRightData)
          }
        })
      )
      this.menu_member.popup(remote.getCurrentWindow())
    },
    // 群成员右键——@ta
    atTa(data) {
      this.$emit('atTa', data)
      // console.log('atTa' + JSON.stringify(data))
    },
    // 群成员右键——私聊
    goPrivateChat(member) {
      // 私聊列表中查找该成员对应私聊是否存在
      let privateInfo
      if (this.privateList) {
        privateInfo = this.privateList.find((e, i, arr) => {
          return e.id === member.memberid
        })
      }
      // 若原私聊列表中存在该私聊对象——选中该对象
      if (privateInfo) {
        this.$emit('selectPrivateChat', copy2(privateInfo))
      } else {
        // 若原私聊列表中不存在该私聊对象——加入该对象，选中该对象
        let addPrivate = new Private({
          name: member.nickname, // 消息发送者姓名
          headUrl: member.headurl, // 消息发送者姓名
          timeline: Date.now(), // 消息发送者姓名
          isSelected: true, // 消息发送者姓名
          id: member.memberid
        })
        // 更新私聊列表
        this.SET_ADDPRIVATE({
          private: addPrivate
        })
        // 选中私聊
        this.$emit('selectPrivateChat', copy2(addPrivate))
      }
      // 聊天窗口切换成私聊
      // console.log('私聊' + JSON.stringify(member))
    },
    // 群成员右键——禁言/取消禁言
    noSpeaking(member, silence) {
      let _data = {
        teamId: member.teamid,
        memberid: member.memberid,
        userid: this.gUserInfo.userId,
        silence: silence
      }
      GROUPAPI.gNoSpeak(_data)
        .then(res => {
          if (res.data.code === '0000') {
            let newMember = copy2(member)
            let index = this.memberList.findIndex(e => {
              return e.memberid == newMember.memberid
            })
            newMember.silence = silence
            this.SET_EDITMEMBER({
              index: index,
              member: newMember
            })
            // console.log('禁言' + JSON.stringify(member))
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 群成员右键——查看资料
    viewProfile(member) {
      this.showMember = member
      // console.log('查看资料' + JSON.stringify(member))
    },
    // 关闭查看资料
    colseProfile() {
      this.showMember = null
    },
    // 群成员右键——移出该群
    removeGroup(member) {
      let data = {
        teamid: member.teamid,
        memberid: member.memberid,
        userid: this.gUserInfo.userId
      }
      GROUPAPI.gQuit(data)
        .then(res => {
          if (res.data.code === '0000') {
            let index = this.memberList.findIndex(e => {
              return e.memberid == member.memberid
            })
            this.SET_DELETEMEMBER({
              index: index
            })
            // console.log('移除该群成功')
          } else {
            this.$refs.layer.show(res.returnmsg)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // queryRecrod() {
    //   this.recordList = [
    //     {
    //       time: '2019-07-03 11:26:22',
    //       name: 'asdasdsa',
    //       content: '这里是聊天记录'
    //     },
    //     {
    //       time: '2019-07-03 11:26:22',
    //       name: 'asdasdsa',
    //       content: 'sadasd'
    //     }
    //   ]
    // },
    // 切换tab
    changeTabs(num) {
      this.status = num
    },
    ...mapMutations({
      SET_MEMBERLIST: 'SET_MEMBERLIST',
      SET_ADDPRIVATE: 'SET_ADDPRIVATE',
      SET_DELETEMEMBER: 'SET_DELETEMEMBER',
      SET_EDITMEMBER: 'SET_EDITMEMBER'
    })
  },
  filters: {
    usertype(num) {
      if (num == 1) {
        return '会员'
      } else if (num == 3) {
        return '客服'
      } else if (num == 5) {
        return '群主'
      } else {
        return '其他'
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.member-info {
  width: 300px;
  height: 200px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  position: absolute;
  margin-left: -300px;
  top: 30%;
  padding: 20px;
  .info {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .top {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 20px;
      .left {
        .name {
          font-size: 18px;
          font-weight: bold;
          color: $title;
          line-height: 32px;
        }
        .phone {
          font-size: 16px;
          color: $title;
          line-height: 32px;
        }
      }
      img {
        width: 50px;
        height: 50px;
        border-radius: 6px;
      }
    }
    .bottom {
      padding-top: 20px;
      color: $content;
      text-align: left;
      line-height: 28px;
    }
  }
}
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
        .headurl {
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
          margin: 0 4px;
        }
        .lv {
          margin: 0 4px;
          img {
            width: 10px;
            height: 10px;
          }
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
      // justify-content: space-between;
      justify-content: center;
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
          .content {
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
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