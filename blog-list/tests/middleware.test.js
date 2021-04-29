const { tokenExtractor } = require("../utils/middleware")

const response = jest.fn()
const next = jest.fn()

const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QgYmxvZyB0aGUgc2VxdWwiLCJ1c2VySWQiOiI2MDhhODFmYzg4MDRlNTBlOGE2ZWNkOTIiLCJpYXQiOjE2MTk3MTEwNjB9.-WqIvPRjHOj256MJDSbo6sCC6JCvjdFk8o5_f2QYmRM"

test("Token is extracted", () => {
  const request = {
    get: (field) =>
      field === "authorization"
        ? `Bearer ${jwt}`
        : undefined,
  }
  
  tokenExtractor(request,response,next)

  expect(next).toHaveBeenCalled()
  expect(request.token).toBe(jwt)
})

test("Token is undefined if no Authorization Header", () => {
  const request = {
    get: () => undefined
  }
  
  tokenExtractor(request,response,next)

  expect(next).toHaveBeenCalled()
  expect(request.token).toBeUndefined()
})

test("Token is undefined if Authorization header uses non-bearer scheme", () => {
  const request = {
    get: (field) =>
      field === "authorization"
        ? `Basic ${jwt}`
        : undefined,
  }
  
  tokenExtractor(request,response,next)

  expect(next).toHaveBeenCalled()
  expect(request.token).toBeUndefined()
})