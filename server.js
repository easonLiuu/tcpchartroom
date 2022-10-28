const net = require('net')

const server = net.createServer()

const clients = []

server.on('connection', clientSocket => {
    //把当前连接的客户端通信接口存储到数组中
    clients.push(clientSocket)

    clientSocket.on('data', data => {
        console.log('有人说', data.toString())
        //数据发给所有的客户端
        clients.forEach(socket => {
            if(socket !== clientSocket) {
                socket.write(data)
            }          
        })
    })

    clientSocket.write('hello')
})

server.listen(3000, () => {
    console.log('Server Running...')
})