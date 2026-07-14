/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .service('uapi-statusColorMapService', statusColorMapService);

    statusColorMapService.$inject = ['$q', 'uapi-entityService', 'common.services.logger.service'];

    function statusColorMapService($q, entityService, uiLogger) {
        var self = this;
        self.uiLogger = uiLogger;

        var service = {
            initializedDeferred: $q.defer(),
            setMapping: setMapping,
            getMappingByStatusNId: getMappingByStatusNId
        };
        service.initialized = service.initializedDeferred.promise;
        activate();

        return service;


        function activate() {
            self.statusesColorsMapping = [];

            entityService.getStatuses().then(function (result) {
                var statusesColorsMapping = [];
                for (var i = 0; i < result.value.length; i++) {
                    if (result.value[i].Color) {
                        statusesColorsMapping.push({ NId: result.value[i].NId, Name: result.value[i].Name, color: result.value[i].Color, Outcome: result.value[i].Outcome });
                    } else {
                        if (self.uiLogger) {
                            var logger = self.uiLogger.getModuleLogger('statusColorMapService');
                            var warningMessage = 'Color for status \'' + result.value[i].NId + '\' is not defined. Set it to grey as default value.';
                            logger.logWarn(warningMessage, '');
                        }
                        statusesColorsMapping.push({ NId: result.value[i].NId, Name: result.value[i].Name, color: 'grey', Outcome: 'NoOutcome' });
                    }
                }
                service.setMapping(statusesColorsMapping);
                service.initializedDeferred.resolve();
            });
        }

        function setMapping(statusesColorsMapping) {
            self.statusesColorsMapping = statusesColorsMapping;
        }

        function getMappingByStatusNId(statusNId) {
            for (var i = 0; i < self.statusesColorsMapping.length; i++) {
                if (self.statusesColorsMapping[i].NId == statusNId) {
                    return self.statusesColorsMapping[i];
                }
            }
            return null;
        }
    }


})();
