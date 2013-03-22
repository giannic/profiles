#
# * GET home page.
#
exports.index = (req, res) ->
  console.log req.session
  console.log req.session.messages
  req.session.messages = req.session.messages or []

  res.render "home",
    title: "Profiles"
    msg: req.session.messages.pop()

exports.grid = (req, res) ->
  console.log req.session
  console.log req.session.messages
  req.session.messages = req.session.messages or []

  res.render "grid",
    title: "Profiles"
    msg: req.session.messages.pop()

