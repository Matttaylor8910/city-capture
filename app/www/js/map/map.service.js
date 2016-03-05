(function()
{
  angular
    .module('map')
    .factory('MapService', MapService);

  function MapService() 
  {
    return {
      test: function()
      {
        return 'test';
      }
    };
  } 
})();