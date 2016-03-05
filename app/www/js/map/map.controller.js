(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope','$ionicLoading'];

  function MapController($scope, $ionicLoading)
  {
      var myLatlng, myLoc, myLocation, mapOptions, map, watchOptions;

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
        timeout: 5000,
        maximumAge: 0,
        desiredAccuracy: 0,
        frequency: 1000
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      myLoc = new google.maps.Marker({
          clickable: false,
          icon: new google.maps.MarkerImage('/img/mobileimgs2.png',
                                                          new google.maps.Size(22,22),
                                                          new google.maps.Point(0,18),
                                                          new google.maps.Point(11,11)),
          shadow: null,
          zIndex: 999,
          map: map
      });

      navigator.geolocation.getCurrentPosition(currentPositionSuccess);

      function currentPositionSuccess(pos) 
      {
        var location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        map.setCenter(location);
        myLoc.setPosition(location);
      }

      function watchSuccess(pos) {
        currentPositionSuccess(pos);
      }

      function watchError(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }

      navigator.geolocation.watchPosition(watchSuccess, watchError, watchOptions);
  };
})();