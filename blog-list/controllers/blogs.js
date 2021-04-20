const blogRouter = require("express").Router()
const Blog = require("../models/blog")

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
})

blogRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put("/:id", async (request, response) => {
  if (request.body.likes && !Number.isInteger(request.body.likes)) {
    const ValidationError = new Error("Likes must be an integer")
    ValidationError.name = "ValidationError"
    throw ValidationError
  }
  const result = await Blog.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  })
  response.json(result)
})

module.exports = blogRouter
