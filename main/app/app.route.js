'use strict';

angular.module('BalanceForms').config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/invoices', {
                templateUrl: 'app/features/invoice/invoiceView.html',
                controller: 'InvoiceController',
                title: 'INVOICE.TITLE',
                resolve: {
                    translationPart: [ 'TranslationService',function(TranslationService){
                       return TranslationService('invoice');
                    }]
                }
            })
            .otherwise({
                redirectTo: '/invoices'
            });
    }]);