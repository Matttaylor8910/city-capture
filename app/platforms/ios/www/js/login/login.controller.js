(function()
{
  angular
    .module('login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$state', '$ionicHistory', 'LoginService', 'localStorage'];

  function LoginController($scope, $state, $ionicHistory, LoginService, localStorage)
  {
    $scope.state = '';
    $scope.login = login;

    if (localStorage.get('name', false) != false)
    {
      goTo('app.games');
    }

    function login(name)
    {
      LoginService.createUser(name).then(
        function successCallback(response)
        {
          $scope.state = 'good';
          localStorage.set('name', name);
          goTo('app.games');
        }, 
        function errorCallback(response)
        {
          $scope.state = 'error';
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