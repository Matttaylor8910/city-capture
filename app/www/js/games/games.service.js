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

    /**
     * obj has the following properties
     *  name: name of the player
     *  game: game id of the game joined
     *  team: the color of the team joined, 'blue' or 'orange'
     */
    function joinGame(obj)
    {
      return $http.post(url + 'games/join', obj);
    }

    function leaveGame(obj)
    {
      localStorage.setObject('gameJoined', obj);
    }

    function inGame(gameID, color)
    {
      var gameJoined = localStorage.getObject('gameJoined');
      return gameJoined.game === gameID && color === color;
    }
  }
})();