/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.WorkOrderConstants', WorkOrderConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.WorkOrderService', WorkOrderService);

    function WorkOrderConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'WorkOrderExtended'
            }
        };
    }

    WorkOrderService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name WorkOrderService
     *
     * @requires $rootElement
     *
     * @description
     * The WorkOrderService service expose methods to manage WorkOrder entity and related objects relevant for Process Industries.
     */
    function WorkOrderService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.WorkOrderService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getByNId = getByNId;
            vm.getById = getById;
            vm.getWorkorder = getWorkorder;
            vm.getWorkorderById = getWorkorderById;
            vm.createWorkOrder = createWorkOrder;
            vm.updateWorkOrder = updateWorkOrder;
            vm.updateWorkOrderV2 = updateWorkOrderV2;
            vm.copyWorkOrder = copyWorkOrder;
            vm.updateWorkOrderStatus = updateWorkOrderStatus;
            vm.deleteWorkOrder = deleteWorkOrder;
            vm.freezeWorkOrder = freezeWorkOrder;
            vm.unfreezeWorkOrder = unfreezeWorkOrder;
            vm.changeWooPSequence = changeWooPSequence;
            vm.addWorkOrderOperationByOperation = addWorkOrderOperationByOperation;
            vm.updateMaterialRequirementMTUV2 = updateMaterialRequirementMTUV2;
            vm.addMtuToMaterialRequirementV2 = addMtuToMaterialRequirementV2;
            vm.deleteMtuFromMaterialRequirement = deleteMtuFromMaterialRequirement;
            vm.getWorkOrderNumberingPattern = getWorkOrderNumberingPattern;
            vm.updateWorkOrderOperationStatus = updateWorkOrderOperationStatus;
            vm.getByIdExpandCompositions = getByIdExpandCompositions;
            vm.getByIdExpandParameterSpecification = getByIdExpandParameterSpecification;
            vm.getWorkOrderOperationById = getWorkOrderOperationById;
            vm.getWorkOrderMaterial = getWorkOrderMaterial;
            vm.getWorkOrderTemplates = getWorkOrderTemplates;
            vm.getWorkOrderIdByOperation = getWorkOrderIdByOperation;
            vm.addWorkOrderOperationByOperationV2 = addWorkOrderOperationByOperationV2;
            vm.addActualMtuToMaterialRequirement = addActualMtuToMaterialRequirement;
            vm.updateActualMaterialRequirementMTU = updateActualMaterialRequirementMTU;
            vm.deleteActualMtuFromMaterialRequirement = deleteActualMtuFromMaterialRequirement;
            vm.getWorkOrderMaterialDetails = getWorkOrderMaterialDetails;
            vm.getOrderMaterialDetails = getOrderMaterialDetails;

            vm.getWorkOrderDetails = getWorkOrderDetails;
            vm.getParameterSpecification = getParameterSpecification;
            vm.getMaterialRequirement = getMaterialRequirement;
            vm.getEquipmentRequirement = getEquipmentRequirement;
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of WorkOrder.
         * @param {object} options the object that contains the conditions to query WorkOrder.
         * @returns {object} the list of WorkOrder.
         */
        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name getByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkOrderExtended.
         * @param {string} nid the natural identifier of the required WorkOrder.
         * @returns {object} the WorkOrderExtended information.
         */
        function getByNId(nid) {
            var options = '$filter=WorkOrder_Id eq ' + nid;
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getByIdExpandCompositions
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkMaster, including the Operation Parameter Specification and the Operation Material Specifications.
         * @param {string} id the identifier of the required WorkMaster.
         * @returns {object} the WorkMaster information.
         */
        function getByIdExpandCompositions(id) {
            var options = '$filter=Id eq ' + id +
            '&$expand=Facets($select=Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/WorkMasterNId,' +
            'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/WorkMasterRevision,' +
            'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/PlannedStartTime,' +
            'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/PlannedEndTime,' +
            'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/ActualStartTime,' +
            'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderExtended/ActualEndTime),' +
            'WorkOrderOperations($expand=WorkOrderOperationMaterialRequirements)';
            return getWorkorder(options);
        }

        /**
         * @ngdoc function
         * @name getWorkorderById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkOrder.
         * @param {string} id the identifier of the required WorkOrder.
         * @returns {object} the WorkOrder information.
         */
        function getWorkorderById(id) {
            var options = '$filter=Id eq ' + id;
            return getWorkorder(options);
        }

        /**
        * @ngdoc function
        * @name getWorkorder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific WorkOrder.
        * @param {string} options the query optionsString.
        * @returns {object} the WorkOrder information.
        */
        function getWorkorder(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrder',
                'options': options
            });
        }

        function getWorkOrderDetails(id) {
            return getByIdExpandCompositions(id);
        }

        /**
        * @ngdoc function
        * @name getByIdExpandParameterSpecification
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific WorkMaster, including the Operation Parameter Specification and the Operation Material Specifications.
        * @param {string} id the identifier of the required WorkMaster.
        * @returns {object} the WorkMaster information.
        */
        function getByIdExpandParameterSpecification(id) {
            var options = '$filter=WorkOrderOperation/WorkOrder_Id eq ' + id + '&$expand=WorkOrderOperation';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationParameterSpecification',
                'options': options
            });
        }

        function getParameterSpecification(id) {
            var options = '$top=1&$filter=WorkOrderOperation/WorkOrder_Id eq ' + id + '&$select=IsDeleted&$expand=WorkOrderOperation($select=IsDeleted)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationParameterSpecification',
                'options': options
            });
        }

        function getMaterialRequirement(id) {
            var options = '$top=1&$filter=WorkOrderOperation/WorkOrder_Id eq ' + id + '&$select=IsDeleted&$expand=WorkOrderOperation($select=IsDeleted)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationMaterialRequirement',
                'options': options
            });
        }

        function getEquipmentRequirement(id) {
            var options = '$top=1&$filter=WorkOrderOperation/WorkOrder_Id eq ' + id + '&$select=IsDeleted&$expand=WorkOrderOperation($select=IsDeleted)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationEquipmentRequirement',
                'options': options
            });
        }

        /**
        * @ngdoc function
        * @name getById
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific WorkOrderExtended.
        * @param {string} id the identifier of the required WorkOrder.
        * @returns {object} the WorkOrderExtended information.
        */
        function getById(id) {
            var options = '$filter=WorkOrder_Id eq ' + id;
            return getAll(options);
        }

        /**
        * @ngdoc function
        * @name getWorkOrderOperationById
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific WorkOrderOperationExtended.
        * @param {string} id the identifier of the required WorkOrderOperation.
        * @returns {object} the WorkOrderOperationExtended information.
        */
        function getWorkOrderOperationById(id) {
            var options = '$filter=WorkOrderOperation_Id eq ' + id;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationExtended',
                'options': options
            });
        }

        function getWorkOrderIdByOperation(workOrderOperationId) {
            var options = '$filter=Id eq ' + workOrderOperationId + '&$select=WorkOrder_Id';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperation',
                'options': options
            });
        }

        /**
        * @ngdoc function
        * @name getWorkOrderOperationById
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific WorkOrderOperationExtended.
        * @param {string} id the identifier of the required WorkOrderOperation.
        * @returns {object} the WorkOrderOperationExtended information.
        */
        function getWorkOrderMaterial(workOrderId) {
            var options = '$filter=WorkOrder_Id eq ' + workOrderId + '&$expand=WorkOrder($select=MaterialNId,MaterialRevision)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderExtended',
                'options': options
            });
        }

        /**
        * @ngdoc function
        * @name createWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Creates a new WorkOrder in the system.
        * @param {object} fields the information of the WorkOrder to be created.
        * @returns {params} the information of the created WorkOrder.
        */
        function createWorkOrder(fields) {
            var params = {
                'NId': fields.NId,
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'Description': fields.Description,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Name': fields.Name,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid }
            };
            if (fields.WorkMasterNId) {
                params.WorkMasterNId = fields.WorkMasterNId;
                params.WorkMasterRevision = fields.WorkMasterRevision;
                if (fields.udmdetached) {
                    return callCommand('CreateWorkOrderByWorkMasterV2', params);
                } else {
                    return callCommand('CreateWorkOrderByWorkMaster', params);
                }

            } else {
                return callCommand('CreateWorkOrderExtended', params);
            }
        }

        /**
        * @ngdoc function
        * @name updateWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates information related to a specific WorkOrder.
        * @param {object} fields the object that contains the information to update for the required WorkOrder.
        */
        function updateWorkOrder(fields) {
            var params = {
                'Id': fields.WorkOrder_Id,
                'Name': fields.Name,
                'Description': fields.Description,
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'ActualStartTime': fields.ActualStartTime === '' ? null : fields.ActualStartTime,
                'ActualEndTime': fields.ActualEndTime === '' ? null : fields.ActualEndTime,
                'ActualQuantity': {
                    QuantityValue: fields.ActualQuantity.QuantityValue, UoMNId: fields.ActualQuantityUoMNId === undefined
                        ? fields.ActualQuantityUoMNId
                        : fields.ActualQuantityUoMNId.nid
                }
            };
            return callCommand('UpdateWorkOrderExtended', params);
        }

        /**
        * @ngdoc function
        * @name updateWorkOrderV2
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates information related to a specific WorkOrder.
        * @param {object} fields the object that contains the information to update for the required Work Order.
        */
        function updateWorkOrderV2(fields) {
            var params = {
                'Id': fields.WorkOrder_Id,
                'Name': fields.Name,
                'Description': fields.Description,
                'EquipmentNId': fields.EquipmentNId === undefined ? fields.EquipmentNId : fields.EquipmentNId.nid,
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'ActualStartTime': fields.ActualStartTime === '' ? null : fields.ActualStartTime,
                'ActualEndTime': fields.ActualEndTime === '' ? null : fields.ActualEndTime,
                'ActualQuantity': {
                    QuantityValue: fields.ActualQuantity !== null ? fields.ActualQuantity.QuantityValue : null,
                    UoMNId: fields.ActualQuantityUoMNId === undefined ? fields.ActualQuantityUoMNId : fields.ActualQuantityUoMNId.nid
                }
            };
            return callCommand('UpdateWorkOrderExtendedV2', params);
        }

        /**
        * @ngdoc function
        * @name updateWorkOrderStatus
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates status related to a specific WorkOrder.
        * @param {object} fields the object that contains the information to update the status for the required WorkOrder.
        */
        function updateWorkOrderStatus(fields) {
            var params = {
                'Id': fields.workOrderId,
                'StatusNId': fields.TargetStatusNId
            };
            return callCommand('UpdateWorkOrder', params);
        }

        /**
        * @ngdoc function
        * @name copyWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Creates a copy of a specific WorkOrder.
        * @param {object} fields the object that contains the information to copy the required WorkOrder.
        */
        function copyWorkOrder(fields) {
            var params = {
                'NId': fields.TargetNId,
                'SourceWorkOrderNId': fields.SourceNId
            };
            return callCommand('CreateWorkOrderByWorkOrder', params);
        }

        /**
        * @ngdoc function
        * @name changeWooPSequence
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Changes the sequence of a specific WorkOrderOperation.
        * @param {object} fields the object that contains the information to copy the required WorkOrder.
        */
        function changeWooPSequence(fields) {
            var params = {
                'Id': fields.Id,
                'Name': fields.Name,
                'Sequence': fields.Sequence
            };
            return callCommand('UpdateWorkOrderOperation', params);
        }

        /**
        * @ngdoc function
        * @name updateWorkOrderOperationStatus
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates status related to a specific WorkOrder Operation.
        * @param {object} fields the object that contains the information to update the status for the required WorkOrderOperation.
        */
        function updateWorkOrderOperationStatus(fields) {
            var params = {
                'Id': fields.Id,
                'StatusNId': fields.TargetStatusNId
            };
            return callCommand('UpdateWorkOrderOperation', params);
        }

        /**
        * @ngdoc function
        * @name deleteWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes a specific WorkOrder.
        * @param {string} mtuId the identifier of the WorkOrder to delete.
        * @returns {object} the information related to the required entity.
        */
        function deleteWorkOrder(Id) {
            var params = { Id: Id };
            return callCommand('DeleteWorkOrder', params);
        }

        /**
        * @ngdoc function
        * @name freezeWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Freezes a specific WorkOrder.
        * @param {Guid} Id the identifier of the WorkOrder that needs to be freezed.
        */
        function freezeWorkOrder(Id) {
            var params = { Id: Id };
            return callCommand('FreezeWorkOrder', params);
        }

        /**
        * @ngdoc function
        * @name unfreezeWorkOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Freezes a specific WorkOrder.
        * @param {Guid} Id the identifier of the WorkOrder that needs to be freezed.
        */
        function unfreezeWorkOrder(Id) {
            var params = { Id: Id };
            return callCommand('UnfreezeWorkOrder', params);
        }

        /**
        * @ngdoc function
        * @name addWorkOrderOperationByOperation
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds Work Order Operation from a given Operation.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function addWorkOrderOperationByOperation(cmdParams) {
            var params = { Id: cmdParams.Id, WorkOrderOperations: cmdParams.WorkOrderOperations };
            return callCommand('UpdateWorkOrderExtended', params);
        }
        /**
        * @ngdoc function
        * @name addWorkOrderOperationByOperationV2
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds Work Order Operation from a given Operation.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function addWorkOrderOperationByOperationV2(cmdParams) {
            var params = { Id: cmdParams.Id, WorkOrderOperations: cmdParams.WorkOrderOperations };
            return callCommand('UpdateWorkOrderExtendedV2', params);
        }

        /**
        * @ngdoc function
        * @name addMtuToMaterialRequirementV2
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds Material Tracking Unit to Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function addMtuToMaterialRequirementV2(cmdParams) {
            var params = {
                WorkOrderOperationMaterialRequirementId: cmdParams.WorkOrderOperationMaterialRequirementId,
                MTUsToWorkOrderOperationMaterialRequirement: cmdParams.MTUsToWorkOrderOperationMaterialRequirement
            };
            return callCommand('AddMTUsToWorkOrderOperationMaterialRequirementV2', params);
        }

        /**
        * @ngdoc function
        * @name addActualMtuToMaterialRequirement
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds Actual Material Tracking Unit to Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function addActualMtuToMaterialRequirement(cmdParams) {
            var params = {
                WorkOrderOperationMaterialRequirementId: cmdParams.WorkOrderOperationMaterialRequirementId,
                ActualMTUsToWorkOrderOperationMaterialRequirement: cmdParams.MTUsToWorkOrderOperationMaterialRequirement
            };
            return callCommand('AddActualMTUsToWorkOrderOperationMaterialRequirement', params);
        }

        /**
        * @ngdoc function
        * @name deleteMtuFromMaterialRequirement
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes Material Tracking Unit from Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function deleteMtuFromMaterialRequirement(cmdParams) {
            //Since the table is single selection, the command receives always and only one Id per time
            var params = {
                Ids: [cmdParams.Id]
            };
            return callCommand('DeleteMaterialRequirementMTU', params);
        }

        /**
        * @ngdoc function
        * @name getWorkOrderOperationMaterialDetails
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description retrieves the merged list of material requirements and actuals with their related MTUs
        * @param {object} cmdParams the parameter needed by the command.
        */
        function getWorkOrderMaterialDetails(cmdParams) {
            var params = {};

            if (cmdParams.WorkOrderNId !== undefined && cmdParams.WorkOrderNId !== null) {
                params.WorkOrderNId = cmdParams.WorkOrderNId;
            }

            if (cmdParams.TagSeparator !== undefined && cmdParams.TagSeparator !== null) {
                params.TagSeparator = cmdParams.TagSeparator;
            }

            if (cmdParams.RequirementTagList !== undefined && cmdParams.RequirementTagList !== null) {
                params.MaterialTags = cmdParams.RequirementTagList.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ');
            }

            return execRead('RF_GetWorkOrderMaterialDetails', params);
        }

        /**
        * Get Material details for order
        */
        function getOrderMaterialDetails(params) {
            return execRead('RF_GetOrderMaterialDetails', params, 'PICore');
        }

        /**
        * @ngdoc function
        * @name deleteActualMtuFromMaterialRequirement
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes Actual Material Tracking Unit from Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function deleteActualMtuFromMaterialRequirement(cmdParams) {
            //Since the table is single selection, the command receives always and only one Id per time
            var params = {
                Ids: [cmdParams.Id]
            };
            return callCommand('DeleteActualMaterialRequirementMTU', params);
        }

        /**
        * @ngdoc function
        * @name updateMaterialRequirementMTUV2
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates Material Tracking Unit associated to a Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function updateMaterialRequirementMTUV2(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity === undefined || cmdParams.Quantity === null ? 0 : cmdParams.Quantity,
                MTUNId: cmdParams.MTUNId ? cmdParams.MTUNId : undefined,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                MaterialLotNId: cmdParams.MaterialLotNId ? cmdParams.MaterialLotNId : undefined
            };
            return callCommand('UpdateMaterialRequirementMTUV2', params);
        }

        /**
        * @ngdoc function
        * @name updateActualMaterialRequirementMTU
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates Actual Material Tracking Unit associated to a Work Order Operation Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function updateActualMaterialRequirementMTU(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity === undefined || cmdParams.Quantity === null ? 0 : cmdParams.Quantity,
                MTUNId: cmdParams.MTUNId ? cmdParams.MTUNId : undefined,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                MaterialLotNId: cmdParams.MaterialLotNId ? cmdParams.MaterialLotNId : undefined
            };
            return callCommand('UpdateActualMaterialRequirementMTU', params);
        }

        /**
         * @ngdoc function
         * @name getWorkOrderNumberingPattern
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the numbering patterns associated to Work Order entity.
         * @returns {object} the numering patterns eventually configured in the system.
         */
        function getWorkOrderNumberingPattern() {
            var entity = 'WorkOrder';
            var options = '$filter=EntityTypeNId eq \'' + entity + '\'&$expand=NumberingPatternParts';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'NumberingPattern',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getWorkOrderTemplates
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material tracking unit templates in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Work Order Templates present in the system.
         */
        function getWorkOrderTemplates(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderTemplate',
                'options': options
            });
        }

        function execGetAll(options) {
            return execGetAllEntity(context.data.entityName, options);
        }

        function execGetAllEntity(entityName, options) {
            logger.logDebug('Executing query on ' + entityName + ' with options: ' + options);
            var optionString = options !== '' ? '$expand=WorkOrder&' + options : '$expand=WorkOrder';

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': entityName,
                'options': optionString
            });
        }

        function callCommand(publicName, params) {
            logger.logDebug('Executing command.......', publicName);
            return backendService.invoke({
                'appName': context.data.appName,
                'commandName': publicName,
                'params': params
            });
        }

        function execRead(publicName, params, appName) {
            logger.logDebug('Executing reading function.......', publicName);
            return backendService.read({
                'appName': appName != undefined ? appName : context.data.appName,
                'functionName': publicName,
                'params': params
            });
        }
    }
})();
