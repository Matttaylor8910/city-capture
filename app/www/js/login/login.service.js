(function()
{
  angular
    .module('login')
    .factory('LoginService', LoginService);

  function LoginService($http)
  {
    var url = "";

    return {
      createUser: createUser
    };

    function createUser(name)
    {
      $http.post(url + "/v1/add/user/" + name);
    }
  }
})();