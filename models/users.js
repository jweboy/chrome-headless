const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  dateCrawled: Date
})

const Users = mongoose.model('users', userSchema)

module.exports = Users
