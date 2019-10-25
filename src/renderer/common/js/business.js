import { copy, faceImgMap } from 'common/js/util'

// 消息数据处理
export function msgDataHandler(data) {
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
