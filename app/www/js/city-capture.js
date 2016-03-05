(function()
{
  angular
    .module('city-capture', [
      'ionic',
      'ngIOS9UIWebViewPatch',

      'about',
      'capture-points',
      'games',
      'login',
      'map'
    ])

    // This establishes a few settings for Ionic
    .run(function($ionicPlatform) 
    {
      $ionicPlatform.ready(function() 
      {
        if(window.cordova && window.cordova.plugins.Keyboard) 
        {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) 
        {
          StatusBar.styleDefault();
        }
      });
    });
})();