/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.flyout
    *
    * @description
    * This module displays a pop-up next to a button.
    */

    angular.module('siemens.simaticit.common.widgets.flyout', []);

})();

(function () {
    'use strict';

    var app = angular.module('siemens.simaticit.common.widgets.flyout');

    /**
    *   @ngdoc directive
    *   @name sitFlyout
    *   @module siemens.simaticit.common.widgets.flyout
    *   @description
    *   Displays a flyout control.
    *   Flyout toggles on click of an element where flyout is configured.
    *   A close button is implemented to close the flyout additionally.
    *
    *   @usage
    *   As element:
    *   ```
    *   <div style="display:block">
    *      <a class="btn btn-lg btn-info" data-sit-flyout data-sit-templateuri="/app/common/widgets/flyout/docs/sit-flyout-template.html" data-sit-placement="bottom">Bottom placement Template 1</a>
    *      <button class="btn btn-lg btn-info" data-sit-flyout data-sit-templateuri="/app/common/widgets/flyout/docs/sit-flyout-template2.html" data-sit-templatedata="currentUser" data-sit-placement="auto">Auto placement Template 2</button>
    *   </div>
    *   ```
    *
    *   @restrict E
    *   @param {string} sit-templateuri The URI of the custom template of the flyout.
    *   @param {Object} sit-placement Specifies the position of the flyout on the screen. Valid values are:
    *   * **_left_**
    *   * **_top_**
    *   * **_right_**
    *   * **_bottom_**
    *   * **_auto_** (in this mode, the flyout is automatically placed in a position that has sufficient space).
    *   @param {Object} templatedata _(Optional)_ Custom data passed to the custom template of the flyout.
    *   @param {Object} templateTitle _(Optional)_ Custom title passed to the custom template of the flyout.
    */
    app.directive('sitFlyout', ['$compile', '$translate', 'common.widgets.flyout.service', function ($compile, $translate, flyoutService) {
        return {
            restrict: 'A',
            bindToController: {
                sitPlacement: '@', sitTemplateuri: '@', sitTemplatedata: '=', sitTemplateCallback: '=', sitTemplateTitle: '='
            },
            scope: {},
            controller: FlyoutController,
            controllerAs: 'Flyout',
            link: function (scope, el, attr, ctrl) {

                var ESC_CODE = 27;
                var title = ctrl.sitTemplateTitle ? ctrl.sitTemplateTitle : $translate.instant('flyout.title');

                flyoutService.getTemplate(ctrl.sitTemplateuri).then(function (popOverContent) {
                    $(el).popover({
                        trigger: 'click',
                        html: true,
                        sanitize: false,
                        template: '<div class="sit-flyout-menu popover">' +
                            '<div class="arrow"></div>' +
                            '<div class="flyout" role="tooltip">' +
                            '<div>' +
                            '<h3 class="popover-header"></h3>' +
                            '<div>' +
                            '<span class="flyout-header">'+title+'</span>' +
                            '<span class="close-icon">' +
                            '<svg  version="1.1" id="Artwork" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
                            'viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">' +
                            '<polygon class="aw-theme-iconOutline" fill="#464646"  points="21.354,3.354 20.646,2.646 12,11.293 3.354,2.646 2.646,3.354 11.293,12 2.646,20.646' +
                            '   3.354,21.354 12,12.707 20.646,21.354 21.354,20.646 12.707,12 "/>' +
                            '</svg>' +
                            '</span>'+
                            '</div>' +
                            '</div>' +
                            '<div class="popover-body"></div>' +
                            '</div>' +
                            '</div>',
                        content: $compile(popOverContent)(scope),
                        placement: function (tip, element) {
                            var placement = ctrl.sitPlacement;
                            if (placement === 'auto') {
                                var offset = $(element).offset();
                                var height = $(window.document).outerHeight();
                                var width = $(window.document).outerWidth();
                                var vert = 0.5 * height - offset.top;
                                var vertPlacement = vert > 0 ? 'bottom' : 'top';
                                var horiz = 0.5 * width - offset.left;
                                var horizPlacement = horiz > 0 ? 'right' : 'left';
                                placement = Math.abs(vert) > 130 ? vertPlacement : horizPlacement;
                            }
                            return placement;
                        }
                    })
                });

                // Prevent to dismiss popup when the user click on it
                $('html').on('click', docClickCallback);

                // Dismiss popup on escape key
                $(window.document).on('keyup', keyUpCallback);

                // Position of flyout must be recalculated on resize
                $(window).on('resize', WindowResizeCallback);

                // Event called when the popover is shown
                $(el).on('shown.bs.popover', popoverShownCallback);

                // Event called when the popover is hidden
                $(el).on('hidden.bs.popover', popoverHiddenCallback);

                //destroy event handling
                scope.$on('$destroy', destroyCallback);

                // close flyout on state change
                scope.$on('$stateChangeStart', ctrl.closeFlyout);

                function docClickCallback(e) {
                    $('[data-original-title]').each(function () {
                        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                            $(this).popover('hide');
                        }
                    });
                }

                function keyUpCallback(event) {
                    if (event.which === ESC_CODE) {
                        $('[data-original-title]').popover('hide');
                    }
                }

                function WindowResizeCallback() {
                    if (ctrl.getVisibility()) {
                        $(el).popover('show');
                    }
                }

                function popoverShownCallback() {
                    var $popup = $(this);
                    ctrl.setVisibility(true);
                    $('.popover').find('.close-icon').click(function (e) {
                        $popup.popover('hide');
                    });
                }

                function popoverHiddenCallback() {
                    ctrl.setVisibility(false);
                }

                function destroyCallback() {
                    $('html').off('click', docClickCallback);
                    $(window).off('resize', WindowResizeCallback);
                    $(window.document).off('keyup', keyUpCallback);
                    $(el).off('shown.bs.popover', popoverShownCallback);
                    $(el).off('hidden.bs.popover', popoverHiddenCallback);
                }

            }
        };
    }]);

    //Controller
    function FlyoutController() {
        var vm = this;

        function init() {
            vm.isVisible = false;
            vm.setVisibility = setVisibility;
            vm.getVisibility = getVisibility;
            vm.closeFlyout = closeFlyout;
            vm.closeIcon = { path: 'common/icons/cmdClosePanel24.svg', size: '16px' };
        }

        function activate() {
            init();
        }

        function setVisibility(visibility) {
            vm.isVisible = visibility;
        }

        function getVisibility() {
            return vm.isVisible;
        }

        function closeFlyout() {
            $('[data-original-title]').popover('hide');
            $('body').on('hidden.bs.popover', function (e) {
                if ($(e.target).data("bs.popover") && $(e.target).data("bs.popover").inState) {
                    $(e.target).data("bs.popover").inState.click = false;
                }
            });
        }

        activate();
    }

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.flyout').service('common.widgets.flyout.service', flyoutService);

    /**
    * @ngdoc service
    * @module siemens.simaticit.common.widgets.flyout
    * @name common.widgets.flyout.service
    *
    * @description
      * The flyout exposes a service with the following method:
    * * **hideFlyout**: this function hides the current flyout. By default, the flyout is closed when the user presses the **Esc** key or clicks outside the flyout.
    * There is no **showFlyout** function because the flyout is an attribute directive.
    * This directive is shown only when the user clicks on the element that contains the directive.
    *
    ***NOTE:** Closing a flyout can be configured in the flyout-template using any UI element.
    */
    function flyoutService($q, $http) {
        /**
            * @ngdoc method
            * @name common.widgets.flyout.service#hideFlyout
            * @module siemens.simaticit.common.widgets.flyout
            *
            * @description
            * Hides a specific flyout.
            *
            * @param {String} id The ID of the specific flyout is contained in the scope.
            *
            */
        this.hideFlyout = function () {
            $('[data-original-title]').popover('hide');
        };
        /**
            * @ngdoc method
            * @name common.widgets.flyout.service#getTemplate
            * @module siemens.simaticit.common.widgets.flyout
            *
            * @description
            * Returns the template for the flyout.
            *
            * @param {String} sit-templateUrl The **templateUrl** for the specific flyout is to be passed as an argument.
            *
            */
        this.getTemplate = function (templateUrl) {
            var def = $q.defer();

            $http.get(templateUrl)
              .then(function (response) {
                  def.resolve(response.data);
              });
            return def.promise;
        };
    }
    flyoutService.$inject = ['$q', '$http'];

})();
