/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('storagehierarchylist', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyList/StorageHierarchyList.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
    * Component controller for Storage Hierarchy Equipment details
    * @constructor
    * @ngdoc object
    * @name ComponentController
    * @scope
    * @requires $rootScope {service} $rootScope
    * @requires $scope {service} $scope
    * @requires loggerService {service} common.services.logger.service
    * @requires uiComponentService {service} common.services.component.uiComponentService
    * @requires $translate {service} translate
    * @requires storageHierarchyService {service} Siemens.SimaticIT.UAPI.PICore.storageHierarchyService
    * @requires commonService {service} Siemens.SimaticIT.UAPI.PICore.commonService
    * @requires base {service} common.base
    * @requires messageOverlay {service} common.widgets.messageOverlay.service
    * @requires dialogService {service} common.widgets.globalDialog.service
    * @requires $q {service} $q
    */
    ComponentController.$inject = ['$rootScope',
        '$scope',
        'common.services.logger.service',
        'common.services.component.uiComponentService',
        '$translate',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'Siemens.SimaticIT.UAPI.PICore.storageHierarchyService',
        'common.base',
        'common.widgets.messageOverlay.service',
        'common.widgets.globalDialog.service',
        '$q'];

    function ComponentController(
        $rootScope,
        $scope,
        loggerService,
        uiComponentService,
        $translate,
        commonService,
        storageHierarchyService,
        base,
        messageOverlay,
        dialogService,
        $q) {
        var vm = this;
        var logger;
        vm.dialogService = dialogService;
        var toBeDestroyed = [];
        var equipmentGraphConfigurationItemSelected = null;
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
        activate();

        function activate() {
            logger = loggerService.getModuleLogger('storagehierarchylist');
            init();
            exposeApi();
            registerEvents();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.isActionBarVisible = vm.isActionBarHide ? !vm.isActionBarHide : true;
            initHeaders();
            initTables();
            initDialogData();
            vm.selectedStorageHierachyId = null;
            vm.selectedStorageHierachy = null;
            vm.storageHierarchyListComponentTitle = $translate.instant('picore.titles.storageHierarchyListComponentTitle');
        }

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm._onComponentDestroy = onComponentDestroy;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
            vm.onStorageHierarchySelected = onStorageHierarchySelected;
            vm.onActionClicked = onActionClicked;
            vm.setActionBarVisibility = setActionBarVisibility;
        }

        function registerEvents() {
            $scope.$on('$destroy', deregisterEvents);
            $rootScope.$on('sit-property-grid.validity-changed', updateValidity);
        }

        function deregisterEvents() {
            for (var i = 0; i < toBeDestroyed.length; i++) {
                toBeDestroyed[i] = null;
            }
        }

        function initHeaders() {
            vm.StorageHierarchyListDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Name',
                        DisplayName: $translate.instant('picore.headers.tables.name')
                    },
                    {
                        Key: 'Description',
                        DisplayName: $translate.instant('picore.headers.tables.description')
                    }
                ],
                onPiSelectionChangeCallback: onStorageHierarchyTableItemSelected
            };

            vm.toolbarLabels = {
                action: {
                    addBtn: $translate.instant('picore.buttonsAndTooltips.add'),
                    deleteBtn: $translate.instant('picore.buttonsAndTooltips.delete'),
                    editBtn: $translate.instant('picore.buttonsAndTooltips.edit'),
                    savteBtn: $translate.instant('picore.buttonsAndTooltips.save'),
                    cancelBtn: $translate.instant('picore.buttonsAndTooltips.cancel')
                }
            };

            vm.StorageHierarchyListToolbarButtons = [
                {
                    icon: 'fa-pencil',
                    name: 'editStorageHierarchy',
                    cmdIcon: 'Edit',
                    label: vm.toolbarLabels.action.editBtn,
                    visibility: vm.selectedStorageHierachyId && !vm.isActionBarHide
                },
                {
                    icon: 'fa-trash',
                    cmdIcon: 'Trash',
                    name: 'deleteStorageHierarchy',
                    label: vm.toolbarLabels.action.deleteBtn,
                    visibility: vm.selectedStorageHierachyId && !vm.isActionBarHide
                },
                {
                    icon: 'fa-plus',
                    cmdIcon: 'Add',
                    name: 'addStorageHierarchy',
                    label: vm.toolbarLabels.action.addBtn,
                    visibility: !vm.isActionBarHide
                }];
        }

        function initTables() {
            vm.storageHierarchyTableFields = {
                'NId': {
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
                'Name': {
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
                'Description': {
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
                }
            };

            vm.StorageHierarchyListTableConfig = {
                data: [],
                dataSource: {
                    dataService: commonService,
                    appName: 'PICore',
                    dataEntity: 'StorageHierarchy',
                    optionsString: ''
                },
                selectionMode: 'single',
                fields: vm.storageHierarchyTableFields,
                pageSizes: [5, 8],
                pageSizeDefault: 5
            };
        }

        function initDialogData() {
            vm.equipmentGraphConfigurationTableFields = {
                'NId': {
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
                'Name': {
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
                'Description': {
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
                }
            };
            //ADD DIALOG
            vm.addStorageHiearchyTitle = $translate.instant('picore.titles.addStorageHiearchyDialogTitle');
            vm.addStorageHierarchyTemplateUri = 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyList/add-storage-hierarchy-dialog.html';
            vm.addStorageHierachyTemplateData = {
                equipmentGraphConfigurationTableConfig: {
                    data: [],
                    dataSource: {
                        dataService: commonService,
                        appName: 'PICore',
                        dataEntity: 'EquipmentGraphConfiguration',
                        optionsString: '$expand=Type&$filter=Type/NId eq %27Hierarchy%27'
                    },
                    selectionMode: 'single',
                    fields: vm.equipmentGraphConfigurationTableFields,
                    pageSizes: [5, 8],
                    pageSizeDefault: 5
                },
                equipmentGraphConfigurationDataConfig: {
                    Headers: [
                        {
                            Key: 'NId',
                            DisplayName: $translate.instant('picore.headers.tables.nId'),
                            IsSortDefault: true
                        },
                        {
                            Key: 'Name',
                            DisplayName: $translate.instant('picore.headers.tables.name')
                        },
                        {
                            Key: 'Description',
                            DisplayName: $translate.instant('picore.headers.tables.description')
                        }
                    ],
                    onPiSelectionChangeCallback: onPiEquipmentGraphConfigurationTableItemSelected
                },
                sequenceProperty: {
                    'Properties': [
                    {
                        id: 'StorageHierarchyNId',
                        label: $translate.instant('picore.headers.propertyGrids.nId'),
                        read_only: false,
                        value: vm.StorageHierarchyNId,
                        widget: 'sit-text',
                        validation: { required: true }
                    }, {
                        id: 'StorageHierarchyName',
                        label: $translate.instant('picore.headers.propertyGrids.name'),
                        read_only: false,
                        value: vm.StorageHierarchyName,
                        widget: 'sit-text'
                    }, {
                        id: 'StorageHierarchyDescription',
                        label: $translate.instant('picore.headers.propertyGrids.description'),
                        read_only: false,
                        value: vm.StorageHierarchyDescription,
                        widget: 'sit-text'
                    }
                    ]
                },
                'addMaterialStorage': $translate.instant('picore.notifications.dialogs.addMaterialStorage')
            };

            vm.addStorageHierarchyButtonsList = [
            {
                id: 'okButton',
                displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                onClickCallback: onAddStorageHierarchyDialog,
                disabled: true
            },
            {
                id: 'cancelButton',
                displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                onClickCallback: function () {
                    resetAddDialogProperties();
                    vm.dialogService.hide();
                }
            }];

            //EDIT DIALOG
            vm.editStorageHiearchyTitle = $translate.instant('picore.titles.editStorageHiearchyDialogTitle');
            vm.editStorageHierarchyTemplateUri = 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyList/edit-storage-hierarchy-dialog.html';
            vm.editStorageHierachyTemplateData = {
                sequenceProperty: {
                    'Properties': [
                    {
                        id: 'StorageHierarchyNId',
                        label: $translate.instant('picore.headers.propertyGrids.nId'),
                        read_only: true,
                        value: vm.StorageHierarchyNId,
                        widget: 'sit-text'
                    }, {
                        id: 'StorageHierarchyName',
                        label: $translate.instant('picore.headers.propertyGrids.name'),
                        read_only: false,
                        value: vm.StorageHierarchyName,
                        widget: 'sit-text'
                    }, {
                        id: 'StorageHierarchyDescription',
                        label: $translate.instant('picore.headers.propertyGrids.description'),
                        read_only: false,
                        value: vm.StorageHierarchyDescription,
                        widget: 'sit-text'
                    }
                    ]
                }
            };

            vm.editStorageHierarchyButtonsList = [
            {
                id: 'okButton',
                displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                onClickCallback: onEditStorageHierarchyDialog
            },
            {
                id: 'cancelButton',
                displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                onClickCallback: function () {
                    vm.dialogService.hide();
                }
            }];
        }

        function onPiEquipmentGraphConfigurationTableItemSelected(list, item) {
            if (item) {
                equipmentGraphConfigurationItemSelected = item;
                vm.addStorageHierarchyButtonsList[0].disabled = vm.addStorageHierachyTemplateData.sequenceProperty.Properties[0].value === undefined;
            } else {
                equipmentGraphConfigurationItemSelected = null;
                vm.addStorageHierarchyButtonsList[0].disabled = true;
            }
        }

        //CREATE
        function onAddStorageHierarchy() {
            var globalDialog = {
                title: vm.addStorageHiearchyTitle,
                templatedata: vm.addStorageHierachyTemplateData,
                templateuri: vm.addStorageHierarchyTemplateUri,
                buttons: vm.addStorageHierarchyButtonsList
            };
            vm.dialogService.set(globalDialog);
            vm.dialogService.show();
        }

        function onAddStorageHierarchyDialog() {
            var param = {
                NId: vm.addStorageHierachyTemplateData.sequenceProperty.Properties[0].value,
                Name: vm.addStorageHierachyTemplateData.sequenceProperty.Properties[1].value,
                Description: vm.addStorageHierachyTemplateData.sequenceProperty.Properties[2].value,
                EquipmentGraphConfigurationNId: equipmentGraphConfigurationItemSelected.NId
            };
            storageHierarchyService.createStorageHierarchy(param).then(onCreateStorageHierarchySuccess, oncCreateStorageHierarchyError);
            vm.dialogService.hide();
        }

        function onCreateStorageHierarchySuccess(data) {
            resetAddDialogProperties();
            vm.StorageHierarchyListTableConfig.refreshData();
        }

        function oncCreateStorageHierarchyError(reason) {
            logger.logErr('Unable to create Material Storage', reason);
        }

        //EDIT functions
        function onEditStorageHierarchy() {
            if (vm.selectedStorageHierachy) {
                vm.editStorageHierachyTemplateData.sequenceProperty.Properties[0].value = vm.selectedStorageHierachy.NId;
                vm.editStorageHierachyTemplateData.sequenceProperty.Properties[1].value = vm.selectedStorageHierachy.Name;
                vm.editStorageHierachyTemplateData.sequenceProperty.Properties[2].value = vm.selectedStorageHierachy.Description;
                var globalDialog = {
                    title: vm.editStorageHiearchyTitle,
                    templatedata: vm.editStorageHierachyTemplateData,
                    templateuri: vm.editStorageHierarchyTemplateUri,
                    buttons: vm.editStorageHierarchyButtonsList
                };
                vm.dialogService.set(globalDialog);
                vm.dialogService.show();
            }
        }

        function onEditStorageHierarchyDialog() {
            var param = {
                Id: vm.selectedStorageHierachyId,
                Name: vm.editStorageHierachyTemplateData.sequenceProperty.Properties[1].value,
                Description: vm.editStorageHierachyTemplateData.sequenceProperty.Properties[2].value
            };
            storageHierarchyService.updateStorageHierarchy(param).then(onUpdateStorageHierarchySuccess, onUpdateStorageHierarchyError);
            vm.dialogService.hide();
        }

        function onUpdateStorageHierarchySuccess(data) {
            resetAddDialogProperties();
            vm.StorageHierarchyListTableConfig.refreshData();
        }

        function onUpdateStorageHierarchyError(reason) {
            logger.logErr('Unable to edit Material Storage', reason);
        }

        //DELETE
        function onDeleteStorageHierarchy() {
            if (vm.selectedStorageHierachy) {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmDeleteText'),
                    title: $translate.instant('picore.titles.deleteTitle'),
                    buttons: [{
                        id: 'cancelButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                        onClickCallback: function () {
                            messageOverlay.hide();
                        }
                    }, {
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                        onClickCallback: function () {
                            storageHierarchyService.deleteStorageHierarchy({ Id: vm.selectedStorageHierachy.Id })
                                .then(deleteStorageHierarchyCompleted, function (reason) {
                                    logger.logErr('Unable to delete Material Storage.', reason);
                                });
                            messageOverlay.hide();
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
                            messageOverlay.hide();
                        }
                    }]
                };
            }
            messageOverlay.set(vm.overlay);
            messageOverlay.show();

        }

        function deleteStorageHierarchyCompleted(data) {
            if (data) {
                vm.selectedStorageHierachy = null;
                vm.selectedStorageHierachyId = null;
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('deleteStorageHierarchy', false);
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('editStorageHierarchy', false);
                if (vm.StorageHierarchyListTableConfig.refreshData) {
                    vm.StorageHierarchyListTableConfig.refreshData();
                }
            }
        }

        function resetAddDialogProperties() {
            vm.addStorageHierachyTemplateData.sequenceProperty.Properties[0].value = undefined;
            vm.addStorageHierachyTemplateData.sequenceProperty.Properties[1].value = undefined;
            vm.addStorageHierachyTemplateData.sequenceProperty.Properties[2].value = undefined;
        }

        function onStorageHierarchyTableItemSelected(list, item) {
            if (item !== undefined && item !== null) {
                onStorageHierarchySelected(item.Id);
                vm.selectedStorageHierachyId = item.Id;
                vm.selectedStorageHierachy = item;
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('deleteStorageHierarchy', !vm.isActionBarHide);
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('editStorageHierarchy', !vm.isActionBarHide);

            } else {
                onStorageHierarchySelected(null);
                vm.selectedStorageHierachyId = null;
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('deleteStorageHierarchy', false);
                vm.StorageHierarchyListDataConfig.setVisibilityByActionName('editStorageHierarchy', false);
            }
        }

        function onActionClicked(commandName) {
            switch (commandName) {
                case 'addStorageHierarchy':
                    onAddStorageHierarchy();
                    break;
                case 'editStorageHierarchy':
                    onEditStorageHierarchy();
                    break;
                case 'deleteStorageHierarchy':
                    onDeleteStorageHierarchy();
                    break;
            }
        }

        /**
         * @ngdoc event
         * @name onStorageHierarchySelected
         * @eventType broadcast on root scope
         * @description Raised when the Storage Hierarchy is selected from the related list.
         *
         * @param {string} StorageHierarchyId The Storage Hierarchy unique identifier.
         */
        function onStorageHierarchySelected(storageHierarchyId) {
            var eventName = 'storagehierarchylist.' + vm.name + '.onStorageHierarchySelected';
            $rootScope.$emit(eventName, { 'StorageHierarchyId': storageHierarchyId });
        }

        function updateValidity(event, data) {
            if (vm !== null && data.id === 'storageHierarchyPropertyGrid') {
                vm.validInputs = data.validity;
                vm.addStorageHierarchyButtonsList[0].disabled = !(vm.validInputs && equipmentGraphConfigurationItemSelected !== null);
            }
        }


        function onComponentReady(compInstance) {

        }

        function onComponentDestroy() {
            logger = null;
            //In the last, make the vm to null
            vm = null;
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }


        /**
         * @ngdoc method
         * @name setActionBarVisibility
         *
         * @description
         * Sets the visibility of the action bar related to Storage Hierarchy List.
         *
         * @param {bool} isActionBarVisible the value configuring the command bar visibility.
         */
        function setActionBarVisibility(isActionBarVisible) {
            if (isActionBarVisible !== undefined && isActionBarVisible !== null) {
                vm.isActionBarHide = !isActionBarVisible;
                vm.StorageHierarchyListToolbarButtons[2].visibility = isActionBarVisible;
            }
        }
    }
})();
