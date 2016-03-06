(function()
{
  angular
    .module('games')
    .controller('GamesController', GamesController);

  GamesController.$inject = ['$scope', '$interval', 'GamesService'];

  function GamesController($scope, $interval, GamesService)
  {
    $scope.players = players;
    $scope.getGameState = getGameState;

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



        });
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function getGameState(startTime, endTime)
    {
      if(_.isUndefined(startTime) || _.isUndefined(endTime)) return;

      var now = moment().valueOf()/1000;
      var gameState;
      if (now < startTime){
        gameState = "Starting Soon";
      } else if (now >= startTime && now < endTime) {
        gameState = "In Progress";
      } else {
        gameState = "Game Over";
      }

      return gameState;
    }

    function players(game)
    {
      return game.blueTeam.length + game.orangeTeam.length;
    }
  }
})();
