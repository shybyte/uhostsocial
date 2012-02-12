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


angular.service('createPostDAO', ->
  return (username) ->
    new LocalhostDAO(username,'posts')
)

angular.service('createFriendsDAO', ->
  return (username) ->
    new LocalhostDAO(username,'friends')
)