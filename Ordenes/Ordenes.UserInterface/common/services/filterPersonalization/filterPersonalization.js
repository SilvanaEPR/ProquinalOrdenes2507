/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @access internal
 * @name siemens.simaticit.common.services.filterPersonalization
 * @description
 * This module provides functionalities to Save, Delete and Load filters.
 */
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.services.filterPersonalization', []);

})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @access internal
     * @name common.services.filterPersonalization.filterPersonalizationService
     * @module siemens.simaticit.common.services.filterPersonalization
     * @description A service provider for performing Save, Delete and Retrieve Filters.
     */



    function FilterPersonalizationService(personalizationService) {
        var vm = this;
        activate();
        function activate() {
            init();
            initApi();
        }

        function init() {
            vm.filterClauses = null;
            vm.userPreferences = null;
        }

        function initApi() {
            vm.saveFilterClauses = saveFilterClauses;
            vm.saveDefaultFilter = saveDefaultFilter;
            vm.deleteFilterClauses = deleteFilterClauses;
            vm.retrieveFilterClauses = retrieveFilterClauses;
        }

        function setUserPrefId(type, userPrefId) {
            if (type === "sit-filter" || type === "sit-filter-panel") {
                userPrefId = userPrefId + "_filter";
            }
            return userPrefId;
        }

        /**
        * @ngdoc method
        * @access internal
        * @name common.services.filterPersonalization.filterPersonalizationService#saveFilterClauses
        * @module siemens.simaticit.common.services.filterPersonalization
        * @description Save the values of the filter.
        * @param {String} Type The widget name.
        * @param {String} PrefrenceId The userPrefId property value.
        * @param {Object} Value A personalized configuration object.
        */
        function saveFilterClauses(type, userPrefId, filterValue) {
            userPrefId = setUserPrefId(type, userPrefId);
            filterValue = angular.copy(filterValue);
            if (vm.userPreferences === null) {
                vm.userPreferences = {
                    filter: []
                };
            } else {
                if (!vm.userPreferences.filter) {
                    vm.userPreferences = {
                        filter: []
                    };
                }
            }
            var index = _.findIndex(vm.userPreferences.filter, function (clause) {
                return _.isEqual(clause.filterName, filterValue.filterName);
            });
            if (index > -1) {
                vm.userPreferences.filter[index] = filterValue;
            } else {
                vm.userPreferences.filter[vm.userPreferences.filter.length] = filterValue;
            }
            personalizationService.setPersonalization(type, userPrefId, vm.userPreferences);
        }

        /**
        * @ngdoc method
        * @access internal
        * @name common.services.filterPersonalization.filterPersonalizationService#deleteFilterClauses
        * @module siemens.simaticit.common.services.filterPersonalization
        * @description Delete the values of the filter.
        * @param {String} Type The widget name.
        * @param {String} PrefrenceId The userPrefId property value.
        * @param {Object} Value A personalized configuration object.
        */
        function deleteFilterClauses(type, userPrefId, filterValue) {
            userPrefId = setUserPrefId(type, userPrefId);
            vm.userPreferences = personalizationService.getCurrentUserPreference(type, userPrefId);
            if (vm.userPreferences && vm.userPreferences.filter.length) {
                var index = _.findIndex(vm.userPreferences.filter, function (clause) {
                    return _.isEqual(clause.filterName, filterValue.filterName);
                });
                if (index > -1) {
                    vm.userPreferences.filter.splice(index, 1);
                    personalizationService.setPersonalization(type, userPrefId, vm.userPreferences);
                }
            }
        }

        /**
        * @ngdoc method
        * @access internal
        * @name common.services.filterPersonalization.filterPersonalizationService#retrieveFilterClauses
        * @module siemens.simaticit.common.services.filterPersonalization
        * @description Retrieve the values of the filter.
        * @param {String} Type The widget name.
        * @param {String} PrefrenceId The userPrefId property value.
        */
        function retrieveFilterClauses(type, userPrefId) {
            userPrefId = setUserPrefId(type, userPrefId);
            vm.userPreferences = personalizationService.getCurrentUserPreference(type, userPrefId);
            vm.filterClauses = null;
            if (vm.userPreferences && vm.userPreferences.filter) {
                vm.filterClauses = vm.userPreferences.filter;
            }
            return vm.filterClauses;
        }

        function clearExistingDefaultFilters() {
            if (vm.userPreferences && vm.userPreferences.filter) {
                for (var i = 0; i < vm.userPreferences.filter.length; i++) {
                    vm.userPreferences.filter[i].default = false;
                }
            }
        }

        /**
       * @ngdoc method
       * @access internal
       * @name common.services.filterPersonalization.filterPersonalizationService#saveDefaultFilter
       * @module siemens.simaticit.common.services.filterPersonalization
       * @description Sets/Unsets the filter as default.
       * @param {String} Type The widget name.
       * @param {String} PrefrenceId The userPrefId property value.
       * @param {Object} Value A personalized configuration object.
       *  @param {Boolean} IsDefault A boolean value indicating to Set/Unset a filter as default
       */
        function saveDefaultFilter(type, userPrefId, filterValue, isDefault) {
            clearExistingDefaultFilters();
            filterValue.default = isDefault;
            vm.saveFilterClauses(type, userPrefId, filterValue);
        }

    }

    FilterPersonalizationService.$inject = ['common.services.personalization.personalizationService'];

    angular.module('siemens.simaticit.common.services.filterPersonalization')
        .service('common.services.filterPersonalization.filterPersonalizationService', FilterPersonalizationService);

})();
