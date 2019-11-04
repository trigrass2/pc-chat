import { formatDate } from './util.js'

// 会话
export default class Session {
  constructor(session) {
    this.sesid = session.sesid || '' // 会话id
    this.terminal = session.terminal || '' // 终端类型
    this.lv = session.lv || '' // vip等级
    this.category = session.category || '' // 服务类别
    this.guestsid = session.guestsid || '' // 客户id
    this.customerid = session.customerid || '' // 客服id
    this.isSelected = false    // 是否被选中
    this.nickname = session.nickname || '' // 客户昵称
    this.headurl = session.headurl // 客户头像
    this.timeline = session.lastmsgtime || Date.now() // 最新消息时间/毫秒
    this.updatetime = formatDate(Number(this.timeline), 'hh:mm:ss') // 最新消息时间/HH:mm:ss格式
    this.unReadNum = session.unReadNum || 0 // 未读消息数
    this.status = session.status // 会话状态(0未结束/1已结束)
    this.messageList = null // 会话消息列表
    this.realinfo = session.realinfo || null // 客户真实信息
    this.currMsgPage = 1 // 当前会话消息页数
    this.sesorigin = session.sesorigin || null // ??
    this.messageList = session.messageList || []
    // this.hisdata = session.hisdata || null  // 请求历史消息用的
    // this.lastmessage = (status == 1 ? '会话已结束' : '')
  }
}
