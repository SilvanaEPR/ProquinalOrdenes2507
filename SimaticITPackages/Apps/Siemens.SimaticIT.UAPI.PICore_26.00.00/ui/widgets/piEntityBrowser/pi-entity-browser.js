/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiEntityBrowser', entityBrowserDirective);

    function entityBrowserDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piEntityBrowser/pi-entity-browser.html',
            controller: entityBrowserController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
            },
            bindToController: {
                readOnly: '=?sitReadOnly',
                dialogTableTemplateUri: '=?sitDialogTableTemplateUri',
                dialogTableData: '=?sitDialogTableData',
                dialogTableFields: '=?sitDialogTableFields',
                dialogServerDataOptions: '=?sitDialogServerDataOptions',
                dialogConfig: '=?sitDialogConfig',
                typeaheadTemplateUri: '=?sitTypeaheadTemplateUri',
                selectedAttributeToDisplay: '=?sitSelectedAttributeToDisplay',
                selectedObject: '=?sitSelectedObject',
                placeholder: '=?sitPlaceholder',
                value: '=?sitValue',
                validation: '=?sitValidation',
                ngDisabled: '=?',
                ngReadonly: '=?',
                required: '=?sitRequired'
            }
        };
    }

    entityBrowserController.$inject = ['$scope',
        'common.widgets.globalDialog.service',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.services.logger.service',
        'common.widgets.messageOverlay.service',
        '$translate'];
    function entityBrowserController($scope,
        globalDialogService,
        commonService,
        loggerService,
        messageOverlay,
        $translate) {
        var vm = this;
        var sett;
        var count = 0;
        var defaultValues = {
            selectedAttributeToDisplay: 'name'
        };


        if (vm.dialogTableFields) {
            if (vm.dialogServerDataOptions) {
                //is server side
                vm.tableConfig = {
                    dataSource: {
                        dataService: commonService,
                        appName: 'PICore',
                        dataEntity: vm.dialogServerDataOptions.dataEntity,
                        optionsString: vm.dialogServerDataOptions.optionsString
                    },
                    selectionMode: 'single',
                    fields: vm.dialogTableFields,
                    pageSizes: [5, 8],
                    pageSizeDefault: 5
                };
                $scope.$watch('vm.tableConfig.getSettings().pagination.totalItemCount', function (newValue) {
                    vm.tableConfig.data = newValue;
                    if (newValue === undefined || newValue.length === 0) {
                        vm.templateData.dialogTranslatedNoData = $translate.instant('picore.labels.noData');
                        vm.templateData.NoData = true;
                    } else {
                        vm.templateData.NoData = false;
                    }
                });
            } else {
                //is client side
                vm.tableConfig = {
                    data: [],
                    selectionMode: 'single',
                    fields: vm.dialogTableFields,
                    pageSizes: [5, 8],
                    pageSizeDefault: 5
                };
            }
        }

        vm.templateData = {
            tableConfig: vm.tableConfig,
            dialogConfig: vm.dialogConfig,
            dialogId: 'boop-eb-pi-table'
        };

        vm.dialogConfig.onPiSelectionChangeCallback = function (list, item) {
            if (list) {
                vm.selectedObject = item;
                vm.selectedList = list;
                if (vm.value==='') {
                    vm.buttonsListGrid[0].disabled = false;
                }else if ((item.NId!=undefined && ( item.NId === vm.value.NId || item.NId === vm.value.nid)) && item.Revision === vm.value.Revision) {
                    vm.buttonsListGrid[0].disabled = true;
                } else if ((item.BillOfMaterials !== undefined && item.BillOfMaterials.NId != undefined && (item.BillOfMaterials.NId === vm.value.BillOfMaterials.NId
                    || item.NId === vm.value.BillOfMaterials.NId)) && item.Revision === vm.value.Revision) {
                    vm.buttonsListGrid[0].disabled = true;
                }else {
                    vm.buttonsListGrid[0].disabled = false;
                }
            } else {
                if (vm.value !== '' && vm.value !== undefined && (vm.selectedObject===undefined || vm.selectedObject !== undefined && vm.selectedObject.isSelected)) {
                    if (count === 1) {
                        sett = vm.tableConfig.getSettings();
                        sett.selectedRows[0] = vm.value;
                        vm.tableConfig.applySettings(sett);
                        vm.buttonsListGrid[0].disabled = true;
                        count = 0;
                    } else {
                        sett = vm.tableConfig.getSettings();
                        sett.selectedRows[0] = vm.value;
                        vm.tableConfig.applySettings(sett);
                        count = 1;
                    }
                } else {
                    if (vm.selectedObject === undefined) {
                        vm.buttonsListGrid[0].disabled = true;
                    } else {
                        vm.buttonsListGrid[0].disabled = vm.selectedObject.isSelected;
                    }
                    vm.selectedObject = item;
                    vm.selectedList = list;
                }
            }
        };


        $scope.$watch('vm.dialogServerDataOptions.optionsString', function (newValue) {

            if (newValue) {
                vm.tableConfig.dataSource.optionsString = newValue;
                if (vm.tableConfig.refreshData) {
                    vm.tableConfig.refreshData();
                }
            }
        });

        $scope.$watch('vm.dialogTableData', function (newValue) {
            vm.tableConfig.data = newValue;
            if (newValue === undefined || newValue.length === 0) {
                vm.templateData.NoData = true;
            } else {
                vm.templateData.NoData = false;
            }
        });

        vm.onSelect = function ($item, $model) {
            vm.value = $model;
            vm.selectedObject = $model;
            $scope.$emit('sit-pi-entity-browser.entity-selected', { item: $item });
        };

        if (vm.value === undefined) {
            vm.value = vm.selectedObject;
        }

        // If validation.required is present, it will override the value of required
        if (vm.validation && angular.isDefined(vm.validation.required)) {
            vm.required = vm.validation.required;
        } else if ((vm.required === null) || (angular.isUndefined(vm.required))) {
            // Default value for required if validation.required and required not present
            vm.required = false;
        }

        if (!vm.placeholder) {
            vm.placeholder = $translate.instant('entityPicker.defaultPlaceHolder');
        }

        // Default value for selectedAttributeToDisplay if not present
        if ((vm.selectedAttributeToDisplay === null) || (angular.isUndefined(vm.selectedAttributeToDisplay))) {
            vm.selectedAttributeToDisplay = defaultValues.selectedAttributeToDisplay;
        }

        if (vm.dialogConfig !== undefined) {
            vm.dialogTitle = vm.dialogConfig.title;
            vm.templateData.tableHeaders = vm.dialogConfig.tableHeaders;
        }

        vm.showPopup = function () {
            var dialogData = {
                title: vm.dialogTitle,
                templatedata: vm.templateData,
                templateuri: vm.dialogTableTemplateUri,
                buttons: vm.buttonsListGrid
            };
            vm.buttonsListGrid[0].disabled = true;
            globalDialogService.set(dialogData);
            globalDialogService.show();
        };

        vm.buttonsListGrid = [{
            id: $scope.$id + '_okButton',
            displayName: $translate.instant('picore.buttonsAndTooltips.select'),
            onClickCallback: function () {
                count = 0;
                if (vm.selectedObject) {
                    if (vm.value && vm.value.NId === vm.selectedObject.NId && vm.value.Revision === vm.selectedObject.Revision && vm.value.NId!==undefined) {
                        vm.valueToShow = '';
                        vm.value = '';
                    } else {
                        vm.value = vm.selectedObject;
                        if (vm.dialogTableFields) {
                            var nestedFields = vm.dialogTableFields;
                            for (var property in nestedFields) {
                                if (nestedFields.hasOwnProperty(property)) {
                                    if (property.indexOf('NId') !== -1 && property.indexOf('/') !== -1) {
                                        var splittedProperty = property.split('/');
                                        var firstLevel = vm.selectedObject[splittedProperty[0]];
                                        vm.valueToShow = firstLevel[splittedProperty[1]];
                                        break;
                                    } else if (property.indexOf('NId') !== -1 && property.indexOf('/') === -1) {
                                        vm.valueToShow = vm.selectedObject['NId'];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    vm.value = '';
                    vm.valueToShow = '';
                }

                globalDialogService.hide();
                $scope.$emit('sit-pi-entity-browser.entity-selected', { item: vm.value });
            },
            disabled: true
        }, {
            id: $scope.$id + '_cancelButton',
            displayName: $translate.instant('picore.buttonsAndTooltips.cancel'),
            onClickCallback: function () {
                globalDialogService.hide();
            },
            disabled: false
        }
        ];
    }
})();
