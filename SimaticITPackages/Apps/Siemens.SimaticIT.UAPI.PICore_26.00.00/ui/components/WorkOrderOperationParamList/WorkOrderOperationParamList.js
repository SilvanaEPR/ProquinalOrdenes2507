/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('workorderoperationparamlist', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                onRegisterApi: '&'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderOperationParamList/WorkOrderOperationParamList.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
   * Component controller for WorkOrderOperationParamList
   * @constructor
   * @ngdoc object
   * @name ComponentController
   * @scope
   * @requires $rootScope {service} $rootScope
   * @requires $scope {service} $scope
   * @requires $timeout {service} $timeout
   * @requires loggerService {service} common.services.logger.service
   * @requires uiComponentService {service} common.services.component.uiComponentService
   * @requires base {service} common.base
   * @requires dataService {service} Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService
   * @requires messageOverlay {service} common.widgets.messageOverlay.service
   * @requires $translate {service} translate
   * @requires $q {service}
   */
    ComponentController.$inject = ['$rootScope',
        '$scope',
        '$timeout',
        'common.services.logger.service',
        'common.services.component.uiComponentService',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.widgets.messageOverlay.service',
        '$translate',
        'common.widgets.globalDialog.service',
        '$q',
        'common.services.signalManager',
        'Siemens.SimaticIT.UAPI.PICore.signalManagerService', '$state'];
    function ComponentController($rootScope,
        $scope,
        $timeout,
        loggerService,
        uiComponentService,
        base,
        dataService,
        commonService,
        messageOverlay,
        $translate,
        dialogService,
        $q,
        signalService,
        signalManagerService, $state) {
        var vm = this;
        var logger;
        vm._connections = {};
        vm.toolbarVisible = vm.isActionBarHide ? !vm.isActionBarHide : true;
        var bulkOverlay = false;
        var stringFailedParams = '\n';
        vm.dialogService = dialogService;
        vm.isItemSelected = false;
        var errorInPreviousBulkEdit = false;
        var backendService = base.services.runtime.backendService;
        var internalService = {
            findAll: findAll
        };
        var ops = {
            eq: '=',
            neq: '<>',
            lt: '<',
            lteq: '<=',
            gt: '>',
            gteq: '>=',
            in: 'in',
            con: 'contains',
            sw: 'startsWith',
            ew: 'endsWith',
            isnull: 'isnull',
            isnotnull: 'isnotnull'
        };
        vm.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
        vm.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.booleanOperators = [ops.eq, ops.neq];
        vm.OperationParameterSpecifications = [];
        vm.isComponentTitleVisible = true;
        vm.HideColumns = false;
        vm.isContextNeeded = false;
        vm.pageSizes = [5, 10, 25, 100, 250, 500];
        vm.pageSizeDefault = 25;
        vm.navigationProperties = [];
        vm.facetFullNames = [];
        vm.columnsConfiguration = [
            {
                'PropertyName': 'ParameterNId',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.nId',
                'QuickSearch': true,
                'CanBeSorted': true,
                'IsSortDefault': true,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterName',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.name',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterDescription',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.description',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterType',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.type',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': false
            },
            {
                'PropertyName': 'ParameterLimitLow',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.limitLow',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterToleranceLow',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.toleranceLow',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterTargetValue',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.tv',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterActualValue',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.actualValue',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterToleranceHigh',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.toleranceHigh',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterLimitHigh',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.limitHigh',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'ParameterUoMNId',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.uoM',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'EquipmentNId',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.equipment',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': true
            },
            {
                'PropertyName': 'TaskParameterNId',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.taskParamNId',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': false
            },
            {
                'PropertyName': 'WorkProcessVariableNId',
                'DataType': 'string',
                'DisplayName': 'picore.headers.tables.wpVariableNId',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': false
            },
            {
                'PropertyName': 'TraceChangeDetails',
                'DataType': 'boolean',
                'DisplayName': 'picore.headers.tables.TraceChangeDetails',
                'QuickSearch': false,
                'CanBeSorted': true,
                'IsSortDefault': false,
                'CanBeFiltered': true,
                'IsVisible': false
            }
        ];

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('workorderoperationparamlist');
            init();
            initDialogData();
            registerEvents();
            vm.api = {
                setWorkOrderOperationId: setWorkOrderOperationId,
                hideTitle: hideTitle
            };
            if (vm.onRegisterApi) {
                vm.onRegisterApi({ api: vm.api });
            }
            exposeApi();
            var prm = $state.params.componentStateParams;
            if (prm && prm.WorkOrderOperationNId && prm.WorkOrderNId) {
                updateParamListData(prm.WorkOrderNId, prm.WorkOrderOperationNId);
                hideTitle();
                setActionBarVisibility(false);
                vm.isContextNeeded = true;
            } else if (prm && prm.WorkOrderOperationId) {
                setWorkOrderOperationId(prm.WorkOrderOperationId);
                hideTitle();
                setActionBarVisibility(false);
                vm.isContextNeeded = true;
            }
            signalManagerService.subscribe('PICore', 'WorkOrderOperationParameterSpecificationChanged', onWorkOrderOperationParameterSpecificationChanged);
        }

        function onWorkOrderOperationParameterSpecificationChanged(data) {
            if (vm.tableConfig) {
                vm.tableConfig.refreshData();
            }
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.WorkOrderOperationParamListComponentTitle = $translate.instant('picore.titles.workOrderOperationParamListComponentTitle');
            vm.addWorkOrderOperationParametersDialogTitle = $translate.instant('picore.titles.addWorkOrderOperationParameterSpecificationToWorkOrderOperation');
            vm.selectedItem = false;

            vm.toolbarLabels = {
                action: {
                    addBtn: $translate.instant('picore.buttonsAndTooltips.addParamRequirementFromCatalog'),
                    deleteBtn: $translate.instant('picore.buttonsAndTooltips.delete'),
                    editBtn: $translate.instant('picore.buttonsAndTooltips.edit'),
                    saveBtn: $translate.instant('picore.buttonsAndTooltips.save'),
                    cancelBtn: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    switchViewBtn: $translate.instant('picore.buttonsAndTooltips.switchView')
                }
            };

            vm.toolbarButtons = [
				{
				    icon: 'fa-plus',
				    cmdIcon: 'Add',
				    name: 'add',
				    label: vm.toolbarLabels.action.addBtn,
				    visibility: vm.toolbarVisible ,
				    onClickCallback: vm.onActionClicked
				},
                {
                    icon: 'fa-pencil',
                    cmdIcon: 'Edit',
                    name: 'edit',
                    label: vm.toolbarLabels.action.editBtn,
                    visibility: vm.selectedItem && vm.toolbarVisible,
                    onClickCallback: vm.onActionClicked
                },
				{
				    icon: 'fa-list-alt',
				    cmdIcon: 'ListBox',
				    name: 'switchView',
				    label: vm.toolbarLabels.action.switchViewBtn,
				    visibility: !vm.inEditMode && vm.toolbarVisible,
				    onClickCallback: vm.onActionClicked
				},
                {
                    icon: 'fa-trash',
                    cmdIcon: 'Trash',
                    name: 'delete',
                    label: vm.toolbarLabels.action.deleteBtn,
                    visibility: vm.selectedItem,
                    onClickCallback: vm.onActionClicked
                },
                {
                    icon: 'fa-floppy-o',
                    cmdIcon: 'Save',
                    name: 'save',
                    label: vm.toolbarLabels.action.saveBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                },
                {
                    icon: 'fa-times',
                    cmdIcon: 'Undo',
                    name: 'cancel',
                    label: vm.toolbarLabels.action.cancelBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                }
            ];

            vm.dataConfig = {
                onPiTableInitialized: function () {
                    vm.dataConfig.applyTableColumnsConfiguration(vm.columnsConfiguration);
                    vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
                    vm.dataConfig.setPager(vm.pageSizes, vm.pageSizeDefault);
                    setEditableColumns();
                },
                onPiSelectionChangeCallback: onPiTableItemSelected
            };

            vm.addWorkOrderOperationParametersButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAddParameterSpecification,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        vm.dialogService.hide();
                    }
                }];

            vm.catalogDataConfig = {
                Headers: [
                    {
                        Key: 'ParameterNId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'ParameterName',
                        DisplayName: $translate.instant('picore.headers.tables.name')
                    },
                    {
                        Key: 'ParameterDescription',
                        DisplayName: $translate.instant('picore.headers.tables.description')
                    },
                    {
                        Key: 'ParameterType',
                        DisplayName: $translate.instant('picore.headers.tables.type')
                    },
                    {
                        Key: 'ParameterLimitLow',
                        DisplayName: $translate.instant('picore.headers.tables.limitLow')
                    },
                    {
                        Key: 'ParameterToleranceLow',
                        DisplayName: $translate.instant('picore.headers.tables.toleranceLow')
                    },
                    {
                        Key: 'ParameterTargetValue',
                        DisplayName: $translate.instant('picore.headers.tables.tv')
                    },
                    {
                        Key: 'ParameterToleranceHigh',
                        DisplayName: $translate.instant('picore.headers.tables.toleranceHigh')
                    },
                    {
                        Key: 'ParameterLimitHigh',
                        DisplayName: $translate.instant('picore.headers.tables.limitHigh')
                    },
                    {
                        Key: 'ParameterUoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                ],
                onPiSelectionChangeCallback: onPiCatalogTableListItemSelected
            };

            initTableData();
            initCatalogTableData();
        }

        function initTableData() {
            var WorkOrderOperation_Id_empty = '00000000-0000-0000-0000-000000000000';
            vm.tableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'WorkOrderOperationParameterSpecification',
                    optionsString: '$filter=WorkOrderOperation_Id eq ' + WorkOrderOperation_Id_empty
                },
                selectionMode: 'single'
            };

            $scope.$watch('vm.workOrderOperationId', function (newValue) {
                var options;// = '';
                if (vm.selectedItem) {
                    vm.isItemSelected = false;
                }
                if (newValue) {
                    if (vm.inEditMode) {
                        vm.overlay = {
                            text: $translate.instant('picore.notifications.warnings.missingPendingChange'),
                            title: $translate.instant('picore.titles.warningTitle'),
                            buttons: [{
                                id: 'okButton',
                                displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                                onClickCallback: function () {
                                    removeOverlay();
                                }
                            }]
                        };
                        messageOverlay.set(vm.overlay);
                        displayOverlay();
                    }

                    showActionButtons(true);
                    options = '$filter=WorkOrderOperation_Id eq ' + vm.workOrderOperationId;
                    vm.tableConfig.dataSource.optionsString = options;
                    if (vm.dataConfig && vm.dataConfig.applyTableOptionsStringConfiguration) {
                        vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
                    }
                    if (vm.tableConfig.refreshData) {
                        vm.tableConfig.refreshData();
                    }
                    $timeout(function () {
                        vm.tableConfig.getSettings().selectedRows = [];
                    }
                    );

                    $scope.$watch('vm.tableConfig.getSettings().pagination.totalItemCount', function (newCountValue) {
                        if (newCountValue > 0) {
                            vm.NoData = false;
                            if (!vm.workOrderOperationIsFrozen) {
                                showEditButton(true);
                                showAddButton(true);
                            }
                        } else {
                            vm.NoData = true;
                            showEditButton(false);
                        }
                    }, true
                    );
                } else {
                    options = '$filter=WorkOrderOperation_Id eq ' + WorkOrderOperation_Id_empty;
                    vm.tableConfig.dataSource.optionsString = options;
                    if (vm.dataConfig && vm.dataConfig.applyTableOptionsStringConfiguration) {
                        vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
                    }
                    if (vm.tableConfig.refreshData) {
                        vm.tableConfig.refreshData();
                    }
                    vm.NoData = true;
                    showAddButton(false);
                    showEditButton(false);
                    showDeleteButton(false);
                }
            }, true
            );
        }

        function initCatalogTableData() {
            vm.catalogTableFields = {
                'ParameterNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.nId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'ParameterName': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.name'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterDescription': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.description'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterType': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.type'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterLimitLow': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.limitLow'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterToleranceLow': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.toleranceLow'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterTargetValue': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.tv'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterToleranceHigh': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.toleranceHigh'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterLimitHigh': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.limitHigh'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'ParameterUoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };

            vm.catalogTableConfig = {
                data: [],
                dataSource: {
                    dataService: commonService,
                    appName: 'PICore',
                    dataEntity: 'ParametersCatalogue'
                },
                selectionMode: 'multi',
                fields: vm.catalogTableFields,
                pageSizes: [5, 10, 25],
                pageSizeDefault: 10
            };
        }

        function initDialogData() {
            vm.addWorkOrderOperationParametersTemplate = 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderOperationParamList/add-wo-operation-param-dialog-from-catalog.html';
            vm.addWorkOrderOperationParametersData = {
                'catalogTableConfig': vm.catalogTableConfig,
                'catalogDataConfig': vm.catalogDataConfig,
                'dialogTranslatedNoData': $translate.instant('picore.labels.noData'),
                'NoCatalogData': vm.NoCatalogData
            };
        }

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm.setWorkOrderOperationId = setWorkOrderOperationId;
            vm.setWorkOrderOperationNId = setWorkOrderOperationNId;
            vm.setActionBarVisibility = setActionBarVisibility;
            vm.onActionClicked = onActionClicked;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
        }

        function hideTitle() {
            vm.isComponentTitleVisible = false;
        }

        function registerEvents() {
            $scope.$on('$destroy', deregisterEvents);
        }

        function deregisterEvents() {
            signalManagerService.destroyConnections();
        }

        function onComponentReady(compInstance) {
            logger.logDebug('Component ready');
            if (compInstance && compInstance.properties) {
                if (compInstance.properties.Properties) {
                    vm.columnsConfiguration = compInstance.properties.Properties.get();
                }

                if (compInstance.properties.EntityNames) {
                    vm.navigationProperties = compInstance.properties.EntityNames.get();
                }

                if (compInstance.properties.FacetNames) {
                    vm.facetFullNames = compInstance.properties.FacetNames.get();
                }

                if (compInstance.properties.PageSizeDefault) {
                    vm.pageSizeDefault = compInstance.properties.PageSizeDefault.get();
                }

                if (compInstance.properties.PageSizes) {
                    vm.pageSizes = compInstance.properties.PageSizes.get();
                }

                if (compInstance.properties.IsTitleVisible) {
                    vm.isComponentTitleVisible = compInstance.properties.IsTitleVisible.get();
                }

                if (vm.dataConfig && vm.dataConfig.applyTableColumnsConfiguration && vm.dataConfig.applyTableOptionsStringConfiguration && vm.dataConfig.setPager) {
                    vm.dataConfig.applyTableColumnsConfiguration(vm.columnsConfiguration);
                    vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
                    vm.dataConfig.setPager(vm.pageSizes, vm.pageSizeDefault);
                    setEditableColumns();
                }
            }
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }

        /**
        * @ngdoc method
        * @name setWorkOrderOperationId
        *
        * @description
        * Sets the WorkOrderOperation identifier for which the work order operations parameters are to be displayed.
        *
        * @param {string} workOrderOperationId the identifier of the given work order operation.
        */
        function setWorkOrderOperationId(workOrderOperationId) {
            vm.workOrderOperationId = workOrderOperationId;
            if (vm.workOrderOperationId) {
                resetActionsVisibility();
                dataService.getByIdAndExpand(vm.workOrderOperationId, 'WorkOrder').then(onGetWOOperationSuccess, onGetWOOperationError);
            }
        }
        function setWorkOrderOperationNId(workOrderOperationNId) {
            dataService.getAll('$filter=NId eq %27' + workOrderOperationNId + '%27&$expand=WorkOrder').then(onGetWOOperationByNIdSuccess, onGetWOOperationError);
        }

        function updateParamListData(workOrderNId,workOrderOperationNId) {
            dataService.getAll('$filter=(NId eq %27' + workOrderOperationNId + '%27 and WorkOrder/NId eq %27' + workOrderNId + '%27)&$expand=WorkOrder').then(onGetWOOperationByNIdSuccess, onGetWOOperationError);
        }

        function onGetWOOperationSuccess(data) {
            if (data.value.length === 1) {
                vm.workOrderOperationNId = data.value[0].NId;
                vm.workOrderOperationIsFrozen = data.value[0].IsFrozen;
                if (vm.workOrderOperationIsFrozen) {
                    showAddButton(false);
                    showEditButton(false);
                }
            }
        }

        function onGetWOOperationByNIdSuccess(data) {
            if (data.value.length === 1) {
                vm.workOrderOperationNId = data.value[0].NId;
                vm.workOrderOperationId = data.value[0].Id;
                vm.workOrderOperationIsFrozen = data.value[0].IsFrozen;
                if (vm.workOrderOperationId) {
                    resetActionsVisibility();
                    dataService.getByIdAndExpand(vm.workOrderOperationId, 'WorkOrder').then(onGetWOOperationSuccess, onGetWOOperationError);
                }
                if (vm.workOrderOperationIsFrozen) {
                    showAddButton(false);
                    showEditButton(false);
                }
            }
        }

        function onGetWOOperationError(reason) {
            logger.logErr('Error on getting Work Order Operation', reason);
        }

        /**
         * @ngdoc method
         * @name setActionBarVisibility
         *
         * @description
         * Sets the visibility of the action bar.
         *
         * @param {bool} isActionBarVisible the value configuring the command bar visibility.
         */
        function setActionBarVisibility(isActionBarVisible) {
            if (isActionBarVisible !== undefined && isActionBarVisible !== null) {
                vm.isActionBarHide = !isActionBarVisible;
                vm.toolbarVisible = isActionBarVisible;
            }
        }

        function onActionClicked(commandName) {
            switch (commandName) {
                case 'add':
                    onAdd();
                    break;
                case 'delete':
                    onDelete();
                    break;
                case 'edit':
                    onEdit();
                    break;
                case 'save':
                    onSave();
                    break;
                case 'switchView':
                    onSwitchView();
                    break;
                case 'cancel':
                    onRollback();
                    break;
            }
        }

        function onAdd() {
            var globalDialog = {
                title: vm.addWorkOrderOperationParametersDialogTitle,
                templatedata: vm.addWorkOrderOperationParametersData,
                templateuri: vm.addWorkOrderOperationParametersTemplate,
                buttons: vm.addWorkOrderOperationParametersButtonsList
            };
            vm.dialogService.set(globalDialog);
            vm.dialogService.show();
        }

        function onAddParameterSpecification() {
            bulkOverlay = false;
            if (vm.OperationParameterSpecifications.length > 0) {
                dataService.addParameterRequirementsToWorkOrderOperationFromCatalog({
                    WorkOrderOperationId: vm.workOrderOperationId, ProcessParameters: vm.OperationParameterSpecifications
                }).then(onAddParameterSpecificationSuccess, onAddParError);
                vm.dialogService.hide();
            } else {
                vm.dialogService.hide();
                vm.OperationParameterSpecifications = [];
            }
        }

        function onAddParError(reason) {
            logger.logErr('Error creating parameter requirements from catalog', reason);
        }

        function onAddParameterSpecificationSuccess() {
            if (bulkOverlay) {
                if (stringFailedParams.endsWith(', ')) {
                    stringFailedParams = stringFailedParams.substring(0, stringFailedParams.lastIndexOf(', ')) + '.';
                }
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorAddWorkOrderParametersBulk') + ' ' + stringFailedParams,
                    title: $translate.instant('picore.titles.errorAddWorkOrderParametersBulkTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            stringFailedParams = '\n';
                            removeOverlay();
                        }
                    }]
                };
                messageOverlay.set(vm.overlay);
                displayOverlay();
            }
            vm.tableConfig.refreshData();
            vm.dialogService.hide();
            vm.OperationParameterSpecifications = [];
        }

        function onPiTableItemSelected(list, item) {
            if (item) {
                vm.isItemSelected = true;
                vm.selectedItem = item;
                if (!vm.selectedItem.IsLocked) {
                    if (!vm.inEditMode) {
                        vm.toolbarButtons[1].visibility = vm.toolbarVisible && !vm.workOrderOperationIsFrozen ;
                        vm.toolbarButtons[3].visibility = vm.toolbarVisible && !vm.workOrderOperationIsFrozen ;
                    }
                }
            } else {
                vm.isItemSelected = false;
                resetActionsVisibility();
            }
        }

        function resetActionsVisibility() {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                showDeleteButton(false);
            }
        }

        function showActionButtons(visibility) {
            if (vm.toolbarVisible && !vm.workOrderOperationIsFrozen) {
                showEditButton(visibility);
                showAddButton(visibility);
                showSaveButton(!visibility);
                showCancelButton(!visibility);
                vm.inEditMode = false;
                vm.dataConfig.setCellReadOnly();
            }
        }

        function onPiCatalogTableListItemSelected(list, item) {
            if (list) {
                vm.isItemSelected = true;
                vm.selectedCatalogItems = item;
                vm.addWorkOrderOperationParametersButtonsList[0].disabled = false;
                onCatalogParameterSelected(list);
            } else {
                vm.OperationParameterSpecifications = [];
                vm.addWorkOrderOperationParametersButtonsList[0].disabled = true;
            }
        }

        function onCatalogParameterSelected(catalogParameters) {
            if (catalogParameters) {
                for (var i = 0; i < catalogParameters.length; i++) {
                    vm.OperationParameterSpecifications[i] = {
                        ParameterNId: catalogParameters[i].ParameterNId,
                        ParameterTargetValue: catalogParameters[i].ParameterTargetValue,
                        ParameterLimitLow: catalogParameters[i].ParameterLimitLow,
                        ParameterToleranceLow: catalogParameters[i].ParameterToleranceLow,
                        ParameterToleranceHigh: catalogParameters[i].ParameterToleranceHigh,
                        ParameterLimitHigh: catalogParameters[i].ParameterLimitHigh,
                        IsLimitsInPercentage: catalogParameters[i].IsLimitsInPercentage,
                        ParameterUoMNId: catalogParameters[i].ParameterUoMNId
                    };
                }
            }
        }

        function displayOverlay() {
            messageOverlay.show();
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function onDelete() {
            if (vm.selectedItem) {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmDeleteText'),
                    title: $translate.instant('picore.titles.deleteTitle'),
                    buttons: [{
                        id: 'cancelButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                        onClickCallback: function () {
                            removeOverlay();
                        }
                    }, {
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                        onClickCallback: function () {
                            if (vm.selectedItem) {
                                dataService.deleteWorkOrderOperationParameterSpecification(vm.selectedItem.Id).then(onDeleteCompleted, onDeleteFailed);
                            }
                            removeOverlay();
                            showDeleteButton(false);
                        }
                    }]
                };
            } else {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.confirmationsAndMessages.deleteSelectionText'),
                    title: $translate.instant('picore.titles.errorTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            removeOverlay();
                        }
                    }]
                };
            }

            messageOverlay.set(vm.overlay);
            displayOverlay();
        }

        function onDeleteCompleted(data) {
            if (data) {
                vm.selectedItem = null;
                vm.tableConfig.refreshData();
            }
        }

        function onDeleteFailed(reason) {
            logger.logErr('Unable to delete operations parameter specification.', reason);
        }

        function findAll(serverDataOptions) {
            var queryModel = {};
            queryModel.appName = serverDataOptions.appName;
            queryModel.entityName = serverDataOptions.entityName;
            var newOptions = '';
            var countFilterOccurances = serverDataOptions.options !== undefined && serverDataOptions.options.split('$filter=') !== undefined
                ? (serverDataOptions.options.split('$filter=').length - 1)
                : 0;
            if (countFilterOccurances > 1) {
                var array = serverDataOptions.options.split('&');
                var filter;
                for (var i = 0; i < array.length; i++) {
                    if ((array[i].split('$filter=').length - 1) > 0) {
                        if (filter === undefined) {
                            var filterToAppend = array[i].split('$filter=')[1];
                            if (filterToAppend !== undefined) {
                                filter = '$filter=' + '(' + filterToAppend + ')';
                            }
                            else
                                filter = array[i];
                            delete array[i];
                        } else {
                            filter += ' and ' + array[i].substr(8, array[i].length);
                            delete array[i];
                        }
                    }
                }
                array.push(filter);
                angular.forEach(array, function (value) {
                    newOptions += value + '&';
                });
                newOptions = newOptions.substring(0, newOptions.length - 1);

            } else {
                if (countFilterOccurances !== 0) {
                    newOptions = serverDataOptions.options;
                }
            }
            queryModel.options = newOptions ? newOptions : serverDataOptions.options;
            var deffer = $q.defer();
            if (vm.tableConfig.getSettings) {
                var filters = vm.tableConfig.getSettings().filter !== undefined ? vm.tableConfig.getSettings().filter.predicateObject : undefined;
                queryModel.options = commonService.parseFilter(queryModel.options, filters);
            }

            backendService.findAll(queryModel).then(function (data) {
                vm.data = data.value;
                for (var i = 0; i < vm.data.length; i++) {
                    vm.data[i].isSelected = null;
                }
                var dataObj = {};
                dataObj.value = vm.data;
                dataObj.currentPage = 0;
                dataObj.count = data.count;
                vm.showEdit = data.value.length > 0;
                deffer.resolve(dataObj);
            }).catch(function (err) {
                deffer.reject(err);
            });
            return deffer.promise;
        }

        function onSwitchView() {
            //set columns not visible
            if (!vm.HideColumns) {
                //secondary view
                vm.columnsConfiguration.forEach(function (column) {
                    if (column.PropertyName === 'ParameterLimitLow'
                        || column.PropertyName === 'ParameterLimitHigh'
                        || column.PropertyName === 'ParameterToleranceLow'
                        || column.PropertyName === 'ParameterToleranceHigh') {
                        column.IsVisible = false;
                    } else {
                        column.IsVisible = true;
                    }
                });
                vm.HideColumns = true;
            } else {
                //standard view
                vm.columnsConfiguration.forEach(function (column) {
                    if (column.PropertyName === 'ParameterType'
                        || column.PropertyName === 'TaskParameterNId'
                        || column.PropertyName === 'WorkProcessVariableNId'
                        || column.PropertyName === 'TraceChangeDetails') {
                        column.IsVisible = false;
                    } else {
                        column.IsVisible = true;
                    }
                });
                vm.HideColumns = false;
            }

            vm.dataConfig.applyTableColumnsConfiguration(vm.columnsConfiguration);
            vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
            setEditableColumns();
            if (vm.tableConfig.refreshData) {
                vm.tableConfig.refreshData();
            }
            $timeout(function () {
                vm.tableConfig.getSettings().selectedRows = [];
            });
        }

        function onEdit() {
            showEditButton(false);
            showAddButton(false);
            showSaveButton(true);
            showCancelButton(true);
            showDeleteButton(false);
            showToggleButton(false);
            vm.inEditMode = true;
            vm.dataConfig.setCellEdit();
        }

        function onRollback() {
            vm.overlay = {
                text: errorInPreviousBulkEdit === true
                    ? $translate.instant('picore.notifications.confirmationsAndMessages.confirmParameterTargetValueRollBackText')
                    : $translate.instant('picore.notifications.confirmationsAndMessages.confirmParameterTargetValueRollBackNoChangeText'),
                title: $translate.instant('picore.titles.confirmCancelBulkTitle'),
                buttons: [{
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                    onClickCallback: function () {
                        showEditButton(true);
                        showAddButton(true);
                        showSaveButton(false);
                        showCancelButton(false);
                        showToggleButton(true);
                        showDeleteButton(vm.isItemSelected);
                        vm.inEditMode = false;
                        vm.dataConfig.setCellReadOnly();
                        vm.tableConfig.refreshData();
                        removeOverlay();
                    }
                }, {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                    onClickCallback: function () {
                        removeOverlay();
                        errorInPreviousBulkEdit = false;
                    }
                }]
            };
            messageOverlay.set(vm.overlay);
            displayOverlay();
        }

        function onSave() {
            bulkOverlay = false;
            showAddButton(false);
            var deferred = $q.defer();
            var list = [];
            for (var i = 0; i < vm.data.length; i++) {
                list.push({
                    Id: vm.data[i].Id,
                    ParameterValue: vm.data[i].ParameterTargetValue,
                    ParameterLimitLow: vm.data[i].ParameterLimitLow,
                    ParameterToleranceLow: vm.data[i].ParameterToleranceLow,
                    ParameterToleranceHigh: vm.data[i].ParameterToleranceHigh,
                    ParameterLimitHigh: vm.data[i].ParameterLimitHigh,
                    ParameterActualValue: vm.data[i].ParameterActualValue,
                    EquipmentNId: (vm.data[i].EquipmentNId == null || vm.data[i].EquipmentNId == undefined) ? '' : vm.data[i].EquipmentNId,
                    ParameterNId: vm.data[i].ParameterNId,
                    WorkProcessVariableNId: vm.data[i].WorkProcessVariableNId,
                    TaskParameterNId: vm.data[i].TaskParameterNId
                });
            }

            dataService.updateProcessParameterToWorkOrderOperation(list).then(onSaveItemsSuccess).error(errorOnSomeParam);
            return deferred.promise;
        }

        function errorOnSomeParam(reason) {
            logger.logErr('------', reason.config.data.ParameterValue);
            stringFailedParams = '\n';
            for (var i = 0; i < vm.data.length; i++) {
                if (vm.data[i].Id === reason.config.data.Id) {
                    var obj = { nid: vm.data[i].ParameterNId, value: reason.config.data.ParameterValue };
                    stringFailedParams += obj.nid + ', ';
                }
            }
            bulkOverlay = true;
            onSaveItemsSuccess();
        }

        function onSaveItemsSuccess() {
            if (bulkOverlay) {
                if (stringFailedParams.endsWith(', ')) {
                    stringFailedParams = stringFailedParams.substring(0, stringFailedParams.lastIndexOf(', ')) + '.';
                }
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorBulk') + ' ' + stringFailedParams,
                    title: $translate.instant('picore.titles.errorBulkTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            stringFailedParams = '\n';
                            removeOverlay();
                            errorInPreviousBulkEdit = true;
                            showEditButton(false);
                            showAddButton(false);
                            showSaveButton(true);
                            showCancelButton(true);
                            showDeleteButton(false);
                        }
                    }]
                };
                messageOverlay.set(vm.overlay);
                displayOverlay();
            } else {
                showEditButton(true);
                showAddButton(true);
                showSaveButton(false);
                showCancelButton(false);
                showToggleButton(true);
                showDeleteButton(vm.isItemSelected);
                vm.inEditMode = false;
                errorInPreviousBulkEdit = false;
                vm.dataConfig.setCellReadOnly();
            }
        }

        function showEditButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(1, visible);
            }
        }

        function showDeleteButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(3, visible);
            }
        }

        function showAddButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(0, visible);
            }
        }

        function showSaveButton(visible) {
            vm.dataConfig.setButtonVisible(4, visible);
        }

        function showCancelButton(visible) {
            vm.dataConfig.setButtonVisible(5, visible);
        }

        function showToggleButton(visible) {
            vm.dataConfig.setButtonVisible(2, visible);
        }

        function setEditableColumns() {
            if (vm.dataConfig.Headers !== undefined && vm.dataConfig.Headers !== null && vm.dataConfig.Headers.length > 0) {
                for (var i = 0; i < vm.dataConfig.Headers.length; i++) {
                    if (vm.dataConfig.Headers[i].Key === 'ParameterLimitLow' || vm.dataConfig.Headers[i].Key === 'ParameterToleranceLow'
                        || vm.dataConfig.Headers[i].Key === 'ParameterTargetValue' || vm.dataConfig.Headers[i].Key === 'ParameterToleranceHigh'
                        || vm.dataConfig.Headers[i].Key === 'ParameterLimitHigh' || vm.dataConfig.Headers[i].Key === 'ParameterActualValue' || vm.dataConfig.Headers[i].Key === 'EquipmentNId') {
                        vm.dataConfig.Headers[i].IsEditable = true;
                    }
                }
            }
        }
    }
})();