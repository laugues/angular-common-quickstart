'use strict';

angular.module('BalanceForms')
    .controller('InvoiceController', [
        '$scope',
        'Invoices',
        function ($scope,Invoices) {
            $scope.invoices = Invoices.getAll();
            $scope.selectedInvoice = null;

            $scope.view = function (invoice){
                $scope.selectedInvoice = invoice;
                $scope.currentTemplateUrl = 'http://clilds:8080/'+$scope.selectedInvoice.countryCode.toLowerCase()+'/rest/html/get';
                //$scope.currentTemplateUrl = 'http://clilds:8080/fr/rest/html/get';
                console.log("$scope.currentTemplateUrl  ",$scope.currentTemplateUrl );
            }

            $scope.validate = function (invoice){
                console.log("Validating invoice "+invoice.id+"....");
                console.log("Validating invoice "+invoice.id+" DONE.");
            }

        }]);
