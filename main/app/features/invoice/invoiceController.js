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
                $scope.currentTemplateUrl = 'app/template/'+$scope.selectedInvoice.countryCode.toLowerCase()+'/invoice/invoiceTemplate.html';
                console.log("$scope.currentTemplateUrl  ",$scope.currentTemplateUrl );
            }

            $scope.validate = function (invoice){
                console.log("Validating invoice "+invoice.id+"....");
                console.log("Validating invoice "+invoice.id+" DONE.");
            }


            //$scope.data = [
            //    {
            //        "fieldid": "supplierId",
            //        "field": "Identifiant fournisseur",
            //        "value": "1008"
            //    },
            //    {
            //        "fieldid": "supplierName",
            //        "field": "Nom du fournisseur",
            //        "value": "FACTURE 1 - FABEMI"
            //    },
            //    {
            //        "fieldid": "supplierId",
            //        "field": "Nom du client",
            //        "value": "CIFFREO BONA"
            //    },
            //    {
            //        "fieldid": "accountingDate",
            //        "field": "Date de comptabilisation",
            //        "value": "02/12/2008"
            //    },
            //    {
            //        "fieldid": "batchName",
            //        "field": "Numéro de lot",
            //        "value": "20081202_001"
            //    },
            //    {
            //        "fieldid": "docNumber",
            //        "field": "N° document",
            //        "value": "063098"
            //    },
            //    {
            //        "fieldid": "amountHT",
            //        "field": "Montant HT",
            //        "value": "785,00"
            //    },
            //    {
            //        "fieldid": "amountTTC",
            //        "field": "Montant TTC",
            //        "value": "6 935,44"
            //    }
            //];

        }]);
