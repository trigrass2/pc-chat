// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

var ws = require('nodejs-websocket')

// Scream server example: "hi" -> "HI!!!"
var server = ws
  .createServer(function(conn) {
    console.log('New connection')
    // 监听客户端消息
    conn.on('text', function(str) {
      console.log('Received ' + str)
      // 把消息发送回去
      conn.sendText(str.toUpperCase() + '!!!')
    })
    conn.on('close', function(code, reason) {
      console.log('Connection closed')
    })
  })
  .listen(8001)
