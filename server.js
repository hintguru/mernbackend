const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '643450610701-hjgr6n0u38gftd7ppslm45j1p7hvkrfv.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


const PORT = process.env.PORT || 3000;

// Middleware

app.set('view engine', 'hbs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));


app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', (req,res)=>{
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
      }
      verify()
      .then(()=>{
          res.cookie('session-token', token);
          res.send('success')
      })
      .catch(console.error);

})
app.get('/profile', checkAuthenticated, (req, res)=>{
    let user = req.user;
    res.render('profile', {
        name:user.name,
        email:user.email,
        picture:user.picture
    });
})

app.get('/logout', (req, res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')

})

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})