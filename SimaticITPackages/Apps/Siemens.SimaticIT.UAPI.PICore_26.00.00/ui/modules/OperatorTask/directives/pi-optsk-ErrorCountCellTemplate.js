/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .directive('piOptskErrorCountCellTemplate', errorCountCellTemplate);

    function errorCountCellTemplate() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-ErrorCountCellTemplate.html',
            controller: ErrorCountCellTemplateController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                value: '='
            }
        };
    }

    ErrorCountCellTemplateController.$inject = [];

    function ErrorCountCellTemplateController() {

    }

})();
