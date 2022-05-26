const express = require("express")
const app = express()
const { config } = require("./config")
const path = require("path")
const MongoOperations = require("./models/mongo/model.js")
const expressSession = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

const {main} = require("./models/mongo/connection.js")
const { urlencoded } = require("express")
const res = require("express/lib/response")
    main().catch(err => console.log(err))

const textUsuarioInexistente = "Usuario o contraseña incorrecto"
const textUsuarioYaRegistrado = "El usuario ya se encuentra registrado previamente"

app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(expressSession({
    secret: config.SECRET_KEY,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: 1000 * 10
    },
    rolling: true
}))

passport.use('login', new LocalStrategy(async (username, password, done)=>{
    try {
        let user = await MongoOperations.getUser(username)
        if(!user)return done(null, false)
        if(user.password != password)return done(null, false)

       const userLog = {
            username: user.username,
            password: user.password,
        }
        return done(null, userLog)
    } catch (error) {
        console.log(error)
    }
}))

passport.use('register', new LocalStrategy({
    passReqToCallback: true
},async (req, username, password, done)=>{
    try {
        let usuario = await MongoOperations.getUser(username)
        if(usuario != null) return done(null,false)
        const user = {
            username, password
        }
        const userCreated = await MongoOperations.createUser(user)
        return done(null, user)
    } catch (error) {
        console.log(error)
    }
}));

passport.serializeUser((user, done)=>{
    done(null, user.username)
});

passport.deserializeUser((username, done)=>{
    let user = MongoOperations.getUser(username)
    done(null, user)
});

app.use(passport.initialize())
app.use(passport.session())

app.set("views", path.join(__dirname,"views"))
app.set("view engine", "ejs")

let isLogin = (req, res, next)=>{
    try {
        if(req.isAuthenticated()){
            next()
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error)
    }
}

let isNotLogin = (req, res, next)=>{
    try {
        if(!req.isAuthenticated()){
            next()
        }else{
            res.redirect("/datos")
        }
    } catch (error) {
        console.log(error)
    }
}

app.get("/", (req,res,next) =>{
    res.render("login")
})

app.get("/login", isNotLogin, (req,res,next) =>{
    res.render("login")
})

app.get("/registro", isNotLogin, (req,res,next) =>{
    res.render("register")
})

app.get("/datos", isLogin, async (req,res,next) => {
    req.user = await req.user
    res.render("data", {usuario: req.user})
})

app.get("/error/:error?", isNotLogin, (req,res,next) => {
    res.render("error", {error: req.params.error})
})

app.post("/registro",  passport.authenticate('register', {failureRedirect:`/error/${textUsuarioYaRegistrado}`, successRedirect:"datos"}));

app.post("/login", passport.authenticate('login', {failureRedirect:`/error/${textUsuarioInexistente}`, successRedirect:"datos"}));

app.get("/logout", (req,res,next)=>{
    req.session.destroy(err =>{
        if(err) return res.send(JSON.stringify(err));
        res.redirect("/registro");
    })
});

const server = app.listen(config.PORT, () => console.log(`http://localhost:${config.PORT}`))
