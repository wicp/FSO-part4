const loginRouter = require("express").Router()
const User = require("../models/user")
const config = require("../utils/config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const result = await bcrypt.compare(password, user.passwordHash)
  if (!result) response.status(401).json({error: "Invalid username or password"})
  const payload = {
    username,
    userId: user.id
  }
  const token = jwt.sign(payload,config.JWT_SECRET)
  response.json({token})
})

module.exports = loginRouter
