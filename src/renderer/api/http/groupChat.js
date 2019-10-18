import { request, url } from 'api/http/config'
import axios from 'axios'
import { formData } from './config'

// 接口方法映射
const _groupApi = {}

// api接口名和接口交易码映射
const groupApiData = {
  gInfo: '110001', // 查询群信息
  gChatList: '110002', // 我的群列表
  gCanJoin: '110003', // 可加入的群列表
  gMembers: '110004', // 群成员列表
  gMsgHistory: '110005', // 查询群历史消息
  gPrivateMsg: '110006', // 群内单聊记录
  gUserInfo: '110007', // 用户信息
  gGoPrivateMsg: '120008', // 发送私聊消息
  gQuit: '140009', // 退出群
  gLastMsg: '110010', // 最新消息列表
  gGoMsg: '120011', // 发送群消息
  gJoin: '120012', // 加群
  gMsgRecall: '140013', // 群消息撤回/取消撤回
  gPrivateMsgRecall: '140014', // 私聊消息撤回
  gHertBeat: '180015', // 心跳长轮询
  gMsgDelete: '440016', // 群消息删除/取消删除
  gNoSpeak: '440017', // 群成员禁言/取消禁言
  gNoReadMsgNumber: '110018', // 未读群消息数量查询
  gNoReadPMsgNumber: '110019', // 未读私聊消息数量查询
  login: '480020', // 登录
  getSession: '180021', // 获取session信息
  gApplyJoin: '120022' // 申请加群
}

// 增加接口方法
function addGroupApi() {
  for (let key in groupApiData) {
    let val = groupApiData[key]
    _groupApi[key] = function(data) {
      if (key === 'login') {
        var reqData = request(data, val, ['password'])
      } else {
        var reqData = request(data, val)
      }
      return axios.post(url, reqData).then(res => {
        return Promise.resolve(res)
      })
    }
  }
}
addGroupApi()

export const GROUPAPI = _groupApi

export function imgUploader(file) {
    // const url = '/webkx/file/uploadImage.php'
    const url = '/webkx/file/uploadBase64Image.php?isAjax=' + Math.random()
    // console.log('图片文件', file)
    let _data = {
        base64: file
    }
    return axios.post(url, _data, formData).then((res) => {
      return Promise.resolve(res)
    })
}

// 登录
// export function login(data) {
//   const reqData = request(data, '480020', ['password'])
//   return axios.post(url, reqData).then(res => {
//     return Promise.resolve(res)
//   })
// }
// export function groupInfo(data) {
//     const reqData = request(data, '110001')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 我的群列表
// export function groupChatList(data) {
//   const reqData = request(data, '110002')
//   return axios.post(url, reqData).then((res) => {
//     return Promise.resolve(res)
//   })
// }

// 可加入的群列表
// export function groupCanJoin(data) {
//     const reqData = request(data, '110003')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 群成员列表
// export function groupMembers(data) {
//     const reqData = request(data, '110004')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 查询群历史消息
// export function groupMsgHistory(data) {
//     const reqData = request(data, '110005')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 群内单聊记录
// export function groupPrivateMsg(data) {
//     const reqData = request(data, '110006')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 用户信息
// export function groupUserInfo(data) {
//     const reqData = request(data, '110007')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 发送私聊消息
// export function groupGoPrivateMsg(data) {
//     const reqData = request(data, '110008')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }

// 退出群

// 未读群消息
// export function groupNoReadMsg(data) {
//     const reqData = request(data, '110018')
//     return axios.post(url, reqData).then((res) => {
//       return Promise.resolve(res)
//     })
// }
