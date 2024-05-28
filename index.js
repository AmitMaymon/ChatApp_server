const express = require('express')
const http = require('http')
const initWebSocket = require('./websocket')
const cors = require('cors')

require('./database/config')
const PORT = process.env.PORT || 8000
const app = express()
const server = http.createServer(app)
app.use(cors())

initWebSocket(server)


server.listen(PORT,()=>{
    console.log('Server listening on port:',PORT);
})




