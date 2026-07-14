/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.services.navigation
     *
     * @description
     * This module provides the service related to navigation management related operations.
     */
    angular.module('siemens.simaticit.common.services.navigation', []);

})();

(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name common.services.navigation.navigationManagementService
     * @module siemens.simaticit.common.services.navigation
     * @description A service that manages the parameters of query string. The activities include:
     * * Setting query string as defined by the user.
     * * Retrieving query string and returning it to the user.
     *
     * @example
     * In a controller, the **common.services.navigation.navigationManagementService** can be used as follows:
     *
     * ```
     *
     *    (function () {
     *     'use strict';
     *
     *       function RuntimeAccessController($scope, navigationManagementService) {
     *            var vm = this;
     *
     *            function setParameters() {
     *                var data = { id: vm.id, name: 'name' };
     *                //Calling setQueryString by passing the data object to save the query string
     *                navigationManagementService.setQueryString(data).then(function (data) {
     *                    vm.dataValue = data;
     *                },
     *                function (error) {
     *                    vm.errorValue = error.data;
     *                });
     *            }
     *
     *            function getParameters() {
     *                //Calling getQueryString to retrieve the data object from the query string
     *                navigationManagementService.getQueryString().then(function (data) {
     *                    vm.inputValue = data.id;
     *                },
     *                function (error) {
     *                    vm.errorValue = error.data;
     *                });
     *            }
     *
     *           // Setting query string
     *           setParameters();
     *
     *           // Getting query string data
     *           getParameters();
     *       }
     *       RuntimeAccessController.$inject = ['$scope', 'common.services.navigation.navigationManagementService'];
     *
     *       angular
     *         .module('siemens.simaticit.common.examples')
     *         .controller('RuntimeAccessController', RuntimeAccessController);
     *    })();
     *
     *```
     */
    angular.module('siemens.simaticit.common.services.navigation').service('common.services.navigation.navigationManagementService', NavigationManagementService);

    NavigationManagementService.$inject = ['$q', 'common.services.swac.SwacUiModuleManager', '$location'];
    function NavigationManagementService($q, swacManager, $location) {
        var vm = this;
        var isSwac = swacManager.enabled;

        /**
            * @ngdoc method
            * @name common.services.navigation.navigationManagementService#setQueryString
            * @module siemens.simaticit.common.services.navigation
            * @description Registers the callback method to be executed when an user wants to set the query string.
        */
        function setQueryString() {
            var params = arguments;

            if (isSwac) {
                return $q.race([
                    swacManager.navigationServicePromise.promise.then(function (service) {
                        if (params.length === 1) {
                            return service.setQueryString(params[0]);
                        }
                        return service.setQueryString(params[0], params[1]);
                    })
                ]);
            }

            var deferred = $q.defer();
            if (params.length === 1) {
                deferred.resolve($location.search(params[0]));
            } else {
                deferred.resolve($location.search(params[0], params[1]));
            }
            return deferred.promise;
        }

        /**
            * @ngdoc method
            * @name common.services.navigation.navigationManagementService#getQueryString
            * @module siemens.simaticit.common.services.navigation
            * @description Registers the callback method to be executed when an user wants to get the query string.
            * It returns a promise with the query string data object.
        */
        function getQueryString() {
            if (isSwac) {
                return $q.race([
                    swacManager.navigationServicePromise.promise.then(function (service) {
                        return service.getQueryString();
                    })
                ]);
            }

            var deferred = $q.defer();
            deferred.resolve($location.search());
            return deferred.promise;
        }

        function init() {
            //service methods
            vm.setQueryString = setQueryString;
            vm.getQueryString = getQueryString;
        }

        function activate() {
            init();
        }

        activate();
    }
})();
