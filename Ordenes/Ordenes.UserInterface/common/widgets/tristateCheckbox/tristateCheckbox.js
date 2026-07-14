/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.tristateCheckbox
    *

    * @description
    * This module provides functionalities related to checkboxes.
    */
    angular.module('siemens.simaticit.common.widgets.tristateCheckbox', []);
})();

/*jshint -W098 */
(function () {
    'use strict';
    /**
    * @ngdoc directive
    * @name sitTristateCheckbox
    * @module siemens.simaticit.common.widgets.tristateCheckbox
    * @description
    * Displays a tri-state checkbox control with states false, true, null(indeterminate).
    *
    * @usage
    * As an element:
    * ```
    *<sit-tristate-checkbox sit-value="checkCtrl.value" sit-validation="validation" ng-readonly="ngReadonly" ng-blur="ngBlur"
    *               ng-disabled="checkCtrl.disabled" ng-focus="ngFocus" sit-change="checkCtrl.changeFn">
    *</sit-tristate-checkbox>
    * ```
    * @restrict E
	*
    * @param {Object[]} sit-value An array of value objects.
    * @param {ValidationModel} sit-validation See {@link ValidationModel}.
    * @param {string} [ng-blur] _(Optional)_ An expression to evaluate on blur event.
    * @param {string} [sit-change] _(Optional)_ An expression to evaluate on change of value.
    * @param {string} [ng-disabled] _(Optional)_ If this expression is truthy, the element will be disabled.
    * @param {string} [ng-focus] _(Optional)_ An expression to evaluate on focus event. 
    * @param {boolean} [dirty-disabled=false] _(Optional)_ An expression to disable dirty behavior of Tristate Checkbox.
    * @param {string} [ng-readonly] _(Optional)_ If this expression is truthy, the element will be set as read-only.
    * @param {String} [sit-layout=vertical]
    * This parameter sets the layout for the tri state checkbox and it accepts the following values:
    * * **horizontal**
    * * **vertical**.
    * @example
    * The following example shows how to configure a checkbox widget within the sit-data attribute of the {@link sitPropertyGrid sit-property-grid} directive:
    * ```
    *  {
    *     read_only: false,
    *     widget: "sit-checkbox",
    *     value: [
    *        {
    *           label: "Raw",
    *           checked: true
    *        },
    *        {
    *           label: "Gross",
    *           checked: false
    *        },
            {
    *           label: "Material",
    *           checked: null
    *        }
    *     ]
    *  }
    * ```
    * If there is only one checkbox control, the **label** and **checked** attributes are mandatory.
    *
    * Note: The {@link sitPropertyGrid sit-property-grid} directive analyzes the type of input value.
    *
    * ```
    *  {
    *     label: "Simple Check",
    *     value: true
    *  }
    * ```
    */

    function CheckboxController($scope) {
        this.setNgModelController = setNgModelController;
        this.executeWidgetValidation = executeWidgetValidation;

        this.updateState = function (index, checkedValue) {
            var viewValue;
            switch (checkedValue) {
                case undefined:
                    viewValue  = true;
                    break;
                case false:
                    viewValue  = true;
                    break;
                case true:
                    viewValue  = "null";
                    break;
                case "null":
                    viewValue  = false;
            }
            this.value[index].checked = viewValue;

            if (this.ngMdlCtrl) {
                this.ngMdlCtrl.$setViewValue(viewValue, 'input');
            }
        };
        if (!this.dirtyDisabled) {
            this.dirtyDisabled = false;
        }
    }
    function executeWidgetValidation(viewValue, ngModel) {
        var validity = true;
        if (this.validation.required) {
            validity = (viewValue === "null") ? false : true;
        }
        ngModel.$setValidity('required', validity);
        return ngModel;
    }
    function setNgModelController(ngMdlCtrl) {
        this.ngMdlCtrl = ngMdlCtrl;
    }

    CheckboxController.$inject = ['$scope'];

    function sitTristateCheckbox($timeout) {
        return {
            templateUrl: "common/widgets/tristateCheckbox/tristate-checkbox.html",
            bindToController: {
                'readOnly': '=?sitReadOnly',
                'value': '=?sitValue',
                'validation': '=?sitValidation',
                'ngBlur': '&?',
                'layout': '=?sitLayout',
                'sitChange': '=?',
                'ngDisabled': '=?',
                'ngFocus': '&?',
                'ngReadonly': '=?',
                'dirtyDisabled': '=?dirtyDisabled'
            },
            scope: true,
            controllerAs: 'checkboxCtrl',
            controller: CheckboxController,
            link: function (scope, elmnt, attrs, ctrl) {
                $timeout(function () {
                    var inputElement = elmnt.find('input').last()[0];
                    inputElement.indeterminate = ctrl.checked === "null";
                    inputElement.checked = ctrl.checked;
                    scope.$watch(angular.bind(ctrl, function () { return this.checked; }), function (newValue, oldValue) {
                        inputElement.indeterminate = newValue === "null";
                        inputElement.checked = newValue;
                    });
                }, 0, false);
            }
        }
    }

    angular.module('siemens.simaticit.common.widgets.tristateCheckbox')
        .directive("sitTristateCheckbox", ['$timeout', sitTristateCheckbox]);
})();
