class PostDAO
  constructor: (@username)->
    self = this
    @key = @username+'.posts'
    log(@key)
    @onChangeListener = ->
      #
    window.addEventListener('storage', (event) ->
        if event.key == self.key
          self.onChangeListener(JSON.parse(event.newValue))
    )
  readPosts: ->
    JSON.parse(localStorage[@key] ? "[]")
  savePosts: (posts) ->
    localStorage[@key] = JSON.stringify(posts)
  setChangeListener: (onChangeListener)->
    @onChangeListener = onChangeListener


angular.service('createPostDAO', ->
  return (username) ->
    new PostDAO(username)
)