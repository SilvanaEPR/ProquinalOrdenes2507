(function () {
    'use strict';
    // state configuration initiliazation
    angular.module('Siemens.SimaticIT.UAPI.PICore').config(StateConfig);
    StateConfig.$inject = ['$stateProvider'];
    function StateConfig($stateProvider) {
        var moduleStateNameList = ['home.Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration_WorkOrderMasterDetail'
                                 , 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration_WorkOrderOperationContent'];

        for (var i = 0; i < moduleStateNameList.length; i++) {
            var state = {
                name: moduleStateNameList[i] + '.context',
                url: '/context',
                views: {
                    'property-area-container@': {
                        templateUrl: 'Siemens.OpcenterEX.FN.ProductionHistory/widgets/contextDetails/contextDetails.html',
                        controller: 'contextDetailsController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    title: 'Siemens.OpcenterEX.FN.ProductionHistory.ViewContextDetails'
                },
                params: {
                    selectedItem: null
                }
            };
            $stateProvider.state(state);
        }
    }

    // controller initiliazation
    angular.module('Siemens.SimaticIT.UAPI.PICore').controller('PICore_ProductionHistoryRecordsController', ListScreenController);

    ListScreenController.$inject = ['$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.modelDriven.contextService'];
    function ListScreenController($state, $stateParams, $rootScope, $scope, base, mdContextSrv) {
        var vm = this;
        vm.isPHRAppInstalled = false;
        activate();

        function activate() {
            var UIDependencies = base.services.runtime.dataService.common.CONFIG.dependencies;
            for (var i = 0; i < UIDependencies.length; i++) {
                var value = UIDependencies[i];
                if (value == 'Siemens.OpcenterEX.FN.ProductionHistory') {
                    vm.isPHRAppInstalled = true;
                }
            }

        }

        // Bindings with the ProductionHistoryComponent directive
        (function ProductionHistoryComponent(vmc) {
            vmc.onProductionHistoryRegisterApi = onProductionHistoryRegisterApi;
            vmc.updateProductionHistory = updateProductionHistory;
            vmc.phrComponentActivate = phrComponentActivate;

            function onProductionHistoryRegisterApi(api) {
                vmc._productionHistoryComponentApi = api;
            }

            function updateProductionHistory() {
                if (vmc._productionHistoryComponentApi) {
                    if (vmc.selectedMaster) {
                        vmc._productionHistoryComponentApi.showProductionHistoryRecords(vmc.selectedMaster, false);
                    } else {
                        vmc._productionHistoryComponentApi.showProductionHistoryRecords({}, false);
                    }
                }
            }

            // Initialization function
            function phrComponentActivate() {
                vmc.selectionChanged = selectionChanged;
                vmc.clearAll = clearAll;
                if (mdContextSrv.getContextInfo()) {
                    var ctx = mdContextSrv.getContextInfo().contents;
                    if (ctx && ctx['Master'] && ctx['Master'].selectedItem) {
                        vmc.selectedMaster = ctx['Master'].selectedItem;
                    }
                }
                updateProductionHistory();
            }
        })(vm);

        var mduiContextRefreshedListener = $rootScope.$on('mdui-context-refreshed', function (event, params) {
            var eventType = params.event;
            //event triggered on a master selection
            if (eventType === 'onMasterSelection') {
                if (vm.selectedMaster !== params.data) {
                    vm.selectedMaster = params.data;
                    vm.selectionChanged();
                }
            }

            //event triggered on a master unselection
            if (eventType === 'onMasterUnselection') {
                vm.selectedMaster = null;
                vm.clearAll();
                return;
            }
        });

        function clearAll() {
            vm.updateProductionHistory();
        }

        function selectionChanged() {
            if (vm.selectedMaster) {
                vm.updateProductionHistory();
            }
        }

        $scope.$on('$destroy', function () {
            mduiContextRefreshedListener();
        });
    }
}());



