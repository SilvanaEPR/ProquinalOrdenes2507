(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask').directive('piOptskContext', piOptskContextDirective);

    function piOptskContextDirective() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                onRegisterApi: '&'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-context.html',
            controller: piOptskContextController,
            controllerAs: 'vm'
        };
    }

    piOptskContextController.$inject = ['$translate', 'common.base', '$state', '$rootScope', '$timeout', 'uapi_taskService'];

    function piOptskContextController($translate, commonBase, $state, $rootScope, $timeout, taskService) {
        var vm = this;
        vm.selectedItem = null;
        var logger, backendService;
        const NA = $translate.instant('picore.labels.notApplicable');
        activate();

        function activate() {

            logger = commonBase.services.logger.service.getModuleLogger('piOptskContext');
            backendService = commonBase.services.runtime.backendService;

            vm.api = {
                contextInfoInitialized: contextInfoInitialized
            };
            if (vm.onRegisterApi) {
                vm.onRegisterApi({ api: vm.api });
            }

            init();
            exposeApi();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);

            vm.ready = false;
            vm.isCollapsed = true;
        }

        vm.collapseContextInfo = function () {
            if (!vm.isCollapsed) {
                vm.isCollapsed = true;
            } else {
                vm.isCollapsed = false;
            }

            setTimeout(function () {
                $(window).resize();
            }, 300);
        };

        function exposeApi() {
            vm.contextInfoInitialized = contextInfoInitialized;
        }

        function isNullOrEmpty(variable) {
            return variable === undefined || variable === null || variable === '';
        }

        function initDataDefaultValue() {
            vm.workOrder = { NId: NA, Name: NA, MaterialNId: NA, Status: NA, QuantityAndUoM: NA, Facets: [{ Type: NA }] };
            vm.workOrderOperationStatus = {};
            vm.material = { NId: NA, Name: NA };
            vm.equipment = { NId: NA, Name: NA };
            vm.equipmentMainStateMachine = { Status: { StatusNId: NA } };
            vm.task = { NId: NA, Definition: NA, Iteration: NA, StatusNId: NA };
        }

        function getandSetWorkOrderData() {
            if (!isNullOrEmpty(vm.selectedItem) && !isNullOrEmpty(vm.selectedItem.WorkOrderNId)) {

                var options = '$filter=NId eq \'' + vm.selectedItem.WorkOrderNId +
                    '\'&$expand=WorkOrderOperations($orderby=Sequence),' +
                    'Facets($filter=isof(\'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended\'))';
                var queryModel = { appName: 'PICore', entityName: 'WorkOrder', options: options };

                backendService.findAll(queryModel).then(function (data) {
                    if ((data) && (data.succeeded)) {
                        vm.workOrder = data.value[0];
                        if (isNullOrEmpty(vm.workOrder.Facets[0].Type)) {
                            vm.workOrder.Facets[0].Type = NA;
                        }
                        vm.workOrder.QuantityAndUoM = NA;
                        if (!isNullOrEmpty(vm.workOrder.MaterialNId)) {
                            vm.workOrder.QuantityAndUoM = vm.workOrder.Quantity.QuantityValue + " " + vm.workOrder.Quantity.UoMNId;
                            getMaterialData(vm.workOrder.MaterialNId, vm.workOrder.MaterialRevision);
                        }
                    }
                    vm.ready = true;
                }, backendService.backendError);
            }
        }

        /*
         * Get the Material related to the WO product
         */
        function getMaterialData(materialNId, materialRev) {
            var options = {
                'appName': 'PICore',
                'entityName': 'MAT_Material',
                'options': '$filter=NId eq \'' + materialNId + '\' and Revision eq \'' + materialRev + '\''
            };
            backendService.findAll(options).then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.material = data.value[0];
                }
                vm.ready = true;
            }, backendService.backendError);
        }

        function getEquipmentMainStateMachine() {
            if (!isNullOrEmpty(vm.equipment)) {
                if (vm.equipment.Facets.length > 0 && !isNullOrEmpty(vm.equipment.Facets[0].MainStateMachineNId)) {
                    // get status of the main state machine
                    vm.equipmentMainStateMachine = vm.equipment.StateMachines.find(function (elem) {
                        return elem.Status.StateMachineNId === vm.equipment.Facets[0].MainStateMachineNId;
                    });
                }
            }
        }

        function getEquipmentData() {
            if (!isNullOrEmpty(vm.selectedItem) && !isNullOrEmpty(vm.selectedItem.EquipmentNId)) {
                var equipmentNId = vm.selectedItem.EquipmentNId;
                var options = {
                    'appName': 'Equipment',
                    'entityName': 'Equipment',
                    'options': '$expand=StateMachines,' +
                        'Facets($filter=EntityType eq \'Siemens.SimaticIT.UAPI.OperationalData.PIEquipment_OP.OPModel.DataModel.ProcessAdditionalProperties\')' +
                        '&$filter=NId eq \'' + equipmentNId + '\''
                };
                backendService.findAll(options).then(function (data) {
                    if ((data) && (data.succeeded)) {
                        vm.equipment = data.value[0];
                        getEquipmentMainStateMachine();
                    }
                    vm.ready = true;
                }, backendService.backendError);
            }
        }

        function getTaskData() {
            if (!isNullOrEmpty(vm.selectedItem) && !isNullOrEmpty(vm.selectedItem.Id)) {
                taskService.getCommonTaskDetails(vm.selectedItem.Id)
                    .then(function (response) {
                        vm.task = response.value[0];
                        vm.task.Iteration = vm.task.IterationMaximum !== null ? vm.task.Iteration + '/' + vm.task.IterationMaximum : NA;
                    });
            }
        }

        function contextInfoInitialized(selectedItem) {
            vm.selectedItem = selectedItem;

            if (selectedItem) {
                initDataDefaultValue();
                getandSetWorkOrderData();
                getEquipmentData();
                getTaskData();
            }
        }
    }
})();
