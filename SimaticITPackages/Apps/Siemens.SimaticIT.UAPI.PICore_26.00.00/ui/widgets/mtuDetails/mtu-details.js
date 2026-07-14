/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiMtuDetails', mtuDetailsDirective);

    function mtuDetailsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/mtuDetails/mtu-details.html',
            controller: mtuDetailsController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterDetailApi: '&'
            }
        };
    }

    mtuDetailsController.$inject = [
        '$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'common.widgets.messageOverlay.service',
        '$translate',
        'Siemens.SimaticIT.UAPI.PICore.extensionService',
        'Siemens.SimaticIT.UAPI.PICore.commonService'];
    function mtuDetailsController(
        $scope,
        common,
        loggerService,
        dataService,
        messageOverlay,
        $translate,
        extService,
        commonService) {
        var vm = this;
        var logger;
        $scope.$on('MTUUpdated', onUpdateMtu);
        $scope.$on('MTUCreationCancel', cancelMtuCreation);

        init();

        function init() {
            logger = loggerService.getModuleLogger('sitPiMtuDetails directive...');
            vm.selectedItem = null;
            vm.mtuData = {};
            vm.NoData = true;
            vm.isComponentTitleVisible = true;


            vm.mtuPropertyGridData = [{
                id: 'NoData',
                label: $translate.instant('picore.labels.noData'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.labels.noData'),
                validation: {}
            }];

            vm.componentDetailsTitle = $translate.instant('picore.titles.mtuDetailsTitle');
            vm.tabHeader = {
                overview: $translate.instant('picore.titles.overviewTabTitle'),
                userFields: $translate.instant('picore.titles.userFieldsTabTitle')
            };

            vm.editCmdLabel = $translate.instant('picore.buttonsAndTooltips.edit');
            vm.editCmdTooltip = $translate.instant('picore.buttonsAndTooltips.edit');

            vm.api = {
                setMtuId: setMtuId,
                setExtendedProperties: setExtendedProperties,
                showTitle: showTitle,
                enableEdit: enableEdit
            };

            vm.isEditEnabled = false;
            vm.showDetails = true;
            vm.showEdit = false;

            vm.onRegisterDetailApi({ api: vm.api });

            initData(vm.mtuId);

            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;

            vm.onEditClick = onEditClick;
            vm.onRegisterCreateApi = onRegisterCreateApi;
            vm.onRegisterUserFieldsApi = onRegisterUserFieldsApi;

        }

        function initData(mtuId) {
            if (mtuId !== undefined && mtuId !== null) {
                var optionsString = '$expand=MaterialLot&$filter=Id eq ' + mtuId;
                if (vm.extPropertiesObject) {
                    optionsString = commonService.applyConfigurationsToOptionsString(optionsString, vm.extendedEntityNames, vm.extendedFacetNames, vm.extPropertiesObject);
                }

                dataService.getAll(optionsString).then(onGetMtuSuccess, onGetMtuFailed);

            } else {
                vm.NoData = true;
                vm.mtuPropertyGridData = [{
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

        function onGetMtuSuccess(data) {
            vm.mtuData = data.value[0];
            vm.mtuIsFrozen = data.value[0].IsFrozen;
            enableEdit(!vm.mtuIsFrozen);
            if (vm.userFieldsApi) {
                vm.userFieldsApi.setMtuId(vm.mtuId);
                vm.userFieldsApi.enableEdit(vm.isEditEnabled && !vm.mtuIsFrozen);
            }
            if (vm.mtuData === undefined) {

                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorDeletingMTUText'),
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
            } else {
                dataService.getMtuUserFields(vm.mtuData.Id).then(onGetMtuUserFieldsSuccess);
                setDetails();
            }
        }

        function onGetMtuFailed(reason) {
            logger.logErr('GetMtu failed:' + reason);
        }

        function onGetMtuUserFieldsSuccess(data) {
            if ((data) && (data.succeeded)) {
                vm.userFieldData = data.value;
            } else {
                vm.userFieldData = [];
            }
        }

        function setExtendedProperties(extendedEntityNames, extendedFacetNames, extPropertiesObject, saveCmdExt) {
            vm.mtuPropertyExtData = commonService.applyPropertyGridColumnsConfiguration(extPropertiesObject, false);
            vm.extendedEntityNames = extendedEntityNames;
            vm.extendedFacetNames = extendedFacetNames;
            vm.extPropertiesObject = extPropertiesObject;
            vm.saveCmdExt = saveCmdExt;
        }

        function showTitle(isVisible) {
            vm.isComponentTitleVisible = isVisible;
        }

        function setDetails() {
            vm.NoData = false;
            vm.mtuPropertyGridData = [
                {
                    id: 'NId',
                    label: $translate.instant('picore.headers.propertyGrids.nId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.NId,
                    validation: {}
                },
                {
                    id: 'Name',
                    label: $translate.instant('picore.headers.propertyGrids.name'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.Name,
                    validation: {}
                },
                {
                    id: 'Description',
                    label: $translate.instant('picore.headers.propertyGrids.description'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.Description,
                    validation: {}
                },
                {
                    id: 'MaterialNId',
                    label: $translate.instant('picore.headers.propertyGrids.materialNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.MaterialNId,
                    validation: {}
                },
                {
                    id: 'MaterialRevision',
                    label: $translate.instant('picore.headers.propertyGrids.materialRev'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.MaterialRevision,
                    validation: {}
                },
                {
                    id: 'MaterialLot',
                    label: $translate.instant('picore.headers.propertyGrids.materialLotNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value:  vm.mtuData.MaterialLot !== null && vm.mtuData.MaterialLot !== undefined ? vm.mtuData.MaterialLot.NId : '',
                    validation: {}
                },
                {
                    id: 'EquipmentNId',
                    label: $translate.instant('picore.headers.propertyGrids.equipmentNId'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.EquipmentNId,
                    validation: {}
                },
                {
                    id: 'Quantity',
                    label: $translate.instant('picore.headers.propertyGrids.quantity'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.Quantity.QuantityValue,
                    validation: {}
                },
                {
                    id: 'QuantityUoMNId',
                    label: $translate.instant('picore.headers.propertyGrids.uoM'),
                    read_only: true,
                    widget: 'sit-label',
                    value: vm.mtuData.Quantity.UoMNId,
                    validation: {}
                }
                ,
                {
                    id: 'IsFrozen',
                    label: $translate.instant('picore.headers.propertyGrids.isFrozen'),
                    read_only: true,
                    widget: 'sit-checkbox',
                    value: vm.mtuData.IsFrozen,
                    validation: {}
                }
            ];

            commonService.applyValuesToConfiguredSitPropertyGridFields(vm.mtuPropertyExtData, vm.mtuData);
        }
        function setMtuId(mtuId) {
            vm.mtuId = mtuId;
            if (vm.mtuId) {
                if (vm.userFieldsApi) {
                    vm.userFieldsApi.setMtuId(vm.mtuId);
                }
            }
            initData(mtuId);
        }

        function enableEdit(isEditEnabled) {
            vm.isEditEnabled = isEditEnabled;
        }

        function onRegisterCreateApi(api) {
            vm.mtuEdit = api;
        }

        function onRegisterUserFieldsApi(api) {
            vm.userFieldsApi = api;
            if (vm.userFieldsApi) {
                vm.userFieldsApi.setMtuId(vm.mtuId);
                vm.userFieldsApi.enableEdit(vm.isEditEnabled);
            }
        }

        function onEditClick() {
            vm.showDetails = false;
            vm.showEdit = true;
            if (vm.mtuEdit) {
                vm.mtuEdit.editMtu(vm.mtuId);
                if ((vm.extendedEntityNames || vm.extendedFacetNames) && vm.mtuData) {
                    vm.mtuEdit.setExtendedProperties(vm.extendedEntityNames, vm.extendedFacetNames, vm.extPropertiesObject, vm.saveCmdExt, vm.mtuData);
                }
            }
        }

        function onUpdateMtu() {
            setMtuId(vm.mtuId);
            vm.showEdit = false;
            vm.showDetails = true;
            $scope.$emit('MTUDetailsUpdated', vm.mtuId);
        }

        function cancelMtuCreation() {
            setMtuId(vm.mtuId);
            vm.showEdit = false;
            vm.showDetails = true;
            $scope.$emit('MTUUpdateCancel');
        }
    }

})();
