'use strict';

angular.module('BalanceForms')
    .controller('LoginController', [
        '$scope',
        'AuthService',
        function ($scope, AuthService) {

            $scope.authService = AuthService;

        }]);
