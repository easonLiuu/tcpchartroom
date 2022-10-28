const net = require('net')
const { off } = require('process')
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
            // 给非当前登录用户广播
            users.forEach(user => {
                if(user !== clientSocket) {
                    user.write(JSON.stringify({
                        type: types.log,
                        message: `${data.nickname}进入了聊天室, 当前在线用户: ${users.length}`
                    }))
                }
            })
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
            const user = users.find(item => item.nickname === data.nickname)
            if(!user) {
                return clientSocket.write(JSON.stringify({
                    type: types.p2p,
                    success: false,
                    message: '该用户不存在'
                }))
            }

            user.write(JSON.stringify({
                type: types.p2p,
                success: true,
                nickname: clientSocket.nickname,
                message: data.message
            }))
            break
        default:
            break
       }
    })
    //清除离线用户
    clientSocket.on('end', () => {
        const index = users.findIndex(user => user.nickname === clientSocket.nickname)
        if(index !== -1) {
            const offLineUser = users[index]
            users.splice(index, 1)
            // 广播通知其他用户 某个用户已离开 当前剩余人数
            users.forEach(user => {
                user.write(JSON.stringify({
                    type: types.log,
                    message: `${offLineUser.nickname}离开了聊天室, 当前在线用户: ${users.length}`
                }))
            })
        }
    })
})

server.listen(3000, () => {
    console.log('Server Running...')
})