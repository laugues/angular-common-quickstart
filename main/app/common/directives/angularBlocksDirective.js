'use strict';

angular.module('BalanceForms.directives')
    .directive(
    'itAngularBlocks', [
        '$templateCache',
        '$compile',
        '$http',
        '$q',
        '$log',
        '$timeout', function ($templateCache, $compile, $http, $q, $log, $timeout) {


            var BLOCK_REPLACE_ATTRIBUTE = 'data-block';
            var BLOCK_APPEND_ATTRIBUTE = 'data-block-append';
            var BLOCK_PREPEND_ATTRIBUTE = 'data-block-prepend';
            var BLOCK_BEFORE_ATTRIBUTE = 'data-block-before';
            var BLOCK_AFTER_ATTRIBUTE = 'data-block-after';


            function warnMissingBlock(name, src) {
                $log.warn('Failed to find ' + name + ' in ' + src);
            }

            /**
             * Retrieve "extendTemplate" from the scope.
             * @param scope the scope
             * @param attributes attributes provided by the directive
             * @returns {string} the value evaluated or not
             */
            function retrieveExtendedTemplate(scope, attributes) {
                if (scope.extendTemplate == null || typeof scope.extendTemplate === 'undefined' || JSON.stringify(scope.extendTemplate) === "null") {
                    if (attributes.extendTemplate) {
                        return attributes.extendTemplate;
                    } else {
                        $log.warning("Can not find valid 'extendTemplate' attribute...");
                    }

                }
                return scope.extendTemplate;
            }

            function _link(scope, iElement, iAttrs, controller, transcludeFn) {

                var extendedTemplateUrl = retrieveExtendedTemplate(scope, iAttrs);

                //iElement.removeAttr("extends-template");


                transcludeFn(function (clones, scope) {

                    $timeout(function () {

                        var src = extendedTemplateUrl;

                        if (!src) {
                            throw 'Template not specified in extend-template directive';
                        }
                        var response = $http.get(src, {cache: $templateCache});


                        var loadTemplate = response
                            .then(function (response) {
                                var template = response.data;
                                var elementCompile = angular.element("<div></div>").html(template);

                                function overrider(attributeName, $block) {

                                    $block = angular.element($block);
                                    var name = $block.attr(attributeName);

                                    var selectorString = '[id="' + src + '"] > [data-block="' + name + '"]';
                                    var selectorString1 = '[id="' + src + '"] > [data-block-append="' + name + '"]';
                                    var selectorString2 = '[id="' + src + '"] > [data-block-prepend="' + name + '"]';
                                    var selectorString3 = '[id="' + src + '"] > [data-block-after="' + name + '"]';
                                    var selectorString4 = '[id="' + src + '"] > [data-block-before="' + name + '"]';
                                    //var selectorString = '[id="' + src + '"] > *';

                                    var search = angular.element(elementCompile)[0].querySelector(
                                        selectorString + "," +
                                        selectorString1 + "," +
                                        selectorString2 + "," +
                                        selectorString3 + "," +
                                        selectorString4
                                    );

                                    search = angular.element(search);
                                    if (!search.length) {
                                        warnMissingBlock(name, src);
                                    }
                                    var services = {
                                        before: function () {
                                            search.parent()[0].insertBefore($block[0], search[0]);
                                        },
                                        after: function () {
                                            search.after($block);
                                        },
                                        prepend: function () {
                                            search.prepend($block);
                                        },
                                        append: function () {
                                            search.append($block);
                                        },
                                        replace: function () {
                                            search.replaceWith($block);
                                        }
                                    };

                                    return services;
                                }

                                // Clone and then clear the template element to prevent expressions from being evaluated
                                for (var i = 0; i < clones.length; i++) {

                                    var element = clones[i];

                                    var total = 0;

                                    if (!element || element.nodeType > 1) {
                                        continue;
                                    }
                                    if (total > 0) {
                                        throw "Must have only one root element";
                                    }
                                    total++;
                                    var $clone = document.createElement("div");
                                    angular.element($clone).append(element);
                                    var promise = $q.defer();


                                    var blocks = angular.element($clone.querySelectorAll('[' + BLOCK_REPLACE_ATTRIBUTE + ']'));
                                    angular.forEach(blocks, function (value) {
                                        var override = overrider(BLOCK_REPLACE_ATTRIBUTE, value);
                                        override['replace']();
                                    });

                                    var blockPreprends = angular.element($clone.querySelectorAll('[' + BLOCK_PREPEND_ATTRIBUTE + ']'));
                                    angular.forEach(blockPreprends, function (value) {
                                        var override = overrider(BLOCK_PREPEND_ATTRIBUTE, value);
                                        override['prepend']();
                                    });


                                    var blockAppends = angular.element($clone.querySelectorAll('[' + BLOCK_APPEND_ATTRIBUTE + ']'));
                                    angular.forEach(blockAppends, function (value) {
                                        var override = overrider(BLOCK_APPEND_ATTRIBUTE, value);
                                        override['append']();
                                    });

                                    var blockBefore = angular.element($clone.querySelectorAll('[' + BLOCK_BEFORE_ATTRIBUTE + ']'));
                                    angular.forEach(blockBefore, function (value) {
                                        var override = overrider(BLOCK_BEFORE_ATTRIBUTE, value);
                                        override['before']();

                                    });

                                    var blockAfter = angular.element($clone.querySelectorAll('[' + BLOCK_AFTER_ATTRIBUTE + ']'));
                                    angular.forEach(blockAfter, function (value) {
                                        var override = overrider(BLOCK_AFTER_ATTRIBUTE, value);
                                        override['after']();
                                    });
                                }
                                return elementCompile;

                            }, function errorCallback(response) {
                                $log.error('Can not retrieve template "', response, '"');
                                var msg = 'Failed to load template: ' + src;
                                $log.error(msg);
                                return $q.reject(msg);
                            });


                        loadTemplate.then(function ($template) {
                            iElement.html($template.html());
                            $compile(iElement.contents())(scope);
                        });
                    }, 0);

                });

            }


            return {
                transclude: 'true',
                restrict: 'A',
                scope: {
                    extendTemplate: '='
                },
                replace: true,
                priority: 10000,
                link: _link
            }
        }]);
