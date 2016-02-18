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
            var stackCount = 0;
            var urlsUsed = [];

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
                //$log.debug("scope.extendTemplate is : ", scope.extendTemplate );

                if (scope.extendTemplate == null || typeof scope.extendTemplate === 'undefined' || JSON.stringify(scope.extendTemplate) === "null") {
                    if (attributes.extendTemplate) {
                        //$log.debug("return  : ", attributes.extendTemplate );
                        return attributes.extendTemplate;
                    } else {
                        $log.warning("Can not find valid 'extendTemplate' attribute...");
                    }
                }
                return scope.extendTemplate;
            }

            function doGet(src){
                var configuration = {
                    method: 'GET',
                    url: src,
                    headers : {
                        "Content-Type" : "text/html"
                    },
                    cache: $templateCache
                };
                //configuration.headers ="application/json";
                //configuration.headers["Content-Type"] ="application/json";

                return $http(configuration);
            }

            function _link(scope, iElement, iAttrs, controller, transcludeFn) {
                //$log.debug("**************************************" );
                var extendedTemplateUrl = retrieveExtendedTemplate(scope, iAttrs);

                //Add the current url to the list of already used url
                urlsUsed.push(extendedTemplateUrl);

                var occurrences = urlsUsed.filter(function(val){
                    return val === extendedTemplateUrl;
                }).length;


                //$log.warn("occurrences of "+extendedTemplateUrl+" = ", occurrences);
                //$log.warn("urlUsed = ", urlsUsed);
                //$log.warn("stackcount = ", stackCount);

                if(occurrences > 3){
                    $log.warn("occurrences of "+extendedTemplateUrl+" = ", occurrences);
                    $log.warn("urlUsed are : ", urlsUsed);
                    throw 'Infinite loop detected... '+occurrences+' occurrences on url '+extendedTemplateUrl;
                }

                iElement.removeAttr("extend-template");


                transcludeFn(scope.$parent, function (clones, scope) {

                    $timeout(function () {
                        //$log.debug("=================================" );
                        var src = extendedTemplateUrl;
                        //$log.debug("src is : ", src );
                        if (!src) {
                            throw 'Template not specified in extend-template directive';
                        }
                        //var response = $http.get(src, {cache: $templateCache});
                        var response = doGet(src);
                        //$log.debug("response is : ", response );

                        var loadTemplate = response
                            .then(function (response) {
                                var template = response.data;
                                //$log.debug("template is : ", template );
                                var elementCompile = angular.element("<div></div>").html(template);
                                //$log.debug("elementCompile is : ", elementCompile );
                                function overrider(attributeName, $block) {

                                    //$log.debug("overrider() => $block is : ", $block );

                                    $block = angular.element($block);
                                    var name = $block.attr(attributeName);

                                    //$log.debug("overrider() => name is : ", name );
                                    var selectorString = '[id="' + src + '"] > [data-block="' + name + '"]';

                                    //$log.debug("overrider() => selectorString is : ", selectorString );


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
                                    //$log.debug("search is : ", search );
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

                                //$log.debug("children clones are : ", clones );

                                // Clone and then clear the template element to prevent expressions from being evaluated
                                for (var i = 0; i < clones.length; i++) {

                                    //$log.debug("i is : ", i );
                                    var childClone = clones[i];
                                    //$log.debug("childClone is : ", childClone );

                                    var total = 0;
                                    //$log.debug("total is : ", total );
                                    //$log.debug("element.nodeType is : ", childClone.nodeType );
                                    if (!childClone || childClone.nodeType > 1) {
                                        //$log.debug("clones.length : ",clones.length );
                                        //$log.debug("continue!");
                                        continue;
                                    }
                                    if (total > 0) {
                                        throw "Must have only one root element";
                                    }
                                    total++;
                                    //$log.debug("total after is : ", total );
                                    var $clone = document.createElement("div");
                                    angular.element($clone).append(childClone);
                                    $log.debug("$clone is : ", $clone );
                                    var promise = $q.defer();

                                    //$log.debug("BLOCK_REPLACE_ATTRIBUTE is : ", BLOCK_REPLACE_ATTRIBUTE );
                                    var blocks = angular.element($clone.querySelectorAll('[' + BLOCK_REPLACE_ATTRIBUTE + ']'));
                                    //$log.debug("blocks is : ", blocks );
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
                               // $log.error('Can not retrieve template "', response, '"');
                                var msg = 'Failed to load template: ' + src;
                                //$log.error(msg);
                                return $q.reject(msg);
                            });


                        loadTemplate.then(function ($template) {
                            iElement.html($template.html());
                            var content = iElement.contents();
                            $compile(content)(scope);
                        });
                    }, 0);

                });
                stackCount++;
            }


            return {
                transclude: 'true',
                restrict: 'A',
                scope: {
                    extendTemplate: '@'
                },
                replace: true,
                priority: 10000,
                link: _link
            }
        }]);
