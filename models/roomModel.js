const mongoose = require('mongoose')

const RoomSchema = mongoose.Schema({
    room_id:{required:true,type:String},
    room_name:{required:true,type:String},
    messages:{type:Array}

})

const RoomModel = mongoose.model('room_chats',RoomSchema)


module.exports = RoomModel
