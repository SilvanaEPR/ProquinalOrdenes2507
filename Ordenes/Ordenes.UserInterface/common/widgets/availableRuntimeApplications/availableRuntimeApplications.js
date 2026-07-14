/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.availableRuntimeApplications
 *
 * @description
 * This module provides list of available UI applications grouped by Plants.
 */
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.availableRuntimeApplications', []);

})();

(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name sitRuntimeApplications
    * @module siemens.simaticit.common.widgets.availableRuntimeApplications
    * @description Shows list of tiles which represent runtime applications grouped by Plant.
    * Grouping is done using accordion, user can hide or show any plants.
    * Each tile inside a plant will represent runtime applications and will have two buttons.
    * These buttons will take the user to selected runtime application and open home screen or the same screen as current application.
    * @usage
    * As an element:
    * ```
    * <sit-runtime-applications>
    * </sit-runtime-applications>
    * ```
    * @restrict E
    */
    angular.module('siemens.simaticit.common.widgets.availableRuntimeApplications')
        .component('sitRuntimeApplications', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {},
            templateUrl: 'common/widgets/availableRuntimeApplications/available-runtime-applications.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    ComponentController.$inject = ['$scope', '$window', '$translate', 'common.widgets.availableRuntimeApplications.service'];
    function ComponentController($scope, $window, $translate, uiAppService) {

        $scope.runtimeAppList = [];
        $scope.message = $translate.instant('availableRuntimeApplications.message');
        $scope.noRuntimeApplicationsMessage = $translate.instant('availableRuntimeApplications.noApplicationsToShow');

        $scope.accordion = { type: 'ADVANCED' };
        $scope.customTemplate = '<div style="background-color: #efefef; cursor: default; position:relative; padding: 5px;" class="medium-wide">' +
            '<div style="width:20%; float:left">' +
            '<div sit-mom-icon="itemTileCtrl.tileContent.svgIcon"></div>' +
            '</div>' +
            '<div style="width:65%; float:left">' +
            '<strong>{{itemTileCtrl.displayTitle}}</strong>' +
            '<div data-internal-type="description" style="padding-top:5px">{{itemTileCtrl.displayDescription}}</div>' +
            '</div>' +
            '<div style="width:15%; float:left;">' +
            '<a ng-if="itemTileCtrl.tileContent.type != "MxUIApplication"" ng-href="{{itemTileCtrl.tileContent.currentScreenURL}}" target="_blank">' +
            '<div style="margin: 5px 0" sit-mom-icon="itemTileCtrl.tileContent.svgIcon_open"></div></a>' +
            '<a ng-href="{{itemTileCtrl.tileContent.homeURL}}" target="_blank">' +
            '<div sit-mom-icon="itemTileCtrl.tileContent.svgIcon_home"></div></a>' +
            '</div>' +
            '</div>';

        function init() {
            getAvailableApps();
        }

        function getAvailableApps() {
            uiAppService.getAvailableRuntimeApplications().then(function (data) {
                $scope.runtimeAppList = data;
                removeCurrentRuntimeApplication();
                updateTileConfig();
            });
        }

        function removeCurrentRuntimeApplication() {
            if (!$window.parent.location) {
                return "";
            }

            var path = $window.parent.location.pathname.split('/');
            var currentPlant = path[2];
            var currentRuntimeApp = path[3];

            $scope.runtimeAppList.forEach(function(plant) {
                if (plant.PlantNId == currentPlant) {
                    plant.UIApplications.forEach(function (app) {
                        if (app.UIAppName == currentRuntimeApp) {
                            plant.UIApplications = plant.UIApplications.filter(function (_app) {
                                return _app.UIAppName !== currentRuntimeApp;
                            });
                        }
                    });
                }
            });

            $scope.runtimeAppList = $scope.runtimeAppList.filter(function (_plant) {
                return _plant.UIApplications.length > 0;
            });
        }

        function updateTileConfig() {
            $scope.runtimeAppList.forEach(function (plant) {
                plant.accordionConfig = {
                    header: plant.PlantName,
                    state: 'EXPAND'
                };

                plant.UIApplications.forEach(function (app) {
                    app.tileContent = {
                        title: app.UIAppName.split('.').pop(),
                        type: app.Type,
                        description: app.UIAppTitle,
                        size: 'medium',
                        selectStyle: 'standard',
                        svgIcon: { path: 'common/icons/typeUIApplication48.svg', size: 42 },
                        svgIcon_open: { path: 'common/icons/cmdOpen24.svg', size: 24 },
                        svgIcon_home: { path: 'common/icons/cmdHome24.svg', size: 24 },
                        homeURL: getHomeScreenURL(app, plant),
                        currentScreenURL: getCurrentScreenURL(app, plant)
                    };
                });
            });
        }

        function getCurrentScreenURL(app, plant) {
            if (!$window.parent.location) {
                return "";
            }

            if (app.Type == "MxUIApplication") {
                return "";
            }

            var portNumber = $window.parent.location.port == "" ? "" : (":" + $window.parent.location.port);
            var URL = $window.parent.location.protocol + '//' + $window.parent.location.host + portNumber + '/sit-ui/' + plant.PlantNId + '/' + app.UIAppName;
            var absUrl = $window.parent.location.hash;
            URL = URL + '/' + absUrl;

            return URL;
        }

        function getHomeScreenURL(app, plant) {
            if (!$window.parent.location) {
                return "";
            }
            var portNumber = $window.parent.location.port == "" ? "" : (":" + $window.parent.location.port);
            var URL = $window.parent.location.protocol + '//' + $window.parent.location.host + portNumber + '/sit-ui/' + plant.PlantNId + '/' + app.UIAppName;
            return URL;
        }

        init();
    }
})();
"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
         * @ngdoc service
         * @name common.widgets.availableRuntimeApplications.service
         * @module siemens.simaticit.common.widgets.availableRuntimeApplications
         * @description A service provider for showing available runtime applications grouped by Plant.
         */
        var availableRuntimeApplicationsService = /** @class */ (function () {
            function availableRuntimeApplicationsService($q, administrationDataService) {
                this.$q = $q;
                this.administrationDataService = administrationDataService;
                this.availableRuntimeApplications = [];
            }
            /**
            * @ngdoc method
            * @name common.widgets.availableRuntimeApplications.service#getAvailableRuntimeApplications
            * @module siemens.simaticit.common.widgets.availableRuntimeApplications
            * @description Gives list of available runtime applications grouped by Plant.
            * @returns {Array} List of Plants along with runtime applications belonged to the respective Plant.
            */
            availableRuntimeApplicationsService.prototype.getAvailableRuntimeApplications = function () {
                var _this = this;
                var deferred = this.$q.defer();
                if (this.availableRuntimeApplications && this.availableRuntimeApplications.length > 0) {
                    deferred.resolve(this.availableRuntimeApplications);
                    return deferred.promise;
                }
                var command = 'GetAuthorizedUIApplicationsPerPlantCommand';
                try {
                    this.administrationDataService.invokeAdministrationCommand(command, {}).then(function (data) {
                        if (data && data.UIApplicationsPerPlant && data.UIApplicationsPerPlant.length) {
                            _this.availableRuntimeApplications = data.UIApplicationsPerPlant;
                            deferred.resolve(_this.availableRuntimeApplications);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
                catch (err) {
                    deferred.reject(err);
                }
                return deferred.promise;
            };
            availableRuntimeApplicationsService.$inject = [
                '$q',
                'common.services.administration.data.service'
            ];
            return availableRuntimeApplicationsService;
        }());
        angular.module('siemens.simaticit.common.widgets.availableRuntimeApplications')
            .service('common.widgets.availableRuntimeApplications.service', availableRuntimeApplicationsService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=available-runtime-applications-svc.js.map