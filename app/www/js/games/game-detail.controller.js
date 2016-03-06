(function()
{
  angular
    .module('games')
    .controller('GameDetailController', GameDetailController);

  GameDetailController.$inject = ['$scope', '$state', '$stateParams', '$interval', '$ionicHistory', '$firebase', 'GamesService', 'localStorage'];

  function GameDetailController($scope, $state, $stateParams, $interval, $ionicHistory, $firebase, GamesService, localStorage)
  {
    bindGames($stateParams.id);

    $scope.join = join;

    // Update timers every second
    $interval(updateTimers, 1000);

    function join(color, game)
    {
      var obj = {
        name: localStorage.get('name'),
        game: game.$id,
        team: color
      };
      GamesService.joinGame(obj);
    }

    function bindGames(gameID)
    {
      var url = "https://torrid-fire-239.firebaseio.com/games/";
      var ref = new Firebase(url + gameID);
      var sync = $firebase(ref);
      var syncObject = sync.$asObject();
      syncObject.$bindTo($scope, "game")
        .then(function initializePage()
        {
          // Nothing to do for now
        });
    }

    /**
     * This shit makes firebase pretty
     */
    $scope.$watch('game', function(newVal)
      {
        if (_.isUndefined(newVal)) return;
        if (!newVal.locations)
        {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('app.games');
        }
        var orange = 0, blue = 0;
        _.each(newVal.locations, function(location)
        {
          if (location.blueScore > 0)
          {
            blue++;
          }
          if (location.orangeScore > 0)
          {
            orange++;
          }
        });
        $scope.start = moment.unix(newVal.startTime).format('h:mm a');
        $scope.end = moment.unix(newVal.endTime).format('h:mm a');
        var now = moment().valueOf()/1000;
        $scope.duration = now > newVal.startTime ? newVal.endTime - now : newVal.endTime - newVal.startTime;
        $scope.timeTillGame = now < newVal.startTime ? newVal.startTime - now : 0;
        $scope.blue = blue;
        $scope.orange = orange;
        $scope.joined = joinTeamArrays(newVal.orangeTeam, newVal.blueTeam);
      });

    function updateTimers()
    {
      // game timer
      var now = moment().valueOf()/1000;
      if ($scope.duration && now >= $scope.game.startTime)
      {
        $scope.duration--;
        $scope.state = 'inProgress';
        if ($scope.duration <= 0)
          $interval.cancel(stop);
      }
      if ($scope.timeTillGame && now <= $scope.game.startTime)
      {
        $scope.timeTillGame--;
        $scope.state = 'join';
      }
    }

    function joinTeamArrays(orangeTeam, blueTeam)
    {
      var i = 0;
      var joined = [];
      $scope.orangeList = [];
      $scope.blueList = [];

      // fix up weird firebase shit
      _.each(orangeTeam, function(name){ $scope.orangeList.push(name) });
      _.each(blueTeam, function(name){ $scope.blueList.push(name) });

      // while at least one ofg them is not undefined
      while (!_.isUndefined($scope.orangeList[i]) || !_.isUndefined($scope.blueList[i]))
      {
        joined.push(
        {
          orange: _.isUndefined($scope.orangeList[i]) ? "" : $scope.orangeList[i],
          blue: _.isUndefined($scope.blueList[i]) ? "" : $scope.blueList[i]
        })
        i++;
      }
      return joined;
    }
  }
})();