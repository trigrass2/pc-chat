export class Socket {
  constructor(url) {
  	this.ws = new WebSocket(url)
  	this.onError()
  	this.onClose()
  }
  send(data) {
  	this.waitForConnection(() => {
  	  this.ws.send(JSON.stringify(data))
  	}, 1000)
  }
  // 发送器
  // callback，发送数据回调
  // interval，ws未连接情况下，隔1s监听是否已经成功打开连接
  waitForConnection(callback, interval) {
  	if(this.ws.readyState === 1) {
  	  callback()
  	} else {
		setTimeout(() => {
		  this.waitForConnection(callback, interval)
		}, interval)
  	}
  }

  // 获取数据回调
  // callback，回调函数
  onMessage(callback) {
  	this.ws.onmessage = (res) => {
  	  try{
  	  	callback(JSON.parse(res))
  	  }catch(e){
  	  	console.log(e)
  	  }
  	}
  }
  // 获取失败回调
  onError() {
  	this.ws.oneror = (res) => {
  		console.log('连接错误!')
  	}
  }
  // 关闭回调
  onClose() {
  	this.ws.onclose = (res) => {
  		console.log('关闭连接!')
  	}
  }
}
