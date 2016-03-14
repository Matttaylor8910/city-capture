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
    $scope.getDistanceFromLatLon = getDistanceFromLatLon;

    // Update timers every second
    $scope.timers = $interval(updateTimers, 1000);
    updateLocation();

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
        var gameJoined = localStorage.getObject('gameJoined');
        $scope.playerTeam = gameJoined.game === newVal.$id ? gameJoined.team : undefined;
        $scope.start = moment.unix(newVal.startTime).format('h:mm a');
        $scope.end = moment.unix(newVal.endTime).format('h:mm a');
        var now = moment().valueOf()/1000;
        if (!$scope.duration)
          $scope.duration = now > newVal.startTime ? newVal.endTime - now : newVal.endTime - newVal.startTime;
        $scope.timeTillGame = now < newVal.startTime ? newVal.startTime - now : 0;
        $scope.blue = blue;
        $scope.orange = orange;
        $scope.joined = joinTeamArrays(newVal.orangeTeam, newVal.blueTeam);
        if(!$scope.locationInterval && (_.contains($scope.mapGame.orangeTeam, localStorage.get('name')) || _.contains($scope.mapGame.blueTeam, localStorage.get('name'))))
          $scope.locationInterval = $interval(sendLocation, 1000);
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
          $interval.cancel($scope.timers);
      }
      if ($scope.timeTillGame && now <= $scope.game.startTime)
      {
        $scope.timeTillGame--;
        $scope.state = 'join';
      }
    }

    function updateLocation()
    {
      var options = {
        enableHighAccuracy: true
      };
      navigator.geolocation.watchPosition(onSuccess, null, options);
    }

    function onSuccess(pos)
    {
      $scope.myLat = pos.coords.latitude;
      $scope.myLong = pos.coords.longitude;
    }

    function joinTeamArrays(orangeTeam, blueTeam)
    {
      var i = 0;
      var joined = [];
      $scope.orangeList = [];
      $scope.blueList = [];

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

    function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d * 0.621371; // Covert back to miles
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    function sendLocation()
    {
      navigator.geolocation.getCurrentPosition(onSuccess);
      if(myLat && myLong)
        postLocation({team: $scope.playerTeam, game: $scope.game.$id, lat: $scope.myLat, long: $scope.myLong });
    }

    function postLocation(userGame)
    {
      var url = 'http://cc.butthole.tv/v1/';

      $http.post(url + 'location', userGame);
    }
  }
})();