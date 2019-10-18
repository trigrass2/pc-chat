<template>
  <div class="wrap">
    <ul class="tab-box">
      <li
        :class="[tabSelected===1 ? 'active' : '', sessionNew ? 'new' : ''  ]"
        @click="changeTab(1)"
      >
        <span>会话</span>
      </li>
      <li :class="[tabSelected===2 ? 'active' : '', groupNew ? 'new' : ''  ]" @click="changeTab(2)">
        <span>群组</span>
      </li>
      <li
        :class="[tabSelected===3 ? 'active' : '', friendNew ? 'new' : ''  ]"
        @click="changeTab(4)"
      >
        <span>同伴</span>
      </li>
    </ul>
    <!-- 会话 -->
    <div class="session-content" v-show="tabSelected === 1">
      <input v-model="sessionSearchText" type="text" placeholder="搜索会话" @input="sessionSearch" />
      <div class="status-box">
        <div
          :class="[statusSelected == 1 ? 'active' : 'default', 'status']"
          @click="changeSessionStatus(1)"
        >
          <div class="ing img"></div>
          <div class="text">进行中</div>
        </div>
        <div
          :class="[statusSelected == 2 ? 'active' : 'default', 'status']"
          @click="changeSessionStatus(2)"
        >
          <div class="over img"></div>
          <div class="text">已结束</div>
        </div>
      </div>
      <ul class="chat-list">
        <template v-if="sessionList.length > 0">
          <li
            v-for="(item, index) in sessionList"
            :key="item.id"
            :class="item.isSelected ? 'selected' : ''"
            @click="sessionSelect(item)"
          >
            <div v-show="item.unRead > 0" class="unread">{{item.unRead}}</div>
            <div class="top">
              <img :src="[item.head ? item.head : '../../../Setting/head.png']" />
              <div class="top_center">
                <div class="phone">{{item.phone | phoneSecriet}}</div>
                <div class="status">{{item.status | sessionStatus}}</div>
              </div>
              <div class="time">{{item.time}}{{item.isSelected}}</div>
            </div>
            <div class="bottom">会话ID:{{item.sessionId}} VIP:{{item.vip}}</div>
          </li>
        </template>
        <div v-else class="noData">暂无会话</div>
      </ul>
    </div>
    <!-- 群组 -->
    <div class="group-content" v-show="tabSelected === 2">
      <!-- 群组列表 -->
      <ul class="group-chat-content">
        <template v-if="!groupTeamList">
          <spinner-content class="spinner"></spinner-content>
        </template>
        <template v-else-if="groupTeamList && groupTeamList.length > 0">
          <li
            :class="item.isSelected ? 'selected': ''"
            v-for="(item, index) in groupTeamList"
            :key="item.teamid"
            @click.stop="selectGroupChat(item)"
          >
            <img :src="item.headurl" />
            <div v-show="Number(item.unReadNum) > 0" class="unread">{{item.unReadNum}}</div>
            <!-- <div class="unread">2</div> -->
            <div class="text">{{item.teamname}}({{item.memberCount}})</div>
            <div class="time">{{item.lastTime}}</div>
          </li>
        </template>
        <div v-else class="noData">暂无群聊列表</div>
      </ul>
      <!-- 私聊列表 -->
      <div class="private-chat-content">
        <div class="title">私聊列表</div>
        <ul class="private-list">
          <template v-if="!privateTeamList">
            <spinner-content class="spinner" style="margin-top: 20px;"></spinner-content>
          </template>
          <template v-else-if="privateTeamList && privateTeamList.length > 0">
            <li
              :class="item.isSelected ? 'selected': ''"
              v-for="(item, index) in privateTeamList"
              :key="item.id"
              @click.stop="selectPrivateChat(item)"
            >
              <img :src="item.headUrl" />
              <div v-show="Number(item.unReadNum) > 0" class="unread">{{item.unReadNum}}</div>
              <div class="text">{{item.name}}</div>
              <div class="time">{{item.timeline | format('all')}}</div>
            </li>
          </template>
          <div v-else class="noData">暂无私聊列表～</div>
        </ul>
      </div>
      <!-- @我的列表 -->
      <div class="at-chat-content">
        <div class="title">at我的</div>
        <ul class="at-list">
          <template v-if="atMeList.length > 0">
            <li v-for="(item, index) in atMeList" :key="item.groupId">
              <div class="text">{{item.sendTime}} {{item.userName}} 在 {{item.groupName}} 提到了我</div>
            </li>
          </template>
          <div v-else class="noData">还没有人@我~</div>
        </ul>
      </div>
    </div>
    <!-- 同伴 -->
    <div class="friend-content" v-show="tabSelected === 3">
      <ul class="friend-list">
        <template v-if="friendList.length > 0">
          <li v-for="(item, index) in friendList" :key="item.id">
            <img :src="item.head" />
            <div class="text">{{item.name}}</div>
            <div class="time">{{item.time}}</div>
          </li>
        </template>
        <div v-else class="noData">暂无同伴列表</div>
      </ul>
    </div>
  </div>
</template>

<script>
import { debounce, formatDate } from 'common/js/util.js'
import { mapGetters, mapMutations } from 'vuex'
// 会话
const SESSION = 1
// 群聊
const GROUP = 2
const PRIVATE = 3
// 会话-进行中
const SESSION_ING = 1

export default {
  computed: {
    // 群聊相关信息显示  私聊列表  未读私聊消息
    ...mapGetters(['groupInfoShow', 'privateList', 'unReadPrivateMsg'])
  },
  props: {
    // 当前群信息
    groupInfo: {
      type: Object,
      default: null
    },
    // 群聊列表
    groupTeamList: {
      type: Array,
      default: null
    },
    // 私聊列表
    privateTeamList: {
      type: Array,
      default: null
    },
    // @我的消息列表
    atMeList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      // tab栏选中状态
      tabSelected: SESSION,
      // 会话状态
      statusSelected: SESSION_ING,
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
      },
      sessionList: [],
      friendList: [
        {
          id: 1,
          head: '../../../Setting/head_on.png',
          name: '浙金大讲堂',
          number: '23',
          time: '2019-08-03'
        },
        {
          id: 2,
          head: '../../../Setting/head_on.png',
          name: '浙金大讲堂',
          number: '23',
          time: '2019-08-03'
        }
      ],
      sessionIng: [
        {
          id: 1,
          // 手机号
          phone: '17826894060',
          // 头像
          head: '../../../Setting/head_on.png',
          // 时间
          time: '15:12:23',
          // 会话id
          sessionId: '4433',
          vip: '0',
          // 未读消息数量
          unRead: 0,
          // 是否被选中
          isSelected: false,
          // 会话状态: 1-进行中 2-结束
          status: 1
        },
        {
          id: 2,
          phone: '17826894060',
          head: '',
          time: '15:12:23',
          sessionId: '4433',
          vip: '0',
          unRead: 0,
          isSelected: false,
          status: 1
        }
      ],
      sessionOver: [
        {
          id: 6,
          phone: '17826894060',
          head: '',
          time: '15:12:23',
          sessionId: '4433',
          vip: '0',
          unRead: 99,
          isSelected: false,
          status: 2
        },
        {
          id: 7,
          phone: '17826894060',
          head: '../../../Setting/head_on.png',
          time: '15:12:23',
          sessionId: '4433',
          vip: '0',
          unRead: 0,
          isSelected: false,
          status: 2
        }
      ]
    }
  },
  created() {
    // 搜索防抖初始化
    this.sessionSearch = debounce(this.sessionSearch, 500)
  },
  methods: {
    // 会话/群聊/同伴 tab切换
    changeTab(num) {
      var sessionShow, groupShow
      // 会话
      if (num === 1) {
        sessionShow = true
      } else {
        sessionShow = false
      }
      // 群聊
      if (num === GROUP) {
        groupShow = true
      } else {
        groupShow = false
      }
      // 会话右侧内容框
      this.SET_SESSIONINFO({
        sessionInfoShow: sessionShow
      })
      // 群聊右侧内容框
      this.SET_GROUPINFO({
        groupInfoShow: groupShow
      })
      // tab的active项控制
      this.tabSelected = num
      // 聊天类型
      this.SET_CHATTYPE({
        chatType: num
      })
      // 若未选中过群聊，默认选中第一个
      if (num === GROUP) {
        if (this.groupInfo) {
          this.selectGroupChat(this.groupInfo)
        } else {
          if (this.groupTeamList && this.groupTeamList.length > 0) {
            this.selectGroupChat(this.groupTeamList[0])
          }
        }
        // let hasSelected = this.groupTeamList.every((e, i, arr) => {
        //   return e.isSelected === false
        // })
      }
    },
    sessionSelect(item) {
      this.sessionList.forEach((e, i, arr) => {
        this.$set(e, 'isSelected', false)
        // e.isSelected = false
      })
      this.$set(e, 'isSelected', true)
      // item.isSelected = true
    },
    // 会话搜索
    sessionSearch() {
      console.log(111)
    },
    // 会话切换状态
    changeSessionStatus(num) {
      this.statusSelected = num
      num === 1
        ? (this.sessionList = this.sessionIng)
        : (this.sessionList = this.sessionOver)
    },
    // 选中群聊
    selectGroupChat(item) {
      // 选中项样式改变
      this.privateTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      this.groupTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      item.isSelected = true
      // 未读消息清空
      this.$set(item, 'unReadNum', 0)
      // 展示群详情内容
      this.SET_GROUPINFO({
        groupInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: GROUP
      })
      console.log('选中群聊1', this.chatType)
      // 去上级组件请求群信息(群成员/群历史消息)
      this.$emit('getGroupInfo', item, null, 'first')
    },
    // 选中私聊
    selectPrivateChat(item) {
      // 选中项样式改变
      this.privateTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      this.groupTeamList.forEach((e, i, arr) => {
        e.isSelected = false
      })
      item.isSelected = true
      // 未读消息清空
      this.$set(item, 'unReadNum', 0)
      // 展示私聊详情内容
      this.SET_PRIVATEINFO({
        privateInfoShow: true
      })
      // 切换聊天模式
      this.SET_CHATTYPE({
        chatType: PRIVATE
      })
      console.log('选中私聊1', this.chatType)
      // 去上级组件请求私聊信息(私聊历史消息)
      this.$emit('getPrivateInfo', item)
    },
    ...mapMutations({
      SET_CHATTYPE: 'SET_CHATTYPE',
      SET_GROUPINFO: 'SET_GROUPINFO',
      SET_SESSIONINFO: 'SET_SESSIONINFO',
      SET_PRIVATEINFO: 'SET_PRIVATEINFO'
    })
  },
  filters: {
    format(date, type) {
      if (type === 'all') {
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      } else {
        return formatDate(date, 'yyyy-MM-dd')
      }
    },
    sessionStatus(data) {
      if (data === 1) {
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
  border-right: 1px solid $border;
  background-color: $blank;
}
.tab-box {
  display: flex;
  width: 100%;
  height: 40px;
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
.group-content,
.friend-content {
  border-top: 1px solid $border;
  .group-chat-content {
    position: relative;
    height: 230px;
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
    position: relative;
    .private-list {
      height: 150px;
      overflow: auto;
    }
    .unread {
      margin-top: -15px;
      margin-left: 25px;
    }
  }
  .friend-list {
    height: 560px;
    border-bottom: 1px solid $border;
    overflow: auto;
  }
  .at-chat-content {
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
        width: 16px;
        height: 16px;
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