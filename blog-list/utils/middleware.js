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

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
}
