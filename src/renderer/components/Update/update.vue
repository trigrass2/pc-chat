<template>
  <div>
    <ul class="content">
      <li v-for="(item, index) in contentList" :key="item.id">
        <p class="time">{{item.date}}</p>
        <p class="text">{{item.content}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "update",
  data() {
    return {
      contentList: [
        {
          id: 1,
          date: "2016.1.1",
          content:
            "撒打算的撒的撒阿斯顿是啊阿三开大火将阿斯顿黑科技啊啥的空间啊刷空间将卡上的空间撒谎就快点哈开始觉得很愧疚啊是艰苦的环境卡圣诞节啊数据看阿贾克斯队好困睡觉阿海科技大厦科技活动"
        },
        {
          id: 2,
          date: "2016.1.1",
          content:
            "撒打算的撒的撒阿斯顿是啊阿三开大火将阿斯顿黑科技啊啥的空间啊刷空间将卡上的空间撒谎就快点哈开始觉得很愧疚啊是艰苦的环境卡圣诞节啊数据看阿贾克斯队好困睡觉阿海科技大厦科技活动"
        },
        {
          id: 3,
          date: "2016.1.1",
          content:
            "撒打算的撒的撒阿斯顿是啊阿三开大火将阿斯顿黑科技啊啥的空间啊刷空间将卡上的空间撒谎就快点哈开始觉得很愧疚啊是艰苦的环境卡圣诞节啊数据看阿贾克斯队好困睡觉阿海科技大厦科技活动"
        }
      ]
    };
  }
};
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.content {
    padding-left: 30px;
    padding-right: 30px;
    li{
        background-color:$blank;
        padding: 20px;
        margin-bottom: 30px;
        border: 1px solid #e5e5e5;
        box-shadow: 0 0 3px rgba(0,0,0,.3);
        border-radius: 4px;
        .time{
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        .text{
            font-size: 12px;
        }
    }
}
</style>
