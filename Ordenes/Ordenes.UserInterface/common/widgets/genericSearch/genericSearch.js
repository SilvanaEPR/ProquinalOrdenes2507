/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.sitGenericSearch
    *
    * @description
    * This module provides functionalities related to displaying Generic Search.
    */
    angular.module('siemens.simaticit.common.widgets.genericSearch', []);

})();

(function () {
    'use strict';
    //#region ng-doc comments
    /**
    *   @ngdoc directive
    *   @name sitGenericSearch
    *   @module siemens.simaticit.common.widgets.sitGenericSearch
    *   @description
    *       A Directive used to perform Search operation on data.
    *   @usage
    *   As an element:
    *   ```
    *   <sit-generic-search ng-click="genericSearchCtrl.searchClicked"
    *       sit-change="genericSearchCtrl.searchChanged"
    *       sit-placeholder="{{'generic.search' | translate}}"
    *       sit-search-value="{{genericSearchCtrl.searchValue}}"
    *       ng-focus="genericSearchCtrl.searchFocused"
    *       ng-autofocus="true"
    *       sit-visibility="true"
    *       ng-disabled="false"
    *       ng-blur="genericSearchCtrl.searchBlurred">
    *  </sit-generic-search>
    *   ```
    *   @restrict E
    *   @param {string} sit-placeholder The placeholder of the quick search text box.
    *   @param {string} sit-search-value The default value to searched while loading of the search widget.
    *   @param {boolean} [sit-visibility=true] This attribute is to decide the visibility of Search Bar.
    *   @param {boolean} [ng-disabled=false] This attribute is to disable the Search Bar.
    *   @param {Function} ng-click The function to be called on clicking the search icon.
    *   @param {Function} ng-focus The function to be called on focusing the search text box.
    *   @param {Function} sit-change The function to be called on changing the value in the search text box.
    *   @param {Function} ng-blur The function to be called on focusing out from the search text box.
    *   @param {boolean} [ng-autofocus=false] This attribute is to decide the auto-focusing of Search Bar on page load.
    */
    //#endregion

    function genericSearchController() {
        var vm = this;
        vm.svgIcons = {
            search: {
                path: "common/icons/cmdSearch24.svg",
                size: "16"
            },
            close: {
                path: "common/icons/cmdClosePanel24.svg",
                size: "16"
            }
        };
    }

    function sitGenericSearch() {
        function linkFunction(scope, element, attrs, controllers) {

            var sitSearchCtrl = controllers[0];
            sitSearchCtrl.disableSearch = typeof sitSearchCtrl.disableSearch === "boolean" ? sitSearchCtrl.disableSearch : false;
            sitSearchCtrl.isSearchVisible = sitSearchCtrl.visibility === 'false' ? false : true;

           sitSearchCtrl.focusElement = function () {
                setTimeout(function(){
                    element.find(".generic-search").focus();
                })
            };
           if (sitSearchCtrl.ngAutofocus) {
                sitSearchCtrl.focusElement();
            }
        }

        return {
            templateUrl: "common/widgets/genericSearch/generic-search.html",
            bindToController: {
                clickSearch: '=?ngClick',
                focusSearch: '=?ngFocus',
                visibility: '@?sitVisibility',
                ngAutofocus: '=?ngAutofocus',
                sitChange: '=?',
                blurSearch: '=?ngBlur',
                disableSearch: '=?ngDisabled',
                placeholder: '@sitPlaceholder',
                genericSearchText: '@sitSearchValue'
            },
            scope: {},
            link: linkFunction,
            require: ['sitGenericSearch'],
            controllerAs: 'genericSearchCtrl',
            controller: genericSearchController,
            restrict: 'E'
        }
    }

    angular.module('siemens.simaticit.common.widgets.genericSearch')
        .directive("sitGenericSearch", sitGenericSearch);
})();
