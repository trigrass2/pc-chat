const CARDID_MATCH = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
const PHONE_MATCH = /^[1][3,4,5,7,8][0-9]{9}$/
export const REFRESH = 1
export const UPDATE = 2
export const LOADING = 3
export const DEFAULT = 4
export const faceImgMap = [
  '[微笑]',
  '[伤心]',
  '[美女]',
  '[发呆]',
  '[墨镜]',
  '[流泪]',
  '[羞]',
  '[哑]',
  '[睡]',
  '[哭]',
  '[囧]',
  '[怒]',
  '[调皮]',
  '[呲牙]',
  '[惊讶]',
  '[难过]',
  '[酷]',
  '[冷汗]',
  '[抓狂]',
  '[吐]',
  '[笑]',
  '[快乐]',
  '[奇]',
  '[傲]',
  '[饿]',
  '[困]',
  '[惊恐]',
  '[流汗]',
  '[高兴]',
  '[闲]',
  '[努力]',
  '[骂]',
  '[疑问]',
  '[秘密]',
  '[乱]',
  '[疯]',
  '[哀]',
  '[鬼]',
  '[打击]',
  '[bye]',
  '[汗]',
  '[抠]',
  '[鼓掌]',
  '[糟糕]',
  '[恶搞]',
  '[左哼哼]',
  '[右哼哼]',
  '[累]',
  '[鄙视]',
  '[委屈]',
  '[快哭]',
  '[坏]',
  '[亲]',
  '[吓]',
  '[可怜]',
  '[刀]',
  '[水果]',
  '[酒]',
  '[篮球]',
  '[乒乓]',
  '[咖啡]',
  '[美食]',
  '[动物]',
  '[鲜花]',
  '[枯]',
  '[唇]',
  '[爱]',
  '[分手]',
  '[生日]',
  '[电]'
]

export function phoneValidate(phoneNumber) {
  if (PHONE_MATCH.test(phoneNumber)) {
    return true
  } else {
    return false
  }
}

export function cardIdValidate(cardId) {
  if (CARDID_MATCH.test(cardId)) {
    return true
  } else {
    return false
  }
}

export function copy(data) {
  let copyData = JSON.stringify(data)
  copyData = JSON.parse(copyData)
  return copyData
}

export function copy2(obj1) {
  var obj2 = Array.isArray(obj1) ? [] : {}
  if (obj1 && typeof obj1 === 'object') {
    for (var i in obj1) {
      var prop = obj1[i] // 避免相互引用造成死循环，如obj1.a=obj
      if (prop == obj1) {
        continue
      }
      if (obj1.hasOwnProperty(i)) {
        // 如果子属性为引用数据类型，递归复制
        if (prop && typeof prop === 'object') {
          obj2[i] = copy2(prop) // 递归调用
        } else {
          // 如果是基本数据类型，只是简单的复制
          obj2[i] = prop
        }
      }
    }
  }
  return obj2
}

// location.search转对象
export function urlSearchToOb(str) {
  if (str === '') return
  str = str.substr(1)
  let arr = str.split()
  let obj = {}
  let newArr = []
  arr.map(function(value, index, arr) {
    newArr = value.split('=')
    if (newArr[0] !== undefined) {
      obj[newArr[0]] = newArr[1]
    }
  })
  return obj
}
// 截流函数 函数柯里化
export function debounce(func, delay) {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
// 年月日格式转换 yyyy-MM-dd-hh-mm-ss
export function formatDate(time, fmt) {
  var date = new Date(time)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str)
      )
    }
  }
  return fmt
}
function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

// 判断字符串是否是json字符串
export function isJson(str) {
  if (typeof str === 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
