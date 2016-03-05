(function()
{
	angular
		.module('games')
		.factory('GamesService', GamesService);

  function GamesService($http)
  {
    return {
    	getGames: getGames
    };

    function getGames()
    {
    	return $http.get('json/games.json');
    }
  }
})();