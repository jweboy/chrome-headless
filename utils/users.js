const mongoose = require('mongoose')
const Users = require('../models/users')

const upsertUser = (user) => {
  const DB_URL = 'mongodb://localhost:27017/test'

  console.log(mongoose.connect)

  // if (mongoose.connect.readyState === 0) {
  mongoose.connect(DB_URL)
  // }

  const condition = { email: user.email }
  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }

  Users.findOneAndUpdate(condition, user, options, (err, res) => {
    if (err) throw err
  })
}

module.exports = upsertUser
