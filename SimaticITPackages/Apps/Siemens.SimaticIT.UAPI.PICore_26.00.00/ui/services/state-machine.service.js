/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.stateMachineConstants', stateMachineConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.stateMachineService', stateMachineService);

    function stateMachineConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'Status'
            }
        };
    }

    stateMachineService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.stateMachineConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name stateMachineService
     *
     * @requires $rootElement
     *
     * @description
     * The state machine service expose methods to manage status and status transition entity and related objects relevant for Process Industries.
     */
    function stateMachineService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.stateMachineService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getworkOrderVerb = getworkOrderVerb;
            vm.getwStateMachinByNId = getwStateMachinByNId;
            vm.getVerbByStatus = getVerbByStatus;
            vm.updateWorkOrderStatus = updateWorkOrderStatus;
            vm.updateWorkOrderOperationStatus = updateWorkOrderOperationStatus;
        }


        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of status.
         * @param {object} options Contains the entity and options (oData query string) to query.
         * @returns {object} the list of status.
         */
        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Bill of Materials that has the specified Material and Revision.
         * @param {object} options Contains the entity and options (oData query string) to query.
         * @returns {object} the list of Bill of Materials.
         */
        function getwStateMachinByNId(statusMachine) {
            var options = '$filter=NId eq \'' + statusMachine + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'StateMachine',
                'options': options
            });
        }

        /**
    * @ngdoc function
    * @name getAll
    * @module Siemens.SimaticIT.UAPI.PICore
    *
    * @description Retrieves the list of Bill of Materials that has the specified Material and Revision.
    * @param {object} options Contains the entity and options (oData query string) to query.
    * @returns {object} the list of Bill of Materials.
    */
        function getworkOrderVerb(statusMachine) {
            var options = '$expand=StateMachine($select=Id,NId)$filter=NId eq \'' + statusMachine + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Status',
                'options': options
            });
        }

        /**
    * @ngdoc function
    * @name getAll
    * @module Siemens.SimaticIT.UAPI.PICore
    *
    * @description Retrieves the list of Bill of Materials that has the specified Material and Revision.
    * @param {object} options Contains the entity and options (oData query string) to query.
    * @returns {object} the list of Bill of Materials.
    */
        function getVerbByStatus(stateMachineNId, currentState) {
            var options = '$expand=SourceStatus($expand=StateMachine)&$filter=SourceStatus/NId eq \''
                + currentState + '\' and SourceStatus/StateMachine/NId eq \'' + stateMachineNId + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'StatusTransition',
                'options': options
            });
        }

        /**
      * @ngdoc function
      * @name changeWorkOrderStatus
      * @module Siemens.SimaticIT.UAPI.PICore
      *
      * @description Updates status related to a specific WorkOrder.
      * @param {object} fields the object that contains the information to update the status for the required WorkOrder.
      */
        function updateWorkOrderStatus(fields) {
            var params = {
                'Id': fields.workOrderId,
                'Verb': fields.Verb
            };
            return execCommand('SetWorkOrderStatus', params);
        }

        /**
     * @ngdoc function
     * @name updateWorkOrderOperationStatus
     * @module Siemens.SimaticIT.UAPI.PICore
     *
     * @description Updates status related to a specific WorkOrder Operation.
     * @param {object} fields the object that contains the information to update the status for the required WorkOrder Operation.
     */
        function updateWorkOrderOperationStatus(fields) {
            var params = {
                'Id': fields.Id,
                'Verb': fields.Verb
            };
            return execCommand('SetWorkOrderOperationStatus', params);
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
