/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {

    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore')
        .service('uapi_processDefinitionService', ProcessDefinitionService);

        ProcessDefinitionService.$inject = ['common.base', 'common.services.runtime.commandModel', '$q', '$stateParams'];

    function ProcessDefinitionService(commonBase, CommandModel, $q,$stateParams) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;
        self._entityName = 'WorkOrderOperationWorkProcess';
        self._appName = 'PICore';
        self._commands = {
            update: 'UpdateTaskParameter',
            remove: 'DeleteTaskParameter',
            StartNewWorkProcess: 'StartNewWorkProcessExtended'
        };
        self._readingFunctions = {
            readManualProcessDefinitions: 'RF_GetWorkOrderOperationProcessDefinitions'
        };
        var service = {
            getAll: getAll,
            getByTaskId: getByTaskId,
            StartNewWorkProcess : StartNewWorkProcess,
            getManualProcessDefinitions : getManualProcessDefinitions
        };

        /*function getManualProcessDefinitions() {
            var options = '$expand=WorkOrderOperation($expand=WorkOrder)';
            // check if in the workorder context only
            if (!isNullOrEmpty(parentParameters.WorkOrderNId)) {
                options += '&$filter=WorkOrderOperation/WorkOrder/NId eq \'' + parentParameters.WorkOrderNId + '\' and IsForManualExecution eq true';
                if (!isNullOrEmpty(parentParameters.WorkOrderOperationNId)) {
                    options += ' and WorkOrderOperation/NId eq \'' + parentParameters.WorkOrderOperationNId + '\'';
                }
                //to replace with readingfunctions
                return execGetAll(options);
            }
        }*/
        function getManualProcessDefinitions(params) {
            var input = {};
            input.WorkOrderNId = params.WorkOrderNId;
            if (params.WorkOrderOperationNId) {
                input.WorkOrderOperationNId = params.WorkOrderOperationNId;
            }
            input.IsForManualExecutionOnly = true;
            return read(self._readingFunctions.readManualProcessDefinitions,input,'');
        }

        var execGetAll = function (options) {
            var queryModel = {};
            queryModel.appName = self._appName;
            queryModel.entityName = self._entityName;
            queryModel.options = options;
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        };

        var read = function (functionName, params, options) {
            var object = {
                "appName": self._appName,
                "functionName": functionName,
                "params": params,
                "options": options
            };

           return self._backendService.read(object).catch(self._backendService.backendError);
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

        function StartNewWorkProcess(selectedProcessDefinition,contextParams) {
            var processDefinitionNId = selectedProcessDefinition.processDefinitionNId;
            var processDefinitionRevision = selectedProcessDefinition.processDefinitionRevision;
            var workOrderOperationNId = selectedProcessDefinition.workOrderOperationNId;

            var input = {
                ProcessDefinitionNId: processDefinitionNId,
                ProcessDefinitionRevision: processDefinitionRevision,
                //Description: "Manual start of " + processDefinitionNId,
                ContextUserFieldValues: [
                    {
                        ContextDefinitionNId: "PIProcessDefinitionContext",
                        UserFieldValues: [
                            {
                                UserFieldNId: "WorkOrderNId",
                                UserFieldValue: contextParams.WorkOrderNId
                            },
                            {
                                UserFieldNId: "WorkOrderOperationNId",
                                UserFieldValue: workOrderOperationNId
                            }]
                    }
                ]
            };

            return executeCommand(self._commands.StartNewWorkProcess, input);
        }

        return service;

    }
}());
