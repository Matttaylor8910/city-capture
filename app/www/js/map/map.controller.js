(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope','$ionicLoading'];

  function MapController($scope, $ionicLoading)
  {
      var myLatlng, myLocation, mapOptions, map, watchOptions;

      mapOptions = {
          center: new google.maps.LatLng(43.618710, -116.214607),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false
      };

      watchOptions = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      navigator.geolocation.getCurrentPosition(currentPositionSuccess);

      function currentPositionSuccess(pos) 
      {
        map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        myLocation = new google.maps.Marker({
            position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
            map: map,
            title: "Current Location"
        });
      }

      function watchSuccess(pos) {
        myLocation = pos.coords;
      }

      function watchError(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }

      navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);

      $scope.map = map;
  };
})();