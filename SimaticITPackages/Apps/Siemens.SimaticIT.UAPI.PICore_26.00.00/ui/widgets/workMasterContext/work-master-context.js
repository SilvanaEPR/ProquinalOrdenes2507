/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiWorkMasterContext', workMasterContextDirective);

    function workMasterContextDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/workMasterContext/work-master-context.html',
            controller: workMasterContextController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterContextApi: '&',
                onCommandClicked: '&'
            }
        };
    }

    workMasterContextController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'Siemens.SimaticIT.UAPI.PICore.WorkMasterService',
        'common.widgets.messageOverlay.service',
        '$translate'];
    function workMasterContextController($scope,
        common,
        loggerService,
        materialDataService,
        workMasterDataService,
        messageOverlay,
        $translate) {
        var vm = this;
        var logger;

        init();

        function init() {
            logger = loggerService.getModuleLogger('sitPiWorkMasterContext directive...');

            vm.isBackEnabled = true;
            vm.backStateId = '';
            vm.workMasterData = {};
            vm.workMasterContextPropertyGridData = [{
                id: 'NoData',
                label: $translate.instant('picore.labels.noData'),
                read_only: true,
                widget: 'sit-label',
                value: $translate.instant('picore.labels.noData'),
                validation: {}
            }];

            vm.componentContextTitle = $translate.instant('picore.titles.workMasterContextTitle');

            vm.api = {
                setWorkMasterId: setWorkMasterId,
                setTargetStates: setTargetStates,
                enableBack: enableBack
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

            initData(vm.workMasterId);

            vm.removeOverlay = removeOverlay;
            vm.displayOverlay = displayOverlay;
            vm.commandClick = commandClick;
        }

        function initData(workMasterId) {
            if (workMasterId !== undefined) {
                workMasterDataService.getByIdExpandCompositions(workMasterId).then(onGetWorkMasterSuccess, onGetWorkMasterFailed);
            } else {
                vm.workMasterContextPropertyGridData = [{
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
                displayOverlay();
            } else {
                setDetails();
            }
        }

        function onGetWorkMasterFailed(reason) {
            logger.logErr('GetWorkMaster failed:' + reason);
        }

        function setDetails() {
            vm.workMasterContextPropertyGridData = [
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
                }
            ];
        }

        function setWorkMasterId(workMasterId) {
            vm.workMasterId = workMasterId;
            initData(workMasterId);
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
