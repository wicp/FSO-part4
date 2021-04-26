const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const User = require("../models/user")

const api = supertest(app)

const testData = [
  {
    username: "test user",
    name: "rest test",
    password: "localhost",
  },
  {
    username: "test user the sequel",
    name: "tester 2",
    password: "test.com",
  },
]

beforeEach(async () => {
  await User.deleteMany({})
  for (let user of testData) {
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
  expect(response.body).toHaveLength(testData.length)
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
  const postResponse = await api.post("/api/users").expect(201)
  delete testUser.password
  expect(postResponse.body).toMatchObject(testUser)
})

afterAll(() => {
  mongoose.connection.close()
})
