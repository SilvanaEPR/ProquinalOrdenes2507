(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.WorkOrderHeaderParameters')
        .controller('piWorkOrderHeaderParametersController', ['$rootScope', '$scope', 'common.services.modelDriven.runtimeService', 'common.services.modelDriven.contextService', function ($rootScope, $scope, mdService, mdContextSrv) {
            var vm = this;
            var mdSvcApis = {};
            activate();
            function activate() {
                var contentName = 'PIWorkOrderHeaderParameters'; //If invalid, then the apis will not be available.
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

            // Bindings with the workorderheaderparamlist directive
            (function WorkOrderHeaderParameters(vm) {
                vm.onWorkOrderHeaderParameterRegisterApi = onWorkOrderHeaderParameterRegisterApi;
                vm.updateWorkOrderHeaderParameter = updateWorkOrderHeaderParameter;
                vm.onWorkOrderSelected = onWorkOrderSelected;

                function onWorkOrderHeaderParameterRegisterApi(api) {
                    vm._workOrderHeaderParameterRegisterApi = api;
                    api.hideTitle();
                    if (vm.selectedMaster) {
                        api.setWorkOrderId(vm.selectedMaster.Id);
                    } else {
                        api.setWorkOrderId('00000000-0000-0000-0000-000000000000');
                    }
                }

                function updateWorkOrderHeaderParameter() {
                    if (vm._workOrderHeaderParameterRegisterApi) {
                        vm._workOrderHeaderParameterRegisterApi.hideTitle();
                        if (vm.selectedMaster) {
                            vm._workOrderHeaderParameterRegisterApi.setWorkOrderId(vm.selectedMaster.Id);
                        } else {
                            vm._workOrderHeaderParameterRegisterApi.setWorkOrderId('00000000-0000-0000-0000-000000000000');
                        }
                    }
                }

                function onWorkOrderSelected(woId) {
                    if (vm._workorderHeaderParameterRegisterApi) {
                        vm._workorderHeaderParameterRegisterApi.setWorkOrderId(woId);
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
            var workOrderHeaderParameterSelectedListener = $rootScope.$on('workorderheaderparameterlist.setWorkOrderId', function (event, params) {
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
                vm.updateWorkOrderHeaderParameter();
            }

            //destroy the event listener
            $scope.$on('$destroy', function () {
                mduiContextRefreshedListener();
                workOrderHeaderParameterSelectedListener();
            });
        }
        ]);
})();

