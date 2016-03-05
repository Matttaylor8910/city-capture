(function()
{
  angular
    .module('games')
    .controller('GameDetailController', GameDetailController);

  GameDetailController.$inject = ['$scope', 'GamesService'];

  function GameDetailController($scope, GamesService)
  {

  }
})();