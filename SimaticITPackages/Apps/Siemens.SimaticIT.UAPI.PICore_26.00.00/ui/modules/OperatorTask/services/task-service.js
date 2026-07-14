/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {

    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .service('uapi_taskService', TaskService);

    TaskService.$inject = ['common.base', 'common.services.runtime.commandModel', '$q'];

    function TaskService(commonBase, CommandModel, $q) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;
        self._entityName = 'WorkOrderContext';
        self._appName = 'UDM';
        self._commands = {
            create: 'CreateTask',
            update: 'UpdateTask',
            remove: 'DeleteTask',
            freeze: 'FreezeTask',
            unfreeze: 'UnfreezeTask',
            abort: 'AbortTask',
            activate: 'ActivateTask',
            cancel: 'CancelTask',
            complete: 'CompleteTask',
            fail: 'FailTask',
            pause: 'PauseTask',
            recover: 'RecoverTask',
            resume: 'ResumeTask',
            skip: 'SkipTask',
            start: 'StartTask',
            suspend: 'SuspendTask',
            repeat: 'RepeatWorkOrderTask'
        };

        var service = {
            _finalStatesNIds: [],
            getCommonTaskDetails: getCommonTaskDetails,
            getAllByODataFilter: getAllByODataFilter,
            getWorkOrders: getWorkOrders,
            getWorkOrderByWorkOrderNId: getWorkOrderByWorkOrderNId,
            getWorkOrderOperations: getWorkOrderOperations,
            getWorkOrderOperationsByWorkOrderId: getWorkOrderOperationsByWorkOrderId,
            getWorkCenters: getWorkCenters,
            getLocations: getLocations,
            //getWorkProcedureNIds: getWorkProcedureNIds,
            //getWorkProcedureNIdsByWorkOrderOperationId: getWorkProcedureNIdsByWorkOrderOperationId,
            getSequences: getSequences,
            getSequencesByWorkOrderOperationNId: getSequencesByWorkOrderOperationNId,
            getEquipments: getEquipments,
            getEquipementHierachy: getEquipementHierachy,
            getWorkProcessFromNId: getWorkProcessFromNId,
            getTaskRequirementTags: getTaskRequirementTags,
            getById: getById,
            create: create,
            update: update,
            remove: remove,
            freeze: freeze,
            unfreeze: unfreeze,
            abort: abort,
            activate: activate,
            cancel: cancel,
            complete: complete,
            fail: fail,
            pause: pause,
            recover: recover,
            resume: resume,
            skip: skip,
            start: start,
            suspend: suspend,
            repeat: repeat,
            executeReadingFunction: executeReadingFunction,
            getConfigKey: getConfigKey
        };

        function init() {
            getTaskFinalStatuses().then(function (data) {
                service._finalStatesNIds = data.value;
            });
        }

        function getTaskFinalStatuses() {
            var queryModel = {};
            queryModel.appName = 'UDM';
            queryModel.entityName = 'Status';
            queryModel.options = '$expand=StateMachine&$filter=Outcome%20ne%20Siemens.SimaticIT.ReferenceData.UDM_RF.RFModel.Types.ReadingModel.StatusesOutcome%27NoOutcome%27%20and%20StateMachine/NId%20eq%20%27TaskStateMachine%27&$select=NId';
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        init();

        var execGetAll = function (options) {
            var queryModel = {};
            queryModel.appName = self._appName;
            queryModel.entityName = self._entityName;
            queryModel.options = options;
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        };

        function executeReadingFunction(readingFunctionName, readingFunctionParameters, readingFunctionOptions) {
            var readingFunctionModel = {};
            readingFunctionModel.appName = 'PICore';
            readingFunctionModel.functionName = readingFunctionName;
            readingFunctionModel.params = readingFunctionParameters;
            readingFunctionModel.options = readingFunctionOptions;
            return self._backendService.read(readingFunctionModel).catch(self._backendService.backendError);
        }
        function getConfigKey() {
            var OTLConfiguration = 'OTLConfiguration';
            var TimeBased = 'EnableTimeBasedQualityExecutionOTLVisualization';
            var queryModel = {};
            queryModel.appName = 'Configuration';
            queryModel.entityName = 'ConfigurationKey';
            queryModel.options = '$select=Val&$expand=ConfigurationAppDomain($filter=NId eq \'' + OTLConfiguration + '\')&$filter=NId eq \'' + TimeBased + '\'';
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function executeCommand(commandName, commandParameters) {
            var commandModel = {};
            commandModel.appName = self._appName;
            commandModel.commandName = commandName;
            commandModel.params = commandParameters;
            return self._backendService.invoke(commandModel).catch(self._backendService.backendError);
        }

        function getAllByODataFilter(filter, sortInfo) {
            var options = (filter) ? '$filter=' + filter : '';
            if (options !== '') { options += '&'; }
            options += '$orderby=';
            if (sortInfo && sortInfo.field && sortInfo.field.indexOf('.') != -1) {
                sortInfo.field = sortInfo.field.replace('.', '/');
            }
            options += (sortInfo) ? (sortInfo.field + ' ' + sortInfo.direction) : 'TaskFlow/Sequence asc';
            return execGetAll(options);
        }

        function getCommonTaskDetails(taskId) {
            var params = {
                TaskId: taskId
            };
            return executeReadingFunction('RF_GetTaskDetails', params, '');
        }

        function getById(Id) {
            var options = '$filter=Id eq ' + Id + '';
            return execGetAll(options);
        }

        function getWorkOrders() {
            var options = '$orderby=NId asc';
            var queryModel = { appName: self._appName, entityName: 'WorkOrder', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function getWorkOrderByWorkOrderNId(workOrderNId) {
            var options = '$filter=NId eq ' + workOrderId + '';
            var queryModel = { appName: self._appName, entityName: 'WorkOrder', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function getWorkOrderOperations() {
            var options = '';
            var queryModel = { appName: self._appName, entityName: 'WorkOrderOperation', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError).then(getDistinct);

            function getDistinct(data) {
                var workOrderOperations = data.value;
                var result = [];
                for (var i = 0; i < workOrderOperations.length; i++) {
                    var alreadyExist = false;
                    for (var j = 0; j < result.length; j++) {
                        if (workOrderOperations[i].NId == result[j].NId) {
                            alreadyExist = true;
                            break;
                        }
                    }
                    if (!alreadyExist) { result[result.length] = workOrderOperations[i]; }
                }
                return { value: result };
            }
        }
        function getWorkOrderOperationsByWorkOrderId(workOrderId) {
            var options = '$filter=WorkOrder_Id eq ' + workOrderId + '';
            var queryModel = { appName: self._appName, entityName: 'WorkOrderOperation', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }
        function getWorkCenters() {
            var options = '$filter=IsHidden eq false&$orderby=NId asc';
            var queryModel = { appName: self._appName, entityName: 'WorkCenter', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }
        function getLocations() {
            var options = '$filter=IsHidden eq false&$orderby=NId asc';
            var queryModel = { appName: self._appName, entityName: 'Location', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }
        //function getWorkProcedureNIds() {
        //    var options = '';
        //    var queryModel = { appName: self._appName, entityName: 'WorkOrderOperationActivity', options: options };
        //    return self._backendService.findAll(queryModel).catch(self._backendService.backendError).then(getDistinct);

        //    function getDistinct(data) {
        //        var workProcedures = data.value;
        //        var result = [];
        //        for (var i = 0; i < workProcedures.length; i++) {
        //            var alreadyExist = false;
        //            for (var j = 0; j < result.length; j++) {
        //                if (workProcedures[i].WorkProcedureNId == result[j].WorkProcedureNId) {
        //                    alreadyExist = true;
        //                    break;
        //                }
        //            }
        //            if (!alreadyExist) { result[result.length] = workProcedures[i]; }
        //        }
        //        return { value: result };
        //    }
        //}
        //function getWorkProcedureNIdsByWorkOrderOperationId(workOrderOperationId) {
        //    var options = '$filter=WorkOrderOperation/Id eq ' + workOrderOperationId + '&$expand=WorkOrderOperation';
        //    var queryModel = { appName: self._appName, entityName: 'WorkOrderOperationActivity', options: options };
        //    return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        //}

        function getSequences() {
            return getSequencesByWorkOrderOperationNId();
        }

        function getSequencesByWorkOrderOperationNId(workOrderOperationNId/*, workProcedureNId*/) {
            var options = '$expand=Task&$filter=Task/TaskFlow/Sequence ne null';
            if (workOrderOperationNId /*&& workProcedureNId*/) {
                options += ' and WorkOrderOperationNId eq \'' + workOrderOperationNId + '\' and WorkProcedureNId eq \'' /*+ workProcedureNId + '\''*/;
            }
            return execGetAll(options).then(getDistinct);

            function getDistinct(data) {
                var workOrderContexts = data.value;
                var result = [];
                for (var i = 0; i < workOrderContexts.length; i++) {
                    var alreadyExist = false;
                    for (var j = 0; j < result.length; j++) {
                        if (workOrderContexts[i].Task.TaskFlow.Sequence == result[j].Sequence) {
                            alreadyExist = true;
                            break;
                        }
                    }
                    if (!alreadyExist) {
                        result[result.length] = { Sequence: workOrderContexts[i].Task.TaskFlow.Sequence };
                    }
                }
                return { value: result };
            }
        }

        function getWorkProcessFromNId(workProcessNId) {
            var options = '$filter=NId eq \'' + workProcessNId + '\'';
            var queryModel = { appName: 'BPFlow', entityName: 'WorkProcess', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function getEquipments() {
            var options = '$orderby=NId asc';
            var queryModel = { appName: self._appName, entityName: 'Equipment', options: options };
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function getEquipementHierachy(parentEquipmentNId) {

            var params = {
                EquipmentNId: parentEquipmentNId
            };
            return executeReadingFunction('RF_GetOTLEquipments', params, '');
        }

        function getTaskRequirementTags(taskId) {
            var deferred = $q.defer();

            loadRequirementTagListParam().then(function (res) {
                if (res && res.value.length === 1 && res.value[0].ParameterValue) {
                    deferred.resolve(res.value[0].ParameterValue);
                } else {
                    deferred.resolve(null);
                }
            }, function () {
                deferred.resolve(null);
            });

            return deferred.promise;

            function loadRequirementTagListParam() {
                var queryModel = {
                    appName: 'UDM',
                    entityName: 'TaskParameter',
                    options: '$filter=Task_Id eq ' + taskId + ' and NId eq %27RequirementTagList%27 and Direction eq %27Input%27'
                };

                return self._backendService.findAll(queryModel);
            }
        }

        function create(data) {

            var obj = {
                'NId': data.NId,
                'Name': data.Name,
                'Description': data.Description,
                'TaskDefinitionNId': data.TaskDefinitionNId,
                'TaskDefinitionRevision': data.TaskDefinitionRevision,
                'Sequence': data.Sequence,
                'ErrorCount': data.ErrorCount,
                'StatusNId': data.StatusNId,
                //'WorkProcedureNId': data.WorkProcedureNId,
                //'WorkProcedureRevision': data.WorkProcedureRevision,
                'WorkOrderNId': data.WorkOrderNId,
                'WorkOrderOperationNId': data.WorkOrderOperationNId,
                'IsSkippable': data.IsSkippable,
                'ContinueOnSuccess': data.ContinueOnSuccess,
                'ContinueOnFailure': data.ContinueOnFailure
            };
            return executeCommand(self._commands.create, obj);
        }

        function update(data) {

            var obj = {
                'Id': data.Id,
                'Name': data.Name,
                'Description': data.Description,
                'Sequence': data.Sequence,
                'ErrorCount': data.ErrorCount,
                'StatusNId': data.StatusNId,
                //'WorkProcedureNId': data.WorkProcedureNId,
                //'WorkProcedureRevision': data.WorkProcedureRevision,
                'WorkOrderNId': data.WorkOrderNId,
                'WorkOrderOperationNId': data.WorkOrderOperationNId
            };

            return executeCommand(self._commands.update, obj);

        }

        function remove(data) {

            var obj = {
                'Id': data.Id
            };

            return executeCommand(self._commands.remove, obj);
        }

        function freeze(data) {
            var obj = {
                'Id': data.Id
            };

            return executeCommand(self._commands.freeze, obj);
        }

        function repeat(data) {
            var obj = {
                'Id': data.Id
            };

            return executeCommand(self._commands.repeat, obj);
        }

        function unfreeze(data) {
            var obj = {
                'Id': data.Id
            };

            return executeCommand(self._commands.unfreeze, obj);

        }

        function abort(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.abort, obj);
        }

        function activate(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.activate, obj);
        }

        function cancel(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.cancel, obj);
        }

        function complete(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.complete, obj);
        }

        function fail(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.fail, obj);
        }

        function pause(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.pause, obj);
        }

        function recover(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.recover, obj);
        }

        function resume(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.resume, obj);
        }

        function skip(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.skip, obj);
        }

        function start(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.start, obj);
        }

        function suspend(data) {
            var obj = {
                'Id': data.Id,
                'User': data.User
            };

            return executeCommand(self._commands.suspend, obj);
        }

        return service;

    }
}());
