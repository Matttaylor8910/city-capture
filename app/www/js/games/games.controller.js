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
        name: "Some Game"
      },
      {
        name: "some other thing"
      }
    ];
  }
})();