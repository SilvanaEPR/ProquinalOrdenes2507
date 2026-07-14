(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskInstanceParameters', piTaskInstanceParametersDirective);

    function piTaskInstanceParametersDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskInstanceParameters/pi-task-instance-parameters.html',
            controller: piTaskInstanceParametersController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                taskId: '=',
                editable: '='
            },
            bindToController: {
                onRegisterApi: '&'
            }
        };
    }

    piTaskInstanceParametersController.$inject = [
        '$stateParams',
        '$scope',
        '$translate',
        '$timeout',
        'common.base',
        'task.service'];
    function piTaskInstanceParametersController(
        $stateParams,
        $scope,
        $translate,
        $timeout,
        common,
        taskService) {
        var self = this;
        var backendService, quantityText;

        activate();

        function activate() {
            self.api = {
                getParametersData: sendParameterData
            };
            if (self.onRegisterApi) {
                self.onRegisterApi({ api: self.api });
            }

            init();
            initParameterConfig();
            initUoms();
            initValidation();
            initUomValidation();
            exposeModelMethods();
            loadTaskParameters();
        }

        //UI init functions
        function init() {
            backendService = common.services.runtime.backendService;
            quantityText = 'Quantity';

            self.isTableInputsValid = true;
            self.isUomValid = true;
            self.editMode = $scope.editable;
            self.taskParameterConfig = [];
            self.uomOptions = [];
            self.taskId = $scope.taskId;
            self.action = $stateParams.componentStateParams.action;
        }

        function initParameterConfig() {
            self.taskParameterConfig = {
                selectionMode: 'single',
                enableColumnResizing: false,
                onSelectionChangeCallback: function (list, item) {
                    if (item) {
                        self.taskParameterConfig.data.forEach(function (row) {
                            row.isSelected = false;
                        });
                        item.isSelected = true;
                    }
                },
                onInitCallback: function (config) {
                    $timeout(config.refreshData);
                }
            };
        }


        function initUoms() {
            taskService.getUoms().then(function (data) {
                if (data && data.value) {
                    data.value.forEach(function (uom) {
                        self.uomOptions.push({ NId: uom.NId });
                    });
                    self.uomOptions = _.sortBy(self.uomOptions, function (item) { return item.NId.toUpperCase(); });
                }
            }, backendService.backendError);
        }

        //data validation functions
        function initUomValidation() {
            self.validation = {
                patternInfo: $translate.instant('SIT.TSK.warning.madatoryText'),
                custom: function (value, ngModel) {
                    if (value && !value.NId) {
                        ngModel.$setValidity(ngModel.$$parentForm.$name, false);
                        self.isUomValid = false;
                    } else {
                        ngModel.$setValidity(ngModel.$$parentForm.$name, true);
                        self.isUomValid = true;
                    }
                }
            };
        }

        function initValidation() {
            var list = angular.copy(taskService.validationList);
            for (var i = 0; i < list.length; i++) {
                list[i].validationPattern.custom = function (value, ngModel) {
                    validateInputCell(value, ngModel);
                };
            }
            self.validationList = list;
        }

        function validateInputCell(val, ngModel) {
            var isValid = false;
            if (!val) {
                self.row.isValid = true;
                ngModel.$setValidity(ngModel.$$parentForm.$name, !isValid);
                self.isTableInputsValid = checkTableValidation();
            } else {
                var selectedType = {
                    Id: self.rowType === 'GUID' ? 'Guid' : self.rowType
                };
                isValid = taskService.validateValueByType(val, selectedType).isValid;
                ngModel.$setValidity(ngModel.$$parentForm.$name, isValid);
                self.row.isValid = isValid;
                if (!isValid) {
                    self.isTableInputsValid = false;
                } else {
                    self.isTableInputsValid = checkTableValidation();
                }
            }
        }

        function checkTableValidation() {
            var isTableValid = true;

            self.taskParameterConfig.data.forEach(function (item) {
                if (isTableValid && typeof item.isValid !== 'undefined') {
                    isTableValid = item.isValid;
                }
            });

            return isTableValid;
        }

        // methods for preparing the table data
        function getParameterData(taskId) {
            if (self.action === 'add') {
                taskService.getParameterByDefinition(taskId).then(function (data) { prepareParameterData(data); }, backendService.backendError);
            } else {
                taskService.getParameterByTask(taskId).then(function (data) { prepareParameterData(data); }, backendService.backendError);
            }
        }

        function sendParameterData() {
            var parameterValueList = [];
            var parameterData = self.taskParameterConfig.data;
            for (var i = 0; i < parameterData.length; i++) {
                if (!parameterData[i].IsReadOnly && (self.backupParameterData[i].ParameterValue !== parameterData[i].ParameterValue
                    || self.backupParameterData[i].uomNId !== parameterData[i].uomNId)) {
                    parameterValueList.push({
                        ParameterNId: parameterData[i].NId,
                        ParameterValue: parameterData[i].ParameterValue,
                        ParameterUoMNId: parameterData[i].uomNId ? parameterData[i].uomNId.NId : null
                    });
                }
            }
            return parameterValueList;
        }

        function prepareParameterData(data) {
            var parameters = data.value;
            parameters.forEach(function (param) {
                if (param.ParameterType === quantityText) {
                    param.uomNId = { NId: param.ParameterUoMNId };
                }
            });
            self.taskParameterConfig.data = parameters;
            self.taskParameterConfig.data = _.sortBy(self.taskParameterConfig.data, function (item) {
                return item.NId.toUpperCase();
            });
            self.backupParameterData = angular.copy(self.taskParameterConfig.data);
        }

        function loadTaskParameters() {
            getParameterData(self.taskId);
        }

        //table row selection methods
        function exposeModelMethods() {
            self.onRowClick = onRowClick;
            self.onRowBlur = onRowBlur;
            self.focusInputElement = focusInputElement;
        }

        function onRowBlur(item) {
            if (item.isValid) {
                item.edit = false;
            }
        }

        function focusInputElement(elementID) {
            $timeout(function () {
                var sitTextElement = document.getElementById(elementID);
                var input = sitTextElement.getElementsByTagName('ng-form')[0].getElementsByTagName('div')[0].getElementsByTagName('input')[0];
                input.focus();
            });
        }

        function onRowClick(row, rows) {
            self.rowType = row.ParameterType;
            self.taskParameterConfig.data.forEach(function (item) {
                if (item.isValid) {
                    item.edit = false;
                }

            });
            if (row.IsReadOnly !== true) {
                self.row = row;
                row.edit = true;
            }
        }

        //register events
        $scope.$watch('vm.isTableInputsValid', function () {
                $scope.$emit('pi-task-instance-parameters.validity-changed', { 'isValid': self.isTableInputsValid && self.isUomValid });
        }, true);
    }
}());
