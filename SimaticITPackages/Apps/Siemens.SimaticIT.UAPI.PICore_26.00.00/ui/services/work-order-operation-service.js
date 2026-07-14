/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationConstants', WorkOrderOperationConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService', WorkOrderOperationService);

    function WorkOrderOperationConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'WorkOrderOperation'
            }
        };
    }

    WorkOrderOperationService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name WorkOrderOperationService
     *
     * @requires $rootElement
     *
     * @description
     * The WorkOrderOperationService service expose methods to manage WorkOrderOperation entity and related objects relevant for Process Industries.
     */
    function WorkOrderOperationService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getById = getById;
            vm.getByIdAndExpand = getByIdAndExpand;
            vm.addWorkOrderOperationParameterSpecificationToWorkOrderOperation = addWorkOrderOperationParameterSpecificationToWorkOrderOperation;
            vm.deleteWorkOrderOperationParameterSpecification = deleteWorkOrderOperationParameterSpecification;
            vm.updateProcessParameterToWorkOrderOperation = updateProcessParameterToWorkOrderOperation;
            vm.setIsNotInExecutionPropagation = setIsNotInExecutionPropagation;
            vm.setIsInExecutionPropagation = setIsInExecutionPropagation;
            vm.deleteWorkOrderOperation = deleteWorkOrderOperation;
            vm.getEquipmentRequirementItemsById = getEquipmentRequirementItemsById;
            vm.changeWoOpEquipmentRequirementSequence = changeWoOpEquipmentRequirementSequence;
            vm.deleteWorkOrderOperationEquipmentRequirement = deleteWorkOrderOperationEquipmentRequirement;
            vm.getEquipmentGraphConfiguration = getEquipmentGraphConfiguration;
            vm.get_MAT_MTUsAndLOTsByMaterialAndEquipmentFlowGraph = get_MAT_MTUsAndLOTsByMaterialAndEquipmentFlowGraph;
            vm.getWorkOrderOperationMaterialDetails = getWorkOrderOperationMaterialDetails;
            vm.addWorkOrderOperationEquipmentRequirementsToWorkOrderOperation = addWorkOrderOperationEquipmentRequirementsToWorkOrderOperation;
            vm.addWorkOrderOperationMaterialRequirementsToWorkOrderOperation = addWorkOrderOperationMaterialRequirementsToWorkOrderOperation;
            vm.addMaterialRequirementFromBoMExtended = addMaterialRequirementFromBoMExtended;
            vm.updateWorkOrderOperationMaterialRequirementExtended = updateWorkOrderOperationMaterialRequirementExtended;
            vm.updateWorkOrderOperationMaterialRequirement = updateWorkOrderOperationMaterialRequirement;
            vm.updateWorkOrderOperationActualMaterial = updateWorkOrderOperationActualMaterial;
            vm.deleteWorkOrderOperationMaterialRequirement = deleteWorkOrderOperationMaterialRequirement;
            vm.deleteWorkOrderOperationActualMaterial = deleteWorkOrderOperationActualMaterial;
            vm.addWorkOrderOperationActualMaterialsToWorkOrderOperation = addWorkOrderOperationActualMaterialsToWorkOrderOperation;
            vm.AddWorkOrderOperationParameterRequirementsToWorkOrderOperation = AddWorkOrderOperationParameterRequirementsToWorkOrderOperation;
            vm.addParameterRequirementsToWorkOrderOperationFromCatalog = addParameterRequirementsToWorkOrderOperationFromCatalog;
            //vm.addParameterRequirementsToWorkOrderOperationFromTaskDefinition = addParameterRequirementsToWorkOrderOperationFromTaskDefinition;
            vm.addParameterRequirementsToWorkOrderOperationFromProcessDefinition = addParameterRequirementsToWorkOrderOperationFromProcessDefinition;
            vm.getWorkOrderOperationMaterialRequirements = getWorkOrderOperationMaterialRequirements;
            vm.getWorkOrderOperationActualMaterials = getWorkOrderOperationActualMaterials;
            vm.getMaterialRequirementMTUs = getMaterialRequirementMTUs;
            vm.getEquipment = getEquipment;
            vm.setActualEquipment = setActualEquipment;
            vm.addMtuToActualMaterialRequirement = addMtuToActualMaterialRequirement;
            vm.addMtuToActualMaterialRequirementV2 = addMtuToActualMaterialRequirementV2;
            vm.updateMTUActualMaterialRequirementV2 = updateMTUActualMaterialRequirementV2;
            vm.deleteMtuFromActualMaterialRequirement = deleteMtuFromActualMaterialRequirement;
            vm.addRequirements = addRequirements;
            vm.addWorkOrderOperationWithRequirements = addWorkOrderOperationWithRequirements;
            vm.getTaskParameterByTaskId = getTaskParameterByTaskId;
        }

        function getTaskParameterByTaskId(taskId, options) {
            var condition = '$filter=Task_Id eq ' + taskId;
            if (options !== null && options !== undefined) {
                condition += (' and ' + options);
            }

            return backendService.findAll({
                'appName': 'Task',
                'entityName': 'TaskParameter',
                'options': condition
            });
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
         * @description Retrieves the information related to a specific WorkOrderOperation.
         * @param {string} id the identifier of the required WorkOrderOperation.
         * @returns {object} the WorkOrderOperation information.
         */
        function getById(id) {
            var options = '$filter=Id eq ' + id;
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkOrderOperation.
         * @param {string} id the identifier of the required WorkOrderOperation.
         * @returns {object} the WorkOrderOperation information.
         */
        function getByIdAndExpand(id, entity) {
            var options = '$filter=Id eq ' + id + '&$expand=' + entity;
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getWorkOrderOperationMaterialRequirements
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkOrderOperation Material Requirement.
         * @param {string} workOrderOperationId The WorkOrderOperation unique identifier.
         * @returns {object} The list of WorkOrderOperation Material Requirements.
         */
        function getWorkOrderOperationMaterialRequirements(workOrderOperationId) {
            var options = '$expand=Facets($select=Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/BoMNId'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/BoMRevision'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/BoMItemNId'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/Direction'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/Usage'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/EquipmentNId'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/EquipmentGraphNId'
                + ',Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.WorkOrderOperationMaterialRequirementExtended/RequirementTag)'
                + '&$filter=WorkOrderOperation_Id eq ' + workOrderOperationId;
            return execGetAllEntity('WorkOrderOperationMaterialRequirement', options);
        }

        /**
         * @ngdoc function
         * @name getMaterialRequirementMTUs
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to one or more Material Requirement MTU(s).
         * @param materialRequirementId The key identifier of the Work Order Operation Material Requirement.
         * @returns {object} The list of WorkOrderOperation Material Requirement MTU.
         */
        function getMaterialRequirementMTUs(materialRequirementId) {
            var options = '$filter=WorkOrderOperationMaterialRequirement_Id eq ' + materialRequirementId;
            return execGetAllEntity('MaterialRequirementMTU', options);
        }

        /**
         * @ngdoc function
         * @name getWorkOrderOperationActualMaterials
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkOrderOperation Actual Material.
         * @param {string} workOrderOperationId The WorkOrderOperation unique identifier.
         * @returns {object} The list of WorkOrderOperation Actual Material.
         */
        function getWorkOrderOperationActualMaterials(workOrderOperationId) {
            var options = '$expand=ActualMaterialMTUs&$filter=WorkOrderOperation_Id eq ' + workOrderOperationId;
            return execGetAllEntity('WorkOrderOperationActualMaterial', options);
        }

        function execGetAll(options) {
            return execGetAllEntity(context.data.entityName, options);
        }

        function execGetAllEntity(entityName, options) {
            logger.logDebug('Executing query on ' + entityName + ' with options: ' + options);
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': entityName,
                'options': options
            });
        }

        function execCommand(publicName, params) {
            logger.logDebug('Executing command.......', publicName);
            return backendService.invoke({
                'appName': context.data.appName,
                'commandName': publicName,
                'params': params
            });
        }

        function execRead(publicName, params) {
            logger.logDebug('Executing reading function.......', publicName);
            return backendService.read({
                'appName': context.data.appName,
                'functionName': publicName,
                'params': params
            });
        }

        /**
        * @ngdoc function
        * @name addWorkOrderOperationParameterSpecificationToWorkOrderOperation
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a set of process parameters, selcted from a catalogue, to a work order operation.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        function addWorkOrderOperationParameterSpecificationToWorkOrderOperation(cmdParams) {
            var params = {
                WorkOrderOperationId: cmdParams.WorkOrderOperationId,
                ParameterNId: cmdParams.ParameterNId,
                TargetValue: cmdParams.ParameterTargetValue

            };
            return execCommand('AddWorkOrderOperationParameterSpecificationToWorkOrderOperation', params);
        }

        /** addParameterRequirementsToWorkOrderOperationFromCatalog
        * @ngdoc function
        * @name addParameterRequirementsToWorkOrderOperationFromCatalog
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a set of process parameters, selected from a catalogue, to a work order operation.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        function addParameterRequirementsToWorkOrderOperationFromCatalog(cmdParams) {
            var params = {
                Id: cmdParams.WorkOrderOperationId,
                ProcessParameters: cmdParams.ProcessParameters
            };
            return execCommand('AddParameterRequirementsToWorkOrderOperationFromCatalogCalculatingPercentages', params);
        }

        /** addRequirements
        * @ngdoc function
        * @name addRequirements
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a set of requirements to a work order operation.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        function addRequirements(cmdParams) {
            var params = {
                Id: cmdParams.WorkOrderOperationId,
                WorkOrderOperationEquipmentRequirements: cmdParams.WorkOrderOperationEquipmentRequirements,
                WorkOrderOperationMaterialRequirements: cmdParams.WorkOrderOperationMaterialRequirements,
                ProcessParametersFromCatalog: cmdParams.ProcessParametersFromCatalog,
                ProcessParametersFromTaskDefinition: cmdParams.ProcessParametersFromTaskDefinition,
                ProcessParametersFromProcessDefinition: cmdParams.ProcessParametersFromProcessDefinition
            };
            return execCommand('AddRequirementsToWorkOrderOperation', params);
        }


        /** addWorkOrderoperationWithRequirements
        * @ngdoc function
        * @name addWorkOrderoperationWithRequirements
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a work order operation with the related set of requirements.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        function addWorkOrderOperationWithRequirements(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                WorkOrderOperationEquipmentRequirements: cmdParams.WorkOrderOperationEquipmentRequirements,
                WorkOrderOperationMaterialRequirements: cmdParams.WorkOrderOperationMaterialRequirements,
                ProcessParametersFromCatalog: cmdParams.ProcessParametersFromCatalog,
                ProcessParametersFromTaskDefinition: cmdParams.ProcessParametersFromTaskDefinition,
                ProcessParametersFromProcessDefinition: cmdParams.ProcessParametersFromProcessDefinition,
                WorkOrderOperation: cmdParams.WorkOrderOperation
            };
            return execCommand('AddWorkOrderOperationToWorkOrderWithRequirements', params);
        }

        /** addParameterRequirementsToWorkOrderOperationFromTaskDefinition
        * @ngdoc function
        * @name addParameterRequirementsToWorkOrderOperationFromTaskDefinition
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a set of process parameters, mapped with task definition parameter, to a work order operation.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        //function addParameterRequirementsToWorkOrderOperationFromTaskDefinition(cmdParams) {
        //    var params = {
        //        Id: cmdParams.WorkOrderOperationId,
        //        ProcessParameters: cmdParams.ProcessParameters
        //    };
        //    return execCommand('AddParameterRequirementsToWorkOrderOperationFromTaskDefinition', params);
        //}

        /** addParameterRequirementsToWorkOrderOperationFromTaskDefinition
        * @ngdoc function
        * @name addParameterRequirementsToWorkOrderOperationFromProcessDefinition
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Adds a set of process parameters, mapped with process definition parameter, to a work order operation.
        * @cmdParams {object} cmdParams the parameter needed by the command.
        */
        function addParameterRequirementsToWorkOrderOperationFromProcessDefinition(cmdParams) {
            var params = {
                Id: cmdParams.WorkOrderOperationId,
                ProcessParameters: cmdParams.ProcessParameters
            };
            return execCommand('AddParameterRequirementsToWorkOrderOperationFromProcessDefinition', params);
        }

        /**
         * @ngdoc function
         * @name deleteOperationParameterSpecification
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific operation parameter specification.
         * @param {string} operationParameterSpecificationId the identifier of the operation parameter specification to delete.
         */
        function deleteWorkOrderOperationParameterSpecification(operationParameterSpecificationId) {
            var params = { Id: operationParameterSpecificationId };
            return execCommand('DeleteProcessParameterToWorkOrderOperation', params);
        }

        /**
        * @ngdoc function
        * @name addWorkOrderOperationEquipmentRequirementsToWorkOrderOperation
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Add a list of EquipmentRequirement  to a specific work order operation.
        * @param {Guid} Id the Work Order Operation to be updated.
        * @param {ReferenceWorkOrderOperationEquipmentRequirementParameterType} List of equipment requirement to be added.
        */
        function addWorkOrderOperationEquipmentRequirementsToWorkOrderOperation(param) {
            var params = {
                WorkOrderOperationId: param.WorkOrderOperationId,
                WorkOrderOperationEquipmentRequirements: param.WorkOrderOperationEquipmentRequirements
            };
            return execCommand('AddWorkOrderOperationEquipmentRequirementsToWorkOrderOperation', params);
        }

        /**
          * @ngdoc function
          * @name addWorkOrderOperationMaterialRequirementsToWorkOrderOperation
          * @module Siemens.SimaticIT.UAPI.PICore
          *
          * @description Add a list of Material Requirement to a specific work order operation.
          * @param {Guid} Id the Work Order Operation to be updated.
          * @param {ReferenceWorkOrderOperationMaterialRequirementExtendedParameterType} List of Material Requirements to be added.
          */
        function addWorkOrderOperationMaterialRequirementsToWorkOrderOperation(param) {
            var params = {
                WorkOrderOperationId: param.WorkOrderOperationId,
                WorkOrderOperationMaterialRequirements: param.WorkOrderOperationMaterialRequirements
            };
            return execCommand('AddWorkOrderOperationMaterialRequirementsToWorkOrderOperation', params);
        }

        /**
          * @ngdoc function
          * @name addMaterialRequirementFromBoMExtended
          * @module Siemens.SimaticIT.UAPI.PICore
          *
          * @description Adds Material Requirement to Work Order Operation from Bill Of Materials.
          * @param {object} cmdParams The data needed to perform the command.
        */
        function addMaterialRequirementFromBoMExtended(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                WorkOrderOperationMaterialRequirements: cmdParams.WorkOrderOperationMaterialRequirements,
                WorkOrderOperationMaterialRequirementsExtended: cmdParams.WorkOrderOperationMaterialRequirementsExtended
            };
            return execCommand('UpdateWorkOrderOperationExtended', params);
        }

        /**
		 * @ngdoc function
		 * @name updateWorkOrderOperationMaterialRequirement
		 * @module Siemens.SimaticIT.UAPI.PICore
		 *
		 * @description Updates a given Material Requirement.
		 * @param {object} cmdParams The data needed to perform the command.
		 */
        function updateWorkOrderOperationMaterialRequirement(cmdParams) {
            var params = { Id: cmdParams.Id, Quantity: cmdParams.Quantity, Sequence: cmdParams.Sequence };
            return execCommand('UpdateWorkOrderOperationMaterialRequirement', params);
        }

        /**
         * @ngdoc function
         * @name updateWorkOrderOperationMaterialRequirementExtended
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Updates a given Material Requirement Extended.
         * @param {object} cmdParams The data needed to perform the command.
         */
        function updateWorkOrderOperationMaterialRequirementExtended(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity,
                Sequence: cmdParams.Sequence,
                Usage: cmdParams.Usage,
                Direction: cmdParams.Direction,
                EquipmentNId: cmdParams.EquipmentNId,
                EquipmentGraphNId: cmdParams.EquipmentGraphNId,
                RequirementTag: cmdParams.RequirementTag
            };
            return execCommand('UpdateWorkOrderOperationMaterialRequirementExtended', params);
        }

        /**
         * @ngdoc function
         * @name updateWorkOrderOperationActualMaterial
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Updates a given Actual Material.
         * @param {object} cmdParams The data needed to perform the command.
         */
        function updateWorkOrderOperationActualMaterial(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity,
                Sequence: cmdParams.Sequence,
                Usage: cmdParams.Usage,
                Direction: cmdParams.Direction,
                EquipmentNId: cmdParams.EquipmentNId,
                EquipmentGraphNId: cmdParams.EquipmentGraphNId
            };
            return execCommand('UpdateWorkOrderOperationActualMaterial', params);
        }

        /**
          * @ngdoc function
          * @name addWorkOrderOperationActualMaterialsToWorkOrderOperation
          * @module Siemens.SimaticIT.UAPI.PICore
          *
          * @description Add a list of Actual Material to a specific work order operation.
          * @param {Guid} Id the Work Order Operation to be updated.
          * @param {ReferenceWorkOrderOperationActualMaterialParameterType} List of Actual Materials to be added.
          */
        function addWorkOrderOperationActualMaterialsToWorkOrderOperation(param) {
            var params = {
                WorkOrderOperationId: param.WorkOrderOperationId,
                WorkOrderOperationActualMaterials: param.WorkOrderOperationActualMaterials
            };
            return execCommand('AddWorkOrderOperationActualMaterialsToWorkOrderOperation', params);
        }

        /**
         * @ngdoc function
         * @name deleteWorkOrderOperationMaterialRequirement
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes Material Requiremnt from Work Order Operation Material Requirement.
         * @param {string} Id The Guid of a data to delete.
         */
        function deleteWorkOrderOperationMaterialRequirement(id) {
            //Since the table is single selection, the command receives always and only one Id per time
            var params = {
                Id: id
            };
            return execCommand('DeleteWorkOrderOperationMaterialRequirement', params);
        }

        /**
         * @ngdoc function
         * @name deleteWorkOrderOperationActualMaterial
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes Material Requiremnt from Work Order Operation Actual Material.
         * @param {string} Id The Guid of a data to delete.
         */
        function deleteWorkOrderOperationActualMaterial(id) {
            //Since the table is single selection, the command receives always and only one Id per time
            var params = {
                Id: id
            };
            return execCommand('DeleteWorkOrderOperationActualMaterial', params);
        }

        /**
         * @ngdoc function
         * @name AddWorkOrderOperationParameterRequirementsToWorkOrderOperation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Add a list of Parameter Requirement to a specific work order operation.
         * @param {String} Natural identifier of the work master.
         * @param {String} The revision of the work master.
         * @param {String} Natural identifier of the Bill of Operation Item.
         * @param {String} Natural identifier of the Bill of Operation.
         * @param {String} The revision of the the Bill of Operation.
         * @param {List of String} The list of the parameter to be addedto the work order operation.
         * @param {ReferenceWorkOrderOperationMaterialRequirementExtendedParameterType} List of material requirement to be added.
         */
        function AddWorkOrderOperationParameterRequirementsToWorkOrderOperation(param) {
            var params = {
                WorkMasterNId: param.WorkMasterNId,
                WorkMasterRevision: param.WorkMasterRevision,
                BoOpItemNId: param.BoOpItemNId,
                BoOpNId: param.BoOpNId,
                BoOpRevision: param.BoOpRevision,
                ParameterNIds: param.ParameterNId,
                WorkOrderOperationId: param.WorkOrderOperationId
            };
            return execCommand('AddWorkOrderOperationParameterRequirementsToWorkOrderOperation', params);
        }

        /**
         * @ngdoc function
         * @name UpdateProcessParameterToWorkOrderOperation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Update a specific operation parameter specification.
         * @param {list} list the identifier of the operation parameter specification to update.
         */
        function updateProcessParameterToWorkOrderOperation(list) {
            var param = {
                'Parameters': list
            };

            return backendService.invoke({
                'appName': context.data.appName,
                'commandName': 'UpdateWorkOrderOperationParameterRequirement',
                'params': param
            });
        }

        /**
         * @ngdoc function
         * @name setActualEquipment
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Sets the actual equipment of a given Work order Operation.
         * @param {string} Id the Work Order Operation the actual equipment has to be set to.
         * @param {string} actualEquipment the Equipment chosen to be set as actual for the given Work Order Operation.
         */
        function setActualEquipment(Id, actualEquipment) {
            var params = {
                'Id': Id,
                'ActualEquipmentNId': actualEquipment
            };
            return execCommand('UpdateWorkOrderOperationExtended', params);
        }

        /**
         * @ngdoc function
         * @name setIsInExecutionPropagation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Sets the execution propagation flag of a given Work order Operation.
         * @param {string} Id the Work Order Operation to be set in execution propagation.
         */
        function setIsInExecutionPropagation(Id) {
            var params = {
                'Id': Id,
                'IsInExecutionPropagation': true
            };
            return execCommand('UpdateWorkOrderOperationExtended', params);
        }

        /**
         * @ngdoc function
         * @name deleteWorkOrderOperation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a given Work order Operation.
         * @param {string} Id the Work Order Operation to be deleted.
         */
        function deleteWorkOrderOperation(Id) {
            var params = {
                'Id': Id
            };
            return execCommand('DeleteWorkOrderOperation', params);
        }

        /**
        * @ngdoc function
        * @name UpdateWorkOrderOperationEquipmentRequirement
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes a given Work order Operation.
        * @param {string} Id the Work Order Operation Equipment Requirement to be Updated.
        * @param {int} sequence the new value to be assigned.
        */
        function changeWoOpEquipmentRequirementSequence(param) {
            var params = {
                'Id': param.Id,
                'Sequence': param.Sequence,
                'RequirementTag': param.RequirementTag
            };
            return execCommand('UpdateWorkOrderOperationEquipmentRequirement', params);
        }

        /**
         * @ngdoc function
         * @name deleteWorkOrderOperationEquipmentRequirement
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a given Work order Operation Equipment Requirement.
         * @param {string} Id the Work Order Operation Equipment Requirement vto be deleted.
         */
        function deleteWorkOrderOperationEquipmentRequirement(Id) {
            var params = {
                'Id': Id
            };
            return execCommand('DeleteWorkOrderOperationEquipmentRequirement', params);
        }

        /**
         * @ngdoc function
         * @name setIsNotInExecutionPropagation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Unsets the execution propagation flag of a given Work Order Operation.
         * @param {string} Id the Work Order Operation to be set not in execution propagation.
         */
        function setIsNotInExecutionPropagation(Id) {
            var params = {
                'Id': Id,
                'IsInExecutionPropagation': false
            };
            return execCommand('UpdateWorkOrderOperationExtended', params);
        }

        /**
       * @ngdoc function
       * @name getEquipmentRequirementItemsById
       * @module Siemens.SimaticIT.UAPI.PICore
       *
       * @description Retrieves the information about Equipment requirement of a given Work Order Operations.
       * @param {string} woOpId the identifier of the Work Order Operations.
       * @returns {object} the information related to the specified Equipment requirement.
       */
        function getEquipmentRequirementItemsById(woOpId) {
            var options = '$filter=WorkOrderOperation_Id eq ' + woOpId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkOrderOperationEquipmentRequirement',
                'options': options
            });
        }

        /**
      * @ngdoc function
      * @name getEquipmentGraphConfiguration
      * @module Siemens.SimaticIT.UAPI.PICore
      *
      * @description Retrieves the information about Equipment Graph Configuration.
      * @returns {object} the information related to the specified Equipment requirement.
      */
        function getEquipmentGraphConfiguration() {
            var options = '$expand=Type&$filter=Type/NId eq \'Flow\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'EquipmentGraphConfiguration',
                'options': options
            });
        }

        /**
          * @ngdoc function
          * @name getEquipment
          * @module Siemens.SimaticIT.UAPI.PICore
          *
          * @description Retrieves the information about Equipment.
          * @returns {object} the information related to the specified Equipment.
          */
        function getEquipment(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Equipment',
                'options': options
            });
        }

        /**
		* @ngdoc function
		* @name get_MAT_MTUsAndLOTsByMaterialAndEquipmentFlowGraph
		* @module Siemens.SimaticIT.UAPI.PICore
		*
		* @description given the list of MTUs and LOTs that are placed in the pieces of equipment belonging to the Equipment Flow Graph
		* @param {String} MaterialNId
		* @param {String} MaterialRevision
		* @param {String} EquipmentGraphConfigurationNId
		* @param {String} EquipmentNId
		* @returns {object} List of LOTs GUID
		* @returns {object} List of MTUs GUID
		*/
        function get_MAT_MTUsAndLOTsByMaterialAndEquipmentFlowGraph(cmdParams) {
            return execGetAllEntity('EquipmentGraphNode', '$filter=EquipmentGraphConfigurationNId eq \'' + cmdParams.EquipmentGraphConfigurationNId
                + '\' and EquipmentNId eq \'' + cmdParams.EquipmentNId + '\'').then(
                    function (result) {
                        if (result === undefined || result === null || result.value === undefined || result.value === null || result.value.length === 0) {
                            return new Promise(function (resolve, reject) {
                                reject({
                                    errorCode: -11100,
                                    errorMessage: 'The Actual Equipment ' + cmdParams.EquipmentNId
                                        + ' of the Work Order Operation is not associated to the specified Equipment Graph Configuration: '
                                        + cmdParams.EquipmentGraphConfigurationNId
                                });
                            });
                        } else {
                            var options = '$filter=NId eq \'' + cmdParams.MaterialNId + '\'';
                            if (cmdParams.MaterialRevision === undefined || cmdParams.MaterialRevision === null || cmdParams.MaterialRevision.length === 0) {
                                options += ' and IsCurrent eq true';
                            } else {
                                options += ' and Revision eq \'' + cmdParams.MaterialRevision + '\'';
                            }

                            return execGetAllEntity('Material', options).then(
                                function (result) {
                                    if (result === undefined || result === null || result.value === undefined || result.value === null || result.value.length === 0) {
                                        var error = {
                                            errorCode: -1,
                                            errorMessage: ''
                                        };
                                        if (cmdParams.MaterialRevision === undefined || cmdParams.MaterialRevision === null || cmdParams.MaterialRevision.length === 0) {
                                            error.errorCode = -10855;
                                            error.errorMessage = 'There is no Material with NId: ' + cmdParams.MaterialNId + ' and Revision set as current.';
                                        } else {
                                            error.errorCode = -10807;
                                            error.errorMessage = 'A Material with NId: ' + cmdParams.MaterialNId + ' and Revision: ' + cmdParams.MaterialRevision
                                                + ' does not exist.';
                                        }

                                        return new Promise(function (resolve, reject) {
                                            reject(error);
                                        });
                                    } else {
                                        var params = {
                                            MaterialNId: cmdParams.MaterialNId,
                                            MaterialRevision: cmdParams.MaterialRevision,
                                            EquipmentGraphConfigurationNId: cmdParams.EquipmentGraphConfigurationNId,
                                            EquipmentNId: cmdParams.EquipmentNId
                                        };
                                        return execRead('RF_GetMTUsAndLOTsByMaterialAndEquipmentFlowGraphV2', params);
                                    }
                                },
                                function (reason) {
                                    return new Promise(function (resolve, reject) {
                                        reject(reason);
                                    });
                                }
                            );
                        }
                    },
                    function (reason) {
                        return new Promise(function (resolve, reject) {
                            reject(reason);
                        });
                    }
                );
        }

        /**
        * @ngdoc function
        * @name getWorkOrderOperationMaterialDetails
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description retrieves the merged list of material requirements and actuals with their related MTUs
        * @param {object} cmdParams the parameter needed by the command.
        */
        function getWorkOrderOperationMaterialDetails(cmdParams) {
            var params = {};

            if (cmdParams.WorkOrderNId !== undefined && cmdParams.WorkOrderNId !== null) {
                params.WorkOrderNId = cmdParams.WorkOrderNId;
            }

            if (cmdParams.WorkOrderOperationNId !== undefined && cmdParams.WorkOrderOperationNId !== null) {
                params.WorkOrderOperationNId = cmdParams.WorkOrderOperationNId;
            }

            if (cmdParams.TagSeparator !== undefined && cmdParams.TagSeparator !== null) {
                params.TagSeparator = cmdParams.TagSeparator;
            }

            if (cmdParams.RequirementTagList !== undefined && cmdParams.RequirementTagList !== null) {
                params.MaterialTags = cmdParams.RequirementTagList.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ');
            }

            return execRead('RF_GetWorkOrderOperationMaterialDetails', params);
        }

        /**
       * @ngdoc function
       * @name addMtuToActualMaterialRequirement
       * @module Siemens.SimaticIT.UAPI.PICore
       *
       * @description Adds Material Tracking Unit to Work Order Operation Actual Material Requirement.
       * @param {object} cmdParams The data needed to perform the command.
       */
        function addMtuToActualMaterialRequirement(cmdParams) {
            var params = {
                WorkOrderOperationActualMaterialId: cmdParams.WorkOrderOperationActualMaterialId,
                MTUsToWorkOrderOperationActualMaterial: cmdParams.MTUsToWorkOrderOperationActualMaterial
            };
            return execCommand('AddMTUsToWorkOrderOperationActualMaterial', params);
        }

        /**
       * @ngdoc function
       * @name addMtuToActualMaterialRequirementV2
       * @module Siemens.SimaticIT.UAPI.PICore
       *
       * @description Adds Material Tracking Unit to Work Order Operation Actual Material Requirement.
       * @param {object} cmdParams The data needed to perform the command.
       */
        function addMtuToActualMaterialRequirementV2(cmdParams) {
            var params = {
                WorkOrderOperationActualMaterialId: cmdParams.WorkOrderOperationActualMaterialId,
                MTUsToWorkOrderOperationActualMaterial: cmdParams.MTUsToWorkOrderOperationActualMaterial
            };
            return execCommand('AddMTUsToWorkOrderOperationActualMaterialV2', params);
        }

        /**
        * @ngdoc function
        * @name updateMTUActualMaterialRequirementV2
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Updates Material Tracking Unit associated to a Work Order Operation Actual Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function updateMTUActualMaterialRequirementV2(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity === undefined || cmdParams.Quantity === null ? 0 : cmdParams.Quantity,
                MTUNId: cmdParams.MTUNId ? cmdParams.MTUNId : undefined,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                MaterialLotNId: cmdParams.MaterialLotNId ? cmdParams.MaterialLotNId : undefined
            };
            return execCommand('UpdateActualMaterialMTUV2', params);
        }

        /**
        * @ngdoc function
        * @name deleteMtuFromActualMaterialRequirement
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes Material Tracking Unit from Work Order Operation Actual Material Requirement.
        * @param {object} cmdParams The data needed to perform the command.
        */
        function deleteMtuFromActualMaterialRequirement(cmdParams) {
            //Since the table is single selection, the command receives always and only one Id per time
            var params = {
                Ids: [cmdParams.Id]
            };
            return execCommand('DeleteActualMaterialMTU', params);
        }
    }
})();
