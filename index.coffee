app = require('express')()
app.listen 3000

app.use '/', require('./extract')
