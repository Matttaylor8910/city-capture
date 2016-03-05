(function()
{
	angular
		.module('games')
		.factory('GamesService', GamesService);

  function GamesService($http)
  {
    var url = 'http://cc.butthole.tv/v1/';

    return {
    	getGames: getGames,
      joinGame: joinGame
    };

    function getGames()
    {
    	return $http.get(url + 'games');
    }

    function joinGame(game)
    {
      return $http.post(url + 'games/join', game);
    }
  }
})();