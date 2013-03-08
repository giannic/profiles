Application = require('../models/application')

# App = new mongoose.Schema
  # category: String,
  # user: Number,  # user id
  # open: [Number]
  # close: [Number]
  # img: String,  # url
  # url: String  # DOMAIN url

###
# json of all apps
###
exports.json_all = (req, res) ->
    Application.find().exec (err, results) ->
        if(!res.headerSent)
          res.json(results)
###
# /apps/open
# req.body:
# userid, url, open_date, category, img_url
###
exports.open = (req, res) ->
  # res.render "hi"
  console.log req.body
  Application.findOneAndUpdate({ userid: req.body.userid, url: req.body.url},
  {$push: {open: req.body.open_date}, $set: {category: req.body.category, userid: req.body.userid, url: req.body.url, img: req.body.img_url}}, {upsert: true},
      (err, results) ->
        console.log('open updated')
        console.log(results)
        console.log(err)
        if err then res.send(error: "Could not update database: App Open")
        res.send({appid: results.id})
  )

###
# /apps/close
# req.body:
# close, appid
###
exports.close = (req, res) ->
  # res.render "hi"
  Application.findByIdAndUpdate(req.body.appid,
  {$push: {close: req.body.close_date}}, {upsert: true},
      (err, results) ->
        console.log('close updated!')
        console.log(results)
        console.log(err)
        if err then res.send(error: "Could not update database: App Close")
        res.send(success: "Database updated: App close")
  )

###
# testing purposes only
###
exports.new_test = (req, res) ->
  # res.render "hi"
  res.render "application"

###
# /apps/:id.json
###
exports.view = (req, res) ->
  # res.render "hi"
  app_id = req.params.id
  Application.findOne({_id: app_id}, (err, result) ->
    if err
      res.send(error: err)
    if not result
      res.send(error: "Could not find any application with id: " + app_id)

    res.json result
  )


