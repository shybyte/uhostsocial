class LocalhostDAO
  constructor: (@username,@keyName)->
    self = this
    @key = @username+'.'+@keyName
    @onChangeListener = ->
      #
    window.addEventListener('storage', (event) ->
        if event.key == self.key
          self.onChangeListener(JSON.parse(event.newValue))
    )
  readAll: ->
    JSON.parse(localStorage[@key] ? "[]")
  saveAll: (items) ->
    localStorage[@key] = JSON.stringify(items)
  setChangeListener: (onChangeListener)->
    @onChangeListener = onChangeListener

class FriendsPostsDAO
  constructor: (@username) ->
    friendsDAO = new LocalhostDAO(@username,'friends')
    @friends = friendsDAO.readAll()
  readAll: ->
    allPosts = []
    for friend in @friends
      postDAO = new LocalhostDAO(friend.name,'posts')
      allPosts = allPosts.concat(postDAO.readAll())
    return allPosts


angular.service('createPostDAO', ->
  return (username) ->
    new LocalhostDAO(username,'posts')
)

angular.service('createFriendsDAO', ->
  return (username) ->
    new LocalhostDAO(username,'friends')
)

angular.service('createFriendsPostsDAO', ->
    return (username) ->
      new FriendsPostsDAO(username)
)