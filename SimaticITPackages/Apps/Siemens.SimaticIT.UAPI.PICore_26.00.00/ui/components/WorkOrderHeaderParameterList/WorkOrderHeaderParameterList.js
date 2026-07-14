/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('workorderheaderparameterlist', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                onRegisterApi: '&'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderHeaderParameterList/WorkOrderHeaderParameterList.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
    * Component controller for Work Order Header Parameter List
    * @constructor
    * @ngdoc object
    * @name ComponentController
    * @scope
    * @requires $scope {service} $scope
    * @requires $timeout {service} $timeout
    * @requires loggerService {service} common.services.logger.service
    * @requires base {service} common.base
    * @requires dataService {service} Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersService
    * @requires workOrderService {service} Siemens.SimaticIT.UAPI.PICore.WorkOrderService
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
        'Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersService',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderService',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.widgets.messageOverlay.service',
        '$translate',
        'common.widgets.globalDialog.service',
        '$q'];
    function ComponentController($rootScope,
        $scope,
        $timeout,
        loggerService,
        uiComponentService,
        base,
        dataService,
        workOrderService,
        commonService,
        messageOverlay,
        $translate,
        dialogService,
        $q) {
        var vm = this;
        var workOrderEmpty = '00000000-0000-0000-0000-000000000000';
        var logger;
        var stringFailedParams = '\n';
        var bulkOverlay = false;
        var errorInPreviousBulkEdit = false;
        vm.dialogService = dialogService;
        vm.isItemSelected = false;
        vm.toolbarVisible = vm.isActionBarHide ? !vm.isActionBarHide : true;
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
        vm.translatedNoData = $translate.instant('picore.labels.noData');

        vm.isComponentTitleVisible = true;
        vm.HideColumns = false;
        vm.isContextNeeded = false;
        vm.pageSizes = [5, 10, 30, 50];
        vm.pageSizeDefault = 5;
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
            logger = loggerService.getModuleLogger('workorderheaderparameterlist');
            init();
            initDialogData();
            exposeApi();
            vm.api = {
                setWorkOrderId: setWorkOrderId,
                hideTitle: hideTitle
            };
            if (vm.onRegisterApi) {
                vm.onRegisterApi({ api: vm.api });
            }
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.workOrderHeaderParameterListComponentTitle = $translate.instant('picore.titles.workOrderHeaderParameterListComponentTitle');
            vm.selectedItem = false;

            vm.toolbarLabels = {
                action: {
                    addBtn: $translate.instant('picore.buttonsAndTooltips.addParamFromCatalog'),
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
                    visibility: vm.toolbarVisible,
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

            vm.addWorkOrderHeaderParametersButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAddHeaderParameter,
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
                //put & at the beginning of the first element newOptions = array.join('&');
                angular.forEach(array, function (value) {
                    newOptions += value + '&';
                });
                newOptions = newOptions.substring(0, newOptions.length - 1);

            } else {
                if (countFilterOccurances !== 0) {
                    newOptions = serverDataOptions.options;
                }
            }
            if (vm.tableConfig.getSettings) {
                var filters = vm.tableConfig.getSettings().filter !== undefined ? vm.tableConfig.getSettings().filter.predicateObject : undefined;
                serverDataOptions.options = commonService.parseFilter(newOptions, filters);
            }
            queryModel.options = serverDataOptions.options;
            var deffer = $q.defer();
            backendService.findAll(queryModel).then(function (data) {
                vm.data = data.value;
                for (var i = 0; i < vm.data.length; i++) {
                    vm.data[i].isSelected = null;
                }
                var dataObj = {};
                dataObj.value = vm.data;
                dataObj.currentPage = 0;
                dataObj.count = data.count;

                deffer.resolve(dataObj);
            }).catch(function (err) {
                deffer.reject(err);
            });
            return deffer.promise;
        }

        function initTableData() {
            vm.tableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'WorkOrderHeaderParameter',
                    optionsString: '$filter=WorkOrder_Id eq ' + workOrderEmpty
                },
                selectionMode: 'single'
            };

            $scope.$watch('vm.workOrderId', function (newValue) {
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
                    if (vm.dataConfig.setCellReadOnly) {
                        vm.dataConfig.setCellReadOnly();
                    }
                    vm.inEditMode = false;
                    $timeout(function () {
                        showActionButtons(true);
                        vm.tableConfig.dataSource.optionsString = '$filter=WorkOrder_Id eq ' + vm.workOrderId;
                        if (vm.dataConfig && vm.dataConfig.applyTableOptionsStringConfiguration) {
                            vm.dataConfig.applyTableOptionsStringConfiguration(vm.navigationProperties, vm.facetFullNames, vm.columnsConfiguration);
                        }
                        if (vm.tableConfig.refreshData) {
                            vm.tableConfig.refreshData();
                        }
                        if (vm.tableConfig && vm.tableConfig.getSettings()) {
                            vm.tableConfig.getSettings().selectedRows = [];
                        }
                    }
                    );
                } else {
                    options = '$filter=WorkOrder_Id eq ' + workOrderEmpty;
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
            vm.addWorkOrderHeaderParametersTemplate = 'Siemens.SimaticIT.UAPI.PICore/components/WorkOrderHeaderParameterList/add-wo-header-param-dialog-from-catalog.html';
            vm.addWorkOrderHeaderParametersData = {
                'catalogTableConfig': vm.catalogTableConfig,
                'catalogDataConfig': vm.catalogDataConfig,
                'dialogTranslatedNoData': $translate.instant('picore.labels.noData'),
                'NoCatalogData': vm.NoCatalogData
            };
        }

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
            vm.setWorkOrderId = setWorkOrderId;
            vm.hideTitle = hideTitle;
            vm.setActionBarVisibility = setActionBarVisibility;
            vm.onActionClicked = onActionClicked;
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
        * @name setWorkOrderId
        *
        * @description
        * Sets the work order id whose header parameters have to be shown.
        *
        * @param {string} workOrderId the identifier of the given work order.
        */
        function setWorkOrderId(workOrderId) {
            vm.workOrderId = workOrderId;
            if (vm.workOrderId) {
                resetActionsVisibility();
                workOrderService.getById(workOrderId).then(OnGetWOSuccess, function (reason) {
                    logger.logErr('Error getting Work Order.', reason);
                });
            }
        }

        function hideTitle() {
            vm.isComponentTitleVisible = false;
        }

        function OnGetWOSuccess(result) {
            if (result && result.value && result.value.length === 1) {
                vm.isWorkOrderFrozen = result.value[0].IsFrozen;
            }
            if (vm.workOrderId) {
                resetActionsVisibility();
            }
            if (vm.isWorkOrderFrozen) {
                showAddButton(false);
                showEditButton(false);
            }
            $scope.$watch('vm.tableConfig.getSettings().pagination.totalItemCount', function (count) {
                if (count > 0) {
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
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
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

        /**
         * @ngdoc method
         * @name onActionClicked
         *
         * @description
         * Manage the click on the action bar
         *
         * @param {string} commandName the name of the the command.
         */
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
                title: $translate.instant('picore.titles.addParameterFromCatalog'),
                templatedata: vm.addWorkOrderHeaderParametersData,
                templateuri: vm.addWorkOrderHeaderParametersTemplate,
                buttons: vm.addWorkOrderHeaderParametersButtonsList
            };
            vm.dialogService.set(globalDialog);
            vm.dialogService.show();
        }

        function onAddHeaderParameter() {
            bulkOverlay = false;
            if (vm.HeaderParameters.length > 0) {
                dataService.addProcessParametersToWorkOrderHeader({
                    WorkOrderId: vm.workOrderId, ProcessParameters: vm.HeaderParameters
                }).then(onAddHeaderParameterSuccess, onAddParError);
                vm.dialogService.hide();
            } else {
                vm.dialogService.hide();
                vm.HeaderParameters = [];
            }
        }

        function onAddParError(reason) {
            logger.logErr('Error creating parameter requirements from catalog', reason);
        }

        function onAddHeaderParameterSuccess() {
            if (bulkOverlay) {
                messageOverlay.set(vm.overlay);
                displayOverlay();
            }
            vm.tableConfig.refreshData();
            vm.dialogService.hide();
            vm.HeaderParameters = [];
        }

        function onPiTableItemSelected(list, item) {
            if (item) {
                vm.isItemSelected = true;
                vm.selectedItem = item;
                if (!vm.selectedItem.IsLocked) {
                    if (!vm.inEditMode) {
                        vm.toolbarButtons[1].visibility = vm.toolbarVisible && !vm.isWorkOrderFrozen;
                        vm.toolbarButtons[3].visibility = vm.toolbarVisible && !vm.isWorkOrderFrozen;
                    }
                }
            } else {
                vm.isItemSelected = false;
                resetActionsVisibility();
            }
        }

        function resetActionsVisibility() {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                showActionButtons(true);
                showDeleteButton(false);
            }
        }

        function showActionButtons(visibility) {
            if (vm.toolbarVisible && !vm.isWorkOrderFrozen) {
                showEditButton(visibility);
                showAddButton(visibility);
                showSaveButton(!visibility);
                showCancelButton(!visibility);
                vm.inEditMode = false;
                if (vm.dataConfig && vm.dataConfig.setCellReadOnly) {
                    vm.dataConfig.setCellReadOnly();
                }
            }
        }

        function onPiCatalogTableListItemSelected(list, item) {
            if (list) {
                vm.isItemSelected = true;
                vm.selectedCatalogItems = item;
                vm.addWorkOrderHeaderParametersButtonsList[0].disabled = false;
                onCatalogParameterSelected(list);
            } else {
                vm.HeaderParameters = [];
                vm.addWorkOrderHeaderParametersButtonsList[0].disabled = true;
            }
        }

        function onCatalogParameterSelected(catalogParameters) {
            if (catalogParameters) {
                for (var i = 0; i < catalogParameters.length; i++) {
                    vm.HeaderParameters[i] = {
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
                                dataService.deleteWorkOrderHeaderParameter(vm.selectedItem.Id).then(onDeleteCompleted, onDeleteFailed);
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

        function onSave() {
            bulkOverlay = false;
            showAddButton(false);
            var deferred = $q.defer();
            var calls = [];
            for (var i = 0; i < vm.data.length; i++) {
                calls.push(dataService
                    .UpdateProcessParameterToWorkOrderHeader({
                        Id: vm.data[i].Id,
                        ParameterTargetValue: vm.data[i].ParameterTargetValue,
                        ParameterLimitLow: vm.data[i].ParameterLimitLow,
                        ParameterToleranceLow: vm.data[i].ParameterToleranceLow,
                        ParameterToleranceHigh: vm.data[i].ParameterToleranceHigh,
                        ParameterLimitHigh: vm.data[i].ParameterLimitHigh,
                        ParameterActualValue: vm.data[i].ParameterActualValue
                    })
                    .catch(errorOnSomeParam));
            }
            $q.all(calls).then(onSaveItemsSuccess);
            return deferred.promise;
        }

        function errorOnSomeParam(reason) {
            logger.logErr('------', reason.config.data.ParameterTargetValue);
            stringFailedParams = '\n';
            for (var i = 0; i < vm.data.length; i++) {
                if (vm.data[i].Id === reason.config.data.Id) {
                    var obj = { nid: vm.data[i].ParameterNId, value: reason.config.data.ParameterTargetValue };
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
                    text: $translate.instant('picore.notifications.errors.errorBulk') + '\n ' + stringFailedParams,
                    title: $translate.instant('picore.titles.errorBulkTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            stringFailedParams = [];
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

        function showEditButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(1, visible && !vm.isWorkOrderFrozen);
            }
        }

        function showDeleteButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(3, visible && !vm.isWorkOrderFrozen);
            }
        }

        function showAddButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(0, visible && !vm.isWorkOrderFrozen);
            }
        }

        function showSaveButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(4, visible);
            }
        }

        function showCancelButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(5, visible);
            }
        }

        function showToggleButton(visible) {
            if (vm.dataConfig && vm.dataConfig.setButtonVisible) {
                vm.dataConfig.setButtonVisible(2, visible);
            }
        }

        function setEditableColumns() {
            if (vm.dataConfig.Headers !== undefined && vm.dataConfig.Headers !== null && vm.dataConfig.Headers.length > 0) {
                for (var i = 0; i < vm.dataConfig.Headers.length; i++) {
                    if (vm.dataConfig.Headers[i].Key === 'ParameterLimitLow' || vm.dataConfig.Headers[i].Key === 'ParameterToleranceLow'
                        || vm.dataConfig.Headers[i].Key === 'ParameterTargetValue' || vm.dataConfig.Headers[i].Key === 'ParameterToleranceHigh'
                        || vm.dataConfig.Headers[i].Key === 'ParameterLimitHigh' || vm.dataConfig.Headers[i].Key === 'ParameterActualValue') {
                        vm.dataConfig.Headers[i].IsEditable = true;
                    } else {
                        vm.dataConfig.Headers[i].IsEditable = false;
                    }
                }
            }
        }
    }
})();
