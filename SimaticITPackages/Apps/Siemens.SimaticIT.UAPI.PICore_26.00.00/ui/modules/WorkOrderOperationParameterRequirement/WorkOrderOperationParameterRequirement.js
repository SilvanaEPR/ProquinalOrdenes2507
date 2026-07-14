(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationParameterRequirement')
        .controller('piWorkOrderOperationParameterRequirementController', ['$rootScope', '$scope', 'common.services.modelDriven.runtimeService', 'common.services.modelDriven.contextService', function ($rootScope, $scope, mdService, mdContextSrv) {
            var vm = this;
            activate();
            function activate() {
                var contentName = 'PIWorkOrderOperationParameterRequirement'; //If invalid, then the apis will not be available.
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

            // Bindings with the workorderoperationparamlist directive
            (function WorkOrderOperationParameterRequirement(vm) {
                vm.onWorkOrderOperationParameterRequirementRegisterApi = onWorkOrderOperationParameterRequirementRegisterApi;
                vm.updateWorkOrderOperationParameterRequirement = updateWorkOrderOperationParameterRequirement;
                vm.onWorkOrderSelected = onWorkOrderSelected;

                function onWorkOrderOperationParameterRequirementRegisterApi(api) {
                    vm._workOrderOperationParameterRequirementRegisterApi = api;
                    api.hideTitle();
                    if (vm.selectedMaster) {
                        api.setWorkOrderOperationId(vm.selectedMaster.Id);
                    } else {
                        api.setWorkOrderOperationId('00000000-0000-0000-0000-000000000000');
                    }
                }

                function updateWorkOrderOperationParameterRequirement() {
                    if (vm._workOrderOperationParameterRequirementRegisterApi) {
                        vm._workOrderOperationParameterRequirementRegisterApi.hideTitle();
                        if (vm.selectedMaster) {
                            vm._workOrderOperationParameterRequirementRegisterApi.setWorkOrderOperationId(vm.selectedMaster.Id);
                        } else {
                            vm._workOrderOperationParameterRequirementRegisterApi.setWorkOrderOperationId('00000000-0000-0000-0000-000000000000');
                        }
                    }
                }

                function onWorkOrderSelected(woId) {
                    if (vm._workOrderOperationParameterRequirementRegisterApi) {
                        vm._workOrderOperationParameterRequirementRegisterApi.setWorkOrderOperationId(woId);
                    }
                }

            })(vm);


            function subscribeToModelDrivenRuntime(contentName) {
                //gets the model-driven runtime apis to interact with the context and data.
                mdService.initCustomContent(contentName).then(function (apiList) {
                }, function (error) {
                    //An error message will be passed in case of invalid custom contents.
                });
            }

            // event triggered when a node is selected in material contribution
            var workOrderOperationParameterRequirementSelectedListener = $rootScope.$on('workorderoperationparamlist.setWorkOrderOperationId', function (event, params) {
                vm.onWorkOrderSelected(params.woId);
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
                vm.updateWorkOrderOperationParameterRequirement();
            }

            //destroy the event listener
            $scope.$on('$destroy', function () {
                mduiContextRefreshedListener();
                workOrderOperationParameterRequirementSelectedListener();
            });
        }
        ]);
})();

