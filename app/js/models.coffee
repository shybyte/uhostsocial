class Post
  constructor: (@content) ->
    @created = new Date().getTime()
    @id = @created

class Friend
  constructor: (@name) ->
    @created = new Date().getTime()
    @id = @created

this.Post = Post
this.Friend = Friend