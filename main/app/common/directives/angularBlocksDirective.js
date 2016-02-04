'use strict';

angular.module('BalanceForms.directives')
    .directive('bdBlocks', [function () {

        function _link(){

        }


        return {
            restrict:'EA',
            scope:{
                phoneObject:'=',
                onClick:'&'
            },
            transclude:true,
            templateUrl:'app/common/directives/phoneTemplate.html',
            link:_link
        }
    }]);

