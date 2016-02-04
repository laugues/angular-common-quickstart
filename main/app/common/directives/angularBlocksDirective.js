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

            function warnMissingBlock(name, src) {
                $log.warn('Failed to find ' + name + ' in ' + src);
            }

            function _link(scope, iElement, iAttrs, controller, transcludeFn) {

                $log.debug("override ....");
                iElement.removeAttr("extends-template");

                $log.debug("iAttrs.dataExtendTemplate =", iAttrs.extendTemplate);
                $log.debug("iAttrs =", iAttrs);
                transcludeFn(scope.$parent, function (clones, scope) {
                    $timeout(function () {

                        var src = iAttrs.extendTemplate;
                        $log.debug("extendTemplate '", src);
                        if (!src) {
                            throw 'Template not specified in extend-template directive';
                        }
                        var response = $http.get(src, {cache: $templateCache});
                        $log.debug("clones '", clones);


                        var loadTemplate = response
                            .then(function (response) {
                                var template = response.data;
                                var elementCompile = angular.element("<div></div>").html(template);
                                $log.debug('Create element and append template   == ', elementCompile);

                                function overrider($block) {

                                    $block = angular.element($block);
                                    var name = $block.attr("data-block");

                                    $log.debug("Treating block '" + name + "'...");

                                    var search = angular.element(elementCompile)[0].querySelector('[id="' + src + '"] > [data-block="' + name + '"]');
                                    search = angular.element(search);
                                    if (!search.length) {
                                        warnMissingBlock(name, src);
                                    }
                                    var services = {
                                        before: function () {
                                            search.insertBefore($block.html());
                                        },
                                        after: function () {
                                            search.insertAfter($block.html());
                                        },
                                        prepend: function () {
                                            search.prepend($block.html());
                                        },
                                        append: function () {
                                            search.appendChild($block.html());
                                        },
                                        replace: function () {
                                            $log.debug("$block  '", $block.html());
                                            $log.debug("search beforer  '", search);
                                            search.replaceWith($block.html());
                                            $log.debug("search after  '", search);
                                        }
                                    };

                                    $log.debug("Treating block '" + name + "' done.");
                                    return services;
                                }

                                // Clone and then clear the template element to prevent expressions from being evaluated
                                for (var i = 0; i < clones.length; i++) {
                                    $log.debug("========  " + i + "============= '");
                                    var element = clones[i];
                                    $log.debug("element '", element);
                                    var total = 0;
                                    $log.debug("element.nodeType '", element.nodeType);

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


                                    var blocks = angular.element($clone.querySelectorAll('[data-block]'));
                                    $log.debug("blocks...", blocks);
                                    angular.forEach(blocks, function (value) {
                                        $log.debug("Executing Replace action ...");
                                        var override = overrider(value);
                                        override.replace();
                                        $log.debug("override '" + value);
                                        $log.debug("Executing Replace action Done.");
                                    });

                                    var blockPreprends = angular.element($clone.querySelectorAll('[data-block-prepend]'));
                                    angular.forEach(blockPreprends, function (value) {
                                        $log.debug("Executing prepend action ...");
                                        var override = overrider(value);
                                        override.prepend();
                                        $log.debug("Executing prepend action DONE.");
                                    });

                                    // Insert append ly-blocks
                                    var blockAppends = angular.element($clone.querySelectorAll('[data-block-append]'));
                                    angular.forEach(blockAppends, function (value) {
                                        $log.debug("Executing append action ...");
                                        var override = overrider(value);
                                        override.append();
                                        $log.debug("Executing append action DONE.");

                                    });

                                    var blockBefore = angular.element($clone.querySelectorAll('[data-block-before]'));
                                    angular.forEach(blockBefore, function (value) {
                                        $log.debug("Executing before action ...");
                                        var override = overrider(value);
                                        override.before();
                                        $log.debug("Executing before action DONE.");

                                    });

                                    var blockAfter = angular.element($clone.querySelectorAll('[data-block-after]'));
                                    angular.forEach(blockAfter, function (value) {
                                        $log.debug("Executing after action ...");
                                        var override = overrider(value);
                                        override.after();
                                        $log.debug("Executing after action DONE.");

                                    });
                                    $log.debug("===================== '");
                                }
                                return elementCompile;

                            }, function errorCallback(response) {
                                $log.error('Can not retrieve template "', response, '"');
                                var msg = 'Failed to load template: ' + src;
                                $log.error(msg);
                                return $q.reject(msg);
                            });

                        $log.debug(clones);

                        loadTemplate.then(function ($template) {
                            $log.debug("$template = ", $template);
                            iElement.html($template.html());
                            $compile(iElement.contents())(scope);
                        });
                    }, 0);

                });

            }


            return {
                transclude: 'true',
                terminal: true,
                restrict: 'A',
                scope: {
                    extendTemplate: '='
                },
                replace: true,
                priority: 10000,
                link: _link
            }
        }]);
