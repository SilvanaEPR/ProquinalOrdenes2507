(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask').directive('piOptskDetail', piOptskDetailDirective);

    function piOptskDetailDirective() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                onRegisterApi: '&',
                onOperationClicked: '&'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-detail.html',
            controller: piOptskDetailController,
            controllerAs: 'vm'
        };
    }
    const POINTER_DIV = '#operationList';

    piOptskDetailController.$inject = ['$translate', 'common.base', '$state', '$rootScope', '$timeout'];

    function piOptskDetailController($translate, commonBase, $state, $rootScope, $timeout) {
        var vm = this;
        vm.selectedItem = null;
        var logger, backendService;
        const operationSelectedEvent = 'otltasklist.operationselected';
        const NA = $translate.instant('picore.labels.notApplicable');
        var sidePanelManager = commonBase.services.sidePanel.service;
        activate();

        function activate() {

            logger = commonBase.services.logger.service.getModuleLogger('piOptskDetail');
            backendService = commonBase.services.runtime.backendService;

            vm.api = {
                selectedItemChanged: selectedItemChanged
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
            vm.isCollapsed = false;
            vm.displayEmptyHeaderPlaceholder = true;
        }

        vm.collapseDetail = function () {
            if (!vm.isCollapsed) {
                vm.isCollapsed = true;
                collapseButton.className = 'collapse-btn  up';
            } else {
                vm.isCollapsed = false;
                collapseButton.className = 'collapse-btn  down';
            }
        };

        function initDataDefaultValue() {
            vm.workOrder = { NId: NA, Name: NA, MaterialNId: NA, Status: NA, QuantityAndUoM: NA, LotNId: NA, Facets: [{Type: NA}] };
            vm.workOrderOperationStatus = {};
            vm.material = { NId: NA, Name: NA };
            vm.equipment = { NId: NA, Name: NA };
            vm.equipmentMainStateMachine = {Status: { StatusNId: NA } };
            vm.processData = {
                NId: NA,
                Name: NA,
                Description: NA,
                Status: { StatusNId: NA },
                ProcessDefinitionNId: NA,
                ProcessDefinitionRevision: NA
            };
            $(POINTER_DIV).html('');
        }

        function exposeApi() {
            vm.selectedItemChanged = selectedItemChanged;
        }

        /*
         * Get equipment main state Machine
         */
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

        /*
         * Update operation diagram info in the header
         */
        function drawOperationDiagram() {
            // Delete existing diagram
            $(POINTER_DIV).html('');

            if (vm.workOrder.WorkOrderOperations.length > 0) {
                var ul = document.createElement('ul');
                ul.className = 'list';

                for (var i = 0; i < vm.workOrder.WorkOrderOperations.length; i++) {
                    var theWorkOrderOperation = vm.workOrder.WorkOrderOperations[i];
                    var li = document.createElement('li');
                    li.className = vm.workOrder.WorkOrderOperations.length == 1 ? 'list-item single-item' : 'list-item';

                    var label = document.createElement('label');
                    label.className = "list-item-label";
                    var operationName = !isNullOrEmpty(theWorkOrderOperation.Name) ? theWorkOrderOperation.Name : '';
                    li.id = theWorkOrderOperation.Id;
                    label.textContent = theWorkOrderOperation.Sequence + ' ' + operationName;

                    if (theWorkOrderOperation.NId === vm.selectedItem.WorkOrderOperationNId) {
                        label.className = 'list-item-label selected';
                    }

                    li.setAttribute('nid', theWorkOrderOperation.NId);
                    var theStatus = vm.workOrderOperationStatus.filter(function (obj) {
                        return obj.NId === theWorkOrderOperation.Status.StatusNId;
                    });
                    var color = '#50BED7';
                    if (theStatus.length > 0 && theStatus[0].Color !== '') {
                        color = theStatus[0].Color;
                    }

                    // set style attribute is mandatory for ie
                    li.setAttribute('style', 'display: inline-block; background-color: ' + color);
                    $(label).css('color', setTextColor(color));
                    li.onclick = operationClick;
                    li.appendChild(label);
                    ul.appendChild(li);
                }
                $(POINTER_DIV).append(ul);
                // Focus on current operation
                var currentOp = $(".list-item-label.selected");
                if (currentOp !== undefined) {
                    currentOp[0].scrollIntoView({ inline: 'center' });

                }
            }
        }

        function setTextColor(bgColor) {
            // If a leading # is provided, remove it
            if (bgColor.slice(0, 1) === '#') {
                bgColor = bgColor.slice(1);
            }

            // Convert to RGB value
            var r = parseInt(bgColor.substr(0, 2), 16);
            var g = parseInt(bgColor.substr(2, 2), 16);
            var b = parseInt(bgColor.substr(4, 2), 16);

            // Get YIQ ratio
            var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

            // Check contrast
            return (yiq >= 128) ? '#1E1E1E' : 'white';
        }


        function operationClick() {
            var stateParams = {};
            stateParams.app = 'Siemens.Custom.UIContainer';
            stateParams.component = 'siemensCustomUicontainerWorkorderoperationdetails';
            if (!stateParams.componentStateParams) {
                stateParams.componentStateParams = {};
            }
            var WOOId = $(event.target)[0].parentElement.id;
            var WOONId = $(event.target)[0].parentElement.getAttribute('nid');
            stateParams.componentStateParams.WorkOrderOperationId = WOOId;
            stateParams.componentStateParams.WorkOrderOperationNId = WOONId;
            stateParams.componentStateParams.WorkOrderNId = vm.selectedItem.WorkOrderNId;
            stateParams.componentStateParams.Task = vm.selectedItem;

            // Propagate the event
            $rootScope.$emit(operationSelectedEvent, { 'WorkOrderOperationId': WOOId });

            if (vm.onOperationClicked) {
                vm.onOperationClicked();
            }
            sidePanelManager.setTitle('');
            $state.go('home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.visibility-custom-component', stateParams, {});
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

                        if (isNullOrEmpty(vm.workOrder.LotNId)) {
                            vm.workOrder.LotNId = NA;
                        }

                        vm.workOrder.QuantityAndUoM = NA;
                        if (!isNullOrEmpty(vm.workOrder.MaterialNId)) {
                            vm.workOrder.QuantityAndUoM = vm.workOrder.Quantity.QuantityValue + " " + vm.workOrder.Quantity.UoMNId;
                            getMaterialData(vm.workOrder.MaterialNId, vm.workOrder.MaterialRevision);
                        }
                        if (!isNullOrEmpty(vm.workOrder.WorkOrderOperations)) {
                            getWorkOrderOperationStatusDatAndDrawIt();
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

        /*
         * Get the equipment of the Task
         */
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

        function getWorkOrderOperationStatusDatAndDrawIt() {

            var options = {
                'appName': 'Reference',
                'entityName': 'StatusDefinition',
                'options': ''
            };
            backendService.findAll(options).then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.workOrderOperationStatus = data.value;
                    drawOperationDiagram();
                }
                vm.ready = true;
            }, backendService.backendError);
        }

        /*
         * Call by the controller which manages the parent
         */
        function selectedItemChanged(statusChangeData, selectedItem) {
            vm.selectedItem = selectedItem;

            /* refresh if:
             *  .not coming from change status event
             *  .no selected item
             *  .updated task and selected task are the same
             *  .updated task and selected task belong to the same WO
             */
            if (!statusChangeData || !selectedItem || statusChangeData.StatusInfo.EntityId === selectedItem.Id
            || (statusChangeData.TaskContext.WorkOrderNId === selectedItem.WorkOrderNId)) {
                initDataDefaultValue();
                getandSetWorkOrderData();
                getEquipmentData();
            }

            // Managing empty header if no selection
            vm.displayEmptyDetailPlaceholder = !selectedItem;
        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '') {
                return false;
            }
            return true;
        }
    }
})();
