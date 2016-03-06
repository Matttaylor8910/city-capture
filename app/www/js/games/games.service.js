(function()
{
	angular
		.module('games')
		.factory('GamesService', GamesService);

  function GamesService($http, localStorage)
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
      // if there is a game stored, we need to request to remove it
      if (!_.isUndefined(localStorage.getObject('gameJoined')) && !_.isUndefined(localStorage.getObject('gameJoined').game))
      {
        leaveGame(localStorage.getObject('gameJoined'));
      }
      localStorage.setObject('gameJoined', obj);
      return $http.post(url + 'games/join', obj);
    }

    function leaveGame(obj)
    {
      return $http.post(url + 'games/leave', obj);
    }
  }
})();