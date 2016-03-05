(function()
{
  angular
    .module('games')
    .controller('GameDetailController', GameDetailController);

  GameDetailController.$inject = ['$scope', '$stateParams', 'GamesService'];

  function GameDetailController($scope, $stateParams, GamesService)
  {
    // $scope.game = $stateParams.game;
    // console.log(game);
  }
})();