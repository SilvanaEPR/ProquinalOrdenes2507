/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.WorkMasterConstants', WorkMasterConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.WorkMasterService', WorkMasterService);

    function WorkMasterConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'WorkMaster'
            }
        };
    }

    WorkMasterService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.WorkMasterConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name WorkMasterService
     *
     * @requires $rootElement
     *
     * @description
     * The WorkMasterService service expose methods to manage WorkMaster entity and related objects relevant for Process Industries.
     */
    function WorkMasterService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.WorkMasterService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getById = getById;
            vm.getByIdExpandCompositions = getByIdExpandCompositions;
            vm.getByNId = getByNId;
            vm.getWorkMasterHeaderParametersByWorkMasterId = getWorkMasterHeaderParametersByWorkMasterId;
            vm.createWorkMaster = createWorkMaster;
            vm.updateWorkMaster = updateWorkMaster;
            vm.deleteWorkMaster = deleteWorkMaster;
            vm.getWorkMasterOperationSpecificationsByOpAndRevision = getWorkMasterOperationSpecificationsByOpAndRevision;
            vm.getWorkMasterOperationsWithSpecificationsAvailableAtRuntime = getWorkMasterOperationsWithSpecificationsAvailableAtRuntime;
            vm.setCurrent = setCurrent;
            vm.unsetCurrent = unsetCurrent;
            vm.lock = lock;
            vm.unlock = unlock;
            vm.getWorkMasterNumberingPattern = getWorkMasterNumberingPattern;
            vm.getBillOfOperations = getBillOfOperations;
            vm.copyWorkMasterRevision = copyWorkMasterRevision;
            vm.newWorkMasterRevision = newWorkMasterRevision;
            vm.getWorkMasterMaterial = getWorkMasterMaterial;
            vm.getWorkMasters = getWorkMasters;
            vm.exportWorkMaster = exportWorkMaster;
            vm.importWorkMaster = importWorkMaster;
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of WorkMaster.
         * @param {object} options the object that contains the conditions to query WorkMaster.
         * @returns {object} the list of WorkMaster.
         */
        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name getWorkMasterOperationSpecificationsByOpAndRevision
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the Work Master Operations that reference the given Operation and Revision.
         * @param {string} Operation the identifier of Operation.
		 * @param {string} Revision the revision of Operation.
         * @returns {object} the information related to the specified Operation and Revision.
         */
        function getWorkMasterOperationSpecificationsByOpAndRevision(Operation, Revision) {
            var options = '$filter=OperationNId eq \'' + Operation + '\' and OperationRevision eq \''
                + Revision + '\' and AvailableAtRuntime eq ' + true
                + '\&$expand=OperationMaterialSpecifications($expand=Usage,Direction),OperationEquipmentSpecifications,WorkMaster,OperationParameterSpecifications($expand=Facets)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMasterOperation',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getWorkMasterOperationsWithSpecificationsAvailableAtRuntime
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the Operations and the information about their specifications.

         * @returns {object} the Operations set as available for work order enrichment with their specifications.
         */
        function getWorkMasterOperationsWithSpecificationsAvailableAtRuntime() {
            var options = '$filter=AvailableAtRuntime eq ' + true
                + ' &$expand=OperationMaterialSpecifications($expand=Usage,Direction),OperationEquipmentSpecifications,WorkMaster,OperationParameterSpecifications($expand=Facets)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMasterOperation',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkMaster.
         * @param {string} id the identifier of the required WorkMaster.
         * @returns {object} the WorkMaster information.
         */
        function getById(id) {
            var options = '$filter=Id eq ' + id;
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
            var options = '$filter=Id eq ' + id + '&$expand=OperationMaterialSpecifications,OperationEquipmentSpecifications,OperationParameterSpecifications($expand=Facets)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMaster',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific WorkMaster.
         * @param {string} nid the natural identifier of the required WorkMaster.
         * @returns {object} the WorkMaster information.
         */
        function getByNId(nid) {
            var options = '$filter=NId eq \'' + nid + '\'';
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getWorkMasterHeaderParametersByWorkMasterId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the process parameters associated to the header of the given work master.
         * @param {string} workMasterId the identifier of the given work master.
         * @returns {object} return the process parameters found by the query.
         */
        function getWorkMasterHeaderParametersByWorkMasterId(workMasterId) {
            var options = '$filter=Id eq ' + workMasterId + '&$expand=HeaderParameters,CatalogueParameter';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMaster',
                'options': options
            });
        }

        function getWorkMasterMaterial(workMasterId) {
            var options = '$filter=Id eq ' + workMasterId + '&$select=MaterialNId,MaterialRevision';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMaster',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name createWorkMaster
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Creates a new WorkMaster in the system.
         * @param {object} fields the information of the WorkMaster to be created.
         * @returns {params} the information of the created WorkMaster.
         */
        function createWorkMaster(fields) {
            var params = {
                'NId': fields.NId,
                'Name': fields.Name,
                'Description': fields.Description,
                'Revision': fields.Revision,
                'MaterialGroupNId': fields.MaterialGroupNId === undefined ? fields.MaterialGroupNId : fields.MaterialGroupNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },
                'BoOpNId': fields.BoOpNId,
                'BoOpRevision': fields.BoOpRevision
            };
            return execCommand('CreateWorkMaster', params);
        }

        /**
         * @ngdoc function
         * @name updateWorkMaster
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Updates information related to a specific WorkMaster.
         * @param {object} fields the object that contains the information to update for the required WorkMaster.
         */
        function updateWorkMaster(fields) {
            var params = {
                'Id': fields.Id,
                'Name': fields.Name,
                'Description': fields.Description,
                'MaterialGroupNId': fields.MaterialGroupNId === undefined ? fields.MaterialGroupNId : fields.MaterialGroupNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },
                'BoOpNId': fields.BoOpNId.id === undefined ? fields.BoOpNId : fields.BoOpNId.id,
                'BoOpRevision': (fields.BoOpRevision !== null && fields.BoOpRevision.revision !== undefined) ? fields.BoOpRevision.revision : fields.BoOpRevision
            };
            return execCommand('UpdateWorkMaster', params);
        }

        /**
         * @ngdoc function
         * @name deleteWorkMaster
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific WorkMaster.
         * @param {string} mtuId the identifier of the WorkMaster to delete.
         * @returns {object} the information related to the required entity.
         */
        function deleteWorkMaster(Id) {
            var params = { Id: Id };
            return execCommand('DeleteWorkMaster', params);
        }

        /**
         * @ngdoc function
         * @name setCurrent
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Sets to current a specific WorkMaster.
         * @param {Guid} Id the identifier of the WorkMaster that needs to be set to current.
         */
        function setCurrent(Id) {
            var params = { WorkMasterId: Id };
            return execCommand('SetWorkMasterCurrent', params);
        }

        /**
         * @ngdoc function
         * @name unsetCurrent
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Unsets to current a specific WorkMaster.
         * @param {Guid} Id the identifier of the WorkMaster that needs to be unset to current.
         */
        function unsetCurrent(Id) {
            var params = { WorkMasterId: Id };
            return execCommand('UnsetWorkMasterCurrent', params);
        }

        /**
         * @ngdoc function
         * @name lock
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Locks a specific WorkMaster.
         * @param {Guid} Id the identifier of the WorkMaster that needs to be locked.
         */
        function lock(Id) {
            var params = { Id: Id };
            return execCommand('LockWorkMaster', params);
        }

        /**
         * @ngdoc function
         * @name lock
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Locks a specific WorkMaster.
         * @param {Guid} Id the identifier of the WorkMaster that needs to be locked.
         */
        function unlock(Id) {
            var params = { Id: Id };
            return execCommand('UnlockWorkMaster', params);
        }

        /**
         * @ngdoc function
         * @name copyWorkMasterRevision
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Copy the revision for a specific WorkMaster.
         * @param {object} params the object that contains the parameters for copying the WorkMaster revision.
         */
        function copyWorkMasterRevision(params) {
            return execCommand('CopyWorkMasterRevision', params);
        }

        /**
         * @ngdoc function
         * @name newWorkMasterRevision
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Create a new revision for a specific WorkMaster.
         * @param {object} params the object that contains the parameters for creating new WorkMaster revision.
         */
        function newWorkMasterRevision(params) {
            return execCommand('CreateNewWorkMasterRevision', params);
        }

        function exportWorkMaster(params) {
            return execCommand('ExportWorkMaster', params);
        }

        function importWorkMaster(params) {
            return execCommand('ImportWorkMaster', params);
        }

        function execGetAll(options) {
            return execGetAllEntity(context.data.entityName, options);
        }

        /**
         * @ngdoc function
         * @name getWorkMasterNumberingPattern
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the numbering patterns associated to Work Master entity.
         * @returns {object} the numering patterns eventually configured in the system.
         */
        function getWorkMasterNumberingPattern() {
            var entity = 'WorkMaster';
            var options = '$filter=EntityTypeNId eq \'' + entity + '\'&$expand=NumberingPatternParts';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'NumberingPattern',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getBillOfOperations
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Bill of Operations
         * @param {string} options the OData query options.
         * @returns {object} the Bills of Operations that satisfy the supplied condition.
         */
        function getBillOfOperations(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperations',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getWorkMasters
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Work Master
         * @param {string} options the OData query options.
         * @returns {object} the Work Masters that satisfy the supplied condition.
         */
        function getWorkMasters(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMaster',
                'options': options
            });
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
    }
})();
