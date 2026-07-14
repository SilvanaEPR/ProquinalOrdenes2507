/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
    * @ngdoc module
    * @access internal
    * @name siemens.simaticit.common.widgets.carousel
    *
    * @description
    * This module provides functionalities related to the carousel.
    */

    angular.module('siemens.simaticit.common.widgets.carousel', []);

})();

(function () {
    'use strict';

    /**
   * @ngdoc directive
   * @name sitCarousel
   * @module siemens.simaticit.common.widgets.carousel
   * @access internal
   * @description
   * Displays a carousel widget with images.
   *
   * @usage
   * As an element:
   * ```
   * <sit-carousel sit-value="value" sit-items="CarouselInputModel" ng-readonly="false" >
   * </sit-carousel>
   * ```
   * @restrict E
   *
   * @param {string} sit-value A string value to highlight an image on load of a page.
   * @param {boolean} ng-readonly A Boolean value to inform whether carousel is just read only or not.
   * @param {CarouselInputModel} sit-items See {@link CarouselInputModel}.
   *
   * @example
   * The following example shows how to configure a carousel widget slides within the sit-items attribute:
   * ```
    *   [{
            id: 'AutoOEM',
            title: utils.translate('homeCards.autoOem.title'),
            image: 'common/images/home-cards/imgOEM.png',
            visibility: true,
            isDisabled: false
        }, {
            id: 'Discrete',
            title: utils.translate('homeCards.discrete.title'),
            image: 'common/images/home-cards/imgDiscrete.png',
            visibility: true,
            isDisabled: false
        }, {
            id: 'Process',
            title: utils.translate('homeCards.process.title'),
            image: 'common/images/home-cards/imgProcess.png',
            visibility: true,
            isDisabled: false
        }, {
            id: 'System',
            title: utils.translate('homeCards.system.title'),
            image: 'common/images/home-cards/imgSettings.png',
            visibility: true,
            isDisabled: false
        }
      ];
   * ```
   * ```
   *  id is an unique value to differentiate each slide
   *  title is string which will be displayed below slide
   *  image is the carousel slide which denotes image to be shown for home page
   *  @param {boolean} [visibility:true] This property is to decide the visibility of any slide in Carousel.
   *  @param {boolean} [isDisabled:false] This property is to disable any slide in Carousel.

   * ```
   */
    /**
     * @ngdoc type
     * @name CarouselInputModel
     * @access internal
     * @module siemens.simaticit.common.widgets.carousel
	 * @description An object containing the carousel configuration.
	 * @property {Object} [slides={}] Information about the Carousel Slides.
     *  The object has the following format:
     * ```
     *    {
     *       id: 'System',
     *       title: utils.translate('homeCards.system.title'),
     *       image: 'common/images/home-cards/imgSettings.png',
     *       visibility: true,
     *       isDisabled: false
     *    }
     * ```
      */

    CarouselController.$inject = ['$scope'];
    function CarouselController(scope) {
        var vm = this, valueListner;
        function initCarousel() {
            var visibleArray = [];
            vm.visibleCount = 0;
            vm.currentIndex = 0;
            if (vm.sitItems) {
                vm.sitItemsLength = vm.sitItems.length;

                for (var j = 0; j < vm.sitItemsLength; j++) {
                    if (vm.sitItems[j].visibility === true) {
                        vm.visibleCount++;
                        visibleArray.push(vm.sitItems[j]);
                    }
                }

                for (var i = 0; i < vm.visibleCount; i++) {
                    if (visibleArray[i].id === vm.sitValue) {
                        if (visibleArray[i].visibility) {
                            vm.currentIndex = i;
                            break;
                        } else {
                            vm.currentIndex = 0;
                        }
                    }
                }
            }
        }

        vm.next = function () {
            if (vm.readonly !== true) {
                vm.currentIndex++;
            }
        }

        vm.prev = function () {
            if (vm.readonly !== true) {
                vm.currentIndex--;
            }
        }

        vm.selectHomeCard = function (item) {
            if (vm.readonly === true || item.isDisabled === true) {
                return;
            }
            else {
                valueListner();
                vm.sitValue = item.id;
                window.$UIF.Object.isFunction(vm.onSelectionCallback) && vm.onSelectionCallback(item);
                registerWatch();
            }
        }

        function registerWatch() {
            valueListner = scope.$watch('carouselCtrl.sitValue', function (newVal, oldVal) {
                newVal !== oldVal && initCarousel();
            });
        }

        initCarousel();
        registerWatch();
        scope.$on('$destroy', function () {
            valueListner();
        });
    }

    function SitCarouselDirective() {
        return {
            restrict: 'E',
            templateUrl: 'common/widgets/carousel/carousel.html',
            controller: CarouselController,
            controllerAs: 'carouselCtrl',
            scope: {},
            bindToController: {
                sitItems: '=',
                sitValue: '=',
                onSelectionCallback: '=sitOnSelectionCallback',
                readonly: '=ngReadonly'
            }

        }
    }

    angular.module('siemens.simaticit.common.widgets.carousel').directive('sitCarousel', SitCarouselDirective);
}());
