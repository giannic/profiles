mongoose = require 'mongoose'
Application = require 'Application'

Cluster = new mongoose.Schema name: String

Cluster.methods.getApplications = (name, user_id) ->
  return Application.find({user: user_id, })

# User.methods.makeSalt = ->
#   return Math.round(new Date().valueOf() * Math.random() + '')

# User.methods.encryptPassword = (password) ->
#   return crypto.createHmac('sha1', @.salt).update(password).digest('hex')

# User.methods.authenticate = (plain_pass) ->
#   console.log 'plain' + plain_pass
#   return (@.encryptPassword plain_pass) == @.hashed_password

# User.virtual('password')
#   .get(-> return @.hashed_password)
#   .set (password) ->
#     @.salt = @.makeSalt()
#     @.hashed_password = @.encryptPassword(password)
#     console.log 'password has been hashed and created!'

