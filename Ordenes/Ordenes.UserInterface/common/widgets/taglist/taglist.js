/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.widgets.taglist
     * @description
     * This module provides functionalities related to displaying Tags.
     */
    angular.module('siemens.simaticit.common.widgets.taglist', [
            'siemens.simaticit.common.services.tagsManager'
        ]);

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.taglist').directive('sitTagList', TaglistDirective);

    /**
   *   @ngdoc directive
   *   @name sitTagList
   *   @module siemens.simaticit.common.widgets.taglist
   *   @description
   *   Displays Data Segregation Tags.
   *
   *   @restrict AE
   *
   *   @usage
   *   As an element:
   *   ```
   *   <div style="width:50%">
   *      <sit-tag-list sit-data="tagsArray"> </sit-tag-list>
   *   </div>
   *   ```
   *
   *   As an attribute:
   *   ```
   *   <div style="width:50%" sit-tag-list sit-data="tagsArray"></div>
   *   ```
   *   @param {Array<Tags>} sit-data The array of objects containing 'Name' as a string, used to display Tags.
   *   Example: [{Name:'TagName1'},{Name:'TagName2'}]
   *
   * @example
   * The following example shows how to configure a sit-tag-list widget:
   *
   * In Controller:
   * ```
   *    (function () {
   *        SittaglistDemoController.$inject = ['common']
   *        function SittaglistDemoController(common) {
   *            var self = this;
   *            self.tags = [{ Name: 'Tag Name1' }, { Name: 'Tag Name2' },{ Name: 'Tag Name3' }];
   *        }
   *    })();
   * ```
   *
   * In Template:
   *```
   *   <sit-tag-list sit-data="ctrl.tags">
   *   </sit-tag-list>
   *
   *   (or)
   *
   *    <div sit-tag-list sit-data="ctrl.tags"></div>
   *```
   *
   *
   */
    TaglistDirective.$inject = ['$window', '$timeout'];
    function TaglistDirective($window, $timeout) {
        return {
            scope: true,
            bindToController: {
                'tags': '=sitData'
            },
            controller: TaglistController,
            controllerAs: 'taglistCtrl',
            templateUrl: 'common/widgets/taglist/taglist.html',
            link: function (scope, element, attr, ctrl) {
                var observer;
                var MIN_CONTAINER_WIDTH = 0, elementWidth, tagMoreButtonHeight = 26, dropdownWidth = 300;
                var dropdownHeight = 150;
                ctrl.dropDownFixPosition = dropDownFixPosition;
                function dropDownFixPosition() {
                    var targetNode = angular.element(element.find('ul.dropdown-menu.tag-menu'))[0];
                    var config = { attributes: true, childList: true, subtree: true };
                    var callback = function (mutationsList, observer) {
                        for (var i = 0; i < mutationsList.length; i++) {
                            if (mutationsList[i].attributeName === 'x-placement') {
                                var dropdown = angular.element(element.find('ul.dropdown-menu.tag-menu')),
                                    button = angular.element(element.find('button.tag-list-button')),
                                    tagMoreButtonWidth = button[0].offsetWidth,
                                    dropDownTop = button.offset().top,
                                    dropDownLeft = button.offset().left,
                                    canvasHeight = angular.element(document.querySelectorAll('.canvas-ui-view')[0]).height(),
                                    dropDownBottom = canvasHeight - (dropDownTop + tagMoreButtonHeight);
                                if (dropDownLeft > dropdownWidth) {
                                    dropdown.css('left', (dropDownLeft + tagMoreButtonWidth - dropdownWidth) + "px");
                                } else {
                                    dropdown.css('left', dropDownLeft + "px");
                                }
                                if (dropDownBottom < dropdownHeight) {
                                    dropdown.css('top', (dropDownTop - dropdownHeight) + "px");
                                } else {
                                    dropdown.css('top', (dropDownTop + tagMoreButtonHeight) + "px");
                                }
                                dropdown.css('transform', "none");
                            }
                        }
                    };
                    observer = new MutationObserver(callback);
                    observer.observe(targetNode, config);
                }

                var listner = scope.$watchCollection(function () {
                    return ctrl.tags;
                }, function (newValue, oldValue) {
                    calcTagsOnResize();
                }, true);

                function calcTagsOnResize() {
                    elementWidth = 'sitTagList' in attr.$attr ? element[0].offsetWidth : (element[0].parentElement ? element[0].parentElement.offsetWidth : 0);
                    if (elementWidth === MIN_CONTAINER_WIDTH) {
                        return;
                    }
                    ctrl.calcVisibleTabs(elementWidth);
                    angular.element(element[0].querySelectorAll('.btn-group.tag-list-menu.show')).removeClass('show');
                }

                var scrollEventHandler = function () {
                    angular.element(element[0].querySelector('.dropdown-menu.tag-menu')).removeClass('show');
                }
                angular.element(document.querySelectorAll('*:not(.tag-menu)')).bind('scroll', scrollEventHandler);

                angular.element($window).bind('resize', calcTagsOnResize);

                var gridSortListner = scope.$on('sit-grid.sort-changed', function () {
                    $timeout(function () {
                        calcTagsOnResize();
                    }, 0, false);
                });

                var gridPageChangeListner = scope.$on('sit-grid.page-changed', function () {
                    $timeout(function () {
                        calcTagsOnResize();
                    }, 0, false);
                });

                var columnResizeListener = scope.$on("sit-grid.column-resized", function () {
                    $timeout(function () {
                        calcTagsOnResize();
                        scope.$apply();
                    }, 0, false);
                });

                scope.$on("$destroy", function () {
                    angular.element($window).unbind('resize', calcTagsOnResize);
                    angular.element(document.querySelectorAll('*:not(.tag-menu)')).unbind('scroll', scrollEventHandler);

                    listner();
                    gridSortListner();
                    gridPageChangeListner();
                    columnResizeListener();
                    observer && observer.disconnect();
                });

            }
        }
    }

    TaglistController.$inject = ['common', '$compile', '$scope', '$element', 'common.services.tagsManager.tagsManagementService', '$sanitize'];
    function TaglistController(common, $compile, $scope, $element, tagsManagementService, $sanitize) {
        var vm = this;
        var TAG_SPACE_WIDTH = 5;
        var TAG_MENU_WIDTH = 17;
        var CELL_PADDING = 15;
        vm.calcVisibleTabs = calcVisibleTabs;

        function calcVisibleTabs(containerWidth) {
            vm.visibleTags = 0; vm.displayDropdownTags = false;
            if (vm.tags) vm.tags = vm.tags.filter(Boolean);
            tagsManagementService.getTagsStyle(vm.tags);
            vm.visibleTags = getVisibleTabs(containerWidth);
            if (vm.tags && vm.tags.length !== 0 && vm.visibleTags < vm.tags.length) {
                vm.displayDropdownTags = true;
            }
        }

        function getVisibleTabs(containerWidth) {
            var maxWidth = Math.floor(containerWidth - TAG_MENU_WIDTH - CELL_PADDING);
            var currentWidth = 0, tags = 0;
            if (vm.tags && vm.tags.length !== 0) {
                for (var i = 0; i < vm.tags.length; i++) {
                    currentWidth += TAG_SPACE_WIDTH + getTagWidth(vm.tags[i]);
                    if (currentWidth < maxWidth) {
                        tags++;
                    }
                    else {
                        return tags;
                    }
                }
                return tags;
            }
        }
        function getTagWidth(tag) {
            var ele, width, maxTagWidth, minTagWidth;
            if (tag.Name) {
                ele = $('<span class="taglabel">' + $sanitize(tag.Name) + '</span>')
                ele.appendTo($element);
                width = $(ele[0]).outerWidth(true);
                ele.remove();
                var tagListItem = $element.find('.tag-list-item');
                if (tagListItem && tagListItem.css('maxWidth')) {
                    maxTagWidth = Number(tagListItem.css('maxWidth').replace(/[^0-9]/g, '')); // NOSONAR
                }
                if (tagListItem && tagListItem.css('minWidth')) {
                    minTagWidth = Number(tagListItem.css('minWidth').replace(/[^0-9]/g, '')); // NOSONAR
                }
                if (!isNaN(maxTagWidth) && width > maxTagWidth) {
                    return maxTagWidth;
                } else if (!isNaN(minTagWidth) && width < minTagWidth) {
                    return minTagWidth;
                } else {
                    return width;
                }
            } else {
                return 0;
            }
        }

    }

})();
