import { formatDate } from './util.js'

export default class Friend {
  constructor(message) {
    this.userid = message.userid                    // 同伴id
    this.nickname = message.nickname                // 同伴昵称
    this.headurl = message.headurl                  // 同伴头像 
    this.unReadNum = 0                              // 未读消息数量
    this.updatetime = formatDate(Date.now(), 'hh:mm:ss')    // 发送时间/hh:mm:ss
    this.timeline = Date.now()                              // 发送消息时间/毫秒
    this.messageList = []                                   // 消息列表
  }
}
