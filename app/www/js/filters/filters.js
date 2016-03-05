(function()
{
  angular
    .module('city-capture')
    .filter('shortAddress', shortAddress)
    .filter('seconds', seconds);

  function shortAddress()
  {
    return function(address)
    {
      // 2013 S Euclid Ave, Boise, ID 83706 -> 2013 S Euclid Ave
      return address.split(',')[0];
    }  
  }

  function seconds()
  {
    return function(seconds)
    {
      return _.isUndefined(seconds) ? '' : moment("2015-01-01").startOf('day')
        .seconds(seconds)
        .format('H:mm:ss');
    }
  }
})();