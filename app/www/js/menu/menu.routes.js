angular
	.module('city-capture')
  .config(config);

function config($stateProvider)
{
  $stateProvider
    .state('app', {
      url         : '/app',
      abstract    : true,
      templateUrl : 'js/menu/menu.tpl.html'
    });
}