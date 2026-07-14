/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiWorkMasterDetails', workMasterDetailsDirective);

    function workMasterDetailsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/workMasterDetails/work-master-details.html',
            controller: workMasterDetailsController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterDetailApi: '&'
            }
        };
    }

    workMasterDetailsController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'Siemens.SimaticIT.UAPI.PICore.WorkMasterService',
        'common.widgets.messageOverlay.service',
        '$translate'];
    function workMasterDetailsController($scope,
        common,
        loggerService,
        materialDataService,
        workMasterDataService,
        messageOverlay,
        $translate) {
        var vm = this;
        var logger;

        $scope.$on('WorkMasterUpdated', onUpdateWorkMaster);
        $scope.$on('WorkMasterCreationCancel', cancelWorkMasterCreation);

        init();

        function init() {
            logger = loggerService.getModuleLogger('sitPiWorkMasterDetails directive...');
            vm.selectedItem = null;
            vm.workMasterData = {};
            vm.workMasterPropertyGridData = [{
                id: 'NoData',
                label: $translate.instant('picore.labels.noData'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.labels.noData'),
                validation: {}
            }];

            vm.componentDetailsTitle = $translate.instant('picore.titles.workMasterDetailsTitle');
            vm.editCmdLabel = $translate.instant('picore.buttonsAndTooltips.edit');
            vm.editCmdTooltip = $translate.instant('picore.wbuttonsAndTooltips.edit');

            vm.api = {
                setWorkMasterId: setWorkMasterId,
                enableEdit: enableEdit
            };

            vm.isEditEnabled = true;
            vm.showDetails = true;
            vm.showEdit = true;
            vm.showEditButton = true;

            vm.onRegisterDetailApi({ api: vm.api });

            initData(vm.workMasterId);

            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;

            vm.onEditClick = onEditClick;
            vm.onRegisterCreateApi = onRegisterCreateApi;
        }

        function initData(workMasterId) {
            if (workMasterId !== undefined) {
                workMasterDataService.getByIdExpandCompositions(workMasterId).then(onGetWorkMasterSuccess, onGetWorkMasterFailed);
            } else {
                vm.showEditButton = false;
                vm.workMasterPropertyGridData = [{
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

        function onGetWorkMasterSuccess(data) {
            vm.workMasterData = data.value[0];
            if (vm.workMasterData === undefined) {
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorWorkMasterText'),
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
                vm.showEditButton = !vm.workMasterData.IsLocked;
                setDetails();
            }
        }

        function onGetWorkMasterFailed(reason) {
            logger.logErr('GetWorkMaster failed:' + reason);
        }

        function setDetails() {
            vm.workMasterPropertyGridData = [
                {
                    id: 'NId',
                    label: $translate.instant('picore.headers.propertyGrids.nId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.NId,
                    validation: {}
                },
                {
                    id: 'Revision',
                    label: $translate.instant('picore.headers.propertyGrids.revision'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.Revision,
                    validation: {}
                },
                {
                    id: 'IsCurrent',
                    label: $translate.instant('picore.headers.propertyGrids.isCurrent'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workMasterData.IsCurrent,
                    validation: {}
                },
                {
                    id: 'Name',
                    label: $translate.instant('picore.headers.propertyGrids.name'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.Name,
                    validation: {}
                },
                {
                    id: 'Description',
                    label: $translate.instant('picore.headers.propertyGrids.description'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.Description,
                    validation: {}
                },
                {
                    id: 'MaterialNId',
                    label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.MaterialNId,
                    validation: {}
                },
                {
                    id: 'MaterialRevision',
                    label: $translate.instant('picore.headers.propertyGrids.materialRev'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.MaterialRevision,
                    validation: {}
                },
                {
                    id: 'Quantity',
                    label: $translate.instant('picore.headers.propertyGrids.quantity'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.Quantity.QuantityValue,
                    validation: {}
                },
                {
                    id: 'QuantityUoMNId',
                    label: $translate.instant('picore.headers.propertyGrids.uoM'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.Quantity.UoMNId,
                    validation: {}
                },
                {
                    id: 'BoOpNId',
                    label: $translate.instant('picore.headers.propertyGrids.boOpNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.BoOpNId,
                    validation: {}
                },
                {
                    id: 'BoOpRevision',
                    label: $translate.instant('picore.headers.propertyGrids.boOpRev'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.workMasterData.BoOpRevision,
                    validation: {}
                },
                {
                    id: 'OperationParameterSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationParameterSpecifications'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workMasterData.OperationParameterSpecifications.length > 0,
                    validation: {}
                },
                {
                    id: 'OperationMaterialSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationMaterialSpecifications'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workMasterData.OperationMaterialSpecifications.length > 0,
                    validation: {}
                },
                {
                    id: 'OperationEquipmentSpecifications',
                    label: $translate.instant('picore.headers.propertyGrids.operationEquipmentSpecifications'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workMasterData.OperationEquipmentSpecifications.length > 0,
                    validation: {}
                },
                {
                    id: 'IsLocked',
                    label: $translate.instant('picore.headers.propertyGrids.isLocked'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.workMasterData.IsLocked,
                    validation: {}
                }
            ];
        }

        function setWorkMasterId(workMasterId) {
            vm.workMasterId = workMasterId;
            initData(workMasterId);
        }

        function enableEdit(isEditEnabled) {
            vm.isEditEnabled = isEditEnabled;
            vm.showEdit = isEditEnabled;
        }

        function onRegisterCreateApi(api) {
            vm.workMasterEdit = api;
        }

        function onEditClick() {

            vm.showDetails = false;
            vm.showEdit = false;
            if (vm.workMasterEdit) {
                vm.workMasterEdit.editWorkMaster(vm.workMasterId);
            }
        }

        function onUpdateWorkMaster() {

            setWorkMasterId(vm.workMasterId);
            vm.showEdit = true;
            vm.showDetails = true;
            $scope.$emit('WorkMasterDetailsUpdated', vm.workMasterId);
        }

        function cancelWorkMasterCreation() {
            setWorkMasterId(vm.workMasterId);
            vm.showEdit = true;
            vm.showDetails = true;
            $scope.$emit('WorkMasterUpdateCancel', vm.workMasterId);
        }
    }
})();
