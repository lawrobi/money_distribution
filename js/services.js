(function() {
  'use strict';

  angular
    .module('globalFunds')
    .factory('GlobalAPI', GlobalAPI);

  GlobalAPI.$inject = ['$http'];

  function GlobalAPI($http) {
    var service = {};

    function load() {
      return $http.get('../data.json').then(handleSuccess, handleError('Error loading initial data.'));
    }

    function increaseScore(category) {
      // change dummy to your endpoint
      return $http.get('../dummy.json').then(handleSuccess, handleError('Error increasing score for ' + category));
    }

    function decreaseScore(category) {
      // change dummy to your endpoint
      return $http.get('../dummy.json').then(handleSuccess, handleError('Error decreasing score for ' + category));
    }

    function saveToCart(category, projectName, budget) {
      console.log('Saving... Category: ' + category + ', Name: ' + projectName + ', Budget: ' + budget);
      return $http.get('../dummy.json').then(handleSuccess, handleError('Error saving to cart for ' + projectName));
    }

    function submitForm(data) {
      console.log(data); // the form data
      return $http.get('../dummy.json').then(handleSuccess, handleError('Error submitting form'));
    }

    function handleSuccess(res) {
      return res.data;
    }

    function handleError(error) {
      return function () {
        return { "error": error };
      };
    }

    service.load = load;
    service.increaseScore = increaseScore;
    service.decreaseScore = decreaseScore;
    service.saveToCart = saveToCart;
    service.submitForm = submitForm;
    return service;
  }
}());