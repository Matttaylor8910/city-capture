(function()
{
  angular
    .module('about')
    .config(config);

  function config($stateProvider, $urlRouterProvider) 
  {
    $stateProvider
      .state('app.about',
      {
        url: '/about',
        views: {
          menuContent: {
            controller: 'AboutController',
            templateUrl: 'js/about/about.tpl.html'
          }
        }
      });
  }
})();