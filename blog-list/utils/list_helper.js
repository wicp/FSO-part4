const _ = require("lodash")

const dummy = (blogs) => {
  blogs
  return 1
}

const totalLikes = (blogs) =>
  blogs.reduce((runningTotal, blog) => {
    if (blog.likes) return runningTotal + Number(blog.likes)
    else return runningTotal
  }, 0)

const favouriteBlog = (blogs) =>
  blogs.reduce((favouriteBlog, blog) => {
    const { title, author, likes } = blog
    if (!favouriteBlog?.likes || likes > favouriteBlog.likes)
      return { title, author, likes }
    else return favouriteBlog
  }, undefined)

const mostBlogs = (blogs) =>
  _(blogs)
    .countBy("author")
    .map((blogCount, author) => {
      return { author, blogs: blogCount }
    })
    .maxBy("blogs")

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
}
