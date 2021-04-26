const userRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")

userRouter.get("/", async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

userRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body

  const raiseValidationError = (msg) => {
    const ValidationError = new Error(msg)
    ValidationError.name = "ValidationError"
    throw ValidationError
  }

  if (!username) raiseValidationError("username is required")
  if (!password) raiseValidationError("password is required")
  if (username.length < 3) raiseValidationError("username must be at least 3 characters")
  if (password.length < 3) raiseValidationError("password must be at least 3 characters")

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  const result = await user.save()
  response.status(201).json(result)
})

module.exports = userRouter
