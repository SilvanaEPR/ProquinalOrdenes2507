/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.filterBar
 * @access internal
 * @description
 * Provides functionalities related to defining filters.
 */
(function () {
	'use strict';

	angular.module('siemens.simaticit.common.widgets.filterBar', ['siemens.simaticit.common.widgets.switchButton', 'ui.bootstrap', 'siemens.simaticit.common.services.tagsManager']);

})();

/*jshint -W117,-W098, -W027 */
(function () {
    'use strict';
    /**
 * @ngdoc directive
 * @module siemens.simaticit.common.widgets.filterBar
 * @name sitFilterBar
 * @access internal
 * @requires $log
 *
 * @restrict E
 *
 * @description
 * Provides a configurable UI for searching, filtering and grouping.
 *
 * <em>  NOTE: This directive was created for internal use by the
 *       {@link siemens.simaticit.common.widgets.itemCollectionViewer.sitItemCollectionViewer} directive.</em>
 *
 * @example
 * In a view template, you can use the **sitFilterBar** as follows:
 * ```
 *       <sit-filter-bar sit-filter-options="filterOptions"></sit-filter-bar>
 * ```
 *
 * In the corresponding view controller, add a **filterOptions** object to the $scope
 * to define the options for the filter bar.
 * ```
 *  $scope.filterOptions = {
 *       currentGroupField: '',
 *       currentSortDirection: 'none',
 *       currentSortField: 'lastName',
 *       displayOptions: 'sqg',
 *       onFilterClickCallback: null, //not currently supported
 *       groupByFields: ['lastName', 'country', 'gender'],
 *       onGroupChangeCallback: null,
 *       quickSearchField: 'lastName',
 *       quickSearchPlaceholder: { displayName :'lastName', customText: 'Enter text to search by' },
 *       onSearchChangeCallback: myQuickSearchHandler,
 *       sortByFields: ['lastName', 'country', 'gender'],
 *       sortByText: 'Sort By',
 *       onSortChangeCallback: mySortChangeHandler
 *  }
 * ```
 * @example
 * The default values for the sitFilterBar are as follows:
 * ```
 *  {
 *      currentGroupField: '',
 *      currentSortDirection: 'none',
 *      currentSortField: '',
 *      displayOptions: 'sqg',
 *      onFilterClickCallback: null,
 *      groupByFields: [],
 *      onGroupChangeCallback: null,
 *      quickSearchField: '',
 *      quickSearchPlaceholder: {},
 *      onSearchChangeCallback: null,
 *      sortByFields: [],
 *      sortByText: 'Sort By',
 *      onSortChangeCallback: null
 *  }
 * ```

 * @param {FilterOptions} filterOptions For a description of this object see {@link FilterOptions}
  */
    angular.module('siemens.simaticit.common.widgets.filterBar').directive('sitFilterBar', FilterBarDirective);

    FilterBarDirective.$inject = ['$timeout'];
    function FilterBarDirective($timeout) {
        /**
* @ngdoc object
* @module siemens.simaticit.common.widgets.filterBar
* @name filterBarConfigurationDefaults
* @access internal
* @description
* An object defining the default values for the **filterOptions** parameter
* of the {@link siemens.simaticit.common.widgets.filterBar} directive.
*
* ```
*  {
*      currentGroupField: '',
*      currentSortDirection: 'none',
*      currentSortField: '',
*      displayOptions: 'sqg',
*      onFilterClickCallback: null,
*      groupByFields: [],
*      onGroupChangeCallback: null,
*      quickSearchField: '',
*      quickSearchPlaceholder: {},
*      onSearchChangeCallback: null,
*      sortByFields: [],
*      sortByText: 'Sort By',
*      onSortChangeCallback: null
*  }
* ```
*
* See {@link siemens.simaticit.common.widgets.filterBar.filterBarConfigurationDetails} for a description of all options.
*
*/
        var filterBarConfigurationDefaults = {
            currentGroupField: '',
            currentSortDirection: 'none',
            currentSortField: '',
            displayOptions: 'sqg', //(s)ort, (q)uick search, (f)ilter, (g)roup
            onFilterClickCallback: null, //not currently supporting
            groupByFields: [],
            onGroupChangeCallback: null,
            quickSearchField: '',
            quickSearchPlaceholder: {},
            onSearchChangeCallback: null,
            sortByFields: [],
            onSortChangeCallback: null
        };

        /**
        * @ngdoc type
        * @module siemens.simaticit.common.widgets.filterBar
        * @name FilterOptions
        * @access internal
        * @description This provides a full description of the settings configured by the **filterOptions** parameter
        * of the {@link siemens.simaticit.common.widgets.filterBar} directive.
        * @property {String} [currentGroupField=undefined]
         *
         * Specifies the field to use for grouping data.
         *
         * The field must be one of the fields specified in the **groupByFields** property.
         * The value is updated if the user changes the grouping field through the UI.
         *
         * @property {String} [currentSortDirection='none']
         *
         * Defines the current sorting direction.
         *
         * Allowed values are **asc** and **desc**. (Not case sensitive)
         * The values are updated if the user changes the sort direction through the UI.
         *
         * @property {String} [currentSortField=undefined]
         *
         * Specifies the field to use for sorting data.
         *
         * The field must be one of hte fields specified in the **sortByFields** property.
         * The value is updated if the user changes the sorting field through the UI.
         *
         * @property {String} [displayOptions='sqg']
         *
         * Defines the UI elements that are visible.
         *
         * The value must be any combination of the following letter codes: (not case sensitive)
         * * **S**: Show sorting UI elements. This includes a dropdown list with field names and the asc/desc buttons.
         * * **Q**: Show the quick search input box.
         * * **F**: Not currently supported. Intended for showing filtering UI.
         * * **G**: Show dropdown list of fields for grouping data.
         *
         * @property {Function} [onFilterClickCallback=undefined]
         *
         * Filtering not currently supported.
         *
         * @property {String[]} [groupByFields=empty array]
         *
         * Defines the fields that may be used for grouping data.
         * Format is an array of strings.
         *
         * @property {Object[]} [groupByFields=empty array]
         *
         * Alternate method to define the fields that may be used for grouping data.
         * Format is an array of objects.  Each object must have a <em>field</em> property and a <em>displayName</em> property that will be displayed to the user.
         *
         * @property {Function} [onGroupChangeCallback=undefined]
         *
         * Specifies the function to call when the user changes the group field.
         *
         * @property {String} [quickSearchField=empty string]
         *
         * Defines the field used with quick search functionality.
         *
         * @property {Object} [quickSearchPlaceholder=undefined]
         *
         * Defines the field to be displayed as a placeholder with quick search functionality.
         *
         * @property {Function} [onSearchChangeCallback=undefined]
         *
         * Specifies the function to call when the user types into the quick search box.
         *
         * @property {String[]} [sortByFields=empty array]
         *
         * Defines the fields that may be used for sorting data.
         * Format is an array of strings.
         *
         * @property {Object[]} [sortByFields=empty array]
         *
         * Alternate method to define the fields that may be used for sorting data.
         * Format is an array of objects.  Each object must have a <em>field</em> property and a <em>displayName</em> property that will be displayed to the user.
         *
         * @property {String} [sortByText='Sort By']
         *
         * Text to use as a lable for the sort field dropdown list.
         *
         * @property {Function} [onSortChangeCallback=undefined]
         *
         * Specifies the function to call when the user changes the sort field.
        */


        /**
         * @ngdoc object
         * @module siemens.simaticit.common.widgets.filterBar
         * @name filterBarConfigurationDetails
         * @access internal
         * @description
         * This provides a full description of the settings configured by the **filterOptions** parameter
         * of the {@link siemens.simaticit.common.widgets.filterBar} directive.
         *
         *
         * @property {String} [currentGroupField=undefined]
         *
         * Specifies the field to use for grouping data.
         *
         * The field must be one of the fields specified in the **groupByFields** property.
         * The value is updated if the user changes the grouping field through the UI.
         *
         * @property {String} [currentSortDirection='none']
         *
         * Defines the current sorting direction.
         *
         * Allowed values are **asc** and **desc**. (Not case sensitive)
         * The values are updated if the user changes the sort direction through the UI.
         *
         * @property {String} [currentSortField=undefined]
         *
         * Specifies the field to use for sorting data.
         *
         * The field must be one of hte fields specified in the **sortByFields** property.
         * The value is updated if the user changes the sorting field through the UI.
         *
         * @property {String} [displayOptions='sqg']
         *
         * Defines the UI elements that are visible.
         *
         * The value must be any combination of the following letter codes: (not case sensitive)
         * * **S**: Show sorting UI elements. This includes a dropdown list with field names and the asc/desc buttons.
         * * **Q**: Show the quick search input box.
         * * **F**: Not currently supported. Intended for showing filtering UI.
         * * **G**: Show dropdown list of fields for grouping data.
         *
         * @property {Function} [onFilterClickCallback=undefined]
         *
         * Filtering not currently supported.
         *
         * @property {String[]} [groupByFields=empty array]
         *
         * Defines the fields that may be used for grouping data.
         * Format is an array of strings.
         *
         * @property {Object[]} [groupByFields=empty array]
         *
         * Alternate method to define the fields that may be used for grouping data.
         * Format is an array of objects.  Each object must have a <em>field</em> property and a <em>displayName</em> property that will be displayed to the user.
         *
         * @property {Function} [onGroupChangeCallback=undefined]
         *
         * Specifies the function to call when the user changes the group field.
         *
         * @property {String} [quickSearchField=undefined]
         *
         * Defines the field used with quick search functionality.
         *
         * @property {Object} [quickSearchPlaceholder=undefined]
         *
         * Defines the field to be displayed as a placeholder with quick search functionality.
         *
         * @property {Function} [onSearchChangeCallback=undefined]
         *
         * Specifies the function to call when the user types into the quick search box.
         *
         * @property {String[]} [sortByFields=empty array]
         *
         * Defines the fields that may be used for sorting data.
         * Format is an array of strings.
         *
         * @property {Object[]} [sortByFields=empty array]
         *
         * Alternate method to define the fields that may be used for sorting data.
         * Format is an array of objects.  Each object must have a <em>field</em> property and a <em>displayName</em> property that will be displayed to the user.
         *
         * @property {String} [sortByText='Sort By']
         *
         * Text to use as a lable for the sort field dropdown list.
         *
         * @property {Function} [onSortChangeCallback=undefined]
         *
         * Specifies the function to call when the user changes the sort field.
         *
         */
        var filterBarConfigurationDetails = {
        };
        return {
            restrict: 'E',
            bindToController: {
                filterOptions: '=sitFilterOptions'
            },
            scope: {},
            link: function (scope, element, attr, ctrl) {
                var eventHandlers = [];
                eventHandlers[eventHandlers.length] = scope.$watch(function () {
                    return ctrl.filterOptions;
                }, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        ctrl.setDisplayOptions();
                        ctrl.groupSelectChange(ctrl.options.currentGroupField);
                    }
                    ctrl.setApiMethods();
                });
                eventHandlers[eventHandlers.length] = scope.$on('sit-item-collection-viewer.rows-selection-changed', function (event, filterOptions) {
                    ctrl.options.tagsManagerButton = filterOptions.tagsManagerButton;
                    ctrl.options.exportManagerButton = filterOptions.exportManagerButton;
                });
                eventHandlers[eventHandlers.length] = scope.$on('sit-table.rows-selection-changed', function (event, enableExport) {
                    ctrl.options.exportManagerButton = enableExport;
                });
                scope.$on('$destroy', function () {
                    eventHandlers.forEach(function (events) {
                        events();
                    });
                });

                var LARGE_WIDTH = 360;      // less than 360px width - buttons will have only icon
                $timeout(function () {
                    var filterBarWidth;
                    filterBarWidth = element.parents('.sit-item-collection-viewer').find('.filter-bar-holder').width();

                    !filterBarWidth && (filterBarWidth = element.parents('table').find('tr:first').width());

                    if (filterBarWidth <= LARGE_WIDTH) {
                        ctrl.commandBarData.bar.forEach(function (button) {
                            button.label = '';
                        })
                        if (ctrl.showQuickSearchControl) {
                            _.findWhere(ctrl.commandBarData.bar, {
                                name: 'search'
                            }).visibility = true;

                            _.findWhere(ctrl.commandBarData.bar, {
                                name: 'inlineSearch'
                            }).visibility = false;
                        }
                    }
                }, 0, false)
            },

            controller: FilterBarController,
            controllerAs: 'filterBarCtrl',
            templateUrl: 'common/widgets/filterBar/filter-bar.html'
        };
    }

    FilterBarController.$inject = ['$scope', '$translate', '$rootScope', 'common', 'LOG_TYPES', 'common.services.security.securityService',
        'common.services.security.functionRightModel', 'common.services.tagsManager.tagsManagementService', 'common.services.authentication', 'common.services.personalization.personalizationService'];
    function FilterBarController($scope, $translate, $rootScope, common, LOG_TYPES, securityService, functionRightModel, tagsManagementService, authenticationService, personalizationService) {
        var vm = this;
        var logInfoFn = common.logger.getLogFn('FilterBar Widget', LOG_TYPES.INFO);
        var BUTTON_NAMES = {
            filter: 'Filter',
            filterOpen: 'FilterOpen',
            mode: 'Mode',
            sortBy: 'Sort By',
            groupBy: 'Group By',
            search: 'search',
            inLineSearch: 'inlineSearch',
            segregationTags: 'Manage Tags',
            export: 'Export',
            userPreference: 'User Preference',
            resetColumnsWidth: 'Reset columns width',
            compactSearchField: 'compact search field',
            download: 'Download'
        }
        Object.freeze(BUTTON_NAMES);

        vm.logErrorFn = logErrorFn;
        vm.showFilterBar = false;

        function logErrorFn(message, attributes) {
            common.logger.logError(message, attributes, 'siemens.simaticit.common.widgets.filterBar');
        }
        var defaultOptions = {
            currentGroupField: '',
            currentSortDirection: 'none',
            currentSortField: '',
            displayOptions: 'sqg', //(s)ort, (q)uick search, (f)ilter, (g)roup
            onFilterClickCallback: null, //not currently supporting
            groupByFields: [],
            onGroupChangeCallback: null,
            quickSearchField: '',
            quickSearchPlaceholder: {},
            onSearchChangeCallback: null,
            sortByFields: [],
            onSortChangeCallback: null,
            downloadOptions: { enabled: false, tooltip: '' }
        };
        var isUserPrefEnabled = true;
        var isResetSort = false;
        vm.isUserAuthorised = false;
        vm.showTagsManagerButton = false;
        vm.showExportManagerButton = false;

        // debounce so we don't re-filter the data until the user stops typing
        var changeQuickSearch = _.debounce(function (searchText) {
            $scope.$apply(vm.doQuickSearch(searchText));
        }, 500);

        function init() {
            vm.viewMode = [];
            vm.multiSelection = [];
            vm.selectAll = [];
            vm.eventListner = [];
            vm.convertToObjects = convertToObjects;
            vm.setSelectedSort = setSelectedSort;
            vm.selectView = selectView;
            vm.onSelectButtonShowChange = onSelectButtonShowChange;
            vm.setDisplayOptions = setDisplayOptions;
            vm.setSearchAvailability = setSearchAvailability;
            vm.groupTooltip = $translate.instant('filterBar.groupTitle');
            vm.filterButton = [{
                svgIcon: 'common/icons/cmdFilter24.svg',
                selected: false,
                tooltip: $translate.instant('filterBar.filterTitle'),
                onClickCallback: function () { vm.onFilterClicked(); }
            }];
            vm.preferenceButton = [{
                svgIcon: 'common/icons/cmdAdmin24.svg',
                selected: false,
                tooltip: $translate.instant('filterBar.userPreferenceTitle'),
                onClickCallback: function () { vm.onPreferenceButtonClicked(); }
            }];
            vm.resetColumnsWidthButton = [{
                svgIcon: 'common/icons/cmdResetCounter24.svg',
                selected: false,
                tooltip: $translate.instant('filterBar.resetColumnsWidthTitle'),
                onClickCallback: function () { vm.onResetColumnsWidthButtonClicked(); }
            }];
            vm.SegregationTagsButton = [{
                svgIcon: 'common/icons/cmdTags24.svg',
                selected: false,
                tooltip: $translate.instant('filterBar.segregationTagsTitle'),
                onClickCallback: function () { vm.onSegregationTagsButtonClicked(); }
            }];
            vm.ExportButton = [{
                svgIcon: 'common/icons/cmdExport24.svg',
                selected: false,
                tooltip: $translate.instant('filterBar.exportTitle'),
                onClickCallback: function () { vm.onExportButtonClicked(); }
            }];

            if (window.$UIF.Object.safeGet(vm.filterOptions, 'sortByFields.length') && !_.find(vm.filterOptions.sortByFields, function (item) { return item.field === 'asc' || item.field === 'desc' })) {
                vm.filterOptions.sortByFields.push({ displayName: $translate.instant('filterBar.ascending'), field: 'asc' }, { displayName: $translate.instant('filterBar.descending'), field: 'desc' });
            }


            vm.setSortDirection = setSortDirection;
            vm.onSortChanged = onSortChanged;
            vm.onFilterClicked = onFilterClicked;
            vm.groupSelectChange = groupSelectChange;
            vm.onPreferenceButtonClicked = onPreferenceButtonClicked;
            vm.onResetColumnsWidthButtonClicked = onResetColumnsWidthButtonClicked;
            vm.onSegregationTagsButtonClicked = onSegregationTagsButtonClicked;
            vm.onExportButtonClicked = onExportButtonClicked;
            vm.groupStatus = {
                isOpen: false,
                groupField: null,
                groupFieldSource: null
            };

            vm.isGridMode = window.$UIF.Object.safeGet(vm.filterOptions, 'viewBarOptions.grid.selected');
            vm.itemSelected = itemSelected;
            vm.quickSearchText = vm.filterOptions.quickSearchText;
            vm.quickSearchPlaceholder = vm.filterOptions.quickSearchPlaceholder;
            vm.doQuickSearch = doQuickSearch;
            vm.getSortVisible = getSortVisible;
            vm.getSearchVisible = getSearchVisible;
            vm.getFilterVisible = getFilterVisible;
            vm.setFilterSelected = setFilterSelected;
            vm.getGroupVisible = getGroupVisible;
            vm.getTagsManagerVisible = getTagsManagerVisible;
            vm.getExportManagerVisible = getExportManagerVisible;
            vm.getSearchText = getSearchText;
            vm.getGroupField = getGroupField;
            vm.getGroupFieldSource = getGroupFieldSource;
            vm.getSortInfo = getSortInfo;
            vm.setApiMethods = setApiMethods;
            vm.setViewModeOptions = setViewModeOptions;
            vm.setDefaultFilterBar = setDefaultFilterBar;
            vm.resetSort = resetSort;
        }

        function userAuthorisationCheck() {
            var functionRight = new functionRightModel("business_command", "Siemens.SimaticIT.System.System.SAPOMModel.Commands.Published.SetUserPreference", "invoke");
            var funRightListModel = [functionRight];
            securityService.canPerformOp(funRightListModel).then(function (data) {
                if (data) {
                    if (data.length > 0) {
                        vm.isUserAuthorised = data[0].isAccessible;
                        findDataInCommandBar(BUTTON_NAMES.userPreference).visibility = vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData;
                        findDataInCommandBar(BUTTON_NAMES.resetColumnsWidth).visibility = vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData && vm.isGridMode;
                        if (isUserPrefEnabled) {
                            findDataInCommandBar('reset_sort').visibility = vm.isUserAuthorised;
                            findDataInCommandBar('reset_seperator').visibility = vm.isUserAuthorised;
                        }
                    }
                }
            }, function (error) {
                vm.logErrorFn('-1: Command Error: user data is not present1', error);
            });
        }



        function activate() {
            init();
            if (authenticationService.isAuthorized()) {
                userAuthorisationCheck();
            }
            vm.setDisplayOptions();
            vm.groupSelectChange(vm.options.currentGroupField);
            vm.setApiMethods();
            vm.setViewModeOptions();
            vm.setDefaultFilterBar();
            formGroupData();
            activateListener();
            initEventSubscriptions();
            showFilterBar();
        }

        activate();

        function manageFilterButtons(isFilterPanel, filterButton, filterOpenButton) {
            if (!isFilterPanel) {
                if (!vm.compactMode) {
                    filterButton.visibility = true;
                }
                filterOpenButton.visibility = false;
            }
            filterButton.badge = {
                state: 'information',
                value: 1
            }
            filterOpenButton.badge = {
                state: 'information',
                value: 1
            }
        }

        function activateListener() {
            var filterButton = findDataInCommandBar(BUTTON_NAMES.filter);
            var filterOpenButton = findDataInCommandBar(BUTTON_NAMES.filterOpen);
            vm.eventListner[vm.eventListner.length] = $rootScope.$on('sit-filter-panel-closed', function () {
                filterButton.visibility = true;
                filterOpenButton.visibility = false;
                filterButton.selected = false;
                filterOpenButton.selected = false;
            });
            if (vm.filterOptions.viewBarOptions && vm.filterOptions.viewBarOptions.grid) {
                vm.eventListner[vm.eventListner.length] = $rootScope.$on('sit-item-collection-viewer.change-view-mode-completed.' +
                    vm.filterOptions.viewBarOptions.grid.id, onChangeViewMode);
            }
            vm.eventListner[vm.eventListner.length] = $scope.$watch(function () {
                return vm.filterOptions.quickSearchText;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.quickSearchText = vm.filterOptions.quickSearchText;
                }
            });
            vm.eventListner[vm.eventListner.length] = $scope.$watch(function () {
                return vm.options.tagsManagerButton;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    findDataInCommandBar(BUTTON_NAMES.segregationTags).visibility = newVal;
                }
            });
            vm.eventListner[vm.eventListner.length] = $scope.$watch(function () {
                return vm.options.exportManagerButton;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    findDataInCommandBar(BUTTON_NAMES.export).visibility = newVal;
                }
            });
            vm.eventListner[vm.eventListner.length] = $scope.$watch(function () {
                return vm.filterOptions.noData;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal && !vm.filterOptions.noData) {
                    findDataInCommandBar(BUTTON_NAMES.userPreference).visibility = vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData;
                    findDataInCommandBar(BUTTON_NAMES.resetColumnsWidth).visibility = vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData && vm.isGridMode;
                }
                findDataInCommandBar(BUTTON_NAMES.download).visibility = vm.options.downloadOptions.enabled && !vm.filterOptions.noData && vm.isGridMode;
            });
        }
        function convertToObjects(arrayToConvert) {
            var configObjects = [];
            // if group by fields are only strings, convert to objects
            angular.forEach(arrayToConvert, function (configItem) {
                if (angular.isString(configItem)) {
                    configObjects.push({ displayName: configItem, field: configItem });
                } else {
                    configObjects.push(configItem);
                }
            });
            return configObjects;
        }

        function setSelectedSort(selectedField, selectedDirection, selectedFieldSource) {
            var directions = ['asc', 'desc'];
            var sortDirection, sortField, sortFieldSource;
            var directionList = [];
            var fieldList = [];

            if (vm.commandBarData) {
                sortDirection = selectedDirection;
                sortField = selectedField;
                sortFieldSource = selectedFieldSource;

                if (typeof (selectedField) === 'object') {
                    if (directions.indexOf(selectedField.field) !== -1) {
                        sortDirection = selectedField.field;
                        sortField = vm.options.currentSortField;
                    } else {
                        sortDirection = vm.options.currentSortDirection;
                        sortField = selectedField.field;
                    }
                }

                var sortButton = findDataInCommandBar(BUTTON_NAMES.sortBy);

                sortButton.group.forEach(function (item) {
                    if (directions.indexOf(item.field) !== -1) {
                        directionList.push(item);
                    } else {
                        fieldList.push(item);
                    }
                });

                directionList.forEach(function (direction) {
                    direction.selected = direction.field === sortDirection;
                })
                fieldList.forEach(function (fieldData) {
                    fieldData.selected = fieldData.field === sortField;
                });

                sortField && (vm.options.currentSortField = sortField);
                sortDirection && (vm.options.currentSortDirection = sortDirection);
            }

            vm.selectedSort = _.find(vm.options.sortByFields, function (sortField) { return sortField.field === vm.options.currentSortField; });
            if (!vm.selectedSort) {
                vm.selectedSort = {
                    field: '',
                    direction: 'none'
                };
            }
            onSortChanged();
            vm.options.oldSortDirection = sortDirection;
        }

        function setDisplayOptions() {
            vm.options = $.extend(true, {}, defaultOptions, vm.filterOptions);
            vm.options.groupByFields = vm.convertToObjects(vm.options.groupByFields);
            vm.options.sortByFields = vm.convertToObjects(vm.options.sortByFields);
            vm.options.oldSortDirection = vm.options.currentSortField;
            // if user did not configure a current sort field
            // - select first field
            // - but set direction to 'none' so no button highlight to indicate no sort direction
            if (!vm.options.currentSortField) {
                vm.options.currentSortDirection = 'none';
                if (vm.options.sortByFields.length > 0) {
                    vm.options.currentSortField = vm.options.sortByFields[0].field;
                }
            }

            if (!vm.options.userPrefData || !vm.options.userPrefData.userPrefId) {
                isUserPrefEnabled = false;
            }

            if (isUserPrefEnabled) {
                vm.userPrefId = vm.options.userPrefData.userPrefId;

                //save the default sort options
                vm.defaultSortField = vm.options.userPrefData.defaultSortInfo.field;
                vm.defaultSortDirection = vm.options.userPrefData.defaultSortInfo.direction;

                //get saved sort definition
                vm.savedUserPrefData = personalizationService.getCurrentUserPreference('sit-filter-bar', vm.userPrefId + '_FilterBar');
                if (!vm.savedUserPrefData) {
                    vm.savedUserPrefData = {};
                }
                if (!vm.savedUserPrefData.currentSortField) {
                    vm.setSelectedSort(vm.options.currentSortField);
                } else {
                    vm.options.currentSortField = vm.savedUserPrefData.currentSortField;
                    vm.options.currentSortDirection = vm.savedUserPrefData.currentSortDirection;
                    vm.options.currentSortFieldSource = vm.savedUserPrefData.currentSortFieldSource;
                    vm.setSelectedSort(vm.options.currentSortField, vm.options.currentSortDirection, vm.options.currentSortFieldSource);
                }
            } else {
                vm.setSelectedSort(vm.options.currentSortField);
            }

            vm.showSortDirectionControls = vm.options.currentSortDirection;
            var displayOptions = vm.options.displayOptions.toLowerCase();
            vm.showSortControls = displayOptions.indexOf('s') !== -1 && vm.options.sortByFields.length > 0;
            vm.showQuickSearchControl = displayOptions.indexOf('q') !== -1;
            vm.showFilterButton = displayOptions.indexOf('f') !== -1 && vm.options.filterFields && (vm.options.filterFields.length > 0 || (vm.options.filterFields.fields && vm.options.filterFields.fields.length > 0));
            vm.compactMode = displayOptions.indexOf('c') !== -1;
            vm.showGroupButton = !vm.compactMode && displayOptions.indexOf('g') !== -1 && vm.options.groupByFields.length > 0;
            vm.isPersonalizationAllowed = displayOptions.indexOf('p') !== -1;
            vm.quickSearchText = vm.options.quickSearchText;
            vm.sortStyle = {
                'max-width': '145px'
            };
            vm.showTagsManagerButton = tagsManagementService.isDataSegregationEnabled();
            vm.showExportButton = vm.options.exportManagerButton;
            // for compact mode, fix some widths depending on what is showing to make layout look a bit better
            if (vm.compactMode) {
                vm.openLeft = true;
                if (vm.showSortControls) {
                    if (vm.showQuickSearchControl || (vm.showFilterButton && vm.showGroupButton)) {
                        vm.sortStyle = {
                            'width': '150px'
                        };
                    } else if (!vm.showQuickSearchControl && (vm.showFilterButton || vm.showGroupButton)) {
                        // make only one row by putting the single button on same row as sort
                        vm.sortStyle = {
                            'width': '140px'
                        };
                    }
                }
                if (vm.showQuickSearchControl) {
                    //EXPORT: modify width
                    if (vm.showGroupButton && vm.showTagsManagerButton) {
                        vm.searchStyle = { 'width': '134px' };
                        vm.searchContainerStyle = { 'width': '138px' };
                    }
                    else {
                        if (vm.showGroupButton || vm.showTagsManagerButton) {
                            vm.searchStyle = { 'width': '161px' };
                            vm.searchContainerStyle = { 'width': '165px' };
                        }
                    }
                }
            }
        }

        // handle click of the sort direction buttons
        function setSortDirection(direction) {
            if (vm.options.currentSortDirection !== direction) {
                vm.options.currentSortDirection = direction;
                if (vm.options.onSortChangeCallback) {
                    vm.options.onSortChangeCallback(vm.options.currentSortField, direction);
                }
            }
        }

        // handle change of selected sorting field
        function onSortChanged() {
            // handle case of no prior sort and highlight a sort button
            if (vm.options.currentSortDirection === '' || vm.options.currentSortDirection === 'none') {
                vm.options.currentSortDirection = 'asc';
            }
            vm.options.currentSortField = ['', 'asc', 'desc'].indexOf(vm.selectedSort.field) !== -1 ?
                vm.options.currentSortField : vm.selectedSort.field;
            vm.options.currentSortFieldSource = vm.selectedSort.fieldSource || '';
            saveSortInfo();
            window.$UIF.Function.safeCall(vm.options, 'onSortChangeCallback', vm.options.currentSortField, vm.options.currentSortDirection, vm.options.currentSortFieldSource);
        }

        function saveSortInfo() {
            //save selected sort definition

            // scenario: if user preference id is not set
            if (!isUserPrefEnabled || !vm.isUserAuthorised) {
                return;
            }
            // position: no saved user preferences and the current sort field is equals default sort field
            // scenario: initial load, post reset
            //action: no save requied
            if (!vm.savedUserPrefData.currentSortField && vm.defaultSortField === vm.options.currentSortField) {
                return;
            }

            // internal call inside filterbar or from icv, grid
            // ideal case: when the saved sort information and the current sort information are same
            // action: discard the save
            if (!isResetSort && vm.savedUserPrefData.currentSortField === vm.options.currentSortField
                && vm.savedUserPrefData.currentSortDirection === vm.options.currentSortDirection) {
                return;
            }

            //when user clicks on reset sort
            //remove the sort information and save
            if (isResetSort) {
                isResetSort = false;

                delete vm.savedUserPrefData.currentSortField;
                delete vm.savedUserPrefData.currentSortDirection;
                delete vm.savedUserPrefData.currentSortFieldSource;
                personalizationService.setPersonalization('sit-filter-bar', vm.userPrefId + '_FilterBar', vm.savedUserPrefData);
                return;
            }

            //regular case
            vm.savedUserPrefData.currentSortField = vm.options.currentSortField;
            vm.savedUserPrefData.currentSortDirection = vm.options.currentSortDirection;
            vm.savedUserPrefData.currentSortFieldSource = vm.options.currentSortFieldSource;
            personalizationService.setPersonalization('sit-filter-bar', vm.userPrefId + '_FilterBar', vm.savedUserPrefData);
        }

        // handle click on the filter button
        function onFilterClicked(isFilterOpen) {
            // do NOT toggle the selected status of the button
            vm.filterButton[0].selected = !vm.filterButton[0].selected;
            //update the filter open/close status of the filter toggle buttons
            var filterButton = findDataInCommandBar(BUTTON_NAMES.filter);
            var filterOpenButton = findDataInCommandBar(BUTTON_NAMES.filterOpen);
            filterButton.visibility = !isFilterOpen;
            filterButton.selected = false;
            filterOpenButton.visibility = isFilterOpen;
            filterOpenButton.selected = isFilterOpen;
            if (vm.options.onFilterClickCallback) {
                vm.options.onFilterClickCallback(vm.filterButton[0].selected);
            }
        }

        // handle change of selected grouping field
        function groupSelectChange(args) {
            if (vm.commandBarData && findDataInCommandBar(BUTTON_NAMES.groupBy).group.length) {
                findDataInCommandBar(BUTTON_NAMES.groupBy).group.forEach(function (element) {
                    if (element.label !== args.label) {
                        element.selected = false;
                    }
                    if (element.label === args.label) {
                        element.selected = true;
                    }
                });
            }
            var groupField = args;
            if (typeof args === 'object') {
                groupField = args && args.field && args.field !== 'none' ? args.field : undefined;
            }

            var groupByField = {};
            groupByField = _.find(vm.options.groupByFields, function (item) {
                return item.field === groupField;
            });

            var fieldSource = groupByField ? groupByField.fieldSource : '';
            if (vm.options.onGroupChangeCallback) {
                vm.options.onGroupChangeCallback(groupField, fieldSource);
            }

            vm.groupStatus.groupField = groupField;
            vm.groupStatus.groupFieldSource = fieldSource;
            vm.groupStatus.isOpen = false;
            vm.optionSelectedClass = groupField ? 'switch-button-select' : '';
            var msg = '[Controller.groupSelectChange] Group select was changed \n"';
            var data = {
                'field': groupField
            };
            logInfoFn(msg, data);
        }

        function onPreferenceButtonClicked() {
            vm.preferenceButton[0].selected = false;
            if (vm.options.onPreferenceButtonClicked) {
                vm.options.onPreferenceButtonClicked();
            }
        }

        function onResetColumnsWidthButtonClicked() {
            vm.resetColumnsWidthButton[0].selected = false;
            if (vm.options.onResetColumnsWidthButtonClicked) {
                vm.options.onResetColumnsWidthButtonClicked();
            }
        }

        function onSegregationTagsButtonClicked() {
            if (vm.options.onSegregationTagsButtonClicked) {
                vm.options.onSegregationTagsButtonClicked();
            }
        }

        function onExportButtonClicked() {
            if (vm.options.onExportButtonClicked) {
                vm.options.onExportButtonClicked();
            }
        }

        function itemSelected(field) {
            var selected = false;
            if (field) {
                selected = vm.groupStatus.groupField === field;
            } else {
                selected = !vm.groupStatus.groupField;
            }
            return selected;
        }

        function doQuickSearch(searchText) {
            vm.options.searchText = searchText;
            vm.quickSearchText = searchText;
            if (vm.options.onSearchChangeCallback) {
                vm.options.onSearchChangeCallback(searchText);
                $scope.$emit('filterbar.quicksearch.done');
            }
        }

        function onDownloadClicked() {
            if (!vm.options.downloadOptions.onClick) {
                return;
            }
            vm.options.downloadOptions.onClick();
        }

        ///////////////////////////////////////////////////////////////////////////////////
        //  API Methods
        ///////////////////////////////////////////////////////////////////////////////////

        // are the sort controls visible
        function getSortVisible() {
            return vm.showSortControls;
        }
        // is the search control visible
        function getSearchVisible() {
            return vm.showQuickSearchControl;
        }
        // is the filter button visible
        function getFilterVisible() {
            return vm.showFilterButton;
        }
        // set whether the filter button should be displayed as selected
        function setFilterSelected(selected) {
            vm.filterButton[0].selected = selected;
        }
        // is the group button visible
        function getGroupVisible() {
            return vm.showGroupButton;
        }
        // is the Tags Manager button visible
        function getTagsManagerVisible() {
            return vm.showTagsManagerButton;
        }

        // is the Export Manager button visible
        function getExportManagerVisible() {
            return vm.showExportManagerButton;
        }

        function getSearchText() {
            return vm.quickSearchText;
        }

        function getGroupField() {
            return vm.groupStatus.groupField;
        }

        function getGroupFieldSource() {
            return vm.groupStatus.groupFieldSource;
        }

        function getSortInfo() {
            return {
                field: vm.options.currentSortField,
                direction: vm.options.currentSortDirection,
                fieldSource: vm.options.currentSortFieldSource
            };
        }

        function updateFilterBadge(widget) {
            var filterButton = findDataInCommandBar(BUTTON_NAMES.filter);
            var filterOpenButton = findDataInCommandBar(BUTTON_NAMES.filterOpen);
            filterButton.selected = widget !== 'ICV';
            var isFilterPanel = widget === 'sitFilterPanel';
            manageFilterButtons(isFilterPanel, filterButton, filterOpenButton);
        }

        function resetFilterBadge() {
            var filterButton = findDataInCommandBar(BUTTON_NAMES.filter);
            var filterOpenButton = findDataInCommandBar(BUTTON_NAMES.filterOpen);
            filterButton.badge = null;
            filterOpenButton.badge = null;
        }

        function setApiMethods() {
            vm.filterOptions.changeSort = vm.setSelectedSort;
            vm.filterOptions.getFilterVisible = vm.getFilterVisible;
            vm.filterOptions.setFilterSelected = vm.setFilterSelected;
            vm.filterOptions.getGroupField = vm.getGroupField;
            vm.filterOptions.getGroupVisible = vm.getGroupVisible;
            vm.filterOptions.getSearchText = vm.getSearchText;
            vm.filterOptions.getSearchVisible = vm.getSearchVisible;
            vm.filterOptions.getSortInfo = vm.getSortInfo;
            vm.filterOptions.getSortVisible = vm.getSortVisible;
            vm.filterOptions.getTagsManagerVisible = vm.getTagsManagerVisible;
            vm.filterOptions.getExportManagerVisible = vm.getExportManagerVisible;
            vm.filterOptions.updateFilterBadge = updateFilterBadge;
            vm.filterOptions.resetFilterBadge = resetFilterBadge;
            vm.filterOptions.getGroupFieldSource = vm.getGroupFieldSource;
        }

        function showDownloadOption(visibility) {
            //show downlaod button for grid and hide for tiles
            findDataInCommandBar(BUTTON_NAMES.download).visibility = vm.options.downloadOptions.enabled && !vm.filterOptions.noData && vm.isGridMode;
        }

        function selectView(args) {
            vm.isGridMode = false;

            if (vm.commandBarData && findDataInCommandBar(BUTTON_NAMES.mode).group.length) {
                var modeButton = findDataInCommandBar(BUTTON_NAMES.mode);
                modeButton.group.forEach(function (element) {
                    if (element.name !== args.name) {
                        element.selected = false;
                    }
                    if (element.name === args.name) {
                        element.selected = true;
                        modeButton.svgIcon = args.svgIcon;
                    }
                });
            }
            if (args && args.name === 'Grid' && vm.viewMode[0].callback) {
                vm.isGridMode = true;
                vm.viewMode[0].callback(true);
            }
            if (args && args.name === 'Small' && vm.viewMode[1].callback) {
                vm.viewMode[1].callback(true);
            }
            if (args && args.name === 'Medium' && vm.viewMode[2].callback) {
                vm.viewMode[2].callback(true);
            }
            if (args && args.name === 'Large' && vm.viewMode[3].callback) {
                vm.viewMode[3].callback(true);
            }
            showDownloadOption();
        }

        function onSelectButtonShowChange(args) {
            if (args.name === "Multi-select") {
                if (args.selected) {
                    vm.multiSelection[0].callback(true);
                } else {
                    vm.multiSelection[0].callback(false);
                }
            }

            if (args.name === "Select-all") {
                if (args.selected) {
                    vm.selectAll[0].callback(true);
                } else {
                    vm.selectAll[0].callback(false);
                }
            }
        }

        function onChangeViewMode(event, args) {
            if (args.view) {
                var modeButton = findDataInCommandBar(BUTTON_NAMES.mode);
                modeButton.group.forEach(function (mode, index) {
                    modeButton.group[index].selected = mode.name.toLowerCase() === args.view.toLowerCase();
                });

                vm.isGridMode = args.view === 'Grid' ? true : false;
                showDownloadOption();
            }
        }

        function setViewModeOptions() {
            if (!vm.filterOptions.viewBarOptions) {
                vm.multiSelection = [{
                    field: 'Multi-select',
                    selected: false,
                    show: false,
                    svgIcon: "common/icons/cmdCriteria24.svg"
                }];
                vm.selectAll = [{
                    field: 'Select-all',
                    selected: false,
                    show: false,
                    svgIcon: "common/icons/cmdSquareCheck24.svg"
                }];
            } else {
                vm.multiSelection.push({
                    field: 'Multi-select',
                    selected: vm.filterOptions.viewBarOptions.check.selected,
                    show: vm.filterOptions.viewBarOptions.check.show,
                    svgIcon: "common/icons/cmdCriteria24.svg",
                    callback: vm.filterOptions.viewBarOptions.check.onClickCallback
                });
                vm.selectAll.push({
                    field: 'Select-all',
                    selected: vm.filterOptions.viewBarOptions.details.selected,
                    show: vm.filterOptions.viewBarOptions.details.show,
                    svgIcon: "common/icons/cmdSquareCheck24.svg",
                    callback: vm.filterOptions.viewBarOptions.check.onClickCallback
                });
                if (vm.filterOptions.viewBarOptions.grid) {
                    vm.viewMode.push({
                        field: 'Grid',
                        selected: vm.filterOptions.viewBarOptions.grid.selected,
                        show: vm.filterOptions.viewBarOptions.grid.show,
                        svgIcon: "common/icons/cmdTableView24.svg",
                        callback: vm.filterOptions.viewBarOptions.grid.onClickCallback
                    });
                }
                if (vm.filterOptions.viewBarOptions.smallTile) {
                    vm.viewMode.push({
                        field: 'Small',
                        selected: vm.filterOptions.viewBarOptions.smallTile.selected,
                        show: vm.filterOptions.viewBarOptions.smallTile.show,
                        svgIcon: "common/icons/cmdListView24.svg",
                        callback: vm.filterOptions.viewBarOptions.smallTile.onClickCallback
                    });
                }
                if (vm.filterOptions.viewBarOptions.mediumTile) {
                    vm.viewMode.push({
                        field: 'Medium',
                        selected: vm.filterOptions.viewBarOptions.mediumTile.selected,
                        show: vm.filterOptions.viewBarOptions.mediumTile.show,
                        svgIcon: "common/icons/cmdListView24.svg",
                        callback: vm.filterOptions.viewBarOptions.mediumTile.onClickCallback
                    });
                }
                if (vm.filterOptions.viewBarOptions.largeTile) {
                    vm.viewMode.push({
                        field: 'Large',
                        selected: vm.filterOptions.viewBarOptions.largeTile.selected,
                        show: vm.filterOptions.viewBarOptions.largeTile.show,
                        svgIcon: "common/icons/cmdListView24.svg",
                        callback: vm.filterOptions.viewBarOptions.largeTile.onClickCallback
                    });
                }
            }
        }

        function setDefaultFilterBar() {
            vm.commandBarData =
            {
                "barType": "Action",
                "bar": [
                    {
                        "label": "",
                        "name": BUTTON_NAMES.filter,
                        "tooltip": $translate.instant('filterBar.filterTitle'),
                        "selected": false,
                        "svgIcon": "common/icons/cmdFilter24.svg",
                        "type": "toggle",
                        "visibility": !vm.compactMode && vm.showFilterButton,
                        'onClickCallback': function () { vm.onFilterClicked(true); }
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.filterOpen,
                        "tooltip": $translate.instant('filterBar.filterTitle'),
                        "selected": false,
                        "svgIcon": "common/icons/cmdFilterRemove24.svg",
                        "type": "toggle",
                        "visibility": false,
                        'onClickCallback': function () { vm.onFilterClicked(false); }
                    },
                    {

                        "label": "",
                        "name": vm.selectAll[0].field,
                        "tooltip": $translate.instant('filterBar.selectAll'),
                        "selected": vm.selectAll[0].selected,
                        "svgIcon": vm.selectAll[0].svgIcon,
                        "visibility": vm.selectAll[0].show,
                        "type": "toggle",
                        'onClickCallback': function (args) {
                            vm.onSelectButtonShowChange(args);
                        }
                    },
                    {
                        "label": $translate.instant('filterBar.mode'),
                        "name": BUTTON_NAMES.mode,
                        "tooltip": $translate.instant('filterBar.mode'),
                        "type": "Group",
                        "svgIcon": "common/icons/cmdTableView24.svg",
                        "group": []
                    },
                    {
                        "label": "",
                        "name": vm.multiSelection[0].field,
                        "tooltip": $translate.instant('filterBar.multiSelection'), //vm.multiSelection[0].field,
                        "selected": vm.multiSelection[0].selected,
                        "svgIcon": vm.multiSelection[0].svgIcon,
                        "visibility": vm.multiSelection[0].show,
                        "type": "toggle",
                        'onClickCallback': function (args) {
                            vm.onSelectButtonShowChange(args);
                        }
                    },
                    {
                        "label": !vm.compactMode ? $translate.instant('filterBar.sortby') : '',
                        "name": BUTTON_NAMES.sortBy,
                        "tooltip": $translate.instant('filterBar.sortby'),
                        "svgIcon": "common/icons/cmdSort24.svg",
                        "type": "Group",
                        "group": [
                        ],
                        "selected": false,
                        "visibility": vm.showSortControls && vm.showSortDirectionControls !== ''
                    },
                    {
                        "label": $translate.instant('filterBar.groupTitle'),
                        "name": BUTTON_NAMES.groupBy,
                        "tooltip": $translate.instant('filterBar.groupTitle'),
                        "type": "Group",
                        "svgIcon": "common/icons/cmdGroupBy24.svg",
                        "group": [
                        ]
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.search,
                        "tooltip": $translate.instant('filterBar.quick-search'),
                        "svgIcon": "common/icons/cmdSearch24.svg",
                        "type": "toggle",
                        "visibility": vm.compactMode && vm.showQuickSearchControl,
                        'onClickCallback': function () {
                            var searchFieldButton = findDataInCommandBar(BUTTON_NAMES.compactSearchField);
                            searchFieldButton.quickSearchText = vm.quickSearchText;
                            searchFieldButton.visibility = !searchFieldButton.visibility;
                            $rootScope.$broadcast('compact-quick-search-enabled');
                        }
                    },
                    {
                        "name": BUTTON_NAMES.inLineSearch,
                        "type": "search",
                        "placeholder": getQuickSearchPlaceholder(),
                        "quickSearchText": vm.quickSearchText,
                        "visibility": !vm.compactMode && vm.showQuickSearchControl,
                        "changeCallback": changeQuickSearch,
                        "clickCallback": changeQuickSearch,
                        "disableSearch": false
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.segregationTags,
                        "tooltip": $translate.instant('filterBar.segregationTagsTitle'),
                        "svgIcon": "common/icons/cmdTags24.svg",
                        "type": "Command",
                        "visibility": vm.options.tagsManagerButton,
                        'onClickCallback': function () { vm.onSegregationTagsButtonClicked(); }
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.userPreference,
                        "tooltip": $translate.instant('filterBar.userPreferenceTitle'),
                        "svgIcon": "common/icons/cmdSliders24.svg",
                        "type": "Command",
                        "visibility": vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData,
                        'onClickCallback': function () { vm.onPreferenceButtonClicked(); }
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.resetColumnsWidth,
                        "tooltip": $translate.instant('filterBar.resetColumnsWidthTitle'),
                        "svgIcon": "common/icons/cmdResetCounter24.svg",
                        "type": "Command",
                        "visibility": vm.isUserAuthorised && vm.isPersonalizationAllowed && !vm.filterOptions.noData && vm.isGridMode,
                        'onClickCallback': function () { vm.onResetColumnsWidthButtonClicked(); }
                    },
                    {
                        "type": "search",
                        "name": BUTTON_NAMES.compactSearchField,
                        "placeholder": getQuickSearchPlaceholder(),
                        "quickSearchText": vm.quickSearchText,
                        "visibility": false,
                        "changeCallback": changeQuickSearch,
                        "clickCallback": changeQuickSearch,
                        "disableSearch": false
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.export,
                        "tooltip": $translate.instant('filterBar.exportTitle'),
                        "svgIcon": "common/icons/cmdExport24.svg",
                        "type": "Command",
                        "visibility": vm.options.exportManagerButton,
                        'onClickCallback': function () { vm.onExportButtonClicked(); }
                    },
                    {
                        "label": "",
                        "name": BUTTON_NAMES.download,
                        "tooltip": vm.options.downloadOptions.tooltip || $translate.instant('filterBar.download'),
                        "svgIcon": "common/icons/cmdDownload24.svg",
                        "type": "Command",
                        "visibility": vm.options.downloadOptions.enabled && !vm.filterOptions.noData && vm.isGridMode,
                        'onClickCallback': onDownloadClicked
                    }
                ]
            };

            if (vm.filterOptions.isDataRetrieved) {
                findDataInCommandBar(BUTTON_NAMES.filter).badge = {
                    state: 'information',
                    value: 1
                }
            }

            if (vm.filterOptions.customButtons && vm.filterOptions.customButtons.length) {
                var customButtonsIndex = vm.commandBarData.bar.length - 1;

                var quickSearchIndex = _.findIndex(vm.commandBarData.bar, function (item) {
                    return (item.type === 'search' || item.name === 'search') && item.visibility;
                });
                if (quickSearchIndex >= 0) {
                    customButtonsIndex = quickSearchIndex + 1;
                } else {
                    var secondaryButtonIndex = _.findIndex(vm.commandBarData.bar, function (item) {
                        return item.name === 'User Preference' || item.name === 'Manage Tags' || item.name === 'Export'
                    });
                    secondaryButtonIndex !== -1 && (customButtonsIndex = secondaryButtonIndex);
                }
                [].splice.apply(vm.commandBarData.bar, [customButtonsIndex, 0].concat(vm.filterOptions.customButtons));
            }
        }

        function resetSort() {
            isResetSort = true;
            if (vm.defaultSortField) {
                vm.setSelectedSort(vm.defaultSortField, vm.defaultSortDirection);
                return;
            }
            vm.setSelectedSort(vm.options.sortByFields[0].field, vm.defaultSortDirection);
        }

        function formGroupData() {
            var index = null;
            var modeField = findDataInCommandBar(BUTTON_NAMES.mode);
            if (vm.viewMode && vm.viewMode.length) {
                vm.viewMode.forEach(function (mode) {
                    if (mode.show && !vm.compactMode) {
                        modeField.group.push({
                            "label": mode.field === 'Grid' ? $translate.instant('filterBar.table') : $translate.instant('filterBar.list'),
                            "name": mode.field,
                            "tooltip": mode.field === 'Grid' ? $translate.instant('filterBar.table') : $translate.instant('filterBar.list'),
                            "visibility": mode.show,
                            "selected": mode.selected,
                            "type": "toggle",
                            "svgIcon": mode.svgIcon,
                            'onClickCallback': function (object) {
                                vm.selectView(object);

                            }
                        });
                    }
                });
            }
            if (modeField && modeField.group && modeField.group.length === 1) {

                findDataInCommandBar(BUTTON_NAMES.mode).group[0].visibility = false;
            }

            var sortByField = findDataInCommandBar(BUTTON_NAMES.sortBy);
            if (vm.filterOptions.sortByFields && vm.filterOptions.sortByFields.length) {
                vm.filterOptions.sortByFields.forEach(function (element) {
                    sortByField.group.push({
                        "label": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "name": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "tooltip": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "field": element.field ? element.field : element,
                        "visibility": vm.showSortControls,
                        "selected": false,
                        "type": "toggle",
                        'onClickCallback': vm.setSelectedSort
                    });
                });
                // add seperator line
                sortByField.group.splice(sortByField.group.length - 2, 0, { "type": "Sep" });

                if (isUserPrefEnabled) {
                    // add seperator line
                    sortByField.group.push({ "name": "reset_seperator", "type": "Sep" });

                    //reset to default sort
                    var resetSortField = {
                        field: "none",
                        label: $translate.instant('filterBar.resetSort'),
                        name: "reset_sort",
                        onClickCallback: vm.resetSort,
                        selected: false,
                        tooltip: $translate.instant('filterBar.resetSort'),
                        type: "toggle",
                        visibility: true
                    };
                    sortByField.group.push(resetSortField);
                }

            }

            if (sortByField.group.length) {
                index = _.findIndex(sortByField.group, { 'name': vm.selectedSort.displayName });
                if (index < 0) {
                    index = _.findIndex(sortByField.group, { 'name': vm.selectedSort.field });
                }
                if (index > -1) {
                    sortByField.group[index].selected = true;
                }

                var sortDirectionItem = _.findWhere(sortByField.group, {
                    'field': vm.options.currentSortDirection || 'asc'
                });
                sortDirectionItem && (sortDirectionItem.selected = true);
            }

            var groupByField = findDataInCommandBar(BUTTON_NAMES.groupBy);
            if (vm.filterOptions.groupByFields && vm.filterOptions.groupByFields.length) {
                vm.filterOptions.groupByFields.forEach(function (element) {
                    groupByField.group.push({
                        "label": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "name": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "tooltip": (element.displayName) ? element.displayName : (element.field) ? element.field : element,
                        "field": element.field ? element.field : element,
                        "selected": false,
                        "visibility": vm.showGroupButton,
                        "type": "toggle",
                        'onClickCallback': vm.groupSelectChange
                    });
                });
                groupByField.group.push({
                    "label": $translate.instant('filterBar.none'),
                    "name": "none",
                    "field": "none",
                    "tooltip": $translate.instant('filterBar.none'),
                    "selected": true,
                    "visibility": vm.showGroupButton,
                    "type": "toggle",
                    'onClickCallback': vm.groupSelectChange
                });
            }

            if (vm.groupStatus.groupField) {
                index = _.findIndex(groupByField.group, function (groupData) {
                    return _.isEqual(groupData.field.toLowerCase(), vm.options.currentGroupField.toLowerCase());
                });
                if (index > -1) {
                    groupByField.group[index].selected = true;
                    groupByField.group[groupByField.group.length - 1].selected = false;
                }
            }
        }

        function findDataInCommandBar(mode) {
            return _.findWhere(vm.commandBarData.bar, { name: mode });
        }

        function initEventSubscriptions() {
            $scope.$on('$destroy', onDirectiveDestroy);
        }

        function onDirectiveDestroy() {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        }

        function showFilterBar() {
            vm.commandBarData.bar.forEach(function (data) {
                if (data.hasOwnProperty('group')) {
                    data.group.forEach(function (element) {
                        if (element.visibility) {
                            vm.showFilterBar = true;
                            return;
                        }
                    })
                } else {
                    if (data.visibility) {
                        vm.showFilterBar = true;
                        return;
                    }
                }
            })
        }

        function setSearchAvailability(isAvailable) {
            findDataInCommandBar(BUTTON_NAMES.inLineSearch).disableSearch = !isAvailable;
            findDataInCommandBar(BUTTON_NAMES.compactSearchField).disableSearch = !isAvailable;
        }

        function getQuickSearchPlaceholder() {
            var quickSearchPlaceholderText = $translate.instant('filterBar.quick-search');
            if (vm.quickSearchPlaceholder) {
                if (vm.quickSearchPlaceholder.customText) {
                    quickSearchPlaceholderText = vm.quickSearchPlaceholder.customText;
                }
                else if (vm.quickSearchPlaceholder.displayName) {
                    quickSearchPlaceholderText = $translate.instant('filterBar.quickSearchPlaceholder') + ' ' + vm.quickSearchPlaceholder.displayName;
                }
            }

            return quickSearchPlaceholderText;
        }
    }
})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @module siemens.simaticit.common.widgets.filterBar
     * @name sitFilterBarPreloadService
     *
     * @description
     * This service provides functionalities to provide the preload data of {@link sitFilterBar} directive.
     *
     */
    function FilterBarPreloadService(preloadService, personalizationService) {
        activate();

        function activate() {
            preloadService.register(getPreloadService());
        }

        function getPreloadService() {
            var defaultSortService = new preloadService.Preload("DefaultSortInfo", true);
            defaultSortService.load = function (ICVctrl) {
                if (!ICVctrl.sitOptions.userPrefId) {
                    ICVctrl.filterbarUserPrefData = {};
                    return;
                }

                ICVctrl.filterbarUserPrefData = {
                    defaultSortInfo: {},
                    userPrefId: ICVctrl.sitOptions.userPrefId
                };

                if (ICVctrl.sitOptions.sortInfo) {
                    var defaultSortInfo = ICVctrl.sitOptions.sortInfo;
                    ICVctrl.filterbarUserPrefData.defaultSortInfo.field = defaultSortInfo.field;
                    ICVctrl.filterbarUserPrefData.defaultSortInfo.direction = defaultSortInfo.direction;
                    ICVctrl.filterbarUserPrefData.defaultSortInfo.fieldSource = defaultSortInfo.fieldSource;
                }

                //get saved sort definition
                var sortInfo = personalizationService.getCurrentUserPreference('sit-filter-bar', ICVctrl.sitOptions.userPrefId + '_FilterBar');
                if (sortInfo && sortInfo.currentSortField) {
                    ICVctrl.sitOptions.sortInfo.field = sortInfo.currentSortField;
                    ICVctrl.sitOptions.sortInfo.direction = sortInfo.currentSortDirection;
                    ICVctrl.sitOptions.sortInfo.fieldSource = sortInfo.currentSortFieldSource;
                }
            }
            return defaultSortService;
        }

    }

    FilterBarPreloadService.$inject = ['common.widgets.itemCollectionViewer.preloadService', 'common.services.personalization.personalizationService'];
    angular.module('siemens.simaticit.common.widgets.filterBar').service('common.widgets.filterBar.service', FilterBarPreloadService);


    //function FilterBarRunService() {}

    //FilterBarRunService.$inject = ['common.widgets.filterBar.service'];
    //angular.module('siemens.simaticit.common.widgets.filterBar').run(FilterBarRunService);

})();
