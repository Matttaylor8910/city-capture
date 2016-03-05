(function()
{
  angular
    .module('city-capture')
    .filter('shortAddress', shortAddress);

  function shortAddress()
  {
    return function(address)
    {
      // 2013 S Euclid Ave, Boise, ID 83706 -> 2013 S Euclid Ave
      return address.split(',')[0];
    }  
  }
})();