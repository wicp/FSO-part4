const blogRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user")
  response.json(blogs)
})

blogRouter.post("/", async (request, response) => {
  const user = await User.findOne()
  const blog = new Blog({ ...request.body, user: user.id })
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
