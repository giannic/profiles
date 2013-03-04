user = require('../models/user')

#
# * GET users listing.
#
exports.list = (req, res) ->
  res.send "respond with a resource"

exports.json_all = (req, res) ->
    user.find().exec (err, results) ->
        if(!res.headerSent)
          res.json(results)

exports.register_post = (req, res) ->
  # res.render "hi"
  console.log req.body
  new user(req.body).save (err) ->
    if err then console.log 'ERROR'
    else console.log 'yeaaah'

exports.register_get = (req, res) ->
  res.render "register"

exports.login_post = (req, res) ->
  user.findOne email: req.body.email, (err, result) ->
    if result and result.authenticate(req.body.password)
      # set session user id
      req.session.user_id = result._id
      console.log 'logged in!'
      console.log req.session.user_id
      res.redirect '/'
    else
      console.log 'incorrect password'
      res.redirect 'login'

exports.login_get = (req, res) ->
  console.log 'reached here'
  res.render "login"
