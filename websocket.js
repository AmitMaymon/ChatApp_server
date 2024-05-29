const socketIo = require('socket.io');
const RoomModel = require('./models/roomModel');
const UserModel = require('./models/userModel');
const DmModel = require('./models/dmModel');
const jwt = require('jsonwebtoken')

const { v4: uuidv4 } = require('uuid');

function initWebSocket(server) {

    const io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    const connectedUsers = []

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        console.log('Connected users:', connectedUsers);
        // connectedUsers.push({ username: socket.handshake.query.username, socket_id: socket.id })


        socket.on('LOGIN', (data, loginCheck) => {
            const user = UserModel.findOne({ username: data.username, password: data.password }).then(user => {
                if (user) {
                    console.log('User logged in:', user.username);
                    user = { username: user.username, user_id: user.user_id, socket_id: socket.id }
                    data = { success: true, user: user }
                    user.socket_id = socket.id

                    const token = jwt.sign({ username: user.username, user_id: user.user_id }, 'MONKEY', { expiresIn: '1h' })
                    data.token = token

                    loginCheck(data)
                    connectedUsers.push(user)
                    io.emit('NEW_USER', connectedUsers)

                } else {
                    data = { success: false }
                    loginCheck(data)
                }

                // console.log('LOGIN', data);
            })
        })




        socket.on('REGISTER', (data, registerCheck) => {
            const user = UserModel.findOne({ username: data.username }).then(user => {
                if (user) {
                    console.log('User already exists');
                    data = { success: false }
                    registerCheck(data)
                } else {
                    new UserModel({
                        username: data.username,
                        password: data.password,
                        user_id: uuidv4()
                    }).save().then(user => {
                        console.log('User registered:', user.username);
                        user = { username: user.username, user_id: user.user_id, socket_id: socket.id }
                        data = { success: true, user: user }
                        user.socket_id = socket.id

                        registerCheck(data)

                        connectedUsers.push(user)
                        io.emit('NEW_USER', connectedUsers)
                    }).catch(e => console.log(e))
                }
            })

        })

        socket.on('AUTHENTICATION', (data, callback) => {
            const token = socket.handshake.query.token
            try {
                const decoded = jwt.verify(token, 'MONKEY')
                const user = { username: decoded.username, user_id: decoded.user_id, socket_id: socket.id }
                // if (!connectedUsers.find(u => u.user_id === user.user_id)) {
                connectedUsers.push(user)

                // }
                callback({ success: true, user })
                io.emit('NEW_USER', connectedUsers)
            } catch (error) {
                callback({ success: false, msg: error.message })
            }
        })


        socket.on('CREATE_DM', (data, dmCallback) => {
            const sortedUsers = data.users.sort()
            const chat = DmModel.findOne({ users: sortedUsers }).then(chat => {
                if (chat) {
                    console.log('DM already exists');
                    // io.emit('NEW_DM', chat)
                    dmCallback(chat)
                } else {

                    new DmModel({
                        dm_id: uuidv4(),
                        users: data.users,
                        messages: []
                    }).save().then(data => {
                        console.log('DM created');
                        // io.emit('NEW_DM', data)
                        dmCallback(data)
                    }).catch(e => console.log(e))
                }
            })
        })


        socket.on('NOTIFICATION', (data) => {
            console.log('NOTIFICATION', data);
            if (!data.isDm) {
                io.emit('NOTIFICATION', data)
            } else {
                DmModel.findOne({ dm_id: data.room_id }).then(dm => {
                    dm.users.forEach(user_id => {
                        if (user_id !== data.user_id) {
                            const user = connectedUsers.find(user => user.user_id === user_id)
                            io.to(user.socket_id).emit('CREATE_DM', { dm_id: dm.dm_id, users: dm.users })
                            io.to(user.socket_id).emit('NOTIFICATION', data)
                        }
                    });
                }).catch(e => console.log(e))
            }
        })



        socket.on('GET_ROOMS', (rooms) => {
            RoomModel.find().then(data => {
                rooms(data)
            }).catch(e => console.log(e))
        })

        socket.on('GET_USERS', (users) => {
            users(connectedUsers)
        })

        socket.on('GET_MESSAGES', (data, messages) => {
            if (data.isDm) {
                DmModel.findOne({ dm_id: data.room_id }).then(data => {
                    messages(data.messages)
                }).catch(e => messages([]))
            } else {
                msgs = RoomModel.findOne({ room_id: data.room_id }).then(data => {
                    messages(data.messages)
                }).catch(e => messages([]))
            }



        })

        socket.on('SEND_MESSAGE', (data) => {
            // console.log('SEND_MESSAGE', data);
            if (data.isDm) {
                DmModel.findOne({
                    dm_id: data.room_id
                }).then(dm => {
                    messageData = { message: data.message, username: data.username, timestamp: new Date(), id: uuidv4(), user_id: data.user_id, room_id: data.room_id }
                    dm.messages.push(messageData)
                    dm.save().then(() => {
                        io.to(data.room_id).emit('NEW_MESSAGE', messageData)
                    }).catch(e => console.log(e))
                }).catch(e => console.log(e))
            }
            else {

                RoomModel.findOne({ room_id: data.room_id }).then(room => {
                    messageData = { message: data.message, username: data.username, timestamp: new Date(), id: uuidv4(), user_id: data.user_id, room_id: data.room_id }
                    room.messages.push(messageData)
                    room.save().then(() => {
                        io.to(data.room_id).emit('NEW_MESSAGE', messageData)
                    }).catch(e => console.log(e))
                }).catch(e => console.log(e))
            }
        })
        socket.on('SWITCH_ROOM', (data) => {
            // socket.leaveAll()
            for (let room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }
            socket.join(data.room_id)

            // update user's rooms
            const user = connectedUsers.find(user => user.socket_id === socket.id)
            if (user) {
            }
        })









        socket.on('CREATE_ROOM', (data) => {
            new RoomModel({
                room_id: uuidv4(),
                room_name: data.room_name,
                messages: []
            }).save().then(data => {
                console.log('Room created:', data);
                io.emit('NEW_ROOM', data)
            }).catch(e => console.log(e))
        })
        socket.on('disconnect', () => {

            const user = connectedUsers.find(user => user.socket_id === socket.id)
            if (user) {
                io.emit('DISCONNECT', user.user_id)
            }
            connectedUsers.splice(connectedUsers.findIndex(user => user.socket_id === socket.id), 1)
            console.log('User disconnected:', socket.id);
            console.log(connectedUsers);
            io.emit('NEW_USER', connectedUsers)
        })


    })



}






module.exports = initWebSocket;