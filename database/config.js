const mongoose = require('mongoose')


mongoose.connect("mongodb+srv://chatAppTester:A123456@cluster0.ajdwy4s.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0") // enter your mongodb cluster login OR use this restricted one
    .then(data => { console.log('Connected to DB'); })
    .catch(e => console.log(e))
