<template>
  <div class="wrap">
    <div class="row">
			<span>今日接待：</span>
			<span class="number">1</span>
		</div>
		<div class="row">
			<span>本月接待：</span>
			<span class="number">1</span>
		</div>
		<div class="row">
			<span>总计接待：</span>
			<span class="number">121</span>
		</div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  methods: {}
};
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap{
	display: block !important;
	margin-left: 80px;
	.row{
		margin-top: 15px;
		span{
			display: inline-block;
			width: 100px;
			text-align: right;
		}
		.number{
			width: 100px;
			height: 40px;
			line-height: 40px;
			text-align: center;
			font-size: 16px;
			box-shadow: 0 0 5px rgba(0,0,0,.3);
			background-color: $blank;
		}
	}
}
</style>
