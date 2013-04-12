Application = require('../models/application')
User = require('../models/user')
helpers = require('./route_helpers')

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
  name = req.body.app_name
  url = req.body.url
  if not name
    i = url.lastIndexOf(".")
    name = url.substring(0, i)

  console.log(name)
  Application.findOneAndUpdate(
    { userid: req.body.userid, url: req.body.url },
    {
      $push: {open: req.body.open_date},
      $inc: {open_count: 1},
      $set: {
              category: req.body.category,
              userid: req.body.userid,
              url: url,
              img: req.body.img_url
              #name: req.body.app_name
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
# /apps/create
# userid, url, category, img_url, name
###
exports.create = (req, res) ->
  console.log('creating app')

  properties = [{
    category: req.body.category, 
    name: req.body.app_name,
    userid: req.session.user_id,
    img: req.body.image_url, # url
    url: req.body.app_url }]
  Application.create(properties, (err, data) ->
    if err
      console.log(err)
      res.send(error: "Could not create app")
    else
      res.send(success: data)
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
      return
    if data.close.length == data.open.length
      res.send(error: "Could not update database: Close and Open times are already equal!")
      return
    if data.close.length > data.open.length
      res.send(error: "Could not update database: More close times than open times.")
      return

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
  Application.findOne {_id: app_id}, (err, result) ->
    if err
      res.send(error: err)
    if not result
      res.send(error: "Could not find any application with id: " + app_id)

    res.json result


###
# POST /apps/category
# category, app name
###
exports.update_category = (req, res) ->
  category = req.body.category
  url = req.body.url
  user_id = req.session.user_id
  #app_id = req.body.appid

  Application.findOneAndUpdate(
    {url: url, userid: user_id}, 
    {$set: { category: category } },
    {upsert: true}, 
    (err, result) ->
      if err
        console.log "ERROR: Category unable to be updated."
        res.send error: err
        return
      else
        console.log "Category updated."
        res.send success: "Category updated."
  )

exports.get_by_user = (req, res) ->
  helpers.loadUser req, res, ->
    Application.find userid: req.session.user_id, 'category img url open close open_count close_count',
      (err, result) ->
        if err
          console.log 'error' + err
          res.send(error: err)
        else
          console.log 'userid ' + req.session.user_id
          console.log 'success ' + result
          console.log result
          res.json result

# get applications for this user that are on whitelist
# if there is no userid, then don't return any data, redirect to login
exports.get_apps_on_whitelist = (req, res) ->
  apps = []
  #userid = "515e00a1b84f094dd5000001" 
  helpers.loadUser req, res, ->
    # get all applications for this user
    Application.find({userid: userid}, 'category img url open close open_count close_count',
      (err, result) ->
        # render error if there is one
        if err
          console.log 'error' + err
          res.send(error: err)
        # get whitelist
        else
          apps = result
          whitelist = []
          User.findById(userid, {whitelist}, (err, result) ->
            if err then res.send(error: err)
            whitelist = result['whitelist']
            output = (app for app in apps when app['url'] in whitelist)
            res.send(apps: output)
          )
    )


