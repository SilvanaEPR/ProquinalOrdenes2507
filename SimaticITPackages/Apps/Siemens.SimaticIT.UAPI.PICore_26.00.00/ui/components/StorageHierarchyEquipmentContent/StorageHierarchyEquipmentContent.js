/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('storagehierarchyequipmentcontent', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/StorageHierarchyEquipmentContent/StorageHierarchyEquipmentContent.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
    * Component controller for Storage Hierarchy Equipment Content
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

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('storagehierarchyequipmentcontent');

            init();
            exposeApi();
        }

        function exposeApi() {
            vm.setStorageHierarchyEquipmentContext = setStorageHierarchyEquipmentContext;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
            vm._onComponentReady = onComponentReady;
            vm._onComponentDestroy = onComponentDestroy;
            vm.onMaterialSelected = onMaterialSelected;
            vm.onMtuSelected = onMtuSelected;
            vm.onMaterialLotSelected = onMaterialLotSelected;
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.emptyId = '00000000-0000-0000-0000-000000000000';
            vm.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
            vm.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
            vm.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
            vm.booleanOperators = [ops.eq, ops.neq];
            vm.equipmentPropertyNIds = [
                'ActualQuantity',
                'Capacity',
                'InputLocked',
                'OutputLocked',
                'IsEmpty'
            ];
            vm.Quantity = {
                QuantityValue: $translate.instant('picore.labels.notApplicable'),
                UoMNId: ''
            };
            vm.equipment = {
                NId: ''
            };
            vm.materialNId = '';
            vm.materialLotNId = '';
            vm.selectedMaterialNId = null;
            vm.selectedMaterialLotNId = null;

            vm.storageHierarchyEquipmentContentComponentTitle = $translate.instant('picore.titles.storageHierarchyEquipmentDetailsComponentTitle');
            vm.storageHierarchyEquipmentPropertiesTabTitle = $translate.instant('picore.titles.storageHierarchyEquipmentPropertiesTabTitle');
            vm.storageHierarchyEquipmentMaterialsTabTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMaterialsTabTitle');
            vm.storageHierarchyEquipmentMaterialsTableTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMaterialsTableTitle');
            vm.storageHierarchyEquipmentMtusTabTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMtusTabTitle');
            vm.storageHierarchyEquipmentMtusTableTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMtusTableTitle');
            vm.storageHierarchyEquipmentMaterialLotsTabTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMaterialLotsTabTitle');
            vm.storageHierarchyEquipmentMaterialLotsTableTitle = $translate.instant('picore.titles.storageHierarchyEquipmentMaterialLotsTableTitle');

            vm.isEquipmentMaterialActionBarHide = true;
            vm.isEquipmentMtuActionBarHide = true;
            vm.isEquipmentMaterialLotActionBarHide = true;

            initHeaders();
            initTables();
            initPropertyGrid(true);
        }

        $scope.$watch('vm.storageHierarchyContent', function (newValue) {
            vm.selectedMaterialNId = null;
            vm.selectedMaterialLotNId = null;
            if (newValue !== undefined && newValue !== null) {
                if (newValue.Quantity !== undefined && newValue.Quantity !== null) {
                    if (newValue.Quantity.QuantityValue !== undefined && newValue.Quantity.QuantityValue !== null) {
                        vm.Quantity.QuantityValue = newValue.Quantity.QuantityValue;
                    } else {
                        vm.Quantity.QuantityValue = $translate.instant('picore.labels.notApplicable');
                    }

                    if (vm.Quantity.QuantityValue !== $translate.instant('picore.labels.notApplicable') && newValue.Quantity.UoMNId !== undefined
                        && newValue.Quantity.UoMNId !== null && newValue.Quantity.UoMNId.length > 0) {
                        vm.Quantity.UoMNId = newValue.Quantity.UoMNId;
                    } else {
                        vm.Quantity.UoMNId = '';
                    }
                } else {
                    vm.Quantity = {
                        QuantityValue: $translate.instant('picore.labels.notApplicable'),
                        UoMNId: ''
                    };
                }

                if (newValue.MaterialNId !== undefined && newValue.MaterialNId !== null) {
                    if (newValue.MaterialNId === 'Multiple') {
                        vm.materialNId = $translate.instant('picore.labels.multiple');
                    } else {
                        vm.materialNId = newValue.MaterialNId;
                    }
                } else {
                    vm.materialNId = '';
                }

                if (newValue.MaterialLotNId !== undefined && newValue.MaterialLotNId !== null) {
                    if (newValue.MaterialLotNId === 'Multiple') {
                        vm.materialLotNId = $translate.instant('picore.labels.multiple');
                    } else {
                        vm.materialLotNId = newValue.MaterialLotNId;
                    }
                }
                var materialData = [];
                var found = false;
                if (newValue.MaterialQuantities !== undefined && newValue.MaterialQuantities !== null && newValue.MaterialQuantities.length > 0) {
                    for (var ii = 0; ii < newValue.MaterialQuantities.length; ii++) {
                        found = false;
                        if (materialData.length > 0) {
                            for (var jj = 0; jj < materialData.length; jj++) {
                                if (materialData[jj].NId === newValue.MaterialQuantities[ii].MaterialNId
                                    && materialData[jj].UoMNId === newValue.MaterialQuantities[ii].MaterialQuantity.UoMNId) {
                                    materialData[jj].QuantityValue += Number(newValue.MaterialQuantities[ii].MaterialQuantity.QuantityValue);
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            materialData.push({
                                'NId': newValue.MaterialQuantities[ii].MaterialNId,
                                'QuantityValue': newValue.MaterialQuantities[ii].MaterialQuantity.QuantityValue,
                                'UoMNId': newValue.MaterialQuantities[ii].MaterialQuantity.UoMNId
                            });
                        }
                    }
                }
                refreshEquipmentMaterialGrid(materialData);
                refreshEquipmentMtuGrid(null, null);
                refreshEquipmentMaterialLotGrid(null);
            } else {
                vm.Quantity = {
                    QuantityValue: $translate.instant('picore.labels.notApplicable'),
                    UoMNId: ''
                };
                vm.equipment = {
                    NId: ''
                };
                vm.materialNId = '';
                vm.materialLotNId = '';
                refreshEquipmentMaterialGrid([]);
                refreshEquipmentMtuGrid(null, null);
                refreshEquipmentMaterialLotGrid(null);
            }
        }, true);

        function initComponentProperties(instance) {
            if (instance && instance.properties) {
                if (instance.properties.equipmentPropertyList) {
                    vm.equipmentPropertyNIds = instance.properties.equipmentPropertyList.get();
                }
            }
        }

        function initHeaders() {
            vm.equipmentMtuDataConfig = {
                Headers: [
                    {
                        Key: 'EquipmentNId',
                        DisplayName: $translate.instant('picore.headers.tables.equipmentNId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.nId')
                    },
                    {
                        Key: 'MaterialNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId')
                    },
                    {
                        Key: 'MaterialLotNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialLotNId')
                    },
                    {
                        Key: 'Quantity.QuantityValue',
                        DisplayName: $translate.instant('picore.headers.tables.quantity')
                    },
                    {
                        Key: 'Quantity.UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                ],
                onPiSelectionChangeCallback: onEquipmentMtuTableItemSelected
            };

            vm.equipmentMaterialLotDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'MaterialNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId')
                    }
                ],
                onPiSelectionChangeCallback: onEquipmentMaterialLotTableItemSelected
            };

            vm.equipmentMaterialDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'QuantityValue',
                        DisplayName: $translate.instant('picore.headers.tables.quantity')
                    },
                    {
                        Key: 'UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                ],
                onPiSelectionChangeCallback: onEquipmentMaterialTableItemSelected
            };
        }

        function initTables() {
            vm.equipmentMtuTableFields = {
                'EquipmentNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.equipmentNId'),
                    filtering: {
                        type: 'string',
                        default: false,
                        allowedCompareOperators: vm.stringOperators,
                        validation: { required: false }
                    }
                },
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
                'MaterialNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialLotNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialLotNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'Quantity/QuantityValue': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.quantity'),
                    filtering: {
                        type: 'number',
                        allowedCompareOperators: vm.numberOperators,
                        default: false,
                        validation: {
                            required: false
                        }
                    }
                },
                'Quantity/UoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {
                            required: false
                        }
                    }
                }
            };

            vm.equipmentMtuTableConfig = {
                data: [],
                dataSource: {
                    dataService: {
                        findAll: function (serverDataOptions) {
                            if (vm.storageHierarchy && vm.storageHierarchy.NId.length > 0 && vm.equipment && vm.equipment.NId.length > 0) {
                                var params = {
                                    StorageHierarchyNId: vm.storageHierarchy.NId,
                                    EquipmentNId: vm.equipment.NId,
                                    IncludeChildren: true
                                };
                                return storageHierarchyService.getStorageHierarchyEquipmentMtuList(params, 'RF_GetStorageHierarchyEquipmentMTUListV2', serverDataOptions.options);
                            } else {
                                serverDataOptions.options = '$filter=Id eq ' + vm.emptyId;
                                return commonService.findAll(serverDataOptions);
                            }
                        }
                    },
                    dataEntity: 'MAT_MaterialTrackingUnit',
                    appName: 'PICore'
                },
                selectionMode: 'single',
                fields: vm.equipmentMtuTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };

            vm.equipmentMaterialLotTableFields = {
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
                'MaterialNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {
                            required: false
                        }
                    }
                }
            };

            vm.equipmentMaterialLotTableConfig = {
                data: [],
                dataSource: {
                    dataService: {
                        findAll: function (serverDataOptions) {
                            if (vm.storageHierarchy && vm.storageHierarchy.NId.length > 0 && vm.equipment && vm.equipment.NId.length > 0) {
                                var params = {
                                    StorageHierarchyNId: vm.storageHierarchy.NId,
                                    EquipmentNId: vm.equipment.NId,
                                    IncludeChildren: true
                                };
                                return storageHierarchyService.getStorageHierarchyEquipmentMaterialLotList(params,
                                    'RF_GetStorageHierarchyEquipmentMaterialLotListV2',
                                    serverDataOptions.options);
                            } else {
                                serverDataOptions.options = '$filter=Id eq ' + vm.emptyId;
                                return commonService.findAll(serverDataOptions);
                            }
                        }
                    },
                    appName: 'PICore',
                    dataEntity: 'MAT_MaterialLot'
                },
                selectionMode: 'single',
                fields: vm.equipmentMaterialLotTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };

            vm.equipmentMaterialTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'QuantityValue': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.quantity'),
                    filtering: {
                        type: 'number',
                        allowedCompareOperators: vm.numberOperators,
                        default: false,
                        validation: {
                            required: false
                        }
                    }
                },
                'UoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {
                            required: false
                        }
                    }
                }
            };

            vm.equipmentMaterialTableConfig = {
                data: [],
                selectionMode: 'single',
                fields: vm.equipmentMaterialTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };
        }

        function initPropertyGrid(noData) {
            if (noData) {
                vm.equipmentPropertyGridData = [
                    {
                        id: 'NoData',
                        label: $translate.instant('picore.labels.noData'),
                        read_only: true,
                        widget: 'sit-label',
                        value: $translate.instant('picore.labels.noData'),
                        invisible: !noData,
                        validation: {}
                    }
                ];
            } else {
                vm.equipmentPropertyGridData = [
                    {
                        id: 'NId',
                        label: $translate.instant('picore.headers.propertyGrids.nId'),
                        read_only: true,
                        widget: 'sit-label',
                        value: vm.equipment.NId,
                        invisible: noData,
                        validation: {}
                    },
                    {
                        id: 'QuantityValue',
                        label: $translate.instant('picore.headers.propertyGrids.theoreticalQuantity'),
                        read_only: true,
                        widget: 'sit-label',
                        value: vm.storageHierarchyContent.Quantity !== null
                            ? vm.storageHierarchyContent.Quantity.QuantityValue + ' ' + vm.storageHierarchyContent.Quantity.UoMNId
                            : '',
                        invisible: noData,
                        validation: {}
                    },
                    {
                        id: 'ActualQuantity',
                        label: $translate.instant('picore.headers.propertyGrids.actualQuantity'),
                        read_only: true,
                        widget: 'sit-label',
                        value: getCompositeValue('ActualQuantity', 'UoM'),
                        invisible: noData,
                        validation: {}
                    },
                    {
                        id: 'Capacity',
                        label: $translate.instant('picore.headers.propertyGrids.capacity'),
                        read_only: true,
                        widget: 'sit-label',
                        value: getCompositeValue('Capacity', 'UoM'),
                        invisible: noData,
                        validation: {}
                    },
                    {
                        id: 'Material',
                        label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                        read_only: true,
                        widget: 'sit-label',
                        value: vm.storageHierarchyContent.MaterialNId,
                        invisible: noData,
                        validation: {}
                    },
                    {
                        id: 'Lot',
                        label: $translate.instant('picore.headers.propertyGrids.materialLotNId'),
                        read_only: true,
                        widget: 'sit-label',
                        value: vm.storageHierarchyContent.MaterialLotNId,
                        invisible: noData,
                        validation: {}
                    },
                    getBooleanFieldWithFallback('InputLocked', 'InputLocked', $translate.instant('picore.headers.propertyGrids.inputLocked')),
                    getBooleanFieldWithFallback('OutputLocked', 'OutputLocked', $translate.instant('picore.headers.propertyGrids.outputLocked')),
                    getBooleanFieldWithFallback('IsEmpty', 'IsEmpty', $translate.instant('picore.headers.propertyGrids.isEmpty'))
                ];
            }
        }

        function getBooleanFieldWithFallback(id, propertyNId, label) {
            var value = getPropertyValueByPropertyNId(propertyNId);
            if (value === $translate.instant('picore.labels.notApplicable')) {
                return {
                    id: id,
                    label: label,
                    read_only: true,
                    widget: 'sit-label',
                    value: value,
                    validation: {}
                };
            } else {
                var fieldValue = value.toLowerCase() === 'true' ? true : false;
                return {
                    id: id,
                    label: label,
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: fieldValue,
                    validation: {}
                };
            }
        }

        function getCompositeValue(propertyNId, attributeNId) {
            var propertyValue = getPropertyValueByPropertyNId(propertyNId);
            var propertyAttributeValue = '';
            if (propertyValue !== undefined && propertyValue !== null && propertyValue.length > 0 && propertyValue !== $translate.instant('picore.labels.notApplicable')) {
                propertyAttributeValue = getPropertyAttributeValueByPropertyNIdAndPropertyAttributeNId(propertyNId, attributeNId);
            }

            return propertyValue + ' ' + propertyAttributeValue;
        }

        function getPropertyValueByPropertyNId(propertyNId) {
            if (vm.equipmentPropertiesWithAttributes !== undefined && vm.equipmentPropertiesWithAttributes !== null && vm.equipmentPropertiesWithAttributes.length > 0) {
                for (var i = 0; i < vm.equipmentPropertiesWithAttributes.length; i++) {
                    if (vm.equipmentPropertiesWithAttributes[i].NId === propertyNId) {
                        return vm.equipmentPropertiesWithAttributes[i].PropertyValue !== null
                            ? vm.equipmentPropertiesWithAttributes[i].PropertyValue
                            : $translate.instant('picore.labels.notApplicable');
                    }
                }
            }

            return $translate.instant('picore.labels.notApplicable');
        }

        function getPropertyAttributeValueByPropertyNIdAndPropertyAttributeNId(propertyNId, propertyAttributeNId) {
            if (vm.equipmentPropertiesWithAttributes !== undefined && vm.equipmentPropertiesWithAttributes !== null && vm.equipmentPropertiesWithAttributes.length > 0) {
                for (var i = 0; i < vm.equipmentPropertiesWithAttributes.length; i++) {
                    if (vm.equipmentPropertiesWithAttributes[i].NId === propertyNId) {
                        if (vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes !== undefined
                            && vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes !== null
                            && vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes.length > 0) {
                            for (var j = 0; j < vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes.length; j++) {
                                if (vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes[j].NId === propertyAttributeNId) {
                                    return vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes[j].AttributeValue !== null
                                        ? vm.equipmentPropertiesWithAttributes[i].EquipmentPropertyAttributes[j].AttributeValue
                                        : $translate.instant('picore.labels.notApplicable');
                                }
                            }
                        }
                    }
                }
            }

            return $translate.instant('picore.labels.notApplicable');
        }

        function refreshEquipmentMtuGrid(materialNId, materialLotNId) {
            vm.equipmentMtuTableConfig.dataSource.optionsString = getEquipmentMtuOptionsString(materialNId, materialLotNId);

            if (vm.equipmentMtuTableConfig.refreshData) {
                vm.equipmentMtuTableConfig.refreshData();
            }
        }

        function refreshEquipmentMaterialLotGrid(materialNId) {
            vm.equipmentMaterialLotTableConfig.dataSource.optionsString = getEquipmentMaterialLotOptionsString(materialNId);

            if (vm.equipmentMaterialLotTableConfig.refreshData) {
                vm.equipmentMaterialLotTableConfig.refreshData();
            }
        }

        function refreshEquipmentMaterialGrid(data) {
            vm.equipmentMaterialTableConfig.data = data;
            if (vm.equipmentMaterialTableConfig.refreshData) {
                vm.equipmentMaterialTableConfig.refreshData();
            }
        }

        function getStorageHierarchyEquipmentContent(storageHierarchyId, equipmentId) {
            //  Retrieve the Storage Hierarchy entity by Id and the Equipment entity by Id.
            var options = '$filter=Id eq ' + storageHierarchyId;
            if (equipmentId === undefined || equipmentId === null) {
                equipmentId = '00000000-0000-0000-0000-000000000000';
            }
            var calls = [];
            calls.push(storageHierarchyService.getAll(options));
            calls.push(storageHierarchyService.getEquipmentById(equipmentId));
            calls.push(commonService.findAll({
                appName: 'PICore',
                entityName: 'EquipmentProperty',
                options: getEquipmentPropertyOptionsString(equipmentId)
            }));
            $q.all(calls).then(function (result) {
                if (result !== undefined && result !== null && result.length > 2) {
                    if (result[0].value !== undefined && result[0].value !== null) {
                        vm.storageHierarchy = result[0].value[0];
                    }

                    if (result[1].value !== undefined && result[1].value !== null) {
                        vm.equipment = result[1].value[0];
                    }

                    if (result[2].value !== undefined && result[2].value !== null) {
                        vm.equipmentPropertiesWithAttributes = result[2].value;
                    }

                    if (vm.equipment !== undefined && vm.equipment !== null && vm.storageHierarchy !== undefined && vm.storageHierarchy !== null) {
                        var params = {
                            StorageHierarchyNId: vm.storageHierarchy.NId,
                            EquipmentNId: vm.equipment.NId,
                            ReferenceUoMNId: '',
                            IncludeChildren: true
                        };
                        storageHierarchyService.getStorageHierarchyEquipmentContent(params, 'RF_GetStorageHierarchyEquipmentContentV2').then(function (result) {
                            if (result !== undefined && result !== null && result.value !== undefined && result.value !== null) {
                                vm.storageHierarchyContent = result.value[0];
                                initPropertyGrid(false);
                            }
                        }, function (reason) {
                            logger.logErr('An error occurred either retrieving the content of the Storage Hierarchy with Id: '
                                + storageHierarchyId + ' for the piece of Equipment with Id: '
                                + equipmentId, reason);
                        });

                    } else {
                        vm.storageHierarchyContent = null;
                        initPropertyGrid(true);
                    }
                }
            }, function (reason) {
                logger.logErr('An error occurred either retrieving the Storage Hierarchy with Id: '
                    + storageHierarchyId + ' or the piece of Equipment with Id: '
                    + equipmentId, reason);
            });
        }

        function getEquipmentPropertyOptionsString(equipmentId) {
            var s;
            if (equipmentId !== undefined) {
                s = '$expand=EquipmentPropertyAttributes&$filter=Equipment_Id eq ' + equipmentId;
            } else {
                s = '$expand=EquipmentPropertyAttributes&$filter=Equipment_Id eq ' + '00000000-0000-0000-0000-000000000000';
            }
            var filter = [];
            for (var i = 0; i < vm.equipmentPropertyNIds.length; i++) {
                filter.push('NId eq \'' + vm.equipmentPropertyNIds[i] + '\'');
            }
            if (filter.length > 0) {
                s += ' and (' + filter.join(' or ') + ')';
            }

            return s;
        }

        function getEquipmentMtuOptionsString(materialNId, materialLotNId) {
            var s = '';
            if (materialNId !== undefined && materialNId !== null) {
                s = '$filter=MaterialNId eq \'' + materialNId + '\'';
                if (materialLotNId !== undefined && materialLotNId !== null) {
                    s += ' and MaterialLotNId eq \'' + materialLotNId + '\'';
                }
            } else if (materialLotNId !== undefined && materialLotNId !== null) {
                s = '$filter=MaterialLotNId eq \'' + materialLotNId + '\'';
            }

            return s;
        }

        function getEquipmentMaterialLotOptionsString(materialNId) {
            var s = '';
            if (materialNId !== undefined && materialNId !== null) {
                s = '$filter=MaterialNId eq \'' + materialNId + '\'';
            }

            return s;
        }

        function onEquipmentMtuTableItemSelected(list, item) {
            if (item !== undefined && item !== null) {
                onMtuSelected(item.NId);
            } else {
                onMtuSelected(null);
            }
        }

        function onEquipmentMaterialLotTableItemSelected(list, item) {
            if (item !== undefined && item !== null) {
                vm.selectedMaterialLotNId = item.NId;
                onMaterialLotSelected(vm.selectedMaterialLotNId);
            } else {
                vm.selectedMaterialLotNId = null;
                onMaterialLotSelected(null);
            }

            refreshEquipmentMtuGrid(vm.selectedMaterialNId, vm.selectedMaterialLotNId);
        }

        function onEquipmentMaterialTableItemSelected(list, item) {
            if (item !== undefined && item !== null) {
                vm.selectedMaterialNId = item.NId;
            } else {
                vm.selectedMaterialNId = null;
            }

            onMaterialSelected(vm.selectedMaterialNId);
            refreshEquipmentMtuGrid(vm.selectedMaterialNId, vm.selectedMaterialLotNId);
            refreshEquipmentMaterialLotGrid(vm.selectedMaterialNId);
        }

        function onComponentReady(compInstance) {
            logger.logDebug('Component ready');

            initComponentProperties(compInstance);
        }

        function onComponentDestroy() {
            logger.logDebug('Component destroyed');
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }

        /**
        * @ngdoc method
        * @name setStorageHierarchyEquipmentContext
        *
        * @description
        * Sets the relevant information to retrieve the details of the selected Storage Hierarchy Equipment.
        *
        * @param {string} storageHierarchyId The Storage Hierarchy identifier.
        * @param {string} equipmentId The Equipment identifier.
        */
        function setStorageHierarchyEquipmentContext(storageHierarchyId, equipmentId) {
            vm.storageHierarchyId = storageHierarchyId;
            if (equipmentId !== undefined) {
                vm.equipmentId = equipmentId;
            } else {
                vm.equipmentId = '00000000-0000-0000-0000-000000000000';
            }
            getStorageHierarchyEquipmentContent(storageHierarchyId, equipmentId);
        }

        /**
         * @ngdoc event
         * @name onMaterialSelected
         * @eventType broadcast on root scope
         * @description Raised when the Material is selected from the related list.
         *
         * @param {string} materiaNlId The Material natural key identifier.
         */
        function onMaterialSelected(materialNId) {
            var eventName = 'storagehierarchyequipmentcontent.' + vm.name + '.onMaterialSelected';
            $rootScope.$emit(eventName, { 'materialNId': materialNId });
        }

        /**
         * @ngdoc event
         * @name onMtuSelected
         * @eventType broadcast on root scope
         * @description Raised when the Material Tracking Unit is selected from the related list.
         *
         * @param {string} mtuId The Material Tracking Unit natural key identifier.
         */
        function onMtuSelected(mtuNId) {
            var eventName = 'storagehierarchyequipmentcontent.' + vm.name + '.onMtuSelected';
            $rootScope.$emit(eventName, { 'mtuNId': mtuNId });
        }

        /**
         * @ngdoc event
         * @name onMaterialLotSelected
         * @eventType broadcast on root scope
         * @description Raised when the Material Lot is selected from the related list.
         *
         * @param {string} materialLotNId The Material Lot natural key identifier.
         */
        function onMaterialLotSelected(materialLotNId) {
            var eventName = 'storagehierarchyequipmentcontent.' + vm.name + '.onMaterialLotSelected';
            $rootScope.$emit(eventName, { 'materialLotNId': materialLotNId });
        }
    }
})();
