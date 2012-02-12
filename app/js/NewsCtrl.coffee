NewsCtrl = ($updateView,createPostDAO,createFriendsPostsDAO)->
  self = this
  postDAO = createPostDAO(@username)
  friendsPostsDAO = createFriendsPostsDAO(@username)
  myPosts = postDAO.readAll()
  @posts = []

  postDAO.setChangeListener (posts)->
    myPosts = posts
    update()

  @addPost = ->
    newPost = new Post(@text)
    myPosts.unshift(newPost)
    @text = ''
    @savePosts()

  @deletePost = (post)->
    angular.Array.remove(myPosts, post)
    @savePosts()

  @savePosts = ->
    postDAO.saveAll(myPosts)

  update = ->
    friendsPosts = friendsPostsDAO.readAll()
    self.posts = myPosts.concat(friendsPosts)
    $updateView()

  setInterval(update,1000)

  update()


this.NewsCtrl = NewsCtrl