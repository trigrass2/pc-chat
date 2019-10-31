import { copy, faceImgMap } from 'common/js/util'
import store from '../../store'

// 会话——chatType
export const SESSION_CHATTYPE = 1
// 群聊——chatType
export const GROUP_CHATTYPE = 2
// 私聊——chatType
export const PRIVATE_CHATTYPE = 3
// 同伴——chatType
export const FRIEND_CHATTYPE = 4
// 会话-进行中——tabType
export const SESSION_ING = 1
// 会话-已结束———tabType
export const SESSION_OVER = 2
// 同伴消息
export const FRIEND_MSG = 1
// 群聊消息
export const GROUP_MSG = 2
// 私聊消息
export const PRIVATE_MSG = 3
// 会话消息
export const SESSION_MSG = 5
// 消息发送状态——发送中
export const MSG_ING = 0
// 消息发送状态——发送成功
export const MSG_SUC = 1
// 消息发送状态——发送失败
export const MSG_FAI = 2

// 消息数据处理
export function msgDataHandler(data, chatType, id) {
  // console.log('消息数据处理', data)
  var newMsg = copy(data)
  // 文本表情——表情字符串替换为图片img节点
  if (newMsg.mediatype === 1 || newMsg.mediatype === 0) {
    var regex = /\[(.+?)\]/g
    var result
    // 匹配到表情对应的文字文本
    while ((result = regex.exec(newMsg.msgbody)) !== null) {
      let imgIndex = faceImgMap.findIndex((e, i, arr) => {
        return e === result[0]
      })
      // 替换表情文本为表情图片
      if (imgIndex !== -1) {
        var src = require('common/img/' + Number(imgIndex + 1) + '.png')
        let faceImgHtml = `<img src='${src}' width='15px' height='15px' style="margin-top: 4px;"></img>`
        if (newMsg.content) {
          newMsg.content = newMsg.content.replace(result[0], faceImgHtml)
        } else {
          newMsg.content = newMsg.msgbody.replace(result[0], faceImgHtml)
        }
      }
    }
    // 没有表情时，直接赋予文本内容
    if (!newMsg.content) {
      newMsg.content = newMsg.msgbody
    }
  // 图片消息——直接拼接成img标签
  } else if (newMsg.mediatype === 3) {
    // scale: Width/height
    // if (newMsg.scale) {
    //   var scale = newMsg.scale
    //   var width = 100 * scale
    // } else {
    //   width = 100
    // }
    // // width最大500px
    // if (width > 500) {
    //   width = 500
    // }
    // 图片 替换为图片img节点
    // console.log('消息处理中——图片', newMsg)
    // if (chatType == SESSION_CHATTYPE) {
    //   let isHas = store.getters.sessionImg.find((e) => {
    //     return e.id == id
    //   })
    //   // 新增图片列表
    //   if (!isHas) {
    //     let sessionImg = {
    //       'id': id,
    //       'list': []
    //     }
    //     sessionImg.list.push(newMsg.msgbody)
    //     store.commit('SET_ADDSESSIONIMG', {
    //       sessionImg: sessionImg
    //     })
    //   } else {
    //     // 新增图片
    //     let isHasImg = isHas.list.find((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     let sessionIndex = isHas.list.findIndex((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     if (!isHasImg) {
    //       isHas.list.push(newMsg.msgbody)
    //       store.commit('SET_EDITSESSIONIMG', {
    //         index: sessionIndex,
    //         sessionImg: isHas
    //       })
    //     }
    //   }
    // }
    // if (chatType == FRIEND_CHATTYPE) {
    //   let isHas = store.getters.friendImg.find((e) => {
    //     return e.id == id
    //   })
    //   // 新增图片列表
    //   if (!isHas) {
    //     let friendImg = {
    //       'id': id,
    //       'list': []
    //     }
    //     friendImg.list.push(newMsg.msgbody)
    //     store.commit('SET_ADDFRIENDIMG', {
    //       friendImg: friendImg
    //     })
    //   } else {
    //     // 新增图片
    //     let isHasImg = isHas.list.find((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     let friendIndex = isHas.list.findIndex((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     if (!isHasImg) {
    //       isHas.list.push(newMsg.msgbody)
    //       store.commit('SET_EDITFRIENDIMG', {
    //         index: friendIndex,
    //         friendImg: isHas
    //       })
    //     }
    //   }
    // }
    // if (chatType == GROUP_CHATTYPE) {
    //   console.log('进来了1')
    //   let isHas = store.getters.groupImg.find((e) => {
    //     return e.id == id
    //   })
    //   console.log(isHas)
    //   console.log('进来了2')
      // 新增图片列表
      // if (!isHas) {
      //   let groupImg = {
      //     'id': id,
      //     'list': []
      //   }
        // groupImg.list.push(newMsg.msgbody)
        // store.commit('SET_ADDGROUPIMG', {
        //   groupImg: groupImg
        // })
        // console.log('进来了3', groupImg)
      // }
      // else {
    //     console.log('进来了4')
    //     // 新增图片
    //     let isHasImg = isHas.list.find((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     let groupIndex = isHas.list.findIndex((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     console.log('进来了5')
    //     if (!isHasImg) {
    //       isHas.list.push(newMsg.msgbody)
    //       store.commit('SET_EDITGROUPIMG', {
    //         index: groupIndex,
    //         groupImg: isHas
    //       })
    //       console.log('进来了6')
    //     }
    //   }
    //   console.log(isHas)
    // }
    // if (chatType == PRIVATE_CHATTYPE) {
    //   let isHas = store.getters.privateImg.find((e) => {
    //     return e.id == id
    //   })
    //   // 新增图片列表
    //   if (!isHas) {
    //     let privateImg = {
    //       'id': id,
    //       'list': []
    //     }
    //     privateImg.list.push(newMsg.msgbody)
    //     store.commit('SET_ADDPRIVATEIMG', {
    //       privateImg: privateImg
    //     })
    //   } else {
    //     // 新增图片
    //     let isHasImg = isHas.list.find((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     let privateIndex = isHas.list.findIndex((e) => {
    //       return e == newMsg.msgbody
    //     })
    //     if (!isHasImg) {
    //       isHas.list.push(newMsg.msgbody)
    //       store.commit('SET_EDITPRIVATEIMG', {
    //         index: privateIndex,
    //         privateImg: isHas
    //       })
    //     }
    //   }
    // }
    newMsg.content = `<img class='capture' src='${newMsg.msgbody}' style="background-size: contain; width: 100px; height:100px;"></img>`
  // 图文消息——暂不支持
  } else if (newMsg.mediatype === 5) {
    newMsg.content = ''
  }
  // setTimeout(() => {
  //   this.scrollToBottom()
  // }, 20)
  //   console.log('这里是处理好的消息：', newMsg.content)
  return newMsg.content
}

// 给数组增加key(id), 便于循环
export function addId(list) {
  let id = 1
  list.forEach(e => {
    e.id = id
    id++
  })
  return list
}

// 会话常用消息
export const sessionMessage = [
  {
    id: 1,
    content: '您好，请问有什么可以帮您？'
  },
  {
    id: 2,
    content: '马上帮您查询看看，请稍等一下'
  },
  {
    id: 3,
    content: '您别着急，这里立刻帮您核实一下情况。请您耐心等待一下。'
  },
  {
    id: 4,
    content:
      '请您不要着急，我非常理解您的心情，我们一定会竭尽全力为您解决的。'
  },
  {
    id: 5,
    content: '非常感谢您这么好的建议，我们会不断改进服务，让您满意。'
  },
  {
    id: 6,
    content: '您客气了，我们该做的，请问还有其他问题可以帮到您的吗？'
  },
  {
    id: 7,
    content: '为了更好地为您服务，请对我的服务做出评价。谢谢！'
  },
  {
    id: 8,
    content: '您好，今天天气不错呀！出去爬山吗？'
  }
]
