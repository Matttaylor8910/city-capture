(function()
{
  angular
    .module('games')
    .controller('GamesController', GamesController);

  GamesController.$inject = ['$scope', '$interval', 'GamesService'];

  function GamesController($scope, $interval, GamesService)
  {
    $scope.players = players;

    refresh();
    $interval(refresh, 5000);

    // Get games from database
    function refresh()
    {
      GamesService.getGames().then(
      function(response)
      {
        $scope.games = response.data;
        _.each($scope.games, function(game)
        {
          game.startMoment = moment.unix(game.startTime);
          game.endMoment= moment.unix(game.endTime);

          var now = moment().valueOf()/1000;
          $scope.gameState;
          if (now < game.startTime){
            $scope.gameState = "Starting Soon";
          } else {
            $scope.gameState = "In Progress";
          }

        });
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function players(game)
    {
      return game.blueTeam.length + game.orangeTeam.length;
    }
  }
})();
