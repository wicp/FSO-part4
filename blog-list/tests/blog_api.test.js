const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blog")
const User = require("../models/user")

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
    url: "test.com",
  },
]

const testUser = {
  username: "Jester",
  name: "Tester",
  passwordHash: "$2b$10$G.iV66RDLJ4fZaWYWVQZGejgu6pRcYE4OWX11RPfP6r3HcuzYh1O.",
}

let authHeader

beforeAll(async () => {
  await User.deleteMany({})
  const userObject = new User(testUser)
  await userObject.save()
  const login = await api
    .post("/api/login")
    .send({ username: testUser.username, password: "hunter1" })
  authHeader = `Bearer ${login.body.token}`
})

beforeEach(async () => {
  await Blog.deleteMany({})
  const savedUser = await User.findOne()
  for (let blog of testData) {
    blog.user = savedUser.id
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
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

test("Responses have an associated user", async () => {
  const response = await api.get("/api/blogs")
  expect(response.body[0].user).toMatchObject(testUser)
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
    .set("Authorization", authHeader)
    .expect(201)
    .expect("Content-Type", /application\/json/)
  //response from Post matches new blog
  expect(postResponse.body).toMatchObject(newBlog)

  //Get of all blogs now contains new blog
  const getResponse = await api.get("/api/blogs")
  expect(getResponse.body).toHaveLength(testData.length + 1)
  expect(getResponse.body[testData.length]).toMatchObject(newBlog)
})

test("Creating blogs forbidden when not logged in", async () => {
  const newBlog = {
    title: "New blog test data",
    author: "Jest",
    url: "localhost",
    likes: 0,
  }

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
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
    .set("Authorization", authHeader)
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

test("Missing title causes 400", async () => {
  const newBlog = {
    author: "Jest",
    url: "localhost",
    likes: 0,
  }

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", authHeader)
    .expect(400)
})

test("Missing url causes 400", async () => {
  const newBlog = {
    title: "New blog test data",
    author: "Jest",
    likes: 0,
  }

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", authHeader)
    .expect(400)
})

test("Deleting a blog", async () => {
  const getResponse = await api.get("/api/blogs")
  const blogToDelete = getResponse.body[0]
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", authHeader)
    .expect(204)
  const secondGet = await api.get("/api/blogs")
  expect(secondGet.body[0]).not.toMatchObject(blogToDelete)
  expect(secondGet.body).toHaveLength(testData.length - 1)
})

test("Updating a blog", async () => {
  const getResponse = await api.get("/api/blogs")
  const updatedBlog = { ...getResponse.body[0] }
  updatedBlog.likes += 1
  const putResponse = await api
    .put(`/api/blogs/${updatedBlog.id}`)
    .send({ likes: updatedBlog.likes })
  expect(putResponse.body.likes).toBe(updatedBlog.likes)
  const secondGet = await api.get("/api/blogs")
  expect(secondGet.body).toEqual(
    expect.arrayContaining([expect.objectContaining(updatedBlog)])
  )
})

test("Handle malformed update", async () => {
  const getResponse = await api.get("/api/blogs")
  const updatedBlog = getResponse.body[0]

  updatedBlog.likes = "oops"
  await api.put(`/api/blogs/${updatedBlog.id}`).send(updatedBlog).expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})
