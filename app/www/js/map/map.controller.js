(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope','$ionicLoading','MapService'];

  function MapController($scope, $ionicLoading, MapService)
  {
      var myLatlng, myLoc, myLocation, mapOptions, map, watchOptions;

      // var refString = 'https://torrid-fire-239.firebaseio.com/';
      // var myFirebaseRef = new Firebase('https://torrid-fire-239.firebaseio.com/games/-KC5CrQeDqAztgO6g2kG.json');
      // myFirebaseRef.child("locations").on("value", function(location) {
      //   console.log(location);
      // });

      mapOptions = {
          center: new google.maps.LatLng(43.604206, -116.204356),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false
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

      myLoc = new google.maps.Marker({
          clickable: false,
          icon: 'img/orange-dot.png',
          shadow: null,
          zIndex: 999,
          map: map
      });

      navigator.geolocation.getCurrentPosition(currentPositionSuccess);
      navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);

      function currentPositionSuccess(pos) 
      {
        myLoc.setPosition(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
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
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.long),
            map: map,
            title: location.name,
            icon: 'img/orange-flag.png'
          });

          marker.addListener('click', function()
          {
            var flagInfoWindow = new google.maps.InfoWindow({ content: getInfoWindowHTML(location) }).open(map,marker);
          });
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