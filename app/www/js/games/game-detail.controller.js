(function()
{
  angular
    .module('games')
    .controller('GameDetailController', GameDetailController);

  GameDetailController.$inject = ['$scope', '$stateParams', 'GamesService', 'localStorage'];

  function GameDetailController($scope, $stateParams, GamesService, localStorage)
  {
    $scope.game = $stateParams.game;
    $scope.join = join;

    function join(color, game)
    {
      var obj = {
        name: localStorage.get('name'),
        game: game.id,
        team: color
      }
      GamesService.joinGame(obj);
    }
  }
})();