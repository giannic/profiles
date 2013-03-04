###
Module dependencies.
###
express = require("express")
home = require("./routes/index")
user = require("./routes/user")
http = require("http")
path = require("path")
mongoose = require("mongoose")
MongoStore = require("connect-mongo")(express)

conf =
  db: {
    db: 'test',
    host: 'localhost',
    port: 27017
    username: ''
    password: ''
    collection: 'sessions'
  },
  secret: 'this is a secret yo'

app = express()
app.configure ->
  app.set "port", process.env.PORT or 3000
  app.set "views", __dirname + "/views"
  # handlebars support while reading files as .html
  app.set 'view engine', 'html'
  app.engine 'html', require('hbs').__express
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.session
    secret: conf.secret,
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(conf.db)
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(path.join(__dirname, "public"))


app.configure "development", ->
  app.use express.errorHandler()


db_uri = 'mongodb://'
# if username and password exist
if conf.db.username and conf.db.password
  console.log 'there is a username and password'
  db_uri += conf.db.username + ':' + conf.db.password + '@'
db_uri += conf.db.host + ':' + conf.db.port + '/' + conf.db.db

mongoose.connect 'mongodb://localhost/test'
db = mongoose.connection
db.on 'error', console.error.bind(console, 'connection error:')
db.once 'open', ->
  console.log 'Connected to the database.'


app.get "/", home.index
app.get "/users", user.list
app.get "/users.json", user.json_all
app.get "/register", user.register_get
app.post "/register", user.register_post
app.get "/login", user.login_get
app.post "/login", user.login_post


server = http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")

# socket.io code
io = require("socket.io").listen(server)

io.sockets.on 'connection', (socket) ->
  socket.emit 'news', { hello: 'world'}
  # sample event
  socket.on 'custom_event', (data) ->
    console.log data

