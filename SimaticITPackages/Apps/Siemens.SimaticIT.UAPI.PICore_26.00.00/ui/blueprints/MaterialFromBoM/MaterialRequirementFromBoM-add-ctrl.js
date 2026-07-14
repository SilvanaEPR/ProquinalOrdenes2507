(function () {
    'use strict';

    function AddMaterialRequirementFromBoMController($q, $timeout, $translate, $state, $stateParams, $rootScope, $scope, common, modelDrivenService) {
        const self = this;
        let sidePanelManager;

        self.onActionComplete = null;

        function executeReadingFunction(appName, functionName, params, options) {
            const deferred = $q.defer();

            const object = {
                "appName": appName,
                "functionName": functionName,
                "params": params,
                "options": options
            };

            common.services.runtime.backendService.read(object).then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function getAllBillOfMaterials(optionString) {
            const internalFilter = "MaterialNId eq '" + $stateParams.selectedItem.WorkOrder.MaterialNId + "'";
            if (optionString === null || optionString === undefined || optionString === '') {
                // Called without clauses (filter, sorting, etc.)
                // For example to set the first bom of work order material in entity picker text box
                optionString = "$filter=" + internalFilter;
            } else if (optionString.includes("$filter=")) {
                // Called with a filter already set
                // For example when I set a filter in a search box of entity picker.
                optionString = optionString.replace("$filter=", "$filter=" + internalFilter + " and ");
            } else {
                // Called without a filter but with other clauses
                // For example when I open the entity picker.
                optionString = optionString + "&$filter=" + internalFilter;
            }
            optionString = optionString + "&$count=true";

            return executeReadingFunction('UDM', 'RF_GetBoMAndMaterialInfos', { Id: null }, optionString);
        }

        function executeODataQuery(appName, entityName, options) {
            return common.services.runtime.backendService.findAll({ appName: appName, entityName: entityName, options: options });
        }

        self.getAll = function (dataEntity, optionString) {
            if (dataEntity === 'BillOfMaterials') {
                return getAllBillOfMaterials(optionString);
            }

            const deferred = $q.defer();
            executeODataQuery('PICore', dataEntity, optionString).then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        function executeCommand(appName, commandName, params) {
            //logger.logDebug('Executing command: ', commandName);
            return common.services.runtime.backendService.invoke({ appName: appName, commandName: commandName, params: params });
        }

        function buildMaterialRequirements() {
            const array = [];
            for (const idx in self.gridBomItemSelectedItems) {
                const item = self.gridBomItemSelectedItems[idx];
                const obj = {
                    MaterialNId: item.MaterialNId,
                    MaterialRevision: item.MaterialRevision,
                    Quantity: null,
                    Sequence: item.Sequence,
                    BoMItemNId: item.NId,
                    BoMNId: self.entityPikerBoM.value.NId,
                    BoMRevision: self.entityPikerBoM.value.Revision,
                    Usage: self.usage ? self.usage.NId : '',
                    Direction: self.direction ? self.direction.NId : '',
                    EquipmentNId: self.entityPikerEquipment.value ? self.entityPikerEquipment.value.NId : '',
                    EquipmentGraphNId: self.entityPikerEquipmentFlow.value ? self.entityPikerEquipmentFlow.value.NId : '',
                    RequirementTag: self.requirementTag
                };
                array.push(obj);
            }
            return array;
        }

        function addMaterialsFromBoM() {
            console.log('PICore_AddMaterialRequirementFromBoMController.addMaterialsFromBoM');

            const obj = {
                WorkOrderOperationId: $stateParams.selectedItem.Id,
                WorkOrderOperationMaterialRequirements: buildMaterialRequirements()
            };

            executeCommand('PICore', 'AddWorkOrderOperationMaterialRequirementsToWorkOrderOperation', obj).then(function (data) {
                sidePanelManager.close();
                if (typeof self.onActionComplete === 'function') {
                    // callback function received from model-driven runtime to be called on action complete
                    self.onActionComplete(data.data.WorkOrderOperationMaterialRequirementIds[0]);
                }
            }, common.services.runtime.backendService.backendError);
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
        }

        function initSidePanel() {
            console.log('PICore_AddMaterialRequirementFromBoMController.initSidePanel');
            const cancel = {
                label: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Cancel'),
                onClick: closeSidePanel,
                enabled: true,
                visible: true
            };
            const save = {
                label: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Save'),
                onClick: addMaterialsFromBoM,
                enabled: false,
                visible: true
            };
            self.sidePanelConfig = {
                actionButtons: [
                    save,
                    cancel
                ],
                closeButton: {
                    showClose: true,
                    onClick: closeSidePanel
                }
            };
        }

        function init() {
            console.log('PICore_AddMaterialRequirementFromBoMController.init');
            sidePanelManager = common.services.sidePanel.service;

            self.gridBoMItemData = [];

            //entity picker configuration for BoM
            self.entityPikerBoM = {
                "sit-id": "billOfMaterials",
                "sit-datasource": function (searchString) {
                    const filterString = "$filter=contains(NId, '" + searchString + "')";
                    return self.getAll('BillOfMaterials', filterString).then(function (data) {
                        return data.value;
                    });
                },
                "sit-selected-attribute-to-display": "NId",
                "sit-editable": false,
                "sit-picker-options": {
                    gridConfig: {
                        columnDefs: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Revision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Revision')
                            },
                            {
                                field: 'IsCurrent', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.IsCurrent'), showCheckbox: true, dataType: 'boolean'
                            },
                            {
                                field: 'MaterialNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialNId')
                            },
                            {
                                field: 'MaterialName', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialName')
                            },
                            {
                                field: 'MaterialRevision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialRevision')
                            }
                        ]
                    },
                    quickSearchOptions: {
                        enabled: true,
                        field: 'NId'
                    },
                    sortInfo: {
                        field: 'NId',
                        direction: 'asc',
                        fields: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Revision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Revision')
                            },
                            {
                                field: 'IsCurrent', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.IsCurrent'), showCheckbox: true, dataType: 'boolean'
                            },
                            {
                                field: 'MaterialNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialNId')
                            },
                            {
                                field: 'MaterialName', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialName')
                            },
                            {
                                field: 'MaterialRevision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialRevision')
                            }
                        ]
                    },
                    pagingOptions: {
                        pageSize: 10
                    },
                    enablePaging: false,
                    selectStyle: 'alternate',
                    selectionMode: 'single',
                    viewMode: 'g',//g: Shows data in a grid.
                    viewOptions: 'g',//UI elements to be shown in the viewbar
                    serverDataOptions: {
                        dataService: self,
                        dataEntity: 'BillOfMaterials'
                    }
                },
                "sit-placeholder": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectaBoM'),
                "sit-title": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectaBoM'),
                "sit-change": function (oldValue, newValue) {
                    self.gridBoMItemData = [];
                    $timeout(function () {
                        if (self.entityPikerBoM.value !== undefined && self.entityPikerBoM.value !== null) {
                            executeReadingFunction('UDM', 'RF_GetBoMItemsAndMaterialInfos', { BoM_id: self.entityPikerBoM.value.Id, BoM_Item_id: null }, '$filter=MaterialGroupNId eq null').then(function (data) {
                                self.gridBoMItemData = data.value;
                            });
                        }
                    }, 200);
                }
            };

            const billOfMaterialsNId = $stateParams.selectedItem.WorkOrder.BillOfMaterialsNId;
            let optionString = '$orderby=LastUpdatedOn desc';
            if (billOfMaterialsNId !== null && billOfMaterialsNId !== undefined && billOfMaterialsNId !== '') {
                optionString = optionString + "&$filter=NId eq '" + billOfMaterialsNId + "' and Revision eq '" + $stateParams.selectedItem.WorkOrder.BillOfMaterialsRevision + "'";
            }

            self.getAll('BillOfMaterials', optionString).then(function (data) {
                self.entityPikerBoM.value = data.value[0];
            });

            //grid options for bom items
            self.gridBoMItemOptions = {
                containerID: 'myGridContainer',
                uniqueID: 'title',
                columnDefs: [
                    {
                        field: 'Sequence',
                        displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Sequence'),
                        resizable: false,
                        width: 100
                    },
                    {
                        field: 'MaterialName',
                        displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.MaterialName'),
                        resizable: false
                    }
                ],
                height: 300,
                showSelectionCheckbox: true,
                tagField: '',
                groups: [],
                onPageChangedCallback: function (page) {
                    //code goes here
                },
                onSelectionChangeCallback: function (selectedItems) {
                    self.gridBomItemSelectedItems = selectedItems;
                    self.sidePanelConfig.actionButtons[0].enabled = selectedItems.length > 0;
                },
                selectionMode: 'multi',
                sortInfo: {
                    fields: ['Sequence'],
                    directions: ['asc']
                },
                enablePaging: false,
                alwaysShowPager: false
            };

            self.gridBomItemSelectedItems = [];

            //init usage
            self.usage = null;
            self.usageOptions = [];
            executeODataQuery('PICore', 'OperationMaterialSpecificationUsage').then(function (data) {
                self.usageOptions = data.value;
                self.usageOptions.unshift({ Id: null, NId: '' });
            });

            //init direction
            self.direction = null;
            self.directionOptions = [];
            executeODataQuery('PICore', 'OperationMaterialSpecificationDirection').then(function (data) {
                self.directionOptions = data.value;
                self.directionOptions.unshift({ Id: null, NId: '' });
            });

            //entity picker configuration for Equipment
            self.entityPikerEquipment = {
                "sit-id": "equipment",
                "sit-datasource": function (searchString) {
                    const filterString = "$filter=contains(NId, '" + searchString + "')";
                    return executeODataQuery('PICore', 'Equipment', filterString).then(function (data) {
                        return data.value;
                    });
                },
                "sit-selected-attribute-to-display": "NId",
                "sit-editable": false,
                "sit-picker-options": {
                    gridConfig: {
                        columnDefs: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Description', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Description')
                            },
                            {
                                field: 'LevelNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.LevelNId')
                            },
                            {
                                field: 'StatusNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.StatusNId')
                            }
                        ]
                    },
                    quickSearchOptions: {
                        enabled: true,
                        field: 'NId'
                    },
                    sortInfo: {
                        field: 'NId',
                        direction: 'asc',
                        fields: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Description', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Description')
                            },
                            {
                                field: 'LevelNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.LevelNId')
                            },
                            {
                                field: 'StatusNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.StatusNId')
                            }
                        ]
                    },
                    pagingOptions: {
                        pageSize: 10
                    },
                    enablePaging: false,
                    selectStyle: 'alternate',
                    selectionMode: 'single',
                    viewMode: 'g',//g: Shows data in a grid.
                    viewOptions: 'g',//UI elements to be shown in the viewbar
                    serverDataOptions: {
                        dataService: self,
                        dataEntity: 'Equipment',
                        optionsString: "$count=true"
                    }
                },
                "sit-placeholder": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectanEquipment'),
                "sit-title": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectanEquipment')
            };

            //entity picker configuration for Equipment Flow
            self.entityPikerEquipmentFlow = {
                "sit-id": "equipmentFlow",
                "sit-datasource": function (searchString) {
                    const filterString = "$expand=Type&$filter=Type/NId eq 'Flow' and contains(NId, '" + searchString + "')&$count=true";
                    return executeODataQuery('PICore', 'EquipmentGraphConfiguration', filterString).then(function (data) {
                        return data.value;
                    });
                },
                "sit-selected-attribute-to-display": "NId",
                "sit-editable": false,
                "sit-picker-options": {
                    gridConfig: {
                        columnDefs: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Description', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Description')
                            }
                        ]
                    },
                    quickSearchOptions: {
                        enabled: true,
                        field: 'NId'
                    },
                    sortInfo: {
                        field: 'NId',
                        direction: 'asc',
                        fields: [
                            {
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Name')
                            },
                            {
                                field: 'Description', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.Description')
                            }
                        ]
                    },
                    pagingOptions: {
                        pageSize: 10
                    },
                    enablePaging: false,
                    selectStyle: 'alternate',
                    selectionMode: 'single',
                    viewMode: 'g',//g: Shows data in a grid.
                    viewOptions: 'g',//UI elements to be shown in the viewbar
                    serverDataOptions: {
                        dataService: self,
                        dataEntity: 'EquipmentGraphConfiguration',
                        optionsString: "$expand=Type&$filter=Type/NId eq 'Flow'&$count=true"
                    }
                },
                "sit-placeholder": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectanEquipmentFlow'),
                "sit-title": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration.SelectanEquipmentFlow')
            };

            self.requirementTag = null;

            initSidePanel();
        }

        function activate() {
            console.log('PICore_AddMaterialRequirementFromBoMController.activate');

            const initCustomActionCallbackFunction = modelDrivenService.initCustomAction(); //gets the callback function
            self.onActionComplete = initCustomActionCallbackFunction && initCustomActionCallbackFunction.onExit ? initCustomActionCallbackFunction.onExit : null;

            init();

            // Show
            sidePanelManager.open({ mode: 'e', size: 'small' });
        }

        activate();
    }

    angular.
        module('Siemens.SimaticIT.UAPI.PICore').
        controller('PICore_AddMaterialRequirementFromBoMController', AddMaterialRequirementFromBoMController).
        config([
            '$stateProvider',
            function ($stateProvider) {

                const rootstate = 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderConfiguration_WorkOrderOperationContent.AddFromBoM';
                const folder = 'Siemens.SimaticIT.UAPI.PICore/blueprints/MaterialFromBoM';

                const item = {
                    name: rootstate + '.add',
                    url: '/add',
                    views: {
                        'property-area-container@': {
                            templateUrl: folder + '/MaterialRequirementFromBoM-add.html',
                            controller: 'PICore_AddMaterialRequirementFromBoMController',
                            controllerAs: 'vm'
                        }
                    }
                };

                $stateProvider.state(item);
            }]);

    AddMaterialRequirementFromBoMController.$inject = ['$q', '$timeout', '$translate', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.modelDriven.runtimeService'];
}());