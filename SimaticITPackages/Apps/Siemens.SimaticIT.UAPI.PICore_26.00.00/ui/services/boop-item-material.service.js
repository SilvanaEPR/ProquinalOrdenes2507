/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.boopItemMaterialConstants', boopItemMaterialConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.boopItemMaterialService', boopItemMaterialService);

    function boopItemMaterialConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'OperationMaterialSpecification'
            }
        };
    }

    boopItemMaterialService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.boopItemMaterialConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name boopItemMaterialService
     *
     * @requires $rootElement
     *
     * @description
     * The Bill of Operations Item Material service expose methods to manage Bill of Operations Item Material Specifications entity
     and related objects relevant for Process Industries.
     */
    function boopItemMaterialService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.boopItemMaterialService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getBoOpItemsById = getBoOpItemsById;
            vm.getOperationMaterialSpecificationDirection = getOperationMaterialSpecificationDirection;
            vm.getOperationMaterialSpecificationUsage = getOperationMaterialSpecificationUsage;
            vm.deleteBoOpItemMaterialSpec = deleteBoOpItemMaterialSpec;
            vm.addFromMaterial = addFromMaterial;
            vm.addFromBoM = addFromBoM;
            vm.updateMaterial = updateMaterial;
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Bill of Operation Item Material Specifications.
         * @param {object} options Contains the entity and options (oData query string) to query.
         * @returns {object} the list of Bill of Operation Item Material Specifications.
         */
        function getAll(options) {
            return execGetAll(options);
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

        /**
         * @ngdoc function
         * @name getOperationMaterialSpecificationDirection
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of directions for a given Operation Material Specification.
         * @returns {object} the list of directions.
         */
        function getOperationMaterialSpecificationDirection() {
            var options = '';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'OperationMaterialSpecificationDirection',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getOperationMaterialSpecificationUsage
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of usages for a given Operation Material Specification.
         * @returns {object} the list of usages.
         */
        function getOperationMaterialSpecificationUsage() {
            var options = '';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'OperationMaterialSpecificationUsage',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name deleteBoOpItemMaterialSpec
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific Bill of Operation Item Material Specification.
         * @param {string} id the identifier of the Bill of Operation Item Material Specification to delete.
         *
         */
        function deleteBoOpItemMaterialSpec(id) {
            var params = { Id: id };
            return execCommand('DeleteOperationMaterialSpecification', params);
        }

        /**
         * @ngdoc function
         * @name addFromMaterial
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Adds a specific Bill of Operation Item Material Specification from an existing Material.
         * @param {object} the object contains of the Bill of Operation Item Material Specification to add.
         *
         */
        function addFromMaterial(cmdParams) {
            var param = {
                WorkMasterId: cmdParams.WorkMasterId,
                BoOpItemNId: cmdParams.BoOpItemNId,
                BoOpNId: cmdParams.BoOpNId ? cmdParams.BoOpNId : undefined,
                BoOpRevision: cmdParams.BoOpRevision ? cmdParams.BoOpRevision : undefined,
                MaterialNId: cmdParams.MaterialNId,
                MaterialRevision: cmdParams.MaterialRevision,
                Quantity: cmdParams.Quantity,
                Sequence: cmdParams.Sequence,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                Usage: cmdParams.Usage ? cmdParams.Usage : undefined,
                Direction: cmdParams.Direction ? cmdParams.Direction : undefined
            };
            return execCommand('AddOperationMaterialSpecificationToWorkMasterFromMaterial', param);
        }

        /**
         * @ngdoc function
         * @name addFromBoM
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Adds a specific Bill of Operation Item Material Specification from an existing Bill of Material.
         * @param {object} the object contains of the Bill of Operation Item Material Specification to add.
         *
         */
        function addFromBoM(cmdParams) {
            var param = {
                WorkMasterId: cmdParams.WorkMasterId,
                BoOpItemNId: cmdParams.BoOpItemNId,
                BoOpNId: cmdParams.BoOpNId ? cmdParams.BoOpNId : undefined,
                BoOpRevision: cmdParams.BoOpRevision ? cmdParams.BoOpRevision : undefined,
                BoMItemNId: cmdParams.BoMItemNId,
                BoMNId: cmdParams.BoMNId,
                BoMRevision: cmdParams.BoMRevision ? cmdParams.BoMRevision : undefined,
                Sequence: cmdParams.Sequence,
                Quantity: cmdParams.Quantity ? cmdParams.Quantity : undefined,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                Usage: cmdParams.Usage ? cmdParams.Usage : undefined,
                Direction: cmdParams.Direction ? cmdParams.Direction : undefined
            };
            return execCommand('AddOperationMaterialSpecificationToWorkMasterFromBoM', param);
        }

        /**
         * @ngdoc function
         * @name updateMaterial
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Updates a specific Bill of Operation Item Material Specification.
         * @param {string} Id the identifier of the Bill of Operation Item Material Specification to update.
         * @param {string} quantity the Material quantity to update.
         * @param {string} sequence the Material sequence to update.
         * @param {string} uomnid the Material quantity uom to update.
         *
         */
        function updateMaterial(cmdParams) {
            var param = {
                Id: cmdParams.Id,
                Quantity: cmdParams.Quantity ? cmdParams.Quantity : undefined,
                Sequence: (cmdParams.Sequence !== null || cmdParams.Sequence !== undefined) ? cmdParams.Sequence : undefined,
                UoMNId: cmdParams.UoMNId ? cmdParams.UoMNId : undefined,
                Usage: cmdParams.Usage,
                Direction: cmdParams.Direction
            };
            return execCommand('UpdateOperationMaterialSpecification', param);
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
