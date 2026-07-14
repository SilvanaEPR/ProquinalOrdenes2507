(function () {
    'use strict';

    function OpenRuntimeMonitorController($rootScope, $scope, $translate, $state, common, $stateParams, modelDrivenService, $timeout, swacMgr) {

        var self = this;
        self.onCustomActionComplete = null;
        self.isWorkProcessVisible = false;
        self.workProcessId = null;

        activate();

        function activate() {
            const initCustomActionCallbackFunction = modelDrivenService.initCustomAction(); //gets the callback function
            self.onCustomActionComplete = initCustomActionCallbackFunction && initCustomActionCallbackFunction.onExit ? initCustomActionCallbackFunction.onExit : null;
            self.openRTMEvent = $rootScope.$on('Siemens.SimaticIT.BPFlow.ProcessEngineeringFlow.CloseRuntimeMonitor', openRuntimeMonitorHandler);
            $scope.$on('$destroy', onDestroy);
            init();
        }

        function init() {
            self.isWorkProcessVisible = true;
            self.workProcessId = $stateParams.WorkProcess.Id;
        }

        function openRuntimeMonitorHandler() {
            self.isWorkProcessVisible = !self.isWorkProcessVisible;
            // this class is add because command bar displayed with the work process should not be shifted but command bar of the OTL should be shifted
            $('.canvas-ui-view').addClass('expr-padding-right');
            /* Command bar widget does not work correctly when there are 2 command bars in the HTML.
             * So, when the work process is open, the command bar is hidden by ng-if.
             * When it is closed, the command bar is reinitialized with default value for button visibility.
             * To be able to pass the right visibility to the widget, the system should wait the initialization of the widget
             * */
            $timeout(function () {
                //vm.updateCommandBar();
                //Work process title replaced by Operator task list title
                //setOperatorTaskListTitle($translate.instant('picore.titles.operatorTaskList'));
                // enableDisableSideNavBar(false);
                $state.go('^');
            }, 100);
        }

        function onDestroy() {
            //eventDispatcherService.removeEventListener('PropertyArea.onSidepanelClosed', onComponentViewerCanceled);
            self.openRTMEvent();
            // destroySignalServiceConnections();
        }

        /*function setOperatorTaskListTitle(title) {
            if (swacMgr.enabled) {
                swacMgr.contextServicePromise.promise.then(function (service) {
                    service.updatePartialCtx('location.titles', { headerTitle: title });
                });
            }
        }*/
    }

    angular.
        module('Siemens.SimaticIT.UAPI.PICore').
        controller('PICore_OpenRuntimeMonitorController', OpenRuntimeMonitorController);/*.
        config([
            '$stateProvider',
            function ($stateProvider) {

                const rootstate = 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration_WorkOrderMasterDetail.StartWorkProcess2';
                const folder = 'Siemens.SimaticIT.UAPI.PICore/blueprints/OpenRuntimeMonitor';

                const item = {
                    name: rootstate + '.open',
                    url: '/open',
                    views: {
                        'Canvas@': {
                            templateUrl: folder + '/RuntimeMonitor-open.html',
                            controller: 'PICore_OpenRuntimeMonitorController',
                            controllerAs: 'vm'
                        }
                    }
                };

                $stateProvider.state(item);
            }]);*/

    OpenRuntimeMonitorController.$inject = ['$rootScope', '$scope', '$translate', '$state', 'common.base', '$stateParams', 'common.services.modelDriven.runtimeService', '$timeout', 'common.services.swac.SwacUiModuleManager'];
}());
