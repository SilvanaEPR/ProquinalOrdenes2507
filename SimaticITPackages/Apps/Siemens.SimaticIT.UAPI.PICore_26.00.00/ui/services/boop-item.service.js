/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.boopItemConstants', boopItemConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.boOpItemService', boopItemService);

    function boopItemConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'BillOfOperations'
            }
        };
    }

    boopItemService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.boopItemParametersConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name boopItemService
     *
     * @requires $rootElement
     *
     * @description
     * The Bill of Operations Item service expose methods to manage Bill of Operations Item entity and related objects relevant for Process Industries.
     */
    function boopItemService($q, $state, base, context, loggerService) {
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
            vm.getBoOpItemsByBoOpId = getBoOpItemsByBoOpId;
            vm.getBoOpByNId = getBoOpByNId;
            vm.setBillOfOperationsItemIsInExecutionPropagation = setBillOfOperationsItemIsInExecutionPropagation;
            vm.unsetBillOfOperationsItemIsInExecutionPropagation = unsetBillOfOperationsItemIsInExecutionPropagation;
            vm.getBoOpItemById = getBoOpItemById;
            vm.getBoOpItemByOpAndRevision = getBoOpItemByOpAndRevision;
        }

        function getAll(options) {
            return execGetAll(options);
        }

        /**
        * @ngdoc function
        * @name setBillOfOperationsItemIsInExecutionPropagation
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description sets the IsInExecutionpropagation flag of the BillOfOperationsItems equal to TRUE.
        * @param {string} id The bill of operations item identifier.
        * @param {string} workMasterNId The work master natural identifier.
        * @param {string} workMasterRevision The work master revision.
        */
        function setBillOfOperationsItemIsInExecutionPropagation(id, workMasterNId, workMasterRevision) {
            var params = {
                Id: id,
                WorkMasterNId: workMasterNId,
                WorkMasterRevision: workMasterRevision
            };
            return execCommand('SetBillOfOperationsItemIsInExecutionPropagation', params);
        }

        /**
        * @ngdoc function
        * @name unsetBillOfOperationsItemIsInExecutionPropagation
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description sets the IsInExecutionpropagation flag of the BillOfOperationsItems equal to FALSE.
        * @param {string} id The bill of operations item identifier.
        * @param {string} workMasterNId The work master natural identifier.
        * @param {string} workMasterRevision The work master revision.
        */
        function unsetBillOfOperationsItemIsInExecutionPropagation(id, workMasterNId, workMasterRevision) {
            var params = {
                Id: id,
                WorkMasterNId: workMasterNId,
                WorkMasterRevision: workMasterRevision
            };
            return execCommand('UnsetBillOfOperationsItemIsInExecutionPropagation', params);
        }

        /**
         * @ngdoc function
         * @name getBoOpItemsByBoOpId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the Bill of Operations Items of a given Bill of Operations Item.
         * @param {string} boOpId the identifier of the bill of operations.
         * @returns {object} the information related to the specified bill of operations.
         */
        function getBoOpItemsByBoOpId(boOpId) {
            var options = '$filter=Id eq ' + boOpId + '';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperations',
                'options': options
            });
        }

        function getBoOpItemById(boopItemId){
            var options = '$filter=Id eq ' + boopItemId + '';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperationsItem',
                'options': options
            });
        }

        function getBoOpItemByOpAndRevision(Operation, Revision) {
            var options = '$filter=OperationNId eq \'' + Operation + '\' and OperationRevision eq \'' + Revision + '\'&$expand=BillOfOperations';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperationsItem',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getBoOpByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information of a given Bill of Operations in a specified revision.
         * @param {string} boOpNId the natural identifier of the bill of operations.
         * @param {string} boOpRev the revision of the given bill of operations.
         * @returns {object} the information related to the specified bill of operations.
         */
        function getBoOpByNId(boOpNId, boOpRev) {
            var options;
            if (boOpRev !== '') {
                options = '$filter=NId eq \'' + boOpNId + '\' and Revision eq \'' + boOpRev + '\'';
            } else {
                options = '$filter=NId eq \'' + boOpNId + '\' and IsCurrent eq ' + true;
            }
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfOperations',
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
