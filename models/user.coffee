mongoose = require 'mongoose'
crypto = require 'crypto'

User = new mongoose.Schema { email: {type: String, index: {unique: true}}, hashed_password: String, salt: String }

User.methods.makeSalt = ->
  return Math.round(new Date().valueOf() * Math.random() + '')

User.methods.encryptPassword = (password) ->
  return crypto.createHmac('sha1', @.salt).update(password).digest('hex')

User.methods.authenticate = (plain_pass) ->
  console.log 'plain' + plain_pass
  return (@.encryptPassword plain_pass) == @.hashed_password

User.virtual('password')
  .get(-> return @.hashed_password)
  .set (password) ->
    @.salt = @.makeSalt()
    @.hashed_password = @.encryptPassword(password)
    console.log 'password has been hashed and created!'

module.exports = mongoose.model 'User', User

