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
            templateUrl: 'js/games/games.tpl.html',
            controller: 'GamesController'
          }
        }
      })
      .state('app.game-detail',
      {
        url: '/game-detail',
        params: {
          'game': ''        
        },
        views: {
          menuContent: {
            templateUrl: 'js/games/game-detail.tpl.html',
            controller: 'GameDetailController'
          }
        }
      });
  }
})();