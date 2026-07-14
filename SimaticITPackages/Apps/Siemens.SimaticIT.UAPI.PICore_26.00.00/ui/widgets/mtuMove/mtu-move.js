/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiMtuMove', mtuMoveDirective);

    function mtuMoveDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/mtuMove/mtu-move.html',
            controller: mtuMoveController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterMoveApi: '&'
            }
        };
    }

    mtuMoveController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'common.widgets.messageOverlay.service',
        '$translate'];
    function mtuMoveController($scope, common, loggerService, dataService, messageOverlay, $translate) {
        var vm = this;
        var logger;
        var toBeDestroyed = [];
        vm.api = {
            setMoveSrcInfo: setMoveSrcInfo
        };

        init();
        vm.notCanceled = true;
        vm.onDestinationChange = onDestinationChange;
        vm.onSourceChange = onSourceChange;
        vm.manageQty = manageQty;
        vm.entireQty = false;
        vm.isMtuSelected = false;
        vm.currentData = {
            EntireQty: [{ checked: false }],
            Source: { FieldName: { id: '', nid: '' }, FieldValue: { id: '', nid: '' } },
            Destination: { FieldName: '', FieldValue: '' }
        };
        vm.hasMtuUoMAndQty = false;

        vm.onRegisterMoveApi({ api: vm.api });

        vm.Title = $translate.instant('picore.titles.moveTitle');

        vm.translatedSource = $translate.instant('picore.headers.propertyGrids.source');
        vm.translatedSourceQuantity = $translate.instant('picore.headers.propertyGrids.sourceQuantity');
        vm.translatedDestination = $translate.instant('picore.headers.propertyGrids.destination');
        vm.translatedDestinationQuantity = $translate.instant('picore.headers.propertyGrids.destinationQuantity');

        vm.translatedSave = $translate.instant('picore.buttonsAndTooltips.move');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');
        vm.translatedUoM = $translate.instant('picore.headers.propertyGrids.uoM');
        vm.translatedEntireQuantity = $translate.instant('picore.headers.propertyGrids.wholeQuantity');

        function init() {
            logger = loggerService.getModuleLogger('mtuMove directive...');
            vm.mtuData = {};
            vm.ngReadonly = false;
            vm.notCanceled = true;

            vm.sources = [{ nid: 'Equipment', id: 'Equipment' }, { nid: 'MTU', id: 'MaterialTrackingUnit' }];
            vm.destinations = [{ nid: 'Equipment', id: 'Equipment' }];

            vm.save = save;
            vm.cancel = cancel;

            vm.mtuId = '';
            vm.equipmentId = '';
            vm.dialogConfig = {
                title: $translate.instant('picore.titles.selectEntity', { entity: 'MTU' }),
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
					     Key: 'EquipmentNId',
					     DisplayName: $translate.instant('picore.headers.tables.equipmentNId')
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
                data: [],
                dataSource: {
                    appName: 'PICore',
                    dataEntity: 'MaterialTrackingUnit'
                },
                selectionMode: 'single',
                serverDataOptions : {
                    dataEntity: 'MaterialTrackingUnit',
                    optionsString: '$orderby=NId'
                },
                pagingOptions: {
                    pageSizes: [5, 8],
                    pageSize: 5,
                    currentPage: 1
                },
                onPiSelectionChangeCallback: function (list, item) {
                    if (item) {
                        vm.isItemSelected = true;
                        vm.selectedItem = item;
                    }
                }
            };
            vm.serverDataOptions = {
                dataEntity: 'MaterialTrackingUnit',
                optionsString: '$orderby=NId'
            };

            registerEvents();
            setData();
        }

        function setMoveSrcInfo(srcMtuId, srcEquipmentId) {
            if (srcMtuId) {
                dataService.getById(srcMtuId)
                    .then(onGetByIdSuccess, function (reason) {
                        logger.logErr('Error getting Material tracking unit information', reason);
                    });
                vm.isMtuSelected = true;
                vm.mtuId = srcMtuId;
                vm.currentData.Source['FieldName'] = { nid: 'MTU', id: 'MaterialTrackingUnit' };
                vm.currentData.Source['FieldValue'] = { nid: 'nid', id: vm.mtuId };
            } else if (srcEquipmentId) {
                dataService.getEquipmentById(srcEquipmentId)
                    .then(onGetEquipmentByIdSuccess, function (reason) {
                        logger.logErr('Error getting Equipment information', reason);
                    });
                vm.isMtuSelected = false;
                vm.equipmentId = srcEquipmentId;
                vm.currentData.Source['FieldName'] = { nid: 'Equipment', id: 'Equipment' };
                vm.currentData.Source['FieldValue'] = { nid: vm.equipmentNId, id: srcEquipmentId };
            } else {
                vm.currentData.Source = { FieldName: { id: '', nid: '' }, FieldValue: { id: '', nid: '' } };
                vm.currentData.Destination = { FieldName: '', FieldValue: '' };
            }
        }

        function onGetByIdSuccess(data) {
            if (data.value.length === 1) {
                vm.mtuUoM = data.value[0].Quantity.UoMNId;
                vm.mtuNId = data.value[0].NId;
                vm.mtuQuantity = data.value[0].Quantity.QuantityValue !== null ? data.value[0].Quantity.QuantityValue : 0;
                vm.currentData.SourceQuantity = data.value[0].Quantity.QuantityValue !== null ? data.value[0].Quantity.QuantityValue : 0;
                setData();
                vm.currentData.Source['FieldName'] = { nid: 'MTU', id: 'MaterialTrackingUnit' };
                vm.currentData.Source['FieldValue'] = { nid: vm.mtuNId, id: vm.mtuId };
                $scope.$broadcast('xor-Set', vm.currentData.Source);
                vm.currentData.UoM = vm.mtuUoM;
                if (vm.mtuUoM !== null) {
                    vm.hasMtuUoM = true;
                    vm.checkDis = false;
                } else {
                    vm.hasMtuUoM = false;
                    manageQty();
                    vm.checkDis = true;
                }
            }
        }

        function onGetEquipmentByIdSuccess(data) {
            if (data.value.length === 1) {
                vm.equipmentNId = data.value[0].NId;
                vm.currentData.Source['FieldName'] = { nid: 'Equipment', id: 'Equipment' };
                vm.currentData.Source['FieldValue'] = { nid: vm.equipmentNId, id: vm.equipmentId };
                $scope.$broadcast('xor-Set', vm.currentData.Source);
            }
        }

        function manageQty() {
            vm.entireQty = !vm.entireQty;
            vm.currentData.SourceQuantity = vm.mtuQuantity;
        }

        function onSourceChange(oldVal, newVal) {
            if (vm.currentData.Source['FieldName'].nid === 'MTU') {
                vm.isMtuSelected = true;
                if (newVal && newVal.nid !== undefined) {
                    dataService.getByNId(newVal.nid)
                        .then(onGetByNIdSuccess, function (reason) {
                            logger.logErr('Error getting Material tracking unit information', reason);
                        });
                }
            } else {
                vm.isMtuSelected = false;
                vm.mtuQuantity = null;
                vm.currentData.SourceQuantity = null;
            }
            if (vm.currentData.Destination) {
                if (vm.currentData.Destination['FieldName'] === vm.currentData.Source['FieldName'].nid) {
                    var index = vm.sources.indexOf(vm.currentData.Destination['FieldValue']);
                    if (index > -1) {
                        vm.sources.splice(index, 1);
                    }
                }
            }
            //vm.currentData.Source;
        }

        function onDestinationChange(l) {

        }

        function registerEvents() {
            toBeDestroyed[toBeDestroyed.length] = $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
            $scope.$on('$destroy', deregisterEvents);
        }

        function deregisterEvents() {
            for (var i = 0; i < toBeDestroyed.length; i++) {
                toBeDestroyed[i] = null;
            }
        }

        function onPropertyGridValidityChange(event, params) {
            vm.validInputs = params.validity;
        }

        function save() {
            var commandInput;
            if (vm.currentData.Source !== null && (vm.currentData.Source['FieldName'].nid === 'MTU')) {
                commandInput = {
                    'MTUId': vm.mtuId,
                    'DestinationEquipmentNId': vm.currentData.Destination['FieldName'] === 'Equipment' ? vm.currentData.Destination['FieldValue'] : undefined,
                    'SourceQuantity': vm.currentData.SourceQuantity,
                    'DestinationQuantity': vm.currentData.DestinationQuantity
                };
                dataService.MoveMTU(commandInput).then(onMoveMTUSuccess, function (reason) {
                    logger.logErr('Error moving material tracking unit', reason);
                });

            } else {
                commandInput = {
                    'SourceEquipmentNId': vm.currentData.Source['FieldName'].nid === 'Equipment' ? vm.currentData.Source['FieldValue'].nid : undefined,
                    'DestinationEquipmentNId': vm.currentData.Destination['FieldName'] === 'Equipment' ? vm.currentData.Destination['FieldValue'] : undefined,
                    'SourceQuantity': vm.currentData.SourceQuantity,
                    'DestinationQuantity': vm.currentData.DestinationQuantity
                };
                dataService.MoveMTUFromSource(commandInput).then(onMoveMTUFromSourceSuccess, onError);
            }
            vm.validInputs = false;
            $scope.$emit('MaterialMoved');
        }

        function onError(reason) {
            var code = reason.data.error.errorCode;
            logger.logErr('Error moving material tracking unit from source', reason);
            if (code === -10930) {
                var msg = $translate.instant('picore.notifications.errors.errorMovingFromSource');
                vm.overlay = {
                    text: reason.data.error.errorMessage + ' ' + msg,
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

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }

        function cancel() {
            vm.validInputs = false;
            $scope.$broadcast('xor-Reset');
            $scope.$emit('MoveMTUCancel');
        }

        function onGetByNIdSuccess(data) {
            vm.mtuUoM = data.value[0].Quantity.UoMNId;
            vm.mtuId = data.value[0].Id;
            vm.mtuQuantity = data.value[0].Quantity.QuantityValue;
            if (vm.mtuUoM !== null) {
                vm.currentData.UoM = vm.mtuUoM;
                vm.hasMtuUoM = true;
            } else {
                vm.hasMtuUoM = false;
                manageQty();
                vm.checkDis = true;
            }
        }

        function onMoveMTUSuccess() {
            $scope.$emit('MoveMTUSave');
            vm.currentData = {
                EntireQty: [{ checked: false }],
                Source: { FieldName: { id: '', nid: '' }, FieldValue: { id: '', nid: '' } },
                Destination: { FieldName: '', FieldValue: '' }
            };
            $scope.$broadcast('xor-Reset');
        }

        function onMoveMTUFromSourceSuccess() {
            vm.currentData = {
                EntireQty: [{ checked: false }],
                Source: { FieldName: { id: '', nid: '' }, FieldValue: { id: '', nid: '' } },
                Destination: { FieldName: '', FieldValue: '' }
            };
            $scope.$broadcast('xor-Reset');
            $scope.$emit('MoveMTUSave');
        }

        function setData() {
            vm.widgetAttributesSource = {
                'sit-pi-options': vm.sources,
                'sit-pi-to-display': 'nid',
                'sit-pi-to-keep': 'id',
                'sit-is-runtime-entity': true,
                'sit-dialog-table-fields': vm.tableFields,
                'sit-dialog-server-data-options': vm.serverDataOptions,
                'sit-selected-attribute-to-display': 'nid',
                'sit-dialog-config': vm.dialogConfig
            };
            vm.widgetAttributesDestination = {
                'sit-pi-options': vm.destinations,
                'sit-pi-to-display': 'nid',
                'sit-pi-to-keep': 'id'
            };
        }
    }
})();

