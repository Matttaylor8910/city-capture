(function()
{
  angular
    .module('games')
    .config(config);

  function config($stateProvider, $urlRouterProvider) 
  {
    $stateProvider
      .state('app.games',
      {
        url: '/games',
        views: {
          menuContent: {
            controller: 'GamesController',
            templateUrl: 'js/games/games.tpl.html'
          }
        }
      });
  }
})();