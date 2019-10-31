import { formatDate } from './util.js'

// 群聊
export default class Group {
  constructor(group) {
    this.teamid = group.teamid  // 群id
    this.teamname = group.teamname  // 群名称
    this.headurl = group.headurl    // 群头像
    this.teamTypeName = group.teamTypeName  // 群类型
    this.memberCount = group.memberCount   // 群成员数
    this.createDate = group.createDate  // 群创建时间
    this.isSelected = false    // 是否被选中
    this.messageList = [] // 群聊天内容
    this.lastMsgTime =  formatDate(group.timeline, 'yyyy-MM-dd')  // 最新消息时间
    this.unReadInfo = {
      myMsgNum: null,  // 我在该群发送的消息数量
      allUnReadNum: null,  // 心跳轮询返回的消息数量
      showUnReadNum: null  // 真实展示的消息数量, allUnReadNum-myMsgNum
    }
    // this.createuser = createuser  // 创建者名称
    // this.createtime = createtime  // 群创建时间/毫秒
    // this.ownerId = ownerId  // 拥有者用户编号
    // this.status = status    // 状态:  0正常 1已删除
    // this.ttype = ttype   // VIP用户 HOBBY 兴趣群  DOING 活动群  WORK 工作群
    // this.lv = lv    // 群分级 :ttype为 USERLV 时增加群分级
    // this.joinstatus = joinstatus  // 是否列表中可见:  1显示     0 不显示
    // this.jointype = jointype  // 加入类别: 0 先加入后审核  1 先审核后加入
    // this.maxmember = maxmember  // 群内最大人数
  }
}
