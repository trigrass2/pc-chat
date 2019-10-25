<template>
  <div class="wrap">
    <div class="info">
      昵称：
      <span>{{sUserInfo.nickname | isNull}}</span>
    </div>
    <div class="info">
      姓名：
      <span>{{sUserInfo.realname | isNull}}</span>
    </div>
    <div class="info">
      手机：
      <span>{{sUserInfo.mobilekey | isNull}}</span>
    </div>
    <div class="info">
      邮箱：
      <span>{{sUserInfo.email | isNull }}</span>
    </div>
    <div class="info">
      分组：
      <span>{{sUserInfo.group | isNull}}</span>
    </div>
    <div class="info">
      职务：
      <span>{{sUserInfo.zw | isNull}}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  
  data() {
    return {
      info: {
        nickname: "1",
        realname: "1",
        mobilekey: "1",
        email: "1",
        group: "1",
        zw: "2"
      }
    };
  },
  computed: {
    // 用户信息
    ...mapGetters([
      'sUserInfo'
    ])
  },
  methods: {},
  filters: {
    isNull(data) {
      if (data) {
        return data;
      } else {
        return "未知";
      }
    }
  }
};
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap {
  display: block !important;
  padding-left: 80px;
  .info {
		margin-bottom: 20px;
		span{
			color: $content;
		}
  }
}
</style>
