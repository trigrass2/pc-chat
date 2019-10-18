<template>
  <!-- 会话相关侧边栏-摘要记录/聊天记录 -->
  <div class="group-info">
		<!-- tab切换 -->
    <div class="tabs">
      <div :class="[status === 1 ? 'active' : ' ','text']" @click="changeTabs(1)">摘要记录</div>
      <div :class="[status === 2 ? 'active' : ' ','text']" @click="changeTabs(2)">聊天记录</div>
    </div>
		<!-- 摘要 -->
    <div class="summary" v-show="status === 1">
			<!-- 列表 -->
      <ul>
        <li v-for="(item, index) in summarylist" :key="item.id">
          <div class="top">
            <div class="time">{{item.time}}</div>
            <div class="operate">
              <img src="./img/edit.png" @click.stop="editSummary(item)" />
              <img src="./img/delete.png" @click.stop="clearSummary(item)" />
            </div>
          </div>
          <div class="content">{{item.content}}</div>
        </li>
      </ul>
			<!-- 编辑 -->
      <div class="edit-wrap">
        <div class="edit">
          <textarea v-model="summaryEditIng.content"></textarea>
          <div class="btn" @click="saveSummary">保存</div>
        </div>
      </div>
    </div>
		<!-- 聊天记录 -->
    <div class="record" v-show="status === 2">
			<!-- 列表 -->
      <div class="page">
        <div class="pre btn" @click="pre">上一页</div>
        <div class="text">页: 1/6 总记录数: 173</div>
        <div class="next btn" @click="next">下一页</div>
      </div>
      <ul>
        <li v-for="(item, index) in recordList" :key="item.id">
          <div class="time">{{item.time}}</div>
          <div class="name">{{item.name}}</div>
          <div class="content">{{item.content}}</div>
        </li>
      </ul>
			<!-- 查询 -->
      <div class="query">
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
      </div>
    </div>
  </div>
</template>

<script>
const SUMMARY = 1;

export default {
  data() {
    return {
      // tab状态 summary/record
      status: SUMMARY,
      // 聊天记录当前页数
      recordPage: 1,
      // 正在编辑会话摘要
      summaryEditIng: {},
      query: {
        scope: "",
        text: ""
      },
      scopeList: [
        {
          val: "1",
          name: "今天"
        },
        {
          val: "2",
          name: "最近一周"
        },
        {
          val: "3",
          name: "最近一个月"
        },
        {
          val: "4",
          name: "所有"
        }
      ],
      recordList: [
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        }
      ],
      summarylist: [
        {
          id: "1",
          time: "2019-4-3",
          content: "123123"
        },
        {
          id: "2",
          time: "2019-4-3",
          content: "123123123123123123123213213213"
        },
        {
          id: "3",
          time: "2019-4-3",
          content: "123123"
        }
      ]
    };
  },
  methods: {
    // 编辑摘要
    editSummary(item) {
      console.log(5555);
      let content = JSON.stringify(item);
      content = JSON.parse(content);
      this.summaryEditIng = content;
    },
    // 保存摘要
    saveSummary() {
      let index = this.summarylist.findIndex((e, i, arr) => {
        return e.id === this.summaryEditIng.id;
      });
      this.summarylist[index].content = this.summaryEditIng.content;
      console.log("保存摘要");
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
          if (index === 0) {
            let index = this.summarylist.findIndex((e, i, arr) => {
              return e.id === item.id;
            });
            this.summarylist.splice(index, 1);
          }
        }
      );
    },
    queryRecrod() {
      console.log(this.query);
      this.recordList = [
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "sadasd"
        }
      ];
    },
    // 切换tab
    changeTabs(num) {
      this.status = num;
    },
    // 上一页
    pre() {
      this.recordPage--;
      this.recordList = [
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        }
      ];
    },
    // 下一页
    next() {
      this.recordPage++;
      this.recordList = [
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        },
        {
          time: "2019-07-03 11:26:22",
          name: "asdasdsa",
          content: "这里是聊天记录"
        }
      ];
    },
    // 报错
    error(title, content) {
      this.$electron.remote.dialog.showErrorBox(title, content);
    }
  }
};
</script>
<style lang='scss' scoped>
.group-info {
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
  .summary {
    // height: 510px;
    height: 100%;
    background-color: $blank;
    position: relative;
    ul {
      // height: 370px;
      height: 100%;
      padding-bottom: 280px;
      overflow: auto;
      border-bottom: 1px solid $border;
      li {
        padding: 6px 0 6px 6px;
        cursor: default;
        &:hover {
          background-color: $listLightHover;
        }
        &:last-child {
          borer: none;
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
        }
      }
    }
    .edit-wrap {
      position: absolute;
      width: 100%;
      left: 50%;
      transform: translateX(-50%);
      height: 144px;
      bottom: 138px;
      border-top: 1px solid $border;
      .edit {
        width: 90%;
        height: 108px;
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
          position: absolute;
          width: 50px;
          height: 17%;
          background-color: $listHover;
          text-align: center;
          right: 26px;
    			bottom: 37px;
          border: 1px solid $border;
          cursor: default;
        }
      }
    }
  }

  .members {
    height: 512px;
    overflow: auto;
    li {
      display: flex;
      align-items: center;
      padding: 4px 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid $border;
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
  .record {
    height: 512px;
    background-color: #fff;
    .page {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      padding-top: 10px;
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
    }
    ul {
      height: 345px;
      overflow: auto;
      li {
        padding: 10px;
        font-size: 14px;
        border-bottom: 1px solid $border;
        .time,
        .name {
          color: $content;
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