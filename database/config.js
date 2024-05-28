const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/chatApp")
    .then(data=>{console.log('Connected to DB');})
    .catch(e=>console.log(e))
