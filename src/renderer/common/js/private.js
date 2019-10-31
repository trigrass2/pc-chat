import { formatDate } from './util.js'

// 私聊
export default class Private {
  constructor(privat) {
    this.name = privat.name // 消息发送者姓名
    this.headUrl = privat.headUrl // 消息发送者头像
    this.timeline = formatDate(privat.timeline, 'hh:mm:ss') // 消息发送时间
    this.id = privat.id // 消息发送者用户编号
    this.isSelected = privat.isSelected || false // 是否选中
    this.messageList = [] // 私聊聊天内容
    this.lastMsgTime =  formatDate(privat.timeline, 'hh:mm:ss')  // 最新消息时间
    this.unReadInfo = {
      myMsgNum: null,  // 我在该私聊发送的消息数量
      allUnReadNum: null,  // 心跳轮询返回的消息数量
      showUnReadNum: null  // 真实展示的消息数量, allUnReadNum-myMsgNum
    }
  }
}
