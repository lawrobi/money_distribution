(function() {
  'use strict';

  angular
    .module('globalFunds')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['GlobalAPI', '$window', '$filter', '$scope'];

  function MainCtrl(GlobalAPI, $window, $filter, $scope) {
    var vm = this;

    // Initialize the data
    var init = function() {
      GlobalAPI.load().then(function(data) {
        if (data.error) {
          $window.alert(data.error);
        } else {
          console.log(data);

          vm.totalScore = data.total_score;
          vm.totalValue = data.total_value;
          vm.scoreFactor = (data.total_value / data.total_score);

          vm.distribution = data.distribution;
          vm.currentScore = data.total_score - countDistributedScores();
          vm.mask = generateMask();
          vm.budgetError(); //init
        }
      });
    };
    init();

    // Generate mask for "cart"
    var generateMask = function() {
      var o = {}, i, j, l = vm.distribution.length;
      for (i = 0; i < l; i += 1) {
        var category = vm.distribution[i].category;
        for (j = 0; j < vm.distribution[i].projects.length; j += 1) {
          var project = vm.distribution[i].projects[j];
          o[vm.getCatProjSlug(category, project.name)] = project.budget;
        }
      }
      //console.log(o);
      return o;
    }

    // Counts the total scores distributed to all the baskets
    var countDistributedScores = function() {
      return vm.distribution.reduce(function(prev, curr) {
        return prev + Number(curr.score);
      }, 0);
    };

    // Counts the total budget distributed to all the projects of a specific basket
    var countDistributedBudget = function(projects) {
      return projects.reduce(function(prev, curr) {
        return prev + Number(curr.budget);
      }, 0);
    };

    // Counts the total budget distributed to all the projects
    vm.countAllDistributedBudget = function() {
      if (vm.distribution == undefined) {
        return 0;
      }
      var i, l = vm.distribution.length, total = 0;
      for (i = 0; i < l; i+= 1) {
        total = vm.distribution[i].projects.reduce(function(prev, curr) {
          return prev + Number(curr.budget);
        }, total);
      }
      return total;
    }

    // Returns a string like "health=cancer_institute"
    vm.getCatProjSlug = function(category, projectName) {
      return $filter('slugify')(category) + '=' + $filter('slugify')(projectName);
    }

    // Counts the budget remaining for a basket after distribution to the respective projects
    vm.budgetRemaining = function(item) {
      return ((vm.scoreFactor * item.score) - countDistributedBudget(item.projects)).toFixed(1);
    };

    // Saves the "cart"
    vm.saveToCart = function(catIndex, projIndex, category, projectName) {
      var slug = vm.getCatProjSlug(category, projectName);
      var newBudget = vm.mask[slug];

      if (newBudget < 0.0) {
        $window.alert('You cannot enter a negative amount!');
        return;
      }
      GlobalAPI.saveToCart(category, projectName, newBudget).then(function(data) {
        if (data.error) {
          $window.alert(data.error);
        } else {
          // SAVED!
          vm.distribution[catIndex].projects[projIndex].budget = newBudget;
          $scope.investmentForm[$filter('slugify')(projectName)].$setPristine();
        }
      });
    };

    // Tests if the tick button is disabled
    vm.saveDisabled = function(projectName) {
      return $scope.investmentForm[$filter('slugify')(projectName)].$pristine;
    }

    // Ensures that budget has no error
    vm.budgetError = function() {
      if (vm.distribution == undefined) {
        return false;
      }
      var i, l = vm.distribution.length;
      for (i = 0; i < l; i+= 1) {
        if (vm.budgetRemaining(vm.distribution[i]) < 0.0) {
          return true;
        }
      }
      return false;
    };

    // Method that is called when the "Submit Investment" button is clicked
    vm.submitForm = function() {
      //console.log(vm.mask);
      //console.log(JSON.stringify(vm.distribution, null, 2));
      GlobalAPI.submitForm(vm.distribution).then(function(data) {
        if (data.error) {
          $window.alert(data.error);
        } else {
          $window.alert('Form submitted!');
          // redirect?
          // $window.location('http://google.com'); ?
        }
      });
    };

    // Method that is invoked when the + button is clicked
    vm.addScore = function(index, category) {
      console.log("API call: Increase score for " + category);
      GlobalAPI.increaseScore(category).then(function(data) {
        if (data.error) {
          $window.alert(data.error);
        } else {
          // score successfully increased
          vm.currentScore -= 1;
          vm.distribution[index].score += 1;
        }
      });
    };

    // Method that is invoked when the - button is clicked
    vm.removeScore = function(index, category) {
      console.log("API call: Decrease score for " + category);
      GlobalAPI.decreaseScore(category).then(function(data) {
        if (data.error) {
          $window.alert(data.error);
        } else {
          // scores successfully decreased
          vm.currentScore += 1;
          vm.distribution[index].score -= 1;
        }
      });
    };
  }
}());