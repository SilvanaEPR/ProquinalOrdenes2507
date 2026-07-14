/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @access internal
     * @name siemens.simaticit.common.services.export
     * @module siemens.simaticit.common
     *
     * @description
     * This module provides the service to perform the Export operation.
     *
     */

    angular.module('siemens.simaticit.common.services.export', []);

})();
"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        var ExportService = /** @class */ (function () {
            function ExportService($q, $window, backendService) {
                this.$q = $q;
                this.$window = $window;
                this.backendService = backendService;
            }
            //private isGuid(value: string): boolean {
            //    //check the length of the Guid in order to avoid SonarQube possible vulnerability about regExp on very long strings. The expression has limited range of possible values so it's safe here
            //    var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; //NOSONAR
            //    return pattern.test(value);
            //}
            /**
            * @ngdoc method
            * @name common.services.export.service#export
            * @description
            * Performs the export operation.
            * @param {Object[]} ids The unique identifiers of the items to be exported.
            * @param {string} entity The name of the entity which the items to be exported belongs to.
            * @param {string} app The name of the application.
            * @param {Boolean} includeDescendants If true the export is performed for the selected items and their descendants.
            * @returns {Object} A promise object containing the details about the success or failure.
            */
            ExportService.prototype.export = function (ids, entity, app, includeDescendants) {
                var deferred = this.$q.defer();
                //if (!ids.every(this.isGuid)) {
                //    deferred.reject({
                //        data: new CommandResponse(false, new ExecutionError("-1", "Error"))
                //    });
                //    return deferred.promise;
                //}
                var parameters = {
                    ApplName: app,
                    MasterEntity: entity,
                    EntityIdList: ids,
                    IncludeDescendants: includeDescendants
                };
                var commandModel = {
                    appName: 'System',
                    commandName: 'Export',
                    params: parameters
                };
                var defer = this.backendService.invoke(commandModel);
                defer.catch(this.backendService.backendError);
                return defer;
            };
            ExportService.$inject = [
                '$q',
                '$window',
                'common.services.runtime.backendService'
            ];
            return ExportService;
        }());
        /**
        * @ngdoc service
        * @name common.services.export.service
        * @module siemens.simaticit.common.services.export
        *
        * @description
        * *This service provides methods to perform export operation.*
        */
        angular.module('siemens.simaticit.common.services.export').service('common.services.export.service', ExportService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=export-svc.js.map