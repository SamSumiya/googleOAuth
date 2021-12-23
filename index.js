require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const async = require('async')

const { OAuth2Client } = require('google-auth-library')
// const CLIENT_ID = '441434777326-hj1hocd6aukvgmt08s4alac9oupo9bsh.apps.googleusercontent.com'
const client = new OAuth2Client(process.env.CLIENT_ID)


const PORT = process.env.PORT || 5050

// MiddleWare
app.set('view engine', 'ejs')
app.use(express.json()) // So backend can parser JSON data
app.use(cookieParser()) // set cookies to the frontend


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    let token = req.body.token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,  
            // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify()
        .then(() => {
            res.cookie('session-token', token)
            res.send('success')
        })
        .catch(console.error);
})

app.get('/dashboard', checkAuthenticated, (req, res) => {
    let user = req.user
    res.render('dashboard', { user })
})

app.get('/protectedroute', checkAuthenticated, (req, res) => {
    res.render('protectedroute')
})

app.get('/logout', (req, res) => {
    res.clearCookie('session-token')
    res.redirect('/login')
})


function checkAuthenticated(req, res, next) {
    let token = req.cookies['session-token']

    let user = {}
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audiences: process.env.CLIENT_ID
        })
        const payload = ticket.getPayload()
        user.name = payload.name
        user.email = payload.email
        user.picture = payload.picture
    }
    verify()
        .then(() => {
            req.user = user;
            next()
        })
        .catch(err => {
            res.redirect('/login')
        })
}

app.listen(5050, () => {
    console.log(`Server is listening on port ${PORT}`)
})