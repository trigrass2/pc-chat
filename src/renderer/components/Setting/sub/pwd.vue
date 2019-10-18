<template>
  <div class="wrap">
    <div class="row">
      <span>原密码：</span>
      <input v-model="pwd" type="password" placeholder="请输入原密码" />
    </div>
    <div class="row">
      <span>新密码：</span>
      <input v-model="newPwd" type="pwd" placeholder="请输入新密码" />
    </div>
    <div class="row">
      <span>重复新密码：</span>
      <input v-model="rePwd" type="pwd" placeholder="请再次输入新密码" />
    </div>
		<div class="error">{{error}}</div>
		<div class="submit">提交</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {
        pwd: "",
        newPwd: "",
        rePwd: ""
			},
			// 错误信息
			error: '1111'
    };
  },

  computed: {},

  methods: {}
};
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap{
	display: block!important;
	margin-left: 50px;
	.row{
		margin-top: 10px;
		span{
			display: inline-block;
			text-align: right;
			font-size: 16px;
			margin-right: 6px;
			width: 100px;
		}
		input{
			width: 200px;
			height: 40px;
			border: 1px solid $border;
			padding-left: 10px;
			color: 14px;
		}
	}
	.error{
		color: $red;
		margin: 15px auto;
		text-align: center;
		font-size: 14px;
	}
	.submit{
		width: 180px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    margin: 0 auto;
    font-weight: bold;
    color: #fff;
    background-color: $red;
    border-radius: 4px;
    font-size: 16px;
	}
}
</style>
