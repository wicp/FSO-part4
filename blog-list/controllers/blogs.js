const blogRouter = require("express").Router()
const Blog = require("../models/blog")
const middleware = require("../utils/middleware")

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user")
  response.json(blogs)
})

blogRouter.post("/", middleware.userExtractor, async (request, response) => {
  const blog = new Blog({ ...request.body, user: request.user.id })
  const result = await blog.save()
  response.status(201).json(result)
})

blogRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) return response.status(204).end()

  if(blog.user.toString() === request.user.id) {
    blog.delete()
    response.status(204).end()
  }
  else {
    response.status(403).end()
  }
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
