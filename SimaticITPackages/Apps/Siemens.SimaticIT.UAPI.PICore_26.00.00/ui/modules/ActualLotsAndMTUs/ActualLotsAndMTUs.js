(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.ActualLotsAndMTUs')
        .controller('piActualLotsAndMTUsController', ['$rootScope', '$scope', 'common.services.modelDriven.runtimeService', 'common.services.modelDriven.contextService', function ($rootScope, $scope, mdService, mdContextSrv) {
            var vm = this;
            var mdSvcApis = {};
            activate();
            function activate() {
                var contentName = 'PIActualLotsAndMTUs'; //If invalid, then the apis will not be available.
                subscribeToModelDrivenRuntime(contentName);
                vm.selectionChanged = selectionChanged;
                loadInitialData();
            }

            function loadInitialData() {
                var ctx = mdContextSrv.getContextInfo().contents;
                if (ctx && ctx['Master'] && ctx['Master'].selectedItem) {
                    vm.selectedMaster = ctx['Master'].selectedItem;
                }
            }

            // Bindings with the ActualLotsAndMTUs directive
            (function ActualLotsAndMTUs(vm) {
                vm.onActualLotsAndMTUsRegisterApi = onActualLotsAndMTUsRegisterApi;
                vm.UpdateActualLotsAndMTUs = UpdateActualLotsAndMTUs;
                vm.onWorkOrderOperationMaterialRequirementSelected = onWorkOrderOperationMaterialRequirementSelected;

                function onActualLotsAndMTUsRegisterApi(api) {
                    vm._ActualLotsAndMTUsRegisterApi = api;
                    api.hideTitle();
                    api.hidePG();
                    if (vm.selectedMaster) {
                        api.setWorkOrderOperationMaterialRequirementId(vm.selectedMaster.Id);
                    } else {
                        api.setWorkOrderOperationMaterialRequirementId('00000000-0000-0000-0000-000000000000');
                    }
                }

                function UpdateActualLotsAndMTUs() {
                    if (vm._ActualLotsAndMTUsRegisterApi) {
                        vm._ActualLotsAndMTUsRegisterApi.hideTitle();
                        vm._ActualLotsAndMTUsRegisterApi.hidePG();
                        if (vm.selectedMaster) {
                            vm._ActualLotsAndMTUsRegisterApi.setWorkOrderOperationMaterialRequirementId(vm.selectedMaster.Id);
                        } else {
                            vm._ActualLotsAndMTUsRegisterApi.setWorkOrderOperationMaterialRequirementId('00000000-0000-0000-0000-000000000000');
                        }
                    }
                }

                function onWorkOrderOperationMaterialRequirementSelected(woId) {
                    if (vm._ActualLotsAndMTUsRegisterApi) {
                        vm._ActualLotsAndMTUsRegisterApi.setWorkOrderOperationMaterialRequirementId(woId);
                    }
                }
            })(vm);


            function subscribeToModelDrivenRuntime(contentName) {
                //gets the model-driven runtime apis to interact with the context and data.
                mdService.initCustomContent(contentName).then(function (apiList) {
                    mdSvcApis = apiList; //gets the api list
                }, function (error) {
                    //An error message will be passed in case of invalid custom contents.
                });
            }

            // event triggered when a node is selected in material contribution
            var ActualLotsAndMTUsListener = $rootScope.$on('ActualLotsAndMTUs.setWorkOrderOperationMaterialRequirementId', function (event, params) {
                vm.onWorkOrderOperationMaterialRequirementSelected(params.Id);
            });

            //an event triggered once the model-driven context changes
            var mduiContextRefreshedListener = $rootScope.$on('mdui-context-refreshed', function (event, params) {
                var eventType = params.event;

                //event triggered on a master selection
                if (eventType === 'onMasterSelection') {
                    vm.selectedMaster = params.data;
                    vm.selectionChanged();
                }

                //event triggered on a master unselection
                if (eventType === 'onMasterUnselection') {
                    vm.selectedMaster = null;
                    vm.selectionChanged();
                    return;
                }
            });

            function selectionChanged() {
                vm.UpdateActualLotsAndMTUs();
            }

            //destroy the event listener
            $scope.$on('destroy', function () {
                mduiContextRefreshedListener();
                ActualLotsAndMTUsListener();
            });
        }
        ]);
})();

