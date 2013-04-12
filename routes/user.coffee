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
      # if webkit
      if req.headers.origin
        if req.headers.origin.indexOf("chrome-extension") == -1
          # if not chrome extension
          req.session.messages.push err
          res.redirect "/register",
        else
          res.send {error: err}
      # else
      req.session.messages.push err
      res.redirect "/register",



      console.log 'Error in saving user'
    else
      # succeeded!
      console.log 'yeaaah registered bro'
      # if webkit
      if req.headers.origin
        if req.headers.origin.indexOf("chrome-extension") == -1
          # if not chrome extension
          req.session.messages.push 'Successfully registered! Please login.'
          res.redirect "/login"
        else
          res.send {userid: result._id}
      # else
      req.session.messages.push 'Successfully registered! Please login.'
      res.redirect "/login"



###
# /register
# The form for registration
###
exports.register_get = (req, res) ->
  res.render "register",
    title: "datapp"
    msg: req.session.messages.pop()

###
# /login
# The post request for logging in
# Takes in a email, userid
###
exports.login_post = (req, res) ->
  console.log 'here are the headers'
  console.log req.headers
  req.session.messages = req.session.messages or []
  # console.log req
  User.findOne email: req.body.email, (err, result) ->
    if result and result.authenticate(req.body.password)
      # set session user id
      req.session.user_id = result._id
      console.log 'logged in!'
      console.log req.session.user_id

      # if it is webkit
      if req.headers.origin
        if req.headers.origin.indexOf("chrome-extension") == -1
          # if not chrome extension
          req.session.messages.push 'Successfully logged in!'
          res.redirect "/",
        else
          console.log("sending userid");
          res.send {userid: result._id}
      # if it's an inferior browser
      else
        req.session.messages.push 'Successfully logged in!'
        res.redirect "/"
      # TODO: check if it's the chrome extension, if not, redirect
      # res.redirect '/'
    else
      console.log 'incorrect password'
      console.log 'dying here'
      if req.headers.origin
        if req.headers.origin.indexOf("chrome-extension") == -1
          console.log 'dying herei again'
          # if not chrome extension
          req.session.messages.push 'Error: Username and passwords don\'t match'
          res.redirect "/login"
        else
          res.send {error: 'Incorrect password'}
      else
        req.session.messages.push 'Error: Username and passwords don\'t match'
        res.redirect "/login"
    console.log("end login function");


###
# /login
# The view for the login form
###
exports.login_get = (req, res) ->
  req.session.messages = req.session.messages or []
  res.render "login",
    title: "datapp"
    msg: req.session.messages.pop()

###
# /logout
# The view for the login form
###
exports.logout = (req, res) ->
  # req.session.destroy()
  delete req.session.user_id
  req.session.messages.push "Successfully logged out!"
  res.redirect "login"


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
  console.log("user_id:" + user_id)
  User.findById(user_id, (err, result) ->
    if err
      res.send(error: err)
    res.json(result.whitelist)
  )

###
# /modifyapplist
# The view for the form to change allowed app list
###
exports.modify_app_list = (req, res) ->
  user_id = req.session.user_id

  # get the whitelist
  ###
  User.findById(user_id, (err, result) ->
    if err
      res.send(error: err)
    res.json(result.whitelist)
  )
  ###

  req.session.messages = req.session.messages or []
  user_id = req.session.user_id 
  res.render "modifyapplist",
    title: "Management"
    msg: req.session.messages.pop()


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
                  "reddit.com" ] }
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

  add_to_whitelist(user_id, domain, res)

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

# ---------------------------------
# Routes for front end add/delete from whitelist
# Not ideal, but not sure how to sync chrome extension and web
# page login
# ---------------------------------

###
# /users/whitelist_add
# accepts domain
# adds domain to user's list of tracked apps
###
exports.whitelist_add = (req, res) ->
  user_id = req.session.user_id 
  domain = req.body.domain

  console.log("adding " + domain + " to whitelist");

  add_to_whitelist(user_id, domain, res)

###
# /users/whitelist_remove
# accepts domain
# removes domain from user's list of tracked apps
###
exports.whitelist_remove = (req, res) ->
  user_id = req.session.user_id
  domain = req.body.domain
  console.log "disallowing " + domain + " for " + user_id

  remove_from_whitelist(user_id, domain, res)

###
# /users/delete_app
# Deletes data for an app for that user
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
# Helper Functions
# args: user_id, domain, response
# renders updated whitelist to response
###

remove_from_whitelist = (user_id, domain, res) ->
  User.findByIdAndUpdate(user_id, {$pull: { whitelist: domain }},
    (err, result) ->
      if err
        res.send({error: err})
      else
        res.send({success: {new_whitelist: result.whitelist} })
  )

add_to_whitelist = (user_id, domain, res) ->
  User.findByIdAndUpdate(user_id, {$addToSet: { whitelist: domain }},
    (err, result) ->
      if err
        res.send(error: err)
      else
        res.send({success: {new_whitelist: result.whitelist} })
  )

