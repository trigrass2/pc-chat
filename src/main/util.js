import { BrowserWindow } from 'electron'

// 创建新窗口
export function NewWindow(config, hashName) {
  const baseConfig = {
    width: 500,
    height: 500,
    show: false,
    hasShadow: true,
    // 设置的宽高只是内容的宽高，实际窗口的size包括窗口框架的size，稍微会大一点
    useContentSize: true
  }
  const finalConfig = { ...baseConfig, ...config }
  let newWin = new BrowserWindow(finalConfig)
  let fileLocation = winUrl(hashName)
  newWin.loadURL(fileLocation)
  // 当页面在窗口中直接加载时，用户会看到未完成的页面，这不是一个好的原生应用的体验。
  // 这一步是为了让画面准备好了再显示。
  newWin.once('ready-to-show', () => {
    newWin.show()
  })
  newWin.on('closed', event => {
    // console.log(event)
    // this = null
    newWin = null
  })
  return newWin
}

// 访问文件地址/路径
function winUrl(hashName) {
  const winURL =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/#/${hashName}`
      : `file://${__dirname}/index.html/#/${hashName}`
  return winURL
}
