import { copy2 } from 'common/js/util.js'

export const gUserInfo = state => state.gUserInfo // 群聊登录-当前登录用户信息
export const sUserInfo = state => copy2(state.sUserInfo) // 会话登录-当前登录用户信息
export const userList = state => state.userList // 登录-账户列表
export const loginPsw = state => state.loginPsw // 登录-登录密码
export const rememberPsw = state => state.rememberPsw // 登录-是否记住密码
export const chatType = state => state.chatType // 聊天类型
export const privateList = state => state.privateList // 私聊列表
// export const sessionMsgList = state => state.sessionMsgList // 会话聊天消息列表
export const groupMsgList = state => state.groupMsgList // 群聊聊天消息列表
export const privateMsgList = state => state.privateMsgList // 私聊聊天消息列表
export const sessionImg = state => state.sessionImg // 会话聊天图片预览
export const groupImg = state => state.groupImg // 群聊聊天图片预览
export const privateImg = state => state.privateImg // 私聊聊天图片预览
export const faceImgShow = state => state.faceImgShow // 表情包显/隐藏
export const materialShow = state => state.materialShow // 图文显/隐藏
export const groupInfoShow = state => state.groupInfoShow // 群聊信息展示
export const sessionInfoShow = state => state.sessionInfoShow // 会话信息展示
export const privateInfoShow = state => state.privateInfoShow // 私聊信息展示
export const captureImg = state => state.captureImg // 截图图片信息
export const unReadPrivateMsg = state => state.unReadPrivateMsg // 长轮询——未读私聊消息
export const unReadGroupMsg = state => state.unReadGroupMsg // 长轮询——未读群聊消息
export const groupOperate = state => state.groupOperate // 长轮询——群操作
export const sessionInfo = state => state.sessionInfo // 会话对象信息
export const sessionMsgList = state => (state.sessionInfo && state.sessionInfo.messageList) || null // 会话对象消息
export const lockText = state => state.lockText // 是否锁住发送消息按钮
export const sessionList = state => {
  if (state.sessionList) {
    let list = copy2(state.sessionList).sort((a, b) => {
      return b.timeline - a.timeline
    })
    return list 
  } else {
    return null
  }
} // 会话列表(时间排序)
export const friendList = state => copy2(state.friendList) || null // 同伴列表
