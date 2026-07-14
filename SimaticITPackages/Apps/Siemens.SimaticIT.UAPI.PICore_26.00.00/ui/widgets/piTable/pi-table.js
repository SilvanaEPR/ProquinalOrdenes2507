/*
* SIMATIC IT Unified Architecture for Process Industries V1.1
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('sitPiTable', sitPiTableDirective);

    function sitPiTableDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTable/pi-table.html',
            controller: sitPiTableController,
            restrict: 'E',
            controllerAs: 'tableCtrl',
            scope: {},
            bindToController: {
                'id': '=sitPiTableId',
                'config': '=sitConfig',
                'toolbarButtons': '=sitPiToolbarButtons',
                'toolbarVisible': '=sitPiToolbarVisible',
                'piConfig': '=sitPiConfig',
                'viewMode': '=sitViewMode',
                'onSelectionChanged': '&',
                'onCommandClicked': '&'
            }
        };
    }

    sitPiTableController.$inject = [
        '$scope',
        'common.services.logger.service',
        'common.base',
        'Siemens.SimaticIT.UAPI.PICore.commonService',
        'common.widgets.messageOverlay.service',
        '$translate',
        '$element',
        '$timeout',
        '$attrs',
        'common.widgets.pager.pageService',
        '$filter'];
    function sitPiTableController(
        $scope,
        loggerService,
        common,
        piCommonService,
        messageOverlay,
        $translate,
        $element,
        $timeout,
        $attrs,
        pageService,
        $filter) {

        var tableCtrl = this;
        tableCtrl.id = $attrs.sitPiTableId;
        tableCtrl.viewMode = $attrs.sitViewMode;
        var logger;
        tableCtrl.readOnly = true;
        tableCtrl.isEditable = false;
        tableCtrl.columnData = '';
        tableCtrl.needsDeselection = false;
        var element = $element;
        var startIndex = 0;
        var counter = 0;
        var found = false;
        var keys = [];
        var ops = {
            eq: '=',
            neq: '<>',
            lt: '<',
            lteq: '<=',
            gt: '>',
            gteq: '>=',
            in: 'in',
            con: 'contains',
            sw: 'startsWith',
            ew: 'endsWith',
            isnull: 'isnull',
            isnotnull: 'isnotnull'
        };
        var stringOperators = [ops.eq, ops.neq, ops.in, ops.con, ops.sw, ops.ew];
        var dateOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        var numberOperators = [ops.eq, ops.neq, ops.lt, ops.lteq, ops.gt, ops.gteq];
        var booleanOperators = [ops.eq, ops.neq];
        var currentPage = 1;

        tableCtrl.setCellEdit = function () {
            tableCtrl.readOnly = false;
        };

        tableCtrl.deSelect = function () {
            tableCtrl.needsDeselection = true;
            if (tableCtrl.config && tableCtrl.config.getSettings && tableCtrl.config.applySettings) {
                var sett = tableCtrl.config.getSettings();
                sett.selectedRows = [];
                tableCtrl.config.applySettings(sett);
            }
        };

        tableCtrl.setCellReadOnly = function () {
            tableCtrl.readOnly = true;
        };

        tableCtrl.setButtonVisible = function (key, visibility) {
            if (tableCtrl.toolbarButtons && tableCtrl.toolbarButtons.length > key) {
                tableCtrl.toolbarButtons[key].visibility = visibility;
                return visibility;
            }
            return false;
        };

        tableCtrl.setVisibilityByActionName = function (propName, visibility) {
            angular.forEach(tableCtrl.toolbarButtons, function (action, key) {
                for (var property in action) {
                    if (action.hasOwnProperty(property) && property === 'name' && action[property] === propName) {
                        tableCtrl.toolbarButtons[key].visibility = visibility;
                    }
                }
            });
        };

        tableCtrl.dataUpdate = function () {
            if (tableCtrl.config.refreshData) {
                logger.logInfo('[sit-pi-table::dataUpdate] table view');
                tableCtrl.config.refreshData();
            }
            if (tableCtrl.tileViewOptions && tableCtrl.tileViewOptions.dataUpdated) {
                logger.logInfo('[sit-pi-table::dataUpdate] tile view');
                tableCtrl.tileViewOptions.dataUpdated();
            }
        };

        tableCtrl.setFilter = function (clauses) {
            if (tableCtrl.tileViewOptions.setFilter) {
                logger.logInfo('[sit-pi-table::setFilter] tile view with filter:' + clauses);
                tableCtrl.tileViewOptions.setFilter(clauses);
            }
        };

        tableCtrl.applyTableColumnsConfiguration = function (columns) {
            if (columns === null || columns === undefined || columns.length < 1) {
                return;
            }

            if (tableCtrl.config === undefined || tableCtrl.config === null) {
                return;
            }

            if (tableCtrl.piConfig === undefined || tableCtrl.piConfig === null) {
                return;
            }

            var fields = tableCtrl.config.fields;
            var headers = tableCtrl.piConfig.Headers;

            var tempPiConfig = [];
            var tempSitFields = {};
            for (var i = 0; i < columns.length; i++) {
                var header = null;
                var tableField = null;

                if (headers !== undefined && headers !== null && headers.length > 0) {
                    for (var j = 0; j < headers.length; j++) {
                        if (headers[j].Key === columns[i].PropertyName) {
                            header = headers[j];
                            break;
                        }
                    }
                }

                if (header === null || header === undefined) {
                    header = {
                        Key: columns[i].PropertyName
                    };
                }

                var tableFieldPropertyName = columns[i].PropertyName;
                var regExp = /Facets\[(.+)\](.+)/;
                var foundProperty = tableFieldPropertyName.match(regExp);
                if (foundProperty !== null && foundProperty !== undefined && foundProperty.length > 2) {
                    tableFieldPropertyName = foundProperty[2];
                }
                var tempTableFieldPropertyName = tableFieldPropertyName.split('.').join('/');
                var propertyName = columns[i].PropertyName.replace(tableFieldPropertyName, tempTableFieldPropertyName);

                if (fields !== undefined && fields !== null && fields.hasOwnProperty(propertyName)) {
                    tableField = fields[propertyName];
                } else {
                    tableField = {};
                }

                if (tableField !== undefined && tableField !== null) {
                    tableField.sorting = setPropertyValue(columns[i].CanBeSorted, tableField.sorting, false);
                    tableField.grouping = setPropertyValue(columns[i].CanBeGrouped, tableField.grouping, false);
                    tableField.quicksearch = setPropertyValue(columns[i].QuickSearch, tableField.quicksearch, false);
                    tableField.displayName = $translate.instant(setPropertyValue(columns[i].DisplayName, tableField.displayName, propertyName));
                    tableField.filtering = (columns[i].CanBeFiltered !== undefined && columns[i].CanBeFiltered !== null)
                        ? (columns[i].CanBeFiltered ?
                            {
                                type: setPropertyValue(columns[i].DataType, (tableField.filtering !== undefined && tableField.filtering !== null)
                                    ? tableField.filtering.type
                                    : undefined, 'string'),
                                default: false,
                                allowedCompareOperators: getAllowedCompareOperators(
                                    setPropertyValue(columns[i].DataType,
                                        (tableField.filtering !== undefined && tableField.filtering !== null)
                                            ? tableField.filtering.type
                                            : undefined, 'string')),
                                validation: { required: false }
                            } : undefined)
                        : tableField.filtering;
                    if (tableField.filtering !== undefined && tableField.filtering !== null) {
                        if (tableField.filtering.type === 'date') {
                            tableField.filtering.widget = 'sit-date-time-picker';
                        }
                    }

                    tempSitFields[propertyName] = tableField;
                }

                header.DisplayName = $translate.instant(setPropertyValue(columns[i].DisplayName, header.DisplayName, columns[i].PropertyName));
                header.IsSortDefault = setPropertyValue(columns[i].IsSortDefault, header.IsSortDefault, false);
                header.IsDatetime = setPropertyValue(columns[i].DataType, (header.IsDatetime !== undefined && header.IsDatetime !== null && header.IsDatetime
                    ? 'date'
                    : 'string'), 'string') === 'date' ? true : false;
                header.IsBoolean = setPropertyValue(columns[i].DataType, (header.IsBoolean !== undefined && header.IsBoolean !== null && header.IsBoolean
                    ? 'boolean'
                    : 'string'), 'string') === 'boolean' ? true : false;
                //START: BUG#94415 UI number Localization for "." and ","
                header.IsQty = setPropertyValue(columns[i].DataType, (header.IsQty !== undefined && header.IsQty !== null && header.IsQty
                    ? 'number'
                    : 'string'), 'string') === 'number' ? true : false;
                //END: BUG#94415 UI number Localization for "." and ","

                if (columns[i].IsVisible !== undefined && columns[i].IsVisible !== null && columns[i].IsVisible) {
                    tempPiConfig.push(header);
                }
            }

            tableCtrl.piConfig.Headers = tempPiConfig;
            tableCtrl.config.fields = tempSitFields;
            keys = [];
            getFieldsNames();

            function setPropertyValue(valueToCheck, fallBack, defaultValue) {
                return (valueToCheck !== undefined && valueToCheck !== null)
                    ? valueToCheck
                    : ((fallBack !== undefined && fallBack !== null) ? fallBack : defaultValue);
            }
        };

        tableCtrl.applyTableOptionsStringConfiguration = function (navigationProperties, facetFullNames, columnConfiguration) {

            if (tableCtrl.config === undefined || tableCtrl.config === null) {
                return;
            }

            if (tableCtrl.config.dataSource === undefined || tableCtrl.config.dataSource === null) {
                return;
            }

            var optionsString = (tableCtrl.config.dataSource.optionsString !== undefined && tableCtrl.config.dataSource.optionsString !== null)
                ? tableCtrl.config.dataSource.optionsString
                : '';

            tableCtrl.config.dataSource.optionsString = piCommonService.applyConfigurationsToOptionsString(
                optionsString,
                navigationProperties,
                facetFullNames,
                columnConfiguration);
        };

        tableCtrl.setPager = function (pageSizes, pageSizesDefault) {
            if (tableCtrl.config === undefined || tableCtrl.config === null) {
                return;
            }

            if (pageSizes !== undefined && pageSizes !== null && pageSizes.length > 0) {
                tableCtrl.config.pageSizes = pageSizes;
            }

            if (!isNaN(pageSizesDefault)) {
                tableCtrl.config.pageSizeDefault = pageSizesDefault;
            }
        };

        tableCtrl.setPiTableApi = function () {
            if (tableCtrl.piConfig) {
                tableCtrl.piConfig.deSelect = tableCtrl.deSelect;
                tableCtrl.piConfig.setCellEdit = tableCtrl.setCellEdit;
                tableCtrl.piConfig.setCellReadOnly = tableCtrl.setCellReadOnly;
                tableCtrl.piConfig.setButtonVisible = tableCtrl.setButtonVisible;
                tableCtrl.piConfig.setVisibilityByActionName = tableCtrl.setVisibilityByActionName;
                tableCtrl.piConfig.dataUpdate = tableCtrl.dataUpdate;
                tableCtrl.piConfig.setFilter = tableCtrl.setFilter;
                tableCtrl.piConfig.applyTableColumnsConfiguration = tableCtrl.applyTableColumnsConfiguration;
                tableCtrl.piConfig.applyTableOptionsStringConfiguration = tableCtrl.applyTableOptionsStringConfiguration;
                tableCtrl.piConfig.setPager = tableCtrl.setPager;
            }
        };

        tableCtrl.setPiTableApi();

        initNoDataTemplate();
        activate();

        if (tableCtrl.piConfig.onPiTableInitialized) {
            tableCtrl.piConfig.onPiTableInitialized();
        }

        function activate() {
            logger = loggerService.getModuleLogger('sitPiTable');
            getFieldsNames();
            tableCtrl.commandClick = commandClick;
            tableCtrl.headerClick = headerClick;
            tableCtrl.sortClass = sortClass;
            tableCtrl.setColumnData = setColumnData;
            tableCtrl.isAllowedCellEditing = isAllowedCellEditing;
            tableCtrl.isSeparatorNeeded = isSeparatorNeeded;
            tableCtrl.buttonsVisible = buttonsVisible;
            tableCtrl.getCustomCellTemplate = getCustomCellTemplate;
            tableCtrl.onTileSortChanged = onTileSortChanged;
            if (tableCtrl.config) {
                tableCtrl.config.onSelectionChangeCallback = onSelectionChangeCallback;
                tableCtrl.config.onPageChangeCallback = onPageChangeCallback;
                tableCtrl.config.onSortChangeCallback = onSortChangeCallback;
                tableCtrl.config.onInitCallback = onInitCallback;
                tableCtrl.config.uniqueID = setAutoSelection;
            }

            if (tableCtrl.config) {
                tableCtrl.tileFilterOptions = {};
                tableCtrl.tileFilterOptions.sortByFields = [];
                tableCtrl.quickSearchField = [];
                angular.forEach(tableCtrl.config.fields,
                    function (value, key) {
                        if (value.hasOwnProperty('DisplayName')) {
                            if (value.hasOwnProperty('CanBeSorted') && value.CanBeSorted) {
                                tableCtrl.tileFilterOptions.sortByFields.push({ field: value.PropertyName, displayName: $translate.instant(value.DisplayName) });
                            }
                        } else {
                            tableCtrl.tileFilterOptions.sortByFields.push({ field: key, displayName: value.displayName });
                        }
                        if (value.hasOwnProperty('quicksearch') && value.quicksearch) {
                            tableCtrl.quickSearchField.push(key);
                        } else if (value.hasOwnProperty('QuickSearch') && value.QuickSearch) {
                            tableCtrl.quickSearchField.push(value.PropertyName);
                        }
                    });
                angular.forEach(tableCtrl.piConfig.Headers,
                    function (value) {
                        if (value && value.IsSortDefault) {
                            if (value.hasOwnProperty('Key')) {
                                tableCtrl.tileFilterOptions.currentSortField = value.Key;
                            } else if (value.hasOwnProperty('PropertyName')) {
                                tableCtrl.tileFilterOptions.currentSortField = value.PropertyName;
                            }
                            tableCtrl.tileFilterOptions.currentSortDirection = 'asc';
                            tableCtrl.tileFilterOptions.onSortChangeCallback = onTileSortChanged;
                            tableCtrl.tileFilterOptions.onSearchChangeCallback = onQuickSearchDone;
                        }
                    });
            }

            if (tableCtrl.piConfig && tableCtrl.piConfig.TileOptions) {
                tableCtrl.tileViewOptions = tableCtrl.piConfig.TileOptions;
                tableCtrl.tileFilterOptions.displayOptions = 'sqc';
                tableCtrl.tileViewOptions.selectionMode = 'single';
                tableCtrl.tileViewOptions.noDataMessage = initNoDataTemplate();
                tableCtrl.tileViewOptions.pageManager = tableCtrl.pageManager;
                tableCtrl.tileViewOptions.sortInfo = {
                    field: tableCtrl.tileFilterOptions.currentSortField,
                    direction: tableCtrl.tileFilterOptions.currentSortDirection
                };
                tableCtrl.tileViewOptions.quickSearchOptions = {
                    enabled: true,
                    field: tableCtrl.quickSearchField
                };
            }
            setPageManager();
            tableCtrl.checkResponsiveness = checkResponsiveness;
            $scope.$on('sit-layout-change', onLayoutChange);
            $scope.$on('sit-item-selection-changed', onItemSelected);
            $scope.$on('custom-select', onCustomSelect);

        }

        function getAllowedCompareOperators(dataType) {
            switch (dataType) {
                case 'string':
                    return stringOperators;
                case 'number':
                    return numberOperators;
                case 'boolean':
                    return booleanOperators;
                case 'date':
                    return dateOperators;
                default: return stringOperators;
            }
        }

        function getFieldsNames() {
            if (tableCtrl && tableCtrl.config && tableCtrl.config.fields) {
                for (var k in tableCtrl.config.fields) {
                    if (k) {
                        keys.push(k);
                    }
                }
            }
        }

        function buttonsVisible() {
            var buttonsVisible = false;
            if (tableCtrl.toolbarButtons) {
                for (var l = 0; l < tableCtrl.toolbarButtons.length; l++) {
                    if (!tableCtrl.toolbarButtons[l].visibility) {
                        continue;
                    } else {
                        buttonsVisible = true;
                    }
                }
            }
            return buttonsVisible;
        }

        function isSeparatorNeeded() {
            var need = true;
            if (!buttonsVisible()) {
                return false;
            }
            for (var i = 0; i < keys.length; i++) {
                if (buttonsVisible() || (tableCtrl.config.fields[keys[i]].sorting !== undefined && tableCtrl.config.fields[keys[i]].sorting !== false)
                    || (tableCtrl.config.fields[keys[i]].grouping !== undefined && tableCtrl.config.fields[keys[i]].grouping !== false)
                    || (tableCtrl.config.fields[keys[i]].quickSearch !== undefined && tableCtrl.config.fields[keys[i]].quickSearch !== false)
                    || (tableCtrl.config.fields[keys[i]].filtering !== undefined && tableCtrl.config.fields[keys[i]].filtering !== false)) {
                    continue;
                } else {
                    need = false;
                    break;
                }
            }
            return need;
        }

        function setColumnData(row, value) {
            if (row) {
                if (value && value.Key) {

                    var fieldProperties = [];
                    var regexp = /(\w+)\[(.+)\].(.+)/i; // Matches a field of Array type and extracts both the field name and the Array index.
                    //  Ex.: "Facets[namespace.facetName] or Facets[0]"
                    var index = 0;
                    var path = '';
                    var arrayFieldName = '';
                    var ptv = 0;
                    var found = value.Key.match(regexp);
                    if (found !== null && found !== undefined && found.length > 3) {
                        // found[0] = the whole match (Ex.: "Facets[0]" or "Facets[namespace.facetName]")
                        // found[1] = the captured array-Field name (Ex.: "Facets")
                        // found[2] = the captured array-Field index/path (Ex.: 0, or "namespace.facetName")
                        // found[3] = the name of the field(s)
                        arrayFieldName = found[1];
                        if (isNaN(found[2])) {
                            path = '#' + found[2];
                        } else {
                            index = +found[2];
                        }

                        fieldProperties = found[3].split('.');

                        if (row[arrayFieldName] === undefined) {
                            row[arrayFieldName] = fieldProperties.length === 0 ? '' : {};
                        }

                        row = row[arrayFieldName];
                        if (row === null || row === undefined) {
                            return '';
                        }

                        if (row.constructor === Array) {
                            if (path.length > 0) {
                                var exit = false;
                                for (var i = 0; i < row.length; i++) {
                                    if (row[i]['@odata.type'] && row[i]['@odata.type'] === path) {
                                        row = row[i];
                                        exit = true;
                                        break;
                                    }
                                }
                                if (!exit) {
                                    return '';
                                }
                            } else {
                                if (row.length < index + 1) {
                                    return '';
                                }
                                row = row[index];
                            }
                        }
                    } else {
                        fieldProperties = value.Key.split('.');
                    }

                    while (fieldProperties.length > 0) {

                        var pathStep = fieldProperties.shift();

                        if (row[pathStep] === undefined) {
                            row[pathStep] = fieldProperties.length === 0 ? '' : {};
                        }

                        row = row[pathStep];

                        if (row === null || row === undefined) {
                            return '';
                        }
                    }

                    if (value.IsEditable) {
                        tableCtrl.isEditable = true;
                    } else {
                        tableCtrl.isEditable = false;
                    }
                    if (value.IsQty) {
                        tableCtrl.IsQty = true;
                        if (is_numeric(Number(row))) {
                            ptv = $filter('number')(row);
                            row = ptv;
                        }
                    } else {
                        tableCtrl.IsQty = false;
                    }
                }
            }
            tableCtrl.columnData = row;
            return tableCtrl.columnData;
        }

        function is_numeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function getCustomCellTemplate(row, value) {
            if (row) {
                if (value && value.CustomCellTemplate) {
                    return value.CustomCellTemplate;
                }
            }
            return '';
        }

        function commandClick(command) {
            if (tableCtrl.onCommandClicked) {
                tableCtrl.onCommandClicked({ command: command });
            }
        }

        function headerClick(headerKey, reverse) {
            if (headerKey) {
                var regExp = /Facets\[(.+)\](.+)/;
                var found = headerKey.match(regExp);
                var facetName;
                var propertyName = headerKey.split('.').join('/');
                if (found !== null && found !== undefined && found.length > 2) {
                    facetName = found[1];
                    propertyName = 'Facets[' + facetName + ']' + found[2].split('.').join('/');
                }

                if (tableCtrl.config.fields.hasOwnProperty(propertyName) && tableCtrl.config.fields[propertyName].sorting) {
                    if (tableCtrl.config && tableCtrl.config.getSettings && tableCtrl.config.applySettings) {
                        var settings = tableCtrl.config.getSettings();

                        settings.sort = {
                            predicate: propertyName,
                            reverse: (reverse !== undefined) ? reverse : !settings.sort.reverse
                        };
                        settings.pagination.start = 0; // Force the grid to be realoaded on the first page

                        tableCtrl.config.applySettings(settings);
                        tableCtrl.sortReverse = settings.sort.reverse;
                        tableCtrl.keySelected = headerKey;
                    }
                    logger.logDebug('[sit-pi-table::headerClick] Header clicked:' + tableCtrl.keySelected + ' - SortReverse value:' + tableCtrl.sortReverse);
                }
            }
        }

        function sortClass(headerKey) {
            if (headerKey && tableCtrl && tableCtrl.config && tableCtrl.config.fields) {
                var regExp = /Facets\[(.+)\](.+)/;
                var found = headerKey.match(regExp);
                var facetName;
                var propertyName = headerKey.split('.').join('/');
                if (found !== null && found !== undefined && found.length > 2) {
                    facetName = found[1];
                    propertyName = 'Facets[' + facetName + ']' + found[2].split('.').join('/');
                }

                if ((tableCtrl.keySelected === headerKey || tableCtrl.keySelected === propertyName) && tableCtrl.config.fields.hasOwnProperty(propertyName)) {
                    if (tableCtrl.sortReverse) {
                        if (tableCtrl.config.fields[propertyName] && tableCtrl.config.fields[propertyName].sorting === true) {
                            return 'cursor: pointer; fa fa-caret-down fa-lg';
                        }
                        return 'fa fa-caret-down fa-lg';
                    } else {
                        if (tableCtrl.config.fields[propertyName] && tableCtrl.config.fields[propertyName].sorting === true) {
                            return 'cursor: pointer; fa fa-caret-up fa-lg';
                        }
                        return 'fa fa-caret-up fa-lg';
                    }
                } else {
                    if (tableCtrl.config.fields[propertyName] && tableCtrl.config.fields[propertyName].sorting === true) {
                        return 'cursor: pointer';
                    }
                    return 'no-sort-pointer';
                }
            }
            if (tableCtrl.config && tableCtrl.config.fields && tableCtrl.config.fields[propertyName] && tableCtrl.config.fields[propertyName].sorting === true) {
                return 'cursor: pointer';
            }
            return 'no-sort-pointer';
        }

        function onSelectionChangeCallback(list, item) {

            if (list || item) {
                if (tableCtrl.config.selectionMode === 'single') {
                    tableCtrl.selectedItem = item;
                    if (item.isSelected) {
                        tableCtrl.isItemSelected = true;
                    }
                } else if (tableCtrl.config.selectionMode === 'multi' || tableCtrl.config.selectionMode === true) {
                    tableCtrl.selectedItems = list;
                    if (list.length > 0) {
                        tableCtrl.isItemSelected = true;
                    } else {
                        tableCtrl.isItemSelected = false;
                    }
                }
                if (tableCtrl.piConfig.onPiSelectionChangeCallback && list && list.length) {
                    tableCtrl.piConfig.onPiSelectionChangeCallback(list, item);
                }
            } else {
                tableCtrl.isItemSelected = false;
                if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                    tableCtrl.piConfig.onPiSelectionChangeCallback();
                }
            }
        }

        function onPageChangeCallback(pageNum) {
            $scope.$emit('$sit-pi-table.page-changed', pageNum);
        }

        function onSortChangeCallback(fieldName, reverse) {
            headerClick(fieldName, reverse);
            $scope.$emit('$sit-pi-table.sort-changed', fieldName, reverse);
        }

        function onInitCallback(config) {
            var sortDefaultField = '';
            angular.forEach(tableCtrl.piConfig.Headers, function (key) {
                if (key && key.IsSortDefault) {
                    tableCtrl.keySelected = sortDefaultField = key.Key;
                }
            });

            if (sortDefaultField !== '') {
                sortDefaultField = sortDefaultField.split('.').join('/');
                var settings = tableCtrl.config.getSettings();
                settings.sort = {
                    predicate: sortDefaultField,
                    reverse: false
                };
                tableCtrl.sortReverse = false;
            }

            $scope.$emit('$sit-pi-table.init', config);
        }

        function onQuickSearchDone(searchText) {
            if (tableCtrl.tileViewOptions.quickSearchOptions) {
                tableCtrl.tileViewOptions.quickSearchOptions.filterText = searchText;
            }
        }

        function onTileSortChanged(currentSortField, currentSortDirection) {
            tableCtrl.tileViewOptions.sortInfo = {
                field: currentSortField,
                direction: currentSortDirection
            };
        }

        function initNoDataTemplate() {
            return tableCtrl.translatedNoData = $translate.instant('picore.labels.noData');
        }

        function setPageManager() {
            if (tableCtrl.pageManager !== undefined) {
                tableCtrl.tileViewOptions.pagingOptions.pageSize = tableCtrl.pageManager.getPageSize();
                tableCtrl.tileViewOptions.pagingOptions.currentPage = tableCtrl.pageManager.getCurrentPage();
            }
            if (!tableCtrl.tileViewOptions) {
                tableCtrl.config.serverDataOptions = tableCtrl.config.dataSource;
                tableCtrl.config.pagingOptions = tableCtrl.piConfig.pagingOptions;
            }
            tableCtrl.pageManager = pageService.getPageManager(tableCtrl.tileViewOptions ? tableCtrl.tileViewOptions : tableCtrl.config, tableCtrl.sitData);
        }

        function setAutoSelection(currentItem, selectedItem) {
            var selectedItems = [];
            counter++;
            if ((selectedItem.Id && selectedItem.Id === currentItem.Id)
                || (selectedItem.id && selectedItem.id === currentItem.Id)
                || (selectedItem.NId && selectedItem.Revision && selectedItem.NId === currentItem.NId && selectedItem.Revision === currentItem.Revision)
                || (selectedItem.NId
                    && (selectedItem.Revision === undefined || selectedItem.Revision === null)
                    && selectedItem.NId === currentItem.NId
                    && (currentItem.Revision === undefined || currentItem.Revision === null))) {
                if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                    selectedItems.push(currentItem);
                    tableCtrl.piConfig.onPiSelectionChangeCallback(selectedItems, currentItem);
                    found = true;
                    return true;
                }
            } else if (counter === tableCtrl.pageManager.getPageSize() && !found) {
                if (tableCtrl.pageManager.getCurrentPage() + 1 <= Math.ceil(tableCtrl.config.data / tableCtrl.pageManager.getPageSize()) && currentPage === 1) {
                    startIndex = tableCtrl.pageManager.getCurrentPage() * tableCtrl.pageManager.getPageSize();
                    tableCtrl.pageManager.nextPage().then(onSuccess);
                    return false;
                }
            }
            return false;
        }


        function onSuccess(data) {
            var settings = tableCtrl.config.getSettings();
            settings.pagination.start = startIndex;
            tableCtrl.config.applySettings(settings);
        }

        function onCustomSelect(event, selectedItems, clickedItem) {
            $scope.$watch('tableCtrl.piConfig.TileOptions.getCurrentData().length',
                function (newDataValue) {
                    if (newDataValue > 0) {
                        tableCtrl.piConfig.TileOptions.selectItems(selectedItems, true, true);
                        if (tableCtrl.tileViewOptions.dataUpdated) {
                            logger.logInfo('[sit-pi-table::dataUpdate] tile view');
                            tableCtrl.tileViewOptions.dataUpdated();
                        }
                        if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                            tableCtrl.piConfig.onPiSelectionChangeCallback(selectedItems, clickedItem);
                        }
                    }
                },
                true);
        }

        function checkResponsiveness(width, height) {
            logger.logDebug('[sit-pi-table::checkResponsiveness] Table ID:' + tableCtrl.id + ' Width:' + width + ' - Height:' + height);
            if (tableCtrl.viewMode) {
                tableCtrl.view = tableCtrl.viewMode;
            } else if (width > 675) {
                tableCtrl.view = 'grid';
            } else {
                tableCtrl.view = 'tile';
            }
        }

        function onLayoutChange() {
            $timeout(function () {
                tableCtrl.checkResponsiveness(element.parent().width(), element.parent().parent().height());
            });
        }

        function onItemSelected(event, selectedItems, clickedItem) {
            if (selectedItems.length > 0) {
                if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                    tableCtrl.piConfig.onPiSelectionChangeCallback(selectedItems, clickedItem);
                }
            } else {
                if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                    tableCtrl.piConfig.onPiSelectionChangeCallback([], {});
                }
            }
        }

        function isAllowedCellEditing(row, value) {
            //Equipment column is editable conditionally
            if (value.IsEditable && value.Key == 'EquipmentNId'
                 && (row['TaskParameterNId'] != '' && row['TaskParameterNId'] != null
                || row['WorkProcessVariableNId'] != '' && row['WorkProcessVariableNId'] != null)) {
                return true;
            }
            return false;
        }

        $scope.$watch(function () {
            if (tableCtrl.selectedItem === undefined || tableCtrl.selectedItem === null) {
                return tableCtrl.selectedItem;
            } else {
                if (tableCtrl.selectedItem.isSelected === false) {
                    tableCtrl.selectedItem = null;
                }
            }
            return tableCtrl.selectedItem;
        }, function () {
            if (tableCtrl.selectedItem) {
                //the item is selected
                tableCtrl.isItemSelected = true;
            } else if (tableCtrl.selectedItem === null) {
                //the item is not selected
                tableCtrl.isItemSelected = false;
                $scope.$emit('$sit-pi-table.item-unselected');
                if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                    tableCtrl.piConfig.onPiSelectionChangeCallback();
                }
            }
        });


        $scope.$watch('tableCtrl.config.getSettings().pagination.totalItemCount',
            function (newValue) {
                if (newValue > 0) {
                    if (newValue % tableCtrl.config.getSettings().pagination.number == 0 && tableCtrl.config.getSettings().pagination.start !== 0) {

                        tableCtrl.pageManager.goToPage(0).then(onSuccess);
                    }
                    tableCtrl.NoData = false;
                } else {
                    tableCtrl.NoData = true;
                }
            },
            true);

        $scope.$watch('tableCtrl.config.getSettings()',
            function (newValue) {
                if (newValue) {
                    var cnt = newValue.pagination.totalItemCount;

                    if (cnt > 0) {


                        if (newValue.selectedRows.length === 0 && newValue.pagination.selectedItems === 0) {
                            if (tableCtrl.piConfig.onPiSelectionChangeCallback) {
                                tableCtrl.piConfig.onPiSelectionChangeCallback();
                            }
                        }
                    }
                }
            },
            true);
    }
})();
