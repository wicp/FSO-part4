const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const User = require("../models/user")

const api = supertest(app)

const setupData = [
  {
    username: "test user",
    name: "rest test",
    password: "hunter1",
    passwordHash: "$2b$10$4vs2ftzk1JrentOv/Y2PKum//EZgJF6.fBB3igQhSYWAaGLb8i4je",
  },
  {
    username: "test user the sequel",
    name: "tester 2",
    passwordHash: "test.com",
  },
]

beforeEach(async () => {
  await User.deleteMany({})
  for (let user of setupData) {
    const userObject = new User(user)
    await userObject.save()
  }
})

test("users are returned as json", async () => {
  await api
    .get("/api/users")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("All test items are returned", async () => {
  const response = await api.get("/api/users")
  expect(response.body).toHaveLength(setupData.length)
})

test("Responses have a username, name and password hash. Plaintext password not stored", async () => {
  const response = await api.get("/api/users")
  expect(response.body[0].username).toBeDefined()
  expect(response.body[0].name).toBeDefined()
  expect(response.body[0].passwordHash).toBeDefined()
  expect(response.body[0].password).not.toBeDefined()
})

test("User can be created", async () => {
  const testUser = {
    username: "test data",
    name: "tester",
    password: "testing",
  }
  const postResponse = await api.post("/api/users").send(testUser).expect(201)
  delete testUser.password
  expect(postResponse.body).toMatchObject(testUser)
})

test("Username is required", async () => {
  const testUser = {
    name: "foo",
    password: "bar",
  }
  await api.post("/api/users").send(testUser).expect(400)
})

test("Password is required", async () => {
  const testUser = {
    username: "baz",
    name: "foo",
  }
  await api.post("/api/users").send(testUser).expect(400)
})

test("Username must be at least 3 characters", async () => {
  const testUser = {
    username: "fo",
    name: "bar",
    password: "baz",
  }
  await api.post("/api/users").send(testUser).expect(400)
})

test("Password must be at least 3 characters", async () => {
  const testUser = {
    username: "foo",
    name: "bar",
    password: "bz",
  }
  await api.post("/api/users").send(testUser).expect(400)
})

test("Username must be unique", async () => {
  await api.post("/api/users").send(setupData[0]).expect(400)
})

test("Login with good credentials is succesful", async () => {
  const postResponse = await api.post("/api/login").send(setupData[0]).expect(200)
  expect(postResponse.body.token).toBeDefined()
})

afterAll(() => {
  mongoose.connection.close()
})
