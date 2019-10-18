const { remote, screen } = require('electron')

let currentWindow = remote.getCurrentWindow()

// 返回当前窗口
export function getCurrentScreen() {
  let { x, y } = currentWindow.getBounds()
  // getAllDisplays: 返回一个窗口数组Display[]，表示当前可用的窗口。
  return screen
    .getAllDisplays()
    .filter(d => d.bounds.x === x && d.bounds.y === y)[0]
}

// 判断鼠标是否在当前窗口内
export function isCursorInCurrentWindow() {
  // 当前鼠标的绝对位置
  let { x, y } = screen.getCursorScreenPoint()
  //  当前窗口信息
  let { x: winX, y: winY, width, height } = currentWindow.getBounds()
  // 鼠标是否在当前窗口内
  return x >= winX && x <= winX + width && y >= winY && y <= winY + height
}
