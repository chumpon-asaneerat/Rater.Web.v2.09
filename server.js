const express = require('express')
const morgan = require('morgan')

let app = express()
let port = 3000

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/users', (req, res) => {
    res.send('Hello World! This is user url')
})
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})