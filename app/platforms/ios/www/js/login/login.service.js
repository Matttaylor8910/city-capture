(function()
{
  angular
    .module('login')
    .factory('LoginService', LoginService);

  function LoginService($http)
  {
    var url = "http://cc.butthole.tv";

    return {
      loggedIn  : loggedIn,
      createUser: createUser
    };

    function loggedIn()
    {
      return 
    }

    function createUser(name)
    {
      return $http.post(url + "/v1/users/add/" + name);
    }
  }
})();