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

module.exports = {
  unknownEndpoint,
  errorHandler,
}
