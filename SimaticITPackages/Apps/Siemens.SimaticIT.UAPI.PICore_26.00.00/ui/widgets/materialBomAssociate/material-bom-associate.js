/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiMaterialBomAssociate', materialBomAssociate);

    function materialBomAssociate() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/materialBomAssociate/material-bom-associate.html',
            controller: materialBomAssociateController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onInitApi: '&'
            }
        };
    }

    materialBomAssociateController.$inject = ['$rootScope',
        '$scope',
        'common.services.logger.service',
        'common.services.component.uiComponentService',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.bomService',
        'common.widgets.messageOverlay.service',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        '$translate',
        '$q', 'common.widgets.globalDialog.service'];
    function materialBomAssociateController($rootScope,
        $scope,
        loggerService,
        uiComponentService,
        base,
        dataService,
        messageOverlay,
        commonService,
        $translate,
        $q, dialogService) {
        var vm = this;
        var logger;
        var backendService = base.services.runtime.backendService;
        vm.dialogService = dialogService;
        var internalService = {
            findAll: findAll
        };
        vm.onActionClicked = onActionClicked;
        vm.toolbarLabels = {
            action: {
                associateBtn: $translate.instant('picore.buttonsAndTooltips.associate'),
                removeAssociationBtn: $translate.instant('picore.buttonsAndTooltips.removeAssociation')
            }
        };

        vm.materialBoMAssociationComponentTitle = $translate.instant('picore.titles.materialToBoMAssociationComponentTitle');
        vm.materialTableTitle = $translate.instant('picore.titles.materialTableTitle');
        vm.boMTableTitle = $translate.instant('picore.titles.boMTableTitle');
        vm.associateBoMTitle = $translate.instant('picore.titles.associateBoMTitle');
        vm.translatedAssociate = $translate.instant('picore.buttonsAndTooltips.set');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('materialbomset');
            init();
            registerEvents();
        }

        function init() {
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
            logger.logDebug('Initializing component....', vm.name);
            vm.materialId = null;
            vm.materialNId = null;
            vm.materialRevision = null;
            vm.bomId = null;
            vm.bomNId = null;
            vm.bomRevision = null;
            vm.bomMaterialNId = null;
            vm.bomMaterialRevision = null;
            vm.isMatSelected = false;
            vm.isBomSelected = false;
            initMatTableData();
            initBomTableData();
            initBomToAssociateTableData();
            initBomItemsTableData();
            initDialogData();
            vm.onAssociate = onAssociate;
            vm.onRemoveAssociation = onRemoveAssociation;
            vm.cancel = cancel;
        }

        function initDialogData() {
            vm.associateBoMButtonsList = [
                {
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.save'),
                    onClickCallback: onAssociate,
                    disabled: true
                },
                {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                    onClickCallback: function () {
                        vm.dialogService.hide();
                        vm.isForDialog = false;
                        vm.bomDataConfig.deSelect();
                        vm.bomDataConfig.setButtonVisible(1, false);
                    }
                }];
            vm.associateBoMTemplate = 'Siemens.SimaticIT.UAPI.PICore/widgets/materialBomAssociate/material-bom-to-choose.html';
            vm.associateBoMData = {
                'onToggle': onToggle,
                'showBoMItems': $translate.instant('picore.notifications.dialogs.showBoMItems'),
                'hideBoMItems': $translate.instant('picore.notifications.dialogs.hideBoMItems'),
                'isCollapsed': true,
                'bomToAssociateSelected': vm.isBomToAssociateSelected,
                'bomToAssociateTableConfig': vm.bomToAssociateTableConfig,
                'bomToAssociateDataConfig': vm.bomToAssociateDataConfig,
                'bomItemTableConfig': vm.bomItemTableConfig,
                'bomItemDataConfig': vm.bomItemDataConfig
            };
            vm.associateBomDialog = {
                title: vm.associateBoMTitle,
                templatedata: vm.associateBoMData,
                templateuri: vm.associateBoMTemplate,
                buttons: vm.associateBoMButtonsList
            };

        }

        function onToggle() {
            vm.associateBoMData.isCollapsed = !vm.associateBoMData.isCollapsed;
        }

        function initBomItemsTableData() {

            vm.bomItemDataConfig = {
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
                ]
            };

            vm.bomItemTableFields = {
                'NId': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.nId')
                },
                'Name': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.name')
                },
                'Description': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.description')
                },
                'MaterialNId': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId')
                },
                'MaterialRevision': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialRev')
                },
                'Quantity.UoMNId': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM')
                },
                'Quantity.QuantityValue': {
                    sorting: false,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.quantity')
                }
            };
            vm.emptyBomId = '00000000-0000-0000-0000-000000000000';
            vm.bomItemTableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'BillOfMaterialsItem',
                    optionsString: '&$filter=BillOfMaterials_Id eq ' + vm.emptyBomId + ' and IsLocked eq false and IsFrozen eq false'
                },
                selectionMode: 'none',
                fields: vm.bomItemTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };
        }

        $scope.$watch('vm.bomToAssociateId', function (newValue) {
            if (newValue) {
                vm.bomItemsRequested = true;
                vm.bomItemTableConfig.dataSource.optionsString = '&$filter=BillOfMaterials_Id eq ' + newValue + ' and IsLocked eq false and IsFrozen eq false';
                if (vm.bomItemTableConfig && vm.bomItemTableConfig.refreshData) {
                    vm.bomItemTableConfig.refreshData();
                }
            }
        }, true
        );

        function initBomToAssociateTableData() {

            vm.bomToAssociateDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.boMNId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Revision',
                        DisplayName: $translate.instant('picore.headers.tables.boMRev')
                    },
                    {
                        Key: 'IsCurrent',
                        DisplayName: $translate.instant('picore.headers.tables.isCurrent'),
                        IsBoolean: true
                    },
                    {
                        Key: 'Name',
                        DisplayName: $translate.instant('picore.headers.tables.name')
                    },
                    {
                        Key: 'Description',
                        DisplayName: $translate.instant('picore.headers.tables.description')
                    },
                    {
                        Key: 'ReferenceQuantity.UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                ],
                onPiSelectionChangeCallback: onPiTableBomToAssociateSelected
            };

            vm.bomToAssociateTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.boMNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'Revision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.boMRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'IsCurrent': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.isCurrent'),
                    filtering: {
                        type: 'boolean',
                        allowedCompareOperators: vm.booleanOperators,
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
                        validation: {}
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
                        validation: {}
                    }
                },
                'ReferenceQuantity.UoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                }
            };

            vm.bomToAssociateTableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'BillOfMaterials',
                    optionsString: '$expand=Facets($select='
                        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialNId,'
                        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialRevision)&$filter=IsLocked eq false'
                },
                selectionMode: 'single',
                fields: vm.bomToAssociateTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };
        }

        function onPiTableBomToAssociateSelected(list, item) {
            if (item) {
                vm.bomToAssociateId = item.Id;
                vm.bomToAssociateNId = item.NId;
                vm.bomToAssociateRevision = item.Revision;
                vm.bomToAssociateMaterialNId = vm.materialNId;
                vm.bomToAssociateMaterialRevision = vm.materialRevision;
                vm.isBomToAssociateSelected = true;
                vm.associateBoMData.bomToAssociateSelected = true;
                vm.associateBoMButtonsList[0].disabled = false;
                vm.associateBoMData.isCollapsed = true;
                if (item.Facets && item.Facets.length === 1 && item.Facets[0].MaterialNId) {
                    vm.bomAlreadyAssigned = true;
                } else {
                    vm.bomAlreadyAssigned = false;
                }

            } else {
                vm.bomToAssociateId = null;
                vm.bomToAssociateNId = null;
                vm.bomToAssociateRevision = null;
                vm.bomToAssociateMaterialNId = null;
                vm.bomToAssociateMaterialRevision = null;
                vm.isBomToAssociateSelected = false;
                vm.associateBoMButtonsList[0].disabled = true;
                vm.associateBoMData.bomToAssociateSelected = false;
                vm.associateBoMData.isCollapsed = true;
            }
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
                            filter = array[i];
                            delete array[i];
                        } else {
                            filter += ' and ' + array[i].substr(8, array[i].length);
                            delete array[i];
                        }
                    }
                }
                array.push(filter);
                //newOptions = array.join('&'); put & at the beginning of the first element
                angular.forEach(array, function (value) {
                    newOptions += value + '&';
                });
                newOptions = newOptions.substring(0, newOptions.length - 1);

            } else {
                if (countFilterOccurances !== 0) {
                    newOptions = serverDataOptions.options;
                }
            }

            // removing already associated material
            if (queryModel.entityName === 'BillOfMaterials') {
                var removeClause = '';
                if (vm.isForDialog) {
                    removeClause = ' and (Facets/all(f%3Af/Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialNId ne \''
                        + vm.materialNId + '\' or f/Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialRevision ne \''
                        + vm.materialRevision + '\'))';
                } else {
                    removeClause = ' and (Facets/any(f%3Af/Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialNId eq \''
                        + vm.materialNId + '\' and f/Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialRevision eq \''
                        + vm.materialRevision + '\'))';
                }
                newOptions += removeClause;
            }

            queryModel.options = newOptions ? newOptions : serverDataOptions.options;
            var deffer = $q.defer();

            backendService.findAll(queryModel).then(function (data) {

                deffer.resolve(data);
                if (vm.bomDataConfig && vm.bomDataConfig.setButtonVisible) {
                    vm.bomDataConfig.setButtonVisible(0, true);
                    vm.bomDataConfig.setButtonVisible(1, false);
                }
            }).catch(function (err) {
                deffer.reject(err);
            });
            return deffer.promise;
        }

        function onActionClicked(commandName) {
            switch (commandName) {
                case 'associate':
                    vm.dialogService.set(vm.associateBomDialog);
                    vm.dialogService.show();
                    vm.isForDialog = true;
                    break;
                case 'removeAssociation':
                    onRemoveAssociation();
                    break;
            }
        }

        function initMatTableData() {
            vm.matDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Revision',
                        DisplayName: $translate.instant('picore.headers.tables.materialRev')
                    },
                    {
                        Key: 'IsCurrent',
                        DisplayName: $translate.instant('picore.headers.tables.isCurrent'),
                        IsBoolean: true
                    },
                    {
                        Key: 'Name',
                        DisplayName: $translate.instant('picore.headers.tables.name')
                    },
                    {
                        Key: 'Description',
                        DisplayName: $translate.instant('picore.headers.tables.description')
                    },
                    {
                        Key: 'UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }],
                onPiSelectionChangeCallback: onPiTableMatSelected
            };

            vm.matTableFields = {
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
                'Revision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'IsCurrent': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.isCurrent'),
                    filtering: {
                        type: 'boolean',
                        allowedCompareOperators: vm.booleanOperators,
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
                        validation: {}
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
                        validation: {}
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
                        validation: {}
                    }
                }

            };

            vm.matTableConfig = {
                data: [],
                dataSource: {
                    dataService: commonService,
                    appName: 'PICore',
                    dataEntity: 'MAT_Material',
                    optionsString: '$filter=IsLocked eq false and IsFrozen eq false'
                },
                selectionMode: 'single',
                fields: vm.matTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };

        }

        function onPiTableMatSelected(list, item) {
            if (item) {
                vm.materialId = item.Id;
                vm.materialNId = item.NId;
                vm.materialRevision = item.Revision;
                vm.bomTableConfig.refreshData();
                vm.isMatSelected = true;
                vm.isBomSelected = false;
            } else {
                vm.materialId = null;
                vm.materialNId = null;
                vm.materialRevision = null;
                vm.bomTableConfig.refreshData();
                vm.isMatSelected = false;
                vm.isBomSelected = false;
            }
        }

        function initBomTableData() {
            vm.bomDataConfig = {
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.boMNId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Revision',
                        DisplayName: $translate.instant('picore.headers.tables.boMRev')
                    },
                    {
                        Key: 'IsCurrent',
                        DisplayName: $translate.instant('picore.headers.tables.isCurrent'),
                        IsBoolean: true
                    },
                    {
                        Key: 'Name',
                        DisplayName: $translate.instant('picore.headers.tables.name')
                    },
                    {
                        Key: 'Description',
                        DisplayName: $translate.instant('picore.headers.tables.description')
                    },
                    {
                        Key: 'ReferenceQuantity.UoMNId',
                        DisplayName: $translate.instant('picore.headers.tables.uoM')
                    }
                ],
                onPiSelectionChangeCallback: onPiTableBomSelected
            };

            vm.bomTableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.boMNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'Revision': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.boMRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'IsCurrent': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.isCurrent'),
                    filtering: {
                        type: 'boolean',
                        allowedCompareOperators: vm.booleanOperators,
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
                        validation: {}
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
                        validation: {}
                    }
                },
                'ReferenceQuantity.UoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: {}
                    }
                }
            };

            vm.bomTableConfig = {
                data: [],
                dataSource: {
                    dataService: internalService,
                    appName: 'PICore',
                    dataEntity: 'BillOfMaterials',
                    optionsString: '$expand=Facets($select='
                        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialNId,'
                        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.BillOfMaterialsExtended/MaterialRevision)&$filter=IsLocked eq false'

                },
                selectionMode: 'single',
                fields: vm.bomTableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5
            };

            vm.toolbarButtons = [
                {
                    icon: 'fa-link',
                    cmdIcon: 'Link',
                    name: 'associate',
                    label: vm.toolbarLabels.action.associateBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                },
                {
                    icon: 'fa-chain-broken',
                    cmdIcon: 'Unlink',
                    name: 'removeAssociation',
                    label: vm.toolbarLabels.action.removeAssociationBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                }
            ];

        }

        function onPiTableBomSelected(list, item) {
            if (item) {
                vm.bomId = item.Id;
                vm.bomNId = item.NId;
                vm.bomRevision = item.Revision;
                vm.bomMaterialNId = item.Facets !== undefined && item.Facets !== null && item.Facets.length > 0 ? item.Facets[0].MaterialNId : undefined;
                vm.bomMaterialRevision = item.Facets !== undefined && item.Facets !== null && item.Facets.length > 0 ? item.Facets[0].MaterialRevision : undefined;
                vm.isBomSelected = true;
                if (vm.bomDataConfig && vm.bomDataConfig.setButtonVisible) {
                    vm.bomDataConfig.setButtonVisible(0, true);
                    vm.bomDataConfig.setButtonVisible(1, true);
                }
            } else {
                vm.bomId = null;
                vm.bomNId = null;
                vm.bomRevision = null;
                vm.bomMaterialNId = null;
                vm.bomMaterialRevision = null;
                vm.isBomSelected = false;
                if (vm.bomDataConfig && vm.bomDataConfig.setButtonVisible) {
                    vm.bomDataConfig.setButtonVisible(0, true);
                    vm.bomDataConfig.setButtonVisible(1, false);
                }
            }
        }

        function cancel() {
            $scope.$emit('materialBoMAssociationCancel');
            var bomTableSettings = vm.bomTableConfig.getSettings();
            var matTableSettings = vm.matTableConfig.getSettings();
            if (bomTableSettings !== undefined && bomTableSettings !== null) {
                bomTableSettings.selectedRows = [];
                vm.bomTableConfig.applySettings(bomTableSettings);
            }
            if (matTableSettings !== undefined && matTableSettings !== null) {
                matTableSettings.selectedRows = [];
                vm.matTableConfig.applySettings(matTableSettings);
            }
        }

        function onAssociate() {
            if (vm.isBomToAssociateSelected && vm.isMatSelected) {

                if (vm.bomAlreadyAssigned) {
                    vm.overlay = {
                        text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmChangeMaterialAssociationText'),
                        title: $translate.instant('picore.notifications.warnings.warningTitle'),
                        buttons: [{
                            id: 'okButton',
                            displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                            onClickCallback: function () {
                                removeOverlay();
                                associate();
                            }
                        }, {
                            id: 'cancelButton',
                            displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                            onClickCallback: function () {
                                removeOverlay();
                            }
                        }]
                    };
                    dialogService.hide();
                    vm.isForDialog = false;
                    messageOverlay.set(vm.overlay);
                    displayOverlay();
                } else {
                    if (vm.materialNId !== vm.bomMaterialNId && vm.materialRevision !== vm.bomMaterialRevision) {
                        associate();
                    }
                }
            }
        }


        function onRemoveAssociation() {
            if (vm.isBomSelected && vm.isMatSelected) {

                vm.overlay = {
                    text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmRemoveMaterialAssociationText'),
                    title: $translate.instant('picore.notifications.warnings.warningTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            removeAssociation();
                            removeOverlay();
                        }
                    }, {
                        id: 'cancelButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
                        onClickCallback: function () {
                            removeOverlay();
                        }
                    }]
                };

                messageOverlay.set(vm.overlay);
                displayOverlay();

            }
        }

        function associate() {
            if (vm.bomToAssociateNId !== undefined && vm.materialNId !== undefined && vm.materialRevision !== undefined) {
                dataService.createBillOfMaterialsExtended(vm.bomToAssociateId, vm.materialNId, vm.materialRevision, null).then(onAssociateSuccess, onAssociateFail);
            }
        }

        function removeAssociation() {
            dataService.deleteBillOfMaterialsExtended(vm.bomId).then(onAssociationRemovalSuccess, onAssociationRemovalFail);
        }

        function onAssociateSuccess() {
            $scope.$emit('materialBoMSuccessfulAssociation', { 'materialId': vm.materialId, 'bomId': vm.bomToAssociateId });
            vm.bomTableConfig.refreshData();
            vm.dialogService.hide();
            vm.isForDialog = false;
        }

        function onAssociationRemovalSuccess() {
            $scope.$emit('materialBoMSuccessfulAssociation', { 'materialId': vm.materialId });
            vm.bomTableConfig.refreshData();
            onPiTableBomSelected(null, null);
        }

        function onAssociateFail(reason) {
            dialogService.hide();
            vm.isForDialog = false;
            logger.logErr('Error associating material to bill of materials. ', reason);
        }
        function onAssociationRemovalFail(reason) {
            logger.logErr('Error removing material association to bill of materials. ', reason);
        }

        function registerEvents() {
            $scope.$on('$destroy', deregisterEvents);
        }

        function deregisterEvents() {

        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }
    }
})();
