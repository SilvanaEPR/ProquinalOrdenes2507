/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiSelectXor', sitPiSelectXorDirective);

    function sitPiSelectXorDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/selectXor/select-xor.html',
            controller: sitPiSelectXorController,
            restrict: 'E',
            controllerAs: 'selectXorCtrl',
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
                onSelectionChangeApi: '&'
            },

            link: function (scope, el, attrs, ctrl) {
                var value = {};
                scope.$watch('selectXorCtrl.selectionEntityName[selectXorCtrl.toKeep] + selectXorCtrl.selectionValue[selectXorCtrl.toKeep]', function () {

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

    sitPiSelectXorController.$inject = ['$scope', 'common.base', 'common.services.logger.service', 'Siemens.SimaticIT.UAPI.PICore.service'];
    function sitPiSelectXorController($scope, common, loggerService, dataService) {
        var selectXorCtrl = this;

        var logger = loggerService.getModuleLogger('sitPiSelectXor widget...');


        selectXorCtrl.api = {
            removeValue: removeValue
        };
        selectXorCtrl.onSelectionChangeApi({ api: selectXorCtrl.api });


        function resetXor() {
            selectXorCtrl.selectionEntityName = selectXorCtrl.options[0];
            selectXorCtrl.selectionValue = selectXorCtrl.options[0];
        }

        function setXor(event, params) {
            if (selectXorCtrl.value.FieldName && selectXorCtrl.options.filter(function (entityName) { return entityName.nid === params.FieldName.nid; }).length > 0) {
                selectXorCtrl.selectionEntityName = { nid: params.FieldName.nid, id: params.FieldName.id };
                selectXorCtrl.toBeSet = { nid: params.FieldValue.nid, id: params.FieldValue.id };
                selectXorCtrl.fromOutside = true;
            }
        }


        init();

        $scope.$on('xor-Reset', resetXor);
        $scope.$on('xor-Set', setXor);

        function onEntityChange(oldVal, newVal) {
            var obj = {};
            obj[selectXorCtrl.toDisplay] = '';
            obj[selectXorCtrl.toKeep] = '';

            if (selectXorCtrl.options && selectXorCtrl.options[0].id !== obj.id) {
                selectXorCtrl.options.splice(0, 0, obj);
            }

            if (newVal.id !== '') {
                dataService.getByEntity(newVal.id, '$orderby=NId').then(onGetByEntitySuccess, onGetByEntityFailure);
            } else {
                selectXorCtrl.entityValueOptions = [];
            }
        }

        function removeValue(valueToRemove) {
            if (valueToRemove) {
                selectXorCtrl.valueToRemove = valueToRemove;
                var index = selectXorCtrl.entityValueOptions.indexOf(valueToRemove);
                if (index > -1) {
                    selectXorCtrl.entityValueOptions.splice(index, 1);
                }
            }
        }

        function onGetByEntitySuccess(data) {
            selectXorCtrl.entityValueOptions = [];
            for (var i = 0; i < data.value.length; i++) {
                selectXorCtrl.entityValueOptions[i] = { id: data.value[i].Id, nid: data.value[i].NId };
            }
            if (selectXorCtrl.fromOutside && selectXorCtrl.value.FieldName !== undefined && selectXorCtrl.value.FieldName.toLowerCase !== undefined
                && selectXorCtrl.value.FieldName.toLowerCase() === 'mtu') {
                selectXorCtrl.entityValueOptions[0] = selectXorCtrl.toBeSet;
                selectXorCtrl.selectionValue = selectXorCtrl.toBeSet;
            } else {
                selectXorCtrl.fromOutside = false;
                selectXorCtrl.toBeSet = {};
            }
            selectXorCtrl.entityValueOptions.unshift({ nid: '' });
        }

        function onGetByEntityFailure(reason) {
            logger.logErr('Error getting values related to {0}'.replace(selectXorCtrl.selectionEntityName[selectXorCtrl.toKeep]), reason);
        }

        function init() {
            selectXorCtrl.removeValue = removeValue;
            selectXorCtrl.onEntityChange = onEntityChange;
            selectXorCtrl.valueToRemove = {};
            selectXorCtrl.entityValueOptions = [];
            if (selectXorCtrl.value !== undefined && (selectXorCtrl.value['FieldName'] !== undefined
                && selectXorCtrl.value['FieldName'][selectXorCtrl.toDisplay] !== undefined && selectXorCtrl.value['FieldName'][selectXorCtrl.toDisplay] !== '')
                && (selectXorCtrl.value['FieldValue'] !== undefined && selectXorCtrl.value['FieldValue'][selectXorCtrl.toKeep] !== '')) {
                dataService.getByEntity(selectXorCtrl.value['FieldName'][selectXorCtrl.toKeep]).then(onGetByEntitySuccess, onGetByEntityFailure);
                selectXorCtrl.selectionValue = selectXorCtrl.value['FieldValue'];
                selectXorCtrl.selectionEntityName = selectXorCtrl.value['FieldName'];
            }
        }
    }
})();
