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
  Application.findOneAndUpdate(
    { userid: req.body.userid, url: req.body.url },
    {
      $push: {open: req.body.open_date}, 
      $inc: {open_count: 1},
      $set: {
              category: req.body.category, 
              userid: req.body.userid, 
              url: req.body.url, 
              img: req.body.img_url
            }
    }, 
    {upsert: true},
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
  # Check that it's valid. If the open and close sizes are already equal, don't save!!!
  # TODO: Refactor. Using a nested db call....
  Application.findById(req.body.appid, (err, data) ->
    if err then res.send(error: "Could not update database: App Close")
    if (not data)
      res.send(error: "Could not update database: Null value")
    if data.close.length == data.open.length
      res.send(error: "Could not update database: Close and Open times are already equal!")
    if data.close.length > data.open.length
      res.send(error: "Could not update database: More close times than open times.")

    Application.findByIdAndUpdate(
      req.body.appid, 
      { 
        $push: {close: req.body.close_date},
        $inc: {close_count: 1}, 
      }, 
      { upsert: true },
      (err, results) ->
        console.log('close updated!')
        console.log('results: ' + results)
        console.log('error: ' + err)
        if err then res.send(error: "Could not update database: App Close")
        res.send(success: "Database updated: App close")
    )

  )

###
# /apps/delete
# appid 
###
exports.delete = (req, res) ->
  app_id = req.body.appid
  Application.remove({_id: app_id}, (err, result) ->
    console.log result 
    if err
      res.send(error: err)
    else if not result
      console.log "not result"
      res.send(error: "Could not find any application with id: " + app_id)
    else
      res.send(success: result)
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


