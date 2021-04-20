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

test("Responses have an id field", async () => {
  const response = await api.get("/api/blogs")
  expect(response.body[0].id).toBeDefined()
})

test("New blogs are saved correctly", async () => {
  const newBlog = {
    title: "New blog test data",
    author: "Jest",
    url: "localhost",
    likes: 0,
  }

  const postResponse = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/)
  //response from Post matches new blog
  expect(postResponse.body).toMatchObject(newBlog)

  //Get of all blogs now contains new blog
  const getResponse = await api.get("/api/blogs")
  expect(getResponse.body).toHaveLength(testData.length + 1)
  expect(getResponse.body[testData.length]).toMatchObject(newBlog)
})

test("Missing Likes field defaults to 0", async () => {
  const newBlog = {
    title: "New blog test data",
    author: "Jest",
    url: "localhost",
  }

  const postResponse = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/)
  
  newBlog.likes = 0 // setup new Blog to match expected response
  //response from Post matches new blog
  expect(postResponse.body).toMatchObject(newBlog)

  //Get of all blogs now contains new blog
  const getResponse = await api.get("/api/blogs")
  expect(getResponse.body).toHaveLength(testData.length + 1)
  expect(getResponse.body[testData.length]).toMatchObject(newBlog)
})

afterAll(() => {
  mongoose.connection.close()
})
