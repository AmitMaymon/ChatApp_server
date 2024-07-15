const mongoose = require('mongoose')


mongoose.connect("") // enter your mongodb cluster login
    .then(data => { console.log('Connected to DB'); })
    .catch(e => console.log(e))
