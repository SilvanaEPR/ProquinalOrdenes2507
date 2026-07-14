(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('siemensSimaticitUapiPicoreWorkordermaterialdetails', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                onRegisterApi: '&',
                isorder: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderMaterialDetails/WorkOrderMaterialDetails.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    ComponentController.$inject = ['common.base', '$state', '$stateParams', '$translate', '$rootScope', '$scope', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderService', 'common.services.modelDriven.contextService'];
    function ComponentController(base, $state, $stateParams, $translate, $rootScope, $scope, workOrderService, mdContextSrv) {
        var vm = this;
        var logger;

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
                },
                WorkOrderOpertion: {
                    sorting: true,
                    filtering: {
                        type: 'string'
                    },
                    displayName: $translate.instant('picore.headers.tables.woop')
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
            logger = base.services.logger.service.getModuleLogger('siemensSimaticitUapiPicoreWorkordermaterialdetails');

            init();
            exposeApi();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);

            initializetOperationNId();
            updateMaterialDetailsData();
        }

        function updateMaterialDetailsData() {
            var cmdParams;
            if (vm.WorkOrderNId) {
                cmdParams = {
                    WorkOrderNId: vm.WorkOrderNId,
                    TagSeparator: $state.params.componentStateParams && $state.params.componentStateParams.TagSeparator,
                    RequirementTagList: $state.params.componentStateParams && $state.params.componentStateParams.RequirementTagList
                };

                workOrderService.getWorkOrderMaterialDetails(cmdParams).then(onGetWOMaterialDetails);
            }
            else if (vm.OrderNId && vm.isorder == "true") {
                cmdParams = {
                    OrderNId: vm.OrderNId
                };

                workOrderService.getOrderMaterialDetails(cmdParams).then(onGetWOMaterialDetails);
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
                if (prm.componentStateParams && prm.componentStateParams.WorkOrderNId) {
                    //started from the OTL
                    vm.WorkOrderNId = prm.componentStateParams.WorkOrderNId;
                } else {
                    //started from MDUI, and selection is already made
                    var ctx = mdContextSrv.getContextInfo().contents;
                    if (ctx && ctx['Master'] && ctx['Master'].selectedItem) {
                        vm.WorkOrderNId = ctx['Master'].selectedItem.NId;
                    }
                }
                vm.isHideColumns = true;
            }
        }

        function onGetWOMaterialDetails(data) {
            vm.config.data = vm.isorder == "true" ? data.value : data.value[0].WorkOrderMatReqs;
        }

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm._onComponentDestroy = onComponentDestroy;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
        }

        function onComponentReady(compInstance) {
            activate();
            //initGrid();
        }

        function onComponentDestroy() {
            logger = null;
            vm.selectedItem = null;
            vm.viewerData = null;
            vm.viewerOptions = null;
            //In the last, make the vm to null
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


        //function initGrid() {
        //    vm.viewerOptions = {
        //        containerID: 'div_' + vm.name,
        //        userPrefId: vm.id,
        //        selectionMode: 'single',
        //        viewOptions: 'gml',
        //        quickSearchOptions: { enabled: true, field: 'Id' },
        //        sortInfo: {
        //            field: 'Id',
        //            direction: 'asc'
        //        },
        //        gridConfig: {
        //            columnDefs: [
        //                { field: 'Id' }
        //            ]
        //        },
        //        propertyFields: [
        //            { field: 'Id', displayName: 'Id' }
        //        ],
        //        image: 'fa-puzzle-piece',
        //        tileConfig: {
        //            titleField: 'Id'
        //        },
        //        onSelectionChangeCallback: onItemSelection
        //    };
        //}

        //an event triggered once the model-driven context changes
        var mduiContextRefreshedListener = $rootScope.$on('mdui-context-refreshed', function (event, params) {
            var eventType = params.event;

            //event triggered on a master selection
            if (eventType === 'onMasterSelection') {
                if (vm.selectedMaster !== params.data) {
                    if (params.data.EntityType === "Siemens.SimaticIT.OperationalData.UDM_OP.OPModel.DataModel.WorkOrder") {
                        if (vm.WorkOrderNId !== params.data.NId) {
                            vm.WorkOrderNId = params.data.NId;
                            vm.WorkOrderOperationNId = null;
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
                if (vm.WorkOrderNId) {
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
    }
})();