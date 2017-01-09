(function() {
  'use strict';

  angular
    .module('moneyDistribution')
    .filter('slugify', SlugifyFilter);

  SlugifyFilter.$inject = [];

  // Converts a string into a slug
  // E.g. Health Care => Health_Care
  function SlugifyFilter() {
    return function(input) {
      return !input ? '' : input.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
    }
  }

}());