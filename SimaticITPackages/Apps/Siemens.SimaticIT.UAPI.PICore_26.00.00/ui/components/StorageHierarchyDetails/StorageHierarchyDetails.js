/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular
        .module('Siemens.SimaticIT.UAPI.PICore').component('storagehierarchydetails', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyDetails/StorageHierarchyDetails.html',
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
    ComponentController.$inject = [
        '$rootScope',
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
            logger = loggerService.getModuleLogger('storagehierarchydetails');

            init();
            initCommandBar();
            initDialog();
            exposeApi();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.emptyId = '00000000-0000-0000-0000-000000000000';
            vm.selectedItem = null;
            vm.storageHierarchyId = vm.emptyId;
            vm.storageHierarchyNId = null;
            vm.equipmentGraphConfigurationId = vm.emptyId;
            vm.equipmentGraphConfigurationNId = null;
            vm.equipmentId = vm.emptyId;
            vm.equipmentGraphNodeId = vm.emptyId;
            vm.applyCascading = true;
            vm.excludeRoot = true;

            vm.noData = $translate.instant('picore.labels.noData');
            vm.storageHierarchyDetailsComponentTitle = $translate.instant('picore.titles.storageHierarchyDetailsComponentTitle');
            vm.storageHierarchyEquipmentProperties = [];
            vm.defaultStorageHierarchyEquipmentProperties = [
	            {
	                NId: 'ActualQuantity',
	                Label: 'picore.labels.actualQuantity',
	                PropertyType: 'Decimal',
	                PropertyValue: null,
	                Attributes: [
			            {
			                NId: 'UoM',
			                PropertyType: 'String',
			                PropertyValue: ''
			            }
	                ]
	            },
                {
                    NId: 'Capacity',
                    Label: 'picore.labels.capacity',
                    PropertyType: 'Decimal',
                    PropertyValue: null,
                    Attributes: [
			            {
			                NId: 'UoM',
			                PropertyType: 'String',
			                PropertyValue: ''
			            }
                    ]
                },
                {
                    NId: 'IsEmpty',
                    Label: 'picore.labels.isEmpty',
                    PropertyType: 'Bool',
                    PropertyValue: false,
                    Attributes: []
                },
	            {
	                NId: 'InputLocked',
	                Label: 'picore.labels.inputLocked',
	                PropertyType: 'Bool',
	                PropertyValue: false,
	                Attributes: []
	            },
	            {
	                NId: 'OutputLocked',
	                Label: 'picore.labels.outputLocked',
	                PropertyType: 'Bool',
	                PropertyValue: false,
	                Attributes: []
	            }
            ];
        }

        function exposeApi() {
            vm._onComponentReady = onComponentReady;
            vm.onHierarchySelectedApi = onHierarchySelectedApi;
            vm.onSelectionChanged = onSelectionChanged;
            vm.setStorageHierarchyId = setStorageHierarchyId;
            vm.setActionBarVisibility = setActionBarVisibility;
            vm.onEquipmentGraphNodeSelected = onEquipmentGraphNodeSelected;
            vm.onActionClicked = onActionClicked;
        }

        function initDialog() {
            vm.storagePropertiesToAdd = null;
            vm.addStoragePropertiesTitle = $translate.instant('picore.titles.addStoragePropertiesTitle');
            vm.addStoragePropertiesTemplate = 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyDetails/add-storage-properties-dialog.html';
            vm.addStoragePropertiesButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAddStorageProperties,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        vm.excludeRoot = true;
                        vm.dialogService.hide();
                    }
                }
            ];

            if (vm.storageHierarchyEquipmentProperties === undefined || vm.storageHierarchyEquipmentProperties === null || vm.storageHierarchyEquipmentProperties.length < 1) {
                vm.storageHierarchyEquipmentProperties = vm.defaultStorageHierarchyEquipmentProperties;
            }
            vm.addStoragePropertiesData = {
                toggleTooltip: vm.toolbarLabels.action.toggleExcludeRoot,
                toggleFunction: onToggle,
                isToggled: vm.excludeRoot,
                storagePropertyTableConfig: {
                    data: [],
                    selectionMode: 'multi',
                    fields: vm.storagePropertyTableFields,
                    pageSizes: [5, 8],
                    pageSizeDefault: 5
                },
                storagePropertyDataConfig: {
                    Headers: [
                        {
                            Key: 'Label',
                            DisplayName: $translate.instant('picore.headers.tables.nId'),
                            IsSortDefault: true
                        },
                        {
                            Key: 'PropertyType',
                            DisplayName: $translate.instant('picore.headers.tables.type')
                        }
                    ],
                    onPiSelectionChangeCallback: onPiStoragePropertyTableItemSelected
                }

            };

            vm.storagePropertyTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    displayName: $translate.instant('picore.headers.tables.nId')
                },
                'Label': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.nId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'PropertyType': {
                    sorting: true,
                    grouping: false,
                    displayName: $translate.instant('picore.headers.tables.type'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };

            for (var i = 0; i < vm.storageHierarchyEquipmentProperties.length; i++) {
                vm.addStoragePropertiesData.storagePropertyTableConfig.data.push({
                    Label: $translate.instant(vm.storageHierarchyEquipmentProperties[i].Label),
                    NId: vm.storageHierarchyEquipmentProperties[i].NId,
                    PropertyType: vm.storageHierarchyEquipmentProperties[i].PropertyType,
                    PropertyValue: vm.storageHierarchyEquipmentProperties[i].PropertyValue
                });
            }
        }

        function onPiStoragePropertyTableItemSelected(list, item) {
            vm.addStoragePropertiesButtonsList[0].disabled = list === undefined || list === null || list.length === 0;
            vm.storagePropertiesToAdd = list;
        }

        function onToggle(item) {
            if (item) {
                vm.excludeRoot = !vm.excludeRoot;
                vm.addStoragePropertiesData.isToggled = vm.excludeRoot;
                switch (item.name) {
                    case 'toggleOn':
                        item.selected = true;
                        break;
                    case 'toggleOff':
                        item.selected = false;
                        break;
                    default:
                        break;
                }
            }
        }

        function initCommandBar() {
            vm.toolbarVisible = true;
            vm.showEdit = true;
            vm.toolbarLabels = {
                action: {
                    addStorageProperties: $translate.instant('picore.buttonsAndTooltips.addStorageProperties'),
                    toggleExcludeRoot: $translate.instant('picore.buttonsAndTooltips.toggleExcludeRoot')
                }
            };

            vm.toolbarButtons = [
                {
                    cmdIcon: 'Link',
                    name: 'addStorageProperties',
                    label: vm.toolbarLabels.action.addStorageProperties,
                    visibility: vm.showEdit && vm.toolbarVisible && vm.selectedItem && vm.selectedItem.selected
                }
            ];
        }

        function onActionClicked(commandName) {
            if (commandName === 'addStorageProperties') {
                addStorageProperties();
            }
        }

        function addStorageProperties() {
            //Show dialog
            initDialog();
            var globalDialog = {
                title: vm.addStoragePropertiesTitle,
                templatedata: vm.addStoragePropertiesData,
                templateuri: vm.addStoragePropertiesTemplate,
                buttons: vm.addStoragePropertiesButtonsList
            };
            vm.dialogService.set(globalDialog);
            vm.dialogService.show();
        }

        function onAddStorageProperties() {
            if (vm.selectedItem === null || vm.selectedItem === undefined) {
                return;
            }
            if (vm.storagePropertiesToAdd === undefined || vm.storagePropertiesToAdd === null || vm.storagePropertiesToAdd.length === 0) {
                return;
            }
            if (vm.storageHierarchyEquipmentProperties === null || vm.storageHierarchyEquipmentProperties === undefined || vm.storageHierarchyEquipmentProperties.length < 1) {
                return;
            }
            var properties = [];
            for (var i = 0; i < vm.storagePropertiesToAdd.length; i++) {
                for (var j = 0; j < vm.storageHierarchyEquipmentProperties.length; j++) {
                    if (vm.storageHierarchyEquipmentProperties[j].NId === vm.storagePropertiesToAdd[i].NId) {
                        properties.push({
                            NId: vm.storageHierarchyEquipmentProperties[j].NId,
                            PropertyType: vm.storageHierarchyEquipmentProperties[j].PropertyType,
                            PropertyValue: vm.storageHierarchyEquipmentProperties[j].PropertyValue,
                            Attributes: vm.storageHierarchyEquipmentProperties[j].Attributes
                        });
                        break;
                    }
                }
            }
            if (properties.length === 0) {
                return;
            }

            var cmdParams = {
                EquipmentConfigurations: [
                    {
                        ApplyCascading: vm.applyCascading,
                        EquipmentConfigurationNId: vm.selectedItem.EquipmentNId,
                        ExcludeRoot: vm.excludeRoot
                    }
                ],
                Properties: properties,
                StorageHierarchyNId: vm.storageHierarchyNId
            };
            storageHierarchyService.addEquipmentConfigurationPropertiesToStorageHierarchy(cmdParams).then(function () {
                if (vm.directiveApi) {
                    vm.directiveApi.setSelectedNode(vm.selectedItem);
                }
            }, function (reason) {
                logger.logErr('Error adding Equipment Configuration Properties to the selected Storage Hierarchy: ', reason);
            });

            vm.excludeRoot = true;
            vm.dialogService.hide();
        }

        function enableToolbarButton(name, enabled) {
            if (vm.toolbarButtons && vm.toolbarButtons.length > 0) {
                for (var i = 0; i < vm.toolbarButtons.length; i++) {
                    if (vm.toolbarButtons[i].name === name) {
                        vm.toolbarButtons[i].visibility = enabled;
                    }
                }
            }
        }

        function onComponentReady(compInstance) {
            logger.logDebug('Component ready');

            initComponentProperties(compInstance);
        }

        function initComponentProperties(instance) {
            if (instance && instance.properties) {
                if (instance.properties.storageHierarchyEquipmentProperties) {
                    vm.storageHierarchyEquipmentProperties = instance.properties.storageHierarchyEquipmentProperties.get();
                }
            }
        }

        function onHierarchySelectedApi(api) {
            vm.directiveApi = api;
        }

        function onSelectionChanged(item) {
            vm.selectedItem = item;
            if (vm.selectedItem && vm.selectedItem.selected) {
                var calls = [];
                calls.push(storageHierarchyService.getEquipmentByNId(vm.selectedItem.EquipmentNId));
                calls.push(storageHierarchyService.getEquipmentGraphNodeByEquipmentGraphNodeConfigurationId(vm.selectedItem.EquipmentId));
                $q.all(calls).then(function (result) {
                    if (result && Array.isArray(result) && result.length === 2) {
                        if (result[0].succeeded && result[0].value && Array.isArray(result[0].value) && result[0].value.length === 1) {
                            vm.equipmentId = result[0].value[0].Id;
                        } else {
                            // No Equipment has been found, given the selected EquipmentNId. Raise an error
                            vm.equipmentId = vm.emptyId;
                            vm.overlay = {
                                text: $translate.instant('picore.notifications.errors.missingEquipment') + vm.selectedItem.EquipmentNId + '.',
                                title: $translate.instant('picore.titles.errorTitle'),
                                buttons: [{
                                    id: 'okButton',
                                    displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                                    onClickCallback: function() {
                                        messageOverlay.hide();
                                    }
                                }]
                            };
                            messageOverlay.set(vm.overlay);
                            messageOverlay.show();
                        }

                        if (result[1].succeeded && result[1].value && Array.isArray(result[1].value) && result[1].value.length === 1) {
                            vm.equipmentGraphNodeId = result[1].value[0].Id;
                        }
                    }

                    onEquipmentGraphNodeSelected(vm.storageHierarchyId, vm.equipmentGraphNodeId, vm.equipmentId);
                });
            } else {
                onEquipmentGraphNodeSelected(vm.storageHierarchyId, null, null);
            }
        }

        /**
        * @ngdoc method
        * @name setStorageHierarchyId
        *
        * @description
        * Sets the identifier of the selected Storage Hierarchy.
        *
        * @param {string} storageHierarchyId The Storage Hierarchy identifier.
        */
        function setStorageHierarchyId(storageHierarchyId) {
            vm.storageHierarchyId = storageHierarchyId;

            //  Reset a previous selection, if any
            if (vm.directiveApi) {
                vm.directiveApi.setSelectedHierarchy(null);
            }

            onEquipmentGraphNodeSelected(null, null, null);

            if (storageHierarchyId !== undefined && storageHierarchyId !== null) {
                storageHierarchyService.getStorageHierarchyById(vm.storageHierarchyId)
                    .then(onGetStorageHierarchySuccess, function () {
                        logger.logErr('Unable to load equipment hierarchy tree for the specified equipment graph configuration');
                    });
            }
        }

        function onGetStorageHierarchySuccess(data) {
            if ((data) && (data.succeeded)) {
                if (data.value === undefined || data.value === null || data.value.length === 0) {
                    return;
                }
                vm.storageHierarchyNId = data.value[0].NId;
                vm.equipmentGraphConfigurationNId = data.value[0].EquipmentGraphConfigurationNId;

                storageHierarchyService.getEquipmentGraphConfigurationByNId(vm.equipmentGraphConfigurationNId)
                    .then(onGetEquipmentGraphConfigurationSuccess, function () {
                        logger.logErr('Unable to load equipment hierarchy tree for the specified equipment graph configuration');
                    });
            } else {
                logger.logInfo('Unable to read data: ', data);
            }
        }

        function onGetEquipmentGraphConfigurationSuccess(data) {
            if ((data) && (data.succeeded)) {
                if (data.value === undefined || data.value === null || data.value.length === 0) {
                    return;
                }
                vm.equipmentGraphConfigurationId = data.value[0].Id;

                if (vm.directiveApi) {
                    vm.directiveApi.setSelectedHierarchy(vm.equipmentGraphConfigurationId);
                }
            } else {
                logger.logInfo('Unable to read data: ', data);
            }
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
                vm.toolbarVisible = isActionBarVisible;
            }
        }

        /**
         * @ngdoc event
         * @name onEquipmentGraphNodeSelected
         * @eventType broadcast on root scope
         * @description Raised when an Equipment Graph Node is selected from the tree.
         *
         * @param {string} storageHierarchyId The Storage Hierarchy unique identifier.
         * @param {string} equipmentGraphNodeId The Equipment Graph Node unique identifier.
         * @param {string} equipmentId The referenced Equipment unique identifier.
         */
        function onEquipmentGraphNodeSelected(storageHierarchyId, equipmentGraphNodeId, equipmentId) {
            enableToolbarButton('addStorageProperties', equipmentId !== undefined && equipmentId !== null && equipmentId !== vm.emptyId && vm.showEdit && vm.toolbarVisible);
            var eventName = 'storagehierarchydetails.' + vm.name + '.onEquipmentGraphNodeSelected';
            $rootScope.$emit(eventName, { 'storageHierarchyId': storageHierarchyId, 'equipmentGraphNodeId': equipmentGraphNodeId, 'equipmentId': equipmentId });
        }
    }
})();
