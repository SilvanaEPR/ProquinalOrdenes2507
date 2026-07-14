/*
* SIMATIC IT Unified Architecture for Process Industries V2.3.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .constant('Siemens.SimaticIT.UAPI.PICore.OrderConstants', OrderConstants())
        .service('Siemens.SimaticIT.UAPI.PICore.OrderService', OrderService);

    function OrderConstants() {
        return {
            data: {
                appName: 'PICore',
                appPrefix: 'Siemens.SimaticIT.UAPI',
                entityName: 'Order'
            }
        };
    }

    OrderService.$inject = ['$q', '$state', 'common.base', 'Siemens.SimaticIT.UAPI.PICore.OrderConstants', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name OrderService
     *
     * @requires $rootElement
     *
     * @description
     * The WorkOrderService service expose methods to manage WorkOrder entity and related objects relevant for Process Industries.
     */
    function OrderService($q, $state, base, context, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.OrderService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getAll = getAll;
            vm.getByNId = getByNId;
            vm.getById = getById;
            vm.getOrder = getOrder;
            vm.getOrders = getOrders;
            vm.calculateUnplannedQty = calculateUnplannedQty;
            vm.createWorkOrders = createWorkOrders;
        }

        /**
         * @ngdoc function
         * @name calculateUnplannedQty
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description it calculates the remaining quantity to be produced to fulfill a given Order
         * @param {object} cmdParams the parameter needed by the command.
         */
        function calculateUnplannedQty(cmdParams) {
            return execRead('RF_CalculateUnplannedQuantityForOrder', cmdParams);
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

        /**
         * @ngdoc function
         * @name getAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of Order.
         * @param {object} options the object that contains the conditions to query Order.
         * @returns {object} the list Order.
         */
        function getAll(options) {
            return execGetAll(options);
        }

        /**
         * @ngdoc function
         * @name getByNId
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific Order.
         * @param {string} nid the natural identifier of the required Order.
         * @returns {object} the Order information.
         */
        function getByNId(nid) {
            var options = '$filter=NId eq ' + nid;
            return getAll(options);
        }


        /**
         * @ngdoc function
         * @name getById
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the information related to a specific Order.
         * @param {string} id the identifier of the required Order.
         * @returns {object} the Order information.
         */
        function getById(id) {
            var options = '$filter=Id eq ' + id;
            return getOrder(options);
        }

        /**
        * @ngdoc function
        * @name getOrder
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves the information related to a specific Order.
        * @param {string} options the query optionsString.
        * @returns {object} the Order information.
        */
        function getOrder(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Order',
                'options': options
            });
        }

        /**
        * @ngdoc function
        * @name getOrders
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Retrieves all Orders in the system.
        * @param {string} options the query optionsString.
        * @returns {object} the Orders information.
        */
        function getOrders(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': 'Order',
                'options': options
            });
        }


        /**
        * @ngdoc function
        * @name createWorkOrders
        * @module Siemens.SimaticIT.UAPI.PICore
        *
        * @description Creates the desired number of new WorkOrders in the system.
        * @param {object} fields the information of the WorkOrders to be created.
        * @returns {params} the identifiers of the created WorkOrders.
        */
        function createWorkOrders(fields) {
            var params = {
                'OrderNId': fields.OrderNId,
                'PlannedStartTime': fields.PlannedStartTime === '' ? null : fields.PlannedStartTime,
                'PlannedEndTime': fields.PlannedEndTime === '' ? null : fields.PlannedEndTime,
                'WorkMasterNId': fields.WorkMasterNId,
                'WorkMasterRevision': fields.WorkMasterRevision,
                'TemplateNId': fields.TemplateNId === undefined ? fields.TemplateNId : fields.TemplateNId.id,
                'MaterialNId': fields.MaterialNId === undefined ? fields.MaterialNId : fields.MaterialNId.id,
                'MaterialRevision': fields.MaterialRevision === undefined ? fields.MaterialRevision : fields.MaterialRevision.revision,
                'NumberOfWorkOrdersToBeCreated': fields.NumberOfWorkOrdersToBeCreated,
                'Quantity': { QuantityValue: fields.Quantity, UoMNId: fields.QuantityUoMNId === undefined ? fields.QuantityUoMNId : fields.QuantityUoMNId.nid }
            };
            return execCommand('CreateWorkOrders', params);
        }


        function execGetAll(options) {
            return execGetAllEntity(context.data.entityName, options);
        }

        function execGetAllEntity(entityName, options) {
            logger.logDebug('Executing query on ' + entityName + ' with options: ' + options);
            var optionString = options !== '' ? '$expand=WorkOrder&' + options : '$expand=WorkOrder';

            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': entityName,
                'options': optionString
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
