const net = require('net')

const server = net.createServer()

server.on('connection', clientSocket => {
    clientSocket.on('data', data => {
        console.log(data.toString())
    })

    clientSocket.write('hello')
})

server.listen(3000, () => {
    console.log('Server Running...')
})