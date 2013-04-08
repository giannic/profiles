helpers = require('./route_helpers')
#
# * GET home page.
#
exports.index = (req, res) ->
  console.log req.session
  console.log req.session.messages
  helpers.loadUser req, res, ->
    req.session.messages = req.session.messages or []
    console.log 'this is the home'
    console.log req.session.user_id

    res.render "index",
      title: "datapp"
      msg: req.session.messages.pop()

exports.grid = (req, res) ->
  console.log req.session
  console.log req.session.messages
  req.session.messages = req.session.messages or []

  res.render "grid",
    title: "datapp"
    msg: req.session.messages.pop()
