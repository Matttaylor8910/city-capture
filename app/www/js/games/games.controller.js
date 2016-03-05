(function()
{
  angular
    .module('games')
    .controller('GamesController', GamesController);

  GamesController.$inject = ['$scope'];

  function GamesController($scope)
  {
    $scope.games = [
      {
        name: "Ferocious Toothbrush",
        startTime: 1457272800,
        endTime: 1457280000,
        players: [ 
          {}, {}, {} 
        ]
      }
    ];

    _.each($scope.games, function(game)
    {
      game.startMoment = moment.unix(game.startTime);
      game.endMoment= moment.unix(game.endTime);
    });

    console.log($scope.games);
  }
})();