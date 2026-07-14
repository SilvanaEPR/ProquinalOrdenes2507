/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.extensionConstants', extensionConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.extensionService', ExtensionService);

    function extensionConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI'
            }
        };
    }

    ExtensionService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.extensionConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name ExtensionService
     *
     * @requires $rootElement
     *
     * @description
     * The ExtensionService service expose methods to manage extended entity and related objects relevant for Process Industries.
     */
    function ExtensionService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.extensionService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.createMtuExt = createMtuExt;
            vm.createWorkOrderExt = createWorkOrderExt;
            vm.updateMtuExt = updateMtuExt;
            vm.updateWorkOrderExt = updateWorkOrderExt;
            vm.getExtendedEntityById = getExtendedEntityById;
            vm.getExtendedFacetById = getExtendedFacetById;
        }

        /**
         * @ngdoc function
         * @name createMtuExt
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Creates a new material tracking unit in the system.
         * @param {object} fields the information of the material tracking unit to be created.
         * @returns {params} the information of the created material tracking unit.
         */
        function createMtuExt(cmdName, fields, customFields) {
            var params = {
                'NId': fields.NId,
                'Name': fields.Name,
                'Description': fields.Description,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'MaterialLotNId': fields.MaterialLot === undefined ? fields.MaterialLot : fields.MaterialLot.id,
                //'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },
                'EquipmentNId': fields.Places.FieldName === 'Equipment' ? fields.Places.FieldValue : undefined
            };
            Object.assign(params, customFields);
            return execCommand(cmdName, params);
        }

        /**
         * @ngdoc function
         * @name createWorkOrderExt
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Creates a new Work Order Custom Extension.
         * @param {object} fields the information of the work order to be created.
         * @returns {params} the information of the created work order.
         */
        function createWorkOrderExt(cmdName, fields, customFields) {
            var params = {
                'NId': fields.NId,
                'Name': fields.Name,
                'Description': fields.Description,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'WorkMasterNId': fields.WorkMasterNId,
                'WorkMasterRevision': fields.WorkMasterRevision,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid }
            };
            Object.assign(params, customFields);
            return execCommand(cmdName, params);
        }

        function updateMtuExt(cmdName, fields, customFields) {
            var params = {
                'Id': fields.Id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },
                'Name': fields.Name,
                'Description': fields.Description
            };
            Object.assign(params, customFields);
            return execCommand(cmdName, params);
        }

        function updateWorkOrderExt(cmdName, fields, customFields) {
            var params = {
                'Id': fields.WorkOrder_Id,
                //'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'Name': fields.Name,
                'Description': fields.Description,
                /*'Status': { StatusNId: fields.StatusNId, StateMachineNId: fields.StateMachineNId },
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },*/
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'ActualStartTime': fields.ActualStartTime === '' ? null : fields.ActualStartTime,
                'ActualEndTime': fields.ActualEndTime === '' ? null : fields.ActualEndTime
            };
            Object.assign(params, customFields);
            return execCommand(cmdName, params);
        }


        /**
         * @ngdoc function
         * @name getExtendedEntityById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material information related to an extended entity.
         * @param {string} entityName the name of the extended entity.
         * @param {string} id the identifier of the required extended entity.
         * @returns {object} the extended entity information.
         */
        function getExtendedEntityById(entityName, extendedEntityName, id) {
            var options = '$filter=Id eq ' + id + '&$expand=' + extendedEntityName;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': entityName,
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getExtendedFacetById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific extended facet.
         * @param {string} facetName the name of the extended facet.
         * @param {string} id the identifier of the required facet.
         * @returns {object} the extended facet information.
         */
        function getExtendedFacetById(facetName, options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': facetName,
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
