/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {

    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .service('uapi-taskParameterService', TaskParameterService);

    TaskParameterService.$inject = ['common.base', 'common.services.runtime.commandModel', '$q'];

    function TaskParameterService(commonBase, CommandModel, $q) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;
        self._entityName = 'TaskParameter';
        self._appName = 'UDM';
        self._commands = {
            update: 'UpdateTaskParameter',
            remove: 'DeleteTaskParameter'
        };

        var service = {
            getAll: getAll,
            getByTaskId: getByTaskId,
            update: update,
            remove: remove
        };

        var execGetAll = function (options) {
            var queryModel = {};
            queryModel.appName = self._appName;
            queryModel.entityName = self._entityName;
            queryModel.options = options;
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        };

        function executeCommand(commandName, commandParameters) {
            var commandModel = {};
            commandModel.appName = self._appName;
            commandModel.commandName = commandName;
            commandModel.params = commandParameters;
            return self._backendService.invoke(commandModel).catch(self._backendService.backendError);
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function getByTaskId(taskId) {
            var options = '$filter=Task_Id eq ' + taskId + '';
            return getAll(options);
        }

        function update(data) {

            var obj = {
                'Id': data.Id,
                'ParameterValue': data.ParameterValue
            };

            return executeCommand(self._commands.update, obj);

        }

        function remove(data) {

            var obj = {
                'Id': data.Id
            };

            return executeCommand(self._commands.remove, obj);
        }

        return service;

    }
}());
