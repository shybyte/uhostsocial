AppCtrl = ($route)->
  $route.when('/news', {template: 'partials/news.html', controller: NewsCtrl})
  $route.when('/view1', {template: 'partials/partial1.html', controller: MyCtrl1})
  $route.when('/view2', {template: 'partials/partial2.html', controller: MyCtrl2})
  $route.otherwise({redirectTo: '/news'});
  self = this;
  $route.onChangeListener( ->
    self.params = $route.current.params;
  )
  $route.parent(this)

MyCtrl1 = ->
  #nop
MyCtrl1.$inject = []


MyCtrl2 = ->
  #nop
MyCtrl2.$inject = []

this.AppCtrl = AppCtrl
this.MyCtrl1 = MyCtrl1
this.MyCtrl2 = MyCtrl2