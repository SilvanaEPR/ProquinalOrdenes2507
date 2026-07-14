/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('workorderoperationmaterialdetails', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                onRegisterApi: '&',
                isorder: '@',
                taskType: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderOperationMaterialDetails/WorkOrderOperationMaterialDetails.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    ComponentController.$inject = ['common.base', '$state', '$stateParams', '$translate', '$rootScope', '$scope', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderService', 'common.services.modelDriven.contextService'];
    function ComponentController(base, $state, $stateParams,  $translate, $rootScope, $scope, workOrderOperationService, workOrderService, mdContextSrv) {
        var vm = this;
        var logger, instance;
        const PRODUCTION_TAG = "ProductionTag";

        vm.config = {
            selectionMode: 'none',
            enableColumnResizing: true,
            enablePaging: false,
            data: [],
            fields: {
                MaterialNId: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.materialNId')
                },
                MaterialName: {
                    sorting: true,
                    displayName: $translate.instant('picore.headers.tables.materialName')
                },
                MaterialRevision: {
                    sorting: true,
                    displayName: $translate.instant('picore.headers.tables.materialRev')
                },
                Sequence: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.sequence')
                },
                QuantityRequired: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.requiredQty')
                },
                QuantityActual: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.actualQty')
                },
                UoM: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.uoM')
                },
                RequirementTag: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.requirementTag')
                },
                ActualTag: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.actualTag')
                },
                Direction: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.direction')
                },
                Usage: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.usage')
                }
            },
            //check this
            onInitCallback: function (config) {
                var settings = config.getSettings('sitOperationDetails');
                settings.sort = {
                    predicate: 'Sequence',
                    reverse: false
                };
                config.applySettings(settings);
            }
        };

        activate();

        function activate() {

            init();
            exposeApi();
        }

        function init() {
            logger = base.services.logger.service.getModuleLogger('WorkOrderOperationMaterialDetails');

            initializetOperationNId();
            updateMaterialDetailsData();
        }

        function updateMaterialDetailsData() {
            var cmdParams;
            if (vm.WorkOrderNId && vm.WorkOrderOperationNId) {
                cmdParams = {
                    WorkOrderNId: vm.WorkOrderNId,
                    WorkOrderOperationNId: vm.WorkOrderOperationNId,
                    TagSeparator: $state.params.componentStateParams && $state.params.componentStateParams.TagSeparator,
                    RequirementTagList: $state.params.componentStateParams && $state.params.componentStateParams.RequirementTagList
                };

                workOrderOperationService.getWorkOrderOperationMaterialDetails(cmdParams).then(onGetWOOperationMaterialDetails);
            }
            else if (vm.WorkOrderNId) {
                cmdParams = {
                    WorkOrderNId: vm.WorkOrderNId,
                    TagSeparator: $state.params.componentStateParams && $state.params.componentStateParams.TagSeparator,
                    RequirementTagList: $state.params.componentStateParams && $state.params.componentStateParams.RequirementTagList
                };

                workOrderService.getWorkOrderMaterialDetails(cmdParams).then(onGetWOOperationMaterialDetails);
            }
            else if (vm.OrderNId && vm.isorder == "true") {
                cmdParams = {
                    OrderNId: vm.OrderNId
                };

                workOrderService.getOrderMaterialDetails(cmdParams).then(onGetWOOperationMaterialDetails);
            }
            else {
                vm.config.data = null;
            }
        }

        function initializetOperationNId() {
            var prm = $stateParams;
            if (vm.isorder == "true") {
                //started from MDUI, and selection is already made
                let ctxOrder = mdContextSrv.getContextInfo().contents;
                if (ctxOrder && ctxOrder['Orders'] && ctxOrder['Orders'].selectedItem) {
                    vm.OrderNId = ctxOrder['Orders'].selectedItem.NId;
                }
                vm.isHideColumns = true;
            }
            else {
                if (prm.componentStateParams && prm.componentStateParams.WorkOrderNId && prm.componentStateParams.WorkOrderOperationNId) {
                    //started from the OTL
                    vm.WorkOrderNId = prm.componentStateParams.WorkOrderNId;
                    vm.WorkOrderOperationNId = prm.componentStateParams.WorkOrderOperationNId;
                } else {
                    //started from MDUI, and selection is already made
                    var ctx = mdContextSrv.getContextInfo().contents;
                    if (ctx && ctx['Master'] && ctx['Master'].selectedItem) {
                        vm.WorkOrderNId = ctx['Master'].selectedItem.WorkOrder.NId;
                        vm.WorkOrderOperationNId = ctx['Master'].selectedItem.NId;
                    }
                }
            }
        }

        function onGetWOOperationMaterialDetails(data) {
            vm.config.data = vm.isorder == "true" ? data.value : data.value[0].WOMatReqMTU;

            if (vm.taskType === 'Production Task') {
                workOrderOperationService.getTaskParameterByTaskId($rootScope.$stateParams.componentStateParams.taskId).then(function (taskParamData) {
                    //save ProductionTag param
                    vm.productionTag = taskParamData.value.find(function (x) { return x.NId === PRODUCTION_TAG; });
                    if (vm.productionTag !== null && vm.productionTag !== undefined) {
                        //filter data
                        vm.config.data = vm.config.data.filter(isMatchingProductionTag);
                    }
                });
            }
        }

        function isMatchingProductionTag(row) {
            var actualTags = row.ActualTag.includes(",") ? row.ActualTag.split(',') : [row.ActualTag];
            var productionTags = vm.productionTag.ParameterValue.includes(",") ? vm.productionTag.ParameterValue.split(',') : [vm.productionTag.ParameterValue];

            var isActualMatching = actualTags.some(actualTag => { return productionTags.some(productionTag => { return productionTag == actualTag; }); });

            var isRequirementMatching = false;
            if (row.ActualTag === "" && row.Direction === "OUTPUT") {
                var requirementTags = row.RequirementTag.includes(",") ? row.RequirementTag.split(',') : [row.RequirementTag];
                isRequirementMatching = requirementTags.some(requirementTag => { return productionTags.some(productionTag => { return productionTag == requirementTag; }); });
            }
            return isActualMatching || isRequirementMatching;
        }

        //an event triggered once the model-driven context changes
        var mduiContextRefreshedListener = $rootScope.$on('mdui-context-refreshed', function (event, params) {
            var eventType = params.event;

            //event triggered on a master selection
            if (eventType === 'onMasterSelection') {
                if (vm.selectedMaster !== params.data) {
                    if (params.data.EntityType === "Siemens.SimaticIT.OperationalData.UDM_OP.OPModel.DataModel.WorkOrderOperation") {
                        if (vm.WorkOrderOperationNId !== params.data.NId) {
                            vm.WorkOrderNId = params.data.WorkOrder.NId;
                            vm.WorkOrderOperationNId = params.data.NId;
                            updateMaterialDetailsData();
                        }
                    } else if (vm.isorder == "true" && params.data.EntityType === "Siemens.SimaticIT.UAPI.OperationalData.PIOrder_OP.OPModel.DataModel.Order") {
                        if (vm.OrderNId !== params.data.NId) {
                            vm.OrderNId = params.data.NId;
                            updateMaterialDetailsData();
                        }
                    }
                    else {
                        // unbind the listener
                        mduiContextRefreshedListener();
                    }
                }
            } else if (eventType === 'onActionCompletion') {
                if (vm.WorkOrderNId || vm.WorkOrderOperationNId) {
                    updateMaterialDetailsData();
                }
            }

            //event triggered on a master unselection
            if (eventType === 'onMasterUnselection') {
                vm.WorkOrderNId = null;
                vm.WorkOrderOperationNId = null;
                vm.OrderNId = null;
                updateMaterialDetailsData();
            }
        });

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm._onComponentDestroy = onComponentDestroy;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
        }

        function onComponentReady(compInstance) {
            instance = compInstance;
            activate();
        }

        function onComponentDestroy() {
            //instance = logger = backendService = null;
            instance = logger = null;
            vm = null;
        }

        //destroy the event listener
        $scope.$on('destroy', function () {
            mduiContextRefreshedListener();
        });

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }
    }
})();
