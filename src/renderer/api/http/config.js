import qs from 'qs'
import { formatDate } from 'common/js/util.js'
import md5 from 'md5'
import CryptoJS from '../crypto'

export const formData = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  transformRequest: [
    data => {
      return qs.stringify(data)
    }
  ]
}
export const url = '/api/service.do'
export const commonParams = {
  version: '1.0.0', // 版本号
  channel: '100001', // 渠道
  terminal: 'PC', // 终端
  transNumber: uuid(32, 16) // 交易编号
}

/**
 * 生成UUID
 * @param len 长度
 * @param radix 基数 2进制 8进制 10进制 16进制
 * @returns uuid
 * 调用：var uuidstr = uuid(32,16);//生成32位长度的基数为16进制的uuid
 *  7FEA14A4722E273EE28C3F72E9E9141F
 */
export function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
    ''
  )
  var uuid = []
  var i
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    var r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

/** 请求内容封装
 *
 * @param {*Object/接口参数} data
 * @param {*String/区别接口交易码} code
 * @param {*Array/参数中需要加密的字段} cryptNames
 */
export function request(data, code, cryptNames) {
  data = JSON.parse(JSON.stringify(data))
  // 选择内容加密
  if (cryptNames) {
    cryptNames.forEach((e, i, arr) => {
      data[e] = CryptoJS.encryption(data[e])
    })
  }
  // 加密报文
  const body = CryptoJS.encryption(data)
  // 签名
  const sign = md5(body)
  const newData = Object.assign({}, commonParams, {
    transCode: code, // 交易码
    body: body,
    sign: sign,
    requestTime: formatDate(Date.now(), 'yyMMddhhmmss')
  })
  return newData
}
