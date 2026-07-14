/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    function ComponentViewerController($rootScope, $state, $scope, $stateParams, $compile, common, componentManifest, $translate, eventDispatcherService, taskContextComponent) {
        var vm = this;
        var sidePanelManager = common.services.sidePanel.service;
        var view = $state.$current.views['property-area-container@'];
        activate();

        function openSidePanel() {
            if (view.templateUrl !== undefined && view.templateUrl !== '') {
                vm.title = $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskExecution');
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

        function activate() {
            if (!componentManifest) {
                return;
            }
            init();
            eventDispatcherService.addEventListener('PropertyArea.closeFullScreenSidePanel', cancel);
            initTaskContextComponent();
        }

        function init() {
            // Exposing the name of the directive to the view, so that it is possible to load it dynamically using a sit-component directive
            vm.name = componentManifest.uiComponent.identity.name;
            vm.source = componentManifest.uiComponent.identity.source;
            vm.dpc = {};
            openSidePanel();
        }

        function cancel() {
            sidePanelManager.close();
            $state.go('^');
            eventDispatcherService.dispatchEvent('PropertyArea.onSidepanelClosed');
        }

        $scope.$on('$destroy', function () {
            eventDispatcherService.removeEventListener('PropertyArea.closeFullScreenSidePanel', cancel);
            var propertyAreaElement = $('div[data-internal-type="property-area-container-modal"]').parent();
            if (propertyAreaElement && propertyAreaElement.length) {
                propertyAreaElement.removeAttr('data-task-side-panel');
            }
        });

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

    angular.module('Siemens.SimaticIT.UAPI.PICore')
        .controller('uapi_ComponentViewerController', ['$rootScope', '$state', '$scope', '$stateParams', '$compile','common.base', 'componentManifest', '$translate', 'uapi_eventDispatcherService', 'taskContextComponent',  ComponentViewerController]);
})();
