import axios from 'axios'
import { formData } from './config'
import { uuid } from './config'
import store from '../../store'
let userid = store.state.sUserInfo.userid

// 会话列表
export function sessionList(data) {
  const url = '/webkx/api/loadCurrentSessionList.php'
  const reqData = {
    userid: userid,
    status: 1 // 1结束/0未结束
  }
  
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 通过ip查取地区
export function ip2area(data) {
  const url = '/webkx/api/ip.php'
  const reqData = {
    userid: userid,
    ip: data.ip
  }
  
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 真实信息查询
export function realInfo(data) {
  const url = '/webkx/api/loadRealInfo.php'
  const reqData = {
    userid: userid,
    custid: data.custid
  }
  
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 会话聊天记录
export function sessionChatList(data) {
  const url = '/webkx/api/loadChatHis.php'
  const reqData = {
    userid: userid,
    // exportall: '',
    // keyword: '',
    page: data.page
    // starttime: '',
    // endtime: '',
    // scope: '',
    // msgtype: '',
  }
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 重置密码
export function changePsd(data) {
  const url = '/webkx/api/changePassword.php'
  const reqData = {
    userid: userid,
    password: data.password,
    newpassword: data.newpassword
  }
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 获取我的KPI
export function myKpi() {
  const url = '/webkx/api/loadMyKPI.php'
  const reqData = {
    userid: userid
  }
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 上传头像
export function changeHead(data) {
  const url = '/webkx/api/changeHead.php'
  const reqData = {
    userid: userid,
    headurl: data.url
  }
  console.log('上传头像', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 搜索聊天记录-返回历史列表
export function historyList(data) {
  const url = '/webkx/api/loadHistorySessionOrTeam.php'
  const reqData = {
    userid: userid,
    keyword: data.keywords
  }
  console.log('搜索聊天记录-返回会话/群列表', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 搜索聊天记录-返回会话消息内容
export function sessionHistory(data) {
  const url = '/webkx/api/loadSessionHistoryDetail.php'
  const reqData = Object.assign(data, {userid: userid})
  console.log('搜索聊天记录-返回会话消息内容', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 搜索聊天记录-返回群消息内容
export function teamHistory(data) {
  const url = '/webkx/api/loadTeamHistoryDetail.php'
  const reqData = Object.assign(data, {userid: userid})
  console.log('搜索聊天记录-返回群消息内容', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 搜索聊天记录-返回同伴消息内容
export function friendHistory(data) {
  const url = '/webkx/api/loadFriendHistoryDetail.php'
  const reqData = Object.assign(data, {userid: userid})
  console.log('搜索聊天记录-返回同伴消息内容', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 搜索聊天记录-返回私聊消息内容
export function privateHistory(data) {
  const url = '/webkx/api/loadPrivateHistoryDetail.php'
  const reqData = Object.assign(data, {userid: userid})
  console.log('搜索聊天记录-返回私聊消息内容', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 客服今日接待人数/排行
export function sessionRank(data) {
  const url = '/webkx/api/loadSessionTops.php'
  const reqData = data ? Object.assign(data, {userid: userid}) : {userid: userid}
  console.log('客服今日接待人数/排行', reqData)
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}





