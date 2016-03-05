(function()
{
  angular
    .module('map')
    .controller('MapController', MapController);

  MapController.$inject = ['$scope', 'MapService','$cordovaGeolocation'];

  function MapController($scope, $cordovaGeolocation, MapService)
  {
  }
})();