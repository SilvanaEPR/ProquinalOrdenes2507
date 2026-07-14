/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .directive('piOptskCommandBar', pioptskCommandBarDirective);

    function pioptskCommandBarDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-command-bar.directive.html',
            controller: pioptskCommandBarController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterApi: '&',
                onCommandClicked: '&',
                cssSize: '@'
            }
        };
    }

    pioptskCommandBarController.$inject = ['$translate'];

    function pioptskCommandBarController($translate) {
        var vm = this;
        if (!vm.cssSize) { vm.cssSize = ''; }

        vm.commandClick = commandClick;

        vm.isActivateVisible = false;
        vm.isCancelVisible = false;
        vm.isCompleteVisible = false;
        vm.isPauseVisible = false;
        vm.isResumeVisible = false;
        vm.isSkipVisible = false;
        vm.isStartVisible = false;
        vm.isSuspendVisible = false;
        vm.isOverviewVisible = false;
        vm.isWorkprocessVisible = false;
        vm.IsShowFinalizedTasksVisible = true;
        vm.isWorkOrderOperationSelected = true;
        vm.isFullScreenSidePanel = false;
        vm.isWorkOrderContextSet = false;

        activate();

        function activate() {
            vm.api = {
                changeVisibilityOnItemCollectionViewerSelectionChanged: changeVisibilityOnItemCollectionViewerSelectionChanged,
                setCloseButtonForFullScreenMode: setCloseButtonForFullScreenMode,
                changeVisibilityOnStartWorkProcessButton: changeVisibilityOnStartWorkProcessButton
            };

            vm.onRegisterApi({ api: vm.api });

            function setSingleButtonsThatRequireSelectionVisible(visibility) {
                vm.isActivateVisible = visibility.activateVisible;
                vm.isCancelVisible = visibility.cancelVisible;
                vm.isCompleteVisible = visibility.completeVisible;
                vm.isPauseVisible = visibility.pauseVisible;
                vm.isResumeVisible = visibility.resumeVisible;
                vm.isSkipVisible = visibility.skipVisible;
                vm.isStartVisible = visibility.startVisible;
                vm.isSuspendVisible = visibility.suspendVisible;
                vm.isOverviewVisible = visibility.overviewVisible;
                vm.isWorkprocessVisible = visibility.workprocessVisible;
                vm.isWorkOrderOperationSelected = visibility.workOrderOperationSelected;
                vm.IsShowFinalizedTasksVisible = visibility.showFinalizedTaskVisible;
            }

            function changeVisibilityOnStartWorkProcessButton(contextObject) {
                var visibility = false;
                if (!isNullOrEmpty(contextObject)) {
                    if ((!isNullOrEmpty(contextObject.prodContextField)) && (!isNullOrEmpty(contextObject.prodContextField.WorkOrderNId))) {
                        visibility = true;
                    }
                    if (!isNullOrEmpty(contextObject.WorkOrderNId)) {
                        visibility = true;
                    }
                }
                vm.isWorkOrderContextSet = visibility;
            }

            function setCloseButtonForFullScreenMode(isFullScreenMode) {
                vm.isFullScreenSidePanel = isFullScreenMode;
            }

            function changeVisibilityOnItemCollectionViewerSelectionChanged(updatedStatusData, row, visibility) {
                var statusData = updatedStatusData;

                var newVisibility = {};

                if (statusData && row) {
                    if (statusData.StatusInfo.EntityId === row.Id) {
                        newVisibility = {
                            //- Activate -> Created, Not Ready, Suspended
                            //- Suspend -> Ready
                            //- Start -> Ready
                            //- Pause -> In Progress
                            //- Resume -> Paused
                            //- Complete -> In Progress
                            //- Cancel -> Created, Ready, Not Ready, Suspended
                            //- Skip -> Created, Ready, Not Ready, Suspended

                            activateVisible: visibility && visibility.activateVisible !== undefined ? visibility.activateVisible : (row ? row.selected && (['Created', 'NotReady', 'Suspended'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            cancelVisible: visibility && visibility.cancelVisible !== undefined ? visibility.cancelVisible : (row ? row.selected && (['Created', 'Ready', 'NotReady', 'Suspended'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            completeVisible: visibility && visibility.completeVisible !== undefined ? visibility.completeVisible : (row ? row.selected && (['InProgress'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            pauseVisible: visibility && visibility.pauseVisible !== undefined ? visibility.pauseVisible : (row ? row.selected && (['InProgress'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            resumeVisible: visibility && visibility.resumeVisible !== undefined ? visibility.resumeVisible : (row ? row.selected && (['Paused'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            skipVisible: visibility && visibility.skipVisible !== undefined ? visibility.skipVisible : (row ? row.selected && (['Created', 'Ready', 'NotReady', 'Suspended'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) && row.IsSkippable : false),
                            startVisible: visibility && visibility.startVisible !== undefined ? visibility.startVisible : (row ? row.selected && (['Ready'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            suspendVisible: visibility && visibility.suspendVisible !== undefined ? visibility.suspendVisible : (row ? row.selected && (['Ready'].indexOf(statusData.StatusInfo.CurrentStatusNId) >= 0) : false),
                            overviewVisible: visibility && visibility.overviewVisible !== undefined ? visibility.overviewVisible : (row ? row.selected : false),
                            workprocessVisible: visibility && visibility.workprocessVisible !== undefined ? visibility.workprocessVisible : (row ? row.selected && (row.TaskFlow != null /*&& row.WorkProcedureNId == null*/) : false),
                            workOrderOperationSelected: visibility && visibility.workOrderOperationSelected !== undefined ? visibility.workOrderOperationSelected : (row ? row.selected && (row.WorkOrderOperationNId != null && row.WorkOrderOperationNId != undefined) : false),
                            showFinalizedTaskVisible: visibility && visibility.showFinalizedTaskVisible !== undefined ? visibility.showFinalizedTaskVisible : vm.IsShowFinalizedTasksVisible
                        };
                    } else {
                        return;
                    }
                } else {
                    newVisibility = {
                        //- Activate -> Created, Not Ready, Suspended
                        //- Suspend -> Ready
                        //- Start -> Ready
                        //- Pause -> In Progress
                        //- Resume -> Paused
                        //- Complete -> In Progress
                        //- Cancel -> Created, Ready, Not Ready, Suspended
                        //- Skip -> Created, Ready, Not Ready, Suspended

                        activateVisible: visibility && visibility.activateVisible !== undefined ? visibility.activateVisible : (row ? row.selected && (['Created', 'NotReady', 'Suspended'].indexOf(row.StatusNId) >= 0) : false),
                        cancelVisible: visibility && visibility.cancelVisible !== undefined ? visibility.cancelVisible : (row ? row.selected && (['Created', 'Ready', 'NotReady', 'Suspended'].indexOf(row.StatusNId) >= 0) : false),
                        completeVisible: visibility && visibility.completeVisible !== undefined ? visibility.completeVisible : (row ? row.selected && (['InProgress'].indexOf(row.StatusNId) >= 0) : false),
                        pauseVisible: visibility && visibility.pauseVisible !== undefined ? visibility.pauseVisible : (row ? row.selected && (['InProgress'].indexOf(row.StatusNId) >= 0) : false),
                        resumeVisible: visibility && visibility.resumeVisible !== undefined ? visibility.resumeVisible : (row ? row.selected && (['Paused'].indexOf(row.StatusNId) >= 0) : false),
                        skipVisible: visibility && visibility.skipVisible !== undefined ? visibility.skipVisible : (row ? row.selected && (['Created', 'Ready', 'NotReady', 'Suspended'].indexOf(row.StatusNId) >= 0) && row.IsSkippable : false),
                        startVisible: visibility && visibility.startVisible !== undefined ? visibility.startVisible : (row ? row.selected && (['Ready'].indexOf(row.StatusNId) >= 0) : false),
                        suspendVisible: visibility && visibility.suspendVisible !== undefined ? visibility.suspendVisible : (row ? row.selected && (['Ready'].indexOf(row.StatusNId) >= 0) : false),
                        overviewVisible: visibility && visibility.overviewVisible !== undefined ? visibility.overviewVisible : (row ? row.selected : false),
                        workprocessVisible: visibility && visibility.workprocessVisible !== undefined ? visibility.workprocessVisible : (row ? row.selected && (row.TaskFlow != null /*&& row.WorkProcedureNId == null*/) : false),
                        workOrderOperationSelected: visibility && visibility.workOrderOperationSelected !== undefined ? visibility.workOrderOperationSelected : (row ? row.selected && (row.WorkOrderOperationNId != null && row.WorkOrderOperationNId != undefined) : false),
                        showFinalizedTaskVisible: visibility && visibility.showFinalizedTaskVisible !== undefined ? visibility.showFinalizedTaskVisible : vm.IsShowFinalizedTasksVisible
                    };
                }

                setSingleButtonsThatRequireSelectionVisible(newVisibility);
            }
        }

        function commandClick(command) {
            if (vm.onCommandClicked) {
                vm.onCommandClicked({ command: command });
                if (command.selected && command.name === 'unshowFinalizedTasks') {
                    vm.IsShowFinalizedTasksVisible = true;
                } else if (command.name === 'showFinalizedTasks') {
                    vm.IsShowFinalizedTasksVisible = false;
                }
            }
        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '' && variable !== {}) { return false; }
            return true;
        }

    }

})();
