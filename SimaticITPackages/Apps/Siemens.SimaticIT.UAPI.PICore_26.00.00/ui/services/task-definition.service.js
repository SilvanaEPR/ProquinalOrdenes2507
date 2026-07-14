/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('Siemens.SimaticIT.UAPI.PICore.TaskDefinition.service', TaskDefinitionService);


    TaskDefinitionService.$inject = ['$q', '$state', 'common.base', 'common.services.logger.service'];

    /**
     * @ngdoc service
     * @name TaskDefinitionService
     *
     * @requires $rootElement
     *
     * @description
     * The TaskDefinitionService service expose methods to manage Task Definition entity and related objects relevant for Process Industries.
     */
    function TaskDefinitionService($q, $state, base, loggerService) {
        var vm = this;
        var logger, backendService;

        activate();

        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.TaskDefinitionService');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.getTaskDefinitionParametersByTaskDefinitionId = getTaskDefinitionParametersByTaskDefinitionId;
        }

        function getTaskDefinitionParametersByTaskDefinitionId(Id) {
            var options = '$filter=TaskDefinition_Id eq ' + Id;

            return backendService.findAll({
                'appName': 'Task',
                'entityName': 'TaskDefinitionParameter',
                'options': options
            });
        }

    }
})();
