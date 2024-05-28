const mongoose = require('mongoose')

// mongoose.connect("mongodb://127.0.0.1:27017/chatApp")
//     .then(data=>{console.log('Connected to DB');})
//     .catch(e=>console.log(e))
mongoose.connect("mongodb+srv://chatAppTester:A123456@cluster0.ajdwy4s.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0")
    .then(data => { console.log('Connected to DB'); })
    .catch(e => console.log(e))
