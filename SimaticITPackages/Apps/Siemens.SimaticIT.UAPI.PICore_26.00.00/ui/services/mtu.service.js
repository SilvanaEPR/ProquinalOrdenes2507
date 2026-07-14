/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.MtuConstants', MtuConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.service', MtuService);

    function MtuConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'MAT_MaterialTrackingUnit'
            }
        };
    }

    MtuService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.MtuConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name MtuService
     *
     * @requires $rootElement
     *
     * @description
     * The MtuService service expose methods to manage Material Tracking Unit entity and related objects relevant for Process Industries.
     */
    function MtuService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getAllWithMaterialLot = getAllWithMaterialLot;
            vm.getById = getById;
            vm.getByNId = getByNId;
            vm.getByStatus = getByStatus;
            vm.getEquipmentById = getEquipmentById;
            vm.getMtuByFilters = getMtuByFilters;
            vm.getMTUSources = getMTUSources;
            vm.getMtuUserFields = getMtuUserFields;
            vm.getMtuTemplates = getMtuTemplates;
            vm.getMaterialGroups = getMaterialGroups;
            vm.getMaterials = getMaterials;
            vm.getMaterialRevisions = getMaterialRevisions;
            vm.getMaterialLotById = getMaterialLotById;
            vm.getUoMs = getUoMs;
            vm.getUoMByNId = getUoMByNId;
            vm.getUoMByMaterialNIdAndRevision = getUoMByMaterialNIdAndRevision;
            vm.getRelatedUoMs = getRelatedUoMs;
            vm.getEquipments = getEquipments;
            vm.getLocations = getLocations;
            vm.getMaterialTemplates = getMaterialTemplates;
            vm.getLotsByMaterial = getLotsByMaterial;
            vm.getMTUNumberingPattern = getMTUNumberingPattern;
            vm.createMtu = createMtu;
            vm.deleteMtu = deleteMtu;
            vm.getByEntity = getByEntity;
            vm.updateMtuUserField = updateMtuUserField;
            vm.setMaterialTrackingUnitQuantity = setMaterialTrackingUnitQuantity;
            vm.createMtuNoQty = createMtuNoQty;
            vm.updateMtu = updateMtu;
            vm.computeMtuTracking = computeMtuTracking;
            vm.freezeMtu = freezeMtu;
            vm.unfreezeMtu = unfreezeMtu;
            vm.getWorkCenters = getWorkCenters;
            vm.getLots = getLots;
            vm.get_Material_Lots = get_Material_Lots;
        }

        function computeMtuTracking(cmdParams) {
            var params = {
                MTUId: cmdParams.MtuId
            };
            if (cmdParams.Distance !== undefined && cmdParams.Distance !== null) {
                params.Distance = cmdParams.Distance;
            }
            if (cmdParams.FromDate !== undefined && cmdParams.FromDate !== null) {
                params.FromDate = cmdParams.FromDate;
            }
            if (cmdParams.ToDate !== undefined && cmdParams.ToDate !== null) {
                params.ToDate = cmdParams.ToDate;
            }
            if (cmdParams.ReferenceQuantity !== undefined && cmdParams.ReferenceQuantity !== null) {
                params.ReferenceQuantity = cmdParams.ReferenceQuantity;
            }
            if (cmdParams.ReferenceUoMNId !== undefined && cmdParams.ReferenceUoMNId !== null) {
                params.ReferenceUoMNId = cmdParams.ReferenceUoMNId;
            }
            if (cmdParams.ExcludedOperationTypes !== undefined && cmdParams.ExcludedOperationTypes !== null && cmdParams.ExcludedOperationTypes.length > 0) {
                params.ExcludedOperationTypes = cmdParams.ExcludedOperationTypes;
            }
            if (cmdParams.IncludeOperationsWhereSourceMTUEqualsToDestinationMTU !== undefined && cmdParams.IncludeOperationsWhereSourceMTUEqualsToDestinationMTU !== null) {
                params.IncludeOperationsWhereSourceMTUEqualsToDestinationMTU = '' + cmdParams.IncludeOperationsWhereSourceMTUEqualsToDestinationMTU + '';
            }
            if (cmdParams.CollapseParallelEdges !== undefined && cmdParams.CollapseParallelEdges !== null) {
                params.CollapseParallelEdges = '' + cmdParams.CollapseParallelEdges + '';
            }
            return execRead('RF_ComputeMTUSourcesAndDestinations', params);
        }

        /**
         * @ngdoc function
         * @name setMaterialTrackingUnitQuantity
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Sets a new quantity to a given material tracking unit.
         * @param {object} fields the necessary data to perform the movement.
         */
        function setMaterialTrackingUnitQuantity(fields) {
            var params = {
                'Id': fields.Id,
                'Quantity': { QuantityValue: fields.Quantity.QuantityValue, UoMNId: fields.Quantity.UoMNId }
            };
            return execCommand('SetMaterialTrackingUnitQuantity', params);
        }

        /**
        * @ngdoc function
        * @name createMtuNoQty
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Creates a new material tracking unit in the system without quantity.
        * @param {object} fields the information, quantity excluded, of the material tracking unit to be created.
        * @returns {params} the information of the created material tracking unit.
        */
        function createMtuNoQty(fields) {
            var params = {
                'NId': fields.NId,
                'Name': fields.Name,
                'Description': fields.Description,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,

                'MaterialLotNId': fields.MaterialLot === undefined ? fields.MaterialLot : fields.MaterialLot.id,

                'EquipmentNId': fields.Places.FieldName === 'Equipment' ? fields.Places.FieldValue : undefined
            };
            return execCommand('CreateMaterialTrackingUnit', params);
        }

        /**
         * @ngdoc function
         * @name createMtu
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Creates a new material tracking unit in the system.
         * @param {object} fields the information of the material tracking unit to be created.
         * @returns {params} the information of the created material tracking unit.
         */
        function createMtu(fields) {
            var params = {
                'NId': fields.NId,
                'Name': fields.Name,
                'Description': fields.Description,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'MaterialLotNId': fields.MaterialLot === undefined ? fields.MaterialLot : fields.MaterialLot.id,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid },
                'EquipmentNId': fields.Places.FieldName === 'Equipment' ? fields.Places.FieldValue : undefined
            };
            return execCommand('CreateMaterialTrackingUnit', params);
        }

        /**
         * @ngdoc function
         * @name deleteMtu
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Deletes a specific material tracking unit.
         * @param {string} mtuId the identifier of the material tracking unit to delete.
         * @returns {object} the information related to the required entity.
         */
        function deleteMtu(mtuId) {
            var params = { Id: mtuId };
            return execCommand('DeleteMaterialTrackingUnit', params);
        }

        function updateMtuUserField(userFieldToUpdate) {
            var params = { Id: userFieldToUpdate.Id, UserFieldValue: userFieldToUpdate.UserFieldValue };
            return execCommand('UpdateMaterialTrackingUnitUserField', params);
        }

        /**
         * @ngdoc function
         * @name getByEntity
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves information related to a given entity.
         * @param {string} entityName the given entity.
         * @param {string} options the OData query options.
         * @returns {object} the information related to the required entity.
         */
        function getByEntity(entityName, options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': entityName,
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getEquipments
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves equipments related information.
         * @param {string} options the OData query options.
         * @returns {object} the Equipment information found by the query.
         */
        function getEquipments(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Equipment',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getLocations
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Converts the specified string to lowercase.
         * @param {string} options the OData query options.
         * @returns {object} the Locations found by the query.
         */
        function getLocations(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Location',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMTUNumberingPattern
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the numbering patterns associated to Material Tracking Unit entity.
         * @returns {object} the numering patterns eventually configured in the system.
         */
        function getMTUNumberingPattern() {
            var entity = 'MAT_MaterialTrackingUnit';
            var options = '$filter=EntityTypeNId eq \'' + entity + '\'&$expand=NumberingPatternParts';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'NumberingPattern',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getUoMByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Given the name of a unit of measure, retrieves all its information.
         * @param {string} nid the natural identifier of a unit of measure.
         * @returns {object} the information related to the specified unit of measure.
         */
        function getUoMByNId(nid) {
            var options = '$filter=NId eq \'' + nid + '\'';
            return getUoMs(options);
        }

        /**
         * @ngdoc function
         * @name getUoMByMaterialNIdAndRevision
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Given the name of a material and the related revision, retrieves all uom information.
         * @param {string} materialNId the natural identifier of a material.
         * @param {string} materialRevision the revisionm of a material.
         * @returns {object} the information related to the specified unit of measure.
         */
        function getUoMByMaterialNIdAndRevision(materialNId, materialRevision) {
            var options = '$filter=NId eq %27' + materialNId + '%27 and Revision eq %27' + materialRevision + '%27';
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_Material',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getUoMs
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Given the name of a unit of measure, retrieves all its information.
         * @param {string} the natural identifier of a unit of measure.
         * @returns {object} the information related to the specified unit of measure.
         */
        function getUoMs(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'UoM',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getRelatedUoMs
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Given a unit of measure, retrieves all other related unit of measures, such as multiples.
         * @param {object} the unit of measure.
         * @returns {object} the multiples of the given unit of measure.
         */
        function getRelatedUoMs(uom) {
            var options;
            if (uom.UoMBase_Id) {
                options = '$filter=UoMBase_Id eq ' + uom.Id + ' or Id eq ' + uom.UoMBase_Id;
            } else {
                options = '$filter=UoMBase_Id eq ' + uom.Id;
            }
            return getUoMs(options);
        }

        /**
         * @ngdoc function
         * @name getMtuTemplates
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material tracking unit templates in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Material Tracking Unit Templates present in the system.
         */
        function getMtuTemplates(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MaterialTrackingUnitTemplate',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMaterials
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the materials in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Materials defined in the system.
         */
        function getMaterials(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_Material',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMaterialRevisions
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material revisions in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Material Revisions defined in the system.
         */
        function getMaterialRevisions(options) {
            return getMaterials(options);
        }

        /**
         * @ngdoc function
         * @name getMaterialGroups
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material groups in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Material Groups defined in the system.
         */
        function getMaterialGroups(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialGroup',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMaterialTemplates
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material templates in the system.
         * @param {string} options the OData query options.
         * @returns {object} the Material Templates defined in the system.
         */
        function getMaterialTemplates(options) {

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialTemplate',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getMaterialLotById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material lot information given the lot identifier
         * @param {string} options the identifier of the required lot.
         * @returns {object} the Material Lot information.
         */
        function getMaterialLotById(MaterialLotId) {
            var options = '$filter=Id eq ' + MaterialLotId;

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialLot',
                'options': options
            });
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function getAllWithMaterialLot(options) {
            var composedOptions = '';
            if (options !== undefined && options !== null && options.length > 0) {
                composedOptions = options + '&';
            }
            composedOptions += '$expand=MaterialLot($select=NId)';

            return execGetAll(composedOptions);
        }

        /**
         * @ngdoc function
         * @name getById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material information related to a specific material tracking unit.
         * @param {string} id the identifier of the required material tracking unit.
         * @returns {object} the Material Tracking Unit information.
         */
        function getById(id) {
            var options = '$filter=Id eq ' + id;
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the material information related to a specific material tracking unit.
         * @param {string} nid the natural identifier of the required material tracking unit.
         * @returns {object} the Material Tracking Unit information.
         */
        function getByNId(nid) {
            var options = '$filter=NId eq \'' + nid + '\'';
            return getAll(options);
        }

        /**
         * @ngdoc function
         * @name getEquipmentById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves information related to a given equipment.
         * @param {string} the identifier of the equipment.
         * @returns {object} the Equipment information found by the query.
         */
        function getEquipmentById(id) {
            var options = '$filter=Id eq ' + id;
            return getEquipments(options);
        }

        /**
         * @ngdoc function
         * @name getLotsByMaterial
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the lots of a specified material in a given revision.
         * @param {object} the material related information.
         * @param {string} options the OData query options.
         * @returns {object} the Lots of the given material in the specified revision.
         */
        function getLotsByMaterial(mat, clauses) {
            var options = '$filter=MaterialNId eq \'' + mat.id + '\' and (MaterialRevision eq \'' + mat.revision + '\' or MaterialRevision eq ' + null + ')';
            options += '&' + clauses;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialLot',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name getLots
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the lots.
         *
         * @param {string} options the OData query options.
         * @returns {object} the Lots of the given material in the specified revision.
         */
        function getLots(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialLot',
                'options': options
            });
        }

        /**
         * @ngdoc function
         * @name get_Material_Lots
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the lots.

         * @param {string} options the OData query options.
         * @returns {object} the Lots of the given material in the specified revision.
         */
        function get_Material_Lots(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MAT_MaterialLot',
                'options': options
            });
        }

        function getMtuByFilters(mtuFilterOptions, userFieldsFilterOptions) {
            var options = '';
            if (mtuFilterOptions !== undefined && mtuFilterOptions !== '') {
                options = '$filter=' + mtuFilterOptions;
                if (userFieldsFilterOptions !== undefined && userFieldsFilterOptions !== '') {
                    options += ' &$expand=UserFields($filter=' + userFieldsFilterOptions + ')';
                }
            } else {
                if (userFieldsFilterOptions !== undefined && userFieldsFilterOptions !== '') {
                    options += '$expand=UserFields($filter=' + userFieldsFilterOptions + ')';
                }
            }

            return getAllWithMaterialLot(options);
        }

        function getByStatus(status) {
            var options = '$filter=Status/StatusNId eq \'' + status + '\'';
            return getAll(options);
        }

        function getMTUSources(mtuNId) {
            var params = { 'MTUNId': mtuNId };
            return execCommand('GetMTUSources', params);
        }

        function getMtuUserFields(mtuId) {
            var options = '$filter=MaterialTrackingUnit_Id eq ' + mtuId;
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'MaterialTrackingUnitUserField',
                'options': options
            });
        }

        function updateMtu(fields) {
            var params = {
                'Id': fields.Id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'Quantity': {
                    QuantityValue: fields.Quantity, UoMNId: (fields.QuantityUoMNId === undefined || fields.QuantityUoMNId === null)
                        ? fields.QuantityUoMNId
                        : fields.QuantityUoMNId.nid
                },
                'Name': fields.Name,
                'Description': fields.Description
            };
            return execCommand('UpdateMaterialTrackingUnit', params);
        }

        /**
        * @ngdoc function
        * @name freezeMtu
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Freezes a specific MTU.
        * @param {Guid} mtuId the identifier of the MTU that needs to be frozen.
        */
        function freezeMtu(mtuId) {
            var params = { Id: mtuId };
            return execCommand('FreezeMaterialTrackingUnit', params);
        }

        /**
        * @ngdoc function
        * @name unfreezeMtu
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Unfreezes a specific MTU.
        * @param {Guid} Id the identifier of the MTU that needs to be unfreezed.
        */
        function unfreezeMtu(Id) {
            var params = { Id: Id };
            return execCommand('UnfreezeMaterialTrackingUnit', params);
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

        function execRead(publicName, params) {
            logger.logDebug('Executing reading function.......', publicName);
            return backendService.read({
                'appName': context.data.appName,
                'functionName': publicName,
                'params': params
            });
        }

        /**
         * @ngdoc function
         * @name getWorkCenters
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description allows to get all  the work centers
         * @param {object} options the parameter needed by the command.
         */
        function getWorkCenters(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'WorkCenter',
                'options': options
            });
        }
    }
})();
