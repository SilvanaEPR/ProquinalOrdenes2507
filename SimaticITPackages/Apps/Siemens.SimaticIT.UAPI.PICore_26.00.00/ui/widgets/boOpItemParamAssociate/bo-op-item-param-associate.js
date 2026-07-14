/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiBoOpItemParamAssociate', boOpItemParamAssociate);

    function boOpItemParamAssociate() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/boOpItemParamAssociate/bo-op-item-param-associate.html',
            controller: boOpItemParamAssociateController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onBoopItemParamSelectedApi: '&'
            }
        };
    }

    boOpItemParamAssociateController.$inject = ['$rootScope',
        '$scope',
        'common.services.logger.service',
        'common.services.component.uiComponentService',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.boopItemParametersService',
        'common.widgets.messageOverlay.service',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        '$translate',
        '$q'];
    function boOpItemParamAssociateController($rootScope,
        $scope,
        loggerService,
        uiComponentService,
        base,
        dataService,
        messageOverlay,
        commonService,
        $translate,
        $q) {
        var vm = this;
        var logger;
        //var deferred = $q.defer();
        vm.isParamSelected = false;
        vm.billOfOperationsItemParameterSpecificationAssociationComponentTitle = $translate.instant('picore.titles.parameterSpecificationAssociationComponentTitle');
        vm.translatedAssociate = $translate.instant('picore.buttonsAndTooltips.associate');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');
        vm.taskDefTableTitle = $translate.instant('picore.titles.taskDefTableTitle');
        vm.taskDefParamTableTitle = $translate.instant('picore.titles.taskDefParamTableTitle');
        var ops = {
            eq: '=',
            neq: '<>',
            lt: '<',
            lteq: '<=',
            gt: '>',
            gteq: '>=',
            in: 'in',
            con: 'contains',
            sw: 'startsWith',
            ew: 'endsWith',
            isnull: 'isnull',
            isnotnull: 'isnotnull'
        };
        vm.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
        vm.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.booleanOperators = [ops.eq, ops.neq];
        activate();
        function activate() {
            logger = loggerService.getModuleLogger('boopitemparamassociation');
            init();
            registerEvents();
            exposeApi();
        }

        vm.api = {
            setSelectedItem: setSelectedItem
        };
        vm.onBoopItemParamSelectedApi({ api: vm.api });

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.selectedTaskDefinition = null;
            initTaskDefTableData();
            initTaskDefParamTableData();
            //vm.associate = associate;
            vm.cancel = cancel;
        }

        function cancel() {
            vm.isParamSelected = false;
            onPiTableTaskDefinitionParameterSelected(null, null);
            onPiTableTaskDefinitionSelected(null, null);
            $scope.$emit('parameterAssociationCancel');
        }

        //function associate() {
        //    var params = {
        //        OperationParameterSpecificationId: vm.boOpItemParamId,
        //        TaskDefinitionNId: vm.taskDefinitionNId,
        //        TaskDefinitionRevision: vm.taskDefinitionRevision,
        //        TaskDefinitionParameterNId: vm.taskDefinitionParamNId,
        //        WorkProcedureNId: vm.workProcedureNId,
        //        WorkProcedureRevision: vm.workProcedureRevision,
        //        WorkProcedureItemSequence: vm.sequence
        //    };
        //    dataService.associateTaskDefinitionParameterWithOperationParameterSpecification(params)
        //        .then(onSuccessfulAssociation, function (reason) {
        //            logger.logErr('Error associating bill of operations item parameter specification to task definition parameter', reason);
        //        });
        //}

        //function onSuccessfulAssociation() {
        //    onPiTableTaskDefinitionParameterSelected(null, null);
        //    onPiTableTaskDefinitionSelected(null, null);
        //    $scope.$emit('parameterSuccessfulAssociation', vm.boOpItemParamId);
        //}

        function initTaskDefTableData() {

            vm.taskDefDataConfig = {
                Headers: [
                    {
                        Key: 'TaskDefinitionNId',
                        DisplayName: $translate.instant('picore.headers.tables.taskDefNId')
                    },
                    {
                        Key: 'TaskDefinitionRevision',
                        DisplayName: $translate.instant('picore.headers.tables.taskDefRev')
                    },
                    {
                        Key: 'Sequence',
                        DisplayName: $translate.instant('picore.headers.tables.sequence'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.wpNId')
                    },
                     {
                         Key: 'Revision',
                         DisplayName: $translate.instant('picore.headers.tables.wpRev')
                     }

                ],
                onPiSelectionChangeCallback: onPiTableTaskDefinitionSelected
            };

            vm.taskDefTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.wpNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'Revision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.wpRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'Sequence': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.sequence'),
                    filtering: {
                        type: 'number',
                        allowedCompareOperators: vm.numberOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'TaskDefinitionNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.taskDefNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'TaskDefinitionRevision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.taskDefRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };

            vm.taskDefTableConfig = {
                data: vm.tds,
                selectionMode: 'single',
                fields: vm.taskDefTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };
        }

        function onPiTableTaskDefinitionSelected(list, item) {
            if (item) {
                vm.selectedTaskDefinition = item;
                vm.taskDefinitionNId = item.TaskDefinitionNId;
                vm.taskDefinitionRevision = item.TaskDefinitionRevision;
                vm.sequence = item.Sequence;
                vm.workProcedureNId = item.NId;
                vm.workProcedureRevision = item.Revision;

            } else {
                if (vm.selectedTaskDefinition) {
                    vm.selectedTaskDefinition.isSelected = false;
                }
                vm.isParamSelected = false;
                onPiTableTaskDefinitionParameterSelected(null, null);
                vm.selectedTaskDefinition = null;
                vm.taskDefinitionNId = null;
                vm.taskDefinitionRevision = null;
                vm.sequence = null;
                vm.workProcedureNId = null;
                vm.workProcedureRevision = null;
                vm.taskDefinitionId = null;

            }
            vm.taskDefParamDataConfig.deSelect();
        }

        function onGetTaskDefinitionSuccess(data) {
            if (data.value.length === 0) {
                vm.taskDefinitionId = null;
            } else if (data.value.length === 1) {
                vm.taskDefinitionId = data.value[0].Id;
                vm.taskDefParamTableConfig.dataSource.optionsString = '$filter=TaskDefinition_Id eq ' + vm.taskDefinitionId + '&$expand=TaskDefinition';
                vm.taskDefParamTableConfig.refreshData();
            }
        }

        $scope.$watch('vm.taskDefinitionNId', function (newValue) {

            if (newValue) {
                vm.taskDefParamDataConfig.deSelect();
                if (vm.taskDefinitionRevision !== null) {
                    dataService.getTaskDefinitionIdByRevisionedTaskDefinition(vm.taskDefinitionNId, vm.taskDefinitionRevision)
                        .then(onGetTaskDefinitionSuccess, function (reason) {
                            logger.logErr('Error getting Task Definition identifier', reason);
                        });
                } else {
                    dataService.getCurrentTaskDefinitionIdByTaskDefinitionNId(vm.taskDefinitionNId)
                        .then(onGetTaskDefinitionSuccess, function (reason) {
                            logger.logErr('Error getting current Task Definition identifier', reason);
                        });
                }
            } else {
                if (vm.taskDefParamDataConfig.deSelect) {
                    vm.taskDefParamDataConfig.deSelect();
                }
            }
        }, true

        );


        function initTaskDefParamTableData() {
            vm.taskDefParamDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.taskDefParamNId'),
                        IsSortDefault: true
                    },
                     {
                         Key: 'ParameterType',
                         DisplayName: $translate.instant('picore.headers.tables.type')
                     },
                     {
                         Key: 'ParameterValue',
                         DisplayName: $translate.instant('picore.headers.tables.parameterValue')
                     },
                     {
                         Key: 'TaskDefinition.NId',
                         DisplayName: $translate.instant('picore.headers.tables.taskDefNId')
                     },
                     {
                         Key: 'TaskDefinition.Revision',
                         DisplayName: $translate.instant('picore.headers.tables.taskDefRev')
                     }
                ],
                onPiSelectionChangeCallback: onPiTableTaskDefinitionParameterSelected
            };

            vm.taskDefParamTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.taskDefParamNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                }
            };
            var taskDefinitionIdEmpty = '00000000-0000-0000-0000-000000000000';
            vm.taskDefParamTableConfig = {
                data: [],
                dataSource: {
                    dataService: commonService,
                    appName: 'PICore',
                    dataEntity: 'TaskDefinitionParameter',
                    optionsString: '$filter=TaskDefinition_Id eq ' + taskDefinitionIdEmpty + '&$expand=TaskDefinition'
                },
                selectionMode: 'single',
                fields: vm.taskDefParamTableFields,
                pageSizes: [5, 8],
                pageSizeDefault: 5
            };
        }

        function onPiTableTaskDefinitionParameterSelected(list, item) {
            if (item) {
                vm.isParamSelected = true;
                vm.taskDefinitionParamNId = item.NId;
            } else {
                vm.isParamSelected = false;
            }
        }

        function exposeApi() {

        }

        function registerEvents() {
            $scope.$on('$destroy', deregisterEvents);
        }

        function deregisterEvents() {

        }

        function setSelectedItem(boOpItemParamId) {
            vm.boOpItemParamId = boOpItemParamId;

            if (boOpItemParamId) {
                dataService.getBoOpItemByParamId(boOpItemParamId)
                    .then(onGetBoOpItemByParamIdSuccess, function (reason) {
                        logger.logErr('Error getting Bill of Operations Item natural identifier', reason);
                    });
            }
        }

        function onGetBoOpItemByParamIdSuccess(data) {
            if (data.value && data.value.length === 1) {
                vm.boOpNId = data.value[0].BoOpNId;
                vm.boOpRevision = data.value[0].BoOpRevision;
                vm.boOpItemNId = data.value[0].BoOpItemNId;
                if (vm.boOpItemNId && vm.boOpNId && vm.boOpRevision) {
                    dataService.getBoOpItemByNIdAndBoOp(vm.boOpItemNId, vm.boOpNId, vm.boOpRevision)
                        .then(onGetBoOpItemSuccess, function (reason) {
                            logger.logErr('Error getting Bill of Operations Item', reason);
                        });
                }
            }
        }

        function onGetBoOpItemSuccess(data) {
            if (data.value && data.value.length === 1) {
                vm.boOpItemOpNId = data.value[0].OperationNId;
                vm.boOpItemOpRev = data.value[0].OperationRevision;
                //if (vm.boOpItemOpNId && vm.boOpItemOpRev) {
                //    dataService.getWorkProceduresByRevisionedOperation(vm.boOpItemOpNId, vm.boOpItemOpRev)
                //        .then(onGetWorkProceduresSuccess, function (reason) {
                //            logger.logErr('Error getting Work Procedures from Operation', reason);
                //        });
                //}
            }
        }

        //function onGetWorkProceduresSuccess(data) {
        //    vm.wps = [];
        //    vm.tds = [];
        //    var calls = [];
        //    if (data.value.length > 0) {
        //        for (var i = 0; i < data.value[0].WorkProcedures.length; i++) {
        //            vm.wps[i] = { wpNid: data.value[0].WorkProcedures[i].WorkProcedureNId, wpRev: data.value[0].WorkProcedures[i].WorkProcedureRevision };
        //            calls.push(dataService.getWorkProceduresItemsByWorkProcedure(vm.wps[i].wpNid, vm.wps[i].wpRev));
        //        }
        //        $q.all(calls).then(onGetWorkProcedureItemsSuccess);
        //    }
        //}

        //function onGetWorkProcedureItemsSuccess(result) {
        //    deferred.resolve(JSON.stringify(result));
        //    for (var i = 0; i < result.length; i++) {
        //        for (var j = 0; j < result[i].value.length; j++) {
        //            for (var k = 0; k < result[i].value[j].WorkProcedureItems.length; k++) {
        //                vm.tds.push({
        //                    NId: result[i].value[j].NId,
        //                    Revision: result[i].value[j].Revision,
        //                    Sequence: result[i].value[j].WorkProcedureItems[k].Sequence,
        //                    TaskDefinitionNId: result[i].value[j].WorkProcedureItems[k].TaskDefinitionNId,
        //                    TaskDefinitionRevision: result[i].value[j].WorkProcedureItems[k].TaskDefinitionRevision
        //                });
        //            }
        //        }
        //    }
        //    vm.taskDefTableConfig.data = vm.tds;
        //}
    }
})();
