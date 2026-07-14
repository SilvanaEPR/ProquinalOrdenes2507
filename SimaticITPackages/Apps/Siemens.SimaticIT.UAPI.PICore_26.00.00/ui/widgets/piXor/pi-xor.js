/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiXor', sitPiXorDirective);

    function sitPiXorDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piXor/pi-xor.html',
            controller: sitPiXorController,
            restrict: 'E',
            controllerAs: 'piXorCtrl',
            scope: {
            },
            bindToController: {
                'readOnly': '=ngReadonly',
                'value': '=sitValue',
                'sitChange': '=?',
                'validation': '=sitValidation',
                'options': '=sitPiOptions',
                'toDisplay': '=sitPiToDisplay',
                'toKeep': '=sitPiToKeep',
                'dialogConfig': '=?sitDialogConfig',
                'isRuntimeEntity': '=?sitIsRuntimeEntity',
                'onSelectionChangeApi': '&'
            },

            link: function (scope, el, attrs, ctrl) {
                var value = {};
                scope.$watch('piXorCtrl.selectionEntityName[piXorCtrl.toKeep] + piXorCtrl.selectionValue[piXorCtrl.toKeep]', function () {

                    if (ctrl.selectionValue) {
                        if (ctrl.selectionValue[ctrl.toDisplay] === '') {
                            value = {};
                            ctrl.selectionValue = null;
                        } else {
                            value['FieldValue'] = ctrl.selectionValue[ctrl.toDisplay];
                        }
                    }
                    if (ctrl.selectionEntityName) {
                        if (ctrl.selectionEntityName[ctrl.toDisplay] !== '') {
                            value['FieldName'] = ctrl.selectionEntityName[ctrl.toDisplay];
                        } else {
                            value = {};
                            ctrl.selectionValue = null;
                        }
                    }
                    ctrl.value = value;

                    return value;
                }, true);

            }
        };
    }

    sitPiXorController.$inject = ['$scope',
        '$translate',
        'common.base',
        'common.services.logger.service',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'Siemens.SimaticIT.UAPI.PICore.service'];
    function sitPiXorController($scope, $translate, common, loggerService, commonService, dataService) {
        var piXorCtrl = this;

        var logger = loggerService.getModuleLogger('sitPiXor widget...');
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
        piXorCtrl.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
        piXorCtrl.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        piXorCtrl.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        piXorCtrl.booleanOperators = [ops.eq, ops.neq];

        piXorCtrl.api = {
            removeValue: removeValue
        };
        piXorCtrl.onSelectionChangeApi({ api: piXorCtrl.api });


        function resetXor() {
            piXorCtrl.selectionEntityName = piXorCtrl.options[0];
            piXorCtrl.selectionValue = piXorCtrl.options[0];
        }

        function setXor(event, params) {
            if (piXorCtrl.value.FieldName && piXorCtrl.options.filter(function (entityName) { return entityName.nid === params.FieldName.nid; }).length > 0) {
                piXorCtrl.selectionEntityName = { nid: params.FieldName.nid, id: params.FieldName.id };
                piXorCtrl.toBeSet = { nid: params.FieldValue.nid, id: params.FieldValue.id };
                piXorCtrl.fromOutside = true;
            }
        }

        $scope.$watch('piXorCtrl.selectionValue', function (newValue) {
            if (newValue) {
                if (piXorCtrl.entityValueOptions && piXorCtrl.entityValueOptions.length > 0 && piXorCtrl.entityValueOptions[0].nid !== '' && !piXorCtrl.isRuntimeEntity) {
                    piXorCtrl.entityValueOptions.unshift({ nid: '' });
                }
            }
        }, true);


        init();

        $scope.$on('xor-Reset', resetXor);
        $scope.$on('xor-Set', setXor);

        function onEntityChange(oldVal, newVal) {
            var obj = {};
            obj[piXorCtrl.toDisplay] = '';
            obj[piXorCtrl.toKeep] = '';

            if (piXorCtrl.options && piXorCtrl.options[0].id !== obj.id) {
                piXorCtrl.options.splice(0, 0, obj);
            }
            if (newVal.id !== '') {
                if (newVal.id == 'MaterialTrackingUnit' && piXorCtrl.toBeSet.id !== undefined) {
                    dataService.getById(piXorCtrl.toBeSet.id).then(onGetByEntitySuccess, onGetByEntityFailure);

                } else {
                    dataService.getByEntity(newVal.id, '$orderby=NId').then(onGetByEntitySuccess, onGetByEntityFailure);
                }
            } else {
                piXorCtrl.entityValueOptions = [];
            }
        }

        function removeValue(valueToRemove) {
            if (valueToRemove) {
                piXorCtrl.valueToRemove = valueToRemove;
                var index = piXorCtrl.entityValueOptions.indexOf(valueToRemove);
                if (index > -1) {
                    piXorCtrl.entityValueOptions.splice(index, 1);
                }
            }
        }

        function onGetByEntitySuccess(data) {
            piXorCtrl.entityValueOptions = [];
            if (piXorCtrl.value.FieldName !== undefined && piXorCtrl.value.FieldName.hasOwnProperty('id') && piXorCtrl.value.FieldName.id === 'MaterialTrackingUnit'
                || piXorCtrl.value.FieldName === 'MTU') {
                piXorCtrl.isRuntimeEntity = true;
                if (piXorCtrl.fromOutside) {
                    piXorCtrl.selectionValue = piXorCtrl.toBeSet;
                } else {
                    piXorCtrl.fromOutside = false;
                    piXorCtrl.toBeSet = {};
                }
            } else {
                piXorCtrl.isRuntimeEntity = false;
                piXorCtrl.selectionValue = {};
                piXorCtrl.fromOutside = false;
                piXorCtrl.toBeSet = {};
            }
            for (var i = 0; i < data.value.length; i++) {
                piXorCtrl.entityValueOptions[i] = { id: data.value[i].Id, nid: data.value[i].NId };
            }

        }

        function onGetByEntityFailure(reason) {
            logger.logErr('Error getting values related to {0}'.replace(piXorCtrl.selectionEntityName[piXorCtrl.toKeep]), reason);
        }

        function init() {
            piXorCtrl.isRuntimeEntity = false;
            piXorCtrl.removeValue = removeValue;
            piXorCtrl.onEntityChange = onEntityChange;
            piXorCtrl.valueToRemove = {};
            piXorCtrl.entityValueOptions = [];

            piXorCtrl.dialogTemplateUri = 'Siemens.SimaticIT.UAPI.PICore/widgets/piEntityBrowser/popup-table-template.html';
            piXorCtrl.fields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.nId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: piXorCtrl.stringOperators,
                        default: false,
                        validation: {}
                    }
                },
                'MaterialNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.materialNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: piXorCtrl.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'EquipmentNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.equipmentNId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: piXorCtrl.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'Quantity.QuantityValue': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.quantity'),
                    filtering: {
                        type: 'number',
                        allowedCompareOperators: piXorCtrl.numberOperators,
                        default: false,
                        validation: { required: false }
                    }
                }
                ,
                'Quantity/UoMNId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.uoM'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: piXorCtrl.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                pagingOptions: {
                    pageSizes: [5, 8],
                    pageSize: 5,
                    currentPage: 1
                }
            };
            piXorCtrl.serverDataOptions = {
                dataEntity: 'MaterialTrackingUnit',
                dataService: commonService
            };
            piXorCtrl.attrToDisplay = 'nid';
        }
    }
})();
