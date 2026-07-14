/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/

(function () {
    'use strict';

    /**
     * @ngdoc module
    * @access internal
    * @name Siemens.SimaticIT.UAPI.PICore.directives
     *
     * @description
    * The module consist of Process Industries directives.
     */
    angular.module('Siemens.SimaticIT.UAPI.PICore.widgets', []);

})();

(function () {
    'use strict';

    var app = angular.module('Siemens.SimaticIT.UAPI.PICore.widgets');
    function PiSelectController() { }

    app.controller('PiSelectController', PiSelectController);

    app.directive('sitPiSelect', function () {

        return {
            scope: {},

            restrict: 'E',

            bindToController: {
                'readOnly': '=sitReadOnly',
                'value': '=sitValue',
                'validation': '=sitValidation',
                'options': '=sitOptions',
                'toDisplay': '=sitToDisplay',
                'toKeep': '=sitToKeep',
                'ngBlur': '&?',
                'sitChange': '=?',
                'ngDisabled': '=?',
                'ngFocus': '&?',
                'ngSelected': '=?',
                'ngReadonly': '=?',
                'sitToGroup':'=?'
            },

            controller: 'PiSelectController',

            controllerAs: 'selectCtrl',

            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piSelect/select.html',

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
    });
})();


