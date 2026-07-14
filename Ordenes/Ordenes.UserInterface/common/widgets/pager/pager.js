/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.pager
 * @description
 * @access internal
 * This module provides functionalities related to paging a collection of data items.
 */
(function () {
	'use strict';

	angular.module('siemens.simaticit.common.widgets.pager', []);

})();

(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name common.widgets.pager.localDataService
     * @module siemens.simaticit.common.widgets.pager
     * @description
     * @access internal
     * Provides functionality to support working with an array of data.
     */
    angular.module('siemens.simaticit.common.widgets.pager').service('common.widgets.pager.localDataService', LocalDataService);

    LocalDataService.$inject = [
        'common.services.filterSort.service',
        '$q',
        'common.services.logger.service',
        'common.widgets.filter.service',
        '$parse', '$filter',
        'common.widgets.pager.printService'];
    function LocalDataService(sortService, $q, logger, filterService, $parse, $filter, printService) {
        var self = this;
        var defaultConfiguration;
        activate();

        function activate() {
            init();
            exposeApi();
        }

        function init() {
            defaultConfiguration = {
                pagingOptions: {
                    currentPage: 1,
                    pageSize: 25
                },
                quickSearchOptions: {
                    enabled: false,
                    field: '',
                    filterText: ''
                },
                sortInfo: {
                    field: '',
                    direction: ''
                },
                filterClauses: [],
                enablePaging: true
            };
        }

        function exposeApi() {
            self.getDataManager = getDataManager;
        }

        function setDefaultConfiguration(config) {
            if (!config.quickSearchOptions) {
                config.quickSearchOptions = defaultConfiguration.quickSearchOptions;
            }
            if (!config.sortInfo) {
                config.sortInfo = defaultConfiguration.sortInfo;
            }
            if (!config.filterClauses) {
                config.filterClauses = defaultConfiguration.filterClauses;
            }
            if (!config.pagingOptions) {
                config.pagingOptions = defaultConfiguration.pagingOptions;
                return;
            }
            if (!config.pagingOptions.currentPage) {
                config.pagingOptions.currentPage = defaultConfiguration.pagingOptions.currentPage;
            }
            if (!config.pagingOptions.pageSize) {
                config.pagingOptions.pageSize = defaultConfiguration.pagingOptions.pageSize;
            }
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name common.widgets.pager.localDataService#getDataManager
         * @access internal
         * @description
         * Retrieves an object that manages paging, sorting and searching an array of data items.
         *
         * @param {Object} [config]
         * Configures an instance of a data manager.
         * * **pagingOptions**
         *   * **currentPage**: Defines the current page of data when paging.
         *   * **pageSize**: Defines the number of data items in page.
         * * **quickSearchOptions**
         *   * **enabled**: Determines if quick search filtering is performed.
         *   * **field**: The name of the field to use for quick search.
         *   * **filterText**: Text to compare against the configured field. Compare operation does a "begins with" match.
         * * **sortInfo**
         *   * **field**: The name of the field to sort by.
         *   * **direction**: Must be `asc` or `desc` case insensitive.
         *
         * @param {Object[]} [localData]
         * The data items to be managed by the data manager.
         *
         * @returns {Object}
         * An object configured to manage the data array.
         */
        function getDataManager(config, localData) {
            setDefaultConfiguration(config);
            return new LocalDataManager(config, localData, sortService, $q, logger, filterService, $parse, $filter, printService);
        }
    }

    /**
    * @ngdoc object
    * @module siemens.simaticit.common.widgets.pager
    * @name LocalDataManager
    * @access internal
    * @description
    * Manages a specific data collection.
    */
    function LocalDataManager(config, localData, sortService, $q, logger, filterService, $parse, $filter, printService) {
        var self = this;
        var currentPage, pageSize, completeData, searchText, currentSearchedText, searchField, sortField, sortDirection, quickSearchFilter;
        var filteredData, filterClauses, maxPageNumber;
        activate();

        function activate() {
            initialize();
            exposeApi();

            processData();
        }

        function initialize() {
            filteredData = completeData = localData ? localData : [];
            maxPageNumber = currentPage = config.pagingOptions.currentPage;
            pageSize = config.pagingOptions.pageSize;
            sortField = config.sortInfo.field;
            searchField = config.quickSearchOptions.field;
            searchText = config.quickSearchOptions.filterText;
            filterClauses = config.filterClauses;

            setSortDirection(config.sortInfo.direction);
            setQuickSearchFilter();
        }

        function exposeApi() {
            self.close = close;
            self.isServerData = isServerData;
            self.isInfiniteScrollable = isInfiniteScrollable;

            self.getAllData = getAllData;
            self.getPageData = getPageData;
            self.goToPage = goToPage;
            self.nextPage = nextPage;
            self.prevPage = prevPage;

            self.getTotalItemCount = getTotalItemCount;
            self.getPageCount = getPageCount;

            self.getData = getData;
            self.setData = setData;

            self.getSortInfo = getSortInfo;
            self.setSortInfo = setSortInfo;

            self.getCurrentPage = getCurrentPage;
            self.setCurrentPage = setCurrentPage;

            self.getPageSize = getPageSize;
            self.setPageSize = setPageSize;

            self.getFilter = getFilter;
            self.setFilter = setFilter;

            self.getSearchText = getSearchText;
            self.setSearchText = setSearchText;
            self.getRecentlySearchedText = getRecentlySearchedText;

            self.getSearchField = getSearchField;
            self.setSearchField = setSearchField;
            self.resetPager = resetPager;
            self.download = download;
        }

        function close() {
            delete self.close;
            delete self.isServerData;
            delete self.isInfiniteScrollable;
            delete self.getAllData;
            delete self.getPageData;
            delete self.goToPage;
            delete self.nextPage;
            delete self.prevPage;
            delete self.getTotalItemCount;
            delete self.getPageCount;
            delete self.getData;
            delete self.setData;
            delete self.getSortInfo;
            delete self.setSortInfo;
            delete self.getCurrentPage;
            delete self.setCurrentPage;
            delete self.getPageSize;
            delete self.setPageSize;
            delete self.getFilter;
            delete self.setFilter;
            delete self.getSearchText;
            delete self.setSearchText;
            delete self.getSearchField;
            delete self.setSearchField;
            delete self.getRecentlySearchedText;

            completeData = filteredData = currentPage = pageSize = sortField = sortDirection = searchText = currentSearchedText = searchField = quickSearchFilter = filterClauses = self = undefined;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#isServerData
         * @access internal
         * @description
         * Returns **false** since this object only manages local data.
         */
        function isServerData() {
            return false;
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.pager
        * @name LocalDataManager#isInfiniteScrollable
        * @access internal
        * @description
        * Returns **false** since the local data configuration doesn't support data load on scroll.
        */
        function isInfiniteScrollable() {
            return false;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getAllData
         * @access internal
         * @description
         * Retrieves all data items.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object containing the following:
         * * all data items
         * * the current page set to zero indicating all data
         * * the total count of data items
         *
         * The object has the following format
         * ```
         *     {
         *         data: [Object, Object, ...],
         *         currentPage: 0,
         *         totalDataSize: 147
         *     }
         * ```
         */
        function getAllData() {
            setCurrentPage(1);
            return getPromise({
                data: filteredData.slice(0), //return a new array to get grid to respond to change
                currentPage: currentPage,
                totalDataSize: filteredData.length
            });
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getPageData
         * @access internal
         * @description
         * Retrieves the current page of data including the page number and total data item count.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object containing the following:
         * * the data items for the current page
         * * the current page number
         * * the total count of all data items
         *
         * The object has the following format
         * ```
         *     {
         *         data: [Object, Object, ...],
         *         currentPage: 3,
         *         totalDataSize: 147
         *     }
         * ```
         */
        function getPageData() {
            if (0 === filteredData.length) {
                return getPromise({
                    data: [],
                    currentPage: 1,
                    totalDataSize: 0
                });
            }

            var startRow = (currentPage - 1) * pageSize;
            var endRow = currentPage * pageSize;
            return getPromise({
                data: filteredData.slice(startRow, endRow),
                currentPage: currentPage,
                totalDataSize: filteredData.length
            });
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#goToPage
         * @access internal
         * @description
         * Retrieves a page of data after setting the current page to the specified value.
         *
         * @param {Number} [page]
         * The page number to set as the current page.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.LocalDataManager#getPageData getPageData}
         *
         */
        function goToPage(pageNumber) {
            if (pageNumber) {
                setCurrentPage(pageNumber);
            }
            return getPageData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#nextPage
         * @access internal
         * @description
         * Retrieves a page of data after incrementing the current page by one.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.LocalDataManager#getPageData getPageData}
         *
         */
        function nextPage() {
            return goToPage(currentPage + 1);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#prevPage
         * @access internal
         * @description
         * Retrieves a page of data after decrementing the current page by one.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.LocalDataManager#getPageData getPageData}
         *
         */
        function prevPage() {
            return goToPage(currentPage - 1);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getTotalItemCount
         * @access internal
         * @description
         * Retrieves the count of all data items.
         *
         * The count is set after filtering by the configured **quickSearchOptions**.
         * For example, if the total number of **person** entities in a database is 1000,
         * but this is reduced to 85 after applying search options, then the total count returned is 85.
         * If no filter options are set, the returned value would be 1000.
         *
         * @returns {Number}
         * The data item count.
         *
         */
        function getTotalItemCount() {
            return filteredData.length;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getPageCount
         * @access internal
         * @description
         * Retrieves the number of pages.
         *
         * The count is set after filtering by the configured **quickSearchOptions**.
         * For example, if the total number of **person** entities in a database is 1000,
         * but this is reduced to 85 after applying search options, then a page size of 25 results in a page count of 4.
         * If no filter options are set, the page count would be 40.
         *
         * @returns {Number}
         * The page count.
         *
         */
        function getPageCount() {
            return Math.ceil(getTotalItemCount() / getPageSize());
        }

        function getData() {
            return completeData;
        }

        function setData(data) {
            completeData = data ? data : [];
            processData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getSortInfo
         * @access internal
         * @description
         * Retrieves the current field and direction used for sorting.
         *
         * @returns {Object}
         * An object containing the sort field and direction.
         *
         * The object has the following format
         * ```
         *     {
         *         field: "lastName",
         *         direction: "desc"
         *     }
         * ```
         *
         */
        function getSortInfo() {
            return {
                field: sortField,
                direction: sortDirection
            };
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setSortInfo
         * @access internal
         * @description
         * Sets the data field and direction for sorting the data collection.
         *
         * @param {string} [field]
         * The name of the field to sort by.
         *
         * @param {String } [direction]
         * The direction of the sort. Must be **asc** or **desc** case-insensitive.
         */
        function setSortInfo(field, direction) {
            sortField = field;
            setSortDirection(direction);
            doSort();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getCurrentPage
         * @access internal
         * @description
         * Retrieves the number of the current page.
         *
         * @returns {Number}
         * The current page number.
         *
         */
        function getCurrentPage() {
            return currentPage;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setCurrentPage
         * @access internal
         * @description
         * Sets the current page to the specified value.
         *
         * @param {Number} [page]
         * The page number to set as the current page.
         *
         */
        function setCurrentPage(val) {
            currentPage = val;
            validatePagingData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getPageSize
         * @access internal
         * @description
         * Retrieves the current page size.
         *
         * @returns {Number}
         * The current page size.
         *
         */
        function getPageSize() {
            return pageSize;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setPageSize
         * @access internal
         * @description
         * Sets the size used for a page of data.
         *
         * This may change the current page.
         * For example, consider current values of:
         * * total item count of 100
         * * current page size of 10
         * * current page of 10
         *
         * If the page size is changed to 25, then 10 is no longer a valid current page.
         * The current page must be changed.
         *
         * The data manager will try to set the new current page to the one containing the first item in the old current page.
         *
         * @param {Number} [size]
         * The number of items to include in a page of data.
         *
         */
        function setPageSize(size) {
            //get the first row of the current page so we can try and send back data containing this.
            var startingRow = (currentPage - 1) * pageSize + 1;
            pageSize = size;

            //page containing current row changed, get it
            setCurrentPage(Math.ceil(startingRow / pageSize));
        }

        function getFilter() {
            return filterClauses;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setFilter
         * @access internal
         * @description
         * Sets the filter function to use when getting a page of data.
         *
         */
        function setFilter(clauses) {
            filterClauses = clauses;
            processData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getSearchText
         * @access internal
         * @description
         * Retrieves the text currently used for matching against the configured quick search field.
         *
         * @returns {String}
         * The search text.
         *
         */
        function getSearchText() {
            return searchText;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getRecentlySearchedText
         * @access internal
         * @description
         * Retrieves the last text used for search.
         *
         * @returns {String}
         * The search text.
         *
         */
        function getRecentlySearchedText() {
            return currentSearchedText;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setSearchText
         * @access internal
         * @description
         * Sets the text to use for matching against the configured quick search field.
         *
         * @param {String} [searchText]
         * The text to use for searching.
         *
         */
        function setSearchText(val) {
            searchText = val;
            processData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#getSearchField
         * @access internal
         * @description
         * Retrieves the field name currently used for matching quick search text.
         *
         * @returns {String}
         * A field name.
         *
         */
        function getSearchField() {
            return searchField;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#resetPager
         * @access internal
         * @description
         * Returns the query string by resetting the skip counter for the query string to initial value.
         *
         * @returns {String}
         * A function used for resetting skip value.
         *
         */

        function resetPager(queryString) {
            var pattern = /(\w*skip=\w*[0-9]+)/; //NOSONAR
            if (pattern.test(queryString)) {
                queryString = queryString.replace(pattern, 'skip=0');
            }
            return queryString;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setSearchField
         * @access internal
         * @description
         * Sets the field to use for matching quick search text.
         *
         * @param {String} [searchField]
         * The field to use for searching.
         *
         */
        function setSearchField(val) {
            searchField = val;
            setQuickSearchFilter();
            processData();
        }


        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.pager
       * @name LocalDataManager#download
       * @access internal
       * @description
       * Downloads the grid record(s) in csv format.
       *
      * @param {Object} [data]
       * The date to download.
       *
       * @param {String} columns
       * Grid columns.
       *
       * @param {String} options
       * print options.
       */
        function download(data, columns, options) {
            return printService.toCSV(data, columns, options);
        }

        function setSortDirection(direction) {
            sortDirection = direction && 'desc' === direction.toLowerCase() ? 'desc' : 'asc';
        }

        function setQuickSearchFilter() {
            quickSearchFilter = config.quickSearchOptions.enabled && searchField ? filterService.getQuickSearchFilter(searchField) : null;
        }

        function validatePagingData() {
            if (0 >= currentPage) {
                currentPage = 1;
                return;
            }
            var maxPageNumber = getPageCount();
            if (maxPageNumber && currentPage > maxPageNumber) {
                currentPage = maxPageNumber;
            }
        }

        function processData() {
            doFiltering();
            doSort();
        }

        function doFiltering() {
            currentSearchedText = searchText;
            if (searchField && config.quickSearchType && config.quickSearchType.toLowerCase() === 'contains') {
                var pred = {};
                $parse(searchField).assign(pred, searchText);
                filteredData = $filter('filter')(completeData, pred);
            } else {
                filteredData = quickSearchFilter ? quickSearchFilter.getFilteredData(completeData, searchText) : completeData.slice(0);
            }
            if (filterClauses && filterClauses.length) {
                filteredData = filterService.filterArray(filterClauses, filteredData);
            }
            validatePagingData();
        }

        function doSort() {
            if (!sortField) {
                return;
            }
            // sort service requires array of objects
            var sortInfo = [{ field: sortField, direction: sortDirection }];
            sortService.sort(sortInfo, filteredData);
        }

        function getPromise(result) {
            var deferred = $q.defer();
            deferred.resolve(result);
            return deferred.promise;
        }

      
    }
})();

/*jshint -W098 */
(function () {
    'use strict';

    /**
	 * @ngdoc directive
	 * @name sitPager
     * @access internal
	 * @description Directive with UI for navigating through multiple pages of data.
	 * @module siemens.simaticit.common.widgets.pager
	 */
    angular.module('siemens.simaticit.common.widgets.pager').directive('sitPager', PagerDirective);

    function PagerDirective() {
        return {
            restrict: 'E',
            bindToController: {
                pagingOptions: '=sitPagingOptions'
            },
            scope: {},
            link: function (scope, element, attr, ctrl) {
                //watch for count changes from parent
                scope.$watch(function () {
                    return ctrl.pagingOptions.totalItems;
                }, function (newVal, oldVal) {
                    ctrl.setMaxPage();
                });

                scope.$watch(function () {
                    return ctrl.pagingOptions.pageSize;
                }, function (newVal, oldVal) {
                    if (oldVal !== newVal && ctrl.pagingOptions.pageSizeChangeCallback) {
                        ctrl.pagingOptions.pageSizeChangeCallback(newVal);
                        ctrl.setMaxPage();
                    }
                });

                // note: below mess is attempt to avoid circular watches.
                // we want to bind the current page from the options object to the UI text box,
                // but we also want to call back when user changes current page.
                // we don't want programmatic change of options object value to trigger a callback.
                // so we need to distinguish beteen value changing programmatically and user changing.

                // the current page on the options object
                // watching this responds to owner programmatically changing current page
                scope.$watch(function () {
                    return ctrl.pagingOptions.currentPage;
                }, function (newVal, oldVal) {
                    if (oldVal !== newVal) {
                        if (ctrl.userUpdate) {
                            ctrl.userUpdate = false;
                        } else {
                            // flag other watch to not callback and bind new page to UI
                            ctrl.apiUpdate = true;
                            ctrl.currentPage = newVal;
                        }
                    }
                });

                // utility function.  This really should be in some kind of utility service...
                function isInt(x) {
                    var y = parseInt(x, 10);
                    return !isNaN(y) && x === y && x.toString() === y.toString();
                }

                // the current page bound to the UI text box
                // watching this responds to the user changing the current page
                scope.$watch(function () {
                    return ctrl.currentPage;
                }, function (newVal, oldVal) {
                    if (!isInt(newVal) || undefined === oldVal) {
                        return;
                    }

                    if (oldVal !== newVal) {
                        if (ctrl.apiUpdate) {
                            ctrl.apiUpdate = false;
                            ctrl.pagingOptions.pageChangeCallback(newVal);
                        } else {
                            // flag other watch to not set UI value again and bind new value to options object
                            ctrl.userUpdate = true;
                            ctrl.pagingOptions.currentPage = newVal;
                            if (ctrl.pagingOptions.pageChangeCallback) {
                                ctrl.pagingOptions.pageChangeCallback(newVal);
                            }
                        }
                    }
                });
            },
            templateUrl: 'common/widgets/pager/pager.html',
            controller: PagerController,
            controllerAs: 'pagerCtrl'
        };
    }

    PagerController.$inject = ['common.widgets.pager.pageService'];

    function PagerController(sitPageService) {
        var vm = this;
        function init() {
            //initialize max page to some large number. will be reset when total items changes
            vm.maxPage = 1000;
            // initialize the current page after setting flag that blocks the callback
            vm.currentPage = vm.pagingOptions.currentPage;
            //attach functions to controller
            vm.pageToFirst = pageToFirst;
            vm.pageBackward = pageBackward;
            vm.pageForward = pageForward;
            vm.pageToLast = pageToLast;
            vm.footerStyle = footerStyle;
            vm.setMaxPage = setMaxPage;
            vm.cantPageBackward = cantPageBackward;
            vm.cantPageForward = cantPageForward;
            vm.cantPageToLast = cantPageToLast;
        }

        function activate() {
            init();
            sitPageService.setConfigurationDefaults(vm.pagingOptions);
        }
        activate();

        sitPageService.setConfigurationDefaults(vm.pagingOptions);

        function pageToFirst() {
            vm.currentPage = 1;
        }
        function pageBackward() {
            if (vm.currentPage > 1)
            { vm.currentPage -= 1; }
        }
        function pageForward() {
            if (vm.currentPage < vm.maxPage)
            { vm.currentPage += 1; }
        }
        function pageToLast() {
            vm.currentPage = vm.maxPage;
        }

        function footerStyle() {
            return { "width": "100%", "height": 55 + "px" };
        }

        function setMaxPage() {
            vm.maxPage = Math.ceil(vm.pagingOptions.totalItems / vm.pagingOptions.pageSize);
        }
        function cantPageForward() {
            return vm.currentPage === vm.maxPage;

        }
        function cantPageToLast() {
            return vm.currentPage === vm.maxPage;
        }

        function cantPageBackward() {
            return vm.currentPage <= 1;
        }
    }

})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name common.widgets.pager.pageService
     * @module siemens.simaticit.common.widgets.pager
     * @access internal
     * @description
     * _(Internal)_ Provides functionality to support paging through an array of data.
     */
    angular.module('siemens.simaticit.common.widgets.pager').service('common.widgets.pager.pageService', PageManagerService);

    PageManagerService.$inject = ['common.widgets.pager.localDataService', 'common.widgets.pager.serverDataService'];
    function PageManagerService(localDataService, serverDataService) {
        var self = this;
        var defaultConfiguration;
        activate();

        function activate() {
            init();
            exposeApi();
        }

        function init() {
            defaultConfiguration = {
                pageSizes: [10, 25, 50, 100, 250],
                pageSize: 10,
                currentPage: 1,
                serverDataOptions: false,
                totalItems: 0,
                filterItems: 0,
                selectedItems: 0,
                pageChangeCallback: null,
                pageSizeChangeCallback: null
            };
        }

        function exposeApi() {
            self.setConfigurationDefaults = setConfigurationDefaults;
            self.getPageManager = getPageManager;
        }

        function setConfigurationDefaults(config) {
            // create an object that has all the originial settings plus the defaults
            var configWithDefaults = $.extend({}, defaultConfiguration, config);

            // update the original obect with default values
            $.extend(config, configWithDefaults);
            return config;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name common.widgets.pager.pageService#getPageManager
         * @access internal
         * @description
         * Constructs and returns an object for managing data paging.
         *
         * @param {Object} [config]
         * An object configuring options for the data paging.  See config param for
         * {@link common.widgets.pager.localDataService#getDataManager getDataManager} method of sitLocalDataService or
         * config param for {@link common.widgets.pager.serverDataService#getDataManager getDataManager} method of common.widgets.pager.serverDataService
         *
         * @param {Object[]} [localData]
         * The data items to be managed by the data manager.
         *
         * @returns {Object}
         *
         * A data manager object for either local data or server data.  If the given config parameter has server data options set,
         * the returned data manager object will be a server data manager.  Otherwise, it will be a local data manager.
         *
         */
        function getPageManager(config, localData) {
            if (config.serverDataOptions) {
                return serverDataService.getDataManager(config);
            }
            return localDataService.getDataManager(config, localData);
        }
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.pager').service('common.widgets.pager.printService', Service);

    Service.$inject = ['$compile', '$rootScope', '$filter', '$parse', '$translate', '$window', '$document', '$timeout', 'common.widgets.busyIndicator.service'];
    function Service($compile, $rootScope, $filter, $parse, $translate, $window, $document, $timeout, busyIndicator) {
        var vm = this;
        var contents, cellElements, printOptions;
        var data, columns, isGroupedData;
        var loopIndex, loopLimit;
        var SEPARATOR_COMMA = ',';
        activate();

        function activate() {
            vm.toCSV = toCSV;
        }

        function toCSV(_data, _columns, options) {
            data = _data;
            columns = angular.copy(_columns);
            isGroupedData = options.isGroupedData;
            printOptions = options.downloadOptions;

            //show busy indicator
            busyIndicator.show();

            //initialize process variables
            contents = [];
            cellElements = [];

            //start the execution
            $timeout(processData, 0, false);

            // execute the start callback
            if (printOptions.started) {
                printOptions.started();
            }
        }

        function processData() {
            //first column headers
            var headerContent = [];
            for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                var column = columns[columnIndex];
                if (column.visible === false || column.isImageCol) {
                    //set icon as a file name
                    if (!printOptions.fileName && column.isImageCol) {
                        printOptions.fileName = column.typeIcon || column.svgIcon.split('/').pop().slice(4, -6);
                    }
                    continue;
                }
                var columnContent = '';
                if (column.headerCellTemplate) {
                    if (isPredefinedTemplate(column.cellTemplate)) {
                        columnContent = processPredefinedHeader(column);
                    } else {
                        var headerElement = executeCellTemplate(column);
                        cellElements.push({
                            element: headerElement,
                            row: contents.length,
                            column: headerContent.length
                        });
                    }
                } else {
                    columnContent = $translate.instant(column.displayName);
                }
                headerContent.push(columnContent);
            }
            contents.push(headerContent);


            //second values
            //the data records can be huge. So do part by part processing using 
            //recursive timeouts
            loopIndex = 0;
            loopLimit = 100;
            processDataPart();
        }

        function processDataPart() {
            for (var index = 0; index < loopLimit && loopIndex < data.length; index++, loopIndex++) {
                var row = isGroupedData ? data[loopIndex].entity : data[loopIndex];
                var rowContent = [];
                for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                    var column = columns[columnIndex];
                    if (column.visible === false || column.isImageCol) {
                        continue;
                    }
                    var columnContent = '';
                    if (column.cellTemplate && !column.showCheckbox) {
                        if (isPredefinedTemplate(column.cellTemplate)) {
                            columnContent = processPredefinedColumn(column, row);
                        } else {
                            var dataElement = executeCellTemplate(column, row);
                            cellElements.push({
                                element: dataElement,
                                row: contents.length,
                                column: rowContent.length
                            });
                        }
                    } else {
                        columnContent = formatContent(column, row);
                    }
                    rowContent.push(columnContent);
                }
                contents.push(rowContent);
            }
            if (loopIndex < data.length) {
                $timeout(processDataPart, 0, false);
                return;
            }
            //All the data is processed. Now lets process the cell template elements
            $timeout(processCellElements, 0, false);
        }

        function processCellElements() {
            for (var index = 0; index < cellElements.length; index++) {
                var cellElement = cellElements[index];
                var element = cellElement.element;
                var content = element.text().trim();

                // if the template has ng-show or ng-hide, the text is fetched after attaching to dom
                // remove the ng-hides..... removing not shown elements
                // now take the text from only ng-shows...
                if (0 < element.html().indexOf('ng-show') || 0 < element.html().indexOf('ng-hide')) {
                    var hiddenParent = $('<div style="width:0px;height:0px;"></div>');
                    hiddenParent.append(element).appendTo('body');
                    hiddenParent.find(':hidden').remove();
                    content = hiddenParent.text().trim();
                    hiddenParent.remove();
                }
                contents[cellElement.row][cellElement.column] = formatContentValue(content);
            }

            //Now process the final contents and download as file
            $timeout(processContents, 0, false);
        }

        function processContents() {
            //first club the contents into single line with separator
            var rowContents = [];
            for (var index = 0; index < contents.length; index++) {
                var rowContent = contents[index];
                rowContents.push(rowContent.join(printOptions.separator));
                //rowContents.push('="' + rowContent.join('"' + printOptions.separator + '="') + '"');
            }

            //second combine all the rows with new line
            var content = rowContents.join('\n');
            var fileName = checkFileName(printOptions.fileName);
            var fileNameWithdateTime = dateTimeStamp(fileName);
            //trigger the fileupload action
            triggerDownload(fileNameWithdateTime, content);

            //clear the process variables
            data = null;
            columns = null;
            contents = null;
            cellElements = null;

            //hide busy indicator
            busyIndicator.hide();

            //finally execute the complete callback and clear the options
            if (printOptions.completed) {
                printOptions.completed();
            }
            printOptions = null;
        }

        function isPredefinedTemplate(cellTemplate) {
            if (-1 < cellTemplate.indexOf('sit-mdtoggle')
                || -1 < cellTemplate.indexOf('sit-tag-list')
                || - 1 < cellTemplate.indexOf('sit-column-indicator')) {
                return true;
            }
            return false;
        }


        function processPredefinedHeader(column) {
            //indicator header
            return $translate.instant(column.displayName);
        }

        function processPredefinedColumn(column, row) {
            if (-1 < column.cellTemplate.indexOf('sit-mdtoggle')) {
                return formatContent(column, row);
            } else if (- 1 < column.cellTemplate.indexOf('sit-column-indicator')) {
                var value = formatContent(column, row);
                if (typeof value === 'undefined') {
                    value = executeIndicators(column, row);
                }
                return value;
            }
            //tag list
            var field = column.fieldSource ? column.fieldSource + '.' + column.field : column.field
            var tags = getValue(row, field) || [];
            var tagNames = [];
            for (var index = 0; index < tags.length; index++) {
                tagNames.push(tags[index].ShortName || tags[index].Name);
            }
            return tagNames.join(',');
        }

        function executeCellTemplate(column, row) {
            var scope = $rootScope.$new(true);
            scope.col = column;
            scope.col.colDef = column;
            if (row) {
                scope.row = {
                    entity: row,
                    getProperty: function (key) {
                        return getValue(row, key);
                    }
                };
            }
            return $compile($('<div>' + column.cellTemplate + '</div>'))(scope);
        }

        function executeIndicators(column, row) {
            var value, result;
            if (column.indicators.length) {
                for (var i = 0; i < column.indicators.length; i++) {
                    result = getIndicatorValue(column.indicators[i], row);
                    if (result) {
                        value = column.indicators[i].tooltip;
                        break;
                    }
                }
            }
            return value;
        }

        function getValue(entity, key) {
            return $parse('obj.' + key)({
                obj: entity
            });
        }

        function getIndicatorValue(indicator, row) {
            var result = false;

            switch (typeof indicator.visible) {
                case 'function':
                    result = indicator.visible(row);
                    break;
                case 'boolean':
                    result = indicator.visible;
                    break;
                case 'string':
                    var funcationParam = 'row';
                    var functioBody = ["return", indicator.visible].join(' ');
                    try {
                        result = new Function(funcationParam, functioBody).call(row, row); //NOSONAR
                    } catch (e) {
                        result = false;
                    }
                    break;
                default:
                    result = false;
            }

            return result;
        }

        function formatContent(column, row) {
            var field = column.fieldSource ? column.fieldSource + '.' + column.field : column.field;
            var content = getValue(row, field);
            var filter = column.cellFilter;

            if (!filter) {
                if (content instanceof Date) {
                    filter = 'date';
                }
            }
            if (!filter) {
                if (typeof content === 'string') {
                    return formatContentValue(content);
                }
                return content;
            }
            var filterContents = filter.split(':');
            if (0 === filterContents.length) {
                return content;
            }
            var filterName = filterContents[0];
            filterContents.splice(0, 1);
            var filterFormat = filterContents.join(':');
            if (filterFormat) {
                filterFormat = filterFormat.trim();
                if (('"' === filterFormat.charAt(0) && '"' === filterFormat.charAt(filterFormat.length - 1)) ||
                    ('\'' === filterFormat.charAt(0) && '\'' === filterFormat.charAt(filterFormat.length - 1))) {
                    filterFormat = filterFormat.substr(1, filterFormat.length - 2);
                }
            }
            content = $filter(filterName)(content, filterFormat);
            return (SEPARATOR_COMMA === printOptions.separator) ? '"' + content + '"' : content;
        }

        function formatContentValue(value) {
            if (SEPARATOR_COMMA !== printOptions.separator) {
                return value;
            }
            return '="' + value + '"';
        }

        function triggerDownload(fileName, content) {
            // Check if browser is Internet Explorer 6-11
            var isIE = false || !!$document[0].documentMode;
            var blob = new $window.Blob([new window.Uint8Array([0xEF, 0xBB, 0xBF]), content], {
                type: 'data:text/json;charset=utf8'
            });

            if (isIE) {
                $window.navigator.msSaveOrOpenBlob(blob, fileName);
                return;
            }

            var saveAsURL = $window.URL.createObjectURL(blob);
            var downloadLink = $document[0].createElement('a');
            downloadLink.download = fileName;
            downloadLink.href = saveAsURL;
            $document[0].body.appendChild(downloadLink);
            downloadLink.click();
            $document[0].body.removeChild(downloadLink);
        }

        function dateTimeStamp(fileName) {
            var currentDate = new Date();
            var dateTimeTimeStamp = fileName + '_' + currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString() + currentDate.getDate().toString() + currentDate.getHours().toString() + currentDate.getMinutes().toString() + currentDate.getSeconds().toString() + '.csv';
            return dateTimeTimeStamp;
        }

        function checkFileName(fileName) {
            if (fileName && fileName.endsWith('.csv')) {
                return fileName.replace('.csv', '');
            }
            else if (!fileName) {
                fileName = "TableRecord";
            }
            return fileName;
        }
    }
})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name common.widgets.pager.queryBuilderService
     * @module siemens.simaticit.common.widgets.pager
     * @description
     * @access internal
     * Provides functionality for retrieving facet query option.
     */
    angular.module('siemens.simaticit.common.widgets.pager').service('common.widgets.pager.queryBuilderService', QueryBuilderService);

    function QueryBuilderService() {
        var self = this;
        var searchText, searchField, quickSearchEnabled, searchFieldSource,
            serverConfiguration, fieldSources, entityName, sortDirection, filterQueryString, clauses;
        var sortFieldSource, isInfiniteScrollable, currentSearchedText;

        var sortField;
        activate();

        function activate() {
            exposeApi();
        }

        function exposeApi() {
            self.generateOdataQueries = generateOdataQueries;
        }

        function generateOdataQueries(config) {
            var fullOptionString;

            serverConfiguration = config.serverConfiguration;
            searchText = config.quickSearchInfo.searchText;
            searchField = config.quickSearchInfo.searchField;
            searchFieldSource = config.quickSearchInfo.searchFieldSource;
            quickSearchEnabled = config.quickSearchInfo.isEnabled;
            fieldSources = serverConfiguration.fieldSources;
            entityName = serverConfiguration.dataEntity;
            sortField = config.sortInfo.sortField;
            sortDirection = config.sortInfo.sortDirection;
            sortFieldSource = config.sortInfo.sortFieldSource;
            clauses = config.filterInfo.filterClauses;
            isInfiniteScrollable = config.isInfiniteScrollable;
            filterQueryString = config.filterInfo.filterQueryString;

            var facetOptionsString = ''
            if (sortFieldSource) {
                facetOptionsString = generateFacetQuery(config.facetTopIndex, config.facetSkipIndex);
            }

            var entityOptionsString = generateEntityQuery(config.entityTopIndex, config.entitySkipIndex);

            fullOptionString = facetOptionsString ? {
                facetQueryParams: facetOptionsString,
                entityQueryParams: entityOptionsString
            } : entityOptionsString;

            return fullOptionString;
        }

        function generateEntityQuery(entityTopIndex, entitySkipIndex) {
            var fullOptionsString = getFilterQueryString();

            if (sortFieldSource) {      
                var sortFilterString = "not(Facets/any(f: isof(f, '" + getFacetName(sortFieldSource) + "')))";
                fullOptionsString += fullOptionsString ? ' and (' + sortFilterString + ')' : '$filter=' + sortFilterString; 
            }

            // add page criteria
            var pageCriteria = '';
            if (entityTopIndex) {
                pageCriteria += fullOptionsString ? '&' : '';
                pageCriteria += '$top=' + entityTopIndex + '&$skip=' + entitySkipIndex;
            }
            fullOptionsString += pageCriteria;

            // add sorting info
            var sortCriteria = '';
            if (sortField && !sortFieldSource) {
                sortCriteria = fullOptionsString ? '&' : '';
                sortCriteria += '$orderby=' + getFormattedFieldName(sortField) + ' ' + sortDirection;
            }
            fullOptionsString += sortCriteria;

            // count
            if (!isInfiniteScrollable) {
                var countCriteria = fullOptionsString ? '&' : '';
                countCriteria += '$count=true';
                fullOptionsString += countCriteria;
            }
            // any aditional oData string
            var additionalCriteria = '';
            if (serverConfiguration.optionsString) {
                additionalCriteria = fullOptionsString ? '&' : '';
                additionalCriteria += serverConfiguration.optionsString;
            }
            fullOptionsString += additionalCriteria;

            fullOptionsString = addExpandFacetsToQuery(fullOptionsString);

            return fullOptionsString;
        }

        function generateFacetQuery(topIndex, skipIndex) {
            var filterString = '';
            if (clauses) {
                filterString = getODataFacetString(serverConfiguration, clauses);
            }

            var selectOptionsString, userFilterOptionsString, expandOptionsString = '';
            if (serverConfiguration.optionsString) {
                var additionalCriteria = getUserQueryStringForFacet(serverConfiguration.optionsString);
                if (additionalCriteria) {
                    selectOptionsString = additionalCriteria.selectString;
                    userFilterOptionsString = additionalCriteria.filterString;
                    expandOptionsString = additionalCriteria.expandString;
                }
            }

            var facetOptionsString = getFacetQSQueryText(filterString);

            if (userFilterOptionsString) {
                facetOptionsString = facetOptionsString ? facetOptionsString + ' and ' + userFilterOptionsString : '$filter=' + userFilterOptionsString;
            }
            var pageCriteria = '';
            if (topIndex) {
                pageCriteria += facetOptionsString ? '&' : '';
                pageCriteria += '$top=' + topIndex + '&$skip=' + skipIndex;
            }
            facetOptionsString += pageCriteria;

            // add sorting info
            var sortCriteria = '';
            if (sortField && sortFieldSource) {
                sortCriteria = facetOptionsString ? '&' : '';
                var sf = sortField.replace ? sortField.replace(/\./g, '/') : sortField;
                sortCriteria += '$orderby=' + sf + ' ' + sortDirection;
            }
            facetOptionsString += sortCriteria;

            if (!isInfiniteScrollable) {
                var countCriteria = facetOptionsString ? '&' : '';
                countCriteria += '$count=true';
                facetOptionsString += countCriteria;
            }

            facetOptionsString += facetOptionsString ? '&$expand=' + entityName : '$expand=' + entityName;
            facetOptionsString += '(' + (expandOptionsString ? expandOptionsString.indexOf('Facets') === -1 ? expandOptionsString + ',Facets' : expandOptionsString : '$expand=Facets') +
                (selectOptionsString ? ';' + selectOptionsString : '') + ')';
            return facetOptionsString;
        }

        function addExpandFacetsToQuery(queryString) {
            var i,
                is$ExpandFound = false,
                queryParts = queryString.split('&');
            for (i = 0; i < queryParts.length; i++) {
                if (queryParts[i].indexOf('$expand') === 0) {
                    is$ExpandFound = true;
                    queryParts[i] += queryParts[i].indexOf('Facets') === -1 && queryParts[i].indexOf('facets') === -1 ? ',Facets' : '';
                    break;
                }
            }
            queryString = queryParts.join('&');
            if (!is$ExpandFound) {
                queryString += queryString ? '&$expand=Facets' : '$expand=Facets'
            }
            return queryString;
        }

        function getUserQueryStringForFacet(optionsString) {
            var computedOptionsString;
            if (optionsString) {
                computedOptionsString = {};
                var options = optionsString.split('&');

                options.forEach(function (option) {
                    if (option.startsWith('$filter')) {
                        computedOptionsString.filterString = computeFilterStringForFacet(option);
                    } else if (option.startsWith('$select')) {
                        computedOptionsString.selectString = option;
                    } else if (option.startsWith('$expand')) {
                        computedOptionsString.expandString = option;
                    }
                });
            }
            return computedOptionsString;
        }

        function computeFilterStringForFacet(filterString) {
            var computedFilterString = '';
            if (filterString) {
                var regexExp = /( and | or )/g;
                filterString = filterString.replace('$filter=', '');
                var filterOptions = filterString.split(regexExp);
                var computedFilterOptions = _.map(filterOptions, function (filter) {
                    filter = filter.trim();
                    if (filter !== 'and' && filter !== 'or') {
                        filter = entityName + '/' + filter;
                    }
                    return filter;
                });
                computedFilterString = computedFilterOptions && computedFilterOptions.length > 0 ? computedFilterOptions.length === 1 ?
                    computedFilterOptions[0] : computedFilterOptions.join(' ') : '';
            }
            return computedFilterString;
        }

        function getFacetQSQueryText(filterString) {
            var qsText;
            var searchQueryString;
            var combinedQueryString = '';
            if (quickSearchEnabled && searchField && searchText !== undefined && searchText !== null && searchText.length > 0) {
                qsText = escapeODataValue(searchText);
                if (searchFieldSource) {
                    searchQueryString = constructFacetQSStringForFacetQuery('contains', searchField, searchFieldSource, qsText);
                } else if (Object.prototype.toString.call(searchField) === '[object Array]') {
                    searchQueryString = constructQSString('contains', searchField, qsText);
                } else {
                    searchQueryString = 'contains(' + entityName + '/' + getFormattedFieldName(searchField) + ',\'' + qsText + '\')';
                }
            }

            if (searchQueryString) {
                combinedQueryString = '$filter=' + searchQueryString;
                if (filterQueryString) {
                    combinedQueryString += ' and (' + filterString + ')';
                }
            } else if (filterQueryString) {
                combinedQueryString = '$filter=(' + filterString + ')';
            }
            return combinedQueryString;
        }

        function escapeODataValue(value) {
            var escapedValue = value.replace(/%/g, '%25');
            escapedValue = escapedValue.replace(/'/g, '\'\'');
            escapedValue = escapedValue.replace(/&/g, '%26');
            escapedValue = escapedValue.replace(/#/g, '%23');
            escapedValue = escapedValue.replace(/\+/g, '%2B');
            return escapedValue;
        }

        function getODataFacetString(serverConfiguration, clauses) {
            var facetString = "";
            var aliasFileds = [];

            function addAliasField(clause) {

                if (!_.findWhere(aliasFileds, { "aliasName": clause.selectValueColumn.aliasName, "field": clause.selectValueColumn.id }))
                    aliasFileds.push({ "aliasName": clause.selectValueColumn.aliasName, "field": clause.selectValueColumn.id });
            }

            function getAliasString() {
                var aliasString = "";
                aliasFileds.forEach(function (alias) {

                    aliasString += "&@" + alias.aliasName + "='" + alias.field + "'";
                });
                return aliasString;
            }

            function getFormattedDateTimesClauseString(formattedString, entityName, facetName) {
                var computedFilterString = '';
                if (formattedString) {
                    var regexExp = /( and | or )/g;
                    formattedString = formattedString.replace('$filter=', '');
                    var filterOptions = formattedString.split(regexExp);
                    var computedFilterOptions = _.map(filterOptions, function (filter) {
                        filter = filter.trim();
                        if (filter !== 'and' && filter !== 'or') {
                            filter = entityName + '/' + 'Facets/any(f:f/' + facetName + '/' + filter + ')';
                        }
                        return filter;
                    });
                    computedFilterString = computedFilterOptions && computedFilterOptions.length > 0 ? computedFilterOptions.length === 1 ?
                        computedFilterOptions[0] : computedFilterOptions.join(' ') : '';
                }
                return computedFilterString;
            }

            clauses.forEach(function (clause, idx) {
                //if block is for facet field ,else is for normal entity field
                var groupStart = "";
                if (clause.filterField.fieldSource) {
                    var facetName = serverConfiguration.fieldSources[clause.filterField.fieldSource] && (serverConfiguration.fieldSources[clause.filterField.fieldSource].type === "facet") ? serverConfiguration.fieldSources[clause.filterField.fieldSource].name : "";
                    var clauseString;
                    var regexExp = /( and | or )/g;
                    if (facetName) {
                        if (clause.hasOwnProperty('grpId') && clause.grpClass && clause.grpClass.indexOf('grp-start') !== -1) {
                            groupStart = '(';
                        }
                        if (idx === 0) {
                            switch (clause.operator) {
                                case "startsWith":
                                case "endsWith":
                                case "contains":
                                    facetString = groupStart + serverConfiguration.dataEntity + '/' + 'Facets/any(f: ' + clause.operator + '(f/' + facetName + '/' + getFormattedFacetFieldName(clause.filterField.field) +
                                        ',\'' + clause.value + '\'))';
                                    break;
                                case "in":
                                    facetString = groupStart + serverConfiguration.dataEntity + '/' + 'Facets/any(f:(f/' + facetName + '/' + getClauseString(clause) + ')';
                                    break;
                                case "isnull":
                                case "<>":
                                    clauseString = getClauseString(clause).replace(/[()]/g, '');
                                    if (clause && clause.filterField.type === "date" && clauseString.match(regexExp)) {
                                        facetString = groupStart + getFormattedDateTimesClauseString(clauseString, serverConfiguration.dataEntity, facetName);
                                    } else {
                                        facetString = groupStart + serverConfiguration.dataEntity + '/' + 'Facets/all(f:f/' + facetName + '/' + clauseString + ')';
                                    }
                                    break;
                                default:
                                    clauseString = getClauseString(clause).replace(/[()]/g, '');
                                    if (clause && clause.filterField.type === "date" && clauseString.match(regexExp)) {
                                        facetString = groupStart + getFormattedDateTimesClauseString(clauseString, serverConfiguration.dataEntity, facetName);
                                    } else {
                                        facetString = groupStart + serverConfiguration.dataEntity + '/' + "Facets/any(f:f/" + facetName + "/" + clauseString + ")";
                                    }
                                    break;
                            }
                        } else {
                            switch (clause.operator) {
                                case "startsWith":
                                case "endsWith":
                                case "contains":
                                    facetString += " " + clause.andOr + " " + groupStart + serverConfiguration.dataEntity + '/' + 'Facets/any(f: ' + clause.operator + '(f/' + facetName + '/' + getFormattedFacetFieldName(clause.filterField.field) + ',\'' + clause.value + '\'))';
                                    break;
                                case "in":
                                    facetString += " " + clause.andOr + " " + groupStart + serverConfiguration.dataEntity + '/' + "Facets/any(f:(f/" + facetName + "/" + getClauseString(clause) + ")";
                                    break;
                                case "isnull":
                                case "<>":
                                    clauseString = getClauseString(clause).replace(/[()]/g, '');
                                    if (clause && clause.filterField.type === "date" && clauseString.match(regexExp)) {
                                        facetString += " " + clause.andOr + " " + groupStart + getFormattedDateTimesClauseString(clauseString, serverConfiguration.dataEntity, facetName);
                                    } else {
                                        facetString += " " + clause.andOr + " " + groupStart + serverConfiguration.dataEntity + '/' + 'Facets/all(f:f/' + facetName + '/' + clauseString + ')';
                                    }
                                    break;
                                default:
                                    clauseString = getClauseString(clause).replace(/[()]/g, '');
                                    if (clause && clause.filterField.type === "date" && clauseString.match(regexExp)) {
                                        facetString += " " + clause.andOr + " " + groupStart + getFormattedDateTimesClauseString(clauseString, serverConfiguration.dataEntity, facetName);
                                    } else {
                                        facetString += " " + clause.andOr + " " + groupStart + serverConfiguration.dataEntity + '/' + "Facets/any(f:f/" + facetName + "/" + clauseString + ")";
                                    }
                                    break;
                            }
                        }
                        if (clause.hasOwnProperty('grpId') && clause.grpClass && clause.grpClass.indexOf('grp-end') !== -1) {
                            facetString += ')';
                        }
                        if (clause.showValueField === true && clause.selectValueColumn.isAlias) {
                            addAliasField(clause);
                        }
                    }
                } else {
                    if (clause.hasOwnProperty('grpId') && clause.grpClass && clause.grpClass.indexOf('grp-start') !== -1) {
                        groupStart = '(';
                    }
                    facetString = (idx === 0) ?
                        groupStart + getClauseString(clause) :
                        facetString + " " + clause.andOr + " " + groupStart + getClauseString(clause);

                    if (clause.hasOwnProperty('grpId') && clause.grpClass && clause.grpClass.indexOf('grp-end') !== -1) {
                        facetString += ')';
                    }

                    if (clause.showValueField === true && clause.selectValueColumn.isAlias) {
                        addAliasField(clause);
                    }
                }
            });

            var fieldsAliasString = getAliasString();
            facetString += fieldsAliasString;

            return facetString;
        }

        function getFormattedFacetFieldName(fieldName) {
            return fieldName.replace ? fieldName.replace(/\./g, '/') : fieldName;
        }

        function getClauseString(clause) {
            var clauseString = "";
            var fieldName = clause.filterField.fieldSource ? getFormattedFieldName(clause.filterField.field) : serverConfiguration.dataEntity + "/" + getFormattedFieldName(clause.filterField.field);

            function getFormattedFieldName(fieldName) {
                return fieldName.replace ? fieldName.replace(/\./g, '/') : fieldName;
            }

            // gets a clause string for basic compare operatations. (eq, le, ...)
            function getCompareString(operator, compareVal) {
                var retVal = "";

                if (compareVal === undefined) {
                    if (clause.showValueField) {
                        compareVal = clause.selectValueColumn.id;

                    } else {
                        compareVal = clause.value;
                    }
                }

                if (clause.filterField.type === 'string') {
                    compareVal = escapeODataValue(compareVal);
                    if (clause.showValueField && clause.selectValueColumn.isAlias) {
                        retVal = fieldName + " " + operator + " @" + clause.selectValueColumn.aliasName;
                    } else {
                        retVal = clause.showValueField ? fieldName + " " + operator + " " + compareVal : fieldName + " " + operator + " '" + compareVal + "'";
                    }
                } else if (clause.filterField.type === 'date') {
                    if (Object.prototype.toString.apply(compareVal) === '[object Date]') {
                        var isDateTime = clause.filterField.widget === 'sit-date-time-picker';
                        var startTime = new Date(compareVal.getTime());
                        isDateTime ? startTime.setMilliseconds(0) : startTime.setHours(0, 0, 0, 0);
                        // add 1 second worth of milliseconds in case of date-time-picker or add 24 hours worth of milliseconds in case of date picker
                        var endTime = isDateTime ? new Date(startTime.getTime() + 1000) : new Date(startTime.getTime() + (24 * 60 * 60 * 1000));

                        switch (clause.operator) {
                            case "=":
                                retVal = '(' + fieldName + ' ge ' + startTime.toISOString() + ' and ' + fieldName + ' lt ' + endTime.toISOString() + ')';
                                break;
                            case "<>":
                                retVal = '(' + fieldName + ' lt ' + startTime.toISOString() + ' or ' + fieldName + ' ge ' + endTime.toISOString() + ')';
                                break;
                            case "<":
                                retVal = '(' + fieldName + ' lt ' + startTime.toISOString() + ')';
                                break;
                            case "<=":
                                retVal = '(' + fieldName + ' lt ' + endTime.toISOString() + ')';
                                break;
                            case ">":
                                retVal = '(' + fieldName + ' ge ' + endTime.toISOString() + ')';
                                break;
                            case ">=":
                                retVal = '(' + fieldName + ' ge ' + startTime.toISOString() + ')';
                                break;
                        }
                    } else {
                        if (clause.showValueField && clause.selectValueColumn.isAlias) {
                            retVal = getDateAliasString(clause, fieldName);
                        } else {
                            retVal = getDateValueColumnString(clause, fieldName);
                        }
                    }
                } else if (clause.filterField.type === 'enum') {
                    clause.filterField.dataType = clause.filterField.dataType ? clause.filterField.dataType : '';
                    retVal = fieldName + " " + operator + " " + clause.filterField.dataType + "'" + compareVal + "'";
                } else {
                    if (clause.showValueField && clause.selectValueColumn.isAlias) {
                        var aliasFieldName = getFormattedFieldName(clause.selectValueColumn.aliasName);
                        retVal = fieldName + " " + operator + " @" + aliasFieldName;
                    } else {
                        retVal = fieldName + " " + operator + " " + compareVal;
                    }

                }

                return retVal;
            }

            function getDateAliasString(clause, fieldName) {
                var retVal = "";
                switch (clause.operator) {
                    case "=":
                        retVal = fieldName + ' eq @' + clause.selectValueColumn.aliasName;
                        break;
                    case "<>":
                        retVal = fieldName + ' ne @' + clause.selectValueColumn.aliasName;
                        break;
                    case "<":
                        retVal = fieldName + ' lt @' + clause.selectValueColumn.aliasName;
                        break;
                    case "<=":
                        retVal = fieldName + ' le @' + clause.selectValueColumn.aliasName;
                        break;
                    case ">":
                        retVal = fieldName + ' gt @' + clause.selectValueColumn.aliasName;
                        break;
                    case ">=":
                        retVal = fieldName + ' ge @' + clause.selectValueColumn.aliasName;
                        break;
                }
                return retVal;
            }

            function getDateValueColumnString(clause, fieldName) {
                var retVal = "";
                switch (clause.operator) {
                    case "=":
                        retVal = fieldName + ' eq ' + clause.selectValueColumn.id;
                        break;
                    case "<>":
                        retVal = fieldName + ' ne ' + clause.selectValueColumn.id;
                        break;
                    case "<":
                        retVal = fieldName + ' lt ' + clause.selectValueColumn.id;
                        break;
                    case "<=":
                        retVal = fieldName + ' le ' + clause.selectValueColumn.id;
                        break;
                    case ">":
                        retVal = fieldName + ' gt ' + clause.selectValueColumn.id;
                        break;
                    case ">=":
                        retVal = fieldName + ' ge ' + clause.selectValueColumn.id;
                        break;
                }
                return retVal;
            }


            // gets a clause string for one of the substring containing functions. (contains, startswith, endswith)
            function getContainString(containFunction) {
                var escapedValue;

                if (clause.showValueField === true) {
                    escapedValue = escapeODataValue(clause.selectValueColumn.id);
                } else {
                    escapedValue = escapeODataValue(clause.value);
                }
                if (clause.showValueField && clause.selectValueColumn.isAlias) {
                    return containFunction + "(" + fieldName + ",@" + clause.selectValueColumn.aliasName + ")";
                } else {
                    return clause.showValueField ? containFunction + "(" + fieldName + ", " + escapedValue + ")" : containFunction +
                        "(" + fieldName + ", '" + escapedValue + "')";
                }

            }

            function getString(operator) {
                return fieldName + " " + operator + " null";
            }

            // gets a clause string when a field value must match a list of specified values
            function getInString() {
                var retVal = "";

                var i;
                var values;
                if (clause.showValueField === true) {
                    values = clause.selectValueColumn.id.split(',');

                } else {
                    values = clause.value.split(',');
                }

                if (values.length > 0) {
                    retVal = "(";
                    if (clause.filterField.fieldSource) {
                        retVal = "";
                    }
                    values.forEach(function (val, idx) {
                        if (idx > 0) {
                            retVal += " or ";
                        }
                        retVal += getCompareString('eq', val);
                    });
                    retVal += ")";
                }

                return retVal;
            }

            function getCollectionString(operator) {
                var retVal = ""
                retVal = (operator === "any") ? fieldName + "/any()" : "not " + fieldName + "/any()";
                return retVal;
            }

            switch (clause.operator) {
                case "=":
                    clauseString = getCompareString('eq');
                    break;
                case "<>":
                    clauseString = getCompareString('ne');
                    break;
                case "<":
                    clauseString = getCompareString('lt');
                    break;
                case "<=":
                    clauseString = getCompareString('le');
                    break;
                case ">":
                    clauseString = getCompareString('gt');
                    break;
                case ">=":
                    clauseString = getCompareString('ge');
                    break;
                case "in":
                    clauseString = getInString();
                    break;
                case "contains":
                    clauseString = getContainString('contains');
                    break;
                case "startsWith":
                    clauseString = getContainString('startswith');
                    break;
                case "endsWith":
                    clauseString = getContainString('endswith');
                    break;
                case "isnull":
                    clauseString = getString('eq');
                    break;
                case "isnotnull":
                    clauseString = getString('ne');
                    break;
                case "any":
                    clauseString = getCollectionString('any');
                    break;
                case "notany":
                    clauseString = getCollectionString('notany');
                    break;
            }

            return clauseString;
        }

        function getFormattedFieldName(fieldName) {
            return fieldName.replace ? fieldName.replace(/\./g, '/') : fieldName;
        }

        function getFilterQueryString() {
            var qsText;
            var searchQueryString;
            var combinedQueryString = '';
            currentSearchedText = searchText;

            if (quickSearchEnabled && searchField && searchText !== undefined && searchText !== null && searchText.length > 0) {
                qsText = escapeODataValue(currentSearchedText);
                if (searchFieldSource) {
                    searchQueryString = constructFacetQSString('contains(', searchField, searchFieldSource, qsText);
                } else if (Object.prototype.toString.call(searchField) === '[object Array]') {
                    searchQueryString = constructQSString('contains', searchField, qsText);
                } else {
                    searchQueryString = 'contains(' + getFormattedFieldName(searchField) + ',\'' + qsText + '\')';
                }
            }
            if (searchQueryString) {
                combinedQueryString = '$filter=' + searchQueryString;
                if (filterQueryString) {
                    combinedQueryString += ' and (' + filterQueryString + ')';
                }
            } else if (filterQueryString) {
                combinedQueryString = '$filter=(' + filterQueryString + ')';
            }

            return combinedQueryString;
        }

        function constructFacetQSStringForFacetQuery(odataFunction, searchField, searchFieldSource, qsText) {
            var query = '';
            var facet = getFacetName(searchFieldSource);

            if (facet) {
                query = entityName + '/Facets/any(f: ' + odataFunction + '(f/' + facet + '/' + getFormattedFieldName(searchField) +
                    ',\'' + qsText + '\'))';
            }
            return query;
        }

        function constructFacetQSString(odataFunction, searchField, searchFieldSource, qsText) {
            var query = '';
            var facet = getFacetName(searchFieldSource);
            if (facet) {
                query = 'Facets/any(f: ' + odataFunction + 'f/' + facet + '/' + getFormattedFieldName(searchField) +
                    ',\'' + qsText + '\'))';
            }
            return query;
        }

        function getFacetName(source) {
            var facet = fieldSources[source] ? fieldSources[source] : "";
            return facet ? facet.name : '';
        }

        function constructQSString(odataFunction, searchField, qsText) {
            var qsString;
            var i = 0,
                length = searchField.length;
            for (i; i < length; i++) {
                qsString = qsString ? qsString + ' or ' : '';
                qsString += odataFunction + '(' + getFormattedFieldName(searchField[i]) + ',\'' + qsText + '\')';
            }
            return qsString;
        }
    }
})();
(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name common.widgets.pager.serverDataService
     * @module siemens.simaticit.common.widgets.pager
     * @description
     * @access internal
     * Provides functionality for retrieving data from a configured presentation service.
     */
    angular.module('siemens.simaticit.common.widgets.pager').service('common.widgets.pager.serverDataService', ServerDataService);

    ServerDataService.$inject = ['$q', 'common.services.logger.service', 'common.widgets.filter.service', 'common.widgets.pager.queryBuilderService', 'common.widgets.pager.printService'];

    function ServerDataService($q, logger, filterService, queryBuilderService, printService) {
        var self = this;
        var defaultConfiguration;
        activate();

        function activate() {
            init();
            exposeApi();
        }

        function init() {
            defaultConfiguration = {
                pagingOptions: {
                    currentPage: 1,
                    pageSize: 25
                },
                quickSearchOptions: {
                    enabled: false,
                    field: '',
                    filterText: '',
                    filedSource: ''
                },
                sortInfo: {
                    field: '',
                    direction: '',
                    fieldSource: ''
                },
                filterClauses: [],
                enablePaging: true
            };
        }

        function exposeApi() {
            self.getDataManager = getDataManager;
        }

        function setDefaultConfiguration(config) {
            if (!config.quickSearchOptions) {
                config.quickSearchOptions = defaultConfiguration.quickSearchOptions;
            }
            if (!config.sortInfo) {
                config.sortInfo = defaultConfiguration.sortInfo;
            }
            if (!config.filterClauses) {
                config.filterClauses = defaultConfiguration.filterClauses;
            }
            if (typeof config.enablePaging !== 'boolean') {
                config.enablePaging = defaultConfiguration.enablePaging;
            }
            if (!config.pagingOptions) {
                config.pagingOptions = defaultConfiguration.pagingOptions;
                return;
            }
            if (!config.pagingOptions.currentPage) {
                config.pagingOptions.currentPage = defaultConfiguration.pagingOptions.currentPage;
            }
            if (!config.pagingOptions.pageSize) {
                config.pagingOptions.pageSize = defaultConfiguration.pagingOptions.pageSize;
            }
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name common.widgets.pager.serverDataService#getDataManager
         * @access internal
         * @description
         * Retrieves an object that manages paging, sorting and searching an array of data items.
         *
         * @param {Object} [config]
         * Configures an instance of a data manager.
         * * **pagingOptions**
         *   * **currentPage**: Defines the current page of data when paging.
         *   * **pageSize**: Defines the number of data items in page.
         * * **quickSearchOptions**
         *   * **enabled**: Determines if quick search filtering is performed.
         *   * **field**: The name of the field to use for quick search.
         *   * **filterText**: Text to compare against the configured field. Compare operation does a "begins with" match.
         * * **serverDataOptions**
         *   * **dataService**: A presentation service object such as engineeringData (object not string)
         *   * **dataEntity**: The name of an entity to retrieve via the service
         *   * **optionsString**: An oData compliant query string
         * * **sortInfo**
         *   * **field**: The name of the field to sort by.
         *   * **direction**: Must be `asc` or `desc` case insensitive.
         *
         * @returns {Object}
         * An object configured to manage data retrieval from a server.
         */
        function getDataManager(config) {
            setDefaultConfiguration(config);
            return new ServerDataManager(config, $q, logger, filterService, queryBuilderService, printService);
        }
    }

    /**
     * @ngdoc object
     * @module siemens.simaticit.common.widgets.pager
     * @name ServerDataManager
     * @access internal
     * @description
     * Manages retrieving data from a configured presentation service for a specific entity.
     *
     */
    function ServerDataManager(config, $q, loggerService, filterService, queryBuilderService, printService) {
        var self = this;
        var logger, currentPage, pageSize, dataCount, filterQueryString, filterClauses, isPagerEnabled;
        var searchText, currentSearchedText, searchField, quickSearchEnabled, searchFieldSource,
            fieldSources;
        var sortField, sortFieldSource, sortDirection;
        var waitingForServer, nextDeferred, nextOptionsString;
        var serverConfiguration, facetName, dataTranformInfo, stateInfo;
        var defaultStateInfo, previousPage;

        activate();

        function activate() {
            init();
            exposeApi();
        }

        function init() {
            logger = loggerService.getModuleLogger('siemens.simaticit.common.widgets.pager');
            currentPage = config.pagingOptions.currentPage;
            pageSize = config.pagingOptions.pageSize;
            isPagerEnabled = config.enablePaging;
            searchText = config.quickSearchOptions.filterText;
            searchField = config.quickSearchOptions.field;
            searchFieldSource = config.quickSearchOptions.fieldSource;
            quickSearchEnabled = config.quickSearchOptions.enabled;
            sortField = config.sortInfo.field;
            sortFieldSource = config.sortInfo.fieldSource;
            setSortDirection(config.sortInfo.direction);
            dataCount = 0;
            filterQueryString = '';
            setFilter(config.filterClauses);
            serverConfiguration = config.serverDataOptions;
            fieldSources = serverConfiguration.fieldSources;
            dataTranformInfo = {};
            setDataTranformInfo(fieldSources);
            defaultStateInfo = {
                facetQueriedCount: 0,
                entityQueriedCount: 0,
                totalFacetCount: 0,
                totalEntityCount: 0,
                areMoreFacetsAvailable: true
            };
            stateInfo = angular.copy(defaultStateInfo);

            // are we waiting for the server to return with data?
            waitingForServer = false;
            nextOptionsString = null;
            nextDeferred = null;
        }

        function setDataTranformInfo(fieldSources) {
            if (fieldSources && typeof fieldSources === 'object' && Object.keys(fieldSources).length > 0) {
                dataTranformInfo.facetKeys = {};
                _.forEach(Object.keys(fieldSources), function (fieldSource) {
                    dataTranformInfo.facetKeys[fieldSource] = fieldSources[fieldSource] ? {
                        fullyQualifiedName: fieldSources[fieldSource].name
                    } : '';
                });
            }
        }

        function exposeApi() {
            self.close = close;
            self.isServerData = isServerData;
            self.isInfiniteScrollable = isInfiniteScrollable;

            self.getServerData = getServerData;
            self.getAllData = getAllData;
            self.getPageData = getPageData;
            self.goToPage = goToPage;
            self.nextPage = nextPage;
            self.prevPage = prevPage;

            self.getTotalItemCount = getTotalItemCount;
            self.getPageCount = getPageCount;

            self.getSortInfo = getSortInfo;
            self.setSortInfo = setSortInfo;

            self.getCurrentPage = getCurrentPage;
            self.setCurrentPage = setCurrentPage;

            self.getPageSize = getPageSize;
            self.setPageSize = setPageSize;

            self.getFilter = getFilter;
            self.setFilter = setFilter;

            self.getSearchText = getSearchText;
            self.setSearchText = setSearchText;
            self.getRecentlySearchedText = getRecentlySearchedText;

            self.getSearchField = getSearchField;
            self.setSearchField = setSearchField;

            self.resetPager = resetPager;
            self.getServerConfiguration = getServerConfiguration;
            self.download = download;
        }

        function close() {
            delete self.close;
            delete self.isServerData;
            delete self.isInfiniteScrollable;
            delete self.getAllData;
            delete self.getPageData;
            delete self.goToPage;
            delete self.nextPage;
            delete self.prevPage;
            delete self.getTotalItemCount;
            delete self.getPageCount;
            delete self.getSortInfo;
            delete self.setSortInfo;
            delete self.getCurrentPage;
            delete self.setCurrentPage;
            delete self.getPageSize;
            delete self.setPageSize;
            delete self.getFilter;
            delete self.setFilter;
            delete self.getSearchText;
            delete self.setSearchText;
            delete self.getSearchField;
            delete self.setSearchField;
            delete self.getRecentlySearchedText;
            delete self.getServerConfiguration;

            logger = currentPage = pageSize = searchText = currentSearchedText = searchField = searchFieldSource =
                quickSearchEnabled = sortField = sortFieldSource = sortDirection = dataCount = filterQueryString = filterClauses = undefined;
            serverConfiguration = waitingForServer = nextOptionsString = nextDeferred = self = undefined;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#isServerData
         * @access internal
         * @description
         * Returns **true** since this object only manages retrieving data through a presentation service.
         */
        function isServerData() {
            return true;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#isInfiniteScrollable
         * @access internal
         * @description
         * Returns a boolean value.
         * If **true**, the data is loaded on demand by scroll action.
         * If **false**, the date is loaded on paging options set in the configuration.
         */
        function isInfiniteScrollable() {
            return !isPagerEnabled;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getAllData
         * @access internal
         * @description
         * Retrieves all data items.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object containing the following:
         * * all data items
         * * the current page set to zero indicating all data
         * * the total count of data items
         *
         * The object has the following format
         * ```
         *     {
         *         data: [Object, Object, ...],
         *         currentPage: 0,
         *         totalDataSize: 147
         *     }
         * ```
         */

        function getServerData(itemsToLoadCount, totalItemsLoaded) {
            var deferred = $q.defer();

            if (!totalItemsLoaded) {
                stateInfo = defaultStateInfo;
            }

            loadServerData(itemsToLoadCount, totalItemsLoaded).then(
                function (response) {
                    onServerDataSuccess(response, deferred);
                    stateInfo = response.stateInfo ? response.stateInfo : stateInfo;
                },
                function (rejectReason) {
                    deferred.reject(rejectReason);
                }
            );
            return deferred.promise;
        }

        function onServerDataSuccess(response, deferred) {
            deferred.resolve({
                data: response.pageData,
                isCompactServerData: true,
                totalDataSize: response.totalDataCount
            });
        }

        function loadServerData(topIndex, skipIndex) {
            // check service
            if (typeof serverConfiguration.dataService.getAll !== 'function' && !serverConfiguration.appName) {
                logger.logErr('The given service does not have a getAll function.');
                throw new Error('The given service does not have a getAll function.');
            }

            if (typeof serverConfiguration.dataService.findAll !== 'function' && serverConfiguration.appName) {
                logger.logErr('The given service does not have a findAll function.If you defined in serverData appName the service must contain a findAll function');
                throw new Error('The given service does not have a findAll function.');
            }

            // check entity name
            if (!serverConfiguration.dataEntity) {
                logger.logErr(serverConfiguration.dataEntity + ' is not a valid value for data entity name.');
                throw new Error(serverConfiguration.dataEntity + ' is not a valid value for data entity name.');
            }

            // string we are building with all options
            if (serverConfiguration.onBeforeDataLoadCallBack && serverConfiguration.onBeforeDataLoadCallBack instanceof Function) {
                var configData = {
                    topIndex: topIndex,
                    skipIndex: skipIndex,
                    searchText: searchText,
                    searchField: searchField,
                    quickSearchEnabled: quickSearchEnabled,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    filterClauses: filterClauses
                };
                return loadDataFromODataString(serverConfiguration.onBeforeDataLoadCallBack(configData));
            }

            var fullOptionsString;

            if (fieldSources && typeof fieldSources === 'object' && Object.keys(fieldSources).length > 0) {
                var queryConfig = {
                    sortInfo: {
                        sortField: sortField,
                        sortDirection: sortDirection,
                        sortFieldSource: sortFieldSource
                    },
                    quickSearchInfo: {
                        searchField: searchField,
                        searchText: searchText,
                        searchFieldSource: searchFieldSource,
                        isEnabled: quickSearchEnabled
                    },
                    filterInfo: {
                        filterQueryString: filterQueryString,
                        filterClauses: filterClauses
                    },
                    facetTopIndex: topIndex,
                    facetSkipIndex: skipIndex,
                    entityTopIndex: topIndex,
                    entitySkipIndex: sortFieldSource ? (stateInfo && stateInfo.entityQueriedCount ? stateInfo.entityQueriedCount : 0) : skipIndex,
                    serverConfiguration: serverConfiguration,
                    isInfiniteScrollable: self.isInfiniteScrollable()
                };
                getFacetName(sortFieldSource);
                fullOptionsString = queryBuilderService.generateOdataQueries(queryConfig);
            } else {
                fullOptionsString = getFilterQueryString();
                // add page criteria
                var pageCriteria = '';
                if (topIndex) {
                    pageCriteria += fullOptionsString ? '&' : '';
                    pageCriteria += '$top=' + topIndex + '&$skip=' + skipIndex;
                }
                fullOptionsString += pageCriteria;

                // add sorting info
                var sortCriteria = '';
                if (sortField) {
                    sortCriteria = fullOptionsString ? '&' : '';
                    var sf = sortField.replace ? sortField.replace(/\./g, '/') : sortField;
                    sortCriteria += '$orderby=' + sf + ' ' + sortDirection;
                }
                fullOptionsString += sortCriteria;

                // count
                if (!self.isInfiniteScrollable()) {
                    var countCriteria = fullOptionsString ? '&' : '';
                    countCriteria += '$count=true';
                    fullOptionsString += countCriteria;
                }

                // any aditional oData string
                var additionalCriteria = '';
                if (serverConfiguration.optionsString) {
                    additionalCriteria = fullOptionsString ? '&' : '';
                    additionalCriteria += serverConfiguration.optionsString;
                }
                fullOptionsString += additionalCriteria;
            }

            return loadDataFromODataString(fullOptionsString);
        }

        function getAllData() {
            var deferred = $q.defer();
            stateInfo = defaultStateInfo;
            loadPageOfData(0, 0).then(
                function (response) {
                    onDataSuccess(response, 1, deferred);
                },
                function (rejectReason) {
                    deferred.reject(rejectReason);
                }
            );
            return deferred.promise;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getPageData
         * @access internal
         * @description
         * Retrieves the current page of data including the page number and total data item count.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object containing the following:
         * * the data items for the current page
         * * the current page number
         * * the total count of all data items
         *
         * The object has the following format
         * ```
         *     {
         *         data: [Object, Object, ...],
         *         currentPage: 3,
         *         totalDataSize: 147
         *     }
         * ```
         */
        function getPageData() {
            var endRow = currentPage * pageSize;
            var startRow = endRow - pageSize;
            if (dataCount && startRow > dataCount) {
                throw new Error('Invalid arguments. page: [' + currentPage + '],  pageSize: [' + pageSize + '], start row: [' + startRow + '], data length: [' + dataCount + ']');
            }

            var deferred = $q.defer();
            if (stateInfo && previousPage && currentPage < previousPage) {
                stateInfo.areMoreFacetsAvailable = defaultStateInfo ? defaultStateInfo.areMoreFacetsAvailable : true;
            }
            loadPageOfData(currentPage, pageSize).then(
                function (response) {
                    previousPage = currentPage;
                    onDataSuccess(response, currentPage, deferred);
                    stateInfo = response.stateInfo;
                },
                function (rejectReason) {
                    deferred.reject(rejectReason);
                }
            );
            return deferred.promise;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#goToPage
         * @access internal
         * @description
         * Retrieves a page of data after setting the current page to the specified value.
         *
         * @param {Number} [page]
         * The page number to set as the current page.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.ServerDataManager#getPageData getPageData}
         *
         */
        function goToPage(page) {
            page = page || currentPage;
            var startRow = page * pageSize - pageSize;
            if (dataCount && startRow > dataCount) {
                throw new Error('Invalid arguments. page: [' + page + '],  pageSize: [' + pageSize + '], start row: [' + startRow + '], data length: [' + dataCount + ']');
            }
            setCurrentPage(page);
            return getPageData();
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#nextPage
         * @access internal
         * @description
         * Retrieves a page of data after incrementing the current page by one.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.ServerDataManager#getPageData getPageData}
         *
         */
        function nextPage() {
            return goToPage(currentPage + 1);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#prevPage
         * @access internal
         * @description
         * Retrieves a page of data after decrementing the current page by one.
         *
         * @returns {Object}
         * A $q Promise
         *
         * When resolved, the result is an object with the same format as for {@link siemens.simaticit.common.widgets.pager.ServerDataManager#getPageData getPageData}
         *
         */
        function prevPage() {
            return goToPage(currentPage - 1);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getCurrentPage
         * @access internal
         * @description
         * Retrieves the number of the current page.
         *
         * @returns {Number}
         * The current page number.
         *
         */
        function getCurrentPage() {
            return currentPage;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setCurrentPage
         * @access internal
         * @description
         * Sets the current page to the specified value.
         *
         * @param {Number} [page]
         * The page number to set as the current page.
         *
         */
        function setCurrentPage(val) {
            currentPage = val;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getPageSize
         * @access internal
         * @description
         * Retrieves the current page size.
         *
         * @returns {Number}
         * The current page size.
         *
         */
        function getPageSize() {
            return pageSize;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setPageSize
         * @access internal
         * @description
         * Sets the size used for a page of data.
         *
         * This may change the current page.
         * For example, consider current values of:
         * * total item count of 100
         * * current page size of 10
         * * current page of 10
         *
         * If the page size is changed to 25, then 10 is no longer a valid current page.
         * The current page must be changed.
         *
         * The data manager will try to set the new current page to the one containing the first item in the old current page.
         *
         * @param {Number} [size]
         * The number of items to include in a page of data.
         *
         */
        function setPageSize(size) {
            var sizeInt = parseInt(size, 10);

            //get the first row of the current page so we can try and send back data containing this.
            var currentRow = (currentPage - 1) * pageSize + 1;
            pageSize = sizeInt;
            //page containing current row changed, get it
            var newPage = Math.ceil(currentRow / pageSize);
            setCurrentPage(newPage === 0 ? 1 : newPage);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getTotalItemCount
         * @access internal
         * @description
         * Retrieves the count of all data items.
         * @access internal
         * The count is set after filtering by the configured **quickSearchOptions**.
         * For example, if the total number of **person** entities in a database is 1000,
         * but this is reduced to 85 after applying search options, then the total count returned is 85.
         * If no filter options are set, the returned value would be 1000.
         *
         * @returns {Number}
         * The data item count.
         *
         */
        function getTotalItemCount() {
            return dataCount;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getPageCount
         * @access internal
         * @description
         * Retrieves the number of pages.
         *
         * The count is set after filtering by the configured **quickSearchOptions**.
         * For example, if the total number of **person** entities in a database is 1000,
         * but this is reduced to 85 after applying search options, then a page size of 25 results in a page count of 4.
         * If no filter options are set, the page count would be 40.
         *
         * @returns {Number}
         * The page count.
         *
         */
        function getPageCount() {
            return Math.ceil(dataCount / pageSize);
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getSearchText
         * @access internal
         * @description
         * Retrieves the text currently used for matching against the configured quick search field.
         *
         * @returns {String}
         * The search text.
         *
         */
        function getSearchText() {
            return searchText;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getRecentlySearchedText
         * @access internal
         * @description
         * Retrieves the last text used for search.
         *
         * @returns {String}
         * The search text.
         *
         */
        function getRecentlySearchedText() {
            return currentSearchedText;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setSearchText
         * @access internal
         * @description
         * Sets the text to use for matching against the configured quick search field.
         *
         * @param {String} [searchText]
         * The text to use for searching.
         *
         */
        function setSearchText(newText) {
            searchText = newText;
            stateInfo = defaultStateInfo;
        }

        function getFilter() {
            return filterClauses;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name LocalDataManager#setFilter
         * @access internal
         * @description
         * sets the filter function to use when getting a page of data.
         *
         */
        function setFilter(clauses) {
            filterClauses = clauses;
            filterQueryString = filterService.getODataFilterString(clauses, config.serverDataOptions);
            stateInfo = defaultStateInfo;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getSearchField
         * @access internal
         * @description
         * Retrieves the field name and filed source information of currently used quick search text.
         *
         * @returns { Object}
         * An object containing filed and fieldSource information.
         *
         */
        function getSearchField() {
            return {
                field: searchField,
                fieldSource: searchFieldSource || ''
            };
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setSearchField
         * @access internal
         * @description
         * Sets the field and fieldSource to use for matching quick search text.
         *
         * @param {String} [searchField]
         * The field to use for searching.
         * 
         * @param {String} [searchFieldSource]
         * (Optional) The fieldSource of searchField.
         */
        function setSearchField(newField, fieldSource) {
            searchField = newField;
            searchFieldSource = fieldSource || '';
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setSortInfo
         * @access internal
         * @description
         * Returns the query string by resetting the skip counter for the query string to initial value.
         *
         * @returns {String}
         * A function used for resetting skip value.
         *
         */

        function resetPager(queryString) {
            var pattern = /(\w*skip=\w*[0-9]+)/; //NOSONAR
            if (pattern.test(queryString)) {
                queryString = queryString.replace(pattern, 'skip=0');
            }
            return queryString;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#setSortInfo
         * @access internal
         * @description
         * Sets the data field, direction and fieldSource for sorting the data collection.
         *
         * @param {string} [field]
         * The name of the field to sort by.
         *
         * @param {String } [direction]
         * The direction of the sort. Must be **asc** or **desc** case-insensitive.
         * 
         * @param {String } [fieldSource]
         * (Optional) The fieldSource of the sort field.
         */
        function setSortInfo(field, direction, fieldSource) {
            sortField = field;
            setSortDirection(direction);
            sortFieldSource = fieldSource || '';
            stateInfo = defaultStateInfo;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getSortInfo
         * @access internal
         * @description
         * Retrieves the current field, direction and fieldSource used for sorting.
         *
         * @returns {Object}
         * An object containing the sort field, direction and fieldSource.
         *
         * The object has the following format
         * ```
         *     {
         *         field: "lastName",
         *         direction: "desc"
         *         fieldSource: "FLastName"
         *     }
         * ```
         *
         */
        function getSortInfo() {
            return {
                field: sortField,
                direction: sortDirection,
                fieldSource: sortFieldSource || ''
            };
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#getServerConfiguration
         * @access internal
         * @description
         * Retrieves the current server data configuration.
         *
         * @returns {Object}
         * An object containing the server configuration.
         */
        function getServerConfiguration() {
            return serverConfiguration;
        }

        /**
         * @ngdoc method
         * @module siemens.simaticit.common.widgets.pager
         * @name ServerDataManager#download
         * @access internal
         * @description
         * Downloads the grid record(s) in csv format.
         *
        * @param {Object} [data]
         * The date to download.
         *
         * @param {String} columns
         * Grid columns.
         *
         * @param {String} options
         * print options.
         */
        function download(data, columns, options) {
            printService.toCSV(data, columns, options);
        }

        function setSortDirection(direction) {
            sortDirection = direction && 'desc' === direction.toLowerCase() ? 'desc' : 'asc';
            stateInfo = defaultStateInfo;
        }

        function loadPageOfData(PageNo, pageSize) {
            // check service
            if (typeof serverConfiguration.dataService.getAll !== 'function' && !serverConfiguration.appName) {
                logger.logErr('The given service does not have a getAll function.');
                throw new Error('The given service does not have a getAll function.');
            }

            if (typeof serverConfiguration.dataService.findAll !== 'function' && serverConfiguration.appName) {
                logger.logErr('The given service does not have a findAll function.If you defined in serverData appName the service must contain a findAll function');
                throw new Error('The given service does not have a findAll function.');
            }

            // check entity name
            if (!serverConfiguration.dataEntity) {
                logger.logErr(serverConfiguration.dataEntity + ' is not a valid value for data entity name.');
                throw new Error(serverConfiguration.dataEntity + ' is not a valid value for data entity name.');
            }

            // string we are building with all options
            if (serverConfiguration.onBeforeDataLoadCallBack && serverConfiguration.onBeforeDataLoadCallBack instanceof Function) {
                var configData = {
                    currentPage: PageNo,
                    pageSize: pageSize,
                    searchText: searchText,
                    searchField: searchField,
                    quickSearchEnabled: quickSearchEnabled,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    filterClauses: filterClauses
                };
                return loadDataFromODataString(serverConfiguration.onBeforeDataLoadCallBack(configData));
            }

            var fullOptionsString;
            if (fieldSources && typeof fieldSources === 'object' && Object.keys(fieldSources).length > 0) {
                var topSkipIndex = calculateTopAndSkip(pageSize, PageNo);

                var queryConfig = {
                    sortInfo: {
                        sortField: sortField,
                        sortDirection: sortDirection,
                        sortFieldSource: sortFieldSource
                    },
                    quickSearchInfo: {
                        searchField: searchField,
                        searchText: searchText,
                        searchFieldSource: searchFieldSource,
                        isEnabled: quickSearchEnabled
                    },
                    filterInfo: {
                        filterQueryString: filterQueryString,
                        filterClauses: filterClauses
                    },
                    facetTopIndex: topSkipIndex.facetTopIndex,
                    facetSkipIndex: topSkipIndex.facetSkipIndex,
                    entitySkipIndex: topSkipIndex.entitySkipIndex,
                    entityTopIndex: topSkipIndex.entityTopIndex,
                    serverConfiguration: serverConfiguration,
                    isInfiniteScrollable: self.isInfiniteScrollable()
                };
                getFacetName(sortFieldSource);
                fullOptionsString = queryBuilderService.generateOdataQueries(queryConfig);
            } else {
                fullOptionsString = getFilterQueryString();
                // add page criteria
                var pageCriteria = '';
                if (pageSize && PageNo) {
                    pageCriteria += fullOptionsString ? '&' : '';
                    pageCriteria += '$top=' + pageSize + '&$skip=' + pageSize * (PageNo - 1);
                }
                fullOptionsString += pageCriteria;


                // add sorting info
                var sortCriteria = '';
                if (sortField) {
                    sortCriteria = fullOptionsString ? '&' : '';
                    sortCriteria += '$orderby=' + getFormattedFieldName(sortField) + ' ' + sortDirection;
                }
                fullOptionsString += sortCriteria;

                // count
                if (!self.isInfiniteScrollable()) {
                    var countCriteria = fullOptionsString ? '&' : '';
                    countCriteria += '$count=true';
                    fullOptionsString += countCriteria;
                }
                // any aditional oData string
                var additionalCriteria = '';
                if (serverConfiguration.optionsString) {
                    additionalCriteria = fullOptionsString ? '&' : '';
                    additionalCriteria += serverConfiguration.optionsString;
                }
                fullOptionsString += additionalCriteria;
            }

            return loadDataFromODataString(fullOptionsString);
        }

        function calculateTopAndSkip(pageSize, pageNo) {
            var indexes = {};
            indexes.facetTopIndex = pageSize;
            indexes.facetSkipIndex = pageSize * (pageNo - 1);
            indexes.entityTopIndex = pageSize;

            if (sortFieldSource) {
                indexes.entitySkipIndex = stateInfo && indexes.facetSkipIndex > stateInfo.totalFacetCount ? indexes.facetSkipIndex - stateInfo.totalFacetCount : 0;
            } else {
                indexes.entitySkipIndex = indexes.facetSkipIndex;
            }

            return indexes;
        }

        function loadDataFromODataString(optionsString) {
            // we're waiting for a call to the server to return OR there's already a request waiting on deck
            if (waitingForServer || nextDeferred) {
                if (nextOptionsString) {
                    logger.logInfo('Dropping waiting request. New request: ' + optionsString);
                    nextOptionsString = optionsString;
                    return nextDeferred.promise;
                }
                // make this request the next (waiting) request
                nextOptionsString = optionsString;
                nextDeferred = $q.defer();
                return nextDeferred.promise;
            }

            waitingForServer = true;
            var promise, entityOptionsString, facetOptionsString = null;
            if (!serverConfiguration.appName) {
                promise = serverConfiguration.dataService.getAll(serverConfiguration.dataEntity, optionsString);
            } else {
                entityOptionsString = typeof optionsString === 'object' ? optionsString.entityQueryParams : optionsString;
                facetOptionsString = typeof optionsString === 'object' ? optionsString.facetQueryParams : '';

                promise = serverConfiguration.dataService.findAll({
                    appName: serverConfiguration.appName,
                    entityName: serverConfiguration.dataEntity,
                    options: entityOptionsString,
                    dataTransformInfo: dataTranformInfo,
                    facetInfo: sortFieldSource ? {
                        name: facetName,
                        queryParams: facetOptionsString,
                        prevReqState: stateInfo ? stateInfo : null
                    } : null
                });
            }
            return promise.then(onRequestSuccess, onRequestFailure).finally(onRequestComplete);
        }

        function onRequestSuccess(response) {
            logger.logInfo('Loaded ' + response.value.length + ' ' + serverConfiguration.dataEntity + ' records from data service.  Total records: ' + response.count);
            return {
                pageData: response.value,
                currentPage: 0,
                totalDataCount: response.count,
                stateInfo: response.stateInfo
            };
        }

        function onRequestFailure(reason) {
            logger.logErr('Error loading server data', reason);
            return $q.reject(reason);
        }

        function onRequestComplete() {
            // call to server has returned,
            waitingForServer = false;
            if (!nextOptionsString) {
                return;
            }
            // hold onto these
            var nextOptionsStringCopy = nextOptionsString;
            var wasNextDeferred = nextDeferred;

            // clear out these so another request can be handled
            nextOptionsString = '';
            nextDeferred = null;
            loadDataFromODataString(nextOptionsStringCopy).then(
                function (response) {
                    wasNextDeferred.resolve(response);
                },
                function (reject) {
                    wasNextDeferred.reject(reject);
                }
            );
        }

        function onDataSuccess(response, pageNo, deferred) {
            dataCount = response.totalDataCount;
            deferred.resolve({
                data: response.pageData,
                currentPage: pageNo,
                totalDataSize: response.totalDataCount
            });
        }

        // get the '$filter' portion of the query string based on current quick search and filter values.
        // (mainly in a func for testing but also makes 'loadPageOfData' slightly more compact)
        function getFilterQueryString() {
            var qsText;
            var searchQueryString;
            var combinedQueryString = '';
            currentSearchedText = searchText;

            if (quickSearchEnabled && searchField && searchText !== undefined && searchText !== null && searchText.length > 0) {
                qsText = filterService.escapeODataValue(currentSearchedText);
                if (Object.prototype.toString.call(searchField) === '[object Array]') {
                    searchQueryString = constructQSString('contains', searchField, qsText);
                } else {
                    searchQueryString = 'contains(' + getFormattedFieldName(searchField) + ',\'' + qsText + '\')';
                }
            }
            if (searchQueryString) {
                combinedQueryString = '$filter=' + searchQueryString;
                if (filterQueryString) {
                    combinedQueryString += ' and (' + filterQueryString + ')';
                }
            } else if (filterQueryString) {
                if (filterQueryString.indexOf(' or ') > 0) {
                    combinedQueryString = '$filter=(' + filterQueryString + ')';
                } else {
                    combinedQueryString = '$filter=' + filterQueryString;
                }
            }

            return combinedQueryString;
        }

        function constructQSString(odataFunction, searchField, qsText) {
            var qsString;
            var i = 0,
                length = searchField.length;
            for (i; i < length; i++) {
                qsString = qsString ? qsString + ' or ' : '';
                qsString += odataFunction + '(' + getFormattedFieldName(searchField[i]) + ',\'' + qsText + '\')';
            }
            return qsString;
        }

        function getFormattedFieldName(fieldName) {
            return fieldName.replace ? fieldName.replace(/\./g, '/') : fieldName;
        }

        function getFacetName(source) {
            var facet = fieldSources[source] ? fieldSources[source] : "";
            var facetNames = facet !== '' && facet.name !== '' ? facet.name.split('.') : '';
            facetName = facetNames ? facetNames[facetNames.length - 1] : '';
        }
    }
})();
