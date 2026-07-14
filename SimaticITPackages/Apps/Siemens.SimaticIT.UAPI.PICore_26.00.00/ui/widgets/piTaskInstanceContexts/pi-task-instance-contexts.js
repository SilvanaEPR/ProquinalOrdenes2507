(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskInstanceContexts', piTaskInstanceContextsDirective);

    function piTaskInstanceContextsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskInstanceContexts/pi-task-instance-contexts.html',
            controller: piTaskInstanceContextsController,
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

    piTaskInstanceContextsController.$inject = [
        '$stateParams',
        '$scope',
        '$timeout',
        'common.base',
        'task.service'];
    function piTaskInstanceContextsController(
        $stateParams,
        $scope,
        $timeout,
        common,
        taskService) {
        var self = this;
        var backendService;

        activate();

        function activate() {
            self.api = {
                getContextsData: sendContextData
            };
            if (self.onRegisterApi) {
                self.onRegisterApi({ api: self.api });
            }

            init();
            initTaskContextData();
            initValidation();
            exposeModelMethods();
        }

        //UI init functions
        function init() {
            backendService = common.services.runtime.backendService;
            self.isTableInputsValid = true;
            self.editMode = $scope.editable;
            self.taskContextConfigData = [];
            self.taskId = $scope.taskId;
            self.action = $stateParams.componentStateParams.action;
        }

        function prepareContextConfig(userFields) {
            return {
                selectionMode: 'none',
                enableColumnResizing: true,
                onInitCallback: function (config) {
                    $timeout(config.refreshData);
                },
                onSelectionChangeCallback: onSelectionChangeCallback,
                data: _.sortBy(userFields, function (field) { return field.NId.toUpperCase(); })
            };
        }

        function initTaskContextData() {
            if (self.action === 'add') {
                // BUG #185438, #185439
                var options = self.taskId;
                taskService.getContextByDefinition(options).then(function (context) {
                    getContextTableDataFromDefinition(context.value);
                }, backendService.backendError);
            } else {
                taskService.getTaskContext(self.taskId).then(function (context) {
                    getContextTableData(context.value);
                }, backendService.backendError);
            }
        }

        //data validation functions
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

            self.taskContextConfigData.forEach(function (item) {
                if (item.config) {
                    item.config.data.forEach(function (data) {
                        if (isTableValid && typeof data.isValid !== 'undefined') {
                            isTableValid = data.isValid;
                        }
                    });
                }
            });

            return isTableValid;
        }

        //This method is for segregating the context data for table
        function getContextTableDataFromDefinition(contexts) {
            contexts.forEach(function (context) {
                taskService.getUserFieldByContext(context.Id).then(function (userFields) {
                    self.taskContextConfigData[self.taskContextConfigData.length] = { Context: context.NId, config: {}, isUserFieldAvailable: userFields.value.length > 0 };
                    self.taskContextConfigData[self.taskContextConfigData.length - 1].config = prepareContextConfig(userFields.value);
                    if (contexts.length === self.taskContextConfigData.length) {
                        self.taskContextConfigData = _.sortBy(self.taskContextConfigData, function (item) {
                            return item.Context.toUpperCase();
                        });
                    }
                }, backendService.backendError);
            });
        }

        function getContextTableData(contexts) {
            contexts.forEach(function (context) {
                taskService.getTaskUserField(context.Id).then(function (userFields) {
                    self.taskContextConfigData[self.taskContextConfigData.length] = { Context: context.NId, config: {}, isUserFieldAvailable: userFields.value.length > 0};
                    self.taskContextConfigData[self.taskContextConfigData.length - 1].config = prepareContextConfig(userFields.value);
                    if (contexts.length === self.taskContextConfigData.length) {
                        self.taskContextConfigData = _.sortBy(self.taskContextConfigData, function (item) {
                            return item.Context.toUpperCase();
                        });
                    }
                }, backendService.backendError);
            });
        }

        function sendContextData() {
            var contextValueList = [];
            var contextData = self.taskContextConfigData;
            for (var i = 0; i < contextData.length; i++) {
                var UserFields = [];
                var UserFieldsData = contextData[i].config.data;
                for (var j = 0; j < UserFieldsData.length; j++) {
                    if (UserFieldsData[j].UserFieldValue) {
                        UserFields.push({ UserFieldNId: UserFieldsData[j].NId, UserFieldValue: UserFieldsData[j].UserFieldValue });
                    }
                }
                if (UserFields.length > 0) {
                    contextValueList.push({ ContainerDefinitionNId: contextData[i].Context, ContainerNId: contextData[i].Context, UserFieldValues: UserFields });
                }
            }
            return contextValueList;
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
            self.rowType = row.UserFieldType;
            self.taskContextConfigData.forEach(function (item) {
                if (item.config) {
                    item.config.data.forEach(function (data) {
                        if (data.isValid) {
                            item.edit = false;
                        }
                    });
                }
            });

            if (row.IsReadOnly !== true) {
                self.row = row;
                row.edit = true;
            }
        }

        function onSelectionChangeCallback(list, item) {
            if (item) {
                self.taskContextConfigData.forEach(function (configObj) {
                    configObj.config.data.forEach(function (row) {
                        row.isSelected = false;
                    });
                });
                item.isSelected = true;
            }
        }

        // register events
        $scope.$watch('vm.isTableInputsValid', function () {
            $scope.$emit('pi-task-instance-contexts.validity-changed', { 'isValid': self.isTableInputsValid });
        }, true);
    }
}());
