(function()
{
  angular
    .module('capture-points')
    .config(config);

  function config($stateProvider, $urlRouterProvider) 
  {
    $stateProvider
      .state('app.capture-points',
      {
        url: '/capture-points',
        views: {
          menuContent: {
            controller: 'CapturePointsController',
            templateUrl: 'js/capture-points/capture-points.tpl.html'
          }
        }
      });
  }
})();