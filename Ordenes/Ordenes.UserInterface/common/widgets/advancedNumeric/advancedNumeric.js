/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.widgets.advancedNumeric', [function () {
        
    }]);

})();

(function () {
    'use strict';

    var app = angular.module('siemens.simaticit.common.widgets.advancedNumeric');

    AdvancedNumericController.$inject = ['$rootScope', '$scope', '$timeout', '$translate', 'common.services.globalization.globalizationService'];

    function AdvancedNumericController($rootScope, $scope, $timeout, $translate, globalizationService) {
        var vm = this,
            customValidation = null;

        activate();

        vm.$onInit = function () {
            vm.type = setNumberType(vm.type);
            setDisplayValue(vm.value);
        }

        function activate() {
            init();
        }

        function init() {
            vm.displayValue = '';
            vm.isInternalUpdate = false;
            vm.setDisplayValue = setDisplayValue;
            vm.keyPressEvent = keyPressEvent;
            vm.onBlur = onBlur;
            vm.onFocus = onFocus;

            if (vm.validation && typeof vm.validation.custom === 'function') {
                customValidation = vm.validation.custom;
                vm.validation.custom = advancedNumericValidation;
            } else {
                vm.validation = {
                    custom: advancedNumericValidation
                };
            }
        }

        function keyPressEvent(ev) {
            var culture = globalizationService.getLocale();
            if (!(ev.ctrlKey || ev.altKey ||
                (47 < ev.keyCode && ev.keyCode < 58 && ev.shiftKey === false) ||
                (ev.keyCode === 101 || ev.keyCode === 69) ||
                ev.keyCode === 8 || ev.keyCode === 9 || (vm.type === 'decimal' && ev.keyCode === getDecimalSeperator(culture).asciiValue) ||
                (ev.keyCode === 45 || ev.keyCode === 43))) {
                ev.preventDefault();
            }
        }

        function advancedNumericValidation(value, ngModel) {
            var numericValue = getValueFromDisplayValue(value);
            if (!numericValue) {
                ngModel.$setValidity('advancedNumericForm', true);
                customValidation && customValidation(numericValue, ngModel);
            } else {
                if (numericValue.endsWith('.')) {
                    numericValue = parseFloat(numericValue).toString();
                }
                var isNumber = isFinite(numericValue);
                if (!isNumber) {
                    ngModel.$setValidity('advancedNumericForm', false);
                    vm.validation.patternInfo = $translate.instant('validator.errors.number');
                    numericValue = '';
                } else if (vm.type === 'integer' && !isInteger(parseFloat(numericValue))) {
                    ngModel.$setValidity('advancedNumericForm', false);
                    vm.validation.patternInfo = $translate.instant('validator.errors.integer');
                    numericValue = '';
                } else {
                    ngModel.$setValidity('advancedNumericForm', true);
                    vm.validation.patternInfo = '';
                    customValidation && customValidation(numericValue, ngModel);
                }
            }
            vm.isInternalUpdate = true;
            vm.value = numericValue;
            $timeout(function () {
                vm.isInternalUpdate = false;
            }, 0, false);
            return ngModel;
        }

        function isInteger(value) {
            return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
        }

        function setNumberType(type) {
            switch (type) {
                case 'decimal':
                    return 'decimal';
                case 'integer':
                    return 'integer';
                default:
                    return 'decimal';
            }
        }

        function setDisplayValue(value) {
            if (value && typeof value === 'number') value = value.toString();
            var culture = globalizationService.getLocale();
            if (value && typeof value === 'string') {
                if (value.match(/[eE]/)) {
                    vm.displayValue = value;
                    return;
                }
                var tempValue = value.split('.'), numberOfDigits = 0;
                if (tempValue.length === 2) {
                    numberOfDigits = Math.min(tempValue[1].length, 20); //maximum value for minimumFractionDigits and maximumFractionDigits is 21
                }
                vm.displayValue = Number(value).toLocaleString(culture, { minimumFractionDigits: numberOfDigits, maximumFractionDigits: numberOfDigits });
            }
        }

        function getValueFromDisplayValue(displayValue) {
            var culture = globalizationService.getLocale();
            var decimalSeperator = getDecimalSeperator(culture).char;
            var thousandSeperator = getThousandSeperator(culture).char;
            displayValue = displayValue.split(thousandSeperator).join('');
            return displayValue.split(decimalSeperator).join('.');
        }

        function getDecimalSeperator(culture) {
            var num = 1.1;
            var char = num.toLocaleString(culture).substring(1, 2);
            return {
                char: char,
                asciiValue: char.charCodeAt(0)
            };
        }

        function getThousandSeperator(culture) {
            var num = 10000;
            var char = num.toLocaleString(culture).charAt(2);
            return {
                char: char,
                asciiValue: char.charCodeAt(0)
            };
        }

        function onBlur() {
            setDisplayValue(vm.value);
            vm.onBlurCallback && typeof vm.onBlurCallback === 'function' && vm.onBlurCallback();
        }

        function onFocus() {
            var culture = globalizationService.getLocale();
            vm.displayValue = vm.displayValue.split(getThousandSeperator(culture).char).join('');
            vm.onFocusCallback && typeof vm.onFocusCallback === 'function' && vm.onFocusCallback();
        }
    }

    app.controller('AdvancedNumericController', AdvancedNumericController);

    app.directive('sitAdvancedNumeric', function () {

        return {
            bindToController: {
                'readOnly': '=?sitReadOnly',
                'value': '=?sitValue',
                'validation': '=?sitValidation',
                'type': '=?sitType',
                'onBlurCallback': '&?ngBlur',
                'sitChange': '=?',
                'ngDisabled': '=?',
                'onFocusCallback': '&?ngFocus',
                'ngReadonly': '=?',
                'placeholder': '=?sitPlaceholder'
            },

            scope: {},
            restrict: 'E',
            transclude: true,
            link: function (scope, element, attr, ctrl) {
                var valueListner = scope.$watch(function () {
                    return ctrl.value;
                }, function (newVal, oldVal) {
                    if (newVal !== oldVal && !ctrl.isInternalUpdate) {
                        ctrl.setDisplayValue(newVal);
                    }
                    });

                scope.$on('$destroy', function () {
                    valueListner();
                })
            },
            controller: 'AdvancedNumericController',
            controllerAs: 'advancedNumericCtrl',
            templateUrl: 'common/widgets/advancedNumeric/advanced-numeric.html'
        };
    });
})();