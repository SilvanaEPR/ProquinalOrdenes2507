(function () {
    'use strict';

    function AddMaterialSpecificationFromBoMController($q, $timeout, $translate, $state, $stateParams, $rootScope, $scope, common, modelDrivenService) {
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
            const internalFilter = "MaterialNId eq '" + $stateParams.selectedItem.WorkMaster.MaterialNId + "'";
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

        function buildMaterialSpecifications() {
            const array = [];
            for (const idx in self.gridBomItemSelectedItems) {
                const item = self.gridBomItemSelectedItems[idx];
                const obj = {
                    BoMNId: self.entityPikerBoM.value.NId,
                    BoMRevision: self.entityPikerBoM.value.Revision,
                    BoMItemNId: item.NId,
                    Quantity: null,
                    Sequence: item.Sequence,
                    FixedQuantity: self.fixedQuantity[0].checked,
                    Usage: self.usage ? self.usage.NId : '',
                    Direction: self.direction ? self.direction.NId : '',
                    SpecificationTag: self.specificationTag
                };
                array.push(obj);
            }
            return array;
        }

        function addMaterialsFromBoM() {
            console.log('PICore_AddMaterialSpecificationFromBoMController.addMaterialsFromBoM');

            const obj = {
                WorkMasterOperationId: $stateParams.selectedItem.Id,
                MaterialSpecifications: buildMaterialSpecifications()
            };

            executeCommand('PICore', 'AddMaterialSpecificationsToWorkMasterOperationFromBoM', obj).then(function (data) {
                sidePanelManager.close();
                if (typeof self.onActionComplete === 'function') {
                    // callback function received from model-driven runtime to be called on action complete
                    self.onActionComplete(data.data.MaterialSpecificationIds[0]);
                }
            }, common.services.runtime.backendService.backendError);
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
        }

        function initSidePanel() {
            console.log('PICore_AddMaterialSpecificationFromBoMController.initSidePanel');
            const cancel = {
                label: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Cancel'),
                onClick: closeSidePanel,
                enabled: true,
                visible: true
            };
            const save = {
                label: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Save'),
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
            console.log('PICore_AddMaterialSpecificationFromBoMController.init');
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
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Name')
                            },
                            {
                                field: 'Revision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Revision')
                            },
                            {
                                field: 'IsCurrent', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.IsCurrent'), showCheckbox: true, dataType: 'boolean'
                            },
                            {
                                field: 'MaterialNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialNId')
                            },
                            {
                                field: 'MaterialName', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialName')
                            },
                            {
                                field: 'MaterialRevision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialRevision')
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
                                field: 'NId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Id')
                            },
                            {
                                field: 'Name', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Name')
                            },
                            {
                                field: 'Revision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Revision')
                            },
                            {
                                field: 'IsCurrent', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.IsCurrent'), showCheckbox: true, dataType: 'boolean'
                            },
                            {
                                field: 'MaterialNId', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialNId')
                            },
                            {
                                field: 'MaterialName', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialName')
                            },
                            {
                                field: 'MaterialRevision', displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialRevision')
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
                "sit-placeholder": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.SelectaBoM'),
                "sit-title": $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.SelectaBoM'),
                "sit-change": function (oldValue, newValue) {
                    self.gridBoMItemData = [];
                    $timeout(function () {
                        if (self.entityPikerBoM.value !== undefined && self.entityPikerBoM.value !== null) {
                            executeReadingFunction('UDM', 'RF_GetBoMItemsAndMaterialInfos', { BoM_id: self.entityPikerBoM.value.Id, BoM_Item_id: null }).then(function (data) {
                                self.gridBoMItemData = data.value;
                            });
                        }
                    }, 200);
                }
            };

            const billOfMaterialsNId = $stateParams.selectedItem.WorkMaster.BillOfMaterialsNId;
            let optionString = '$orderby=LastUpdatedOn desc';
            if (billOfMaterialsNId !== null && billOfMaterialsNId !== undefined && billOfMaterialsNId !== '') {
                optionString = optionString + "&$filter=NId eq '" + billOfMaterialsNId + "' and Revision eq '" + $stateParams.selectedItem.WorkMaster.BillOfMaterialsRevision + "'";
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
                        displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.Sequence'),
                        resizable: false,
                        width: 100
                    },
                    {
                        field: 'MaterialName',
                        displayName: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.MaterialName'),
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

            //init fixedQuantity
            self.fixedQuantity = [{
                label: $translate.instant('Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration.FixedQuantity'),
                checked: false
            }];

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

            self.specificationTag = null;

            initSidePanel();
        }

        function activate() {
            console.log('PICore_AddMaterialSpecificationFromBoMController.activate');

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
        controller('PICore_AddMaterialSpecificationFromBoMController', AddMaterialSpecificationFromBoMController).
        config([
            '$stateProvider',
            function ($stateProvider) {

                const rootstate = 'home.Siemens_SimaticIT_UAPI_PICore_WorkMasterConfiguration_WorkMasterOperationContent.AddFromBoM';
                const folder = 'Siemens.SimaticIT.UAPI.PICore/blueprints/MaterialFromBoM';

                const item = {
                    name: rootstate + '.add',
                    url: '/add',
                    views: {
                        'property-area-container@': {
                            templateUrl: folder + '/MaterialSpecificationFromBoM-add.html',
                            controller: 'PICore_AddMaterialSpecificationFromBoMController',
                            controllerAs: 'vm'
                        }
                    }
                };

                $stateProvider.state(item);
            }]);

    AddMaterialSpecificationFromBoMController.$inject = ['$q', '$timeout', '$translate', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.modelDriven.runtimeService'];
}());