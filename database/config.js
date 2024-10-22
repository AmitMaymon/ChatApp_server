const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://chatAppTester:A123456@cluster0.zo320.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0")
    .then(data => { console.log('Connected to DB'); })
    .catch(e => console.log(e))
