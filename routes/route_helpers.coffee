User = require('../models/user')
exports.loadUser = (req, res, next) ->
  console.log 'inside loaduser'
  console.log req.session.user_id
  if req.session.user_id
    User.findById req.session.user_id, (err, user) ->
      console.log 'here it is:'
      console.log req.session.user_id
      console.log user
      if user
        console.log 'user found'
        req.currentUser = user
        next()
      else
        console.log 'user not found'
        res.redirect '/login'
  else
    console.log 'no user id'
    res.redirect '/login'

