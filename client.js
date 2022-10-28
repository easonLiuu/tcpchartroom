const net = require('net')
const types = require('./types')
let nickname = null

const client = net.createConnection({
    host: '127.0.0.1',
    port: 3000
})

client.on('connect', () => {
    console.log('客户端与服务器建立连接成功')

    process.stdout.write('请输入昵称:')
    //发送给服务端
    process.stdin.on('data', data => {
        data = data.toString().trim()
        //如果没有昵称
        if(!nickname) {
            //write里要么是二进制数据，要么是字符串，不可以直接写对象
            client.write(JSON.stringify({
                type: types.login,
                nickname: data
            }))
        }
    })
})

client.on('data', data => {
    data = JSON.parse(data.toString().trim())
    switch(data.type){
        case types.login:
            if(!data.success) {
                console.log(`登录失败: ${data.message}`)
                process.stdout.write('请输入昵称:')               
            } else {
                console.log(`登录成功，当前在线用户: ${data.sumUsers}`)
                nickname = data.nickname
            }
            break
        case types.broadcast:
            break
        case types.p2p:
            break
        default:
            console.log('未知的消息类型')
            break
    }
})