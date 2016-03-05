(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope','$ionicLoading'];

  function MapController($scope, $ionicLoading)
  {
    initializeMap();
    google.maps.event.addDomListener(window, 'load', initializeMap);
  };

  function initializeMap()
  {
    var latlng, mapOptions, map, watchOptions;

    mapOptions = {
        center: myLatlng,
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

    //define a default-position
    var coords = new google.maps.MVCObject();
    coords.set('latlng', new google.maps.LatLng(52.370215, 4.895167));

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    }


    //set new value for coords
    function success(position) {
        coords.set('latlng',
            new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude));
    }

    var mapOptions = {
        zoom: 11,
        center: coords.get('latlng')
    };

    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

    var marker = new google.maps.Marker({
        position: coords.get('latlng'),
        map: map
    });

    google.maps.event.addListenerOnce(coords, 'latlng_changed', function () {
        var latlng = this.get('latlng');
        map.setCenter(latlng);
        marker.setPosition(latlng)
    });
  };
})();