const dummy = (blogs) => {
  blogs
  return 1
}

const totalLikes = (blogs) =>
  blogs.reduce((runningTotal, blog) => {
    if (blog.likes) return runningTotal + Number(blog.likes)
    else return runningTotal
  }, 0)

module.exports = {
  dummy,
  totalLikes,
}
