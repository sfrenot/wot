app = require('express')()
app.listen 3030

app.use '/', require('./extract')
