class Post
  constructor: (@content) ->
    @created = new Date().getTime()
    @id = @created

this.Post = Post