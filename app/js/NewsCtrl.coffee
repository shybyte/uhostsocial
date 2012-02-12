NewsCtrl = ($updateView,createPostDAO)->
  self = this
  log(@username)
  postDAO = createPostDAO(@username)
  @posts = postDAO.readPosts()
  postDAO.setChangeListener (posts)->
    self.posts = posts
    $updateView()
  @addPost = ->
    newPost = new Post(@text)
    @posts.unshift(newPost)
    @text = ''
    @savePosts()
  @deletePost = (post)->
    angular.Array.remove(@posts, post)
    @savePosts()
  @savePosts = ->
    postDAO.savePosts(@posts)


this.NewsCtrl = NewsCtrl