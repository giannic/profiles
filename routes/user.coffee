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
  req.session.messages = req.session.messages or []
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
# pass in id
# returns list of user's tracked apps 
###
exports.whitelist = (req, res) ->
  user_id = req.params.id
  User.findById(user_id, (err, result) ->
    if err
      res.send(error: err)
    res.json(result.whitelist)
  )

###
# /users/whitelist
# pass in id
# returns list of user's tracked apps 
###
exports.reset_whitelist = (req, res) ->
  user_id = req.params.id
  User.findByIdAndUpdate(user_id,
    {whitelist: ["twitter.com",
                  "facebook.com",
                  "google.com",
                  "mail.google.com",
                  "tumblr.com",
                  "pinterest.com",
                  "youtube.com",
                  "linkedin.com",
                  "myspace.com",
                  "vimeo.com",
                  "blogger.com",
                  "pandora.com",
                  "spotify.com",
                  "github.com",
                  "stackoverflow.com",
                  "ycombinator.com",
                  "reddit.com",
                  "mint.com"] }
    (err, result) ->
      if err
        res.send(error: err)
      res.json(result.whitelist)
  )

###
# /users/allow
# accepts id, domain
# adds domain to user's list of tracked apps 
###
exports.allow = (req, res) ->
  user_id = req.body.id
  domain = req.body.domain

  User.findByIdAndUpdate(user_id, {$addToSet: { whitelist: domain }}, 
    (err, result) ->
      if err
        res.send(error: err)
      else
        res.send(success: "Added to allowed apps")
  )

###
# /users/allow
# accepts id, domain
# removes domain from user's list of tracked apps 
###
exports.disallow = (req, res) ->
  user_id = req.body.id
  domain = req.body.domain
  console.log "disallowing " + domain + " for " + user_id

  remove_from_whitelist(user_id, domain, res)

###
# /users/delete_app
# accepts id, domain
# deletes domain from database and removes it from list of user's tracked apps
# only deletes database entry for this user's version of the app
###
exports.delete_app = (req, res) ->
  user_id = req.body.id
  domain = req.body.domain

  Application.remove({userid: user_id, url: domain}, (err, result) ->
    console.log "remove function"
    console.log user_id 
    console.log domain 
#    if err
#      res.send(error: err)
#    else
#      res.send(success: result)
      remove_from_whitelist(user_id, domain, res)
  )


###
# /users/:id/apps.json
# accepts id
# returns Applications tracked by user of that id
###
exports.apps_json = (req, res) ->
  user_id = req.params.id

  Application.find(
    {userid: user_id},
    'category img url open close',
    (err, result) ->
      if err
        res.send(error: err)
      else
        res.send(apps: result)
  )

###
# Helper Functions
###

remove_from_whitelist = (user_id, domain, res) ->
  User.findByIdAndUpdate(user_id, {$pull: { whitelist: domain }}, 
    (err, result) ->
      if err
        res.send({error: err})
      else
        res.send({success: result})
  )
