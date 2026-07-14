/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiDatalist', sitPiDatalistDirective);

    function sitPiDatalistDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piDatalist/pi-datalist.html',
            controller: sitPiDatalistController,
            restrict: 'E',
            controllerAs: 'piDlCtrl',
            scope: {
            },
            bindToController: {
                'readOnly': '=ngReadonly',
                'value': '=sitValue',
                'sitChange': '=?',
                'options': '=sitOptions',
                'toDisplay': '=sitToDisplay',
                'toKeep': '=sitToKeep',
                'ngBlur': '&?',
                'ngDisabled': '=?',
                'ngFocus': '&?',
                'ngSelected': '=?',
                'ngReadonly': '=?',
                'validation': '=sitValidation'
            },
            link: function (scope, el, attrs, ctrl) {
                ctrl.readValue = '';
                var valueChangeWatcher = scope.$watch(function () {
                    return ctrl.value;
                }, function (newValue) {
                    if (newValue) {
                        ctrl.readValue = newValue[ctrl.toDisplay];
                    }
                });
                scope.$on('$destroy', function () {
                    valueChangeWatcher();
                });
            }

        };
    }

    sitPiDatalistController.$inject = ['$scope', 'common.base', 'common.widgets.messageOverlay.service'];
    function sitPiDatalistController($scope, common, messageOverlay) {
        init();
        function init() {
        }
    }
})();
