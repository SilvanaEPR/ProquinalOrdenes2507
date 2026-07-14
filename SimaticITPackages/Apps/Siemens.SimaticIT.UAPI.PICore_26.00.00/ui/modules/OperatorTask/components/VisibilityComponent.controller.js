/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    function ComponentViewerController($rootScope, $state, $stateParams, $scope, $compile, $translate, workOrderOperationService, base, componentManifest, eventDispatcherService, taskContextComponent) {
        var vm = this;
        var logger;
        var sidePanelManager = base.services.sidePanel.service;
        var view = $state.$current.views['property-area-container@'];
        vm.workOrder = '';
        vm.workOrderOperation = '';
        vm.displayCustomView = false;

        init();

        function init() {
            logger = base.services.logger.service.getModuleLogger('VisibilityComponent');
            initOverviewData();
            // Exposing the name of the directive to the view, so that it is possible to load it dynamically using a sit-component directive
            if (componentManifest !== null && componentManifest.uiComponent !== undefined && componentManifest.uiComponent.identity.name === 'siemensCustomUicontainerWorkOrderOperationDetails') {
                vm.displayCustomView = true;
                vm.name = componentManifest.uiComponent.identity.name;
                vm.source = componentManifest.uiComponent.identity.source;
            }
            vm.dpc = {};
            eventDispatcherService.addEventListener('PropertyArea.closeFullScreenSidePanel', closeSidePanel);
            openSidePanel();
            initTaskContextComponent();
        }

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

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
            eventDispatcherService.dispatchEvent('PropertyArea.onSidepanelClosed');
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

        function initOverviewData() {
            if ($state.params.componentStateParams.WorkOrderOperationNId !== undefined) {
                vm.workOrderOperation = $state.params.componentStateParams.WorkOrderOperationNId;
                vm.workOrder = $state.params.componentStateParams.WorkOrderNId;
                workOrderOperationService.getAll('$filter=(NId eq %27' + vm.workOrderOperation + '%27 and WorkOrder/NId eq %27' + vm.workOrder + '%27)&$expand=WorkOrder').then(onGetWOOperationByNIdSuccess, onGetWOOperationError);
            } else {
                logger.logErr('Error on getting Work Order Operation. ', 'No WorkOrderOperationNId found.');
            }
        }

        function onGetWOOperationByNIdSuccess(data) {
            if (data.value.length === 1) {
                vm.workOrderOperationName = data.value[0].Name;
                vm.workOrderOperationSequence = data.value[0].Sequence;
            }
        }

        function onGetWOOperationError(reason) {
            logger.logErr('Error on getting Work Order Operation. ', reason);
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
        .controller('uapi_OperatorVisibilityController', ['$rootScope', '$state', '$stateParams', '$scope', '$compile', '$translate', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService', 'common.base', 'componentManifest', 'uapi_eventDispatcherService', 'taskContextComponent',  ComponentViewerController]);

})();
