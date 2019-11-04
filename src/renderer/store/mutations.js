import * as types from './mutation-types'
import storage from './storage'

const mutations = {
  // 群聊当前登录用户信息
  // loading (state, payload) {
  //   state.loading = payload.loading
  // },
  // 登录session权限
  // [types.SET_SESSION](state, data) {
  //   state.session = data.session
  //   storage.setSessionItem('session', data.session)
  // },
  // 群聊当前登录用户信息
  [types.SET_GUSERINFO](state, data) {
    state.gUserInfo = data.gUserInfo
    storage.setLocalItem('gUserInfo', data.gUserInfo)
  },
  // 会话当前登录用户信息
  [types.SET_SUSERINFO](state, data) {
    state.sUserInfo = data.sUserInfo
    storage.setLocalItem('sUserInfo', data.sUserInfo)
  },
  // 用户名列表
  [types.SET_USERLIST](state, data) {
    state.userList = data.userList
    storage.setLocalItem('userList', data.userList)
  },
  // 记住登录密码
  [types.SET_REMEMBERPSW](state, data) {
    state.rememberPsw = data.rememberPsw
    storage.setLocalItem('rememberPsw', data.rememberPsw)
  },
  // 登录密码
  [types.SET_LOGINPSW](state, data) {
    state.loginPsw = data.loginPsw
    storage.setLocalItem('loginPsw', data.loginPsw)
  },
  // 聊天类型
  [types.SET_CHATTYPE](state, data) {
    state.chatType = data.chatType
    storage.setSessionItem('chatType', data.chatType)
  },
  // 群成员列表
  [types.SET_MEMBERLIST](state, data) {
    state.memberList = data.memberList
  },
  // 会话图片预览列表——新增
  [types.SET_ADDSESSIONIMG](state, data) {
    state.sessionImg.push(data.sessionImg)
  },
  // 群聊图片预览列表——新增
  [types.SET_ADDGROUPIMG](state, data) {
    state.groupImg.push(data.groupImg)
  },
  // 私聊图片预览列表——新增
  [types.SET_ADDPRIVATEIMG](state, data) {
    state.privateImg.push(data.privateImg)
  },
  // 会话图片预览列表——编辑
  [types.SET_EDITSESSIONIMG](state, data) {
    state.sessionImg.splice(data.index, 1, data.sessionImg)
  },
  // 群聊图片预览列表——编辑
  [types.SET_EDITGROUPIMG](state, data) {
    state.groupImg.splice(data.index, 1, data.groupImg)
  },
  // 私聊图片预览列表——编辑
  [types.SET_EDITPRIVATEIMG](state, data) {
    state.privateImg.splice(data.index, 1, data.privateImg)
  },
  // 聊天表情包显示
  [types.SET_FACEIMG](state, data) {
    state.faceImgShow = data.faceImgShow
    storage.setSessionItem('faceImgShow', data.faceImgShow)
  },
  // 图文显示
  [types.SET_MATERIAL](state, data) {
    state.materialShow = data.materialShow
    storage.setSessionItem('materialShow', data.materialShow)
  },
  // 修改群成员列表
  [types.SET_EDITMEMBER](state, data) {
    state.memberList.splice(data.index, 1, data.member)
  },
  // 删除群成员列表
  [types.SET_DELETEMEMBER](state, data) {
    state.memberList.splice(data.index, 1)
  },
  // 右边信息栏显隐
  [types.SET_RIGHTSHOW](state, data) {
    state.conRightShow = data.conRightShow
    storage.setSessionItem('conRightShow', data.conRightShow)
  },
  // 群聊右边信息栏显隐
  [types.SET_GROUPINFO](state, data) {
    state.groupInfoShow = data.groupInfoShow
    storage.setSessionItem('groupInfoShow', data.groupInfoShow)
  },
  // 会话右边信息栏显隐
  [types.SET_SESSIONINFO](state, data) {
    state.sessionInfoShow = data.sessionInfoShow
    storage.setSessionItem('sessionInfoShow', data.sessionInfoShow)
  },
  // 私聊右边信息栏显隐
  [types.SET_PRIVATEINFO](state, data) {
    state.privateInfoShow = data.privateInfoShow
    storage.setSessionItem('privateInfoShow', data.privateInfoShow)
  },
  // 截图图片信息
  [types.SET_CAPTUREIMG](state, data) {
    state.captureImg = data.captureImg
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话对象信息——真实信息
  [types.SET_SESREALINFO](state, data) {
    state.sessionInfo.realinfo = data.realinfo
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话对象信息——当前会话消息列表
  [types.SET_SESMSGLIST](state, data) {
    state.sessionInfo.messageList = data.messageList
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话对象信息——消息页数
  [types.SET_SESMSGPAGE](state, data) {
    state.sessionInfo.currHistoryPage = data.currHistoryPage
    // storage.setItem('captureImg', data.captureImg)
  },
  // 是否锁住发送消息按钮 
  [types.SET_LOCKTEXT](state, data) {
    state.lockText = data.lockText
    // storage.setItem('captureImg', data.captureImg)
  },
  // 私聊列表——整体修改
  [types.SET_PRIVATELIST](state, data) {
    state.privateList = data.privateList
    // storage.setItem('captureImg', data.captureImg)
  },
  // 私聊列表——修改某个私聊
  [types.SET_EDITPRIVATE](state, data) {
    state.privateList.splice(data.index, 1, data.private)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 私聊列表——新增某个私聊
  [types.SET_ADDPRIVATE](state, data) {
    state.privateList.push(data.private)
    // storage.setItem('captureImg', data.captureImg)
  },
  // @me列表——整体修改
  // [types.SET_ATMELIST](state, data) {
  //   state.atMeList = data.atMeList
  //   // storage.setItem('captureImg', data.captureImg)
  // },
  // // @me列表——修改某个atMe
  // [types.SET_EDITATME](state, data) {
  //   state.atMeList.splice(data.index, 1, data.atMe)
  //   // storage.setItem('captureImg', data.captureImg)
  // },
  // @me列表——新增某个atMe
  [types.SET_ADDATME](state, data) {
    state.atMeList.push(data.atMe)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 群聊列表——整体修改
  [types.SET_GROUPLIST](state, data) {
    state.groupList = data.groupList
    // storage.setItem('captureImg', data.captureImg)
  },
  // 群聊列表——修改某个群聊
  [types.SET_EDITGROUP](state, data) {
    state.groupList.splice(data.index, 1, data.group)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 群聊列表——新增某个群聊
  [types.SET_ADDGROUP](state, data) {
    state.groupList.push(data.group)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话列表——整体修改
  [types.SET_SESSIONLIST](state, data) {
    state.sessionList = data.sessionList
    state.sessionList = state.sessionList.sort((a, b) => {
      return b.timeline - a.timeline
    })
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话列表——修改某个会话
  [types.SET_EDITSESSION](state, data) {
    state.sessionList.splice(data.index, 1, data.session)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话列表——新增某个会话
  [types.SET_ADDSESSION](state, data) {
    state.sessionList.push(data.session)
    state.sessionList = state.sessionList.sort((a, b) => {
      return b.timeline - a.timeline
    })
    // storage.setItem('captureImg', data.captureImg)
  },
  // 同伴列表——整体修改
  [types.SET_FRIENDLIST](state, data) {
    state.friendList = data.friendList
    // storage.setItem('captureImg', data.captureImg)
  },
  // 同伴列表——修改某个同伴
  [types.SET_EDITFRIEND](state, data) {
    state.friendList.splice(data.index, 1, data.friend)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 同伴列表——新增某个同伴
  [types.SET_ADDFRIEND](state, data) {
    state.friendList.push(data.friend)
    // storage.setItem('captureImg', data.captureImg)
  },
  // 新增某个消息——发送的消息列表
  [types.SET_ADDSENDMSG](state, data) {
    state.sendMsgList.push(data.sendMsg)
  },
  // 编辑某个消息——发送的消息列表
  [types.SET_EDITSENDMSG](state, data) {
    state.sendMsgList.splice(data.index, 1, data.sendMsg)
  },
  // 删除某个消息——发送的消息列表
  [types.SET_DELETESENDMSG](state, data) {
    state.sendMsgList.splice(data.index, 1)
  }
}
export default mutations
