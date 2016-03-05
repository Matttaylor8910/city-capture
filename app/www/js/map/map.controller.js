(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope','$ionicLoading'];

  function MapController($scope, $ionicLoading)
  {
    google.maps.event.addDomListener(window, 'load', function() 
    {
      var myLatlng, myLocation, mapOptions, map, watchOptions;

      mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false
      };

      // watchOptions = {
      //   enableHighAccuracy: false,
      //   timeout: 5000,
      //   maximumAge: 0
      // };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      navigator.geolocation.getCurrentPosition(function(pos) {
          map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          myLocation = new google.maps.Marker({
              position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
              map: map,
              title: "Current Location"
          });
      });

      // function watchSuccess(pos) {
      //   myLocation = pos.coords;
      // }

      // function watchError(err) {
      //   console.warn('ERROR(' + err.code + '): ' + err.message);
      // }

      //navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);

      $scope.map = map;
    });
  };
})();