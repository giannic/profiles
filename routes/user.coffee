User = require('../models/user')
Application = require('../models/application')


###
# /users
# TODO: as of right now, it's nothing
###
exports.list = (req, res) ->
  res.send "respond with a resource"

###
# /users.json
# The json of all existing users
###
exports.json_all = (req, res) ->
    User.find().exec (err, results) ->
        if(!res.headerSent)
          res.json(results)

###
# /register
# The post request for registration
# req.body:
# email, password
###
exports.register_post = (req, res) ->
  # res.render "hi"
  console.log req.body
  new User(req.body).save (err) ->
    if err
      if req.headers.origin.indexOf("chrome-extension") == -1
        # if not chrome extension
        req.session.messages.push err
        res.redirect "/register",
      else
        res.send {error: err}

      console.log 'Error in saving user'
    else
      # succeeded!
      console.log 'yeaaah registered bro'
      if req.headers.origin.indexOf("chrome-extension") == -1
        # if not chrome extension
        req.session.messages.push 'Successfully registered! Please login.'
        res.redirect "/login"
      else
        res.send {userid: result._id}



###
# /register
# The form for registration
###
exports.register_get = (req, res) ->
  res.render "register"

###
# /login
# The post request for logging in
# Takes in a email, userid
###
exports.login_post = (req, res) ->
  req.session.messages = req.session.messages or []
  # console.log req
  User.findOne email: req.body.email, (err, result) ->
    if result and result.authenticate(req.body.password)
      # set session user id
      req.session.user_id = result._id
      console.log 'logged in!'
      console.log req.session.user_id

      if req.headers.origin.indexOf("chrome-extension") == -1
        # if not chrome extension
        req.session.messages.push 'Successfully logged in!'
        res.redirect "/",
      else
        res.send {userid: result._id}
      # TODO: check if it's the chrome extension, if not, redirect
      # res.redirect '/'
    else
      console.log 'incorrect password'
      if req.headers.origin.indexOf("chrome-extension") == -1
        # if not chrome extension
        req.session.messages.push 'Error: Username and passwords don\'t match'
        res.redirect "/login"
      else
        res.send {error: 'Incorrect password'}

###
# /login
# The view for the login form
###
exports.login_get = (req, res) ->
  req.session.messages = req.session.messages or []
  res.render "login",
    msg: req.session.messages.pop()

###
# /user/:id.json
# gives back a json view
###
exports.view = (req, res) ->
  console.log 'Viewing user'
  user_id = req.params.id
  Application.find({userid: user_id}, (err, result) ->
    if err
      res.send(error: err)
    console.log result
    console.log 'found user'
    res.json(result)
  )

###
# /users/whitelist
# 
###
exports.whitelist = (req, res) ->
  user_id = req.params.id
  Application.find({userid: user_id}, (err, result) ->
    if err
      res.send(error: err)
    console.log result
    res.json(result)
  )

