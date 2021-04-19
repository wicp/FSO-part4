const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blog")

const api = supertest(app)

const testData = [
  {
    title: "test blog",
    author: "rest test",
    url: "localhost",
    likes: 5,
  },
  {
    title: "test blog the sequel",
    author: "tester 2",
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  testData.forEach(async (blog) => {
    const blogObject = new Blog(blog)
    await blogObject.save()
  })
})

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("All test items are returned", async () => {
  const response = await api.get("/api/blogs")
  expect(response.body).toHaveLength(testData.length)
})

afterAll(() => {
  mongoose.connection.close()
})
