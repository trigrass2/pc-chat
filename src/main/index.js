'use strict'
// app: 控制应用程序的事件生命周期
import {
  app,
  globalShortcut,
  screen,
  ipcMain,
  BrowserWindow,
  session
} from 'electron'
import { NewWindow } from './util'

const os = require('os')
// import { RefCountDisposable } from 'rx-core';
let loginWin, mainWin, updateWin, historyWin, settingWin
let captureWins = []

app.on('ready', init)

// 所有窗口关闭，应用程序就退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 当应用被激活时发出。各种操作都可以触发此事件, 例如首次启动应用程序、尝试在应用程序已运行时或单击应用程序的坞站或任务栏图标时重新激活它。
app.on('activate', () => {
  // if (loginWindow === null) {
  //     createWindow()
  // }
})

// 当所有窗口都已关闭并且应用程序将退出时发出。调用 event. preventDefault () 将阻止终止应用程序的默认行为。
app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// 登录
ipcMain.on('login', (event, data) => {
  focusWindowClose()
  mainWin = NewWindow(
    {
      width: 1000,
      height: 800,
      minHeight: 650,
      minWidth: 800,
      backgroundColor: '#F6F6F6'
    },
    'main'
  )
})
// 登录session塞入请求头中
ipcMain.on('getSession', (event, data) => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Cookie'] = `${data.name}=${data.value}`;
    let _data = { requestHeaders: details.requestHeaders }
    callback(_data)
  })
//   console.log(loginWin)
  loginWin.webContents.send('sessionReady')
})
// 登出
ipcMain.on('logout', (event, data) => {
  BrowserWindow.getAllWindows().forEach(win => win.close())
  loginWin = NewWindow(
    { height: 560, width: 380, backgroundColor: '#F6F6F6' },
    'login'
  )
})

// 退出程序
ipcMain.on('close', (event, data) => {
  // console.log('退出程序参数', event)
  focusWindowClose()
})

// 更新说明
ipcMain.on('updateStatus', (event, data) => {
  updateWin = NewWindow(
    { width: 600, height: 420, backgroundColor: '#F6F6F6' },
    'update'
  )
})

// 打开历史记录
ipcMain.on('openHistory', (event, data) => {
  historyWin = NewWindow(
    { width: 1000, height: 650, backgroundColor: '#F6F6F6' },
    'history'
  )
})

// 打开用户设置
ipcMain.on('openSetting', (event, data) => {
  settingWin = NewWindow(
    { width: 600, height: 450, backgroundColor: '#F6F6F6' },
    'setting'
  )
})

// 打开截图
ipcMain.on('openCaptureScreen', openCaptureScreen)

// 截图操作
ipcMain.on('capture-screen', captureOperate)

// 关闭当前窗口
function focusWindowClose() {
  let win = BrowserWindow.getFocusedWindow()
  win.close()
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

// 初始化窗口
function init() {
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    //     console.log('asdsadsadsa', details)
    //     details.requestHeaders['Cookie'] = 'MyAgent';
    //     let data = { requestHeaders: details.requestHeaders };
    //     console.log('asdsadsadsa', details)
    //     callback(data)
    // })
  loginWin = NewWindow({ height: 560, width: 380 }, 'login')
  // mainWin = NewWindow({ width: 1000, height: 650 }, 'main')
  // loginWin = NewWindow({ width: 600, height: 450 }, 'setting')

  // 注册快捷键
  const ret = globalShortcut.register('esc', () => {
    if (captureWins) {
      captureWins.forEach(win => win.close())
      captureWins = []
    }
  })
}

// 打开屏幕截图
function openCaptureScreen(event, data) {
  if (captureWins.length) {
    return false
  }
  // 返回主窗口Display的长宽
  // let { width, height } = screen.getPrimaryDisplay().bounds
  let displays = screen.getAllDisplays()
  captureWins = displays.map(display => {
    let captureWin = new NewWindow(
      {
        // 窗口需要覆盖全屏, 并且完全置顶,
        // 在 windows 下可以使用 fullscreen 来保证全屏,
        // Mac 下 fullscreen 会把窗口移到单独桌面, 所以采用了另外的办法, 代码注释上标注了不同系统的相关选项, 具体内容可以查看文档
        // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
        fullscreen: os.platform() === 'win32' || undefined, // win
        width: display.bounds.width,
        height: display.bounds.height,
        // width: 500,
        // height: 500,
        x: display.bounds.x,
        y: display.bounds.y,
        transparent: true, // 使窗口 透明
        frame: false, // 无边框窗口
        // skipTaskbar: true, // 在任务栏中显示窗口
        // autoHideMenuBar: true, // 自动隐藏菜单栏, 除非按了Alt键
        movable: false, // 窗口不可以移动. 在 Linux 中无效
        resizable: false, // 窗口不可以改变尺寸
        enableLargerThanScreen: true, // mac 允许改变窗口的大小时, 大于屏幕的尺寸
        hasShadow: false // mac 窗口没有阴影
      },
      // 注意这里窗口这个文件用来负责截屏和裁剪的一些交互工作
      'captureScreen'
    )
    // 是否设置这个窗口始终在其他窗口之上.设置之后，这个窗口仍然是一个普通的窗口，不是一个不可以获得焦点的工具箱窗口.
    captureWin.setAlwaysOnTop(true, 'screen-saver') // mac
    // 设置窗口是否在所有地方都可见.
    captureWin.setVisibleOnAllWorkspaces(true) // mac
    // 设置点击最大化按钮是否可以全屏或最大化窗口.
    captureWin.setFullScreenable(false) // mac

    // 当前鼠标的绝对路径
    let { x, y } = screen.getCursorScreenPoint()
    // 绝对路径是否在窗口内
    if (
      x >= display.bounds.x &&
      x <= display.bounds.x + display.bounds.width &&
      y >= display.bounds.y &&
      y <= display.bounds.y + display.bounds.height
    ) {
      captureWin.focus()
    } else {
      captureWin.blur()
    }
    // 调试用
    // captureWin.openDevTools()
    captureWin.on('closed', () => {
      let index = captureWins.indexOf(captureWin)
      if (index !== -1) {
        captureWins.splice(index, 1)
      }
      captureWins.forEach(win => win.close())
    })
    return captureWin
  })
}

// 屏幕截图操作
function captureOperate(
  e,
  { type = 'start', screenId, url, path, scale } = {}
) {
  if (type === 'start') {
    captureScreen()
  } else if (type === 'complete') {
    // console.log('complete', scale)
    mainWin.webContents.send('captureImg', url, scale)
  } else if (type === 'select') {
    captureWins.forEach(win =>
      win.webContents.send('capture-screen', { type: 'select', screenId })
    )
  }
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
*/
