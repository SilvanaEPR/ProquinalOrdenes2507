(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.RequiredLotsAndMTUs')
        .controller('piRequiredLotsAndMTUsController', ['$rootScope', '$scope', 'common.services.modelDriven.runtimeService', 'common.services.modelDriven.contextService', function ($rootScope, $scope, mdService, mdContextSrv) {
            var vm = this;
            var mdSvcApis = {};
            activate();
            function activate() {
                var contentName = 'PIRequiredLotsAndMTUs'; //If invalid, then the apis will not be available.
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

            // Bindings with the RequiredLotsAndMTUs directive
            (function RequiredMATMaterialDetails(vm) {
                vm.onRequiredMATMaterialDetailsRegisterApi = onRequiredMATMaterialDetailsRegisterApi;
                vm.UpdateRequiredMATMaterialDetails = UpdateRequiredMATMaterialDetails;
                vm.onWorkOrderOperationMaterialRequirementSelected = onWorkOrderOperationMaterialRequirementSelected;

                function onRequiredMATMaterialDetailsRegisterApi(api) {
                    vm._requiredMATMaterialDetailsRegisterApi = api;
                    api.hideTitle();
                    api.hidePG();
                    if (vm.selectedMaster) {
                        api.setWorkOrderOperationMaterialRequirementId(vm.selectedMaster.Id);
                    } else {
                        api.setWorkOrderOperationMaterialRequirementId('00000000-0000-0000-0000-000000000000');
                    }
                }

                function UpdateRequiredMATMaterialDetails() {
                    if (vm._requiredMATMaterialDetailsRegisterApi) {
                        vm._requiredMATMaterialDetailsRegisterApi.hideTitle();
                        vm._requiredMATMaterialDetailsRegisterApi.hidePG();
                        if (vm.selectedMaster) {
                            vm._requiredMATMaterialDetailsRegisterApi.setWorkOrderOperationMaterialRequirementId(vm.selectedMaster.Id);
                        } else {
                            vm._requiredMATMaterialDetailsRegisterApi.setWorkOrderOperationMaterialRequirementId('00000000-0000-0000-0000-000000000000');
                        }
                    }
                }

                function onWorkOrderOperationMaterialRequirementSelected(woId) {
                    if (vm._requiredMATMaterialDetailsRegisterApi) {
                        vm._requiredMATMaterialDetailsRegisterApi.setWorkOrderOperationMaterialRequirementId(woId);
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
            var requiredMATMaterialDetailsListener = $rootScope.$on('requiredmatmaterialdetails.setWorkOrderOperationMaterialRequirementId', function (event, params) {
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
                vm.UpdateRequiredMATMaterialDetails();
            }

            //destroy the event listener
            $scope.$on('destroy', function () {
                mduiContextRefreshedListener();
                requiredMATMaterialDetailsListener();
            });
        }
        ]);
})();

