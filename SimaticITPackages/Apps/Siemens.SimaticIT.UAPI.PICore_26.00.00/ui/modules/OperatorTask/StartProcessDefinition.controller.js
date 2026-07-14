/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .controller('piStartProcessDefinitionAreaController', piStartProcessDefinitionAreaController);

    piStartProcessDefinitionAreaController.$inject = ['$translate', '$state', 'common.base', '$stateParams', 'uapi_processDefinitionService', 'uapi-productionContextService','$timeout'];

    function piStartProcessDefinitionAreaController($translate, $state, common, $stateParams, ProcessDefinitionService, productionContextService, $timeout) {

        var sidePanelManager;
        var parentParameters = {};
        //var manualProcessDefinitionListDefer = $q.defer();

        var self = this;
        var notificationTileService;
        var backendService = common.services.runtime.backendService;

        activate();

        function activate() {
            init();
            // Show
            sidePanelManager.open({ mode: 'e', size: 'wide' });
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            notificationTileService = common.widgets.notificationTile.service;

            (function processDefinitionPanel(self) {
                self.onStartPDResgisterApi = onStartPDResgisterApi;
                self.startProcessDefinitionApi = startProcessDefinitionApi;

                function onStartPDResgisterApi(api) {
                    self._StartPDApi = api;
                }

                function startProcessDefinitionApi() {
                    console.log("###################  startProcessDefinitionApi");

                    if (self._StartPDApi) {
                        self._StartPDApi.startProcessDefinitionApi();
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
            var productionParameters = productionContextService.getProductionParameters();
            parentParameters.WorkOrderNId = '';
            if ((productionParameters.prodContextField) && (productionParameters.prodContextField.WorkOrderNId)) {
                parentParameters.WorkOrderNId = uriDecode(productionParameters.prodContextField.WorkOrderNId);
            }
            if (productionParameters.WorkOrderNId) {
                parentParameters.WorkOrderNId = uriDecode(productionParameters.WorkOrderNId);
            }
            parentParameters.WorkOrderOperationNId = uriDecode(productionParameters.WorkOrderOperationNId);
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

        function callStartWorkProcess(selectedProcessDefinition) {

            var selectedTile = {
                processDefinitionNId: selectedProcessDefinition[0].NId,
                processDefinitionRevision: selectedProcessDefinition[0].Revision,
                workOrderOperationNId: selectedProcessDefinition[0].WorkOrderOperationNId
            };

            ProcessDefinitionService.StartNewWorkProcess(selectedTile,parentParameters).then(function (result) {
                //should create notification toast
                if (result.data.Succeeded == true) {
                    notificationTileService.info($translate.instant('picore.notifications.info.WorkProcessStartedCorrectly', { WorkProcessNId: result.data.WorkProcessNId }));
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

        function applySelection() {
            var selectedPD = self._StartPDApi.getSelectedProcessDefinition();
            if (selectedPD.length > 0) {
                callStartWorkProcess(selectedPD);
                $state.go('^');
            }
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
        }
    }
})();
