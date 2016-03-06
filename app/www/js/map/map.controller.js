(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope', '$http', '$stateParams','$firebase','$interval','$ionicLoading','localStorage'];

  function MapController($scope, $http, $stateParams, $firebase, $interval, $ionicLoading, localStorage)
  {
      var myLatlng, myLocation, locationIcon, mapOptions, map, watchOptions, googleInfoWindow, playerTeam;

      initLocalStorage($stateParams.gameID);

      function initMap()
      {
          mapOptions = {
            center: new google.maps.LatLng(43.604206, -116.204356),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true
          };

          posOptions = {
            enableHighAccuracy: true,
            timeout: 4000,
            maximumAge: 1000
          };


          map = new google.maps.Map(document.getElementById("map"), mapOptions);

          if($scope.playerTeam == 'orange')
          {
            locationIcon = new google.maps.MarkerImage(
              "img/orange-dot.png",
              null, /* size is determined at runtime */
              null, /* origin is 0,0 */
              null, /* anchor is bottom center of the scaled image */
              new google.maps.Size(18, 18)
            ); 
          }else{
            locationIcon = new google.maps.MarkerImage(
              "img/blue-dot.png",
              null, /* size is determined at runtime */
              null, /* origin is 0,0 */
              null, /* anchor is bottom center of the scaled image */
              new google.maps.Size(18, 18)
            ); 
          }

          $scope.myLocation = new google.maps.Marker({
              clickable: false,
              icon: locationIcon,
              shadow: null,
              zIndex: 999,
              map: map
          });  
          
          navigator.geolocation.getCurrentPosition(currentPositionSuccess, null, posOptions);

            var centerControlDiv = document.createElement('div');
            var centerControl = new CenterMap(centerControlDiv, map);

            centerControlDiv.index = 1;
            map.controls[google.maps.ControlPosition.RIGHT].push(centerControlDiv);
            $scope.centerControl = false;

          if($stateParams.lat !== '')
          {
            $scope.panLocation = new google.maps.LatLng($stateParams.lat, $stateParams.long);
            map.panTo($scope.panLocation);
          }
      }

      function initLocalStorage(gameID)
      {
        var url = "https://torrid-fire-239.firebaseio.com/games/";
        var ref = new Firebase(url + gameID);
        var sync = $firebase(ref);
        var syncObject = sync.$asObject();
        syncObject.$bindTo($scope, "mapGame")
          .then(function initializePage()
          {
            // Nothing to do for now
          });
      }

      $scope.$watch('mapGame',function(newVal)
      {
        if (_.isUndefined(newVal)) 
          return;
        var gameJoined = localStorage.getObject('gameJoined');
        $scope.playerTeam = gameJoined.game === newVal.$id ? newVal.$id : undefined;
        if (_.isUndefined(map))
          initMap();
        setLocations(newVal.locations,map);
        // only once, and need to be in game
        if(!$scope.locationInterval && (_.contains($scope.mapGame.orangeTeam, localStorage.get('name')) || _.contains($scope.mapGame.blueTeam, localStorage.get('name'))))
          $scope.locationInterval = $interval(sendLocation, 5000);
      });

      function currentPositionSuccess(pos) 
      {
        $scope.myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        $scope.myLocation.setPosition($scope.myLatlng);
      }

      function setLocations(locations, map)
      {
        var pinIcon, marker;
        $scope.markers = [];
        _.each(locations, function(location)
        {
          pinIcon = getPinIcon(location);
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.long),
            map: map,
            title: location.name,
            optimized: false,
            icon: pinIcon,
            zIndex: 5
          });

          // marker.addListener('click', function()
          // {
          //   if($scope.googleInfoWindow)
          //   {
          //     $scope.googleInfoWindow.close();
          //   }
          //   $scope.googleInfoWindow = new google.maps.InfoWindow({ content: getInfoWindowHTML(location) });
          //   marker.setPosition(new google.maps.LatLng(location.lat, location.long));
          //   $scope.googleInfoWindow.open(map,marker);
          // });

          $scope.markers.push(marker);
        });
      }

      function getPinIcon(location)
      {
        if(location.blueScore > location.orangeScore)
        {
          return new google.maps.MarkerImage(
            "img/blue-flag.png",
            null, /* size is determined at runtime */
            null, /* origin is 0,0 */
            null, /* anchor is bottom center of the scaled image */
            new google.maps.Size(20, 24)
          ); 
        }
        else if(location.orangeScore > location.blueScore)
        {
          return new google.maps.MarkerImage(
              "img/orange-flag.png",
              null, /* size is determined at runtime */
              null, /* origin is 0,0 */
              null, /* anchor is bottom center of the scaled image */
              new google.maps.Size(20, 24)
          ); 
        }
        else
        {
          return new google.maps.MarkerImage(
              "img/grey-flag.png",
              null, /* size is determined at runtime */
              null, /* origin is 0,0 */
              null, /* anchor is bottom center of the scaled image */
              new google.maps.Size(20, 24)
          ); 
        }
      }

      function CenterMap(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '36px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.margin = '10px';
        controlUI.style.width = '36px';
        controlUI.style.height = '36px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '36px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.style.paddingBottom = '5px';
        controlText.innerHTML = "<div class='ion-pinpoint' />";
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          map.panTo($scope.myLatlng);
        });
      }

      function getInfoWindowHTML(location)
      {
        if(location.blueScore > location.orangeScore)
        {
          return "<div>" + location.name + "</div><div class='blue-capture'> Blue: " + location.blueScore + "</div>";
        }
        else if(location.blueScore < location.orangeScore)
        {
          return "<div>" + location.name + "</div><div class='orange-capture'> Orange: " + location.orangeScore + "</div>";
        }
        else
        {
          return "<div>" + location.name + "</div><div class='none-capture'> Unclaimed </div>";
        }
      }

      function sendLocation()
      {
        navigator.geolocation.getCurrentPosition(currentPositionSuccess);
        postLocation({team: $scope.playerTeam, game: $scope.mapGame.$id, lat: $scope.myLatlng.lat(), long: $scope.myLatlng.lng() });
      }

      function postLocation(userGame)
      {
        var url = 'http://cc.butthole.tv/v1/';

        $http.post(url + 'location', userGame);
      }
  };
})();