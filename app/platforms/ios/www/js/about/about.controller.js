(function()
{
  angular
    .module('about')
    .controller('AboutController', AboutController);

  AboutController.$inject = ['$scope','FAQs'];

  function AboutController($scope, FAQs)
  {
    $scope.FAQs = FAQs;
  }
})();