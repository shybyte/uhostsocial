FriendsCtrl = ($updateView,createFriendsDAO)->
  self = this
  dao = createFriendsDAO(@username)
  @friends = dao.readAll()
  dao.setChangeListener (friends)->
    self.friends = friends
    $updateView()
  @addFriend = ->
    @friends.unshift(new Friend(@name))
    @name = ''
    @saveFriends()
  @deleteFriend = (friend)->
    angular.Array.remove(@friends, friend)
    @saveFriends()
  @saveFriends = ->
    dao.saveAll(@friends)


this.FriendsCtrl = FriendsCtrl