/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.boopItemEquipmentConstants', boopItemEquipmentConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.boopItemEquipmentService', boopItemEquipmentService);

    function boopItemEquipmentConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'OperationEquipmentSpecification'
            }
        };
    }

    boopItemEquipmentService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.boopItemEquipmentConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name boopItemEquipmentService
     *
     * @requires $rootElement
     *
     * @description
     * The Bill of Operations Item Equipment service expose methods to manage Bill of Operations Item Equipment Specifications entity
     and related objects relevant for Process Industries.
     */
    function boopItemEquipmentService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.boopItemEquipmentService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getBoOpItemsById = getBoOpItemsById;
            vm.deleteBoOpItemEquipmentSpec = deleteBoOpItemEquipmentSpec;
            vm.addFromEquipment = addFromEquipment;
            vm.changeSequence = changeSequence;
        }

        /**
        * @ngdoc function
        * @name changeSequence
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Deletes a given Work order Operation.
        * @param {string} Id the Operation Equipment Specification to be updated.
        * @param {int} sequence the new value to be assigned.
        */
        function changeSequence(param) {
            var params = {
                'Id': param.Id,
                'Sequence': param.Sequence
            };
            return execCommand('UpdateOperationEquipmentSpecification', params);
        }

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Bill of Operation Item Equipment Specifications.
         * @param {object} options Contains the entity and options (oData query string) to query.
         * @returns {object} the list of Bill of Operation Item Equipment Specifications.
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
         * @name deleteBoOpItemEquipmentSpec
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific Bill of Operation Item Equipment Specification.
         * @param {string} id the identifier of the Bill of Operation Item Equipment Specification to delete.
         *
         */
        function deleteBoOpItemEquipmentSpec(id) {
            var params = { Id: id };
            return execCommand('DeleteOperationEquipmentSpecification', params);
        }

        /**
         * @ngdoc function
         * @name addFromEquipment
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Adds a specific Bill of Operation Item Equipment Specification from an existing Equipment or Equipment Group.
         * @param {object} the object contains of the Bill of Operation Item Equipment Specification to add.
         *
         */
        function addFromEquipment(cmdParams) {
            var param = {
                WorkMasterId: cmdParams.WorkMasterId,
                'OperationEquipmentSpecifications': [{
                    BoOpItemNId: cmdParams.BoOpItemNId,
                    BoOpNId: cmdParams.BoOpNId,
                    BoOpRevision: cmdParams.BoOpRevision,
                    Sequence: cmdParams.Sequence,
                    EquipmentGroupNId: cmdParams.EquipmentGroupNId,
                    EquipmentNId: cmdParams.EquipmentNId
                }]
            };
            return execCommand('AddOperationEquipmentSpecificationsToWorkMaster', param);
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
