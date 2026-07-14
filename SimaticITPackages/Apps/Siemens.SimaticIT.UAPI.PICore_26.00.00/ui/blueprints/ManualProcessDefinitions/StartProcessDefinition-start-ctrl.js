(function () {
    'use strict';

    function StartProcessDefinitionAreaController($translate, $state, common, $stateParams, modelDrivenService, ProcessDefinitionService, $timeout) {

        var sidePanelManager;
        var parentParameters = {};
        //var manualProcessDefinitionListDefer = $q.defer();

        var self = this;
        self.onCustomActionComplete = null;
        activate();

        function activate() {
            const initCustomActionCallbackFunction = modelDrivenService.initCustomAction(); //gets the callback function
            self.onCustomActionComplete = initCustomActionCallbackFunction && initCustomActionCallbackFunction.onExit ? initCustomActionCallbackFunction.onExit : null;
            init();
            // Show
            sidePanelManager.open({ mode: 'e', size: 'wide' });
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;

            (function processDefinitionPanel(vm) {
                vm.onStartPDResgisterApi = onStartPDResgisterApi;
                vm.startProcessDefinitionApi = startProcessDefinitionApi;

                function onStartPDResgisterApi(api) {
                    vm._StartPDApi = api;
                }

                function startProcessDefinitionApi() {

                    if (vm._StartPDApi) {
                        vm._StartPDApi.startProcessDefinitionApi();
                    }
                }
            })(self);

            self.onStartPDResgisterApi();
            storeParentParameters();
            initSidePanel();
            $timeout(function () {
                loadManualProcessDefinitions();
            }, 300);
        }

        // Store the stateParams that MAY come from a parent page
        function storeParentParameters() {
            if ($stateParams.WorkOrderNId == null && mdContextSrv.MDState.previousData && mdContextSrv.MDState.previousData.WorkOrder && mdContextSrv.MDState.previousData.WorkOrder.NId) {
                $stateParams.WorkOrderNId = mdContextSrv.MDState.previousData.WorkOrder.NId;
            }
            parentParameters.WorkOrderNId = uriDecode($stateParams.WorkOrderNId);
            parentParameters.WorkOrderOperationNId = uriDecode($stateParams.WorkOrderOperationNId);
            parentParameters.EquipmentNId = uriDecode($stateParams.EquipmentNId);
        }

        function loadManualProcessDefinitions (){
            console.log("loading manual process definitions");
            ProcessDefinitionService.getManualProcessDefinitions(parentParameters).then(function (data) {
                if ((data) && (data.succeeded)) {
                    var processDefinitionList = [];
                    for (var record in data.value) {
                        var singleObj = {
                            Id: data.value[record].Id,
                            Name: data.value[record].Name,
                            Revision: data.value[record].Revision,
                            Description: data.value[record].Description,
                            NId: data.value[record].NId,
                            WorkOrderOperationNId: data.value[record].WorkOrderOperationNId,
                            NameAndRevision: data.value[record].NId + " " + data.value[record].Revision
                        };

                        processDefinitionList.push(singleObj);
                    }
                    self._StartPDApi.setManualProcessDefinitionCatalog(processDefinitionList);
                }
            });
        }
        // Decode correctly the uri
        function uriDecode(str) {
            if (!isNullOrEmpty(str)) { return decodeURIComponent(str.replace(/\+/g, ' ')); } else { return str; }
        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '') { return false; }
            return true;
        }

        function initSidePanel() {
            var cancel = {
                label: $translate.instant('picore.buttonsAndTooltips.close'),
                onClick: closeSidePanel,
                enabled: true,
                visible: true
            };
            var apply = {
                label: $translate.instant('picore.buttonsAndTooltips.start'),
                onClick: applySelection,
                enabled: true,
                visible: true
            };
            self.sidePanelConfig = {
                actionButtons: [
                    apply,
                    cancel
                ],
                closeButton: {
                    showClose: true,
                    onClick: closeSidePanel
                }
            };
        }

        function callStartWorkProcess(selectedProcessDefinition) {

            var selectedTile = {
                processDefinitionNId: selectedProcessDefinition[0].NId,
                processDefinitionRevision: selectedProcessDefinition[0].Revision,
                workOrderOperationNId: selectedProcessDefinition[0].WorkOrderOperationNId
            };

            ProcessDefinitionService.StartNewWorkProcess(selectedTile,parentParameters).then(function (result) {
                if (result.data.Succeeded == true) {
                    if (typeof self.onCustomActionComplete === 'function') {
                        //self.onCustomActionComplete(result.data.Id); // callback function received from model-driven runtime to be called on action complete
                        //callback function called in this format in order to refresh and select both master and detail content on action complete

                        var refreshContentsId = { 'WorkProcesses': result.data.WorkProcessId, "Master": $stateParams.WorkOrderId };
                        self.onCustomActionComplete(refreshContentsId);
                    }
                }
            });
        }

        function applySelection() {
            var selectedPD = self._StartPDApi.getSelectedProcessDefinition();
            if (selectedPD.length > 0) {
                callStartWorkProcess(selectedPD);
                //$state.go('^');
            }
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
        }
    }

    angular.
        module('Siemens.SimaticIT.UAPI.PICore').
        controller('PICore_StartProcessDefinitionAreaController', StartProcessDefinitionAreaController).
        config([
            '$stateProvider',
            function ($stateProvider) {

                const rootstate = 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration_WorkOrderMasterDetail.StartWorkProcess2';
                const folder = 'Siemens.SimaticIT.UAPI.PICore/blueprints/ManualProcessDefinitions';

                const item = {
                    name: rootstate + '.start',
                    url: '/start',
                    views: {
                        'property-area-container@': {
                            templateUrl: folder + '/StartProcessDefinition-start.html',
                            controller: 'PICore_StartProcessDefinitionAreaController',
                            controllerAs: 'vm'
                        }
                    }
                };

                $stateProvider.state(item);
            }]);

    StartProcessDefinitionAreaController.$inject = ['$translate', '$state', 'common.base', '$stateParams', 'common.services.modelDriven.runtimeService', 'uapi_processDefinitionService','$timeout'];
}());
