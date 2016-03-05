(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope', '$stateParams','$ionicLoading','MapService'];

  function MapController($scope, $stateParams, $ionicLoading, MapService)
  {
      var myLatlng, myLocation, mapOptions, map, watchOptions, googleInfoWindow;

      // var refString = 'https://torrid-fire-239.firebaseio.com/';
      // var myFirebaseRef = new Firebase('https://torrid-fire-239.firebaseio.com/games/-KC5CrQeDqAztgO6g2kG.json');
      // myFirebaseRef.child("locations").on("value", function(location) {
      //   console.log(location);
      // });
      $scope.panLocation = new google.maps.LatLng($stateParams.lat, $stateParams.long);
      initMap();

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

        watchOptions = {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 1000
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        MapService.getLocations().then(
        function(response)
        {
          setLocations(response.data.locations,map);
        });

        var locationIcon = new google.maps.MarkerImage(
                "img/blue-dot.png",
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(18, 18)
            ); 

        myLocation = new google.maps.Marker({
            clickable: false,
            icon: locationIcon,
            shadow: null,
            zIndex: 999,
            map: map
        });
        navigator.geolocation.getCurrentPosition(currentPositionSuccess);
        navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);

        var centerControlDiv = document.createElement('div');
        var centerControl = new CenterMap(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT].push(centerControlDiv);
      }

      function currentPositionSuccess(pos) 
      {
        myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.panTo(myLatlng);
        myLocation.setPosition(myLatlng);
      }

      function watchSuccess(pos)
      {
        currentPositionSuccess(pos);
      }

      function watchError(err) 
      {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }

      function setLocations(locations, map)
      {
        _.each(locations, function(location)
        {
          var pinIcon = new google.maps.MarkerImage(
              "img/grey-flag.png",
              null, /* size is determined at runtime */
              null, /* origin is 0,0 */
              null, /* anchor is bottom center of the scaled image */
              new google.maps.Size(20, 24)
          ); 
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.long),
            map: map,
            title: location.name,
            icon: pinIcon
          });

          marker.addListener('click', function()
          {
            if(googleInfoWindow)
              googleInfoWindow.close();
            googleInfoWindow = new google.maps.InfoWindow({ content: getInfoWindowHTML(location) });
            googleInfoWindow.open(map,marker);
          });
        });
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
          map.panTo(myLatlng);
        });
      }

      function getInfoWindowHTML(location)
      {
        //var maxTeam, maxScore;
        // if(location.team['orange'].score > location.team['blue'])
        // {

        // }

        return content = "<div>" + location.name + "</div><div>" + location.address + "</div>";
      }
  };
})();