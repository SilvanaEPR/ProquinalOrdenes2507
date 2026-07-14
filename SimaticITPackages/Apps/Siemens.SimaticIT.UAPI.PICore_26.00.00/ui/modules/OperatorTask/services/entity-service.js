/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .service('uapi-entityService', entityService);

    entityService.$inject = ['common.base', 'common.services.runtime.commandModel', '$q'];

    function entityService(commonBase, CommandModel, $q) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;
        self._entityName = '';
        self._appName = 'UDM';

        var service = {
            getStatuses: getStatuses,
            getWorkCenters: getWorkCenters,
            getLocations: getLocations,
            //getWorkProcedures: getWorkProcedures,
            getWorkOrders: getWorkOrders,
            getWorkOrderOperations: getWorkOrderOperations,
            getTasksByIterationGroupId: getTasksByIterationGroupId
        };
        activate();

        return service;

        function activate() {
        }

        function getAll(options) {
            var queryModel = {};
            queryModel.appName = self._appName;
            queryModel.entityName = self._entityName;
            queryModel.options = options;
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }


        function getStatuses() {
            self._entityName = 'Status';
            return getAll('$expand=StateMachine&$filter=StateMachine/NId eq \'TaskStateMachine\'');
        }

        function getWorkCenters(options) {
            self._entityName = 'WorkCenter';
            return getAll(options);
        }

        function getLocations(options) {
            self._entityName = 'Location';
            return getAll(options);
        }

        //function getWorkProcedures(options) {
        //    self._entityName = 'WorkProcedure';
        //    return getAll(options);
        //}

        function getWorkOrders(options) {
            self._entityName = 'WorkOrder';
            return getAll(options);
        }

        function getWorkOrderOperations(options) {
            self._entityName = 'WorkOrderOperation';
            return getAll(options);
        }

        function getTasksByIterationGroupId(iterationGroupId) {
            self._entityName = 'Task';
            var options = '$filter=TaskFlow/IterationGroupId eq ' + iterationGroupId;
            return getAll(options);
        }
    }
})();
