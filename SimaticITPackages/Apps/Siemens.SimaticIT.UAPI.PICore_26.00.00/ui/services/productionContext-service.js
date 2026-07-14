/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('uapi-productionContextService', productionContextService);

    productionContextService.$inject = ['common.base', 'common.services.runtime.commandModel', '$q', 'common.services.ui.authentication', 'common.services.swac.SwacUiModuleManager', '$translate'];

    function productionContextService(commonBase, CommandModel, $q, authenticationService, swacManager, $translate) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;
        self._entityName = 'ProductionContext';
        self._appName = 'PICore';
        self._commands = {
            setProductionContext: 'SetProductionContext'
        };
        var service = {
            setProductionContext: setProductionContext,
            getProductionContext: getProductionContext,
            injectParametersInProductionContext: injectParametersInProductionContext,
            removeParametersFromProductionContext: removeParametersFromProductionContext,
            isTaskMatchProductionContext: isTaskMatchProductionContext,
            updateApolloHeader: updateApolloHeader,
            getProductionParameters: getProductionParameters,
            setProductionParameters: setProductionParameters
        };
        self._productionParameters = {};

        activate();

        return service;

        function activate() {
        }

        function executeCommand(commandName, commandParameters) {
            var commandModel = {};
            commandModel.appName = self._appName;
            commandModel.commandName = commandName;
            commandModel.params = commandParameters;
            return self._backendService.invoke(commandModel).catch(self._backendService.backendError);
        }

        function getAll(options) {
            var queryModel = {};
            queryModel.appName = self._appName;
            queryModel.entityName = self._entityName;
            queryModel.options = options;
            return self._backendService.findAll(queryModel).catch(self._backendService.backendError);
        }

        function getProductionContext() {
            return getAll(
                '$filter=' +
                'Module eq \'Siemens.SimaticIT.UAPI.PICore.OperatorTask\' and ' +
                'Element eq \'piOperatorTaskListController\' and ' +
                'Screen eq \'Siemens_SimaticIT_UAPI_PICore_WorkOrderTask_OperatorTaskList\' and ' +
                'Application eq \'' + self._appName + '\' and ' +
                'UserName eq \'' + authenticationService.getIndentity().unique_name + '\'' +
                '&$expand=ProductionContextFields');
        }

        function setProductionContext(data) {

            var obj = {
                'Module': 'Siemens.SimaticIT.UAPI.PICore.OperatorTask',
                'Element': 'piOperatorTaskListController',
                'Screen': 'Siemens_SimaticIT_UAPI_PICore_WorkOrderTask_OperatorTaskList',
                'Application': self._appName,
                'UserName': authenticationService.getIndentity().unique_name,
                'ProductionContextFields': data
            };

            return executeCommand(self._commands.setProductionContext, obj);
        }

        function setProductionParameters(productionContext, parentParameters) {
            self._productionParameters = {};
            self._productionParameters.WorkOrderNId = parentParameters.WorkOrderNId;
            self._productionParameters.WorkOrderOperationNId = parentParameters.WorkOrderOperationNId;
            for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                // Should we replace an existing value ?
                var prodContextField = productionContext.ProductionContextFields[i];
                if (prodContextField.NId === 'WorkOrderNId') {
                    self._productionParameters.prodContextField = {};
                    self._productionParameters.prodContextField[prodContextField.NId] = prodContextField.FieldValue;
                    //self._productionParameters.prodContextField.FieldValue = value;
                    //self._productionParameters.prodContextField.IsOverriden = true;
                }
            }
        }

        function getProductionParameters() {
            return self._productionParameters;
        }

        function updateApolloHeader() {
            getProductionContext().then(function (data) {
                var prdCtx = [];
                if (data.value.length !== 0) {
                    prdCtx = data.value[0].ProductionContextFields;
                }
                // Update the header
                swacManager.contextServicePromise.promise.then(function (contextSvc) {
                    var propList = [];
                    prdCtx.forEach(function (item) {
                        if (item.FieldValue != null && item.FieldValue != "") {
                            switch (item.NId) {
                                case 'WorkOrderNId':
                                    propList.push({
                                        "isNull": false,
                                        "propertyDisplayName": $translate.instant('picore.headers.apollo.WorkOrderNId'),
                                        "uiValue": item.FieldValue
                                    });
                                    break;
                                case 'WorkOrderType':
                                    propList.push({
                                        "isNull": false,
                                        "propertyDisplayName": $translate.instant('picore.headers.apollo.WorkOrderType'),
                                        "uiValue": item.FieldValue
                                    });
                                    break;
                                case 'EquipmentNId':
                                    propList.push({
                                        "isNull": false,
                                        "propertyDisplayName": $translate.instant('picore.headers.apollo.EquipmentNId'),
                                        "uiValue": item.FieldValue
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                    if (propList.length === 0)
                        propList.push({
                            "isNull": false,
                            "propertyDisplayName": $translate.instant('picore.headers.apollo.Context'),
                            "uiValue": $translate.instant('picore.headers.apollo.ContextNotDefined')
                        });

                    contextSvc.updateCtx('momHeaderProperties', propList.sort(compare));

                    function compare(a, b) {
                        const propA = a.propertyDisplayName.toUpperCase();
                        const propB = b.propertyDisplayName.toUpperCase();

                        let comparison = 0;
                        if (propA > propB) {
                            comparison = 1;
                        } else if (propA < propB) {
                            comparison = -1;
                        }
                        return comparison;
                    }
                });
            });
        }

        // External parameters take control over the Production Context when the OTL is called from another screen
        function injectParametersInProductionContext(productionContext, parentParameters) {

            if (!isNullOrEmpty(parentParameters.WorkOrderNId)) {
                replaceProductionContextParameter(productionContext, 'WorkOrderNId', parentParameters.WorkOrderNId);
                replaceProductionContextParameter(productionContext, 'showTaskWithoutWorkOrderNId', 'false');
                removeFromProductionContext(productionContext, 'WorkOrderType');
            }
            if (!isNullOrEmpty(parentParameters.WorkOrderOperationNId)) {
                replaceProductionContextParameter(productionContext, 'WorkOrderOperationNId', parentParameters.WorkOrderOperationNId);
            }
            if (!isNullOrEmpty(parentParameters.EquipmentNId)) {
                replaceProductionContextParameter(productionContext, 'EquipmentNId', parentParameters.EquipmentNId);
                replaceProductionContextParameter(productionContext, 'showTaskWithoutEquipmentNId', 'false');
            }
        }

        // Add or update a parameter context value
        function replaceProductionContextParameter(productionContext, id, value) {
            var found = false;
            for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                // Should we replace an existing value ?
                var prodContextField = productionContext.ProductionContextFields[i];
                if (prodContextField.NId === id) {
                    prodContextField.FieldValue = value;
                    prodContextField.IsOverriden = true;
                    found = true;
                }
            }
            if (!found) {
                // Add a new filter pair in the list
                productionContext.ProductionContextFields[productionContext.ProductionContextFields.length] = {
                    NId: id,
                    FieldValue: value,
                    IsOverriden: true
                };
            }
        }

        // Remove an element from the Production Context
        function removeFromProductionContext(productionContext, parameterId) {
            var pcf = productionContext.ProductionContextFields.filter(function (element, index, arr) {
                return element.NId !== parameterId;
            });
            productionContext.ProductionContextFields = pcf;
        }

        // Remove an External parameters from the Production Context when a tag was clicked
        function removeParametersFromProductionContext(tag, parentParameters) {
            if (tag.NId === 'WorkOrderNId') {
                parentParameters.WorkOrderNId = '';
                parentParameters.WorkOrderOperationNId = '';
            }
            if (tag.NId === 'WorkOrderOperationNId') {
                parentParameters.WorkOrderOperationNId = '';
            }
            if (tag.NId === 'EquipmentNId') {
                parentParameters.EquipmentNId = '';
            }
        }

        // Check that a task match the production context
        function isTaskMatchProductionContext(data, productionContext, equipments) {
            // If no production context defined, all tasks are displayed
            if (productionContext.ProductionContextFields.length == 0) {
                return true;
            }

            var workOrderNIdFromPC, workOrderOperationNIdFromPC, showTaskWithoutWorkOrderFromPC, workOrderTypeFromPC = null;
            var equipmentNIdFromPC, showTaskWithoutEquipmentFromPC = null;
            // Get Production Context field values
            for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                if (productionContext.ProductionContextFields[i].NId === 'WorkOrderNId') {
                    workOrderNIdFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
                if (productionContext.ProductionContextFields[i].NId === 'WorkOrderOperationNId') {
                    workOrderOperationNIdFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
                if (productionContext.ProductionContextFields[i].NId === 'showTaskWithoutWorkOrderNId') {
                    showTaskWithoutWorkOrderFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
                if (productionContext.ProductionContextFields[i].NId === 'EquipmentNId') {
                    equipmentNIdFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
                if (productionContext.ProductionContextFields[i].NId === 'showTaskWithoutEquipmentNId') {
                    showTaskWithoutEquipmentFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
                if (productionContext.ProductionContextFields[i].NId === 'WorkOrderType') {
                    workOrderTypeFromPC = productionContext.ProductionContextFields[i].FieldValue;
                }
            }

            // check showTaskWithoutWorkOrderFromPC
            if (showTaskWithoutWorkOrderFromPC && workOrderNIdFromPC) {
                if (showTaskWithoutWorkOrderFromPC == 'false' && data.WorkOrderNId == null) {
                    return false;
                }

                if (showTaskWithoutWorkOrderFromPC == 'false' || data.WorkOrderNId !== null) {
                    if (workOrderOperationNIdFromPC) {
                        // both WorkOrder and WorkOrderOperation should be correct
                        if ((workOrderNIdFromPC !== data.WorkOrderNId) || (workOrderOperationNIdFromPC !== data.WorkOrderOperationNId)) {
                            return false;
                        }
                    }
                    else {
                        // only WorkOrder should be correct
                        if (workOrderNIdFromPC !== data.WorkOrderNId) {
                            return false;
                        }
                    }
                }
            }

            // check showTaskWithoutEquipmentFromPC
            if (showTaskWithoutEquipmentFromPC && equipmentNIdFromPC) {
                if (showTaskWithoutEquipmentFromPC == 'false' && data.EquipmentNId == null) {
                    return false;
                }

                if (showTaskWithoutEquipmentFromPC == 'false' || data.EquipmentNId !== null) {
                    // Look into the list of equipments
                    const validateFromEquipments = [];
                    for (var equipment = 0; equipment < equipments.length; equipment++) {
                        validateFromEquipments.push(equipments[equipment].toLowerCase());
                    }

                    if (validateFromEquipments.indexOf(data.EquipmentNId.toLowerCase()) < 0) {
                        return false;
                    }

                }
            }

            // check WorkOrder Type
            if (workOrderTypeFromPC) {
                if (workOrderTypeFromPC.toLowerCase() !== data.WorkOrderType.toLowerCase()) {
                    return false;
                }
            }

            return true;
        }

        function isNullOrEmpty(variable) {
            if (variable !== undefined && variable !== null && variable !== '') { return false; }
            return true;
        }
    }
})();
