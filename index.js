const express = require('express')
const app = express() 


const PORT = process.env.PORT || 5050

// MiddleWare
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.listen(5050, () => {
    console.log(`Server is listening on port ${PORT}`);
})