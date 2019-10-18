import { copy, faceImgMap } from 'common/js/util'

// 消息数据处理
export function msgDataHandler(data) {
  console.log('消息数据处理', data)
  var newMsg = copy(data)
  // 文本表情——表情字符串替换为图片img节点
  if (newMsg.mediatype === 1 || newMsg.mediatype === 0) {
    var regex = /\[(.+?)\]/g
    var result
    // console.log('消息处理中——文本', newMsg)
    while ((result = regex.exec(newMsg.msgbody)) !== null) {
      //   console.log(newMsg.content)
      let imgIndex = faceImgMap.findIndex((e, i, arr) => {
        return e === result[0]
      })
      //   console.log('表情index', imgIndex)
      if (imgIndex !== -1) {
        var src = require('common/img/' + Number(imgIndex + 1) + '.png')
      }
      //   let src = result[0].substr(2, result[0].length - 3)
      //   src = require('common/img/' + src + '.png')
      let faceImgHtml = `<img src='${src}' width='15px' height='15px' style="margin-top: 4px;"></img>`
      if (newMsg.content) {
        newMsg.content = newMsg.content.replace(result[0], faceImgHtml)
      } else {
        newMsg.content = newMsg.msgbody.replace(result[0], faceImgHtml)
      }
    }
    // console.log('qwewqe', newMsg.content)
    if (!newMsg.content) {
      newMsg.content = newMsg.msgbody
    }
    // console.log('ewwwwww', newMsg.content)
    // 图片
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
    newMsg.content = `<img class='capture' src='${
      newMsg.msgbody
    }' style="background-size: contain; width: 100px; height:100px;"></img>`
  } else if (newMsg.mediatype === 5) {
    newMsg.content = '我是图文'
  }
  //   console.log('这里是处理好的消息：', newMsg.content)
  return newMsg.content
}
