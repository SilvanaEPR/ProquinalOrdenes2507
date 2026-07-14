/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersConstants', workOrderHeaderParametersConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersService', workOrderHeaderParametersService);

    function workOrderHeaderParametersConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'WorkOrderHeaderParameter'
            }
        };
    }


    workOrderHeaderParametersService.$inject = ['$q',
        '$state',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersConstants',
        'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name workOrderHeaderParametersService
     *
     * @requires $rootElement
     *
     * @description
     * The workOrderHeaderParametersService service expose methods to manage Work Master Header Parameter entity and related objects relevant for Process Industries.
     */
    function workOrderHeaderParametersService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.workOrderHeaderParametersService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.UpdateProcessParameterToWorkOrderHeader = UpdateProcessParameterToWorkOrderHeader;
            vm.addProcessParametersToWorkOrderHeader = addProcessParametersToWorkOrderHeader;
            vm.deleteWorkOrderHeaderParameter = deleteWorkOrderHeaderParameter;
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of WorkOrder header parameters.
         * @param {object} options the object that contains the conditions to query WorkOrder header parameters.
         * @returns {object} the list of WorkOrder header parameters.
         */
        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name UpdateProcessParameterToWorkOrderHeader
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to update the value of a specific header parameter of a work order.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function UpdateProcessParameterToWorkOrderHeader(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                ParameterValue: cmdParams.ParameterTargetValue,
                ParameterLimitLow: cmdParams.ParameterLimitLow,
                ParameterToleranceLow: cmdParams.ParameterToleranceLow,
                ParameterToleranceHigh: cmdParams.ParameterToleranceHigh,
                ParameterLimitHigh: cmdParams.ParameterLimitHigh,
                ParameterActualValue: cmdParams.ParameterActualValue
            };
            return execCommand('UpdateProcessParameterToWorkOrderHeader', params);
        }

        /**
         * @ngdoc function
         * @name addProcessParametersToWorkOrderHeader
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description  Adds a set of process parameters, selected from a catalogue, to a work order.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function addProcessParametersToWorkOrderHeader(cmdParams) {
            var params = {
                Id: cmdParams.WorkOrderId,
                ProcessParameters: cmdParams.ProcessParameters
            };
            return execCommand('AddProcessParametersToWorkOrderHeader', params);
        }

        /**
         * @ngdoc function
         * @name DeleteWorkOrderHeaderParameter
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific Work Order Header parameter.
         * @param {string} woHeaderParameterId the identifier of the Work Order Header parameter to delete.
         */
        function deleteWorkOrderHeaderParameter(woHeaderParameterId) {
            var params = { Id: woHeaderParameterId };
            return execCommand('DeleteProcessParameterToWorkOrderHeader', params);
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
