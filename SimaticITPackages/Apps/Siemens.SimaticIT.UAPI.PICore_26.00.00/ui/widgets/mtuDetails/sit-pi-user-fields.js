/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiMtuUserFields', SitPiUserFieldsDirective);

    function SitPiUserFieldsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/mtuDetails/sit-pi-user-fields.html',
            controller: SitPiUserFieldsController,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {},
            bindToController: {
                onRegisterUserFieldsApi: '&'
            }
        };
    }

    SitPiUserFieldsController.$inject = ['$timeout',
        '$scope',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.service',
        'common.services.logger.service',
        '$translate',
        'common.widgets.messageOverlay.service',
        '$q'];

    function SitPiUserFieldsController($timeout,
        $scope,
        base,
        dataService,
        loggerService,
        $translate,
        messageOverlay,
        $q) {
        var vm = this;
        var stringFailedParams = '\n';
        var bulkOverlay = false;
        vm.isEditEnabled = false;
        vm.showEdit = false;
        vm.isUserFieldValueReadOnly = true;
        var deferred = $q.defer();
        vm.dataReady = false;
        vm.translatedNoData = $translate.instant('picore.labels.noData');
        vm.saveBtn = $translate.instant('picore.buttonsAndTooltips.save');
        vm.cancelBtn = $translate.instant('picore.buttonsAndTooltips.cancel');
        vm.editBtn = $translate.instant('picore.buttonsAndTooltips.edit');
        var emptyId = '00000000-0000-0000-0000-000000000000';
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
        var backendService = base.services.runtime.backendService;
        var internalService = {
            findAll: findAll
        };
        vm.stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
        vm.dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        vm.booleanOperators = [ops.eq, ops.neq];
        var logger = loggerService.getModuleLogger('SitPiUserFieldsController');
        vm.onActionClicked = onActionClicked;

        init();

        function init() {
            initTableOptions();
            initTableData();

            vm.api = {
                setMtuId: setMtuId,
                enableEdit: enableEdit
            };

            vm.onRegisterUserFieldsApi({ api: vm.api });

            vm.onEdit = onEdit;
            vm.onSave = onSave;
            vm.onCancel = onCancel;

            vm.showSave = false;
            vm.showCancel = false;
            vm.showEdit = false;

            vm.mtuUserFieldDataConfig = {
                Headers: [
					{
					    Key: 'NId',
					    DisplayName: $translate.instant('picore.headers.tables.nId'),
					    IsSortDefault: true
					},
					{
					    Key: 'UserFieldType',
					    DisplayName: $translate.instant('picore.headers.tables.type')
					},
					{
					    Key: 'UserFieldValue',
					    DisplayName: $translate.instant('picore.headers.tables.value'),
					    IsEditable: true
					}
                ],
                onPiSelectionChangeCallback: function (list, item) {
                    if (item) {
                        vm.isItemSelected = true;
                        vm.selectedItem = item;

                    }
                }
            };

            vm.toolbarButtons = [
                {
                    icon: 'fa-floppy-o',
                    name: 'save',
                    label: vm.saveBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                },
				{
				    icon: 'fa-times',
				    name: 'cancel',
				    label: vm.cancelBtn,
				    visibility: false,
				    onClickCallback: vm.onActionClicked
				},
                {
                    icon: 'fa-pencil',
                    name: 'edit',
                    label: vm.editBtn,
                    visibility: false,
                    onClickCallback: vm.onActionClicked
                }
            ];


        }

        $scope.$watch('vm.mtuUserFieldTableConfig.getSettings().pagination.totalItemCount',
                function (newValue) {
                    if (newValue > 0) {

                        vm.NoData = false;
                        if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                            vm.mtuUserFieldDataConfig.setButtonVisible(0, false);
                            if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                                vm.mtuUserFieldDataConfig.setButtonVisible(2, vm.isEditEnabled);
                            }
                            vm.mtuUserFieldDataConfig.setButtonVisible(1, false);
                        }
                    } else {
                        vm.NoData = true;
                        if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                            vm.mtuUserFieldDataConfig.setButtonVisible(2, false);
                            vm.mtuUserFieldDataConfig.setButtonVisible(1, false);
                            vm.mtuUserFieldDataConfig.setButtonVisible(0, false);
                        }
                    }
                }, true);

        function onActionClicked(commandName) {
            switch (commandName) {
                case 'save':
                    onSave();
                    break;
                case 'cancel':
                    onCancel();
                    break;
                case 'edit':
                    onEdit();
                    break;
            }
        }

        function initTableOptions() {
            vm.tableFields = {
                'NId': {
                    sorting: true,
                    grouping: false,
                    quicksearch: true,
                    displayName: $translate.instant('picore.headers.tables.nId'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: true,
                        validation: {}
                    }
                },
                'UserFieldType': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.type'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                },
                'UserFieldValue': {
                    sorting: true,
                    grouping: false,
                    quicksearch: false,
                    displayName: $translate.instant('picore.headers.tables.value'),
                    filtering: {
                        type: 'string',
                        allowedCompareOperators: vm.stringOperators,
                        default: false,
                        validation: { required: false }
                    }
                }

            };

            vm.mtuUserFieldTableConfig = {
                //data: [],
                selectionMode: 'none',
                fields: vm.tableFields,
                pageSizes: [5, 10, 30, 50],
                pageSizeDefault: 5,
                dataSource: {
                    dataService: internalService,
                    dataEntity: 'MaterialTrackingUnitUserField',
                    optionsString: '$filter=MaterialTrackingUnit_Id eq ' + emptyId,
                    appName: 'PICore'

                },
                onSelectionChangeCallback: function (list, item) {
                    if (item) {
                        vm.isItemSelected = true;
                        vm.selectedItem = item;
                    }
                }
            };
        }

        $scope.$watch('vm.mtuId', function (newValue) {
            if (vm.selectedItem) {
                vm.isItemSelected = false;
            }
            if (newValue) {
                vm.mtuUserFieldTableConfig.dataSource.optionsString = '$filter=MaterialTrackingUnit_Id eq ' + vm.mtuId;

            } else {
                vm.mtuUserFieldTableConfig.dataSource.optionsString = '$filter=MaterialTrackingUnit_Id eq ' + emptyId;
            }
            if (vm.mtuUserFieldTableConfig && vm.mtuUserFieldTableConfig.refreshData) {
                vm.mtuUserFieldTableConfig.refreshData();
            }

        }, true
			);


        function findAll(serverDataOptions) {
            var queryModel = {};
            queryModel.appName = serverDataOptions.appName;
            queryModel.entityName = serverDataOptions.entityName;
            var newOptions = '';
            var countFilterOccurances = serverDataOptions.options !== undefined && serverDataOptions.options.split('$filter=') !== undefined
                ? (serverDataOptions.options.split('$filter=').length - 1)
                : 0;
            if (countFilterOccurances > 1) {
                var array = serverDataOptions.options.split('&');
                var filter;
                for (var i = 0; i < array.length; i++) {
                    if ((array[i].split('$filter=').length - 1) > 0) {
                        if (filter === undefined) {
                            filter = array[i];
                            delete array[i];
                        } else {
                            filter += ' and ' + array[i].substr(8, array[i].length);
                            delete array[i];
                        }
                    }
                }
                array.push(filter);
                angular.forEach(array, function (value) {
                    newOptions += value + '&';
                });
                newOptions = newOptions.substring(0, newOptions.length - 1);

            } else {
                if (countFilterOccurances !== 0) {
                    newOptions = serverDataOptions.options;
                }
            }
            queryModel.options = newOptions ? newOptions : serverDataOptions.options;
            var deffer = $q.defer();

            backendService.findAll(queryModel).then(function (data) {
                vm.data = data.value;
                for (var i = 0 ; i < vm.data.length; i++) {
                    vm.data[i].isSelected = null;
                }
                var dataObj = {};
                dataObj.value = vm.data;
                dataObj.currentPage = 0;
                dataObj.count = data.count;
                vm.showEdit = data.value.length > 0;
                deffer.resolve(dataObj);
            }).catch(function (err) {
                deffer.reject(err);
            });
            return deffer.promise;
        }

        function onEdit() {
            //rendere celle editabili
            vm.showEdit = false;
            vm.mtuUserFieldDataConfig.setButtonVisible(2, false);
            vm.showCancel = true;
            vm.mtuUserFieldDataConfig.setButtonVisible(1, true);
            vm.showSave = true;
            vm.mtuUserFieldDataConfig.setButtonVisible(0, true);
            vm.isUserFieldValueReadOnly = false;
            vm.mtuUserFieldDataConfig.setCellEdit();
        }

        function onSave() {
            //rendere celle readonly
            if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                vm.mtuUserFieldDataConfig.setButtonVisible(2, vm.isEditEnabled && vm.mtuUserFieldTableConfig.getSettings().pagination.totalItemCount > 0);
            }
            vm.mtuUserFieldDataConfig.setButtonVisible(1, false);
            vm.mtuUserFieldDataConfig.setButtonVisible(0, false);
            vm.showEdit = true;
            vm.showCancel = false;
            vm.showSave = false;
            bulkOverlay = false;
            var calls = [];
            for (var i = 0; i < vm.data.length; i++) {
                calls.push(dataService.updateMtuUserField({ Id: vm.data[i].Id, UserFieldValue: vm.data[i].UserFieldValue }).catch(exceptionErrorFn));

            }
            $q.all(calls).then(onUpdateMtuUserFieldSuccess, onErrorFn);
        }

        function onUpdateMtuUserFieldSuccess(result) {
            deferred.resolve(JSON.stringify(result));
            vm.showEdit = true;
            vm.showCancel = false;
            vm.showSave = false;
            if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                vm.mtuUserFieldDataConfig.setButtonVisible(2, vm.isEditEnabled && vm.mtuUserFieldTableConfig.getSettings().pagination.totalItemCount > 0);
            }
            vm.mtuUserFieldDataConfig.setButtonVisible(1, false);
            vm.mtuUserFieldDataConfig.setButtonVisible(0, false);
            vm.isUserFieldValueReadOnly = true;
            vm.mtuUserFieldDataConfig.setCellReadOnly();
            if (bulkOverlay) {
                vm.isUserFieldValueReadOnly = false;
                vm.mtuUserFieldDataConfig.setCellEdit();
                vm.showEdit = false;
                vm.showCancel = true;
                vm.showSave = true;
                vm.mtuUserFieldDataConfig.setButtonVisible(2, false);
                vm.mtuUserFieldDataConfig.setButtonVisible(1, true);
                vm.mtuUserFieldDataConfig.setButtonVisible(0, true);
                if (stringFailedParams.endsWith(', ')) {
                    stringFailedParams = stringFailedParams.substring(0, stringFailedParams.lastIndexOf(', '));
                }
                vm.overlay = {
                    text: $translate.instant('picore.notifications.errors.errorBulk') + ' ' + stringFailedParams,
                    title: $translate.instant('picore.titles.errorBulkTitle'),
                    buttons: [{
                        id: 'okButton',
                        displayName: $translate.instant('picore.buttonsAndTooltips.ok'),
                        onClickCallback: function () {
                            stringFailedParams = '\n';
                            removeOverlay();
                            bulkOverlay = false;
                        }
                    }]
                };
                messageOverlay.set(vm.overlay);
                displayOverlay();
            }

        }

        function exceptionErrorFn(reason){
            for (var i = 0; i < vm.mtuUserFieldTableConfig.data.length; i++) {
                if (vm.mtuUserFieldTableConfig.data[i].Id === reason.config.data.Id) {
                    var obj = { nid: vm.mtuUserFieldTableConfig.data[i].NId, value: reason.config.data.UserFieldValue };
                    stringFailedParams += obj.nid + ', ';
                }
            }
            bulkOverlay = true;
            deferred.reject(reason);
        }

        function onErrorFn() {
            removeOverlay();
        }

        function onCancel() {
            vm.overlay = {
                text: $translate.instant('picore.notifications.confirmationsAndMessages.confirmParameterTargetValueRollBackText'),
                title: $translate.instant('picore.titles.confirmCancelBulkTitle'),
                buttons: [{
                    id: 'okButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.yes'),
                    onClickCallback: function () {
                        //rendere celle readonly
                        vm.showEdit = true;
                        if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined) {
                            vm.mtuUserFieldDataConfig.setButtonVisible(2, vm.isEditEnabled && vm.mtuUserFieldTableConfig.getSettings().pagination.totalItemCount > 0);
                        }
                        vm.showCancel = false;
                        vm.mtuUserFieldDataConfig.setButtonVisible(1, false);
                        vm.showSave = false;
                        vm.mtuUserFieldDataConfig.setButtonVisible(0, false);
                        vm.isUserFieldValueReadOnly = true;
                        vm.mtuUserFieldDataConfig.setCellReadOnly();
                        //restore old Data
                        initTableData();
                        removeOverlay();
                    }
                }, {
                    id: 'cancelButton',
                    displayName: $translate.instant('picore.buttonsAndTooltips.no'),
                    onClickCallback: function () {
                        removeOverlay();
                    }
                }]
            };

            messageOverlay.set(vm.overlay);
            displayOverlay();
        }

        function setMtuId(mtuId) {
            vm.mtuId = mtuId;
            initTableData();
        }

        function enableEdit(isEditEnabled) {
            vm.isEditEnabled = isEditEnabled;
            vm.showEdit = isEditEnabled;
            if (vm.mtuUserFieldDataConfig !== null && vm.mtuUserFieldDataConfig !== undefined && vm.mtuUserFieldDataConfig.setButtonVisible !== undefined
                && vm.mtuUserFieldTableConfig && vm.mtuUserFieldTableConfig.getSettings) {
                vm.mtuUserFieldDataConfig.setButtonVisible(2, vm.isEditEnabled && vm.mtuUserFieldTableConfig.getSettings().pagination.totalItemCount > 0);
            }
        }

        function initTableData() {
            vm.dataReady = true;
        }

        function removeOverlay() {
            messageOverlay.hide();
        }

        function displayOverlay() {
            messageOverlay.show();
        }

    }

})();
