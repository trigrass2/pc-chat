<template>
  <div class="wrap">
    <div class="row">
      <span>今日接待：</span>
      <span class="number">{{today}}</span>
    </div>
    <div class="row">
      <span>本月接待：</span>
      <span class="number">{{month}}</span>
    </div>
    <div class="row">
      <span>总计接待：</span>
      <span class="number">{{total}}</span>
    </div>
  </div>
</template>

<script>
import { myKpi } from 'api/http/sessionChat'

export default {
  data() {
    return {
      today: '',
      month: '',
      total: ''
    }
  },
  created() {
    // 加载我的kpi
    this.loadMyKpi()
  },
  methods: {
    // 加载我的kpi
    loadMyKpi() {
      myKpi().then(res => {
        if (res.data.returncode == '0') {
          this.today = res.data.today
          this.month = res.data.month
          this.total = res.data.total
        } else {
          alert(data.returnmsg)
        }
      })
    }
  }
}
</script>
<style lang='scss' scoped rel="stylesheet/scss">
.wrap {
  display: block !important;
  margin-left: 80px;
  .row {
    margin-top: 15px;
    span {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
    .number {
      width: 100px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      font-size: 16px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      background-color: $blank;
    }
  }
}
</style>
