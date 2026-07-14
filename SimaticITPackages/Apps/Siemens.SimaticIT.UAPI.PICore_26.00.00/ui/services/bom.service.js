/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.bomConstants', bomConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.bomService', bomService);

    function bomConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'BillOfMaterialsItem'
            }
        };
    }

    bomService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.bomConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name bomService
     *
     * @requires $rootElement
     *
     * @description
     * The Bill of Material service expose methods to manage Bill of Material entity and related objects relevant for Process Industries.
     */
    function bomService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.bomService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getBillOfMaterialExtendedByMaterial = getBillOfMaterialExtendedByMaterial;
            vm.createBillOfMaterialsExtended = createBillOfMaterialsExtended;
            vm.deleteBillOfMaterialsExtended = deleteBillOfMaterialsExtended;
        }


        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Bill of Materials.
         * @param {object} options Contains the entity and options (oData query string) to query.
         * @returns {object} the list of Bill of Material.
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
        function getBillOfMaterialExtendedByMaterial(materialName, materialRevision) {
            var options = '$filter=MaterialNId eq \'' + materialName + '\' and MaterialRevision eq \'' + materialRevision + '\'&$expand=BillOfMaterials';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'BillOfMaterialsExtended',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name createBillOfMaterialsExtended
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Adds the Material information to a Bill of Materials.
         * @param {string} bomId The identifier of the Bill of Materials.
         * @param {string} materialNId The natural identifier of the Material.
         * @param {string} materialRevision The revision of the Material.
         * @param {string} materialGroupNId The natural identifier of the MaterialGroup
         * @returns {object} The identifier of the association.
         */
        function createBillOfMaterialsExtended(bomId, materialNId, materialRevision, materialGroupNId) {
            var params = {
                BoMId: bomId,
                MaterialNId: materialNId,
                MaterialRevision: materialRevision,
                MaterialGroupNId: materialGroupNId
            };
            return execCommand('CreateBillOfMaterialsExtended', params);
        }
        /**
         * @ngdoc function
         * @name deleteBillOfMaterialsExtended
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Removes the Material information to a Bill of Materials.
         * @param {string} bomId The identifier of the Bill of Materials.
         */
        function deleteBillOfMaterialsExtended(bomId) {
            var params = {
                BoMId: bomId
            };
            return execCommand('DeleteBillOfMaterialsExtended', params);
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
