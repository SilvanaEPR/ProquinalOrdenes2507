(function () {
    angular.module('Siemens.SimaticIT.UAPI.PICore').directive('exprProductionCtx', productionContextDirective);

    function productionContextDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/exprProductionCtx/expr-production-ctx.html',
            controller: productionContextController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
            },
            bindToController: {
                onRegisterApi: '&'
            }
        };
    }

    productionContextController.$inject = ['$scope', '$translate', 'common.base', 'uapi-productionContextService', 'uapi_eventDispatcherService', 'common.services.swac.SwacUiModuleManager'];

    function productionContextController($scope, $translate, common, productionContextService, eventDispatcherService, swacManager) {

        var backendService;

        var self = this;
        self.workOrderTypeConfig = {
            options: [],
            toDisplay: 'workOrderType',
            toKeep: 'workOrderType',
            value: ''
        };

        activate();

        function activate() {
            init();
            registerEvents();
            initProductionContext(); // Must be executed only once the init() has been completed

            self.api = {
                saveProductionContext: saveProductionContext
            };

            self.onRegisterApi({ api: self.api });
        }

        function init() {
            backendService = common.services.runtime.backendService;

            initWorkOrderEntityPickerOptions();
            initWorkOrderCheckboxConfig();
            initWorkOrderTypeSelectOptions();
            initEquipmentEntityPickerOptions();
            initEquipmentCheckboxConfig();
        }

        function registerEvents() {
            self.onTaskPCARegisterApi = onTaskPCARegisterApi;
        }


        // ==========================================
        // Production Context Restore
        // ==========================================

        // Read the production context and fill the filters
        function initProductionContext() {
            productionContextService.getProductionContext().then(onGetProductionContextAsyncSuccess);
        }

        function onGetProductionContextAsyncSuccess(data) {

            //Is there any fields saved in the Production Context ?
            if (data.value.length > 0) {
                var productionContext = data.value[0];
                // Examine every field to populate the HMI
                for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                    var prodContextField = productionContext.ProductionContextFields[i];
                    // Initialize graphic components
                    initProductionContextField(prodContextField.NId, prodContextField.FieldValue);
                }
            }
        }

        // Restore values
        function initProductionContextField(id, value) {
            if (id === 'WorkOrderNId') {
                self.workOrderEntityPickerConfig.entityValue = value;
            }
            if (id === 'EquipmentNId') {
                self.equipmentEntityPickerConfig.entityValue = value;
            }
            if (id === 'showTaskWithoutWorkOrderNId') {
                self.workOrderCheckboxConfig.value = (value.toLowerCase() === 'true');
            }
            if (id === 'showTaskWithoutEquipmentNId') {
                self.equipmentCheckboxConfig.value = (value.toLowerCase() === 'true');
            }
            if (id === 'WorkOrderType') {
                // Save the value in case the select component is not yet populated
                self.workOrderTypeValueToBeRestored = { workOrderType: value };
                self.workOrderTypeConfig.value = self.workOrderTypeValueToBeRestored;
            }
        }

        // ==========================================
        // Production Context Backup
        // ==========================================

        function saveProductionContext() {
            var obj = prepareProductionContextToSave();
            productionContextService.setProductionContext(obj).then(onSaveProductionContextAsyncSuccess, backendService.backendError);
        }

        function onSaveProductionContextAsyncSuccess() {
            // Update the header
            productionContextService.updateApolloHeader();
            // Inform that a new Production context was saved
            eventDispatcherService.dispatchEvent('ProductionContextArea.onSaveCompleted');
        }

        function onTaskPCARegisterApi(api) {
            self._taskProdContextAreaApi = api;
        }

        // Used to prepare the Process Context backup
        function prepareProductionContextToSave() {
            var filters = [];

            if (!isNullOrEmpty(self.workOrderEntityPickerConfig.entityValue)) {
                filters[filters.length] = {
                    NId: 'WorkOrderNId',
                    FieldValue: isNullOrEmpty(self.workOrderEntityPickerConfig.entityValue.NId) ?
                        self.workOrderEntityPickerConfig.entityValue : self.workOrderEntityPickerConfig.entityValue.NId
                };
            }
            if (!isNullOrEmpty(self.equipmentEntityPickerConfig.entityValue)) {
                filters[filters.length] = {
                    NId: 'EquipmentNId',
                    FieldValue: isNullOrEmpty(self.equipmentEntityPickerConfig.entityValue.NId) ?
                        self.equipmentEntityPickerConfig.entityValue : self.equipmentEntityPickerConfig.entityValue.NId
                };
            }
            filters[filters.length] = {
                NId: 'showTaskWithoutWorkOrderNId',
                FieldValue: self.workOrderCheckboxConfig.value.toString()
            };
            filters[filters.length] = {
                NId: 'showTaskWithoutEquipmentNId',
                FieldValue: self.equipmentCheckboxConfig.value.toString()
            };
            if (!isNullOrEmpty(self.workOrderTypeConfig.value) && !isNullOrEmpty(self.workOrderTypeConfig.value.workOrderType)) {
                filters[filters.length] = {
                    NId: 'WorkOrderType',
                    FieldValue: self.workOrderTypeConfig.value.workOrderType
                };
            }
            return filters;
        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '') {
                return false;
            }
            return true;
        }

        // ==============================================================================
        //                          Entity Pickers
        // ==============================================================================

        // WorkOrders

        function getWorkOrders(searchString) {
            var queryModel = {};
            queryModel.appName = 'UDM';
            queryModel.entityName = 'WorkOrder';
            queryModel.options = '$filter=contains(NId,\'' + searchString + '\')&$orderby=NId';
            return backendService.findAll(queryModel);
        }


        function initWorkOrderEntityPickerOptions() {
            self.workOrderEntityPickerConfig = {
                disableEP: false,
                id: 'epWorkOrder',
                datasource: function (searchString) {
                    return getWorkOrders(searchString).then(function (data) {
                        return data.value;
                    });
                },
                limit: 10,
                waitTime: 500,
                placeholder: $translate.instant('picore.picker.placeholder.WorkOrderPicker'),
                attributetodisplay: 'NId',
                entityValue: '',
                editable: true,
                required: false,
                icvOptions: getEntityPickerGridOptions()
            };

            function getEntityPickerGridOptions() {
                return {
                    gridConfig: {
                        columnDefs: [
                            { field: 'NId', displayName: $translate.instant('picore.headers.tables.workOrder') },
                            { field: 'MaterialNId', displayName: $translate.instant('picore.headers.tables.materialNId') },
                            { field: 'EquipmentNId', displayName: $translate.instant('picore.headers.tables.equipmentNId') },
                            { field: 'Status.StatusNId', displayName: $translate.instant('picore.headers.tables.statusNId') }
                        ]
                    },
                    quickSearchOptions: {
                        enabled: true,
                        field: 'NId',
                        filterText: ''
                    },
                    sortInfo: {
                        field: 'NId',
                        direction: 'asc',
                        fields: [
                            { field: 'NId', displayName: $translate.instant('picore.headers.tables.workOrder'), type: 'string' },
                            { field: 'MaterialNId', displayName: $translate.instant('picore.headers.tables.materialNId'), type: 'string' },
                            { field: 'EquipmentNId', displayName: $translate.instant('picore.headers.tables.equipmentNId'), type: 'string' },
                            { field: 'Status.StatusNId', displayName: $translate.instant('picore.headers.tables.statusNId'), type: 'string' }
                        ]
                    },
                    filterBarOptions: 'sqf',
                    filterFields: getFilterOptions(),
                    pagingOptions: {
                        pageSizes: [5, 10, 25, 50, 100],
                        pageSize: 10,
                        currentPage: 1
                    },
                    selectStyle: 'alternate',
                    selectionMode: 'single',
                    tileConfig: {
                        titleField: 'NId',
                        descriptionField: 'MaterialNId',
                        propertyFields: [
                            { field: 'NId', displayName: $translate.instant('picore.headers.tables.workOrder') },
                            { field: 'MaterialNId', displayName: $translate.instant('picore.headers.tables.materialNId') },
                            { field: 'EquipmentNId', displayName: $translate.instant('picore.headers.tables.equipmentNId') },
                            { field: 'Status.StatusNId', displayName: $translate.instant('picore.headers.tables.statusNId') }
                        ]
                    },
                    viewMode: 'm',      //g: Shows data in a grid.
                    viewOptions: 'gsmlx',    //UI elements to be shown in the viewbar
                    serverDataOptions: {
                        dataService: backendService,
                        dataEntity: 'WorkOrder',
                        optionsString: '',
                        appName: 'UDM'
                    }
                };
            }
            function getFilterOptions() {

                return [
                    { field: 'NId', default: true, displayName: $translate.instant('picore.headers.tables.workOrder'), type: 'string' },
                    { field: 'Name', default: false, displayName: $translate.instant('picore.headers.tables.name'), type: 'string' },
                    { field: 'Description', default: false, displayName: $translate.instant('picore.headers.tables.description'), type: 'string' },
                    { field: 'MaterialNId', default: false, displayName: $translate.instant('picore.headers.tables.materialNId'), type: 'string' },
                    { field: 'MaterialRevision', default: false, displayName: $translate.instant('picore.headers.tables.materialRev'), type: 'string' },
                    { field: 'EquipmentNId', default: false, displayName: $translate.instant('picore.headers.tables.equipmentNId'), type: 'string' },
                    { field: 'Status.StatusNId', default: false, displayName: $translate.instant('picore.headers.tables.statusNId'), type: 'string' }
                ];
            }
        }

        // Equipments

        function getEquipments(searchString) {
            var queryModel = {};
            queryModel.appName = 'UDM';
            queryModel.entityName = 'Equipment';
            queryModel.options = '$filter=contains(NId,\'' + searchString + '\')&$orderby=NId';
            return backendService.findAll(queryModel);
        }

        function initEquipmentEntityPickerOptions() {
            self.equipmentEntityPickerConfig = {
                disableEP: false,
                id: 'epEquipment',
                datasource: function (searchString) {
                    return getEquipments(searchString).then(function (data) {
                        return data.value;
                    });
                },
                limit: 10,
                waitTime: 500,
                placeholder: $translate.instant('picore.picker.placeholder.EquipmentPicker'),
                attributetodisplay: 'NId',
                entityValue: '',
                editable: true,
                required: false,
                icvOptions: getEntityPickerGridOptions()
            };

            function getEntityPickerGridOptions() {
                return {
                    gridConfig: {
                        columnDefs: [
                            { field: 'NId', displayName: $translate.instant('picore.headers.tables.equipmentNId') },
                            { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                            { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                            { field: 'Status.StatusNId', displayName: $translate.instant('picore.headers.tables.statusNId') }
                        ]
                    },
                    quickSearchOptions: {
                        enabled: true,
                        field: 'NId',
                        filterText: ''
                    },
                    sortInfo: {
                        field: 'NId',
                        direction: 'asc',
                        fields: [
                            { field: 'NId', displayName: $translate.instant('picore.headers.tables.equipmentNId') },
                            { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                            { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                            { field: 'Status.StatusNId', displayName: $translate.instant('picore.headers.tables.statusNId') }
                        ]
                    },
                    filterBarOptions: 'sqf',
                    filterFields: getFilterOptions(),
                    pagingOptions: {
                        pageSizes: [5, 10, 25, 50, 100],
                        pageSize: 10,
                        currentPage: 1
                    },
                    selectStyle: 'alternate',
                    selectionMode: 'single',
                    viewMode: 'g',      //g: Shows data in a grid.
                    viewOptions: 'g',    //UI elements to be shown in the viewbar

                    serverDataOptions: {
                        dataService: backendService,
                        dataEntity: 'Equipment',
                        optionsString: '',
                        appName: 'UDM'
                    }
                };
            }
            function getFilterOptions() {

                return [
                    { field: 'NId', default: true, displayName: $translate.instant('picore.headers.tables.equipmentNId'), type: 'string' },
                    { field: 'Name', default: false, displayName: $translate.instant('picore.headers.tables.name'), type: 'string' },
                    { field: 'Description', default: false, displayName: $translate.instant('picore.headers.tables.description'), type: 'string' },
                    { field: 'LevelNId', default: false, displayName: $translate.instant('picore.headers.propertyGrids.levelNId'), type: 'string' },
                    { field: 'Status.StatusNId', default: false, displayName: $translate.instant('picore.headers.tables.statusNId'), type: 'string' }
                ];
            }
        }

        /// Manage uncheck of check boxes when an entity picker value is cleared
        $scope.$on('sit-entity-picker.input-blanked', function () {
            if (self.workOrderEntityPickerConfig.entityValue === '') {
                self.workOrderCheckboxConfig.value = false;
            }

            if (self.equipmentEntityPickerConfig.entityValue === '') {
                self.equipmentCheckboxConfig.value = false;
            }

        });

        // ==============================================================================
        //                          Selects
        // ==============================================================================

        // WorkOrderTypes

        // IR 10120359 : The following function has been replaced for this IR. The replaced function has been provided with FF in 3.1 and reported here in 4.3

        //function getWorkOrderTypes() {
        //    var options = '$expand=Facets($filter=isof(\'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended\'))';
        //    var queryModel = { appName: 'PICore', entityName: 'WorkOrder', options: options };
        //    return backendService.findAll(queryModel).catch(backendService.backendError).then(getDistinct);

        //    function getDistinct(data) {
        //        var workOrders = data.value;
        //        var result = [{ workOrderType: '' }];
        //        for (var i = 0; i < workOrders.length; i++) {
        //            var alreadyExist = false;
        //            var newType = isNullOrEmpty(workOrders[i].Facets[0].Type) ? '' : workOrders[i].Facets[0].Type;
        //            for (var j = 0; j < result.length; j++) {
        //                if (newType === result[j].workOrderType) {
        //                    alreadyExist = true;
        //                    break;
        //                }
        //            }
        //            // Add a new type in the list
        //            if (!alreadyExist) {
        //                result[result.length] = {
        //                    workOrderType: newType
        //                };
        //            }
        //        }
        //        // Returns the list of distinct WorkOrderTypes ordered ascending;
        //        return {
        //            value: result.sort(function (a, b) {
        //                return a.workOrderType.localeCompare(b.workOrderType);
        //            })
        //        };
        //    }
        //}

        function getWorkOrderTypes() {
            var options = "$apply=groupby((Type))&$filter=Type ne null and Type ne ''&$orderby=Type";
            var queryModel = { appName: 'PICore', entityName: 'WorkOrderExtended', options: options };
            return backendService.findAll(queryModel).catch(backendService.backendError).then(getDistinct);
            function getDistinct(data) {
                var result = [{ workOrderType: '' }];
                for (var i = 0; i < data.value.length; i++) {
                    result[result.length] = {
                        workOrderType: data.value[i].Type
                    };
                }
                return {
                    value: result
                };
            }
        }

        function initWorkOrderTypeSelectOptions() {
            getWorkOrderTypes().then(function (data) {
                if (data && data.value) {
                    // Populate the list with all possible WorkOrderType values
                    self.workOrderTypeConfig.options = data.value;
                    // Restore the value that was saved in the produciton context
                    if (self.workOrderTypeValueToBeRestored !== null) {
                        self.workOrderTypeConfig.value = self.workOrderTypeValueToBeRestored;
                    }
                }
            }, backendService.backendError);
        }

        // ==============================================================================
        //                          Check Boxes
        // ==============================================================================

        // WorkOrders
        function initWorkOrderCheckboxConfig() {
            self.workOrderCheckboxConfig = {
                id: 'cbWorkOrder',
                value: false
            };
        }

        // Equipments
        function initEquipmentCheckboxConfig() {
            self.equipmentCheckboxConfig = {
                id: 'cbEquipment',
                value: false
            };
        }
    }
})();
