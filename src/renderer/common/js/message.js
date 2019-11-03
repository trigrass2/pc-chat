import { formatDate } from './util.js'

export class SessionMessage {
  constructor(message) {
    this.mediatype = message.mediatype          // 消息内容类型(0、1文本表情/3图片)
    this.msgbody = message.msgbody              // 消息内容
    this.headurl = message.fromheadurl          // 头像
    this.timeline = message.timeline || Date.now()            // 发送时间/毫秒
    this.isMine = message.isMine || ''          // 发送者是否本人客服
    this.sendTime = formatDate(this.timeline, 'hh:mm:ss')    // 发送时间/hh:mm:ss
    this.msgid = message.msgid                                  // 消息id
    this.recall = String(message.recall) || 'false'             // 是否撤回
  }
}

export class FriendMessage {
  constructor(message) {
    this.fromid = message.fromid
    this.mediatype = message.mediatype          // 消息内容类型(0、1文本表情/3图片)
    this.msgbody = message.msgbody              // 消息内容
    this.headurl = message.fromheadurl          // 头像
    this.timeline = message.timeline || Date.now()            // 发送时间/毫秒
    this.sendTime = formatDate(this.timeline, 'hh:mm:ss')    // 发送时间/hh:mm:ss
    this.msgid = message.msgid                                  // 消息id
    this.recall = String(message.recall) || 'false'             // 是否撤回
  }
}
