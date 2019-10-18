<template>
  <div id="app" @click="globalEvent" style="height: 100%;">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "pc-chat",
  // computed: {
  //   ...mapGetters(["faceImgShow"])
  // },
  created() {
    this.SET_CHATTYPE({
      chatType: 1
    });
    this.SET_GROUPINFO({
      groupInfoShow: false
    });
    this.SET_SESSIONINFO({
      sessionInfoShow: false
    });
  },
  methods: {
    globalEvent() {
      console.log(11111);
      // 聊天表情包关闭
      this.SET_FACEIMG({
        faceImgShow: false
      });
    },
    ...mapMutations({
      SET_FACEIMG: "SET_FACEIMG",
      SET_CHATTYPE: "SET_CHATTYPE",
      SET_GROUPINFO: "SET_GROUPINFO",
      SET_SESSIONINFO: "SET_SESSIONINFO"
    })
  }
};
</script>

<style>
/* CSS */
</style>
