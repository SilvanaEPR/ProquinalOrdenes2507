/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/

//(function () {
//    'use strict';

//    /**
//     * @ngdoc module
//    * @access internal
//    * @name Siemens.SimaticIT.UAPI.PICore.services
//     *
//     * @description
//    * The module consist of services to communicate with the backend.
//     */
//    angular.module('Siemens.SimaticIT.UAPI.PICore.services',
//        []);

//})();

(function () {
    'use strict';

    angular
        //.module('Siemens.SimaticIT.UAPI.PICore.services')
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('Siemens.SimaticIT.UAPI.PICore.commonService', commonService);


    commonService.$inject = ['common.base', '$translate', '$q', '$http'];

    /**
     * @ngdoc service
     * @name commonService
     *
     * @requires $rootElement
     *
     * @description
     * The PI common service expose methods to manage common functionalities, entity and related objects relevant for Process Industries.
     */
    function commonService(base, $translate, $q, $http) {
        var vm = this;
        var backendService;
        var waitingForServer, nextDeferred, nextOptionsString;
        activate();

        function activate() {
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.findAll = findAll;
            vm.getValue = getValue;
            vm.applyConfigurationsToOptionsString = applyConfigurationsToOptionsString;
            vm.parseFilter = parseFilter;
            vm.parseFindAllQueryString = parseFindAllQueryString;
            vm.applyPropertyGridColumnsConfiguration = applyPropertyGridColumnsConfiguration;
            vm.applyValuesToConfiguredSitPropertyGridFields = applyValuesToConfiguredSitPropertyGridFields;
            vm.getManifest = getManifest;
        }

        function getManifest(uiComponentSuffix) {
            var url = 'Siemens.Custom.UIContainer' + '\\components\\' + 'siemensCustomUicontainer' + uiComponentSuffix + '.json';
            var deferred = $q.defer();
            $http.get(url)
                .then(function (response) {
                    deferred.resolve(response.data);
                }).catch(function () {
                    deferred.resolve(null);
                });
            return deferred.promise;
        }

        function applyPropertyGridColumnsConfiguration(extPropertiesObject, allowsEditing) {
            var properties = [];
            if (extPropertiesObject) {
                for (var i = 0; i < extPropertiesObject.length; i++) {
                    var property = extPropertiesObject[i];
                    var itemToDisplay = {};
                    if (property['DataType']) {
                        var labelToDisplay = property['DisplayName'];
                        switch (property['DataType']) {
                            case 'boolean':

                                itemToDisplay = {
                                    id: property['PropertyName'],
                                    label: $translate.instant(labelToDisplay),
                                    read_only: !allowsEditing || property['ReadOnly'],
                                    widget: 'sit-checkbox',
                                    validation: { required: property['Mandatory'] },
                                    value: [
                                    {
                                        checked: false
                                    }]
                                };

                                break;
                            case 'string':
                                itemToDisplay = {
                                    id: property['PropertyName'],
                                    label: $translate.instant(labelToDisplay),
                                    read_only: !allowsEditing || property['ReadOnly'],
                                    widget: 'sit-text',
                                    validation: { required: property['Mandatory'] },
                                    value: ''
                                };

                                break;
                            case 'numeric':
                                itemToDisplay = {
                                    id: property['PropertyName'],
                                    label: $translate.instant(labelToDisplay),
                                    read_only: !allowsEditing || property['ReadOnly'],
                                    widget: 'sit-numeric',
                                    validation: { required: property['Mandatory'] },
                                    value: ''
                                };

                                break;
                            case 'date':
                                itemToDisplay = {
                                    id: property['PropertyName'],
                                    label: $translate.instant(labelToDisplay),
                                    read_only: !allowsEditing || property['ReadOnly'],
                                    widget: 'sit-date-time-picker',
                                    widgetAttributes: {
                                        format: property['Format'] !== undefined && property['Format'] !== null && property['Format'].length > 0
                                            ? property['Format']
                                            : 'medium'
                                    },
                                    validation: { required: property['Mandatory'] },
                                    value: ''
                                };

                                break;
                        }
                    }
                    properties.push(itemToDisplay);
                }
            }

            return properties;
        }

        function applyValuesToConfiguredSitPropertyGridFields(dataConfig, value) {
            if (dataConfig === undefined || dataConfig === null || dataConfig.length === 0) {
                return;
            }

            if (value === undefined || value === null) {
                return;
            }

            for (var j = 0; j < dataConfig.length; j++) {
                if (dataConfig[j].widget === 'sit-checkbox') {
                    dataConfig[j].value[0].checked = getValue(dataConfig[j]['id'], value);
                } else {
                    dataConfig[j].value = getValue(dataConfig[j]['id'], value);
                }
            }
        }

        function getValue(field, value) {
            var row = value;
            var fieldProperties = [];
            var regexp = /(\w+)\[(.+)\].(.+)/i; // Matches a field of Array type and extracts both the field name and the Array index.
            //Ex.: "Facets[namespace.facetName] or Facets[0]"
            var index = 0;
            var path = '';
            var arrayFieldName = '';
            var found = field.match(regexp);
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
                    row[arrayFieldName] = fieldProperties.length === 0 ? '' : {
                    };
                }

                row = row[arrayFieldName];
                if (row === null || row === undefined) {
                    row = '';
                } else {
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
                }

            } else {
                fieldProperties = field.split('.');
            }

            while (fieldProperties.length > 0) {

                var pathStep = fieldProperties.shift();

                if (row[pathStep] === undefined) {
                    row[pathStep] = fieldProperties.length === 0 ? '' : {
                    };
                }

                row = row[pathStep];

                if (row === null || row === undefined) {
                    return '';
                }
            }

            return row;
        }

        /**
         * @ngdoc function
         * @name findAll
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Retrieves the list of items requested. It is used by sit-table server side pagination.
         * @param {object} serverDataOptions Contains the entity and options (oData query string) to query.
         * @returns {object} the list of Items that matches the conditions.
         */
        function findAll(serverDataOptions) {
            var queryModel = {};
            queryModel.appName = serverDataOptions.appName;
            queryModel.entityName = serverDataOptions.entityName ? serverDataOptions.entityName : serverDataOptions.dataEntity;

            var newOptions = parseFindAllQueryString(serverDataOptions.options ? serverDataOptions.options : serverDataOptions.optionsString);

            queryModel.options = newOptions;
            waitingForServer = true;
            nextDeferred = $q.defer();
            return backendService.findAll(queryModel).catch(backendService.backendError).catch(backendService.backendError).finally(onRequestComplete(queryModel));
        }

        function onRequestComplete(queryModel) {
            // call to server has returned,
            waitingForServer = false;
            if (!nextOptionsString) {
                return;
            }
            // hold onto these
            var wasNextDeferred = nextDeferred;

            // clear out these so another request can be handled
            nextOptionsString = '';
            nextDeferred = null;


            return backendService.findAll(queryModel).then(
                function (response) {
                    wasNextDeferred.resolve(response);
                },
                function (reject) {
                    wasNextDeferred.reject(reject);
                }
            );
        }

        function parseFindAllQueryString(optionsString) {

            var compactedOptions = compactFilterClauses(optionsString);
            compactedOptions = compactOrderByClauses(compactedOptions);

            return compactedOptions;

        }

        function compactFilterClauses(optionsString) {
            var compactedFilterOptions = '';
            if (optionsString === undefined || optionsString === null) {
                return compactedFilterOptions;
            }
            var countFilterOccurances = optionsString.split('$filter=') !== undefined ? (optionsString.split('$filter=').length - 1) : 0;
            var tmp = null;
            if (countFilterOccurances > 1) {
                var array = optionsString.split('&');
                var filter;
                for (var i = 0; i < array.length; i++) {
                    if ((array[i].split('$filter=').length - 1) > 0) {
                        if (filter === undefined) {
                            if (array[i].substring(0, 18) === '$filter=startswith') {
                                if (array[i].split('$filter=startswith').length > 0) {
                                    var arr = array[i].split('$filter=startswith');
                                    for (var j = 0; j < arr.length; j++) {
                                        var a = arr[j].split(',');
                                        if (a[0].includes('.')) {
                                            arr[j] = a[0].replace('.', '/') + ',' + a[1];
                                        }
                                        if (arr[j].split('or').length > 0 && arr[j] !== '') {
                                            array[i] = '$filter=(startswith' + arr[j] + ')';
                                        }
                                    }
                                }
                                tmp = array[i];
                                delete array[i];
                            } else {

                                filter = array[i];
                                delete array[i];
                            }
                        } else {
                            // Filter clauses are placed in round brackets to prevent conflicts with PRE-filter clause
                            // $filter=(filter-clause1 or filter-clause2) and pre-filter-clause
                            filter = '$filter=(' + filter.substr(8, filter.length) + ') and ' + array[i].substr(8, array[i].length);
                            delete array[i];
                        }
                    }
                }
                if (tmp !== null) {
                    filter += ' and ' + tmp.substr(8, tmp.length);
                }
                array.push(filter);
                //fixedFilterOptions = array.join('&'); put & at the beginning of the first element
                angular.forEach(array, function (value) {
                    compactedFilterOptions += value + '&';
                });
                compactedFilterOptions = compactedFilterOptions.substring(0, compactedFilterOptions.length - 1);
            } else {
                compactedFilterOptions = optionsString;
            }

            return compactedFilterOptions;
        }

        function compactOrderByClauses(optionsString) {
            var compactedFilterOptions = '';
            if (optionsString === undefined || optionsString === null) {
                return compactedFilterOptions;
            }
            var countOrderbyOccurrences = optionsString.split('$orderby=') !== undefined ? (optionsString.split('$orderby=').length - 1) : 0;
            if (countOrderbyOccurrences > 1) {
                var array = optionsString.split('&');
                var orderby;
                for (var i = 0; i < array.length; i++) {
                    if ((array[i].split('$orderby=').length - 1) > 0) {
                        if (orderby === undefined) {
                            orderby = array[i];
                            delete array[i];
                        } else {
                            orderby += ',' + array[i].substr(9, array[i].length);
                            delete array[i];
                        }
                    }
                }

                array.push(orderby);
                angular.forEach(array, function (value) {
                    compactedFilterOptions += value + '&';
                });
                compactedFilterOptions = compactedFilterOptions.substring(0, compactedFilterOptions.length - 1);

            } else {
                compactedFilterOptions = optionsString;
            }

            return compactedFilterOptions;
        }

        function parseFilter(optionsString, filters) {
            var result = optionsString;
            if (filters !== undefined && filters !== null && filters.length > 0) {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i].filterField.field.indexOf('Facets') > -1) {
                        var regExp = '';
                        var regExp2 = /Facets\[(.+)\].(.+)/;
                        var match = '';
                        var operator = '';
                        var value = '';
                        var facetFullName = '';
                        var facetPropertyName = '';
                        var toReplace = '';
                        var found = null;
                        var found2 = null;
                        switch (filters[i].operator) {
                            case '=':
                            case '<>':
                            case '<':
                            case '<=':
                            case '>':
                            case '>=':
                                if (filters[i].filterField.type === 'date') {
                                    //  Regular Expression to match W3C ISO 8601 Standard for the representation of dates and times.
                                    //  Complete precision:
                                    //\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)
                                    regExp = filters[i].filterField.field + ' (eq|ne|lt|le|gt|ge) ';
                                    regExp = regExp.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');
                                    //.split('.').join('\\.')
                                    regExp = regExp + '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+(?:[+-][0-2]\\d:[0-5]\\d|Z))';
                                } else {
                                    regExp = filters[i].filterField.field + ' (eq|ne|lt|le|gt|ge) (\'?' + filters[i].value + '\'?)';
                                    regExp = regExp.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');
                                }

                                do {
                                    found = result.match(regExp);
                                    if (found !== undefined && found !== null && found.length > 2) {
                                        match = found[0];
                                        operator = found[1];
                                        value = found[2];
                                        found2 = filters[i].filterField.field.match(regExp2);
                                        if (found2 !== undefined && found2 !== null && found2.length > 2) {
                                            facetFullName = found2[1];
                                            facetPropertyName = found2[2];

                                            toReplace = 'Facets/any(f%3Af/' + facetFullName + '/' + facetPropertyName + ' ' + operator + ' ' + value + ')';
                                            result = result.replace(match, toReplace);
                                        }
                                    }
                                } while (found !== undefined && found !== null && found.length > 2);
                                break;
                            case 'in':
                                var values = filters[i].value.split(',');
                                if (values.length === 0) {
                                    values.push('');
                                }
                                for (var ii = 0; ii < values.length; ii++) {
                                    regExp = filters[i].filterField.field + ' (eq) (\'?' + values[ii] + '\'?)';
                                    regExp = regExp.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');
                                    //.split('.').join('\\.')
                                    found = optionsString.match(regExp);
                                    if (found !== undefined && found !== null && found.length > 2) {
                                        match = found[0];
                                        operator = found[1];
                                        value = found[2];
                                        found2 = filters[i].filterField.field.match(regExp2);
                                        if (found2 !== undefined && found2 !== null && found2.length > 2) {
                                            facetFullName = found2[1];
                                            facetPropertyName = found2[2];

                                            toReplace = 'Facets/any(f%3Af/' + facetFullName + '/' + facetPropertyName + ' ' + operator + ' ' + value + ')';
                                            result = result.replace(match, toReplace);
                                        }
                                    }
                                }
                                break;
                            case 'contains':
                                result = parseFunctions(optionsString, result, 'contains', filters[i]);
                                break;
                            case 'startsWith':
                                result = parseFunctions(optionsString, result, 'startswith', filters[i]);
                                break;
                            case 'endsWith':
                                result = parseFunctions(optionsString, result, 'endswith', filters[i]);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            return result;
        }

        function parseFunctions(optionsString, result, functionName, filter) {
            var regExp = functionName + '\\(' + filter.filterField.field + ', (\'?' + filter.value + '\'?)\\)';
            var regExp2 = /Facets\[(.+)\].(.+)/;
            // regExp2 = /Facets\[(.+)\].(\w+)/
            regExp = regExp.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');
            //.split('.').join('\\/')
            var found = optionsString.match(regExp);
            if (found !== undefined && found !== null && found.length > 1) {
                var match = found[0];
                var value = found[1];
                var found2 = filter.filterField.field.match(regExp2);
                if (found2 !== undefined && found2 !== null && found2.length > 2) {
                    var facetFullName = found2[1];
                    var facetPropertyName = found2[2];

                    var toReplace = 'Facets/any(f%3A' + functionName + '(f/' + facetFullName + '/' + facetPropertyName + ', ' + value + '))';
                    result = result.replace(match, toReplace);
                }
            }

            return result;
        }

        function applyConfigurationsToOptionsString(optionsString, navigationProperties, facetFullNames, columnConfiguration) {
            var regExp1 = /\$expand=(.+)\&/;
            var regExp2 = /\$expand=(.+)/;
            var tempNavigationProperties = '';
            var optionsStringNavigationProperties = '';
            var containsExpand = false;
            var containsFacetSelect = false;

            //  Search for the existence of an 'expand' statement inside the options string
            //  1. check if the 'expand' is followed by another statement (joined by the '&' character)
            var found = optionsString.match(regExp1);
            if (found === null || found === undefined || found.length < 2) {
                found = optionsString.match(regExp2);
            }

            //  2. check if the 'expand' is not followed by any other statement
            if (found !== null && found !== undefined && found.length > 1) {
                optionsStringNavigationProperties = found[1];
                containsExpand = true;
            }

            //  Join the list of already existing Navigation Properties (if any) with the provided list in input.
            //  Avoid duplications.
            if (navigationProperties !== undefined && navigationProperties !== null && navigationProperties.length > 0) {
                if (containsExpand) {
                    var destinationNavigationProperties = [];
                    if (Array.from !== undefined) {
                        destinationNavigationProperties = Array.from(navigationProperties);
                    } else {
                        for (var i = 0; i < navigationProperties.length; i++) {
                            destinationNavigationProperties.push(navigationProperties[i]);
                        }
                    }
                    var optionsStringNavigationPropertyList = optionsStringNavigationProperties.split(',');
                    for (var ii = 0; ii < optionsStringNavigationPropertyList.length; ii++) {
                        var index = $.inArray(optionsStringNavigationPropertyList[ii].trim(), destinationNavigationProperties);
                        if (index > -1) {
                            destinationNavigationProperties.splice(index, 1);
                        }
                    }
                    if (destinationNavigationProperties.length > 0) {
                        tempNavigationProperties = optionsStringNavigationProperties + ',' + destinationNavigationProperties.join();
                    } else {
                        tempNavigationProperties = optionsStringNavigationProperties;
                    }

                } else {
                    tempNavigationProperties = navigationProperties.join();
                }
            } else {
                tempNavigationProperties = optionsStringNavigationProperties;
            }

            if (facetFullNames !== undefined && facetFullNames !== null && facetFullNames.length > 0) {
                //  'Facets' is a Navigation Property as well; join the Facets Navigation Property with the already existing ones
                //  (if any, and in case it doesn not aready exist)
                if (tempNavigationProperties.length === 0) {
                    tempNavigationProperties = 'Facets';
                } else if (!tempNavigationProperties.indexOf('Facets') > -1) {
                    tempNavigationProperties = tempNavigationProperties + ',Facets';
                }

                if (columnConfiguration !== undefined && columnConfiguration !== null && columnConfiguration.length > 0) {
                    if (tempNavigationProperties && tempNavigationProperties != null && tempNavigationProperties != '') {
                        var regExp3 = /Facets(?:\(\$select=(.+)\))/;
                        var foundSelect = tempNavigationProperties.match(regExp3);
                        var tempSelect = '';

                        //  Search for already configured Facets properties in a Select clause.
                        if (foundSelect !== undefined && foundSelect !== null && foundSelect.length > 1) {
                            tempSelect = foundSelect[1];
                            containsFacetSelect = true;
                        }

                        var columnsInSelect = [];
                        var tempSelectList = tempSelect && tempSelect.length > 0 ? tempSelect.split(',') : [];
                        if (tempSelectList && tempSelectList.length > 0) {
                            for (var k = 0; k < tempSelectList.length; k++) {
                                tempSelectList[k] = tempSelectList[k].trim();
                            }
                        }

                        //  Based on the provided Columns configuration, extract the names of the Facets properties to be added in the select clause, avoiding
                        //  duplications with the already existing ones (if any)
                        var regExp4 = /Facets\[(.+)\].(\w+)/;
                        for (var z = 0; z < facetFullNames.length; z++) {
                            for (var j = 0; j < columnConfiguration.length; j++) {
                                var propertyName = columnConfiguration[j].PropertyName;
                                if (propertyName !== null && propertyName !== undefined && propertyName.indexOf(facetFullNames[z]) > -1) {
                                    var foundProperty = propertyName.match(regExp4);
                                    if (foundProperty !== null && foundProperty !== undefined && foundProperty.length > 2) {
                                        var propertyFullName = facetFullNames[z] + '/' + foundProperty[2];
                                        if (!(tempSelectList && tempSelectList.length > 0 && $.inArray(propertyFullName, tempSelectList) > -1)) {
                                            columnsInSelect.push(facetFullNames[z] + '/' + foundProperty[2]);
                                        }
                                    }
                                }
                            }
                        }

                        //  Format the options string replacing the original with the modified one.
                        if (columnsInSelect.length > 0) {
                            if (containsFacetSelect) {
                                tempNavigationProperties = tempNavigationProperties.replace(tempSelect, tempSelect + ',' + columnsInSelect.join());
                            } else {
                                tempNavigationProperties = tempNavigationProperties.replace('Facets', 'Facets($select=' + columnsInSelect.join() + ')');
                            }
                        }
                    }
                }
            }

            if (tempNavigationProperties !== undefined && tempNavigationProperties !== null && tempNavigationProperties.length > 0) {
                if (containsExpand) {
                    optionsString = optionsString.replace(optionsStringNavigationProperties, tempNavigationProperties);
                } else {
                    if (optionsString.length > 0) {
                        optionsString += '&$expand=' + tempNavigationProperties;
                    } else {
                        optionsString = '$expand=' + tempNavigationProperties;
                    }
                }
            }

            return optionsString;
        }
    }
})();
