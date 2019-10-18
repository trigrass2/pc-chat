<template>
  <div class="wrap">
    <div class="side-bar">
      <div class="search-box">
        <input type="text" v-model="searchText" placeholder="请输入您要搜索的内容">
        <img src="./delete.png" width="18px" height="18px" @click="clearText">
        <div class="btn" @click="search">查询</div>
      </div>
      <div class="bar-list">
        <div class="bar" v-for="(item, index) in barList" :key="item.id">
          <div class="head" @click="showList(item)">
            <div :class="[item.show ? 'selected': '', 'type']">
              <img src="./arrow_r.png">
              <span>{{item.name}}</span>
            </div>
            <div class="number">{{item.number}}</div>
          </div>
          <transition name="slide">
            <ul class="con" v-if="item.show">
              <template v-if="item.subList.length !== 0">
                <li v-for="(value, index) in item.subList" :key="value.id">
                  <span class="name">{{value.name}}</span>
                  <div class="right">
                    <div class="number">{{value.number}}</div>
                    <img src="./arrow_r.png">
                  </div>
                </li>
              </template>
              <div v-else class="noData">暂无内容</div>
            </ul>
          </transition>
        </div>
      </div>
    </div>
		<div class="container">
			<ul class="content">
				<li v-for="(item, index) in contentList" :key="item.id">
					<div class="title">
						<div class="time">{{item.time}}</div>
						<div class="name">{{item.from}}</div>
					</div>
					<div class="con">{{item.content}}</div>
				</li>
			</ul>
		</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 搜索内容
      searchText: "",
      // content列表
      contentList: [
        {
          id: 1,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 2,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 3,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 4,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
				},
				{
          id: 5,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 6,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 7,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        },
        {
          id: 8,
          time: "2019-06-13 11:02:14",
          from: "小王",
          content:
            "啊实打实大师的念念阿斯顿撒阿斯顿啊撒阿斯顿撒的撒的撒的不舍的内分泌你的生命的什么饭你的模式农夫说的那么方便迪士尼"
        }
      ],
      // bar列表
      barList: [
        {
          id: 1,
          name: "咨询历史",
          number: 5,
          show: false,
          subList: [
            {
              id: 1,
              name: "哈哈哈哈哈",
              number: 5
            },
            {
              id: 2,
              name: "哈哈哈哈哈",
              number: 5
            },
            {
              id: 3,
              name: "哈哈哈哈哈",
              number: 5
            }
          ]
        },
        {
          id: 2,
          name: "群组",
          number: 5,
          show: false,
          subList: [
            {
              id: 1,
              name: "哈哈哈哈哈",
              number: 5
            }
          ]
        },
        {
          id: 3,
          name: "同伴",
          number: 5,
          show: false,
          subList: [
            {
              id: 1,
              name: "哈哈哈哈哈",
              number: 5
            },
            {
              id: 2,
              name: "哈哈哈哈哈",
              number: 5
            }
          ]
        },
        {
          id: 4,
          name: "私聊",
          number: 5,
          show: false,
          subList: []
        }
      ]
    };
  },

  methods: {
    // 搜索
    search() {},
    // 清除搜索内容
    clearText() {
      this.searchText = "";
    },
    showList(item) {
      item.show = !item.show;
    }
  }
};
</script>
<style lang='scss' rel="stylesheet/scss" scoped>
.wrap{
	display: flex;
}
.side-bar {
  width: 250px;
  height: 650px;
  border: 1px solid $border;
  border-right: 1px solid $border;
  background-color: $blank;
  .search-box {
    padding: 20px 0 20px 20px;
    border-bottom: 1px solid $border;
    input {
      width: 160px;
      height: 30px;
      font-size: 12px;
      padding: 2px;
      border-radius: 4px;
      border: 1px solid $border;
    }
    img {
      position: absolute;
      margin-left: -25px;
      margin-top: 6px;
      cursor: pointer;
    }
    .btn {
      display: inline-block;
      width: 56px;
      height: 28px;
      background: $red;
      text-align: center;
      line-height: 28px;
      color: $blank;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      opacity: 0.8;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
  }
}
.bar-list {
  .bar {
    cursor: pointer;
    .head {
      width: 100%;
      height: 35px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
      padding-left: 10px;
      padding-right: 10px;
      border-bottom: 1px solid $border;
      &:hover {
        background-color: $listHover;
      }
      .type {
        display: flex;
        align-items: center;
        img {
          width: 15px;
          height: 15px;
          margin-right: 2px;
          -webkit-animation: rotateBack 0.5s infinite;
          -webkit-animation-iteration-count: 1;
          -webkit-animation-fill-mode: forwards;
        }
      }
      .selected {
        span {
          color: $primary;
        }
        img {
          -webkit-animation: rotateGo 0.5s infinite;
          -webkit-animation-iteration-count: 1;
          -webkit-animation-fill-mode: forwards;
        }
      }
      .number {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        color: #fff;
        background-color: $red;
        text-align: center;
        line-height: 20px;
      }
    }
    .con {
      .noData {
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 14px;
        cursor: default;
      }
      li {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px 0 20px;
				background-color: $blank;
        &:hover {
          background-color: $listHover;
        }
        .name {
          font-size: 12px;
        }
        .right {
          display: flex;
          align-items: center;
          .number {
            color: $green;
            margin-right: 6px;
          }
          img {
            width: 15px;
            height: 15px;
          }
        }
      }
    }
  }
}
.container{
	height: 650px;
	overflow: auto;
	flex: 1;
	.content{
		padding: 20px;
		li{
			background-color: #fff;
			padding: 20px 10px;
			margin-bottom: 10px;
			.title{
				display: flex;
				align-items: center;
				font-size: 12px;
				margin-bottom: 10px;
				font-weight: bold;
				.name{
					color: $primary;
					margin-left: 10px;
				}
			}
			.con{
				font-size: 12px;
			}
		}
	}
}

.slide-enter,
.slide-leave-active {
  opacity: 0;
}
.slide-leave-active,
.slide-enter-active {
  transition: all 0.2s;
}
@-webkit-keyframes rotateGo {
  from {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }

  to {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
}

@-webkit-keyframes rotateBack {
  from {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  to {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
}
</style>