(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('actualmatmaterialdetails', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                onRegisterApi: '&'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/ActualMATMaterialDetails/ActualMATMaterialDetails.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
    * Component controller for Actual Material Details
    * @constructor
    * @ngdoc object
    * @name ComponentController
    * @scope
    * @requires $rootScope {service} $rootScope
    * @requires $scope {service} $scope
    * @requires loggerService {service} common.services.logger.service
    * @requires uiComponentService {service} common.services.component.uiComponentService
    * @requires $translate {service} translate
    * @requires commonService {service} Siemens.SimaticIT.UAPI.PICore.commonService
    * @requires base {service} common.base
    * @requires materialService {service} Siemens.SimaticIT.UAPI.PICore.service
    * @requires messageOverlay {service} common.widgets.messageOverlay.service
    * @requires dialogService {service} common.widgets.globalDialog.service
    * @requires $q {service} $q
    */
    ComponentController.$inject = ['$rootScope', '$scope', 'common.services.logger.service', 'common.services.component.uiComponentService',
        '$translate', 'Siemens.SimaticIT.UAPI.PICore.commonService', 'common.base',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService', 'Siemens.SimaticIT.UAPI.PICore.service',
        'common.widgets.messageOverlay.service', 'common.widgets.globalDialog.service', '$q'];
    function ComponentController($rootScope, $scope, loggerService, uiComponentService, $translate,
        commonService, base, WorkOrderOperationService, materialService, messageOverlay, dialogService, $q) {
        var vm = this;
        var logger;
        var bulkOverlay = false;
        var stringFailedParams = '\n';
        var stringFailedReason = '';
        var deferred = $q.defer();
        vm.dialogService = dialogService;
        vm.isComponentTitleVisible = true;
        vm.isNotInMD = true;
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
        var internalService = {
            findAll: findAll
        };
        var backendService = base.services.runtime.backendService;
        activate();

        function activate() {
            logger = base.services.logger.service.getModuleLogger('actualmatmaterialdetails');
            exposeApi();
            init();
            initHeaders();
            initTableData();
            initDialogData();
            vm.api = {
                setWorkOrderOperationMaterialRequirementId: setWorkOrderOperationMaterialRequirementId,
                hideTitle: hideTitle,
                hidePG: hidePG
            };
            if (vm.onRegisterApi) {
                vm.onRegisterApi({ api: vm.api });
            }
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
            vm.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
            vm.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
            vm.booleanOperators = [ops.eq, ops.neq];
            vm.actualMaterialDetailsComponentTitle = $translate.instant('picore.titles.actualMaterialDetailsComponentTitle');
            vm.translatedCloseButton = $translate.instant('picore.buttonsAndTooltips.close');
            vm.selectedActualMaterialDetail = null;
            vm.toolbarVisible = true;
            vm.workOrderOperationMaterialRequirementId = null;
            vm.backStateId = null;
            vm.showEdit = true;
            vm.isCloseButtonVisible = true;
            vm.mtuCatalogTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.nId'),
                    filtering: {
                        type: 'string',
                        default: false,
                        allowedCompareOperators: vm.stringOperators,
                        validation: {}
                    }
                },
                'MaterialNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        default: false,
                        allowedCompareOperators: vm.stringOperators,
                        validation: { required: false }
                    }
                },
                'MaterialRevision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialRev'),
                    filtering: {
                        type: 'string',
                        default: false,
                        allowedCompareOperators: vm.stringOperators,
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
                        validation: { required: false }
                    }
                },
                'EquipmentNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.equipmentNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialTrackingUnitAggregate/NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                     displayName: $translate.instant('picore.headers.tables.MTUAggregateNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };
            vm.addLotButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAddLotOk,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        vm.addLotData.Properties[1].value = '';
                        vm.dialogService.hide();
                    }
                }];

            vm.addMTUButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAddMtuOk,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        initDialogData();
                        vm.dialogService.hide();
                    }
                }];

            vm.associateMTUButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAssociateMtuOk,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        initDialogData();
                        vm.dialogService.hide();
                    }
                }];

            vm.workOrderOperationactualmatmaterialdetailsPropertyGrid = [{
                id: 'NoData',
                label: $translate.instant('picore.workOrder.NoDataLabel'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.common.NoDataValue'),
                validation: {}
            }];

            vm.close = close;
        }

        function close() {
            onClose();
        }

        function exposeApi() {
            vm.setActionBarVisibility = setActionBarVisibility;
            vm.setWorkOrderOperationMaterialRequirementId = setWorkOrderOperationMaterialRequirementId;
            vm.onActionClicked = onActionClicked;
            vm.setTargetStates = setTargetStates;
            vm.enableCloseButton = enableCloseButton;
            vm._onComponentDestroy = onComponentDestroy;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
            vm.hideTitle = hideTitle;
            vm.hidePG = hidePG;
        }

        function hideTitle() {
            vm.isComponentTitleVisible = false;
        }

        function hidePG() {
            vm.isNotInMD = false;
            vm.isCloseButtonVisible = false;
        }

        function onComponentDestroy() {
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
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
                            filter = array[i].substring(0, 8) + '(' + array[i].substring(8, array[i].length) + ')';
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

            backendService.findAll(queryModel).then(function (data) {
                vm.dataMTU = data.value;
                vm.showEdit = false;
                for (var i = 0; i < vm.dataMTU.length; i++) {
                    vm.dataMTU[i].isSelected = null;
                    if (!vm.dataMTU[i].MTUNId) {
                        vm.dataMTU[i].isReadonly = true;
                    } else {
                        vm.showEdit = true;
                    }
                }
                var dataObj = {};
                dataObj.value = vm.dataMTU;
                dataObj.currentPage = 0;
                dataObj.count = data.count;
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('edit', vm.showEdit && !vm.isInEditMode && !vm.IsFrozen && !vm.IsLocked);
                deffer.resolve(dataObj);

            }).catch(function (err) {
                deffer.reject(err);
            });
            return deffer.promise;
        }

        function initHeaders() {
            vm.toolbarLabels = {
                action: {
                    addBtn: $translate.instant('picore.buttonsAndTooltips.add'),
                    addMtu: $translate.instant('picore.buttonsAndTooltips.associateMTUToMaterial'),
                    associateMtu: $translate.instant('picore.buttonsAndTooltips.associateMtu'),
                    addLot: $translate.instant('picore.buttonsAndTooltips.associateLotToMaterial'),
                    addFromBomBtn: $translate.instant('picore.buttonsAndTooltips.addFromBomActionBtn'),
                    deleteBtn: $translate.instant('picore.buttonsAndTooltips.delete'),
                    editBtn: $translate.instant('picore.buttonsAndTooltips.edit'),
                    savteBtn: $translate.instant('picore.buttonsAndTooltips.save'),
                    cancelBtn: $translate.instant('picore.buttonsAndTooltips.cancel')
                }
            };

            vm.actualmatmaterialdetailsDataConfig = {
                Headers: [
                    {
                        Key: 'MTUNId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Quantity.QuantityValue',
                        DisplayName: $translate.instant('picore.headers.tables.quantity'),
                        IsEditable: true,
                        IsQty: true
                    },
                    {
                        Key: 'Quantity.UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    },
                    {
                        Key: 'MaterialLotNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialLotNId')
                    },
                    {
                        Key: 'EquipmentNId',
                        DisplayName: $translate.instant('picore.headers.tables.equipmentNId')
                    },
                    {
                        Key: 'MTUAggregateNId',
                        DisplayName: $translate.instant('picore.headers.tables.MTUAggregateNId')
                    }
                ],
                onPiSelectionChangeCallback: onPiactualmatmaterialdetailsTableItemSelected
            };

            vm.actualmatmaterialdetailsToolbarButtons = [
                {
                    icon: 'fa-pencil',
                    cmdIcon: 'Edit',
                    name: 'edit',
                    label: vm.toolbarLabels.action.editBtn,
                    visibility: vm.toolbarVisible
                },
                {
                    icon: 'fa-floppy-o',
                    cmdIcon: 'Save',
                    name: 'save',
                    label: vm.toolbarLabels.action.savteBtn,
                    visibility: false
                },
                {
                    icon: 'fa-times',
                    cmdIcon: 'Undo',
                    name: 'cancel',
                    label: vm.toolbarLabels.action.cancelBtn,
                    visibility: false
                },
                {
                    icon: 'fa-trash',
                    cmdIcon: 'Trash',
                    name: 'delete',
                    label: vm.toolbarLabels.action.deleteBtn,
                    visibility: vm.selectedActualMaterialDetail && vm.toolbarVisible
                },
                {
                    icon: 'sit sit-assign',
                    cmdIcon: 'Link',
                    name: 'associateMTU',
                    label: vm.toolbarLabels.action.associateMtu,
                    visibility: vm.selectedActualMaterialDetail && vm.toolbarVisible
                },
                {
                    icon: 'sit sit-pi-add-from-lot',
                    cmdIcon:'PartLotAssign',
                    name: 'addLot',
                    label: vm.toolbarLabels.action.addLot,
                    visibility: vm.toolbarVisible
                },
                {
                    icon: 'fa-plus',
                    cmdIcon: 'PartLink',
                    name: 'addMTU',
                    label: vm.toolbarLabels.action.addMtu,
                    visibility: vm.toolbarVisible
                }];

            vm.mtuCatalogDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'MaterialNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId')
                    },
                    {
                        Key: 'MaterialRevision',
                        DisplayName: $translate.instant('picore.headers.tables.materialRev')
                    },
                    {
                        Key: 'Quantity.QuantityValue',
                        DisplayName: $translate.instant('picore.headers.tables.quantity')
                    },
                    {
                        Key: 'Quantity.UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                    ,
                    {
                        Key: 'EquipmentNId',
                        DisplayName: $translate.instant('picore.headers.tables.equipmentNId')
                    },
                    {
                        Key: 'MaterialTrackingUnitAggregate.NId',
                        DisplayName: $translate.instant('picore.headers.tables.MTUAggregateNId')
                    }
                ],
                onPiSelectionChangeCallback: onPiMTUCatalogTableItemSelected
            };
        }

        function initTableData() {
            vm.actualmatmaterialdetailsTableFields = {
                'MTUNId': {
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
                        validation: { required: false }
                    }
                },
                'MaterialLotNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.materialLotNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };
            var workOrderOperationMaterialRequirementIdEmpty = '00000000-0000-0000-0000-000000000000';


            vm.actualmatmaterialdetailsTableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'ActualMaterialMTU',
                    optionsString: '$filter=WorkOrderOperationActualMaterial_Id eq ' + workOrderOperationMaterialRequirementIdEmpty
                },
                selectionMode: 'single',
                fields: vm.actualmatmaterialdetailsTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };

            vm.mtuCatalogTableConfig = {
                data: [],
                dataSource: {
                    dataService: commonService,
                    appName: 'PICore',
                    dataEntity: 'MAT_MaterialTrackingUnit',
                    optionsString: '$filter=MaterialNId eq %27' + vm.materialNId + '%27'
                },
                selectionMode: 'single',
                fields: vm.mtuCatalogTableFields,
                pageSizes: [5, 8],
                pageSizeDefault: 5
            };

            $scope.$watch('vm.workOrderOperationMaterialRequirementId', function (newValue) {

                if (newValue) {
                    vm.actualmatmaterialdetailsTableConfig.dataSource.optionsString =
                        '$filter=WorkOrderOperationActualMaterial_Id eq ' + vm.workOrderOperationMaterialRequirementId;
                    if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                        vm.actualmatmaterialdetailsTableConfig.refreshData();
                    }
                } else {
                    vm.actualmatmaterialdetailsTableConfig.dataSource.optionsString =
                        '$filter=WorkOrderOperationActualMaterial_Id eq ' + workOrderOperationMaterialRequirementIdEmpty;
                    if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                        vm.actualmatmaterialdetailsTableConfig.refreshData();
                    }
                }
                resetActionBarVisibility();
            }, true
            );
        }

        function initDialogData() {
            vm.addLotTemplate = 'Siemens.SimaticIT.UAPI.PICore/components/actualmatmaterialdetails/add-lot-dialog.html';

            vm.addLotData = {
                'Properties': [
                    {
                        id: 'MaterialNId',
                        label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                        read_only: true,
                        widget: 'sit-label',
                        value: vm.materialNId,
                        validation: {}
                    },
                    {
                        id: 'MaterialLotNId',
                        label: $translate.instant('picore.headers.propertyGrids.materialLotNId'),
                        read_only: false,
                        value: vm.lots,
                        widget: 'sit-pi-datalist',
                        widgetAttributes: {
                            options: vm.lots,
                            toDisplay: 'NId',
                            toKeep: 'NId',
                            change: setLotName
                        },
                        validation: {
                            required: false
                        }
                    }
                ]
            };

            vm.mtuQuantity = '';
            vm.mtuQtyPropertyVisible = false;
            vm.mtuQtyProperty = {
                'Properties': [
                    {
                        id: 'Quantity',
                        label: $translate.instant('picore.headers.propertyGrids.quantity'),
                        read_only: false,
                        value: vm.mtuQuantity,
                        widget: 'sit-numeric',
                        validation: {
                            required: false,
                            min: 0,
                            max: vm.maxQtySelected
                        }
                    }
                ]
            };

            vm.addMTUTemplate = 'Siemens.SimaticIT.UAPI.PICore/components/actualmatmaterialdetails/add-mtu-dialog.html';
            vm.addMTUData = {
                'mtuCatalogTableConfig': vm.mtuCatalogTableConfig,
                'mtuCatalogDataConfig': vm.mtuCatalogDataConfig,
                'mtuQtyProperty': vm.mtuQtyProperty,
                'mtuQtyPropertyVisible': vm.mtuQtyPropertyVisible
            };
        }

        function getLots(optionsString) {
            materialService.get_Material_Lots(optionsString + '&$orderby=NId%20desc')
                .then(onGetLotsByMaterialSuccess, function (reason) {
                    logger.logErr('Error getting lots', reason);
                });
        }

        function onGetLotsByMaterialSuccess(data) {
            if (data) {
                vm.lots = data.value;
                vm.addLotData.Properties[1].widgetAttributes['options'] = vm.lots;
                vm.addLotData.Properties[0].value = vm.materialNId;
            }

            if (vm.lots.length > 0) {
                vm.addLotData.Properties[1].read_only = false;
            }
            else {
                vm.addLotData.Properties[1].read_only = true;
            }
        }

        function setLotName(oldValue, newValue) {
            if (newValue) {
                vm.addLotButtonsList[0].disabled = false;
            } else {
                vm.addLotButtonsList[0].disabled = true;
            }
        }

        function resetActionBarVisibility() {
            if (vm.actualmatmaterialdetailsDataConfig && vm.actualmatmaterialdetailsDataConfig.setButtonVisible) {
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('edit', vm.showEdit && !vm.IsFrozen && !vm.IsLocked);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addLot', !vm.IsFrozen && !vm.IsLocked);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addMTU', !vm.IsFrozen && !vm.IsLocked);
            }
        }

        function onPiactualmatmaterialdetailsTableItemSelected(list, item) {
            if (item) {
                vm.detailItem = item;
                vm.detailList = list;
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', !vm.isInEditMode && !vm.IsFrozen && !vm.IsLocked);
                if (!item.MTUNId) {
                    vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', !vm.isInEditMode && !vm.IsFrozen && !vm.IsLocked);
                } else {
                    vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
                }
            } else {
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
                vm.detailItem = null;
                vm.detailList = null;
            }
        }

        function onPiMTUCatalogTableItemSelected(list, item) {
            if (item) {
                vm.selectedMtu = item;
                vm.selectedMtuS = list;
                vm.mtuQtyProperty.Properties[0].value = item.Quantity.QuantityValue;
                //vm.mtuQtyProperty.Properties[0].validation.max = item.Quantity.QuantityValue;
                vm.addMTUData.mtuQtyPropertyVisible = true;
                //Introduced when changing from multiple to single selection and editing the quantity
                vm.addMTUButtonsList[0].disabled = false;
                vm.associateMTUButtonsList[0].disabled = false;

            } else {
                vm.addMTUData.mtuQtyPropertyVisible = false;
                vm.addMTUButtonsList[0].disabled = true;
                vm.associateMTUButtonsList[0].disabled = true;
            }
        }

        function onActionClicked(commandName) {
            switch (commandName) {
                case 'addMTU':
                    onAddMTU();
                    break;
                case 'addLot':
                    onAddLot();
                    break;
                case 'associateMTU':
                    onAssociateMTUToLot();
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
                case 'cancel':
                    onRollback();
                    break;
            }
        }

        function onAddMTU() {
            vm.mtuCatalogTableConfig.dataSource.optionsString = vm.mtuOptionString;
            if (vm.mtuCatalogTableConfig.refreshData) {
                vm.mtuCatalogTableConfig.refreshData();
            }
            if (vm.workOrderOperationMaterialRequirementId) {
                //Show dialog
                var globalDialog = {
                    title: $translate.instant('picore.titles.addMtuToMaterialRequirementTitle'),
                    templatedata: vm.addMTUData,
                    templateuri: vm.addMTUTemplate,
                    buttons: vm.addMTUButtonsList
                };
                vm.addMTUButtonsList[0].disabled = true;
                vm.dialogService.set(globalDialog);
                vm.dialogService.show();
            } else {
                //If no workorderoperation selected shows an error message
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.selectionOnAddMtuToMaterialRequirementText'),
                    title: $translate.instant('picore.titles.errorTitle'),
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
        }

        function onAddMtuOk() {
            var mtuSToAdd = [];
            var qty = 0;
            if (vm.mtuQtyProperty.Properties[0].value) {
                qty = vm.mtuQtyProperty.Properties[0].value;
            }

            for (var i = 0; i < vm.selectedMtuS.length; i++) {
                mtuSToAdd.push({
                    'MTUNId': vm.selectedMtuS[i].NId,
                    'Quantity': qty,
                    'UoMNId': vm.selectedMtuS[i].Quantity.UoMNId,
                    'MaterialLotNId': vm.selectedMtuS[i].MaterialLot ? vm.selectedMtuS[i].MaterialLot.NId : undefined
                }
                );
            }

            var params = {
                'WorkOrderOperationActualMaterialId': vm.workOrderOperationMaterialRequirementId,
                'MTUsToWorkOrderOperationActualMaterial': mtuSToAdd
            };
            WorkOrderOperationService.addMtuToActualMaterialRequirementV2(params)
                .then(onAddMtuToMatRequirementSuccess, function (reason) {
                    logger.logErr('Error adding Material Tracking Unit to Material Requirement', reason);
                });

            initDialogData();
            vm.dialogService.hide();
        }

        function onAssociateMtuOk() {
            var mtuSToAdd = [];
            var qty = 0;
            if (vm.mtuQtyProperty.Properties[0].value) {
                qty = vm.mtuQtyProperty.Properties[0].value;
            }

            for (var i = 0; i < vm.selectedMtuS.length; i++) {
                mtuSToAdd.push({
                    'MTUNId': vm.selectedMtuS[i].NId,
                    'Quantity': qty,
                    'UoMNId': vm.selectedMtuS[i].Quantity.UoMNId,
                    'MaterialLotNId': vm.selectedMtuS[i].MaterialLot ? vm.selectedMtuS[i].MaterialLot.NId : undefined
                }
                );
            }

            if (vm.detailItem) {
                var params = {
                    'Id': vm.detailItem.Id,
                    'Quantity': mtuSToAdd[0].Quantity,
                    'MTUNId': mtuSToAdd[0].MTUNId,
                    'UoMNId': mtuSToAdd[0].UoMNId,
                    'MaterialLotNId': vm.detailItem.MaterialLotNId
                };
                WorkOrderOperationService.updateMTUActualMaterialRequirementV2(params)
                    .then(onUpdateMaterialRequirementMTUSuccess, function (reason) {
                        logger.logErr('Error updating Material Tracking Unit to Material Requirement', reason);
                    });
            } else {
                logger.logErr('Error: it is mandatory to select a Material tracking Unit first');
            }
            initDialogData();
            vm.dialogService.hide();
        }

        function onAddMtuToMatRequirementSuccess() {
            if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                vm.actualmatmaterialdetailsTableConfig.refreshData();
            }
        }

        function onUpdateMaterialRequirementMTUSuccess() {
            if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                vm.actualmatmaterialdetailsTableConfig.refreshData();
            }
        }

        function onAddLot() {
            if (vm.workOrderOperationMaterialRequirementId) {
                //Show dialog
                var globalDialog = {
                    title: $translate.instant('picore.titles.addLotToMaterialRequirementTitle'),
                    templatedata: vm.addLotData,
                    templateuri: vm.addLotTemplate,
                    buttons: vm.addLotButtonsList
                };
                vm.addLotData.Properties[1].value = '';
                vm.addLotButtonsList[0].disabled = true;
                vm.dialogService.set(globalDialog);
                vm.dialogService.show();
            } else {
                //If no workorderoperation selected shows an error message
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.selectionOnAddLotToMaterialRequirementText'),
                    title: $translate.instant('picore.titles.errorTitle'),
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
        }

        function onAddLotOk() {
            var lotToAdd = [{
                'MaterialLotNId': vm.addLotData.Properties[1].value
            }];

            var params = {
                'WorkOrderOperationActualMaterialId': vm.workOrderOperationMaterialRequirementId,
                'MTUsToWorkOrderOperationActualMaterial': lotToAdd
            };
            WorkOrderOperationService.addMtuToActualMaterialRequirementV2(params)
                .then(onAddLotToMatRequirementSuccess, function (reason) {
                    logger.logErr('Error adding Lot or Material Tracking Unit to Material Requirement', reason);
                });
            vm.addLotData.Properties[1].value = null;
            vm.dialogService.hide();
        }

        function onAddLotToMatRequirementSuccess() {
            if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                vm.actualmatmaterialdetailsTableConfig.refreshData();
            }
        }

        function onAssociateMTUToLot() {
            if (vm.detailItem && vm.detailItem.MaterialLotNId) {

                vm.mtuCatalogTableConfig.dataSource.optionsString = vm.mtuOptionString + ' and MaterialLot/NId eq %27' + vm.detailItem.MaterialLotNId + '%27';
            }
            if (vm.mtuCatalogTableConfig.refreshData) {
                vm.mtuCatalogTableConfig.refreshData();
            }

            //Show dialog
            var globalDialog = {
                title: $translate.instant('picore.titles.addMtuToMaterialRequirementTitle'),
                templatedata: vm.addMTUData,
                templateuri: vm.addMTUTemplate,
                buttons: vm.associateMTUButtonsList
            };

            vm.associateMTUButtonsList[0].disabled = true;
            vm.dialogService.set(globalDialog);
            vm.dialogService.show();
        }

        function onDelete() {
            if (vm.detailItem) {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmDeleteText'),
                    title: $translate.instant('picore.titles.deleteTitle'),
                    buttons: [{
                        id: 'cancelButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                        onClickCallback: function () {
                            removeOverlay();
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
                        }
                    }, {
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                        onClickCallback: function () {
                            if (vm.detailItem) {
                                WorkOrderOperationService.deleteMtuFromActualMaterialRequirement({ Id: vm.detailItem.Id })
                                    .then(onDeleteMtuCompleted, function (reason) {
                                        logger.logErr('Unable to delete Material Requirement.', reason);
                                    });
                            }
                            removeOverlay();
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
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

        function onDeleteMtuCompleted(data) {
            if (data) {
                vm.detailItem = null;
                if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                    vm.actualmatmaterialdetailsTableConfig.refreshData();
                }
            }
        }

        function onEdit() {
            vm.actualmatmaterialdetailsDataConfig.setCellEdit();
            vm.isInEditMode = true;
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('edit', false);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('save', !vm.IsFrozen && !vm.IsLocked);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('cancel', !vm.IsFrozen && !vm.IsLocked);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addLot', false);
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addMTU', false);
        }

        function onSave() {
            bulkOverlay = false;
            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('edit', vm.showEdit && !vm.IsFrozen && !vm.IsLocked);
            var calls = [];
            for (var i = 0; i < vm.dataMTU.length; i++) {
                if (vm.dataMTU[i].MTUNId) {
                    calls.push(WorkOrderOperationService
                        .updateMTUActualMaterialRequirementV2({ Id: vm.dataMTU[i].Id, Quantity: vm.dataMTU[i].Quantity.QuantityValue })
                        .catch(exceptionErrorFn));
                }
            }
            $q.all(calls).then(onSetQtysSuccess, onFirstError);
            vm.actualmatmaterialdetailsDataConfig.deSelect();
            return deferred.promise;
        }

        function exceptionErrorFn(reason) {
            logger.logErr('------', reason.config.data.Quantity);
            if (reason.data.error && reason.data.error.errorMessage) {
                stringFailedReason = reason.data.error.errorMessage;
            }

            for (var i = 0; i < vm.dataMTU.length; i++) {
                if (vm.dataMTU[i].Id === reason.config.data.Id) {
                    var obj = { nid: vm.dataMTU[i].MTUNId, materialLotNId: vm.dataMTU[i].MaterialLotNId, value: reason.config.data.Quantity };
                    stringFailedParams += 'MTU Id: ' + obj.nid + ' - Material Lot Id: ' + obj.materialLotNId + ', ';
                }

            }
            bulkOverlay = true;
            deferred.reject(reason);
        }

        function onFirstError() {
            removeOverlay();
        }

        function onSetQtysSuccess() {
            if (bulkOverlay) {
                if (stringFailedParams.endsWith(', ')) {
                    stringFailedParams = stringFailedParams.substring(0, stringFailedParams.lastIndexOf(', '));
                }
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorBulkMTUMatReq') + ' ' + stringFailedReason + '\n'
                        + $translate.instant('picore.notifications.errors.errorBulkMTUMatReqElement') + ' ' + stringFailedParams,
                    title: $translate.instant('picore.titles.errorBulkTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            stringFailedParams = '\n';
                            removeOverlay();
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('save', !vm.IsFrozen && !vm.IsLocked);
                            vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('cancel', !vm.IsFrozen && !vm.IsLocked);
                            vm.actualmatmaterialdetailsDataConfig.setCellEdit();
                        }
                    }]
                };
                messageOverlay.set(vm.overlay);
                displayOverlay();
            } else {
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('save', false);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('cancel', false);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', vm.selectedMTUItem && !vm.IsFrozen && !vm.IsLocked);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addLot', !vm.IsFrozen && !vm.IsLocked);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addMTU', !vm.IsFrozen && !vm.IsLocked);
                vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', vm.selectedMTUItem);
                vm.isInEditMode = false;
                vm.actualmatmaterialdetailsDataConfig.setCellReadOnly();
                if (vm.actualmatmaterialdetailsTableConfig.refreshData) {
                    vm.actualmatmaterialdetailsTableConfig.refreshData();
                }

            }

        }

        function onRollback() {
            vm.overlay = {
                text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmParameterTargetValueRollBackNoChangeText'),
                title: $translate.instant('picore.titles.confirmCancelBulkTitle'),
                buttons: [{
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                    onClickCallback: function () {
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('edit', vm.showEdit && !vm.IsFrozen && !vm.IsLocked);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('save', false);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('cancel', false);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('delete', false);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('associateMTU', false);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addLot', !vm.IsFrozen && !vm.IsLocked);
                        vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addMTU', !vm.IsFrozen && !vm.IsLocked);
                        vm.actualmatmaterialdetailsDataConfig.setCellReadOnly();
                        //restore old Data
                        vm.isInEditMode = false;
                        vm.actualmatmaterialdetailsDataConfig.deSelect();
                        if (vm.actualmatmaterialdetailsDataConfig.refreshData) {
                            vm.actualmatmaterialdetailsDataConfig.refreshData();
                        }
                        removeOverlay();
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

        /**
    * @ngdoc method
    * @name setTargetStates
    *
    * @description
    * Sets the target modules to navigate to from the action commands.
    *
    * @param {string} openStateId The module that manages showing the bill of operations items details.
    */
        function setTargetStates(backStateId) {
            vm.backStateId = backStateId;
        }

        function onClose() {
            var eventName = 'actualmatmaterialdetails.' + vm.name + '.onClose';
            $rootScope.$emit(eventName, { 'targetStateId': vm.backStateId, 'workOrderOperationId': vm.workOrderOperationId, 'workOrderId': vm.workOrderId });
        }
        /**
        * @ngdoc method
        * @name enableCloseButton
        * @description
        * Sets the visibility of the open button in the action bar.
        *
        * @param {bool} isCloseButtonEnabled the value configuring the open command button visibility.
        */
        function enableCloseButton(isCloseButtonEnabled) {
            if (isCloseButtonEnabled !== undefined && isCloseButtonEnabled !== null) {
                vm.isCloseButtonVisible = isCloseButtonEnabled;
            }
        }

        /**
            * @ngdoc method
            * @name setWorkOrderOperationMaterialRequirementId
            *
            * @description
            * Sets the Work Order Operation Material Requirement for which the details are to be displayed.
            *
            * @param {string} workOrderOperationMaterialRequirementId the identifier of the given  Work Order Operation Material Requirement.
            */
        function setWorkOrderOperationMaterialRequirementId(workOrderOperationMaterialRequirementId) {
            vm.workOrderOperationMaterialRequirementId = workOrderOperationMaterialRequirementId;
            if (vm.actualmatmaterialdetailsDataConfig !== undefined && vm.actualmatmaterialdetailsDataConfig.deSelect !== undefined) {
                vm.actualmatmaterialdetailsDataConfig.deSelect();
            }
            if (vm.workOrderOperationMaterialRequirementId) {
                getContextInfo(vm.workOrderOperationMaterialRequirementId);

            } else {
                vm.workOrderOperationMaterialRequirementId = '00000000-0000-0000-0000-000000000000';
            }
        }

        function getContextInfo(workOrderOperationMaterialRequirementId) {
            commonService.findAll({
                appName: 'PICore',
                entityName: 'WorkOrderOperationActualMaterial',
                options: '$filter=Id eq ' + workOrderOperationMaterialRequirementId + '&$expand=WorkOrderOperation($expand=WorkOrder,'
                    + 'Facets($select=Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationExtended/ActualEquipmentNId))'
            }).then(function (result) {
                if (result !== undefined && result !== null && result.value !== undefined && result.value !== null) {
                    vm.materialNId = result.value[0].MaterialNId;
                    vm.materialRevision = result.value[0].MaterialRevision;
                    vm.workOrderOperationNId = result.value[0].WorkOrderOperation.NId;
                    vm.workOrderOperationId = result.value[0].WorkOrderOperation.Id;
                    vm.workOrder = result.value[0].WorkOrderOperation.WorkOrder.NId;
                    vm.workOrderId = result.value[0].WorkOrderOperation.WorkOrder.Id;
                    if (result.value[0].Quantity.QuantityValue && result.value[0].Quantity.UoMNId) {
                        vm.qty = result.value[0].Quantity.QuantityValue;
                        vm.uoMNId = result.value[0].Quantity.UoMNId;
                    } else {
                        vm.qty = '';
                        vm.uoMNId = '';
                    }
                    vm.sequence = result.value[0].Sequence;
                    vm.IsFrozen = result.value[0].IsFrozen;
                    vm.IsLocked = result.value[0].IsLocked;
                    vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addLot', !vm.IsFrozen && !vm.IsLocked);
                    vm.actualmatmaterialdetailsDataConfig.setVisibilityByActionName('addMTU', !vm.IsFrozen && !vm.IsLocked);
                    vm.equipmentGraphNId = result.value[0].EquipmentGraphNId;
                    vm.materialRequirementEquipmentNId = result.value[0].EquipmentNId;
                    vm.workOrderOperationActualEquipment = result.value[0].WorkOrderOperation.Facets[0].ActualEquipmentNId;
                    vm.lotOptionString = '$filter=MaterialNId eq %27' + vm.materialNId + '%27';
                    refreshMTUsAndLOTsByMaterialAndEquipmentGraph(vm.materialNId, vm.materialRevision, vm.equipmentGraphNId, vm.workOrderOperationActualEquipment);

                    setContextDetails();
                }
            }, function (reason) {
                logger.logErr('An error occurred retrieving the WorkOrder Operation Material Requirement with Id: ' + workOrderOperationMaterialRequirementId, reason);
            });
        }

        /**
       * @ngdoc method
       * @name refreshMTUsAndLOTsByMaterialAndEquipmentGraph
       *
       * @description
       * refresh the LOTs and MTUs tables
       *
       * @param {string} materialNId the material identifier.
       * @param {string} materialRevision the material revision.
       * @param {string} equipmentGraphConfigurationNId the equipmentGraphIdentifier.
       * @param {string} equipmentNId the equipment identifier.
       */
        function refreshMTUsAndLOTsByMaterialAndEquipmentGraph(materialNId, materialRevision, equipmentGraphConfigurationNId, equipmentNId) {
            //when actual equipment and equipmentGraph are specified
            if (equipmentNId && equipmentGraphConfigurationNId) {
                var parameters = {
                    'MaterialNId': materialNId,
                    'MaterialRevision': materialRevision,
                    'EquipmentGraphConfigurationNId': equipmentGraphConfigurationNId,
                    'EquipmentNId': equipmentNId
                };
                WorkOrderOperationService.get_MAT_MTUsAndLOTsByMaterialAndEquipmentFlowGraph(parameters)
                    .then(ongetMTUsAndLOTsByMaterialAndEquipmentFlowGraphSuccess, function (reason) {
                        logger.logErr('Error getting MTUs and LOTs by material and equipment flow graph', reason);
                        if (reason !== undefined && reason !== null && reason.errorCode !== undefined && reason.errorCode !== null) {
                            vm.overlay = {
                                text: reason.errorMessage,
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
                    });
            } else {
                //MTU
                vm.mtuCatalogTableConfig.dataSource.optionsString = '$expand=MaterialLot($select=NId),MaterialTrackingUnitAggregate($select=NId)&$filter=MaterialNId eq %27' + materialNId + '%27';
                vm.mtuOptionString = vm.mtuCatalogTableConfig.dataSource.optionsString;
                if (vm.mtuCatalogTableConfig.refreshData) {
                    vm.mtuCatalogTableConfig.refreshData();
                }
                //LOT
                vm.lotOptionString = '$filter=MaterialNId eq %27' + vm.materialNId + '%27';
                getLots(vm.lotOptionString);
            }
        }

        /**
        * @ngdoc event
        * @name ongetMTUsAndLOTsByMaterialAndEquipmentFlowGraphSuccess
        * @eventType broadcast on root scope
        * @description
        * Raised when the getMTUsAndLOTsByMaterialAndEquipmentFlowGraph service is called.
        *
        * @param {string} result.
        */
        function ongetMTUsAndLOTsByMaterialAndEquipmentFlowGraphSuccess(result) {
            vm.LotIds = result.value[0]['LotIds'];
            vm.MtuIds = result.value[0]['MTUIds'];
            vm.mtuCatalogTableConfig.dataSource.optionsString = '$expand=MaterialLot($select=NId)&$filter=MaterialNId eq %27'
                + vm.materialNId + '%27'
                + mtusOptionsString(vm.MtuIds);
            vm.mtuOptionString = vm.mtuCatalogTableConfig.dataSource.optionsString;
            //MTU
            if (vm.mtuCatalogTableConfig.refreshData) {
                vm.mtuCatalogTableConfig.refreshData();
            }
            //LOT
            vm.lotOptionString = '$filter=MaterialNId eq %27' + vm.materialNId + '%27' + lotsOptionsString(vm.LotIds);
            getLots(vm.lotOptionString);
        }

        /**
        * @ngdoc method
        * @name mtusOptionsString
        *
        * @description
        * create the option string by join all the elements in the input parameter.
        *
        * @param {string[]} the list of MtuIds.
        * @returns {string} the option string.
        */
        function mtusOptionsString(MtuIds) {
            if (MtuIds === undefined || MtuIds === null || MtuIds.length === 0) {
                return '';
            } else {
                var s = '';
                var filter = [];
                for (var i = 0; i < MtuIds.length; i++) {
                    filter.push('Id eq ' + MtuIds[i]);
                }
                if (filter.length > 0) {
                    s += ' and (' + filter.join(' or ') + ')';
                }
                return s;
            }
        }

        /**
        * @ngdoc method
        * @name lotsOptionsString
        *
        * @description
        * create the option string by join all the elements in the input parameter.
        *
        * @param {string[]} the list of LotIds.
        * @returns {string} the option string.
        */
        function lotsOptionsString(LotIds) {
            if (LotIds === undefined || LotIds === null || LotIds.length === 0) {
                return '';
            } else {
                var s = '';
                var filter = [];
                for (var i = 0; i < LotIds.length; i++) {
                    filter.push('Id eq ' + LotIds[i]);
                }
                if (filter.length > 0) {
                    s += ' and (' + filter.join(' or ') + ')';
                }
                return s;
            }
        }

        function setContextDetails() {
            vm.NoData = false;
            vm.workOrderOperationactualmatmaterialdetailsPropertyGridData = [
                {
                    id: 'WorkOrder',
                    label: $translate.instant('picore.headers.propertyGrids.workOrder'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrder,
                    validation: {}
                },
                {
                    id: 'WorkOrderOperation',
                    label: $translate.instant('picore.headers.propertyGrids.workOrderOperation'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderOperationNId,
                    validation: {}
                },
                {
                    id: 'Equipment',
                    label: $translate.instant('picore.headers.propertyGrids.equipmentNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.materialRequirementEquipmentNId,
                    validation: {}
                },
                {
                    id: 'EquipmentFlow',
                    label: $translate.instant('picore.headers.propertyGrids.equipmentGraphNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.equipmentGraphNId,
                    validation: {}
                },
                {
                    id: 'MaterialNId',
                    label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.materialNId,
                    validation: {}
                },
                {
                    id: 'Quantity',
                    label: $translate.instant('picore.headers.propertyGrids.quantity'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.qty + '  ' + vm.uoMNId,
                    validation: {}
                },
                {
                    id: 'Sequence',
                    label: $translate.instant('picore.headers.propertyGrids.sequence'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.sequence,
                    validation: {}
                }
            ];
        }

        /**
         * @ngdoc method
         * @name setActionBarVisibility
         *
         * @description
         * Sets the visibility of the action commands.
         *
         * @param {boolean} isActionBarVisible Indicates wether the action bar is visible in the top right side of the grid.
         */
        function setActionBarVisibility(isActionBarVisible) {
            if (isActionBarVisible !== undefined && isActionBarVisible !== null) {
                vm.toolbarVisible = isActionBarVisible;
            }
        }

        function displayOverlay() {
            messageOverlay.show();
        }

        function removeOverlay() {
            messageOverlay.hide();
        }
    }
})();
