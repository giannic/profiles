User = require('../models/user')
Application = require('../models/application')

#
# * GET users listing.
#
exports.list = (req, res) ->
  res.send "respond with a resource"

exports.json_all = (req, res) ->
    User.find().exec (err, results) ->
        if(!res.headerSent)
          res.json(results)

exports.register_post = (req, res) ->
  # res.render "hi"
  console.log req.body
  new User(req.body).save (err) ->
    if err then console.log 'ERROR'
    else console.log 'yeaaah'

exports.register_get = (req, res) ->
  res.render "register"

exports.login_post = (req, res) ->
  User.findOne email: req.body.email, (err, result) ->
    if result and result.authenticate(req.body.password)
      # set session user id
      req.session.user_id = result._id
      console.log 'logged in!'
      console.log req.session.user_id
      res.send {userid: result._id}
      # TODO: check if it's the chrome extension, if not, redirect
      # res.redirect '/'
    else
      console.log 'incorrect password'
      res.send {error: 'Incorrect password'}
      # res.redirect 'login'

exports.login_get = (req, res) ->
  console.log 'reached here'
  res.render "login"

exports.view = (req, res) ->
  console.log 'Viewing user'
  user_id = req.params.id
  Application.find({userid: user_id}, (err, result) ->
    if err
      res.send(error: err)
    res.json(result)
  )

  res.render "login"

