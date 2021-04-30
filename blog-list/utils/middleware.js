const User = require("../models/user")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../utils/config")

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  console.log(error.name, error.message)
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const matches = request.get("Authorization")?.match(/^Bearer (\S+)/)
  if (matches instanceof Array && matches[1]) {
    request.token = matches[1]
  }
  next()
}

const userExtractor = (request, response, next) => {
  tokenExtractor(request, response, async () => {
    if (!request.token) return response.status(401).end()
    let decodedToken
    try {
      decodedToken = jwt.verify(request.token, JWT_SECRET)
    } catch {
      return response.status(401).end()
    }
    const user = await User.findOne({ _id: decodedToken.userId })
    if (!user) return response.status(401).end()
    request.user = user
    next()
  })
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
