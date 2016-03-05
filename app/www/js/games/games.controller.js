(function()
{
  angular
    .module('games')
    .controller('GamesController', GamesController);

  GamesController.$inject = ['$scope', 'GamesService'];

  function GamesController($scope, GamesService)
  {
    $scope.players = players;

    // Get games from database
    GamesService.getGames().then(
    function(response)
    {
      $scope.games = response.data;
      _.each($scope.games, function(game)
      {
        game.startMoment = moment.unix(game.startTime);
        game.endMoment= moment.unix(game.endTime);
      });
    });

    function players(game)
    {
      return game.blueTeam.length + game.orangeTeam.length;
    }
  }
})();