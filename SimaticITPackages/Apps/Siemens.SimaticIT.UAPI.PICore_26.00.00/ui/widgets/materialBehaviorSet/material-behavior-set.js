/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiMaterialBehaviorSet', materialBehaviorSetDirective);

    function materialBehaviorSetDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/materialBehaviorSet/material-behavior-set.html',
            controller: materialBehaviorSetController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterMaterialBehaviorSetApi: '&'
            }
        };
    }

    materialBehaviorSetController.$inject = ['$scope',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.behaviorservice',
        'common.widgets.messageOverlay.service',
        '$translate'];
    function materialBehaviorSetController($scope, common, loggerService, dataService, messageOverlay, $translate) {
        var vm = this;
        var logger;
        var toBeDestroyed = [];
        vm.selectIsEnabled = false;
        init();
        vm.notCanceled = true;
        vm.currentData = {
            Place: { FieldName: '', FieldValue: '' }
        };

        vm.api = {
            setInitialPlace: setInitialPlace
        };
        vm.onRegisterMaterialBehaviorSetApi({ api: vm.api });
        vm.onChange = onChange;
        vm.onBehaviorChange = onBehaviorChange;

        vm.Title = $translate.instant('picore.titles.materialBehaviorSetTitle');

        vm.translatedPlace = $translate.instant('picore.headers.propertyGrids.place');
        vm.translatedBehavior = $translate.instant('picore.headers.propertyGrids.materialBehavior');

        vm.translatedSave = $translate.instant('picore.buttonsAndTooltips.save');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');

        function init() {
            logger = loggerService.getModuleLogger('materialBehaviorSet directive...');
            vm.ngReadonly = false;
            vm.notCanceled = true;
            vm.behaviors = [];
            vm.placesOptions = [{ nid: 'Equipment', id: 'Equipment' }, { nid: 'Location', id: 'Location' }];
            vm.save = save;
            vm.cancel = cancel;
            vm.placeNId = '';
            registerEvents();
            setData();
        }

        function setInitialPlace(equipmentId) {
            if (equipmentId) {
                vm.EquipmentId = equipmentId;
                dataService.getEquipmentById(equipmentId).then(onGetEquipmentSuccess, function (reason) { logger.logErr('Error getting equipment', reason); });
                vm.currentData.Place['FieldName'] = { nid: 'Equipment', id: 'Equipment' };
                vm.currentData.Place['FieldValue'] = { nid: vm.EquipmentNId, id: vm.EquipmentId };
            }
        }

        function onChange(oldVal, newVal) {
            if (newVal && newVal.id !== '') {
                if (vm.currentData.Place['FieldName'] === 'Equipment') {
                    vm.EquipmentNId = newVal.nid;
                    dataService.getEquipmentMaterialBehavior(vm.EquipmentNId)
                        .then(onGetMaterialBehaviorSuccess, function (reason) {
                            logger.logErr('Error getting material behavior', reason);
                        });
                }
                vm.currentData.Place = newVal;
                vm.selectIsEnabled = true;
            } else {
                vm.currentData.BehaviorType = null;
                vm.selectIsEnabled = false;
            }

        }

        function onBehaviorChange(oldVal, newVal) {
            if (oldVal !== undefined && newVal && newVal !== vm.initialBehaviorNId) {
                if (vm.initialBehaviorNId === newVal.nid) {
                    vm.alreadySet = true;
                } else {
                    vm.alreadySet = false;
                }
            }
        }

        function onGetEquipmentSuccess(data) {

            if (data.value.length === 1) {
                vm.EquipmentNId = data.value[0].NId;
                vm.currentData.Place['FieldValue'] = vm.EquipmentNId;
                dataService.getEquipmentMaterialBehavior(vm.EquipmentNId)
                    .then(onInitialGetMaterialBehaviorSuccess, function (reason) {
                        logger.logErr('Error getting material behavior', reason);
                    });
            }
        }

        function onGetMaterialBehaviorTypesSuccess(data) {
            if (data.value.length === 1) {

                vm.behaviors[1] = { nid: data.value[0].NId };
                vm.behaviors[0] = { nid: '' };

            } else if (data.value.length > 1) {
                vm.behaviors[0] = { nid: '' };
                for (var i = 0; i < data.value.length; i++) {
                    vm.behaviors[i + 1] = { nid: data.value[i].NId };
                }
            }
        }

        function onGetMaterialBehaviorSuccess(data) {
            if (data.value.length === 0) {
                vm.currentData.BehaviorType = { nid: '' };
                dataService.getMaterialBehaviorTypes('$select=NId')
                    .then(onGetMaterialBehaviorTypesSuccess, function (reason) {
                        logger.logErr('Error getting material behavior types', reason);
                    });
                vm.initialBehaviorNId = '';
                vm.initialBehaviorId = null;
                vm.alreadySet = true;
            } else if (data.value.length === 1) {
                vm.initialBehaviorId = data.value[0].Id;
                dataService.getMaterialBehaviorTypes('$select=NId')
                    .then(onGetMaterialBehaviorTypesSuccess, function (reason) {
                        logger.logErr('Error getting material behavior types', reason);
                    });
                vm.currentData.BehaviorType = { nid: data.value[0].MaterialBehaviorType.NId };

                if (vm.currentData.BehaviorType) {
                    vm.alreadySet = true;
                    vm.initialBehaviorNId = vm.currentData.BehaviorType.nid;
                } else {
                    vm.alreadySet = false;
                    vm.initialBehaviorNId = '';
                    vm.initialBehaviorId = null;
                }
            } else {
                vm.alreadySet = false;
                vm.initialBehaviorNId = '';
                vm.initialBehaviorId = null;
            }

        }

        function onInitialGetMaterialBehaviorSuccess(data) {

            if (data.value.length === 0) {
                vm.currentData.BehaviorType = null;
                dataService.getMaterialBehaviorTypes('$select=NId')
                    .then(onGetMaterialBehaviorTypesSuccess, function (reason) {
                        logger.logErr('Error getting material behavior types', reason);
                    });
            } else if (data.value.length === 1) {

                dataService.getMaterialBehaviorTypes('$select=NId')
                    .then(onGetMaterialBehaviorTypesSuccess, function (reason) {
                        logger.logErr('Error getting material behavior types', reason);
                    });
                vm.initialBehaviorNId = data.value[0].MaterialBehaviorType.NId;
                vm.currentData.BehaviorType = { nid: data.value[0].MaterialBehaviorType.NId };
                vm.alreadySet = true;
            }
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
            if (vm.currentData.BehaviorType && vm.currentData.BehaviorType.nid === '') {
                commandInput = {
                    'MaterialBehaviorId': vm.initialBehaviorId
                };
                dataService.deleteMaterialBehavior(commandInput).then(onMaterialBehaviorUnSetSuccess, function (reason) {
                    logger.logErr('Error associating no material behavior', reason);

                });
            } else if (vm.currentData.Place !== null && vm.currentData.Place['FieldName'] === 'Equipment'
                && vm.currentData.Place['FieldValue'] !== undefined && vm.currentData.Place['FieldValue'] !== '') {
                commandInput = {
                    'EquipmentNId': vm.currentData.Place['FieldName'] === 'Equipment' ? vm.currentData.Place['FieldValue'] : undefined,
                    'MaterialBehaviorType': vm.currentData.BehaviorType.nid
                };
                dataService.createMaterialBehavior(commandInput).then(onMaterialBehaviorSetSuccess, function (reason) {
                    logger.logErr('Error associating material behavior', reason);

                });
            } else if (vm.currentData.Place !== null && vm.currentData.Place['FieldName'] === 'Location'
                && vm.currentData.Place['FieldValue'] !== undefined && vm.currentData.Place['FieldValue'] !== '') {
                commandInput = {
                    'EquipmentNId': undefined,
                    'MaterialBehaviorType': vm.currentData.BehaviorType.nid
                };
                dataService.createMaterialBehavior(commandInput).then(onMaterialBehaviorSetSuccess, function (reason) {
                    logger.logErr('Error moving material behavior', reason);

                });
            }

            vm.validInputs = false;
            vm.notCanceled = true;
        }

        function cancel() {
            vm.validInputs = false;
            $scope.$emit('MaterialBehaviorSetCancel');
            $scope.$broadcast('xor-Reset');

        }

        function onMaterialBehaviorSetSuccess() {
            $scope.$emit('MaterialBehaviorSetSave');
            $scope.$broadcast('xor-Reset');
        }

        function onMaterialBehaviorUnSetSuccess() {
            $scope.$emit('MaterialBehaviorSetSave');
            $scope.$broadcast('xor-Reset');
        }

        function setData() {

            vm.widgetAttributesPlace = {
                'sit-pi-options': vm.placesOptions,
                'sit-pi-to-display': 'nid',
                'sit-pi-to-keep': 'id'
            };
            vm.widgetAttributesBehaviors = {
                'sit-options': vm.behaviors,
                'sit-to-display': 'nid',
                'sit-to-keep': 'nid'
            };
        }
    }
})();
