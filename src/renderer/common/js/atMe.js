import { uuid } from 'api/http/config'
export default class AtMe {
  constructor(atMe) {
    this.groupId = atMe.groupId     // 群id
    this.userId = atMe.userId        // 发送者id
    this.groupName = atMe.groupName    // 群名
    this.userName = atMe.userName   // 用户名
    this.sendTime = atMe.sendTime   // 发送时间
    this.id = uuid(8, 16)
  }
}
