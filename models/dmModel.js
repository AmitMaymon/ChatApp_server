const mongoose = require('mongoose')

const DmSchema = mongoose.Schema({
    dm_id: String,
    users: [String],
    messages: [{ sender: String,username:String, message: String, timestamp: { type: Date, default: Date.now } }],

})

const DmModel = mongoose.model('dm_chats', DmSchema)


module.exports = DmModel
 