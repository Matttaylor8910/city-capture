(function()
{
  angular
    .module('login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$state', '$ionicHistory', 'LoginService', 'localStorage'];

  function LoginController($scope, $state, $ionicHistory, LoginService, localStorage)
  {
    if (localStorage.get('name', false) != false)
    {
      goTo('app.games');
    }

    $scope.login = login;

    function login(name)
    {
      LoginService.createUser(name).then(
        function successCallback(response)
        {
          $scope.error = false;
          localStorage.set('name', name);
          goTo('app.games');
        }, 
        function errorCallback(response)
        {
          $scope.error = true;
        });
    }

    function goTo(state)
    {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go(state);
    }
  }
})();