import axios from 'axios'
import { formData } from './config'

// 同伴列表
export function friendList(data) {
  const url = '/webkx/api/getcontacts.php'
  const reqData = {
    userid: data.userid
  }
  
  return axios.post(url, reqData, formData).then(res => {
    return Promise.resolve(res)
  })
}

// 通过ip查取地区
export function ip2area(data) {
  const url = '/webkx/api/ip.php'
  const reqData = {
    userid: data.userid,
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
    userid: data.userid,
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
    userid: data.userid,
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