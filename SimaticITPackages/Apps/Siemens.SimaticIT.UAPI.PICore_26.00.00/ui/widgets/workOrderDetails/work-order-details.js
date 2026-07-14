/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiWorkOrderDetails', workOrderDetailsDirective);

    function workOrderDetailsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/workOrderDetails/work-order-details.html',
            controller: workOrderDetailsController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterDetailApi: '&',
                id: '='
            }
        };
    }

    workOrderDetailsController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderService',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.widgets.messageOverlay.service',
        '$translate',
        '$q',
        '$filter'];
    function workOrderDetailsController($scope,
        common,
        loggerService,
        materialDataService,
        workOrderDataService,
        commonService,
        messageOverlay,
        $translate,
        $q,
        $filter){
        var vm = this;
        var logger;
        $scope.$on('WorkOrderUpdated', onUpdateWorkOrder);
        $scope.$on('WorkOrderCreationCancel', cancelWorkOrderCreation);

        init();

        function init() {
            logger = loggerService.getModuleLogger('sitPiWorkOrderDetails directive...');
            vm.selectedItem = null;
            vm.workOrderData = {};
            vm.NoData = true;
            vm.isComponentTitleVisible = true;
            vm.workOrderPropertyGridData = [{
                id: 'NoData',
                label: $translate.instant('picore.labels.noData'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.labels.noData'),
                validation: {}
            }];

            vm.componentDetailsTitle = $translate.instant('picore.titles.workOrderDetailsTitle');
            vm.editCmdLabel = $translate.instant('picore.buttonsAndTooltips.edit');
            vm.editCmdTooltip = $translate.instant('picore.buttonsAndTooltips.edit');

            vm.api = {
                setWorkOrderId: setWorkOrderId,
                enableEdit: enableEdit,
                setExtendedProperties: setExtendedProperties,
                showTitle: showTitle,
                isBasedOnBoOp: isBasedOnBoOp
            };

            vm.isEditEnabled = true;
            vm.showDetails = true;
            vm.showEdit = true;
            vm.showEditButton = true;

            vm.onRegisterDetailApi({ api: vm.api });

            initData(vm.workOrderId);

            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;

            vm.onEditClick = onEditClick;
            vm.onRegisterCreateApi = onRegisterCreateApi;
        }

        function initData(workOrderId) {
            if (workOrderId) {
                var optionsString = '$filter=Id eq ' + workOrderId +
                    '&$expand=Facets($select=Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/WorkMasterNId,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/WorkMasterRevision,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/OrderNId,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/Type,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/ActualQuantity,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/PlannedStartTime,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/PlannedEndTime,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/ActualStartTime,' +
                    'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/ActualEndTime)';
                if (vm.extPropertiesObject) {
                    optionsString = commonService.applyConfigurationsToOptionsString(optionsString, vm.extendedEntityNames, vm.extendedFacetNames, vm.extPropertiesObject);
                }

                var wo = workOrderDataService.getWorkorder(optionsString);
                var ps = workOrderDataService.getParameterSpecification(workOrderId);
                var ms = workOrderDataService.getMaterialRequirement(workOrderId);
                var es = workOrderDataService.getEquipmentRequirement(workOrderId);

                $q.all([wo, ps, ms, es]).then(function (data) {
                    onGetWorkOrderSuccess(data);
                }, function (reason) {
                    logger.logErr('getWorkOrderDetails failed:' + reason);
                });

            } else {
                vm.NoData = true;
                vm.showEditButton = false;
                vm.workOrderPropertyGridData = [{
                    id: 'NoData',
                    label: $translate.instant('picore.labels.noData'),
                    read_only: true,
                    widget: 'sit-label',
                    value: $translate.instant('picore.labels.noData'),
                    validation: {}
                }];
            }
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }

        function showTitle(isVisible) {
            vm.isComponentTitleVisible = isVisible;
        }

        function isBasedOnBoOp (isUdmDetached){
            vm.isUdmDetached = !isUdmDetached;
        }

        function setExtendedProperties(extendedEntityNames, extendedFacetNames, extPropertiesObject, saveCmdExt) {
            vm.woPropertyExtData = commonService.applyPropertyGridColumnsConfiguration(extPropertiesObject, false);
            vm.extendedEntityNames = extendedEntityNames;
            vm.extendedFacetNames = extendedFacetNames;
            vm.extPropertiesObject = extPropertiesObject;
            vm.saveCmdExt = saveCmdExt;
        }

        function onGetWorkOrderSuccess(data) {

            vm.workOrderData = data[0].value[0];
            vm.workOrderData.hasParameterSpecification = data[1].value.length > 0;
            vm.workOrderData.hasMaterialSpecification = data[2].value.length > 0;
            vm.workOrderData.hasEquipmentSpecification = data[3].value.length > 0;

            if (vm.workOrderData === undefined) {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorWorkOrderText'),
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
                vm.showEditButton = false;
                displayOverlay();
            } else {
                vm.showEditButton = !vm.workOrderData.IsFrozen;
                setDetails();
            }
        }

        function setDetails() {
            vm.NoData = false;
            vm.workOrderPropertyGridData = [
                {
                    id: 'NId',
                    label: $translate.instant('picore.headers.propertyGrids.nId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.NId,
                    validation: {}
                },
                {
                    id: 'Name',
                    label: $translate.instant('picore.headers.propertyGrids.name'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.Name,
                    validation: {}
                },
                {
                    id: 'Description',
                    label: $translate.instant('picore.headers.propertyGrids.description'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.Description,
                    validation: {}
                },
                {
                    id: 'Type',
                    label: $translate.instant('picore.headers.propertyGrids.type'),
                    read_only: true,
                    widget: 'sit-label',
                    value: commonService.getValue('Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].Type', vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'MaterialNId',
                    label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.MaterialNId,
                    validation: {}
                },
                {
                    id: 'MaterialRevision',
                    label: $translate.instant('picore.headers.propertyGrids.materialRev'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.MaterialRevision,
                    validation: {}
                },
                {
                    id: 'OrderNId',
                    label: $translate.instant('picore.headers.propertyGrids.orderNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: commonService.getValue('Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].OrderNId', vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'Quantity',
                    label: $translate.instant('picore.headers.propertyGrids.quantity'),
                    read_only: true,
                    widget: 'sit-numeric', // Bug#94415
                    value: $filter('number')(vm.workOrderData.Quantity.QuantityValue, 2),// Bug#94415
                    validation: {}
                },
                {
                    id: 'QuantityUoMNId',
                    label: $translate.instant('picore.headers.propertyGrids.uoM'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.Quantity.UoMNId,
                    validation: {}
                },
                {
                    id: 'ActualQuantity',
                    label: $translate.instant('picore.headers.propertyGrids.actualquantity'),
                    read_only: true,
                    widget: 'sit-numeric',// Bug#94415
                    value: $filter('number')(commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].ActualQuantity.QuantityValue',
                        vm.workOrderData), 2),//vm.workOrderData.Facets[0].ActualQuantity.QuantityValue, //SL  Bug#94415
                    validation: {}
                },
                {
                    id: 'ActualQuantityUoMNId',
                    label: $translate.instant('picore.headers.propertyGrids.actualuoM'),
                    read_only: true,
                    widget: 'sit-label',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].ActualQuantity.UoMNId',
                        vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'WorkMasterNId',
                    label: $translate.instant('picore.headers.propertyGrids.workMaster'),
                    read_only: true,
                    widget: 'sit-label',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].WorkMasterNId',
                        vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'WorkMasterRevision',
                    label: $translate.instant('picore.headers.propertyGrids.workMasterRev'),
                    read_only: true,
                    widget: 'sit-label',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].WorkMasterRevision',
                        vm.workOrderData),//vm.workOrderData.Facets[0].WorkMasterRevision,
                    validation: {}
                },
                {
                    id: 'StatusNId',
                    label: $translate.instant('picore.headers.propertyGrids.statusNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.Status.StatusNId,
                    validation: {}
                },
                {
                    id: 'StatusMachineNId',
                    label: $translate.instant('picore.headers.propertyGrids.stateMachine'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.Status.StateMachineNId,
                    validation: {}
                },
                {
                    id: 'PlannedStartTime',
                    label: $translate.instant('picore.headers.tables.plannedStartTime'),
                    read_only: true,
                    widget: 'sit-date-time-picker',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].PlannedStartTime',
                        vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'PlannedEndTime',
                    label: $translate.instant('picore.headers.tables.plannedEndTime'),
                    read_only: true,
                    widget: 'sit-date-time-picker',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].PlannedEndTime',
                        vm.workOrderData),
                    validation: {}
                },

                {
                    id: 'ActualStartTime',
                    label: $translate.instant('picore.headers.tables.actualStartTime'),
                    read_only: true,
                    widget: 'sit-date-time-picker',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].ActualStartTime',
                        vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'ActualEndTime',
                    label: $translate.instant('picore.headers.tables.actualEndTime'),
                    read_only: true,
                    widget: 'sit-date-time-picker',
                    value: commonService.getValue(
                        'Facets[Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended].ActualEndTime',
                        vm.workOrderData),
                    validation: {}
                },
                {
                    id: 'EquipmentNId',
                    label: $translate.instant('picore.headers.propertyGrids.equipmentNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workOrderData.EquipmentNId,
                    validation: {}
                },
                {
                    id: 'IsFrozen',
                    label: $translate.instant('picore.headers.propertyGrids.isFrozen'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workOrderData.IsFrozen,
                    validation: {}
                },
                {
                    id: 'OperationParameterSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationParameterRequirement'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workOrderData.hasParameterSpecification,
                    validation: {}
                },
                {
                    id: 'OperationMaterialSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationMaterialRequirement'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workOrderData.hasMaterialSpecification,
                    validation: {}
                },
                {
                    id: 'OperationEquipmentSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationEquipmentRequirement'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workOrderData.hasEquipmentSpecification,
                    validation: {}
                }
            ];

            commonService.applyValuesToConfiguredSitPropertyGridFields(vm.woPropertyExtData, vm.workOrderData);
        }

        function setWorkOrderId(workOrderId) {
            vm.workOrderId = workOrderId;
            initData(workOrderId);
        }

        function enableEdit(isEditEnabled) {
            vm.isEditEnabled = isEditEnabled;
            vm.showEdit = isEditEnabled;
        }

        function onRegisterCreateApi(api) {
            vm.workOrderEdit = api;
        }

        function onEditClick() {
            vm.showDetails = false;
            vm.showEdit = false;
            if (vm.workOrderEdit) {
                vm.workOrderEdit.editWorkOrder(vm.workOrderId, vm.isUdmDetached);
            }
        }

        function onUpdateWorkOrder() {
            setWorkOrderId(vm.workOrderId);
            vm.showEdit = true;
            vm.showDetails = true;
        }

        function cancelWorkOrderCreation() {
            setWorkOrderId(vm.workOrderId);
            vm.showEdit = true;
            vm.showDetails = true;
            $scope.$emit('WorkOrderUpdateCancel', vm.workOrderId);
        }
    }
})();
