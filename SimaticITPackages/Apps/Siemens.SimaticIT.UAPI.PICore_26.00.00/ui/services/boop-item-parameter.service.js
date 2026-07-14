/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.boopItemParametersConstants', boopItemParametersConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.boopItemParametersService', boopItemParametersService);

    function boopItemParametersConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'OperationParameterSpecification'
            }
        };
    }

    boopItemParametersService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.boopItemParametersConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name boopItemParametersService
     *
     * @requires $rootElement
     *
     * @description
     * The Bill of Operations Item Parameters service expose methods to manage Bill of Operations Item Parameter entity
     and related objects relevant for Process Industries.
     */
    function boopItemParametersService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.boopItemParametersService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.deleteOperationParameterSpecification = deleteOperationParameterSpecification;
            vm.getBoOpItemsById = getBoOpItemsById;
            vm.updateOperationParameterSpecification = updateOperationParameterSpecification;
            vm.addOperationParameterSpecificationsToWorkMasterFromCatalogue = addOperationParameterSpecificationsToWorkMasterFromCatalogue;
            //vm.getWorkProceduresByRevisionedOperation = getWorkProceduresByRevisionedOperation;
            //vm.getWorkProceduresItemsByWorkProcedure = getWorkProceduresItemsByWorkProcedure;
            //vm.associateTaskDefinitionParameterWithOperationParameterSpecification = associateTaskDefinitionParameterWithOperationParameterSpecification;
            vm.getBoOpItemByParamId = getBoOpItemByParamId;
            vm.getBoOpItemByNId = getBoOpItemByNId;
            vm.getBoOpItemByNIdAndBoOp = getBoOpItemByNIdAndBoOp;
            vm.getTaskDefinitionIdByRevisionedTaskDefinition = getTaskDefinitionIdByRevisionedTaskDefinition;
            vm.getCurrentTaskDefinitionIdByTaskDefinitionNId = getCurrentTaskDefinitionIdByTaskDefinitionNId;
            //vm.disassociateTaskDefinitionParameterFromOperationParameterSpecification = disassociateTaskDefinitionParameterFromOperationParameterSpecification;
        }

        /**
         * @ngdoc function
         * @name disassociateTaskDefinitionParameterFromOperationParameterSpecification
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to remove the association beyween a specific bill of operations item parameter specification and a task definition parameter
         * @param {object} OperationParameterSpecificationId the identifier of the bill of operations item parameter specification to be disassociated.
         */
        //function disassociateTaskDefinitionParameterFromOperationParameterSpecification(OperationParameterSpecificationId) {
        //    var params = {
        //        OperationParameterSpecificationId: OperationParameterSpecificationId
        //    };
        //    return execCommand('DisassociateTaskDefinitionParameterFromOperationParameterSpecification', params);
        //}

        /**
         * @ngdoc function
         * @name associateTaskDefinitionParameterWithOperationParameterSpecification
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to associate a specific bill of operations item parameter specification to a task definition parameter identified
         by its natural identifier, the natural identifier of task definition to which it belongs, the revision of task definition to which it belongs,
         the natural identifier and the revision of the work procedure to which the task definition belongs and the sequence order
         the task definition occupy in the work procedure.
         * @param {object} cmdParams the parameter needed by the command.
         */
        //function associateTaskDefinitionParameterWithOperationParameterSpecification(cmdParams) {
        //    var params = {
        //        OperationParameterSpecificationId: cmdParams.OperationParameterSpecificationId,
        //        TaskDefinitionNId: cmdParams.TaskDefinitionNId,
        //        TaskDefinitionRevision: cmdParams.TaskDefinitionRevision,
        //        TaskDefinitionParameterNId: cmdParams.TaskDefinitionParameterNId,
        //        WorkProcedureNId: cmdParams.WorkProcedureNId,
        //        WorkProcedureRevision: cmdParams.WorkProcedureRevision,
        //        WorkProcedureItemSequence: cmdParams.WorkProcedureItemSequence
        //    };
        //    return execCommand('AssociateTaskDefinitionParameterWithOperationParameterSpecification', params);
        //}

        /**
         * @ngdoc function
         * @name getBoOpItemByParamId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the bill of operations item given a bill of operations item parameter.
         * @param {string} boOpItemParamId, the identifier of the bill of operations item parameter.
         * @returns {object} the bill of operations item.
         */
        function getBoOpItemByParamId(boOpItemParamId) {
            var options = '$filter=Id eq ' + boOpItemParamId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'OperationParameterSpecification',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getTaskDefinitionIdByRevisionedTaskDefinition
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the task definition given its natural identifier and its revision.
         * @param {string} tdNId, the natural identifier of the task definition.
		 * @param {string} tdRev the revision of the task definition.
         * @returns {object} the task definition.
         */
        function getTaskDefinitionIdByRevisionedTaskDefinition(tdNId, tdRev) {
            var options = '$filter=NId eq \'' + tdNId + '\' and Revision eq \'' + tdRev + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'TaskDefinition',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getCurrentTaskDefinitionIdByTaskDefinitionNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the task definition in current revision given its natural identifier.
         * @param {string} tdNId, the natural identifier of the task definition.
         * @returns {object} the task definition in current version.
         */
        function getCurrentTaskDefinitionIdByTaskDefinitionNId(tdNId) {
            var options = '$filter=NId eq \'' + tdNId + '\' and IsCurrent eq ' + true;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'TaskDefinition',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getBoOpItemByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the bill of operations item given a bill of operations item natural identifier.
         * @param {string} boOpItemParamId, the identifier of the bill of operations item parameter.
         * @returns {object} the bill of operations item.
         */
        function getBoOpItemByNId(boOpItemNId) {
            var options = '$filter=NId eq \'' + boOpItemNId + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperationsItem',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getBoOpItemByNIdAndBoOp
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {string} boOpItemNId the natural identifier of the bill of operations item.
         * @param {string} boOpNId the natural identifier of the bill of operations.
         * @param {string} boOpRevision the revision of the bill of operations.
         * @returns {object} the bill of operations item.
         */
        function getBoOpItemByNIdAndBoOp(boOpItemNId, boOpNId, boOpRevision) {
            var options;
            if (boOpRevision !== undefined && boOpRevision !== null && boOpRevision.length > 0) {
                options = '$expand=BillOfOperations&$filter=NId eq \'' + boOpItemNId + '\' and BillOfOperations/NId eq \''
                    + boOpNId + '\' and BillOfOperations/Revision eq \'' + boOpRevision + '\'';
            } else {
                options = '$expand=BillOfOperations&$filter=NId eq \'' + boOpItemNId + '\' and BillOfOperations/NId eq \''
                    + boOpNId + '\' and BillOfOperations/IsCurrent eq true';
            }

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperationsItem',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getWorkProceduresByRevisionedOperation
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the work procedures of a given operation.
         * @param {string} boOpItemOpNId, the natural identifier of the operation.
		 * @param {string} boOpItemOpRev the revision of operation.
         * @returns {object} the work procedures of the given operation.
         */
        //function getWorkProceduresByRevisionedOperation(boOpItemOpNId, boOpItemOpRev) {
        //    var options = '$filter=NId eq \'' + boOpItemOpNId + '\'&Revision eq \''
        //        + boOpItemOpRev + '\'&$expand=WorkProcedures($select='
        //        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.OperationToWorkProcedure/WorkProcedureNId,'
        //        + 'Siemens.SimaticIT.UAPI.PICore.PICore.PIPOMModel.DataModel.ReadingModel.OperationToWorkProcedure/WorkProcedureRevision)';
        //    return backendService.findAll({
        //        'appName': context.data.appName,
        //        'entityName': 'Operation',
        //        'options': options
        //    });
        //}

        /**
         * @ngdoc function
         * @name getWorkProceduresItemsByWorkProcedure
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the work procedure items of a given work procedure.
         * @param {string} wpNId, the natural identifier of the work procedure.
		 * @param {string} wprev the revision of work procedure.
         * @returns {object} the work procedure items of the given work procedure.
         */
        //function getWorkProceduresItemsByWorkProcedure(wpNId, wprev) {
        //    var options = '$filter=NId eq \'' + wpNId + '\'&Revision eq \'' + wprev + '\'&$expand=WorkProcedureItems';
        //    return backendService.findAll({
        //        'appName': context.data.appName,
        //        'entityName': 'WorkProcedure',
        //        'options': options
        //    });
        //}


        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name updateOperationParameterSpecification
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to update the value of a specific operation parameter specification.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function updateOperationParameterSpecification(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                ParameterTargetValue: cmdParams.ParameterTargetValue
                //,
                //ParameterUoMNId: cmdParams.ParameterUoMNId
            };
            return execCommand('UpdateOperationParameterSpecification', params);
        }

        /**
         * @ngdoc function
         * @name addOperationParameterSpecificationsToWorkMasterFromCatalogue
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Adds a set of process parameters, selcted from a catalogue, to a work master procedure item that is specified by the bill of operations item.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function addOperationParameterSpecificationsToWorkMasterFromCatalogue(cmdParams) {
            var params = {
                WorkMasterId: cmdParams.WorkMasterId,
                OperationParameterSpecifications: cmdParams.OperationParameterSpecifications
            };
            return execCommand('AddOperationParameterSpecificationsToWorkMasterFromCatalogue', params);
        }


        /**
         * @ngdoc function
         * @name deleteOperationParameterSpecification
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific operation parameter specification.
         * @param {string} operationParameterSpecificationId the identifier of the operation parameter specification to delete.
         */
        function deleteOperationParameterSpecification(operationParameterSpecificationId) {
            var params = { Id: operationParameterSpecificationId };
            return execCommand('DeleteOperationParameterSpecification', params);
        }

        /**
         * @ngdoc function
         * @name getBoOpItemsById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information of a given Bill of Operations Item.
         * @param {string} boOpItemId the identifier of the bill of operations item.
         * @returns {object} the information related to the specified bill of operations item.
         */
        function getBoOpItemsById(boOpItemId) {
            var options = '$filter=Id eq ' + boOpItemId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperationsItem',
                'options': options
            });
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
    }
})();
