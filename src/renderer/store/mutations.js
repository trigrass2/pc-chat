import * as types from './mutation-types'
import storage from './storage'

const mutations = {
  // 群聊当前登录用户信息
  // loading (state, payload) {
  //   state.loading = payload.loading
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
  // 长轮询——未读私聊消息
  [types.SET_UNREADPMSG](state, data) {
    state.unReadPrivateMsg = data.unReadPrivateMsg
    // storage.setLocalItem('unReadPrivateMsg', data.unReadPrivateMsg)
  },
  // 长轮询——未读群聊消息
  [types.SET_UNREADGMSG](state, data) {
    state.unReadGroupMsg = data.unReadGroupMsg
    // storage.setLocalItem('unReadPrivateMsg', data.unReadPrivateMsg)
  },
  // 长轮询——群操作
  [types.SET_GOPERATE](state, data) {
    state.groupOperate = data.groupOperate
    // storage.setLocalItem('unReadPrivateMsg', data.unReadPrivateMsg)
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
  // 私聊列表
  [types.SET_PRIVATELIST](state, data) {
    state.privateList = data.privateList
    // storage.setSessionItem('chatType', data.chatType)
  },
  // 会话消息列表
  // [types.SET_SESSIONMSG](state, data) {
  //   state.sessionMsgList = data.sessionMsgList
  //   // storage.setItem('messageList', data.messageList)
  // },
  // 群聊消息列表
  [types.SET_GROUPMSG](state, data) {
    state.groupMsgList = data.groupMsgList
    // storage.setItem('messageList', data.messageList)
  },
  // 私聊消息列表
  [types.SET_PRIVATEMSG](state, data) {
    state.privateMsgList = data.privateMsgList
    // storage.setItem('messageList', data.messageList)
  },
  // 会话图片预览列表
  [types.SET_SESSIONIMG](state, data) {
    state.sessionImg = data.sessionImg
    // storage.setItem('messageList', data.messageList)
  },
  // 群聊图片预览列表
  [types.SET_GROUPIMG](state, data) {
    state.groupImg = data.groupImg
    // storage.setItem('messageList', data.messageList)
  },
  // 私聊图片预览列表
  [types.SET_PRIVATEIMG](state, data) {
    state.privateImg = data.privateImg
    // storage.setItem('messageList', data.messageList)
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
  // 会话右边信息栏显隐
  [types.SET_PRIVATEINFO](state, data) {
    state.privateInfoShow = data.privateInfoShow
    storage.setSessionItem('privateInfoShow', data.privateInfoShow)
  },
  // 截图图片信息
  [types.SET_CAPTUREIMG](state, data) {
    state.captureImg = data.captureImg
    // storage.setItem('captureImg', data.captureImg)
  },
  // 会话对象信息
  [types.SET_SESINFO](state, data) {
    state.sessionInfo = data.sessionInfo
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
  // 会话列表——整体修改
  [types.SET_SESSIONLIST](state, data) {
    state.sessionList = data.sessionList
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
  }
}
export default mutations
