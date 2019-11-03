import { formatDate } from './util.js'

export default class Friend {
  constructor(friend) {
    this.userid = friend.userid                    // 同伴id
    this.nickname = friend.nickname                // 同伴昵称
    this.headurl = friend.headurl                  // 同伴头像 
    this.isSelected = false                         // 是否被选中
    this.unReadNum = 0                              // 未读消息数量
    this.updatetime = formatDate(Date.now(), 'hh:mm:ss')    // 发送时间/hh:mm:ss
    this.timeline = Date.now()                              // 发送消息时间/毫秒
    this.messageList = []                                   // 消息列表
  }
}
