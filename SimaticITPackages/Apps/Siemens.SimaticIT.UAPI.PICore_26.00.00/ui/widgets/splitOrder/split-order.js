/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiSplitOrder', splitOrderDirective);

    function splitOrderDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/splitOrder/split-order.html',
            controller: splitOrderController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterCreateApi: '&',
                id: '@'
            }
        };
    }

    splitOrderController.$inject = ['$scope',
	'$rootScope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'Siemens.SimaticIT.UAPI.PICore.OrderService',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderService',
        'Siemens.SimaticIT.UAPI.PICore.WorkMasterService',
        'common.widgets.messageOverlay.service',
        '$translate',
        '$filter',
        'Siemens.SimaticIT.UAPI.PICore.extensionService',
        'Siemens.SimaticIT.UAPI.PICore.commonService'
    ];
    function splitOrderController($scope,
	$rootScope,
        common,
        loggerService,
        dataService,
        orderService,
        workOrderDataService,
        workMasterDataService,
        messageOverlay,
        $translate,
        $filter,
        extService,
        commonService) {
        var vm = this;
        var extCmdToCall;
        var logger;
        var toBeDestroyed = [];
        init();
        vm.notCanceled = true;
        vm.translatedNId = $translate.instant('picore.headers.propertyGrids.nId');
        vm.translatedRevision = $translate.instant('picore.headers.propertyGrids.revision');
        vm.translatedOrder = $translate.instant('picore.headers.propertyGrids.orderNId');
        vm.translatedWorkMaster = $translate.instant('picore.headers.propertyGrids.workMaster');
        vm.translatedWorkMasterRevision = $translate.instant('picore.headers.propertyGrids.workMasterRev');
        vm.translatedName = $translate.instant('picore.headers.propertyGrids.name');
        vm.translatedDescription = $translate.instant('picore.headers.propertyGrids.description');
        vm.translatedDefaultTemplate = $translate.instant('picore.headers.propertyGrids.useDefaultTemplate');
        vm.translatedTemplate = $translate.instant('picore.headers.propertyGrids.template');
        vm.translatedMaterial = $translate.instant('picore.headers.propertyGrids.materialNId');
        vm.translatedMaterialRevision = $translate.instant('picore.headers.propertyGrids.materialRev');
        vm.translatedQuantity = $translate.instant('picore.headers.propertyGrids.quantity');
        vm.translatedUoM = $translate.instant('picore.headers.propertyGrids.uoM');
        vm.numberOfWorkOrders = $translate.instant('picore.headers.propertyGrids.numberOfWorkOrders');
        vm.translatedUnplannedQuantity = $translate.instant('picore.headers.propertyGrids.unplannedQuantity');
        vm.translatedPlannedStartTime = $translate.instant('picore.headers.propertyGrids.plannedStartTime');
        vm.translatedPlannedEndTime = $translate.instant('picore.headers.propertyGrids.plannedEndTime');
        vm.translatedActualStartTime = $translate.instant('picore.headers.propertyGrids.actualStartTime');
        vm.translatedSave = $translate.instant('picore.buttonsAndTooltips.save');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');

        function init() {
            logger = loggerService.getModuleLogger('splitOrder directive...');
            vm.dataReady = false;
            vm.isComponentTitleVisible = true;
            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;
            vm.workOrderData = {};
            vm.isEdit = false;
            vm.NoData = false;
            vm.ngReadonly = false;
            vm.notCanceled = true;
            vm.materialsData = [];
            vm.materialsAndRevisionData = [];
            vm.materialRevisions = [];
            vm.workMasterAndRevisionData = [];
            vm.workOrderTplData = [];
            vm.uomData = [];
            vm.UoM = {};
            vm.save = save;
            vm.cancel = cancel;
            vm.workOrderId = '';
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
            vm.tempCurrentData = {};
            vm.currentData = {
                DefaultTemplate: [{ checked: false }]
            };
            vm.disableTemplate = disableTemplate;
            vm.noDefaultTemplate = false;
            vm.setMaterials = setMaterials;
            vm.setRevisions = setRevisions;
            vm.setRevision = setRevision;
            vm.setUoM = setUoM;
            vm.setTemplate = setTemplate;
            vm.wmRevVisible = false;
            vm.unplQtyVisible = false;
            vm.woPropertyExtData = [];
            vm.customData = {};
            vm.extPropertiesObject = null;
            vm.api = {
                setExtendedProperties: setExtendedProperties,
                showTitle: showTitle,
                showCancelButton: showCancelButton
            };
            vm.title = $translate.instant('picore.titles.createWorkOrdersTitle');

            vm.onRegisterCreateApi({ api: vm.api });

            workOrderDataService.getWorkOrderTemplates()
                .then(onGetWorkOrderTemplatesSuccess, function (reason) {
                    logger.logErr('Error Work Order templates', reason);
                });
            dataService.getMaterials('$select=NId,Name,Revision,UoMNId,IsCurrent&$expand=MaterialGroups&$orderby=NId%20asc')
                .then(onGetMaterialSuccess, function (reason) {
                    logger.logErr('Error getting materials', reason);
                });
            dataService.getUoMs('$select=NId,Id,Name&$orderby=NId%20asc')
                .then(onGetUoMSuccess, function (reason) {
                    logger.logErr('Error getting unit of measures', reason);
                });
            registerEvents();
            setData();
        }

        function showTitle(isVisible) {
            vm.isComponentTitleVisible = isVisible;
        }

        function showCancelButton(isVisible) {
            vm.isCancelBtnVisible = isVisible;
        }

        function setExtendedProperties(extendedEntityNames, extendedFacetNames, extPropertiesObject, saveCmdExt) {
            vm.extPropertiesObject = extPropertiesObject;
            vm.woPropertyExtData = commonService.applyPropertyGridColumnsConfiguration(extPropertiesObject, true);
            extCmdToCall = saveCmdExt;
            if (extPropertiesObject) {
                commonService.applyValuesToConfiguredSitPropertyGridFields(vm.woPropertyExtData, vm.mtuData);
            }
        }

        function disableTemplate() {
            vm.currentData.disabledTemplate = !vm.currentData.disabledTemplate;
            if (vm.currentData.disabledTemplate) {
                vm.currentData.TemplateNId = { id: '' };
            }
        }

        function registerEvents() {
            toBeDestroyed[toBeDestroyed.length] = $rootScope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
            toBeDestroyed[toBeDestroyed.length + 1] = $scope.$on('sit-pi-entity-browser.entity-selected', onPickerSelected);
            $scope.$on('$destroy', deregisterEvents);
        }

        function deregisterEvents() {
            for (var i = 0; i < toBeDestroyed.length; i++) {
                toBeDestroyed[i] = null;
            }
        }

        function onPickerSelected(event, data) {
            vm.dataReady = true;
            if (data && data.item === '') {
                vm.unplQtyVisible = false;
                vm.currentData.WorkMasterNId = '';
                vm.currentData.WorkMasterRevision = '';
                vm.currentData.MaterialNId = { id: '', uomNid: '' };
                vm.currentData.MaterialRevision = { revision: '' };
                vm.currentData.Quantity = '';
                vm.currentData.QuantityUoMNId = { nid: '' };
                vm.currentData.PlannedStartTime = '';
                vm.currentData.PlannedEndTime = '';
                vm.wmRevVisible = false;
            } else {
                if (data && data.item && data.item.EntityType === 'Siemens.SimaticIT.UAPI.OperationalData.PIOrder_OP.OPModel.DataModel.Order') {
                    vm.currentData.OrderNId = data.item.NId;
                    vm.currentData.PlannedStartTime = data.item.PlannedStartTime;
                    vm.currentData.PlannedEndTime = data.item.PlannedEndTime;
                    var params = {
                        OrderNId: vm.currentData.OrderNId
                    };
                    orderService.calculateUnplannedQty(params).then(function (result) {
                        if (result !== undefined && result !== null && result.value !== undefined && result.value !== null) {
                            vm.unplQtyVisible = true;
                            vm.currentData.unPlannedQuantity = result.value[0].UnplannedQuantity.QuantityValue !== null
                                ? result.value[0].UnplannedQuantity.QuantityValue.toString() + ' ' + result.value[0].UnplannedQuantity.UoMNId
                                : 'n/a';
                        }
                    }, function (reason) {
                        logger.logErr('An error occurred either retrieving the uplanned quantity for the order: ' + vm.currentData.OrderNId);
                    });
                } else {
                    if (vm.currentData && data.item) {
                        vm.currentData.WorkMasterNId = data.item.NId;
                        vm.currentData.WorkMasterRevision = data.item.Revision;
                        vm.currentData.MaterialNId = { id: data.item.MaterialNId, uomNid: data.item.Quantity.UoMNId };
                        vm.currentData.MaterialRevision = { revision: data.item.MaterialRevision };
                        vm.currentData.Quantity = data.item.Quantity.QuantityValue;
                        var uom = data.item.Quantity.QuantityValue !== null ? data.item.Quantity.UoMNId : '';
                        vm.currentData.QuantityUoMNId = { nid: uom };
                        vm.wmRevVisible = true;
                    } else {
                        vm.currentData.WorkMasterNId = '';
                        vm.currentData.WorkMasterRevision = '';
                        vm.currentData.MaterialNId = { id: '', uomNid: '' };
                        vm.currentData.MaterialRevision = { revision: '' };
                        vm.currentData.Quantity = '';
                        vm.currentData.QuantityUoMNId = { nid: '' };
                        vm.wmRevVisible = false;
                        vm.currentData.PlannedStartTime = '';
                        vm.currentData.PlannedEndTime = '';
                    }
                }
            }
        }

        function onPropertyGridValidityChange(event, params) {
            vm.validInputs = params.validity;
        }

        function save() {
            gatherAndManageExtendedCurrentData();
            if (extCmdToCall === '' || extCmdToCall === null || extCmdToCall === undefined) {
                orderService.createWorkOrders(vm.currentData).then(onCreationSuccess, function (reason) {
                    logger.logErr('Error creating work orders', reason);
                    vm.validInputs = false;
                });
            } else {
                extService.createWorkOrderExt(extCmdToCall, vm.currentData, vm.customData).then(onExtendedCreationSuccess, function (reason) {
                    logger.logErr('Error creating Work Orders Custom Extension', reason);
                    vm.validInputs = false;
                });
            }
        }

        function onExtendedCreationSuccess(result) {
            vm.workOrderId = result.data.Id;
            $scope.$emit('WorkOrderCreated', vm.workOrderId);
            vm.validInputs = false;
            vm.tempCurrentData = {};
            vm.widgetAttributesOrdersPicker['sit-value'] = '';
            vm.currentData = {
                DefaultTemplate: [{ checked: false }]
            };
            vm.wmRevVisible = false;
            vm.validInputs = false;
            vm.tempCurrentData = {};
            vm.widgetAttributesOrdersPicker['sit-value'] = '';
            vm.currentData = {
                DefaultTemplate: [{ checked: false }]
            };
            vm.currentData.QuantityUoMNId = { nid: '' };
            vm.unplQtyVisible = false;
            vm.wmRevVisible = false;

        }

        function gatherAndManageExtendedCurrentData() {
            if (vm.woPropertyExtData !== undefined && vm.woPropertyExtData !== null) {
                for (var i = 0; i < vm.woPropertyExtData.length; i++) {
                    var propertyName = vm.woPropertyExtData[i].id;
                    for (var j = 0; j < vm.extPropertiesObject.length; j++) {
                        if (vm.extPropertiesObject[i].PropertyName === propertyName) {
                            propertyName = vm.extPropertiesObject[i].Id;
                            break;
                        }
                    }
                    switch (vm.woPropertyExtData[i].widget) {
                        case 'sit-checkbox':
                            vm.customData[propertyName] = vm.woPropertyExtData[i].value[0].checked;
                            break;
                        case 'sit-date-time-picker':
                            if (vm.woPropertyExtData[i].value !== '') {
                                vm.customData[propertyName] = vm.woPropertyExtData[i].value;
                            } else {
                                vm.customData[propertyName] = [];
                            }
                            break;
                        default:
                            vm.customData[propertyName] = vm.woPropertyExtData[i].value;

                    }
                }
            }
        }

        function cancel() {
            vm.validInputs = false;
            vm.currentData = {
                DefaultTemplate: [{ checked: false }]
            };
            vm.tempCurrentData = {};
            vm.widgetAttributesOrdersPicker['sit-value'] = '';
            vm.widgetAttributesWorkMasterPicker['sit-value'] = '';
            vm.currentData.QuantityUoMNId = { nid: '' };
            vm.wmRevVisible = false;
            vm.unplQtyVisible = false;
            $scope.$emit('WorkOrdersCreationCancel');
        }

        function onGetWorkOrderTemplatesSuccess(data) {
            if (data.value.length <= 0) {
                vm.noDefaultTemplate = true;
            }
            for (var i = 0; i < data.value.length; i++) {
                if (data.value[i].IsDefault) {
                    vm.noDefaultTemplate = false;
                }
                vm.workOrderTplData[i] = { id: data.value[i].NId, name: data.value[i].Name };
            }
            vm.dataReady = true;
        }

        function onCreationSuccess(result) {
            vm.workOrderIds = result.data.Ids;
            $scope.$emit('WorkOrdersCreated', vm.workOrderIds);
            vm.validInputs = false;
            vm.tempCurrentData = {};
            vm.widgetAttributesOrdersPicker['sit-value'] = '';
            vm.currentData = {
                DefaultTemplate: [{ checked: false }]
            };
            vm.tempCurrentData = {};
            vm.widgetAttributesOrdersPicker['sit-value'] = '';
            vm.widgetAttributesWorkMasterPicker['sit-value'] = '';
            vm.currentData.QuantityUoMNId = { nid: '' };
            vm.unplQtyVisible = false;
            vm.wmRevVisible = false;
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }

        function onGetMaterialSuccess(data) {
            vm.materialsAndRevisionData = [];
            vm.materialsData = [];
            var setMaterialNId = false;
            for (var i = 0; i < data.value.length; i++) {
                var found = false;
                for (var j = 0; j < vm.materialsData.length; j++) {
                    if (data.value[i].NId === vm.materialsData[j].id) {
                        found = true;
                        vm.materialsData[j] = { id: data.value[i].NId, name: data.value[i].Name, uomNid: data.value[i].UoMNId };
                    }
                }
                if (found === false) {
                    vm.materialsData.push({ id: data.value[i].NId, name: data.value[i].Name, uomNid: data.value[i].UoMNId });
                }
                vm.materialsAndRevisionData.push({
                    id: data.value[i].NId,
                    name: data.value[i].Name,
                    revision: data.value[i].Revision,
                    uomNid: data.value[i].UoMNId,
                    IsCurrent: data.value[i].IsCurrent
                });
                if (vm.tempCurrentData.MaterialNId !== undefined && vm.tempCurrentData.MaterialNId.id === data.value[i].NId) {
                    setMaterialNId = true;
                    vm.tempCurrentData.MaterialNId = { id: data.value[i].NId, name: data.value[i].Name, uomNid: data.value[i].UoMNId };
                }
            }
            vm.widgetAttributesMaterial = {
                'sit-options': vm.materialsData,
                'sit-to-display': 'id',
                'sit-to-keep': 'id'
            };
            if (setMaterialNId === true) {
                vm.currentData.MaterialNId = vm.tempCurrentData.MaterialNId;
            }
        }

        function onGetUoMSuccess(data) {
            vm.uomData = [];
            for (var i = 0; i < data.value.length; i++) {
                vm.uomData.push({ id: data.value[i].Id, nid: data.value[i].NId, name: data.value[i].Name });
            }
            vm.widgetAttributesUoM = {
                'sit-options': vm.uomData,
                'sit-to-display': 'nid',
                'sit-to-keep': 'nid'
            };
        }

        function onGetUoMSuccessGetRelated(data) {
            vm.UoM = {};
            if (data.value.length === 1) {
                dataService.getRelatedUoMs(data.value[0], '$select=NId')
                    .then(onGetRelatedUoMSuccess, function (reason) {
                        logger.logErr('Error getting related unit of measures', reason);
                    });
                vm.UoM = { id: data.value[0].Id, nid: data.value[0].NId, name: data.value[0].Name, uomBaseId: data.value[0].UoMBase_Id };
            }
        }

        function onGetRelatedUoMSuccess(data) {
            vm.uomData = [];
            var cnt = data.value.length;
            if (data.value.length === 1) {
                if (data.value[0].UoMBase_Id === null) {
                    vm.baseUoM = { id: data.value[0].Id, nid: data.value[0].NId, name: data.value[0].Name, uomBaseId: data.value[0].UoMBase_Id };
                    dataService.getRelatedUoMs(data.value[0], '$select=NId&$orderby=NId%20asc')
                        .then(onGetRelatedUoMSuccess, function (reason) {
                            logger.logErr('Error getting related unit of measures', reason);
                        });
                }
            } else {
                if (vm.baseUoM && vm.baseUoM.id !== data.value[0].UoMBase_Id) {
                    vm.baseUoM = null;
                }
                for (var i = 0; i < cnt ; i++) {
                    vm.uomData.push({ id: data.value[i].Id, nid: data.value[i].NId, name: data.value[i].Name });
                }
                if (vm.baseUoM) {
                    vm.uomData.push(vm.baseUoM);
                }
                if (!vm.baseUoM && vm.UoM) {
                    vm.uomData.push(vm.UoM);
                }
            }
            vm.currentData.QuantityUoMNId = vm.UoM;

            if (vm.uomData.length > 0 && vm.uomData[0].nid !== '') {
                vm.uomData.unshift({ nid: '' });
            }
            vm.widgetAttributesUoM = {
                'sit-options': vm.uomData,
                'sit-to-display': 'nid',
                'sit-to-keep': 'nid'
            };
        }

        function setMaterials(oldVal, newVal) {
            vm.materialsData = [];
            vm.materialRevisions = [];
            vm.currentData.MaterialNId = null;
            vm.currentData.MaterialRevision = null;
            if (newVal !== undefined && newVal.id !== undefined && newVal.id.length > 0) {
                var options = '$select=NId,Name,Revision,UoMNId&$expand=MaterialGroups&$filter=MaterialGroups/any(n%3An/NId%20eq%20%27' + newVal.id + '%27)&$orderby=NId%20asc';
                dataService.getMaterials(options)
                    .then(onGetMaterialSuccess, function (reason) {
                        logger.logErr('Error getting materials', reason);
                    });
            } else {
                dataService.getMaterials('$select=NId,Name,Revision,UoMNId&$expand=MaterialGroups&$orderby=NId%20asc')
                    .then(onGetMaterialSuccess, function (reason) {
                        logger.logErr('Error getting materials', reason);
                    });
            }
            dataService.getUoMs('$select=NId,Id,Name&$orderby=NId%20asc')
                .then(onGetUoMSuccess, function (reason) {
                    logger.logErr('Error getting unit of measures', reason);
                });
        }

        function setRevisions(oldVal, newVal) {
            if (vm.materialsData[0].id !== '') {
                vm.materialsData.unshift({ id: '', name: '', uomNid: '' });
            } else {
                if (vm.uomData.length > 0 && vm.uomData[0].nid === '') {
                    vm.uomData.shift();
                }
            }
            vm.materialRevisions = [];
            if (newVal.id === '') {
                dataService.getUoMs('$select=NId,Id,Name&$orderby=NId%20asc')
                    .then(onGetUoMSuccess, function (reason) {
                        logger.logErr('Error getting unit of measures', reason);
                    });
            }
            var ind = 0;
            var indCurrent = -1;
            var setMaterialRevision = false;
            for (var i = 0; i < vm.materialsAndRevisionData.length; i++) {
                if (newVal.id !== undefined && newVal.id === vm.materialsAndRevisionData[i].id) {
                    vm.materialRevisions.push({
                        id: vm.materialsAndRevisionData[i].id,
                        name: vm.materialsAndRevisionData[i].name,
                        revision: vm.materialsAndRevisionData[i].revision,
                        uomNid: vm.materialsAndRevisionData[i].uomNid,
                        IsCurrent: vm.materialsAndRevisionData[i].IsCurrent
                    });
                    ind++;
                    if (vm.materialsAndRevisionData[i].IsCurrent === true) {
                        indCurrent = ind;
                    }
                    if (vm.tempCurrentData.MaterialNId !== undefined && vm.tempCurrentData.MaterialRevision !== undefined) {
                        if (vm.tempCurrentData.MaterialNId.id === vm.materialsAndRevisionData[i].id
                            && vm.tempCurrentData.MaterialRevision.revision === vm.materialsAndRevisionData[i].revision) {
                            setMaterialRevision = true;
                            vm.tempCurrentData.MaterialRevision = {
                                id: vm.materialsAndRevisionData[i].id,
                                name: vm.materialsAndRevisionData[i].name,
                                revision: vm.materialsAndRevisionData[i].revision,
                                uomNid: vm.materialsAndRevisionData[i].uomNid
                            };
                        }
                    }
                }
            }
            if (ind === 0) {
                vm.currentData.MaterialRevision = {};
            } else if (ind === 1) {
                vm.currentData.MaterialRevision = vm.materialRevisions[0];
            } else if (ind !== 1 && indCurrent !== -1) {
                vm.currentData.MaterialRevision = vm.materialRevisions[indCurrent - 1];
            } else {
                vm.currentData.MaterialRevision = '';
            }
            if (newVal.uomNid !== undefined && newVal.uomNid !== null && newVal.uomNid.length > 0) {
                dataService.getUoMByNId(newVal.uomNid, '$select=Id,NId,Name,UoMBase_Id&$orderby=NId%20asc')
                    .then(onGetUoMSuccessGetRelated, function (reason) {
                        logger.logErr('Error getting unit of measures', reason);
                    });
            }
            vm.widgetAttributesMaterialRevision = {
                'sit-options': vm.materialRevisions,
                'sit-to-display': 'revision',
                'sit-to-keep': 'revision'
            };
            if (setMaterialRevision === true) {
                vm.currentData.MaterialRevision = vm.tempCurrentData.MaterialRevision;
            }
        }

        function setRevision(oldVal, newVal) {
            if (newVal) {
                if (vm.materialRevisions.length > 0 && vm.materialRevisions[0].revision !== '') {
                    vm.materialRevisions.unshift({ revision: '' });
                }
            }
        }

        function setUoM(oldV, newV) {
            if (oldV !== newV) {
                if (vm.uomData.length > 0 && vm.uomData[0].nid !== '') {
                    vm.uomData.unshift({ nid: '' });
                }
                if (newV && (newV.id === '' || newV.nid === '')) {
                    vm.currentData.Quantity = null;
                }
            }
        }

        function setTemplate() {
            if (vm.workOrderTplData && vm.workOrderTplData.length > 0 && vm.workOrderTplData[0].id !== '') {
                vm.workOrderTplData.unshift({ id: '' });
            }
        }

        function setWMEntityBrowserData() {
            var wmFields = {
                'NId': {
                    sorting: true,
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
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.description'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'Revision': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.revision'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'IsCurrent': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.isCurrent'),
                    filtering: {
                        type: 'boolean',
                        allowedCompareOperators: vm.booleanOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialNId': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialRevision': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialRev'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
            };

            var wmServerDataOptions = {
                dataEntity: 'WorkMaster',
                optionsString: '$select=NId,Name,Revision,IsCurrent,Description,MaterialNId,MaterialRevision,Quantity'
            };

            vm.wmDialogConfig = {
                title: $translate.instant('picore.titles.wmPickerTitle'),
                Headers: [
                    {
                        Key: 'NId',
                        DisplayName: $translate.instant('picore.headers.tables.nId'),
                        IsSortDefault: true
                    },
                    {
                        Key: 'Revision',
                        DisplayName: $translate.instant('picore.headers.tables.revision')

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
                        Key: 'MaterialNId',
                        DisplayName: $translate.instant('picore.headers.tables.materialNId')
                    },
                    {
                        Key: 'MaterialRevision',
                        DisplayName: $translate.instant('picore.headers.tables.materialRev')
                    }
                ],
                onPiSelectionChangeCallback: function (list, item) {
                    if (item) {
                        vm.isItemSelected = true;
                        vm.selectedItem = item;
                    }
                }
            };

            vm.widgetAttributesWorkMasterPicker = {
                'sit-dialog-table-template-uri': 'Siemens.SimaticIT.UAPI.PICore/widgets/piEntityBrowser/popup-sit-table-wm-template.html',
                'sit-dialog-table-fields': wmFields,
                'sit-dialog-server-data-options': wmServerDataOptions,
                'sit-selected-attribute-to-display': 'id',
                'sit-dialog-config': vm.wmDialogConfig,
                'sit-value': ''
            };
        }

        function setOrderEntityBrowserData() {
            var fields = {
                'NId': {
                    sorting: true,
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
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.description'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'EquipmentNId': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.equipmentNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialNId': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'MaterialRevision': {
                    sorting: true,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialRev'),
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
                'PlannedStartTime': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.plannedStartTime'),
                    filtering: {
                        type: 'date',
                        allowedCompareOperators: vm.dateOperators,
                        default: false,
                        validation: { required: false },
                        widget: 'sit-date-time-picker'
                    }
                },
                'PlannedEndTime': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.plannedEndTime'),
                    filtering: {
                        type: 'date',
                        allowedCompareOperators: vm.dateOperators,
                        default: false,
                        validation: { required: false },
                        widget: 'sit-date-time-picker'
                    }
                },
                'ActualStartTime': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.actualStartTime'),
                    filtering: {
                        type: 'date',
                        allowedCompareOperators: vm.dateOperators,
                        default: false,
                        validation: { required: false },
                        widget: 'sit-date-time-picker'
                    }
                }
            };

            var serverDataOptions = {
                dataEntity: 'Order',
                optionsString: ''
            };

            vm.dialogConfig = {
                title: $translate.instant('picore.titles.orderPickerTitle'),
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
                        Key: 'EquipmentNId',
                        DisplayName: $translate.instant('picore.headers.tables.equipmentNId')
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
                    },
                    {
                        Key: 'Status.StateMachineNId',
                        DisplayName: $translate.instant('picore.headers.tables.stateMachineNId')
                    },
                    {
                        Key: 'PlannedStartTime',
                        DisplayName: $translate.instant('picore.headers.tables.plannedStartTime')
                    },
                    {
                        Key: 'PlannedEndTime',
                        DisplayName: $translate.instant('picore.headers.tables.plannedEndTime')
                    },
                    {
                        Key: 'ActualStartTime',
                        DisplayName: $translate.instant('picore.headers.tables.actualStartTime')
                    }
                ],
                onPiSelectionChangeCallback: function (list, item) {
                    if (item) {
                        vm.isItemSelected = true;
                        vm.selectedItem = item;
                    }
                }
            };

            vm.widgetAttributesOrdersPicker = {
                'sit-dialog-table-template-uri': 'Siemens.SimaticIT.UAPI.PICore/widgets/piEntityBrowser/popup-sit-table-wm-template.html',
                'sit-dialog-table-fields': fields,
                'sit-dialog-server-data-options': serverDataOptions,
                'sit-selected-attribute-to-display': 'id',
                'sit-dialog-config': vm.dialogConfig,
                'sit-value': ''
            };
        }

        function setData() {
            vm.widgetAttributesTemplate = {
                'sit-options': vm.workOrderTplData,
                'sit-to-display': 'id',
                'sit-to-keep': 'id'
            };
            vm.widgetAttributesMaterial = {
                'sit-options': vm.materialsData,
                'sit-to-display': 'id',
                'sit-to-keep': 'id'
            };
            vm.widgetAttributesMaterialRevision = {
                'sit-options': vm.materialRevisions,
                'sit-to-display': 'revision',
                'sit-to-keep': 'revision'
            };
            vm.widgetAttributesUoM = {
                'sit-options': vm.uomData,
                'sit-to-display': 'nid',
                'sit-to-keep': 'nid'
            };
            setWMEntityBrowserData();
            setOrderEntityBrowserData();
        }
    }
})();
