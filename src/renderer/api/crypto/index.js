import CryptoJS from 'crypto-js'
import { Base64 } from 'js-base64'
// 加密密钥
var KEY = 'c5rconecscyn6ywx'
// 加密向量
var IV = '8070605040302010'

// AES对称加密 无base64加密
export default {
  // 加密
  /**
   * @param {*需要加密的字符串 注：对象转化为json字符串再加密} word
   * @param {*aes加密需要的key值，这个key值后端同学会告诉你} keyStr
   */
  encryption(word) {
    if (typeof word === 'object') {
      word = JSON.stringify(word)
    }
    var key = CryptoJS.enc.Utf8.parse(KEY) // 秘钥
    var iv = CryptoJS.enc.Utf8.parse(IV) // 向量
    var srcs = CryptoJS.enc.Utf8.parse(word)
    // 加密模式为ECB，补码方式为PKCS5Padding（也就是PKCS7）
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC
      // padding: CryptoJS.pad.Pkcs7
    })
    var encryptedStr = encrypted.ciphertext.toString()
    // base64加密()
    var encryptedBase64Str = Base64.encode(encryptedStr)
    return encryptedBase64Str.toString()
  },
  // 解密
  decrypt(word) {
    // base64解密
    var srcs = Base64.decode(word)
    srcs = CryptoJS.enc.Hex.parse(srcs);
    // CryptoJS的base64方法和Base64方法不同
    srcs = CryptoJS.enc.Base64.stringify(srcs);
    var key = CryptoJS.enc.Utf8.parse(KEY) // 秘钥
    var iv = CryptoJS.enc.Utf8.parse(IV) // 向量
    var decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC
    })
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return decryptedStr.toString()
  }
}
// 再要使用的vue文件里调用
// import Crypto from '@/crypto/index.js'
// console.log(Crypto.encryption('123456'))
