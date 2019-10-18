<template>
  
</template>

<script>
const ONLINE = 1;
// const OUTLINE = 2;

export default {
  data() {
    return {
      // 客服在线状态
      selected: ONLINE
    };
  },

  methods: {
    // 登出
    logout() {
      this.$electron.ipcRenderer.send("logout");
    },
    // 打开历时记录
    openHistory() {
      this.$electron.ipcRenderer.send("openHistory");
    },
    // 打开设置
    openSetting() {
      this.$electron.ipcRenderer.send("openSetting");
    }
  }
};
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.user-info {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  align-items: center;
  background-color: $red;
}
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 150px;
  .name {
    color: $blank;
    font-size: 12px;
  }
  .status {
    position: relative;
    select {
      width: 50px;
      height: 22px;
      padding: 2px;
      font-size: 12px;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    .select-img {
      width: 12px;
      height: 12px;
      position: absolute;
      right: 6px;
      bottom: 4px;
      background: transparent;
      pointer-events: none;
    }
  }
}
.operator {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  width: 120px;
  justify-content: space-between;
  div {
    cursor: pointer;
  }
}
</style>