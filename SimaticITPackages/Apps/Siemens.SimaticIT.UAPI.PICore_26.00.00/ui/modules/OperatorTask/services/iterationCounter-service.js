/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .service('uapi-iterationCounterService', iterationCounterService);

    iterationCounterService.$inject = ['uapi-entityService', 'uapi-statusColorMapService'];

    function iterationCounterService(entityService, statusColorMapService) {

        var service = {
            getIterationCounterByTaskIterationGroupId: getIterationCounterByTaskIterationGroupId
        };
        activate();

        return service;


        function activate() {
        }

        function getIterationCounterByTaskIterationGroupId(iterationGroupId, outcome) {

            return entityService.getTasksByIterationGroupId(iterationGroupId).then(function (result) {
                if (iterationGroupId == undefined) { return false; }
                if (outcome == undefined || outcome == 'NoOutcome') { return false; }
                if (result.value.length >= result.value[0].TaskFlow.MaxIterations) { return false; }
                for (var i = 0; i < result.value.length; i++) {
                    if (statusColorMapService.getMappingByStatusNId(result.value[i]) == 'NoOutcome') { return false; }
                }
                return true;
            });
        }

    }


})();
