import * as types from './mutation-types'
import storage from './storage'

const mutations = {
  // 当前登录用户信息
  [types.SET_USERINFO](state, data) {
    state.userInfo = data.userInfo
    storage.setLocalItem('userInfo', data.userInfo)
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
  [types.SET_SESSIONMSG](state, data) {
    state.sessionMsgList = data.sessionMsgList
    // storage.setItem('messageList', data.messageList)
  },
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
  }
}
export default mutations
