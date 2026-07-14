/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.workMasterHeaderParametersConstants', workMasterHeaderParametersConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.workMasterHeaderParametersService', workMasterHeaderParametersService);

    function workMasterHeaderParametersConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'WorkMasterHeaderParameter'
            }
        };
    }

    workMasterHeaderParametersService.$inject = ['$q',
        '$state',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.workMasterHeaderParametersConstants',
        'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name workMasterHeaderParametersService
     *
     * @requires $rootElement
     *
     * @description
     * The workMasterHeaderParametersService service expose methods to manage Work Master Header Parameter entity and related objects relevant for Process Industries.
     */
    function workMasterHeaderParametersService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.workMasterHeaderParametersService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.deleteWorkMasterHeaderParameter = deleteWorkMasterHeaderParameter;
            vm.getWorkMasterById = getWorkMasterById;
            vm.createCatalogueParameter = createCatalogueParameter;
            vm.addProcessParametersToWorkMasterHeader = addProcessParametersToWorkMasterHeader;
            vm.getUoMs = getUoMs;
            vm.updateWorkMasterHeaderParameter = updateWorkMasterHeaderParameter;
        }


        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name updateWorkMasterHeaderParameter
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to update the value of a specific work master header parameter.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function updateWorkMasterHeaderParameter(cmdParams) {
            var params = {
                Id: cmdParams.Id,
                ParameterTargetValue: cmdParams.ParameterTargetValue
            };
            return execCommand('UpdateWorkMasterHeaderParameter', params);
        }

        /**
         * @ngdoc function
         * @name addProcessParametersToWorkMasterHeader
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Associates a list of catalog parameters to a given work master.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function addProcessParametersToWorkMasterHeader(cmdParams) {
            var params = {
                WorkMasterId: cmdParams.WorkMasterId,
                ProcessParameters: cmdParams.ProcessParameters
            };
            return execCommand('AddProcessParametersToWorkMasterHeader', params);
        }

        /**
         * @ngdoc function
         * @name createCatalogueParameter
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Creates a catalog parameter.
         * @param {object} cmdParams the parameter needed by the command.
         */
        function createCatalogueParameter(cmdParams) {
            var params = {
                ParameterNId: cmdParams.ParameterNId,
                ParameterName: cmdParams.ParameterName,
                ParameterDescription: cmdParams.ParameterDescription,
                ParameterType: cmdParams.ParameterType,
                ParameterTargetValue: cmdParams.ParameterTargetValue,
                ParameterUoMNId: cmdParams.ParameterUoMNId
            };
            return execCommand('CreateCatalogueParameter', params);
        }


        /**
         * @ngdoc function
         * @name deleteWorkMasterHeaderParameter
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific material tracking unit.
         * @param {string} workMasterHeaderParameterId the identifier of the work master header parameter to delete.
         */
        function deleteWorkMasterHeaderParameter(workMasterHeaderParameterId) {
            var params = { Id: workMasterHeaderParameterId };
            return execCommand('DeleteWorkMasterHeaderParameter', params);
        }

        /**
         * @ngdoc function
         * @name getWorkMasterById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information of a given workmaster.
         * @param {string} workMasterId the identifier of the work master.
         * @returns {object} the information related to the specified work master.
         */
        function getWorkMasterById(workMasterId) {
            var options = '$filter=Id eq ' + workMasterId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkMaster',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getUoMs
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves all unit of measures.
         * @returns {object} the information related to the specified unit of measure.
         */
        function getUoMs(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'UoM',
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
