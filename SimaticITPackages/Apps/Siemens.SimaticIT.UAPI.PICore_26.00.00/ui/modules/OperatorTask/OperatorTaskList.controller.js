/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .controller('piOperatorTaskListController', piOperatorTaskListController);

    piOperatorTaskListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', '$filter', 'uapi_presentationService',
        'uapi_taskService', 'uapi-productionContextService', 'uapi_eventDispatcherService', 'common.services.signalManager', 'common.services.ui.authentication',
        'common.base', '$translate', 'common.services.logger.service', 'common.services.modelDriven.contextService', 'common.widgets.messageOverlay.service', 'taskHeaderComponent',
        'taskDetailComponent', 'globalLeftSideComponent', 'leftSideTaskComponent', 'taskRightSideComponent', 'taskFooterComponent', '$compile', 'common.services.swac.SwacUiModuleManager', '$q'];

    function piOperatorTaskListController($rootScope, $scope, $state, $stateParams, $timeout, $filter, presentationService,
        taskService, productionContextService, eventDispatcherService, signalService, authenticationService,
        commonBase, $translate, uiLogger, mdContextSrv, messageOverlay, taskHeaderComponent,
        taskDetailComponent, globalLeftSideComponent, leftSideTaskComponent, taskRightSideComponent, taskFooterComponent, $compile, swacMgr, $q) {
        var vm = this;

        var productionContext = {};
        var parentParameters = {};
        var manualProcessDefinitionListDefer = $q.defer();
        const prodCtxChangedEvent = 'otltasklist.productioncontextchanged';

        var sidePanelManager = commonBase.services.sidePanel.service;
        var backendService = commonBase.services.runtime.backendService;

        vm._connections = {};
        vm.operatorTaskListTitle = $translate.instant('picore.titles.operatorTaskList');
        vm.workProcessTitle = $translate.instant('picore.titles.operatorTaskListWorkProcess');
        vm.isTitleVisible = false;
        vm.showFinalizedTasks = false;
        vm.workProcessId = '';
        vm.isWorkProcessVisible = false;
        vm.isSidePanelOpened = false;
        activate();

        function activate() {
            storeParentParameters();
            eventDispatcherService.addEventListener('ProductionContextArea.onSaveCompleted', onProductionContextAreaSaveCompleted);
            // this event is fired when the user clicks on quit button of work process runtime editor
            vm.openRTMEvent = $rootScope.$on('Siemens.SimaticIT.BPFlow.ProcessEngineeringFlow.CloseRuntimeMonitor', openRuntimeMonitorHandler);
            $scope.$on('$destroy', onDestroy);
            //initManualProcessDefinitionCatalog();
            initHeaderComponent();
            initTaskDetailComponent();
            initglobalLeftSideComponent();
            initLeftSideTaskComponent();
            initTaskRightSideComponent();
            initTaskFooterComponent();
            $('.canvas-ui-view').addClass('expr-padding-right');
            eventDispatcherService.addEventListener('PropertyArea.onSidepanelClosed', onComponentViewerCanceled);
            setOperatorTaskListTitle($translate.instant('picore.titles.operatorTaskList'));
        }

        function closeFullScreenSidePanelExecution() {
            eventDispatcherService.dispatchEvent('PropertyArea.closeFullScreenSidePanel');
            setOperatorTaskListTitle($translate.instant('picore.titles.operatorTaskList'));
        }

        function initHeaderComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (taskHeaderComponent !== null) {
                vm.headerComponentSource = taskHeaderComponent.uiComponent.identity.source;
                angular.element(document.getElementById('taskHeaderComponent')).append($compile('<' + vm.headerComponentSource + '>')($scope));
            }
        }

        //function initManualProcessDefinitionCatalog() {
        //    var options = '$expand=WorkOrderOperation($expand=WorkOrder)';
        //    // check if in the workorder context only
        //    if (!isNullOrEmpty(parentParameters.WorkOrderNId)) {
        //        options += '&$filter=WorkOrderOperation/WorkOrder/NId eq \'' + parentParameters.WorkOrderNId + '\' and IsForManualExecution eq true'
        //        if (!isNullOrEmpty(parentParameters.WorkOrderOperationNId)) {
        //            options += ' and WorkOrderOperation/NId eq \'' + parentParameters.WorkOrderOperationNId + '\'';
        //        }

        //        var queryModel = { appName: 'PICore', entityName: 'WorkOrderOperationWorkProcess', options: options };

        //        var callBack = backendService.findAll(queryModel).then(function (data) {
        //            if ((data) && (data.succeeded)) {
        //                var processDefinitionList = [];
        //                for (var record in data.value) {
        //                    var singleObj = {
        //                        processDefinitionNId: data.value[record].ProcessDefinitionNId,
        //                        processDefinitionRevision: data.value[record].ProcessDefinitionRevision,
        //                        elementName: "PDCommand|" + data.value[record].ProcessDefinitionNId + "|" + data.value[record].ProcessDefinitionRevision + "|" + data.value[record].WorkOrderOperation.NId,
        //                        workOrderOperationNId: data.value[record].WorkOrderOperation.NId,
        //                        displayName: parentParameters.WorkOrderOperationNId ? data.value[record].ProcessDefinitionNId : data.value[record].ProcessDefinitionNId + " - " + data.value[record].WorkOrderOperation.NId
        //                    };
        //                    processDefinitionList.push(singleObj);
        //                }
        //                manualProcessDefinitionListDefer.resolve(processDefinitionList);
        //            }
        //            //vm.ready = true;
        //        }, backendService.backendError);
        //        return;
        //    }

        //}

        //function initManualProcessDefinitionCatalog() {
        //    uapiProcessDefinitionService.getManualProcessDefinitions(parentParameters.WorkOrderNId, parentParameters.WorkOrderOperationNId).then(function (data) {
        //        if ((data) && (data.succeeded)) {
        //            var processDefinitionList = [];
        //            for (var record in data.value) {
        //                var singleObj = {
        //                    processDefinitionNId: data.value[record].ProcessDefinitionNId,
        //                    processDefinitionRevision: data.value[record].ProcessDefinitionRevision,
        //                    elementName: "PDCommand|" + data.value[record].ProcessDefinitionNId + "|" + data.value[record].ProcessDefinitionRevision
        //                };
        //                processDefinitionList.push(singleObj);
        //            }
        //            manualProcessDefinitionListDefer.resolve(processDefinitionList);
        //        }
        //    });
        //}

        function initTaskDetailComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (taskDetailComponent !== null) {
                vm.taskDetailComponentSource = taskDetailComponent.uiComponent.identity.source;
                angular.element(document.getElementById('taskDetailComponent')).append($compile('<' + vm.taskDetailComponentSource + '>')($scope));
            } else {
                vm.displayStandardTaskDetail = true;
            }
        }

        function initglobalLeftSideComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (globalLeftSideComponent !== null) {
                vm.globalLeftSideComponentSource = globalLeftSideComponent.uiComponent.identity.source;
                angular.element(document.getElementById('globalLeftSideComponent')).append($compile('<' + vm.globalLeftSideComponentSource + '>')($scope));
            }
        }

        function initLeftSideTaskComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (leftSideTaskComponent !== null) {
                vm.leftSideTaskComponentSource = leftSideTaskComponent.uiComponent.identity.source;
                angular.element(document.getElementById('leftSideTaskComponent')).append($compile('<' + vm.leftSideTaskComponentSource + '>')($scope));
            }
        }

        function initTaskRightSideComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (taskRightSideComponent !== null) {
                vm.displayTaskRightSideComponent = true;
                vm.taskRightSideComponentSource = taskRightSideComponent.uiComponent.identity.source;
                angular.element(document.getElementById('taskRightSideComponent')).append($compile('<' + vm.taskRightSideComponentSource + '>')($scope));
            }
        }

        function initTaskFooterComponent() {
            // Only the directive is loaded to avoid fix size provided by the ui component
            if (taskFooterComponent !== null) {
                vm.taskFooterComponentSource = taskFooterComponent.uiComponent.identity.source;
                angular.element(document.getElementById('taskFooterComponent')).append($compile('<' + vm.taskFooterComponentSource + '>')($scope));
            }
        }

        function executeCommand(appName, commandName, params) {
            //logger.logDebug('Executing command: ', commandName);
            return backendService.invoke({ appName: appName, commandName: commandName, params: params });
        }

        // Store the stateParams that MAY come from a parent page
        function storeParentParameters() {
            if ($stateParams.WorkOrderNId == null && mdContextSrv.MDState.previousData && mdContextSrv.MDState.previousData.WorkOrder && mdContextSrv.MDState.previousData.WorkOrder.NId) {
                $stateParams.WorkOrderNId = mdContextSrv.MDState.previousData.WorkOrder.NId;
            }
            parentParameters.WorkOrderNId = uriDecode($stateParams.WorkOrderNId);
            parentParameters.WorkOrderOperationNId = uriDecode($stateParams.WorkOrderOperationNId);
            parentParameters.EquipmentNId = uriDecode($stateParams.EquipmentNId);
        }

        // Decode correctly the uri
        function uriDecode(str) {
            if (!isNullOrEmpty(str)) { return decodeURIComponent(str.replace(/\+/g, ' ')); } else { return str; }
        }

        function showCustomForm(route, stateParams, stateName) {
            if (route !== null) {
                var info = route.split('/');
                if (info.length < 2) {
                    return;
                }
                stateParams.app = info[0];
                stateParams.component = info[1];
            }

            var state = $filter('filter')($state.get(), { name: stateName })[0];
            if (state == null) {
                return;
            }

            if (!stateParams.componentStateParams) {
                stateParams.componentStateParams = {};
            }
            stateParams.componentStateParams.previousStateName = $state.current.name;
            $state.go(stateName, stateParams, {});
            vm.isSidePanelOpened = true;
            vm._commandBarApi.setCloseButtonForFullScreenMode(true);
        }

        function showVisibilityUI(stateParams, stateName) {
            stateParams.app = 'Siemens.Custom.UIContainer';
            stateParams.component = 'siemensCustomUicontainerWorkorderoperationdetails';
            if (!stateParams.componentStateParams) {
                stateParams.componentStateParams = {};
            }
            sidePanelManager.setTitle('');
            $state.go(stateName, stateParams, {});

            //set full screen buttons on command bar
            vm._commandBarApi.setCloseButtonForFullScreenMode(true);
        }

        // Events from the Production Context Area when the user has saved a new context
        function onProductionContextAreaSaveCompleted() {
            // Read the Production Context
            productionContextService.getProductionContext()
                // Create the filters
                .then(onGetProductionContextAsyncSuccess);
        }

        function onComponentViewerCanceled() {
            vm.isSidePanelOpened = false;
            vm.updateTaskICV();
        }

        function setOperatorTaskListTitle(title) {
            if (swacMgr.enabled) {
                swacMgr.contextServicePromise.promise.then(function (service) {
                    service.updatePartialCtx('location.titles', { headerTitle: title });
                });
            }
        }

        function onDestroy() {
            eventDispatcherService.removeEventListener('ProductionContextArea.onSaveCompleted', onProductionContextAreaSaveCompleted);
            eventDispatcherService.removeEventListener('PropertyArea.onSidepanelClosed', onComponentViewerCanceled);
            vm.openRTMEvent();
            destroySignalServiceConnections();
        }

        // Function called when the work process modal dialog is closed
        function openRuntimeMonitorHandler() {
            vm.isWorkProcessVisible = !vm.isWorkProcessVisible;
            // this class is add because command bar displayed with the work process should not be shifted but command bar of the OTL should be shifted
            $('.canvas-ui-view').addClass('expr-padding-right');
            /* Command bar widget does not work correctly when there are 2 command bars in the HTML.
             * So, when the work process is open, the command bar is hidden by ng-if.
             * When it is closed, the command bar is reinitialized with default value for button visibility.
             * To be able to pass the right visibility to the widget, the system should wait the initialization of the widget
             * */
            $timeout(function () {
                vm.updateCommandBar();
                //Work process title replaced by Operator task list title
                setOperatorTaskListTitle($translate.instant('picore.titles.operatorTaskList'));
                enableDisableSideNavBar(false);
            }, 100);
        }

        //Enable disabled side nav bar on opening and closing work process window
        function enableDisableSideNavBar(isDisable) {
            let ele = $(parent.document.getElementsByTagName("mom-modal-overlay")[1]);
            if (ele) {
                let child = ele.children("div:first-child");
                if (child) {
                    if (isDisable) {
                        //Disable
                        child.addClass("mom-modal-overlay-displayed").css({ "z-index": "99", "background": "transparent", "cursor": "not-allowed" });
                    } else {
                        //Enable
                        child.removeClass("mom-modal-overlay-displayed").removeAttr("style");
                    }
                }
            }
        }

        // Update data of graphical components
        function updateComponents() {
            vm.updateCommandBar();
            vm.updateTaskDetail();
        }

        // Bindings with the taskDetail directive
        (function taskDetail(vm) {
            vm.onTaskDetailRegisterApi = onTaskDetailRegisterApi;
            vm.onOperationClicked = onOperationClicked;
            vm.updateTaskDetail = updateTaskDetail;

            function onTaskDetailRegisterApi(api) {
                vm._taskDetailApi = api;
                vm._taskDetailApi.selectedItemChanged(vm._selectedTask);
            }

            function onOperationClicked() {
                vm._commandBarApi.setCloseButtonForFullScreenMode(true);
                setOperatorTaskListTitle($translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.operationDetails'));
            }

            function updateTaskDetail() {
                if (taskDetailComponent === null) {
                    vm._taskDetailApi.selectedItemChanged(vm.statusData, vm._selectedTask);
                }

                var eventName = 'otltasklist.selecteditemchanged';
                $rootScope.$broadcast(eventName, vm._selectedTask);
            }
        })(vm);

        // Bindings with the task-tags directive
        (function TaskTags(vm) {
            vm._taskTagsApi = null;
            vm.onTaskTagsRegisterApi = onTaskTagsRegisterApi;
            vm.onTaskTagClicked = onTaskTagClicked;
            vm.updateTaskTags = updateTaskTags;

            function onTaskTagsRegisterApi(api) {
                vm._taskTagsApi = api;
            }

            function updateTaskTags() {
                return vm._taskTagsApi.refresh(productionContext, vm.showFinalizedTasks);
            }

            function onTaskTagClicked(tag) {
                // A tag has been clicked, we cancel the parent parameter and refresh
                productionContextService.removeParametersFromProductionContext(tag, parentParameters);

                // Re-Read the Production Context and refresh
                productionContextService.getProductionContext()
                    // Create the filters
                    .then(onGetProductionContextAsyncSuccess);
            }

        })(vm);

        // Bindings with the task-icv directive
        (function TaskICV(vm) {
            vm._taskICVApi = null;
            vm.onTaskICVRegisterApi = onTaskICVRegisterApi;
            vm.onTaskICVSelectionChanged = onTaskICVSelectionChanged;
            vm.updateTaskICV = updateTaskICV;

            function onTaskICVRegisterApi(api) {
                vm._taskICVApi = api;
                vm._taskICVApi.setCompactMode(false);
            }

            function onTaskICVSelectionChanged(rows, row) {
                vm._selectedTask = row && row.selected ? row : null;
                updateComponents();
            }

            function updateTaskICV() {
                return vm._taskICVApi.refresh(productionContext, vm.showFinalizedTasks);
            }
        })(vm);

        // Bindings with the task-command-bar directive
        (function CommandBar(vm) {
            vm.onTaskCBRegisterApi = onTaskCBRegisterApi;
            vm.onTaskCBClicked = onTaskCBClicked;
            vm.onTaskTileActionClicked = onTaskTileActionClicked;
            vm.updateCommandBar = updateCommandBar;
            vm.updateVisibilityStartWPButton = updateVisibilityStartWPButton;

            function onTaskCBRegisterApi(api) {
                vm._commandBarApi = api;
                vm._commandBarApi.setCloseButtonForFullScreenMode(false);
                vm._commandBarApi.changeVisibilityOnItemCollectionViewerSelectionChanged(vm.statusData, vm._selectedTask);
                vm._commandBarApi.changeVisibilityOnStartWorkProcessButton({}); //initialized empty

                //manualProcessDefinitionListDefer.promise.then(function (pdList) {
                //    vm._commandBarApi.setManualProcessDefinitionCatalog(pdList);
                //});
            }

            function onTaskCBClicked(command) {
                vm.commandName = command.name;
                vm._commandBarApi.setCloseButtonForFullScreenMode(false);

                switch (command.name) {
                    case 'openProductionContext':
                        $state.go('home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.ProductionContext');
                        break;
                    case 'openStartWorkProcessPanel':
                        $state.go('home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.StartProcessDefinition');
                        break;
                    case 'showFinalizedTasks':
                        vm.showFinalizedTasks = true;
                        vm.updateTaskICV();
                        vm.updateCommandBar();
                        break;
                    case 'unshowFinalizedTasks':
                        vm.showFinalizedTasks = false;
                        vm.updateTaskICV();
                        vm.updateCommandBar();
                        break;
                    case 'activate':
                    case 'cancel':
                    case 'pause':
                    case 'resume':
                    case 'skip':
                    case 'start':
                    case 'suspend':
                        vm._taskDetailApi.selectedItemChanged(null, null);
                        var input = {
                            Id: vm._selectedTask.Id,
                            User: authenticationService.getIndentity().unique_name
                        };
                        taskService[command.name](input);
                        break;
                    case 'complete':
                        // The 'Complete' action for WaitTask requires user input in OTL for confirmation
                        // Note: This input is not required for other type of tasks.
                        if (vm._selectedTask.TaskTypeNId === "WaitTask") {
                            vm.overlay = {
                                text: $translate.instant('picore.notifications.warnings.waitTaskCompletionConfirmation'),
                                title: $translate.instant('picore.titles.warningTitle'),
                                buttons: [{
                                    id: 'okButton',
                                    displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                                    onClickCallback: function () {
                                        removeOverlay();
                                        var waitTaskInput = {
                                            Id: vm._selectedTask.Id,
                                            User: authenticationService.getIndentity().unique_name
                                        };
                                        taskService[command.name](waitTaskInput);
                                    }
                                }, {
                                    id: 'cancelButton',
                                    displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                                    onClickCallback: function () {
                                        removeOverlay();

                                    }
                                }]
                            };
                            messageOverlay.set(vm.overlay);
                            displayOverlay();
                        }
                        else {
                            var input = {
                                Id: vm._selectedTask.Id,
                                User: authenticationService.getIndentity().unique_name
                            };
                            taskService[command.name](input);
                        }
                        break;
                    case 'overview':
                        vm._taskDetailApi.selectedItemChanged(null, null);
                        setOperatorTaskListTitle($translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskDetails'));
                        // This is not defined yet.
                        taskService.getTaskRequirementTags(vm._selectedTask.Id)
                            .then((reqTags) => {
                                var componentStateParams = {
                                    componentStateParams: {
                                        taskId: vm._selectedTask.Id,
                                        action: 'overview',
                                        Task: vm._selectedTask,
                                        WorkOrderNId: vm._selectedTask.WorkOrderNId,
                                        WorkOrderOperationNId: vm._selectedTask.WorkOrderOperationNId,
                                        RequirementTagList: reqTags,
                                        TagSeparator: reqTags != null ? reqTags[reqTags.search(/[^A-Za-z0-9]/)] : null
                                    }
                                };

                                showCustomForm(
                                    vm._selectedTask.TaskInstanceUI,
                                    componentStateParams,
                                    'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.overview-custom-component');
                            });

                        break;
                    case 'visibility':
                        vm._taskDetailApi.selectedItemChanged(null, null);
                        setOperatorTaskListTitle($translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.operationDetails'));
                        showVisibilityUI({ componentStateParams: { taskId: vm._selectedTask.Id, WorkOrderNId: vm._selectedTask.WorkOrderNId, WorkOrderOperationNId: vm._selectedTask.WorkOrderOperationNId, action: 'overview', Task: vm._selectedTask } }, 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.visibility-custom-component');
                        break;
                    case 'closePanel': closeFullScreenSidePanelExecution();
                        break;
                    case 'openWorkProcess':
                        // get work process from NId
                        taskService.getWorkProcessFromNId(vm._selectedTask.TaskFlow).then(function (data) {
                            // this class is removed because command bar displayed with the work process should not be shifted
                            $('.canvas-ui-view').removeClass('expr-padding-right');
                            vm.workProcessId = data.value[0].Id;
                            vm.isWorkProcessVisible = true;
                            enableDisableSideNavBar(true);
                        });
                        break;
                    default:
                        break;
                }
            }

            function onTaskTileActionClicked(command) {
                var input = { name: command.name };
                vm._selectedTask = command.Task;
                onTaskCBClicked(input);
            }

            function updateVisibilityStartWPButton(contextObject) {
                if (contextObject) {
                    vm._commandBarApi.changeVisibilityOnStartWorkProcessButton(contextObject);
                }
            }

            function updateCommandBar() {
                if (vm._taskICVApi) {
                    // manage the visibility  for the "showFinalizedTask" button. Mainly when the widget is reinitialized after Work process display
                    vm._commandBarApi.changeVisibilityOnItemCollectionViewerSelectionChanged(vm.statusData, vm._selectedTask, { showFinalizedTaskVisible: !vm.showFinalizedTasks });
                }
            }
        })(vm);


        (function openSignalServiceConnection(vm) {
            signalService.createConnection('PICore', 'PITaskStatusChanged', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm._connections['PITaskStatusChanged'] = signalConnection;
                    uiLogger.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToStatusChanged();
                } else {
                    uiLogger.log('Wrong signal');
                }
            }, function (error) {
                uiLogger.log('Error in opening a connection \n' + angular.toJson(error, true));
            });
            signalService.createConnection('PICore', 'MessageOnTaskReceived', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm._connections['MessageOnTaskReceived'] = signalConnection;
                    uiLogger.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToMessageOnTaskReceived();
                } else {
                    uiLogger.log('Wrong signal');
                }
            }, function (error) {
                uiLogger.log('Error in opening a connection \n' + angular.toJson(error, true));
            });
            signalService.createConnection('PICore', 'ErrorCountChanged', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm._connections['ErrorCountChanged'] = signalConnection;
                    uiLogger.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToErrorCountChanged();
                } else {
                    uiLogger.log('Wrong signal');
                }
            }, function (error) {
                uiLogger.log('Error in opening a connection \n' + angular.toJson(error, true));
            });

            function subscribeToStatusChanged() {
                if (vm._connections['PITaskStatusChanged'] !== undefined) {
                    vm._connections['PITaskStatusChanged'].subscribe('', onStatusChanged, onError, onComplete).then(function (data) {
                        uiLogger.log('subscribe callback onStatusChanged');
                    }, function (error) {
                        uiLogger.log('subscribe error for onStatusChanged');
                    });
                }
            }

            function subscribeToErrorCountChanged() {
                if (vm._connections['ErrorCountChanged'] !== undefined) {
                    vm._connections['ErrorCountChanged'].subscribe('', onErrorCountChanged, onError, onComplete).then(function (data) {
                        uiLogger.log('subscribe callback onErrorCountChanged');
                    }, function (error) {
                        uiLogger.log('subscribe error for onErrorCountChanged');
                    });
                }
            }

            function subscribeToMessageOnTaskReceived() {
                if (vm._connections['MessageOnTaskReceived'] !== undefined) {
                    vm._connections['MessageOnTaskReceived'].subscribe('', onMessageOnTaskReceived, onError, onComplete).then(function (data) {
                        uiLogger.log('subscribe callback onMessageOnTaskReceived');
                    }, function (error) {
                        uiLogger.log('subscribe error for onMessageOnTaskReceived');
                    });
                }
            }

            function onErrorCountChanged(data) {
                vm._taskICVApi.refreshErrorCountAsync(data.TaskId, data.ErrorCount).then(vm.updateCommandBar);
            }

            function onStatusChanged(data) {
                if (data.IsOperatorRelevant) {
                    uiLogger.logDebug('##### onStatusChanged: IsOperatorRelevant');
                    // The Signal may be relevant according to the actual user filter settings (production context)
                    if (productionContextService.isTaskMatchProductionContext(data.TaskContext, productionContext, vm._taskICVApi.getEquipments())) {
                        uiLogger.logDebug('##### onStatusChanged: isTaskMatchProductionContext');
                        vm.statusData = data;

                        // Status data is used only when command bar is updated by this function, so the value is reset
                        vm.statusData = null;

                        var currentUser = authenticationService.getIndentity().unique_name;
                        var userThatRequestedStatusChange = data.EnvelopeUserField10 !== null ? data.EnvelopeUserField10.toLowerCase() : data.EnvelopeUserField10;
                        var stateName = 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.custom-component';
                        if (currentUser && currentUser != null && currentUser.toLowerCase() === userThatRequestedStatusChange && data.StatusInfo.EntityId) {
                            uiLogger.logDebug('##### onStatusChanged: if currentUser and userThatRequestedStatusChange');
                            if (data.StatusInfo.CurrentStatusNId == 'InProgress' && vm._selectedTask && data.StatusInfo.EntityId === vm._selectedTask.Id && vm._selectedTask.TaskUI && vm._selectedTask.TaskUI != '') {
                                uiLogger.logDebug('##### onStatusChanged: if userThatRequestedStatusChange and currentStatus and selectedTask');
                                setOperatorTaskListTitle($translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskExecution'));
                                showCustomForm(vm._selectedTask.TaskUI, {
                                    componentStateParams:
                                    {
                                        taskId: vm._selectedTask.Id,
                                        workOrderOperationNId: vm._selectedTask.WorkOrderOperationNId,
                                        workOrderNId: vm._selectedTask.WorkOrderNId,
                                        Task: vm._selectedTask
                                    }
                                }, stateName);
                                return;
                            } else if (data.StatusInfo.CurrentStatusNId == 'Completed' && vm._selectedTask && vm._selectedTask.TaskUI && vm._selectedTask.TaskUI != '') {
                                // Do not refresh ICV
                                return;
                            }
                        } else if (isTaskVisibleInGrid(data.StatusInfo.EntityId) && userThatRequestedStatusChange === null) {
                            uiLogger.logDebug('##### onStatusChanged: if currentUser and !userThatRequestedStatusChange');
                            if (data.StatusInfo.CurrentStatusNId == 'InProgress' && vm._selectedTask && data.StatusInfo.EntityId === vm._selectedTask.Id && vm._selectedTask.TaskUI && vm._selectedTask.TaskUI != '') {
                                uiLogger.logDebug('##### onStatusChanged: if !userThatRequestedStatusChange and statusInfo and selectedTask');
                                setOperatorTaskListTitle($translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskExecution'));
                                showCustomForm(vm._selectedTask.TaskUI, {
                                    componentStateParams:
                                    {
                                        taskId: vm._selectedTask.Id,
                                        workOrderOperationNId: vm._selectedTask.WorkOrderOperationNId,
                                        workOrderNId: vm._selectedTask.WorkOrderNId,
                                        Task: vm._selectedTask
                                    }
                                }, stateName);
                                return;
                            } else if (data.StatusInfo.CurrentStatusNId == 'Completed' && vm._selectedTask && vm._selectedTask.TaskUI && vm._selectedTask.TaskUI != '') {
                                // Do no refresh ICV
                                return;
                            }
                        }
                        // Update the ICV
                        if (!vm.isSidePanelOpened) {
                            vm.updateTaskICV();
                        }
                    }
                }
            }

            function isTaskVisibleInGrid(taskId) {
                var gridData = vm._taskICVApi.getCurrentData();
                for (var i = 0; i < gridData.length; i++) {
                    if (gridData[i].Id == taskId || (gridData[i].Task != null && gridData[i].Task.Id == taskId)) { return true; }
                }
                return false;
            }

            function onMessageOnTaskReceived(data) {
                uiLogger.logDebug('#### onMessageOnTaskReceived: ' + data.toString());
                if (data.Receiver === '*' || data.Receiver === authenticationService.getIndentity().unique_name) {
                    presentationService.genericError('Error', data.Message);
                }
            }

            function onError(error) {
                uiLogger.log('An error occurred: \n' + angular.toJson(error, true));
            }

            function onComplete() {
                uiLogger.log('Signal \'' + vm.connection.name + '\' stopped sending messages.');
            }

            function connectionErrorCallback(conn, reason) {
                var counter = [];
                uiLogger.log('Connection Error Callback: ' + conn.id + 'Reason:' + reason.reason);
                conn.reconnect().then(function () {
                    counter[conn.id] = 0;
                }, function (err) {
                    if (counter[conn.id] === undefined) {
                        counter[conn.id] = 0;
                    } else {
                        counter[conn.id] = counter[conn.id] + 1;
                    }
                    uiLogger.log('attempt number ' + counter[conn.id] + ' id: ' + conn.id);
                    if (counter[conn.id] > 10) { return; }
                    $timeout(function () {
                        connectionErrorCallback(conn, reason);
                    }, 5000);
                });
            }
        })(vm);

        function destroySignalServiceConnections() {
            for (var connectionName in vm._connections) {
                signalService.destroyConnection(vm._connections[connectionName].id).then(function () {
                    vm._connections[connectionName] = undefined;
                    uiLogger.log('Closed Connection ' + connectionName);
                }, function (error) {
                    uiLogger.log('Error on Closed Connection \n' + angular.toJson(error, true));
                });
            }
        }

        // Read the Production Context and prepare the grid filters
        (function ProductionContext(vm) {
            // Read the Production Context for the first time
            productionContextService.getProductionContext()
                .then(onGetProductionContextAsyncSuccess);

        })(vm);

        // Production context is read
        function onGetProductionContextAsyncSuccess(data) {

            // Is there a Production Context in the db ?
            if (data.value.length > 0) {
                // Store the PC
                productionContext = data.value[0];
            } else
            // Resetting the PC here is mandatory in case we don't have any in the DB
            {
                productionContext = {
                    ProductionContextFields: []
                };
            }
            // Send event to the custom UI components
            $rootScope.$broadcast(prodCtxChangedEvent, productionContext);

            //Add context parameters for start work processes
            productionContextService.setProductionParameters(productionContext, parentParameters);

            // Add external parameters in the PC (override mode)
            productionContextService.injectParametersInProductionContext(productionContext, parentParameters);

            // Update the ICV
            vm.updateTaskICV();

            // Update the Tags
            vm.updateTaskTags().then(function (result) {
                // done!
            });
            vm.updateCommandBar();

            //Show or Hide button to Start Work Process in command bar
            vm.updateVisibilityStartWPButton(productionContextService.getProductionParameters());

        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '') { return false; }
            return true;
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }
    }

})();
