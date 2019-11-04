<template>
  <!-- 会话相关侧边栏-摘要记录/聊天记录 -->
  <!-- <div class="group-info"> -->
		<!-- tab切换 -->
    <!-- <div class="tabs">
      <div :class="[status === 1 ? 'active' : ' ','text']" @click="changeTabs(1)">摘要记录</div>
      <div :class="[status === 2 ? 'active' : ' ','text']" @click="changeTabs(2)">聊天记录</div>
    </div> -->
		  <div class="session-info">
        <div class="tabs">
          <div :class="[status === 1 ? 'active' : ' ','text']" @click="changeTabs(1)">摘要记录</div>
          <div :class="[status === 2 ? 'active' : ' ','text']" @click="changeTabs(2)">聊天记录</div>
        </div>
        <!-- 摘要 -->
        <div class="summary-container" v-show="status == 1">
          <!-- 列表 -->
          <div class="summary-con">
            <ul>
              <template v-if="!summarylist">
                <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
              </template>
              <template v-else-if="summarylist && summarylist.length > 0">
                <li v-for="(item, index) in summarylist" :key="item.id">
                  <div class="top">
                    <div class="time">{{item.f_createtime}}</div>
                    <div class="operate">
                      <img src="./img/edit.png" @click.stop="editSum(item)" />
                      <img src="./img/delete.png" @click.stop="clearSummary(item)" />
                    </div>
                  </div>
                  <div class="content">{{item.content}}</div>
                </li>
              </template>
              <div v-else class="noData">暂无摘要</div>
            </ul>
          </div>
          <!-- 编辑 -->
          <div class="edit-wrap">
            <div class="edit">
              <textarea v-model="summaryEditIng.content"></textarea>
              <div class="btn" @click="saveSummary">保存</div>
            </div>
          </div>
        </div>
        <div class="record-container" v-show="status == 2">
          <div class="page">
            <div :class="[isPreOk ? '': 'disable', 'pre', 'btn']" @click="pre">上一页</div>
            <div class="text">页: {{sessionMsgParams.page}}/{{sessionMsgParams.pages}}</div>
            <div :class="[isNextOk ? '' : 'disable', 'next', 'btn']" @click="next">下一页</div>
          </div>
          <div class="record-wrap">
            <ul class="record">
              <template v-if="!recordList">
                <spinner-content class="spinner" style="margin-top: 40px;"></spinner-content>
              </template>
              <template v-else-if="recordList && recordList.length > 0">
                <li v-for="(item, index) in recordList" :key="item.msgid">
                  <div class="name">{{item.fromname}}</div>
                  <div class="time">{{item.formatdate}}</div>
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
			<!-- 查询 -->
      <!-- <div class="query">
        <div>
          范围:
          <select v-model="query.scope">
            <option v-for="(item, index) in scopeList" :value="item.val">{{item.name}}</option>
          </select>
        </div>
        <div>
          关键词:
          <input v-model="query.text" type="text" class="text"/>
          <div class="btn" @click="queryRecrod">查询</div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import { copy2, isJson } from 'common/js/util'
import { GROUPAPI } from 'api/http/groupChat'
import { msgDataHandler } from 'common/js/business'
import { mapGetters, mapMutations } from 'vuex'
import { SessionMessage } from 'common/js/message.js'
import { sessionChatList, loadSummary, addSummary, editSummary, delSummary } from 'api/http/sessionChat'

const Menu = remote.Menu
const MenuItem = remote.MenuItem
const SUMMARY = 1  // 摘要

export default {
  created() {
    // 翻页状态判断
    this.goPageStatus(this.sessionMsgParams.page, this.sessionMsgParams.totalpage)
  },
  computed: {
    // 用户信息
    ...mapGetters(['sUserInfo', 'sessionList'])
  },
  watch: {
    recordList: 'msgHandler',
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
      },
      deep: true
    }
  },
  data() {
    return {
      // 请求会话历史消息——参数
      sessionMsgParams: {
        userid: '',
        page: 1,
        pages: 1
      },
      recordList: [],
      // 防止多次连续点击下一页/上一页
      isReqOk: true,
      // 下一页是否可点击
      isNextOk: true,
      // 上一页是否可点击
      isPreOk: true,
      // tab状态 summary/record
      status: SUMMARY,
      // 正在编辑会话摘要
      summaryEditIng: {
        id: '',
        content: '',
        guestsid: ''
      },
      summarylist: [] // 摘要列表
      // query: {
      //   scope: "",
      //   text: ""
      // },
      // scopeList: [
      //   {
      //     val: "1",
      //     name: "今天"
      //   },
      //   {
      //     val: "2",
      //     name: "最近一周"
      //   },
      //   {
      //     val: "3",
      //     name: "最近一个月"
      //   },
      //   {
      //     val: "4",
      //     name: "所有"
      //   }
      // ],
    }
  },
  methods: {
    // 会话历史消息加载
    /**
     * sessionInfo: 当前会话
     * page: 页数
     */
    // 会话历史消息加载
    getSessionMsg(sessionInfo, page) {
      if (sessionInfo) {
        this.sessionMsgParams.userid = sessionInfo.guestsid
      } else {
        return
      }
      this.sessionMsgParams.page = page
      sessionChatList(this.sessionMsgParams)
        .then(res => {
          if (res.data.returncode == '0') {
            this.sessionMsgParams.pages = res.data.totalpage
            // 翻页状态判断
            this.goPageStatus(page, res.data.totalpage)
            // 分页数据更新
            this.recordList = res.data.list
            // 放开请求
            this.isReqOk = true
          } else {
            // 放开请求
            this.isReqOk = true
            this.$refs.layer.show(res.returnmsg)
          }
        })
        .catch(res => {
          // 放开请求
          this.isReqOk = true
          this.$refs.layer.show(res)
        })
    },
    // 会话历史——上一页
    pre() {
      if (!this.isReqOk || !this.isPreOk) {
        return false
      }
      this.isReqOk = false
      let page = Number(this.sessionMsgParams.page) - 1
      this.getSessionMsg(this.sessionInfo, page)
    },
    // 会话历史——下一页
    next() {
      if (!this.isReqOk || !this.isNextOk) {
        return false
      }
      this.isReqOk = false
      let page = Number(this.sessionMsgParams.page) + 1
      this.getSessionMsg(this.sessionInfo, page)
    },
    // 会话历史——翻页状态判断
    goPageStatus(curPage, totalPage) {
      // 下一页状态判断
      if (!totalPage || curPage >= totalPage) {
        // console.log('进来锁定了')
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
    // 会话历史——消息处理
    msgHandler() {
      // 若当前会话存在，就去取消息列表，否则初始化为空数组
      if (!this.recordList || this.recordList.length == 0) {
        this.recordList = []
        return false
      }
    },
    // 会话历史——消息内容处理
    showMsgDataHandler(data) {
      let result = msgDataHandler(data)
      return result
    },
    // 会话历史——切换tab
    changeTabs(num) {
      this.status = num;
    },
    // 加载摘要列表
    loadSummary(sessionInfo) {
      if (!sessionInfo) {
        return
      }
      loadSummary({guestsid: sessionInfo.guestsid}).then(res => {
        if (res.data.returncode == '0') {
          console.log('摘要列表', res)
          this.summarylist = res.data.list
        } else {
          this.$refs.layer.show(res.returnmsg)
        }
      })
      .catch(res => {
        this.$refs.layer.show(res)
      })
    },
    // 编辑摘要
    editSum(item) {
      if (item.customerid != this.sUserInfo.userid) {
        this.$refs.layer.show('只能编辑自己的记录')
        return
      }
      this.$set(this.summaryEditIng, 'content', item.content)
      this.$set(this.summaryEditIng, 'id', item.id)
      console.log(this.summaryEditIng)
    },
    // 保存摘要(编辑/新增)
    saveSummary() {
      this.summaryEditIng.guestsid = this.sessionInfo.guestsid
      // 编辑
      if (this.summaryEditIng.id) {
        editSummary(this.summaryEditIng).then(res => {
          console.log(res)
          if (res.data.returncode == '0') {
            let index = this.summarylist.findIndex((e, i, arr) => {
              return e.id == this.summaryEditIng.id
            })
            this.summarylist[index].content = this.summaryEditIng.content;
            this.summaryEditIng.content = ''
            this.summaryEditIng.id = ''
            this.summaryEditIng.guestsid = ''
          } else {
            this.$refs.layer.show(res.returnmsg)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
        // 新增
      } else {
        addSummary(this.summaryEditIng).then(res => {
          if (res.data.returncode == '0') {
            this.loadSummary(this.sessionInfo)
            this.summaryEditIng.content = ''
            this.summaryEditIng.id = ''
            this.summaryEditIng.guestsid = ''
          } else {
            this.$refs.layer.show(res.returnmsg)
          }
        })
      }
    },
    // 删除摘要
    clearSummary(item) {
      this.$electron.remote.dialog.showMessageBox(
        {
          type: "info",
          title: "删除提示",
          message: "确定要删除该条摘要吗？",
          buttons: ["确定", "取消"]
        },
        index => {
          // 0 确定 1取消
          if (index == 0) {
            delSummary({
              guestsid: this.sessionInfo.guestsid,
              content: item.content,
              id: item.id
            }).then(res => {
              if (res.data.returncode == '0') {
                let index = this.summarylist.findIndex((e, i, arr) => {
                  return e.id == item.id;
                })
                this.summarylist.splice(index, 1);
              } else {
                this.$refs.layer.show(res.returnmsg)
              }
            })
            .catch(res => {
              this.$refs.layer.show(res)
            })
          }
        }
      )
    }
  }
};
</script>
<style lang='scss' scoped>
.noData {
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: rgb(83, 83, 83);
}
.session-info {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  .summary-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $blank;
    position: relative;
    .summary-con{
      flex: 1;
      overflow: auto;
    }
    ul {
      height: 100%;
      li {
        padding: 6px 0 6px 6px;
        cursor: default;
        &:hover {
          background-color: $listLightHover;
        }
        &:last-child {
          border: none;
        }
        .top {
          display: flex;
          .operate {
            flex: 1;
            text-align: right;
            img {
              width: 15px;
              height: 15px;
              cursor: default;
              margin-right: 10px;
            }
          }
        }
        .content {
          color: $content;
          word-wrap: break-word;
          word-break: break-all;
          overflow: hidden;
        }
      }
    }
    .edit-wrap {
      height: 143px;
      width: 100%;
      border-top: 1px solid $border;
      .edit {
        width: 90%;
        height: 122px;
        background-color: $blank;
        border: 10px solid $listHover;
        margin: 10px auto;
        // position: relative;
        textarea {
          width: 100%;
          height: 80%;
          color: $content;
          resize: none;
          padding: 10px;
          border: none;
        }
        .btn {
          font-size: 15px;
          position: absolute;
          width: 50px;
          height: 20px;
          line-height: 20px;
          background-color: $listHover;
          text-align: center;
          right: 26px;
    			bottom: 26px;
          border: 1px solid $border;
          cursor: default;
        }
      }
    }
  }

  .record-container {
    height: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
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