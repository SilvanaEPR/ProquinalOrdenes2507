/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @access internal
    * @name siemens.simaticit.common.widgets.contextArea
    * @description
    * This module provides functionalities related to Context Area widgets.
    */
    angular.module('siemens.simaticit.common.widgets.contextArea', []);

})();

(function () {
    'use strict';
    /**
    * @ngdoc directive
    * @access internal
    * @name sitContextArea
    * @module siemens.simaticit.common.widgets.contextArea
    * @description
    * Displays the list of properties and custom data in the Context Area.
    *
    * @usage
    * As an element:
    * ```
    * <sit-context-area sit-config="configData"></sit-context-area>
    * ```
    * @restrict E
    * @param {Object} sitConfig The object used to configure the context area. For more information on this object, see {@link contextAreaOptions}
    *
    * @example
    * In a view template, you can use the **sitContextArea** as follows:
    *  ```
    * <div>
    *     <sit-context-area sit-config="ctrl.config"> <sit-context-area>
    * </div>
    * ```
    * The following example shows how to configure a sit-context-area widget:
    * In Controller:
    * ```
    * (function () {
    * 'use strict';
    * var app = angular.module('siemens.simaticit.common.examples');
    * app.controller('contextAreaController', ['$scope', function ($scope) {
    *     var vm = this;
    *     vm.config = {
    *         templateUrl: 'common/examples/contextArea/custom-template.html',
    *         templateData: {
    *             appName: ''
    *         },
    *         propertyList: [{
    *                 label: 'Estimated Start',
    *                 value: '11/12/2018 15:20'
    *             },{
    *                 label: 'Estimated Duration',
    *                 value: '1:50:37'
    *             },{
    *                 label: 'Remaining Time',
    *                 value: '1:30:37'
    *             },{
    *                 label: 'Status',
    *                 value: 'True'
    *             },{
    *                 label: 'Another property',
    *                 value: 'The value'
    *             },{
    *                 label: 'Final Material',
    *                 value: 'XA FLS07.A'
    *             },{
    *                 label: 'Screen',
    *                 value: 'Engineering'
    *             }]
    *          }
    *      }]);
    * })();
    * ```
    */
    /**
    * @ngdoc type
    * @access internal
    * @name contextAreaOptions
    * @module siemens.simaticit.common.widgets.contextArea
    * @description An object containing the configuration settings for the Context Area.
    *
    * @property {Array<Object>} [propertyList] The list of properties to be displayed in the Context Area.
    * Each object must have the following properties:
    * * **label**: The label to be displayed for a property.
    * * **value**: The corresponding value to be displayed for a property.
    *
    * @property {String} [templateUrl=" "] The Url of the custom template to be displayed in the Context Area.
    * @property {Object} [templateData={}] The object data that needs to be binded with custom template.
    *
    * **Note:** * To bind the templateData with templateUrl, you can access the specified templateData via
    * **ContextArea.templateData** and there are no restriction on the format of the object.*.
    */


    angular.module('siemens.simaticit.common.widgets.contextArea').directive('sitContextArea', ['$window', '$timeout', '$rootScope', function ($window, $timeout, $rootScope) {
        return {
            scope: true,
            restrict: 'E',
            transclude: true,
            bindToController: {
                config: '=sitConfig'
            },
            templateUrl: 'common/widgets/contextArea/context-area.html',
            controller: ContextAreaController,
            controllerAs: 'ContextArea',
            link: function (scope, element, attrs, ctrl) {
                var DEFAULT_HEIGHT = element.parents().hasClass('shop-floor operational') ? 72 : 48;
                ctrl.canvasLayoutChange = canvasLayoutChange;
                angular.element(element).bind('resize', rearrangeLayout);
                scope.$on('$destroy', onDirectiveDestroy);

                rearrangeLayout();

                function rearrangeLayout() {
                    $timeout(function () {
                        var contextElement = element.find('.context-area-property');
                        $(contextElement).css('max-width', '');
                        if (ctrl.propertyList.length && ctrl.templateUrl) {
                            ctrl.isExpandIconVisible = true;
                        } else {
                            var scrollHeight = 0;
                            var clientHeight = element.first().find('.context-area-content')[0].clientHeight;
                            var listElement = element.first().find('.context-area-properties');
                            var customElement = element.first().find('.custom-context-area');
                            scrollHeight = listElement.length ? $(listElement)[0].scrollHeight : listElement.length ? (customElement)[0].scrollHeight : 0;

                            if (!ctrl.isContextAreaExpanded) {
                                ctrl.isExpandIconVisible = scrollHeight > clientHeight ? true : false;
                            } else {
                                if (scrollHeight <= DEFAULT_HEIGHT) {
                                    ctrl.isExpandIconVisible = false;
                                    ctrl.isContextAreaExpanded = false;
                                }
                            }
                        }
                        rearrangeColumnLayout(contextElement);
                    });
                }

                function rearrangeColumnLayout(contextElement) {
                    $timeout(function () {
                        var columnWidth = $(contextElement).first().width();
                        $(contextElement).css('max-width', columnWidth);
                    }, 100, false);
                }

                function canvasLayoutChange() {
                    if (ctrl.isContextAreaExpanded) {
                        $('.sit-context-area .collapsed-height').removeClass('collapsed-height').addClass('expanded-height');
                        $('.canvas-sit-context-area').css({ 'height': $('.sit-context-area').height() + 'px' })
                        $rootScope.$broadcast('context-area-height-changed');

                    } else {
                        $('.sit-context-area .expanded-height').removeClass('expanded-height').addClass('collapsed-height');
                        $('.canvas-sit-context-area').css({ 'height': $('.sit-context-area').height() + 'px' })
                        $rootScope.$broadcast('context-area-height-changed');
                    }
                }

                function onDirectiveDestroy() {
                    angular.element(element).unbind('resize', rearrangeLayout);
                }
            }
        };
    }]);

    function ContextAreaController() {
        var vm = this;

        activate();
        function activate() {
            init();
            initMethods();
        }
        function init() {
            vm.isContextAreaExpanded = false;
            vm.isExpandIconVisible = false;
            vm.propertyList = vm.config.propertyList && vm.config.propertyList.length ? vm.config.propertyList : [];
            vm.templateUrl = vm.config.templateUrl ? vm.config.templateUrl : '';
            vm.templateData = vm.config.templateData ? vm.config.templateData : null;
        }

        function initMethods() {
            vm.expandContextArea = expandContextArea;
        }

        function expandContextArea() {
            vm.isContextAreaExpanded = !vm.isContextAreaExpanded;
            vm.canvasLayoutChange();
        }
    }
})();
