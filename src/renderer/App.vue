<template>
  <div id="app" @click="globalEvent" style="height: 100%;">
    <!-- <spinner-content v-show="isLoading" class="spinner" style="margin-top: 20px;"></spinner-content> -->
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "pc-chat",
  computed: {
    // ...mapGetters(["loading"])
  },
  data() {
    return {
      isLoading: this.$store.state.loading
    }
  },
  created() {
    this.SET_CHATTYPE({
      chatType: 1
    });
    this.SET_GROUPINFO({
      groupInfoShow: false
    });
    this.SET_PRIVATEINFO({
      privateInfoShow: false
    });
    this.SET_SESSIONINFO({
      sessionInfoShow: true
    });
  },
  methods: {
    globalEvent() {
      // 聊天表情包关闭
      this.SET_FACEIMG({
        faceImgShow: false
      });
    },
    ...mapMutations({
      SET_FACEIMG: "SET_FACEIMG",
      SET_CHATTYPE: "SET_CHATTYPE",
      SET_GROUPINFO: "SET_GROUPINFO",
      SET_SESSIONINFO: "SET_SESSIONINFO",
      SET_PRIVATEINFO: "SET_PRIVATEINFO"
    })
  }
};
</script>

<style>
/* CSS */
</style>
