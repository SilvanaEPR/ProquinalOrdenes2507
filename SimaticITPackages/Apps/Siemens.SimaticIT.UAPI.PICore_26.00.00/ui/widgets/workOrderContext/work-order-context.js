/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/

(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiWorkOrderContext', workOrderContextDirective);

    function workOrderContextDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/workOrderContext/work-order-context.html',
            controller: workOrderContextController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterContextApi: '&',
                onCommandClicked: '&'
            }
        };
    }

    workOrderContextController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'Siemens.SimaticIT.UAPI.PICore.WorkOrderService',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.widgets.messageOverlay.service',
        '$translate'];

    function workOrderContextController($scope,
        common,
        loggerService,
        materialDataService,
        workOrderDataService,
        commonService,
        messageOverlay,
        $translate) {
        var vm = this;
        var logger;

        init();

        function init() {
            logger = loggerService.getModuleLogger('sitPiWorkOrderContext directive...');

            vm.NoData = true;
            vm.isBackEnabled = true;
            vm.isComponentTitleVisible = true;
            vm.backStateId = '';
            vm.workOrderData = {};
            vm.workOrderContextPropertyGridData = [{
                id: 'NoData',
                label: $translate.instant('picore.workOrder.NoDataLabel'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.common.NoDataValue'),
                validation: {}
            }];

            vm.componentContextTitle = $translate.instant('picore.titles.workOrderContextTitle');

            vm.api = {
                setWorkOrderId: setWorkOrderId,
                setTargetStates: setTargetStates,
                enableBack: enableBack,
                setExtendedProperties: setExtendedProperties,
                showTitle: showTitle
            };

            vm.toolbarButtons = [
				{
				    icon: 'fa-arrow-circle-o-left',
				    name: 'back',
				    label: $translate.instant('picore.buttonsAndTooltips.back'),
				    visibility: vm.isBackEnabled
				}
            ];

            vm.onRegisterContextApi({ api: vm.api });

            initData(vm.workOrderId);

            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;
            vm.commandClick = commandClick;
        }

        function initData(workOrderId) {
            if (workOrderId !== undefined && workOrderId !== null) {
                var optionsString = '$filter=Id eq ' + workOrderId;
                if (vm.extPropertiesObject) {
                    optionsString = commonService.applyConfigurationsToOptionsString(optionsString, vm.extendedEntityNames, vm.extendedFacetNames, vm.extPropertiesObject);
                }

                workOrderDataService.getWorkorder(optionsString).then(onGetWorOrderSuccess, onGetWorkOrderFailed);
            } else {
                vm.NoData = true;
                vm.workOrderContextPropertyGridData = [{
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

        function setExtendedProperties(extendedEntityNames, extendedFacetNames, extPropertiesObject, saveCmdExt) {
            vm.woPropertyExtData = commonService.applyPropertyGridColumnsConfiguration(extPropertiesObject, false);
            vm.extendedEntityNames = extendedEntityNames;
            vm.extendedFacetNames = extendedFacetNames;
            vm.extPropertiesObject = extPropertiesObject;
            vm.saveCmdExt = saveCmdExt;
        }


        function onGetWorOrderSuccess(data) {
            vm.workOrderData = data.value[0];
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
                displayOverlay();
            } else {
                setDetails();
            }
        }

        function onGetWorkOrderFailed(reason) {
            logger.logErr('GetWorkOrder failed:' + reason);
        }

        function setDetails() {
            vm.NoData = false;
            vm.workOrderContextPropertyGridData = [
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
                }
            ];

            commonService.applyValuesToConfiguredSitPropertyGridFields(vm.woPropertyExtData, vm.workOrderData);
        }

        function setWorkOrderId(workOrderId) {
            vm.workOrderId = workOrderId;
            initData(workOrderId);
        }

        function setTargetStates(backStateId) {
            vm.backStateId = backStateId;
        }

        function enableBack(isBackEnabled) {
            vm.isBackEnabled = isBackEnabled;
            vm.toolbarButtons[0].visibility = vm.isBackEnabled;
        }

        function commandClick(command) {
            if (vm.onCommandClicked) {
                vm.onCommandClicked({ command: command });
            }
        }
    }
})();
