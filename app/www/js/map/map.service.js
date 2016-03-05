(function()
{
  angular
    .module('map')
    .factory('MapService', MapService);

  function MapService($http)
  {
    return {
      getLocations: getLocations
    };

    function getLocations()
    {
      return $http.get('json/locations.json');
    }
  }
})();