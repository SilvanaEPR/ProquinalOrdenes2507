/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        //.module('Siemens.SimaticIT.UAPI.PICore.services')
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('Siemens.SimaticIT.UAPI.PICore.helperService', helperService);

    /**
     * @ngdoc service
     * @name helperService
     *
     * @requires $rootElement
     *
     * @description
     * Helper service expose methods used in multiple modules in order to centralize common logics for an easier maintenance.
     */
    function helperService() {
        this.parseFindAllQueryString = parseFindAllQueryString;
    }

    function parseFindAllQueryString(optionsString) {

        var newOptions = '';
        if (optionsString === undefined || optionsString === null) {
            return newOptions;
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
                            tmp = array[i];
                            delete array[i];
                        } else {

                            filter = array[i];
                            delete array[i];
                        }
                    } else {
                        filter += ' and ' + array[i].substr(8, array[i].length);
                        delete array[i];
                    }
                }
            }
            if (tmp !== null) {
                filter += ' and ' + tmp.substr(8, tmp.length);
            }
            array.push(filter);
            //newOptions = array.join('&'); put & at the beginning of the first element
            angular.forEach(array, function (value) {
                newOptions += value + '&';
            });
            newOptions = newOptions.substring(0, newOptions.length - 1);

        } else {
            newOptions = optionsString;
        }

        return newOptions;

    }
})();
