(function()
{
  angular
    .module('login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$state', '$ionicHistory', 'LoginService', 'localStorage'];

  function LoginController($scope, $state, $ionicHistory, LoginService, localStorage)
  {
    $scope.name ='';
    $scope.error = false;
    $scope.login = login;

    if (localStorage.get('name', false) != false)
    {
      goTo('app.games');
    }

    $scope.$watch('name', function(newVal)
    {
      $scope.error = false;
    });

    function login(name)
    {
      LoginService.createUser(name).then(
        function successCallback(response)
        {
          //True is good for state
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