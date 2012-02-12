NewsCtrl = ($updateView,createPostDAO)->
  self = this
  log(@username)
  postDAO = createPostDAO(@username)
  @posts = postDAO.readAll()
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
    @avePosts()
  @savePosts = ->
    postDAO.saveAll(@posts)


this.NewsCtrl = NewsCtrl