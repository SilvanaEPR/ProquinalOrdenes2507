/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.services.plant
     * @module siemens.simaticit.common
     *
     * @description
     * Contains services, providers, and objects to access the functionalities exposed by the plants Service Layer.
     *
     *
     */
    angular.module('siemens.simaticit.common.services.plant', []);

})();
"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
         * @ngdoc type
         * @name Plant
         * @module siemens.simaticit.common.services.plant
         *
         * @description
         * Represents current Plant.
         *
         * @property {String} Id The GUID of the plant.
         * @property {String} NId The NId of the plant.
         * @property {String} Name The name of the Plant.
         * @property {Boolean} IsDefault Whether the current Plant is Default Plant or not.
         */
        var Plant = /** @class */ (function () {
            function Plant() {
            }
            return Plant;
        }());
        framework.Plant = Plant;
        /**
         * @ngdoc service
         * @name common.services.plant.plantService
         * @module siemens.simaticit.common.services.plant
         * @description A service provider for managing Plant Information.
         */
        var PlantService = /** @class */ (function () {
            function PlantService($q, $http) {
                this.$q = $q;
                this.$http = $http;
                this.plantInfo = null;
            }
            PlantService.prototype.preparePlantInfo = function () {
                var _this = this;
                var deferred = this.$q.defer();
                var uiAppPath = 'uiapp.info.json';
                this.$http.get(uiAppPath).then(function (res) {
                    if (null === res || undefined === res || undefined === res.data.plantInfo) {
                        deferred.resolve(null);
                        return;
                    }
                    _this.plantInfo = res.data.plantInfo;
                    deferred.resolve(_this.plantInfo);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            PlantService.prototype.setCurrentPlant = function (plant) {
                this.plantInfo = plant;
            };
            /**
            * @ngdoc method
            * @name common.services.plant.plantService#getCurrentPlant
            * @module siemens.simaticit.common.services.plant
            * @description Gives information about Current Plant.
            * @returns {Plant} A Plant object containing Id, NId, IsDefault and Name of the current Plant. See {@link type:Plant}.
            */
            PlantService.prototype.getCurrentPlant = function () {
                return this.plantInfo;
            };
            PlantService.$inject = [
                '$q',
                '$http'
            ];
            return PlantService;
        }());
        angular.module('siemens.simaticit.common.services.plant').service('common.services.plant.plantService', PlantService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=plant-svc.js.map