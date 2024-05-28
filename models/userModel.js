const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    username: { required: true, type: String },
    password: { required: true, type: String },
    user_id: { required: true, type: String },
})

const UserModel = mongoose.model('users', UserSchema)


module.exports = UserModel
