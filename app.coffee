###
Module dependencies.
###
express = require("express")
index = require("./routes/index")
user = require("./routes/user")
application = require("./routes/application")
http = require("http")
path = require("path")
mongoose = require("mongoose")
MongoStore = require("connect-mongo")(express)
hbs = require('hbs')

conf =
  db: {
    db: 'test',
    host: 'davidxu.me',
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

console.log db_uri

mongoose.connect db_uri
db = mongoose.connection
db.on 'error', console.error.bind(console, 'connection error:')
db.once 'open', ->
  console.log 'Connected to the database.'


# existing routes
app.get "/", index.index
app.get "/grid", index.grid

# Users
app.get "/users", user.list
app.get "/users.json", user.json_all
app.get "/users/:id.json", user.view
app.get "/users/:id/reset_whitelist", user.reset_whitelist
app.get "/users/:id/whitelist.json", user.whitelist
app.post "/users/allow", user.allow
app.post "/users/disallow", user.disallow
app.post "/users/delete_app", user.delete_app
app.get "/register", user.register_get
app.post "/register", user.register_post
app.get "/login", user.login_get
app.post "/login", user.login_post
app.get "/logout", user.logout

# Applications
app.get "/apps.json", application.json_all
app.post "/apps/open", application.open
app.post "/apps/close", application.close
app.post "/apps/delete", application.delete
app.get "/apps/new", application.new_test  # just for testing
app.get "/apps/:id.json", application.view
app.get "/apps/user", application.get_by_user  # apps specific to a user - should probably rename
app.post "/apps/category", application.update_category

# handlebars templates
# hbs.registerPartial('home', 'home')

blocks = {}

hbs.registerHelper 'extend', (name, context) =>
    console.log context
    console.log context.fn @
    console.log name
    block = blocks[name]
    if not block
        block = blocks[name] = []
    block.push(context.fn @)
    return

hbs.registerHelper 'block', (name) ->
    val = (blocks[name] || []).join('\n')
    blocks[name] = []
    return val

server = http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")



# socket.io code
io = require("socket.io").listen(server)

io.sockets.on 'connection', (socket) ->
  socket.emit 'news', { hello: 'world'}
  # sample event
  socket.on 'custom_event', (data) ->
    console.log data

