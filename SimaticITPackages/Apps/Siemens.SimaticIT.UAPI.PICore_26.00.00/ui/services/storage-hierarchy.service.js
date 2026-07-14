/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
		.constant('Siemens.SimaticIT.UAPI.PICore.storageHierarchyConstants', StorageHierarchyConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.storageHierarchyService', StorageHierarchyService);

    function StorageHierarchyConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'StorageHierarchy'
            }
        };
    }

    StorageHierarchyService.$inject = [
		'$q',
		'$state',
		'common.base',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
		'Siemens.SimaticIT.UAPI.PICore.storageHierarchyConstants',
		'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name StorageHierarchyService
     *
     * @requires $rootElement
     *
     * @description
     * The StorageHierarchyService service expose methods to manage Storage Hierarchy entity and related objects relevant for Process Industries.
     */
    function StorageHierarchyService(
		$q,
		$state,
		base,
        commonService,
		context,
		loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.storageHierarchyService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getEquipmentById = getEquipmentById;
            vm.getEquipmentByNId = getEquipmentByNId;
            vm.getEquipmentGraphNodeByEquipmentGraphNodeConfigurationId = getEquipmentGraphNodeByEquipmentGraphNodeConfigurationId;
            vm.getStorageHierarchyById = getStorageHierarchyById;
            vm.getEquipmentGraphConfigurationByNId = getEquipmentGraphConfigurationByNId;
            vm.getStorageHierarchyEquipmentContent = getStorageHierarchyEquipmentContent;
            vm.getStorageHierarchyEquipmentMtuList = getStorageHierarchyEquipmentMtuList;
            vm.getStorageHierarchyEquipmentMaterialLotList = getStorageHierarchyEquipmentMaterialLotList;
            vm.getHierarchyTree = getHierarchyTree;
            vm.getHierarchyTreeOnDemand = getHierarchyTreeOnDemand;
            vm.addEquipmentConfigurationPropertiesToStorageHierarchy = addEquipmentConfigurationPropertiesToStorageHierarchy;
            vm.createStorageHierarchy = createStorageHierarchy;
            vm.updateStorageHierarchy = updateStorageHierarchy;
            vm.deleteStorageHierarchy = deleteStorageHierarchy;
        }

        function getAll(options) {
            return execGetAll(options);
        }


        /**
         * @ngdoc function
		 * @name getStorageHierarchyById
		 * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {String} storageHierarchyId
         * @returns {object} The Storage Hierarchy entity
         */
        function getStorageHierarchyById(storageHierarchyId) {
            return execGetAll('$filter=Id eq ' + storageHierarchyId);
        }

        /**
         * @ngdoc function
         * @name getEquipmentGraphNodeByEquipmentGraphNodeConfigurationId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {string} equipmentGraphNodeConfigurationId
         * @returns {object} The Equipment Graph Node entity
         */
        function getEquipmentGraphNodeByEquipmentGraphNodeConfigurationId(equipmentGraphNodeConfigurationId) {
            return execGetAllEntity('EquipmentGraphNode', '$filter=EquipmentGraphNodeConfigurationId eq ' + equipmentGraphNodeConfigurationId);
        }

        /**
         * @ngdoc function
		 * @name getEquipmentGraphConfigurationByNId
		 * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {String} equipmentGraphConfigurationNId
         * @returns {object} The Equipment Graph Configuration entity
         */
        function getEquipmentGraphConfigurationByNId(equipmentGraphConfigurationNId) {
            return execGetAllEntity('EquipmentGraphConfiguration', '$filter=NId eq \'' + equipmentGraphConfigurationNId + '\'');
        }

        /**
         * @ngdoc function
		 * @name getEquipmentById
		 * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {String} equipmentId
         * @returns {object} The Equipment entity
         */
        function getEquipmentById(equipmentId) {
            return execGetAllEntity('Equipment', '$filter=Id eq ' + equipmentId);
        }

        /**
         * @ngdoc function
         * @name getEquipmentByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @param {String} equipmentNId
         * @returns {object} The Equipment entity
         */
        function getEquipmentByNId(equipmentNId) {
            var temp = equipmentNId.split('+').join('%2B');
            temp = temp.split('/').join('%2F');
            temp = temp.split('?').join('%3F');
            temp = temp.split('%').join('%25');
            temp = temp.split('#').join('%23');
            temp = temp.split('&').join('%26');
            return execGetAllEntity('Equipment', '$filter=NId eq \'' + temp + '\'');
        }

        /**
		* @ngdoc function
		* @name getStorageHierarchyEquipmentContent
		* @module Siemens.SimaticIT.UAPI.PICore
		*
		* @description given the identifier of a StorageHierarchy and a piece of Equipment retrieves its content.
		* @param {object} cmdParams The reading function input
        * @param {string} readingFunctionName The reading function to be called
		* @returns {object} Quantity The sum of all the quantitties of the MTUs contained in the piece of Equipment
		* @returns {object} StorageHierarchyEquipmentContents The content of the piece of Equipment in terms of MTUs and/or Material Lots
		*/
        function getStorageHierarchyEquipmentContent(cmdParams, readingFunctionName) {
            var params = {
                StorageHierarchyNId: cmdParams.StorageHierarchyNId,
                EquipmentNId: cmdParams.EquipmentNId,
                ReferenceUoMNId: cmdParams.ReferenceUoMNId,
                IncludeChildren: cmdParams.IncludeChildren
            };
            return execRead(readingFunctionName, params, '');
        }

        /**
        * @ngdoc function
        * @name getStorageHierarchyEquipmentMtuList
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description given the identifier of a StorageHierarchy and a piece of Equipment retrieves its content in terms of MTUs.
       * @param {object} cmdParams The reading function input
       * @param {string} readingFunctionName The reading function to be called
        * @returns {object} The content of the piece of Equipment in terms of MTUs
        */
        function getStorageHierarchyEquipmentMtuList(cmdParams, readingFunctionName, options) {
            var params = {
                StorageHierarchyNId: cmdParams.StorageHierarchyNId,
                EquipmentNId: cmdParams.EquipmentNId,
                IncludeChildren: cmdParams.IncludeChildren
            };
            return execRead(readingFunctionName, params, options);
        }

        /**
        * @ngdoc function
        * @name getStorageHierarchyEquipmentMaterialLotList
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description given the identifier of a StorageHierarchy and a piece of Equipment retrieves its content in terms of Material Lots.
       * @param {object} cmdParams The reading function input
       * @param {string} readingFunctionName The reading function to be called
        * @returns {object} The content of the piece of Equipment in terms of Material Lots
        */
        function getStorageHierarchyEquipmentMaterialLotList(cmdParams, readingFunctionName, options) {
            var params = {
                StorageHierarchyNId: cmdParams.StorageHierarchyNId,
                EquipmentNId: cmdParams.EquipmentNId,
                IncludeChildren: cmdParams.IncludeChildren
            };
            return execRead(readingFunctionName, params, options);
        }

        /**
        * @ngdoc function
        * @name getHierarchyTree
        * @module Siemens.SimaticIT.Equipment
        *
        * @description given the identifier of a EquipmentGraphConfiguration retrieves its hierarchy.
        * @param {object} cmdParams The reading function input
        * @returns {object} the hierarchy relative to selected EquipmentGraphConfiguration.
        */
        function getHierarchyTree(cmdParams) {
            var params = {
                EquipmentGraphConfigurationId: cmdParams.EquipmentGraphConfigurationId,
                ParentEquipmentNodeNId: '',
                ReturnOneLevel: cmdParams.ReturnOneLevel
            };
            return execRead('RF_GetEquipmentHierarchy', params, '');
        }

        /**
        * @ngdoc function
        * @name getHierarchyTreeOnDemand
        * @module Siemens.SimaticIT.Equipment
        *
        * @description given the identifier of a EquipmentGraphConfiguration retrieves its hierarchy.
        * @param {object} cmdParams The reading function input
        * @returns {object} the hierarchy relative to selected EquipmentGraphConfiguration.
        */
        function getHierarchyTreeOnDemand(cmdParams) {
            var params = {
                EquipmentGraphConfigurationId: cmdParams.EquipmentGraphConfigurationId,
                ParentEquipmentNodeNId: cmdParams.ParentEquipmentNodeNId,
                ReturnOneLevel: true
            };
            return execRead('RF_GetEquipmentHierarchy', params, '');
        }

        /**
         * @ngdoc function
         * @name addEquipmentConfigurationPropertiesToStorageHierarchy
         * @module Siemens.SimaticIT.Equipment
         *
         * @param {object} cmdParams The command input
         * @returns {object} The command response
         */
        function addEquipmentConfigurationPropertiesToStorageHierarchy(cmdParams) {
            return execCommand('AddEquipmentConfigurationPropertiesToStorageHierarchy', cmdParams);
        }

        /**
         * @ngdoc function
         * @name createStorageHierarchy
         * @module Siemens.SimaticIT.PICore
         *
         * @param {object} cmdParams The command input
         * @returns {object} The command response
         */
        function createStorageHierarchy(cmdParams) {
            return execCommand('CreateStorageHierarchy', cmdParams);
        }

        /**
         * @ngdoc function
         * @name updateStorageHierarchy
         * @module Siemens.SimaticIT.PICore
         *
         * @param {object} cmdParams The command input
         * @returns {object} The command response
         */
        function updateStorageHierarchy(cmdParams) {
            return execCommand('UpdateStorageHierarchy', cmdParams);
        }

        /**
         * @ngdoc function
         * @name deleteStorageHierarchy
         * @module Siemens.SimaticIT.PICore
         *
         * @param {object} cmdParams The command input
         * @returns {object} The command response
         */
        function deleteStorageHierarchy(cmdParams) {
            return execCommand('DeleteStorageHierarchy', cmdParams);
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

        function execRead(publicName, params, options) {
            logger.logDebug('Executing reading function.......', publicName);
            var newOptions = options;
            if (options && options.length > 0) {
                newOptions = commonService.parseFindAllQueryString(options);
            }
            return backendService.read({
                'appName': context.data.appName,
                'functionName': publicName,
                'params': params,
                'options': newOptions
            });
        }
    }
})();
