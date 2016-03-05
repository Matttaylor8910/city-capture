(function()
{
  angular
    .module('login')
    .config(config);

  function config($stateProvider, $urlRouterProvider) 
  {
    $stateProvider
      .state('app.login',
      {
        url: '/login',
        views: {
          menuContent: {
            controller: 'LoginController',
            templateUrl: 'app/login/login.tpl.html'
          }
        }
      });
      
    // If none of the above states are matched, use this as the fallback.
    $urlRouterProvider.otherwise('/app/login');
  }
})();