/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .directive('piOptskStatusCellTemplate', statusCellTemplate);

    function statusCellTemplate() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-StatusCellTemplate.html',
            controller: StatusCellTemplateController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                status: '='
            }
        };
    }

    StatusCellTemplateController.$inject = ['uapi-statusColorMapService'];

    function StatusCellTemplateController(statusColorMapService) {
        var vm = this;

        vm.getStatusColor = getStatusColor;
        vm.getStatusName = getStatusName;

        function activate() {
        }

        function getStatusColor() {
            return statusColorMapService.getMappingByStatusNId(vm.status.NId).color;
        }

        function getStatusName() {
            return statusColorMapService.getMappingByStatusNId(vm.status.NId).Name;
        }

        activate();

    }

})();
