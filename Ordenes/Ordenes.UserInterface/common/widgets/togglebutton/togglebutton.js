/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.toggleButton
    *

    * @description
    * This module provides functionalities related to Toggle Button.
    */
    angular.module('siemens.simaticit.common.widgets.toggleButton', []);
})();

(function () {
    'use strict';
    /**
   * @ngdoc directive
   * @name sitToggleButton
   * @module siemens.simaticit.common.widgets.toggleButton
   * @description
   * Displays a Toggle Button control.
   *
   * @usage
   * As an element:
   * ```
   * <sit-toggle-button ng-disabled="isDisabled"
   *                ng-readonly="readOnly"
   *                sit-change="changeFn"
   *                sit-value="booleanValue">
   * </sit-toggle-button>
   * ```
   * @restrict E
   *
   * @param {boolean} [sit-value=false] Boolean value to select/unselect toggle button.
   * @param {string} [sit-change=undefined] _(Optional)_ An expression to evaluate on change of value.
   * @param {string} [ng-disabled=false] _(Optional)_ If this expression is truthy, the element will be disabled.
   * @param {string} [ng-readonly=false] _(Optional)_ If this expression is truthy, the element will be set as read-only.
   * @param {string} [sit-size=small] _(Optional)_ This expression decides to show small/large toggle button.
   * * This parameter sets the size for the toggle button and it accepts the following values:
   * * **small**
   * * **large**.
   *
   * @example
   * The following example shows how to configure a toggle button widget within the sit-data attribute of the {@link sitPropertyGrid sit-property-grid} directive:
   * ```
   *  {
   *     read_only: false,
   *     widget: "sit-toggle-button",
   *     value: true,
   *     isDisabled: false,
   *     sitChange: changeFn
   *
   *  }
   *  ```
   *  The following example shows how to configure a toggle button widget seperately outside Property Grid :
   * ```
   *  {
   *     readOnly: false,
   *     widget: "sit-toggle-button",
   *     value: true,
   *     isDisabled: false,
   *     sitChange: changeFn
   *  }
   * ```
   */
    function toggleButtonController() {

        var vm = this;
        vm.changeFuntion = vm.sitChange;
    }

    function sitToggleButton() {
        return {
            restrict: "E",
            bindToController: {
                readOnly: '=?sitReadOnly',
                ngDisabled: '=?',
                ngReadonly: '=?',
                sitChange: '=?',
                value: '=?sitValue',
                size: '=?sitSize',
                widgetAttributes: '=?sitWidgetAttributes'
            },
            scope: true,
            controllerAs: 'toggleButtonCtrl',
            controller: toggleButtonController,
            templateUrl: "common/widgets/togglebutton/toggle-button.html"

        }
    }

    angular.module('siemens.simaticit.common.widgets.toggleButton').directive("sitToggleButton", sitToggleButton);
})();
