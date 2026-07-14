/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.behaviorConstants', BehaviorConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.behaviorservice', BehaviorService);

    function BehaviorConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'MaterialBehaviorType'
            }
        };
    }

    BehaviorService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.behaviorConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name BehaviorService
     *
     * @requires $rootElement
     *
     * @description
     * The BehaviorService service expose methods to manage Material behavior type entity and related objects relevant for Process Industries.
     */
    function BehaviorService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.behaviorservice');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getMaterialBehaviorTypes = getMaterialBehaviorTypes;
            vm.getEquipmentMaterialBehavior = getEquipmentMaterialBehavior;
            vm.getLocationByEquipmentNId = getLocationByEquipmentNId;
            vm.createMaterialBehavior = createMaterialBehavior;
            vm.deleteMaterialBehavior = deleteMaterialBehavior;
            vm.getEquipmentById = getEquipmentById;
        }


        function getAll(options) {
            return execGetAll(options);
        }


        /**
         * @ngdoc function
         * @name getEquipmentMaterialBehavior
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material behavior of the given equipment, if any.
         * @param {string} equipment the equipment whose material behavior is to be found.
         * @returns {object} the material behavior found by the query.
         */
        function getEquipmentMaterialBehavior(equipment) {
            var query = '$filter=EquipmentNId eq \'' + equipment + '\'' + '&$expand=MaterialBehaviorType($select=NId)';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MaterialBehavior',
                'options': query
            });
        }

        /**
         * @ngdoc service
         * @name getEquipmentById
         * @module Siemens.SimaticIT.UAPI.PICore
         * @param {string} eqipmentId the  identifier of the equipment.
         * @description Retrieves equipment related information.
         * @returns {object} the Equipment information found by the query.
         */
        function getEquipmentById(eqipmentId) {
            var options = '$filter=Id eq ' + eqipmentId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Equipment',
                'options': options
            });
        }

        /**
         * @ngdoc service
         * @name getLocationByEquipmentNId
         * @module Siemens.SimaticIT.UAPI.PICore
         * @param {string} eqipmentNId the natural identifier of the equipment.
         * @description Retrieves equipments related information.
         * @returns {object} the Equipment information found by the query.
         */
        function getLocationByEquipmentNId(eqipmentNId) {
            var options = '$filter=NId eq \'' + eqipmentNId + '\'';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Equipment',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMaterialBehaviorTypes
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves all material behaviors types.
         * @param {string} options the OData query options.
         * @returns {object} the material behavior types found by the query.
         */
        function getMaterialBehaviorTypes(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MaterialBehaviorType',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name createMaterialBehavior
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Assigns a material behavior type to equipment or location.
         * @param {string} cmdParams the parameter needed by the command.
         * @returns {object} the identifier of the association.
         */
        function createMaterialBehavior(cmdParams) {
            var params = {
                EquipmentNId: cmdParams.EquipmentNId,
                MaterialBehaviorType: cmdParams.MaterialBehaviorType
            };
            return execCommand('CreateMaterialBehavior', params);
        }


        /**
         * @ngdoc function
         * @name deleteMaterialBehavior
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Removes a material behavior type previously assigned to an equipment or location.
         * @param {string} cmdParams the parameter needed by the command.

         */
        function deleteMaterialBehavior(cmdParams) {
            var params = {
                MaterialBehaviorId: cmdParams.MaterialBehaviorId
            };
            return execCommand('DeleteMaterialBehavior', params);
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
