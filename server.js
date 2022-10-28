const net = require('net')
const types = require('./types')

const server = net.createServer()

//[Socket, Socket,...]
//也就是一个个客户端
const users = []

server.on('connection', clientSocket => {
    clientSocket.on('data', data => {
       data = JSON.parse(data.toString().trim())
       switch(data.type) {
        case types.login:
            if(users.find(item => item.nickname === data.nickname)){
                return clientSocket.write(JSON.stringify({
                    type: types.login,
                    success: false,
                    message: '昵称已重复'
                }))
            }

            clientSocket.nickname = data.nickname
            //添加到users中
            users.push(clientSocket)
            clientSocket.write(JSON.stringify({
                type: types.login,
                success: true,
                message: '登录成功',
                //当前多少人在线
                nickname: data.nickname,
                sumUsers: users.length
            }))
            break
        case types.broadcast:
            //每一个message就是每一个clientSocket
            //群聊消息发送到每一个用户
            users.forEach(item => {
                item.write(JSON.stringify({
                    type: types.broadcast,
                    nickname: clientSocket.nickname,
                    message: data.message
                }))
            })
            break
        case types.p2p:
            break
        default:
            break
       }
    })
})

server.listen(3000, () => {
    console.log('Server Running...')
})