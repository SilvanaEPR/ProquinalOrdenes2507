/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    function ComponentViewerController($timeout, $window, $rootScope, $state, $stateParams, $scope, $compile, $translate, taskService, common, componentManifest, eventDispatcherService, taskContextComponent) {
        var vm = this;
        var sidePanelManager = common.services.sidePanel.service;
        var view = $state.$current.views['property-area-container@'];
        vm.workOrder = '';
        vm.workOrderOperation = '';
        vm.displayCustomView = false;
        vm.children = [];
        vm.selectedTabIndex = 0;
        activate();

        function openSidePanel() {
            if (view.templateUrl !== undefined && view.templateUrl !== '') {
                sidePanelManager.setTitle('');
                sidePanelManager.open({ mode: 'e', size: 'wide' });
            }

            var propertyAreaElement = $('div[data-internal-type="property-area-container-modal"]').parent();
            if (propertyAreaElement && propertyAreaElement.length) {
                propertyAreaElement.attr('data-task-side-panel', true);
            }
        }

        // Bindings with the taskcontext directive
        (function taskContext(vmc) {
            vmc.onTaskContextRegisterApi = onTaskContextRegisterApi;
            vmc.updateTaskContextInfo = updateTaskContextInfo;

            function onTaskContextRegisterApi(api) {
                vmc._taskContextApi = api;
                vmc._taskContextApi.contextInfoInitialized($stateParams.componentStateParams.Task);
            }

            function updateTaskContextInfo() {
                if (taskContextComponent === null) {
                    vmc._taskContextApi.contextInfoInitialized($stateParams.componentStateParams.Task);
                }
                var eventName = 'taskdetails.contextInfoInitialized';
                $rootScope.$emit(eventName, $stateParams.componentStateParams.Task);
            }
        })(vm);

        $scope.$on('$destroy', function () {
            eventDispatcherService.removeEventListener('PropertyArea.closeFullScreenSidePanel', closeSidePanel);
            var propertyAreaElement = $('div[data-internal-type="property-area-container-modal"]').parent();
            if (propertyAreaElement && propertyAreaElement.length) {
                propertyAreaElement.removeAttr('data-task-side-panel');
            }
        });

        function isTabActive(index) {
            if (vm.selectedTabIndex !== index) {
                return true;
            }
            return false;
        }

        function onTabSelected(index) {
            vm.selectedTabIndex = index;

            if (index == 5) {

                if (!vm.compName) {
                    vm.compName = getComponentName(vm.name);
                }
                $timeout(function () {
                    $(window).trigger('resize');
                });
            }
        }

        function getComponentName(name) {
            var container = document.querySelector('sit-component[sit-name=\'' + name + '\']');

            if (container) {
                return container.compName;
            }

            return undefined;
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
            eventDispatcherService.dispatchEvent('PropertyArea.onSidepanelClosed');
        }

        function initHeaderData() {
            vm.taskId = $stateParams.componentStateParams.taskId;
            taskService.getCommonTaskDetails($stateParams.componentStateParams.taskId)
                .then(function (response) {
                    var currentTaskData = response.value[0];
                    vm.workOrder = currentTaskData.WorkOrderNId;
                    vm.workOrderOperation = currentTaskData.WorkOrderOperationNId;
                    vm.workProcessNId = currentTaskData.WorkProcessNId;
                    vm.taskNId = currentTaskData.NId;
                    vm.taskName = currentTaskData.Name;
                    vm.taskType = currentTaskData.TaskTypeName;
                    vm.taskDescription = currentTaskData.Description;
                    vm.taskEquipment = currentTaskData.EquipmentNId;
                    vm.taskIteration = currentTaskData.IterationMaximum !== null ? currentTaskData.Iteration + '/' + currentTaskData.IterationMaximum : '';
                    vm.taskOutOfProcessIteration = currentTaskData.OutOfProcessIteration + '/' + currentTaskData.OutOfProcessIterationMaximum;
                    vm.taskStatus = currentTaskData.StatusNId;
                    vm.showErrorMessage = currentTaskData.StatusNId === 'Error' && currentTaskData.ErrorMessage !== null ? true : false;
                    vm.taskErrorMessage = currentTaskData.ErrorMessage;
                });
        }

        function onComponentEvt(event, data) {
            if (data.operatorOverviewAvailable) {
                vm.displayCustomView = true;
            } else {
                vm.displayCustomView = false;
            }
        }

        function activate() {
            init();
            openSidePanel();
        }

        angular.element(document).ready(function () {
            initTaskContextComponent();
        });

        function init() {
            $rootScope.$on('operatorOverviewAvailable', onComponentEvt);
            initHeaderData();
            vm.onTabSelected = onTabSelected;
            vm.isTabActive = isTabActive;
            // Exposing the name of the directive to the view, so that it is possible to load it dynamically using a sit-component directive
            vm.displayCustomView = false;
            if (componentManifest !== null) {
                if (componentManifest.uiComponent !== undefined) {
                    vm.name = componentManifest.uiComponent.identity.name;
                    vm.source = componentManifest.uiComponent.identity.source;
                    vm.displayCustomView = true;
                }
            }
            eventDispatcherService.addEventListener('PropertyArea.closeFullScreenSidePanel', closeSidePanel);
            vm.dpc = {};
        }

        function initTaskContextComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (taskContextComponent !== null) {
                vm.taskContextComponentSource = taskContextComponent.uiComponent.identity.source;
                angular.element(document.getElementById('taskContextComponent')).append($compile('<' + vm.taskContextComponentSource + '>')($scope));
            } else {
                vm.displayStandardTaskDetail = true;
            }
        }
    }

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .controller('uapi_OperatorTaskOverviewController', ['$timeout', '$window', '$rootScope', '$state', '$stateParams', '$scope', '$compile', '$translate', 'uapi_taskService', 'common.base', 'componentManifest', 'uapi_eventDispatcherService', 'taskContextComponent', ComponentViewerController]);

})();
