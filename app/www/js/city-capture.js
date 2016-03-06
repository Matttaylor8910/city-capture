(function()
{
  angular
    .module('city-capture', [
      'ionic',
      'ionic.utils',
      'ngIOS9UIWebViewPatch',
      'ngCordova',

      'about',
      'games',
      'login',
      'map'
    ])

    .config(function ( $httpProvider) {        
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    })

    // This establishes a few settings for Ionic
    .run(function($ionicPlatform) 
    {
      $ionicPlatform.ready(function() 
      {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
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