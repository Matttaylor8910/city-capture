(function()
{
  angular
    .module('map')
    .config(config);

  function config($stateProvider, $urlRouterProvider) 
  {
    $stateProvider
      .state('app.map',
      {
        url: '/map',
        views: {
          menuContent: {
            controller: 'MapController',
            templateUrl: 'js/map/map.tpl.html'
          }
        }
      });
      
  }
})();