<template>
  <div class>
    <div ref="bg" id="js-bg" class="bg"></div>
    <div ref="mask" id="js-mask" class="mask"></div>
    <canvas ref="canvas" id="js-canvas" class="image-canvas"></canvas>
    <div ref="size" id="js-size-info" class="size-info"></div>
    <div ref="toolbar" id="js-toolbar" class="toolbar">
      <div class="iconfont icon-zhongzhi" id="js-tool-reset" @click="reset"></div>
      <!-- <div class="iconfont icon-xiazai" id="js-tool-save" @click="save"></div> -->
      <div class="iconfont icon-guanbi" id="js-tool-close" @click="close"></div>
      <div class="iconfont icon-duihao" id="js-tool-ok" @click="ok"></div>
    </div>
  </div>
</template>

<script>
// import { ipcRenderer, clipboard, nativeImage, remote } from 'electron'
import { getCurrentScreen } from './util/utils'
// import { getScreenSources } from './util/desktop-capturer'
import { CaptureEditor } from './util/capture-editor'
// const fs = require('fs')

const $canvas = document.getElementById('js-canvas')
const $bg = document.getElementById('js-bg')
const $sizeInfo = document.getElementById('js-size-info')

const $toolbar = document.getElementById('js-toolbar')
const $btnClose = document.getElementById('js-tool-close')
const $btnOk = document.getElementById('js-tool-ok')
const $btnSave = document.getElementById('js-tool-save')
const $btnReset = document.getElementById('js-tool-reset')
export default {
  created() {
    // 截图声音
    this.audio = new Audio()
    this.audio.src = require('./audio/capture.mp3')
    // 返回 BrowserWindow - 此网页所属的窗口
    this.currentWindow = this.$electron.remote.getCurrentWindow()
    // this.screen = this.$electron.screen
    this.curScreen = getCurrentScreen()
  },
  mounted() {
    // 初始化
    this.getScreen()
  },
  data() {
    return {}
  },

  methods: {
    save() {},
    // 选取成功
    ok() {
      if (!this.capture.selectRect) {
        return
      }
      // console.log('图片截取进入1')
      // 获取图片地址
      let url = this.capture.getImageUrl()
      let scale = this.capture.getImageScale()
      // 声音
      this.audio.play()
      this.audio.onended = () => {
        window.close()
        // this.$electron.ipcRenderer.send('close')
      }
      // console.log('图片截取进入2')
      // clipboard模块提供方法来供复制和粘贴操作
      this.$electron.clipboard.writeImage(
        this.$electron.nativeImage.createFromDataURL(url)
      )
      this.$electron.ipcRenderer.send('capture-screen', {
        type: 'complete',
        url,
        scale
      })
      // console.log('图片截取进入3')
    },
    // 重置选区
    reset() {
      this.$refs.toolbar.style.display = 'none'
      this.$refs.size.style.display = 'none'
      this.$refs.canvas.style.width = 0
    },
    // 关闭窗口
    close() {
      this.$electron.ipcRenderer.send('close')
    },
    // 获取桌面流后传给handleStream方法
    getScreen() {
      this.oldCursor = document.body.style.cursor
      // 把截屏窗口透明度设为0
      document.body.style.opacity = '0'
      // 鼠标样式设为none
      document.body.style.cursor = 'none'
      // Node.js os 模块提供了一些基本的系统操作函数
      // platform——操作系统名
      if (require('os').platform() === 'win32') {
        // desktopCapturer.getSources——发起一个请求，获取所有桌面资源
        this.$electron.desktopCapturer.getSources(
          {
            // 列出了可以捕获的桌面资源类型
            types: ['screen'],
            // 建议缩略可被缩放的size
            thumbnailSize: { width: 1, height: 1 }
          },
          (e, sources) => {
            // 回调函数——Source 对象数组, 每个 Source 表示了一个捕获的屏幕或单独窗口
            // 找到当前截屏窗口
            // console.log('selectSource', sources, this.curScreen)
            var selectSource = sources.filter(
              source => source.display_id + '' === this.curScreen.id + ''
            )
            // 有时候获取source.display_id = "",则用主屏幕
            if (selectSource.length < 1) {
              selectSource = sources.filter(
                source => source.name === 'Entire screen'
              )
            }
            selectSource = selectSource[0]
            // console.log('获取到的selectSource', selectSource)
            // 提醒用户需要使用音频/视频输入设备(比如相机，屏幕共享，或者麦克风)
            // 如果用户给予许可，successCallback回调
            // MediaStream对象作为回调函数的参数。
            navigator.getUserMedia(
              {
                audio: false,
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: selectSource.id + '',
                    minWidth: 1280,
                    minHeight: 720,
                    maxWidth: 8000,
                    maxHeight: 8000
                  }
                }
              },
              e => {
                this.handleStream(e)
              },
              // 如果用户拒绝许可或者没有媒体可用
              e => {
                // console.log(e)
              }
            )
          }
        )
      } else {
        navigator.getUserMedia(
          {
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: `screen:${this.curScreen.id}`,
                minWidth: 1280,
                minHeight: 720,
                maxWidth: 8000,
                maxHeight: 8000
              }
            }
          },
          e => {
            this.handleStream(e)
          },
          // 如果用户拒绝许可或者没有媒体可用
          e => {
            // console.log(e)
          }
        )
      }
    },
    // 根据传入的stream流，创建video标签，把video显示在canvas画布上，通过canvas截取图片交给回调函数
    handleStream(stream) {
      // console.log('获取到stream', stream)
      // 截屏窗口透明度和鼠标样式恢复正常
      document.body.style.cursor = this.oldCursor
      document.body.style.opacity = '1'
      // 创建video标签隐藏
      let video = document.createElement('video')
      video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
      // 标志位
      let loaded = false
      // 指定视频/音频（audio/video）的元数据(时长，尺寸大小（视频），文本轨道)加载后触发
      video.onloadedmetadata = () => {
        if (loaded) {
          return
        }
        loaded = true
        video.play()
        video.pause()
        // 设置video宽高
        video.style.height = video.videoHeight + 'px' // videoHeight
        video.style.width = video.videoWidth + 'px' // videoWidth

        // 创建一个canvas,画布设置成video的宽高
        let canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        let ctx = canvas.getContext('2d')
        // console.log('把video内容投在canvas画布上')
        // 把video内容投在canvas画布上
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        if (this.callback) {
          // 把canvas保存成base64图片交给回调函数
          // console.log('把canvas保存成base64图片交给回调函数')
          this.callback(canvas.toDataURL('image/png'))
        } else {
          // console.log('Need callback!')
        }

        // 移除vidoe标签
        video.remove()
        try {
          // getTracks——返回流中所有的MediaStreamTrack列表。
          stream.getTracks()[0].stop()
        } catch (e) {
          // nothing
        }
      }
      video.srcObject = stream
      document.body.appendChild(video)
    },

    callback(imgSrc) {
      // console.log('callback', imgSrc)
      this.capture = new CaptureEditor(this.$refs.canvas, this.$refs.bg, imgSrc)
      let onDrag = selectRect => {
        this.$refs.toolbar.style.display = 'none'
        this.$refs.size.style.display = 'block'
        this.$refs.size.innerText = `${selectRect.w} * ${selectRect.h}`
        if (selectRect.y > 35) {
          this.$refs.size.style.top = `${selectRect.y - 30}px`
        } else {
          this.$refs.size.style.top = `${selectRect.y + 10}px`
        }
        this.$refs.size.style.left = `${selectRect.x}px`
      }
      this.capture.on('start-dragging', onDrag)
      this.capture.on('dragging', onDrag)
      let onDragEnd = () => {
        if (this.capture.selectRect) {
          this.$electron.ipcRenderer.send('capture-screen', {
            type: 'select',
            screenId: this.curScreen.id
          })
          const { r, b } = this.capture.selectRect
          this.$refs.toolbar.style.display = 'flex'
          this.$refs.toolbar.style.top = `${b + 15}px`
          this.$refs.toolbar.style.right = `${window.screen.width - r}px`
        }
      }
      this.capture.on('end-dragging', onDragEnd)
      this.$electron.ipcRenderer.on(
        'capture-screen',
        (e, { type, screenId }) => {
          if (type === 'select') {
            if (screenId && screenId !== this.curScreen.id) {
              this.capture.disable()
            }
          }
        }
      )

      // $btnSave.addEventListener('click', () => {
      //   let url = capture.getImageUrl()

      //   remote.getCurrentWindow().hide()
      //   remote.dialog.showSaveDialog(
      //     {
      //       filters: [
      //         {
      //           name: 'Images',
      //           extensions: ['png', 'jpg', 'gif']
      //         }
      //       ]
      //     },
      //     path => {
      //       if (path) {
      //         // eslint-disable-next-line no-buffer-constructor
      //         fs.writeFile(
      //           path,
      //           Buffer.from(('data:image/png;base64,', ''), 'base64'),
      //           () => {
      //             this.$electron.ipcRenderer.send('capture-screen', {
      //               type: 'complete',
      //               url,
      //               path
      //             })
      //             window.close()
      //           }
      //         )
      //       } else {
      //         this.$electron.ipcRenderer.send('capture-screen', {
      //           type: 'cancel',
      //           url
      //         })
      //         window.close()
      //       }
      //     }
      //   )
      // })
      window.addEventListener('keypress', e => {
        if (e.code === 'Enter') {
          selectCapture()
        }
      })
    }
  }
}
</script>
<style lang='scss' scoped>
html,
body,
div {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.image-canvas {
  position: absolute;
  display: none;
  z-index: 1;
}
.size-info {
  position: absolute;
  color: #ffffff;
  font-size: 12px;
  background: rgba(40, 40, 40, 0.8);
  padding: 5px 10px;
  border-radius: 2px;
  //   font-family: Arial Consolas sans-serif;
  display: none;
  z-index: 2;
}
.toolbar {
  position: absolute;
  color: #343434;
  font-size: 12px;
  background: #f5f5f5;
  padding: 5px 10px;
  border-radius: 4px;
  //   font-family: Arial Consolas sans-serif;
  display: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  z-index: 2;
  align-items: center;
}
.toolbar .iconfont {
  font-size: 24px;
  padding: 2px 5px;
}
</style>