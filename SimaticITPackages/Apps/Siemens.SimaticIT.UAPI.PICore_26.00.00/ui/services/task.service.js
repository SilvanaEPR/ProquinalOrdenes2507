/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('Siemens.SimaticIT.UAPI.PICore.Task.service', TaskService);


    TaskService.$inject = ['$q', '$state', 'common.base', 'common.services.logger.service'];

	/**
     * @ngdoc service
     * @name TaskService
     *
     * @requires $rootElement
     *
     * @description
     * The TaskService service expose methods to manage Task entity and related objects relevant for Process Industries.
     */
    function TaskService($q, $state, base, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.TaskService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getTaskParametersByTaskId = getTaskParametersByTaskId;
            vm.fetchApplicationLogMessages = fetchApplicationLogMessages;
            vm.getTaskContextsByTaskId = getTaskContextsByTaskId;
        }

        function getTaskParametersByTaskId(Id) {
            var options = '$filter=Task_Id eq ' + Id;

            return backendService.findAll({
                'appName': 'Task',
                'entityName': 'TaskParameter',
                'options': options
            });
        }

        function getTaskContextsByTaskId(Id) {
            var options = '$filter=Task_Id eq ' + Id + '&$Expand=UserFields';

            return backendService.findAll({
                'appName': 'Task',
                'entityName': 'TaskContext',
                'options': options
            });
        }

        function fetchApplicationLogMessages(taskId) {
            var params = {
                TaskId: taskId
            };
            return execRead('RF_FetchApplicationLogMessages', params);
        }

        function execRead(publicName, params) {
            return backendService.read({
                'appName': 'PICore',
                'functionName': publicName,
                'params': params
            });
        }
    }
})();
