/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.services.modelDriven
    * @access internal
    * @description This module provides services used to implement the model driven UI
    */
    angular.module('siemens.simaticit.common.services.modelDriven', []);
})();

/* jshint -W054*/
(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.modelDriven')
        /**
          * @ngdoc service
          * @name common.services.modelDriven.contextService
          * @module siemens.simaticit.common.services.modelDriven
          * @access internal
          * @description
          * this service handle all context switch as well as all all method to solve/interpolate expression based on context
          *
          */
        .service('common.services.modelDriven.contextService', ['$rootScope', '$state', '$q', '$timeout', '$parse', '$interpolate', '$translate',
            'common.services.swac.SwacUiModuleManager', '$stateParams', 'common.services.navigation.navigationManagementService', function ($rootScope, $state, $q, $timeout, $parse, $interpolate, $translate, swacManager, $stateParams, navigationManagementService) {
                this.MDState = { "previousState": "", "previousData": {} };
                this.contextsRepository = [];
                var self = this,
                    sidepanelState = {
                        isSidepanelOpen: false,
                        show: null
                    };
                var isSideBarNavigation = false;

                subscribeToSwacEvent();

                //listen to every state change in order to update/clear the current context
                $rootScope.$on("$stateChangeSuccess", function (event, toState, toParam, fromState, fromParam) {
                    var isToStateSidePanel = toState.views && toState.views['property-area-container@'] && toState.views['property-area-container@'].controller ? true : false;
                    var isfromStateSidePanel = fromState.views && fromState.views['property-area-container@'] && fromState.views['property-area-container@'].controller ? true : false;
                    //preserve prev status and parameters ... used by the onExit feature to navigate back to the previous status
                    if (!(isfromStateSidePanel && isToStateSidePanel)) {
                        self.MDState.previousState = fromState;
                        self.MDState.previousData = fromParam;
                    }
                    if (self.contextsRepository.length === 0) { //init context repository
                        self.contextsRepository.push({ "name": toState.name, "context": { "params": {} }, "viewParam": toParam, "modelViewController": null });
                    }
                    if (!self.contextsRepository[0].context) { //init context repository
                        self.contextsRepository[0].context = {
                            "params": {}
                        };
                    }
                    //update at least status parameters
                    //... because other context info are updated when status template call setContextInfo (not done by actions)
                    if (toParam.mduiCtx) {
                        var mduiCtx = JSON.parse(window.$UIF.String.decode(toParam.mduiCtx));
                        Object.keys(mduiCtx.stateParams).forEach(function (key) {
                            self.contextsRepository[0].context.params[key] = mduiCtx.stateParams[key];
                        });
                    }
                    Object.keys(toParam).forEach(function (key) {
                        self.contextsRepository[0].context.params[key] = toParam[key];
                    });
                    clearCtx();
                });

                function subscribeToSwacEvent() {
                    if (swacManager.enabled) {
                        swacManager.eventBusServicePromise.promise.then(function (eventBusSvc) {
                            eventBusSvc.register('mom.navigation.start');
                            eventBusSvc.register('historyNavigation');
                            eventBusSvc.event.subscribe(function (event) {
                                //historyNavigation event is raised on back button click as well as sidebar navigation where as 'mom.navigation.start' is only trigerred in case of sidebar navigation
                                //So subscribed to both the events to eliminate the false events.
                                if (event.data.topic === 'mom.navigation.start') {
                                    isSideBarNavigation = true;
                                    $timeout(function () {
                                        isSideBarNavigation = false
                                    }, 1000, false);
                                }
                            });
                        });
                    }
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#setContexInfo
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {object} ctxObj the context repository
                * @param {object} viewParam the statePatam of the current status
                * @param {object} viewCtrl the ModelViewCtrl object of the current status
                * @description
                * Overwrite current context information. Used internally by the ModelViewCtrl.
                *
                */

                this.setContexInfo = function (ctxObj, viewParam, viewCtrl) {
                    var stateId = $state.$current.toString();
                    self.contextsRepository = []; // no hierarchical md view ... so we've always only one context
                    self.contextsRepository.push({ "name": stateId, "context": ctxObj, "viewParam": viewParam, "modelViewController": viewCtrl });
                };

                this.setContentContext = function (contentName, selectedItem) {
                    if (self.contextsRepository.length > 0) {
                        if (self.contextsRepository[0].context.contents[contentName]) {
                            self.contextsRepository[0].context.contents[contentName].selectedItem = selectedItem;
                        }
                    }
                }

                this.getContextInfo = function () {
                    if (self.contextsRepository.length > 0) {
                        return self.contextsRepository[0].context;
                    }
                };

                this.getBreadCrumbChain = function () {
                    return $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)).tracking : [];
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#getViewCtrl
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @returns {object} The ModelViewCtrl of the current status
                * @description
                * The ModelViewCtrl provides contents and actions refresh and clean api.
                *
                */
                this.getViewCtrl = function () {
                    if (self.contextsRepository.length > 0) {
                        return self.contextsRepository[0].modelViewController;
                    }
                };


                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#evalFunctionWithStateCtx
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} functionBody body of the function ending with a return ...
                * @param {object} additionalContext (optional) Additional context info (e.g.: actionField while in an action)
                * @returns {object} the function evaluation
                * @description
                * The method evaluate a "function body" using the current status contenx object (support extra context variable)
                *
                */

                // Added NOSONAR because in version 2.2 we suppress the vulnerability in according to project architect and the security expert of the product.
                // In detail the process was tracked by the TFS issue number 22519
                // In version 2.3 SonarQube all those issues that were marked before reappeared again. Better, for a certain period the issues were
                //listed as resolved and, at the same time, they were listed as new issues.
                // So a agreed solution with the team issue administrator is to mark them using an in-code approach.
                // You can find details on the attached email on the TFS issue number 22519
                this.evalFunctionWithStateCtx = function (functionBody, additionalContext) {
                    if (typeof functionBody !== 'string') {
                        return functionBody;
                    }
                    functionBody = modifyCustomExpression(functionBody);
                    if (functionBody.indexOf('baseCommand') !== -1 && !additionalContext.baseCommand) {
                        return functionBody;
                    }
                    var paramsNameOrder = ["params", "contents", "activeContent", "action", "baseCommand", "currentContentItem"],
                        args = paramsNameOrder.join(', ');

                    var fn = 'return function (' + args + ') { ' + functionBody + '};';
                    var defFunction = new Function(fn)(); //NOSONAR
                    if (self.contextsRepository.length === 0) {
                        return undefined;
                    }
                    if (defFunction) {
                        try {
                            var retValue = null, newProp = [], ctx;
                            if (additionalContext) {
                                newProp = Object.getOwnPropertyNames(additionalContext);
                            }
                            //IMPORTANT: deep clone of context because function can modify it
                            ctx = JSON.parse(JSON.stringify(self.contextsRepository[0].context));
                            newProp.forEach(function (pName) { //add props
                                ctx[pName] = additionalContext[pName];
                            });
                            //respect param order above in fn
                            var params = paramsNameOrder.map(function (pName) {
                                return ctx.hasOwnProperty(pName) ? ctx[pName] : undefined;
                            });
                            self.currentContext = ctx;
                            ctx.safeVal = safeVal;
                            if (ctx.contents) {
                                Object.keys(ctx.contents).forEach(function (content) {
                                    if (ctx.contents[content]) {
                                        addMethodsToArray(ctx.contents[content].selectedItems);
                                    }
                                });
                            }
                            retValue = defFunction.apply(ctx, params);
                            return retValue;
                        }
                        catch (e) {
                            return undefined; // wrong custom evalFunction
                        }
                    }
                    return self.contextsRepository[0].context;
                };

                function safeVal(expression) {
                    if (expression) {
                        var context = self.currentContext;
                        var expressionParts = expression.split('.');
                        for (var i = 0; i < expressionParts.length; i++) {
                            if (!context.hasOwnProperty(expressionParts[i])) {
                                return null;
                            }
                            context = context[expressionParts[i]];
                        }
                        return context;
                    } else {
                        return null;
                    }
                }


                function modifyCustomExpression(expression) {
                    if (expression) {
                        expression = expression.replace(new RegExp('safeVal\\(', 'g'), 'this.safeVal(');
                        expression = convertEvalFuncArgsToString(expression);
                    }
                    return expression;
                }

                function indexesOf(text, subText, caseSensitive) {
                    var _source = text;
                    var _find = subText;
                    if (!caseSensitive) {
                        _source = _source.toLowerCase();
                        _find = _find.toLowerCase();
                    }
                    var result = [];
                    for (var i = 0; i < _source.length;) {
                        if (_source.substring(i, i + _find.length) === _find) {
                            result.push(i);
                            i += _find.length;  // found a subText, skip to next position
                        } else {
                            i += 1;
                        }
                    }
                    return result;
                }

                function convertEvalFuncArgsToString(expression) {
                    var strReplace = 'selectedItems.eval("';
                    //add " after eval(
                    var temp = expression.split('selectedItems.eval(');
                    expression = temp.join(strReplace);

                    var arr = indexesOf(expression, strReplace, true);
                    arr.forEach(function (item) {
                        var parenthesisCount = 0, char = '';
                        for (var i = item + strReplace.length; i < expression.length; i++) {
                            char = expression.charAt(i);
                            if (char === '(') {
                                parenthesisCount += 1;
                            } else if (char === ')' && parenthesisCount === 0) {
                                // replace ) with ")
                                var part1 = expression.slice(0, i);
                                var part2 = expression.slice(i);
                                expression = part1 + '"' + part2;
                                break;
                            } else if (char === ')' && parenthesisCount !== 0) {
                                parenthesisCount -= 1;
                            }
                        }
                    });
                    return expression;
                }

                function addMethodsToArray(array) {
                    if (Array.isArray(array)) {
                        array.list = function (param) {
                            var retArr = [];
                            if (!array.forEach || typeof array.forEach !== 'function') {
                                return retArr;
                            }
                            array.forEach(function (item) {
                                if (item[param]) {
                                    retArr.push(item[param]);
                                }
                            });
                            return retArr;
                        }
                        array.eval = function (condition) {
                            var result = true, obj, ttt;
                            if (!array.forEach || typeof array.forEach !== 'function') {
                                return false;
                            }
                            array.forEach(function (item) {
                                obj = { 'item': item };
                                ttt = $parse(condition);
                                result = result && ttt(obj);
                            });
                            return result;
                        }
                    }
                }


                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#parseWithStateCtx
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} expression the expression
                * @param {object} additionalContext (optional) Additional context info (e.g.: actionField while in an action)
                * @returns {object} the expression evaluation
                * @description
                * The method use the current status contenx object and support extra context variable.
                *
                */
                this.parseWithStateCtx = function (expression, additionalContext) {
                    if (typeof expression !== 'string') {
                        return expression;
                    }
                    //state descending and parse each context obj)
                    expression = modifyCustomExpression(expression);
                    if (expression.indexOf('baseCommand') === 0 && !additionalContext.baseCommand) {
                        return expression;
                    }
                    if (self.contextsRepository.length === 0) {
                        return undefined;
                    }
                    if (expression) {
                        try {
                            var ttt = $parse(expression), retValue = null, newProp = [];
                            if (additionalContext) {
                                newProp = Object.getOwnPropertyNames(additionalContext);
                            }
                            newProp.forEach(function (pName) { //add props
                                self.contextsRepository[0].context[pName] = additionalContext[pName];
                            });
                            self.currentContext = self.contextsRepository[0].context;
                            var ctx = self.currentContext;
                            ctx.safeVal = safeVal;
                            if (ctx.contents) {
                                Object.keys(ctx.contents).forEach(function (content) {
                                    if (ctx.contents[content]) {
                                        addMethodsToArray(ctx.contents[content].selectedItems);
                                    }
                                });
                            }
                            retValue = ttt(ctx);
                            newProp.forEach(function (pName) { //remove props
                                delete self.contextsRepository[0].context[pName];
                            });
                            return retValue;
                        }
                        catch (e) {
                            return undefined; // wrong custom expression
                        }
                    }
                    return self.contextsRepository[0].context;
                };

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#parseExpr
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} expr the expression
                * @param {object} context The context info
                * @returns {object} the expression evaluation
                * @description
                * Pure Angular "$parse" wrapper with no predefined context
                * It's used in order to solve expression on the modeal fields or against data queried
                */
                this.parseExpr = function (expr, context) {
                    var ttt = $parse(expr);
                    return ttt(context);
                };
                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#interpolateExpr
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} expr the angular expression
                * @param {object} context (optional) Additional context info
                * @returns {string} the expression interpolation
                * @description
                * Pure Angular "$interpolate" ... internaly use the current state context
                * Use to solve confirm action questions
                */
                this.interpolateExpr = function (expr, context) {
                    var curCtx = angular.copy(self.contextsRepository[0].context);
                    if (context) {
                        Object.getOwnPropertyNames(context).forEach(function (propName) {
                            curCtx[propName] = context[propName];
                        });
                    }
                    return $interpolate(expr)(curCtx);
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#translateString
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} string
                * @returns {string} the string translation and interpolation
                * @description
                * Pure Angular "$translate" ... internaly use the current state context
                * Use to globalize the action message
                */
                this.translateString = function (expression) {
                    var currentContext = self.contextsRepository[0].context;
                    return $translate.instant(expression, currentContext);
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#interpolateQuery
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {string} query the query with angular parameter
                * @param {object} context (optional) Additional context info
                * @returns {string} the query interpolation
                * @description
                * Provide in any case a valid query ... even when parameters are not available (null/undefined).
                * Use to solve parameter in query fields
                */
                this.interpolateQuery = function (query, context) {
                    var ttt = query.match(/{{[^{}]*}}/g); //NOSONAR
                    if (ttt && ttt.length > 0) {
                        ttt.forEach(function (elem) {
                            var cleanParam = elem.replace("{{", "").replace("}}", ""),
                                paramValue = self.parseWithStateCtx(cleanParam, context);
                            if (typeof paramValue === "undefined" || paramValue === null) {
                                query = query.replace(elem, 'null');
                            }
                        });
                    }
                    return self.interpolateExpr(query, context);
                }
                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#prepareMethodParams
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {object} fieldsList the action Fields manifest object
                * @param {object} ctx (optional) Additional context info
                * @param {object} retObj (optional) returned object
                * @returns {object} An object with all action parameter evaluated
                * @description
                * Action/command parameter are evaluated against the current status context
                * Use to solve parameter in query fields
                */
                this.prepareMethodParams = function (fieldsList, ctx, retObj) {
                    if (!retObj) {
                        retObj = {};
                    }
                    Object.getOwnPropertyNames(fieldsList).forEach(function (fieldName) {
                        var fieldObj = fieldsList[fieldName];
                        var paramName = "", interpolated = "";
                        //is param?
                        if (fieldObj.parameterRef && fieldObj.parameterRef.parameter) {
                            paramName = fieldObj.parameterRef.parameter;
                            if (fieldObj.value) {
                                if (typeof fieldObj.value.expression === "string") {
                                    interpolated = self.parseWithStateCtx(fieldObj.value.expression, ctx);
                                    retObj[paramName] = interpolated;
                                }
                                else if (typeof fieldObj.value.body === "string") {
                                    interpolated = self.evalFunctionWithStateCtx(fieldObj.value.body, ctx);
                                    if (typeof interpolated === "object" && interpolated !== null && typeof interpolated.then === "function") {
                                        //to check ... can be asynch but should come in time for the execution
                                        interpolated.then(function (outcome) {
                                            retObj[paramName] = outcome;
                                        });
                                    }
                                    else {
                                        retObj[paramName] = interpolated;
                                    }
                                }
                            }
                            else if (fieldObj.default) {
                                if (typeof fieldObj.default.expression === "string") {
                                    interpolated = self.parseWithStateCtx(fieldObj.default.expression, ctx);
                                    retObj[paramName] = interpolated;
                                }
                                else if (typeof fieldObj.default.body === "string") {
                                    interpolated = self.evalFunctionWithStateCtx(fieldObj.default.body, ctx);
                                    if (typeof interpolated === "object" && interpolated !== null && typeof interpolated.then === "function") {
                                        //to check ... can be asynch but should come in time for the execution
                                        interpolated.then(function (outcome) {
                                            retObj[paramName] = outcome;
                                        });
                                    }
                                    else {
                                        retObj[paramName] = interpolated;
                                    }
                                }
                            }
                        }
                    })
                    return retObj;
                }
                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#clearCtx
                * @access internal
                * @module siemens.simaticit.common.services.modelDriven
                * @description
                * Preserve the last status context only if the current status is a substatus of the last one ... otherwise clean it ...
                * E.g.: Preserve parent status context while in an action
                */
                function clearCtx() {
                    var stateId = $state.$current.toString();
                    self.contextsRepository = self.contextsRepository.filter(function (context) {
                        return (stateId.substr(0, context.name.length) === context.name);
                    });
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#setPropertyPanelState
                * @access internal
                * @module siemens.simaticit.common.services.modelDriven
                * @description
                * Preserve the status of property mode sidepanel.
                * @param {Boolean} state A flag which indicates the sidepanel open/close state.
                * @param {Expression || Function} showExpression An expression/function body, which evaluates the sidepanel visibility.
                */
                this.setPropertyPanelState = function (state, showExpression) {
                    sidepanelState = {
                        isSidepanelOpen: state,
                        show: showExpression
                    };
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.contextService#getPropertyPanelState
                * @access internal
                * @module siemens.simaticit.common.services.modelDriven
                * @description
                * Returns the status of property mode sidepanel.
                * @returns {Object} An object with property mode sidepanel status
                */
                this.getPropertyPanelState = function () {
                    return sidepanelState;
                }

            }]);
}());

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.modelDriven').service('common.services.modelDriven.dataService', DataService);

    /**
     * @ngdoc service
     * @name common.services.modelDriven.dataService
     * @module siemens.simaticit.common.services.modelDriven
     * @access internal
     * @description
     * Holds all data and command service for screens/actions
     */
    DataService.$inject = ['$state', '$resource', '$http', 'common.base'];
    function DataService($state, $resource, $http, base) {
        var vm = this;
        var backendService;
        activate();

        function activate() {
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            vm.buildManifestEntity = buildManifestEntity;
        }

        function getOnExitValue(key, response) {
            if (key == null || key == undefined) {
                return null;
            }

            var temp = key;
            var arrayStringIndex = temp.indexOf('[');
            if (arrayStringIndex !== -1) {
                key = temp.substring(0, arrayStringIndex);
                var indexString = temp.substring(arrayStringIndex);
                var arrayIndex = indexString.indexOf(']');
                var index = arrayIndex !== -1 ? Number(indexString.substring(1, arrayIndex)) : 0;
            }
            if (response && response.data && response.data[key]) {
                if (response.data[key].constructor === Array) {
                    if (typeof index === 'number' && !isNaN(index)) {
                        return response.data[key][index];
                    }
                    return response.data[key];
                }
                return response.data[key];
            }
        }

        function transformOnExit(onExit) {
            if (!onExit) {
                return onExit;
            }
            var key = onExit.key || 'Id';
            var refreshAndSelectContents = onExit.refreshAndSelectContents || [];
            onExit.refreshAndSelectContents = refreshAndSelectContents.map(function (item) {
                if (typeof item === 'string') {
                    item = { content: item, key: key };
                }
                return item;
            });
            return onExit;
        }

        function isValidResponse(response) {
            var isValid = false;
            if (!response) {
                return isValid;
            }
            var inValidContentKeys = [];
            Object.keys(response).forEach(function (key) {
                if (response[key] === undefined) {
                    inValidContentKeys.push(true);
                }
            });
            isValid = !inValidContentKeys.length;
            return isValid;
        }

        /**
         * @ngdoc method
         * @name common.services.modelDriven.dataService#buildManifestEntity
         * @access internal
         * @module siemens.simaticit.common.services.modelDriven
         * @param {object} manifest A valid MD manifest
         * @description
         * Build and array, entities based, with method for read and write backend data
         */
        function buildManifestEntity(manifest) {
            var applName = manifest.appl;
            if (!manifest.appl) {
                var splittedFB = manifest.functionalBlock.split('.');
                applName = splittedFB[splittedFB.length - 1];
            }
            manifest.states.forEach(function (screen) {
                var allEntities = {};
                var allReadingFunctions = {};

                for (var content in screen.contents) {
                    if (screen.contents.hasOwnProperty(content)) { //entity is mandatory for contents
                        if (screen.contents[content].entityRef && screen.contents[content].entityRef.entity) {
                            allEntities[screen.contents[content].entityRef.entity] = true;
                        }
                        if (screen.contents[content].blueprintSettings && screen.contents[content].blueprintSettings.filterFields) {
                            var filterFields = screen.contents[content].blueprintSettings.filterFields;
                            filterFields.forEach(function (filterField) {
                                if (filterField.dataSource.selectedEntity && filterField.dataSource.selectedEntity.id) {
                                    allEntities[filterField.dataSource.selectedEntity.id] = true;
                                }
                            });
                        }
                        if (screen.contents[content].multiplicity === 'one' && screen.contents[content].extensionRef) {
                            screen.contents[content].extensionRef.forEach(function (extension) {
                                if (extension.entityRef && extension.entityRef.entity) {
                                    allEntities[extension.entityRef.entity] = true;
                                }
                                if (extension.readingFunctionRef && extension.readingFunctionRef.functionName) {
                                    allReadingFunctions[extension.readingFunctionRef.functionName] = extension.readingFunctionRef;
                                }
                            });
                        }
                        if (screen.contents[content].readingFunctionRef && screen.contents[content].readingFunctionRef.functionName) {
                            allReadingFunctions[screen.contents[content].readingFunctionRef.functionName] = screen.contents[content].readingFunctionRef;
                        }
                        if (screen.contents[content].actions) {
                            screen.contents[content].actions.forEach(addActionArtifact);
                        }
                    }
                }
                Object.getOwnPropertyNames(allEntities).forEach(function (entityName) {
                    var entity = entityName, res = null, parkActions = [];
                    // build reading methods
                    if (!vm[entity]) {
                        // add getAll method only once
                        vm[entity] = {};
                        res = vm[entity];
                        res.entity = entity;
                        res.getAll = function (options, parApplName, template, transformedObj, facetInfo, extensions) {
                            if (template === 'singleEntityArchiving' || template === 'masterDetailsArchiving') {
                                if (options) {
                                    return backendService.findAllArchiving({ appName: parApplName ? parApplName : applName, entityName: this.entity, options: options });
                                }
                                return backendService.findAllArchiving({ appName: parApplName ? parApplName : applName, entityName: this.entity });
                            }

                            if (options) {
                                return backendService.findAll({ appName: parApplName ? parApplName : applName, entityName: this.entity, options: options, facetInfo: facetInfo, dataTransformInfo: transformedObj, extensions: extensions || [] });
                            }
                            return backendService.findAll({ appName: parApplName ? parApplName : applName, entityName: this.entity, facetInfo: facetInfo, dataTransformInfo: transformedObj, extensions: extensions || [] });
                        };
                    }
                    else {
                        res = vm[entity];
                    }
                    for (var contentName in screen.contents) {
                        var content = screen.contents[contentName];
                        if ('auditTrail' !== content.multiplicity && !content.readingFunctionRef && content.actions) { //filter actions on the current entity
                            if (content.entityRef && content.entityRef.entity) {
                                parkActions = parkActions.concat(content.actions.filter(filterEntityAction,
                                    { "contentEntity": content.entityRef.entity, "entity": entity }));
                            } else {
                                parkActions = parkActions.concat(content.actions);
                            }
                        }
                    }
                    // build command methods
                    parkActions.forEach(function (action) {
                        var actionId = screen.id + '_' + action.id;
                        if (!res[actionId]) {
                            res[actionId] = function (data, parApplName) {
                                return backendService.invoke({
                                    appName: parApplName ? parApplName : applName, commandName: action.behavior.commandRef.command,
                                    params: data
                                }).then(function (outcome) {
                                    var response = { id: null, completeResponse: null };
                                    if (action.extensionRef && action.extensionRef.length > 0) {
                                        response.completeResponse = outcome;
                                    }
                                    if (action.behavior.onExit) {
                                        var onExit = transformOnExit(action.behavior.onExit);
                                        var refreshAndSelectContents = onExit.refreshAndSelectContents || [];
                                        if (refreshAndSelectContents.length) {
                                            response.ids = {};
                                            var evaluatedKey;
                                            refreshAndSelectContents.forEach(function (item) {
                                                if (typeof item === 'object' && item.key) {
                                                    evaluatedKey = getOnExitValue(item.key, outcome);
                                                    response.ids[item.content] = evaluatedKey;
                                                }
                                            });
                                            if (isValidResponse(response.ids)) return response;
                                        }
                                    }
                                    if (outcome && outcome.data && outcome.data.Id) {
                                        response.id = outcome.data.Id;
                                        return response;
                                    }
                                    if (data && data.Id) { //during editing operation the Id can not be in the method outcome ... try to reuse the method parameter info
                                        response.id = data.Id;
                                        return response;
                                    }
                                    if (outcome && outcome.data) {
                                        var outFields = Object.getOwnPropertyNames(outcome.data);
                                        outFields = outFields.filter(function (of) {
                                            return of !== "Error" && of !== "Succeeded" && of.indexOf("@odata.") === -1;
                                        });
                                        if (outFields.length === 1 && typeof outFields[0] === "string") {
                                            response.id = outcome.data[outFields[0]];
                                            return response;
                                        }
                                    }
                                    return response;
                                }, function (error) {
                                    //NOTE: it overrides the base funcion call of UI Frameworks and the overlay is called twice
                                    // backendService.genericError(error.data.error.errorMessage, error.statusText);
                                    return false;
                                });
                            };
                            if (action.extensionRef && action.extensionRef.length > 0) {
                                action.extensionRef.forEach(function (extension) {
                                    if (!res[actionId][extension.id]) {
                                        res[actionId][extension.id] = function (data, parApplName) {
                                            var extendedCommandParams = { appName: parApplName ? parApplName : applName, commandName: extension.commandRef.command, params: data };
                                            return backendService.invoke(extendedCommandParams).then(function (outcome) {
                                                return true;
                                            }, function (error) {
                                                //NOTE: it overrides the base funcion call of UI Frameworks and the overlay is called twice
                                                // backendService.genericError(error.data.error.errorMessage, error.statusText);
                                                return false;
                                            });
                                        };
                                    }
                                });
                            }
                        }
                    });
                });
                //End allEntities loop

                Object.getOwnPropertyNames(allReadingFunctions).forEach(function (readingFunctionName) {
                    var res = null; var parkActions = [];
                    var readingFunctionModel = {};
                    readingFunctionModel.appName = applName;
                    readingFunctionModel.functionName = readingFunctionName;
                    readingFunctionModel.options = allReadingFunctions[readingFunctionName].options;
                    // build reading methods
                    if (!vm[readingFunctionName]) {
                        // add getAll method only once
                        vm[readingFunctionName] = {};
                        res = vm[readingFunctionName];
                        res.readingFunction = readingFunctionName;
                        res.getAll = function (options, parApplName) {
                            readingFunctionModel.appName = parApplName ? parApplName : applName;
                            readingFunctionModel.params = {};
                            if (typeof options === 'string') {
                                readingFunctionModel.params = JSON.parse(options);
                            } else if (options && typeof options === 'object') {
                                readingFunctionModel.params = typeof options.params === 'string' ? JSON.parse(options.params) : {};
                                readingFunctionModel.options = options.query || '';
                                readingFunctionModel.extensions = options.extensions || [];
                            }
                            return backendService.read(readingFunctionModel);
                        };
                    }
                    else {
                        res = vm[readingFunctionName];
                    }
                    for (var contentName in screen.contents) {
                        if ('auditTrail' !== screen.contents[contentName].multiplicity && screen.contents[contentName].actions) { //filter actions on the current entity
                            parkActions = parkActions.concat(screen.contents[contentName].actions);
                        }
                    }
                    // build command methods
                    parkActions.forEach(function (action) {
                        var actionId = screen.id + '_' + action.id;
                        if (!res[actionId]) {
                            res[actionId] = function (data, parApplName) {
                                return backendService.invoke({
                                    appName: parApplName ? parApplName : applName, commandName: action.behavior.commandRef.command,
                                    params: data
                                }).then(function (outcome) {
                                    var response = { id: null, completeResponse: null };
                                    if (action.extensionRef && action.extensionRef.length > 0) {
                                        response.completeResponse = outcome;
                                    }
                                    if (action.behavior.onExit) {
                                        var onExit = transformOnExit(action.behavior.onExit);
                                        var refreshAndSelectContents = onExit.refreshAndSelectContents || [];
                                        if (refreshAndSelectContents.length) {
                                            response.ids = {};
                                            var evaluatedKey;
                                            refreshAndSelectContents.forEach(function (item) {
                                                if (typeof item === 'object') {
                                                    evaluatedKey = getOnExitValue(item.key, outcome);
                                                    response.ids[item.content] = evaluatedKey;
                                                }
                                            });
                                            if (isValidResponse(response.ids)) return response;
                                        }
                                    }
                                    if (outcome && outcome.data && outcome.data.Id) {
                                        response.id = outcome.data.Id;
                                        return response;
                                    }
                                    if (data && data.Id) { //during editing operation the Id can not be in the method outcome ... try to reuse the method parameter info
                                        response.id = data.Id;
                                        return response;
                                    }
                                    if (outcome && outcome.data) {
                                        var outFields = Object.getOwnPropertyNames(outcome.data);
                                        outFields = outFields.filter(function (of) {
                                            return of !== "Error" && of !== "Succeeded" && of.indexOf("@odata.") === -1;
                                        });
                                        if (outFields.length === 1 && typeof outFields[0] === "string") {
                                            response.id = outcome.data[outFields[0]];
                                            return response;
                                        }
                                    }
                                    return response;
                                }, function (error) {
                                    //NOTE: it overrides the base funcion call of UI Frameworks and the overlay is called twice
                                    //backendService.genericError(error.data.error.errorMessage, error.statusText);
                                    return false;
                                });
                            };
                            if (action.extensionRef && action.extensionRef.length > 0) {
                                action.extensionRef.forEach(function (extension) {
                                    if (!res[actionId][extension.id]) {
                                        res[actionId][extension.id] = function (data, parApplName) {
                                            var extendedCommandParams = { appName: parApplName ? parApplName : applName, commandName: extension.commandRef.command, params: data };
                                            return backendService.invoke(extendedCommandParams).then(function (outcome) {
                                                return true;
                                            }, function (error) {
                                                //NOTE: it overrides the base funcion call of UI Frameworks and the overlay is called twice
                                                // backendService.genericError(error.data.error.errorMessage, error.statusText);
                                                return false;
                                            });
                                        };
                                    }
                                });
                            }
                        }
                    });
                });

                //clear entities
                allEntities = {};
                allReadingFunctions = {};

                //collect all artifacts from extensions
                function addExtendedFieldsArtifacts(prop) {
                    if (!prop) {
                        return;
                    }
                    if (typeof prop.type === 'object' || prop.inputMode === 'queryResult' || prop.inputMode === 'inputText') { //field with select/query
                        if (prop.entityRef && prop.entityRef.entity) {
                            allEntities[prop.entityRef.entity] = true;
                            if (prop.selectEntityRef && prop.selectEntityRef.entity) {
                                allEntities[prop.selectEntityRef.entity] = true;
                            }
                        } else if (prop.readingFunctionRef && prop.readingFunctionRef.functionName) {
                            allReadingFunctions[prop.readingFunctionRef.functionName] = prop.readingFunctionRef;
                        }
                    }
                }

                function addActionArtifact(action) {
                    if (action.extensionRef && action.extensionRef.length > 0) {
                        action.extensionRef.forEach(function (extension) {
                            addActionExtensionArtifacts(extension);
                            if (extension && extension.fields) {
                                extension.fields.forEach(addExtendedFieldsArtifacts);
                            }
                        });
                    }
                    if (action.behavior.entityRef && action.behavior.entityRef.entity) {
                        addEntityAction(action);
                        return;
                    }
                    if (action.behavior.readingFunctionRef && action.behavior.readingFunctionRef.functionName) {
                        addReadingFunctionAction(action);
                        return;
                    }
                }

                function addActionExtensionArtifacts(extension) {
                    if (extension.entityRef && extension.entityRef.entity) {
                        allEntities[extension.entityRef.entity] = true;
                    } else if (extension.readingFunctionRef && extension.readingFunctionRef.functionName) {
                        allReadingFunctions[extension.readingFunctionRef.functionName] = extension.readingFunctionRef;
                    }
                }

                //collect all entities in an action
                function addEntityAction(action) {
                    allEntities[action.behavior.entityRef.entity] = true;

                    //check for object field that will be rendered in select/entity picker
                    if (action.behavior.fields) {
                        Object.getOwnPropertyNames(action.behavior.fields).forEach(function (propName) {
                            var prop = action.behavior.fields[propName];
                            if (prop && (typeof prop.type === 'object' || prop.inputMode === 'queryResult' || prop.inputMode === 'inputText')) { //field with select/query
                                if (prop.entityRef && prop.entityRef.entity) {
                                    allEntities[prop.entityRef.entity] = true;
                                    if (prop.selectEntityRef && prop.selectEntityRef.entity) {
                                        allEntities[prop.selectEntityRef.entity] = true;
                                    }
                                } else if (prop.readingFunctionRef && prop.readingFunctionRef.functionName) {
                                    allReadingFunctions[prop.readingFunctionRef.functionName] = prop.readingFunctionRef;
                                }
                            }
                        });
                    }
                }

                //collect reading function in an action
                function addReadingFunctionAction(action) {
                    allReadingFunctions[action.behavior.readingFunctionRef.functionName] = action.behavior.readingFunctionRef;

                    //check for object field that will be rendered in select/entity picker
                    if (action.behavior.fields) {
                        Object.getOwnPropertyNames(action.behavior.fields).forEach(function (propName) {
                            var prop = action.behavior.fields[propName];
                            if (prop && (typeof prop.type === 'object' || prop.inputMode === 'queryResult' || prop.inputMode === 'inputText')) { //field with select/query
                                if (prop.entityRef && prop.entityRef.entity) {
                                    allEntities[prop.entityRef.entity] = true;
                                    if (prop.selectEntityRef && prop.selectEntityRef.entity) {
                                        allEntities[prop.selectEntityRef.entity] = true;
                                    }
                                } else if (prop.readingFunctionRef && prop.readingFunctionRef.functionName) {
                                    allReadingFunctions[prop.readingFunctionRef.functionName] = prop.readingFunctionRef;
                                }
                            }
                        });
                    }
                }
            });
            // End states loop
        }

        //run with a context object
        function filterEntityAction(act, index, array) {
            var self = this;
            return act.behavior.entityRef ? act.behavior.entityRef.entity === self.entity : self.contentEntity === self.entity;
        }
    }
}());

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.modelDriven').provider('common.services.modelDriven.service', ServiceProvider);

    ServiceProvider.$inject = ['$stateProvider'];
    function ServiceProvider($stateProvider) {
        var vm = this;
        activate();

        function activate() {
            vm.$get = getService;
        }

        getService.$inject = ['$http', '$q', '$translate', 'common.services.logger.service', 'common.services.modelDriven.dataService',
            'common.services.modelDriven.migrationService', 'common.ctx', '$state', 'common.services.modelDriven.contextService'];
        function getService($http, $q, $translate, logger, dataService, migrationService, commonContext, $state, mdContextSrv) {
            return new Service($stateProvider, $http, $q, $translate, logger, dataService, migrationService, commonContext, $state, mdContextSrv);
        }
    }

    /**
      * @ngdoc service
      * @name common.services.modelDriven.service
      * @module siemens.simaticit.common.services.modelDriven
      * @access internal
      * @description
      * Provides API in order to load a md manifest (initMD), to get current model info (getManifest).
      * It internally, while loading a manifest, add application states and, using common.services.modelDriven.dataService,
      * prepare all data access object (r/w api).
      */
    function Service($stateProvider, $http, $q, $translate, logger, dataService, migrationService, commonContext, $state, mdContextSrv) {
        var vm = this;
        // constant for console logging
        var SERVICE_NAME = 'modelDriven Service';
        // constant for the default module template prefix
        var TEMPLATE_MODULE = 'common.layout.modelDriven.template';
        var allStates, allManifests, allModulesDefer, pendingModulesCount, allScreens = [];
        var appType;
        vm.allAvailableScreens = [];

        activate();

        function activate() {
            allStates = {
                states: []
            };
            allManifests = {};
            allModulesDefer = null;
            appType = commonContext.getAppType();
            exposeApi();
            initScreens();
        }

        function exposeApi() {
            vm.initMD = initMD;
            vm.initStates = initStates;
            vm.getCurrentModuleInfo = getCurrentModuleInfo;
            vm.loadModule = loadModule;
            vm.inCanvasRefreshLogic = inCanvasRefreshLogic;
        }

        /**
        * @ngdoc method
        * @name common.services.modelDriven.service#initMD
        * @access internal
        * @module siemens.simaticit.common.services.modelDriven
        * @param {string} manifestPath path of the json manifest to load
        * @description Load md manifest.
        */
        function initMD(manifestPath) {
        }

        function getPrevSelectedInfo(screen, masterName) {
            var ctxInfo = mdContextSrv.getContextInfo(),
                selectedId = '';
            ctxInfo.contents = JSON.parse(sessionStorage.storeContext).contents;
            var drillDownSelectionKey = screen.contents[masterName].blueprintSettings.drillDownSelectionKey || 'Id';
            if (ctxInfo.contents[masterName].selectedItem) {
                selectedId = ctxInfo.contents[masterName].selectedItem[drillDownSelectionKey]
            }
            return {
                id: selectedId,
                ctx: ctxInfo
            }
        }

        function updateSelection(mdViewCtrl, masterName, mdView, screen, contentName) {
            contentName = contentName || masterName;
            if (mdViewCtrl[contentName]) {
                var prevInfo = getPrevSelectedInfo(screen, masterName);
                var prevSelectedId = prevInfo.id;
                if (prevSelectedId) {
                    mdView.params[masterName] = prevSelectedId;
                }
                mdContextSrv.setContexInfo(prevInfo.ctx, mdView, mdViewCtrl);
                mdViewCtrl[contentName].refresh();
            }
        }

        function inCanvasRefreshLogic(mdViewCtrl, masterName, mdView, screen) {
            if (mdContextSrv.outcome) {
                if (!mdContextSrv.outcome.ids[masterName]) {
                    updateSelection(mdViewCtrl, masterName, mdView, screen);
                }
                var refreshId = getPrevSelectedInfo(screen, masterName).id;
                if (mdContextSrv.outcome.ids) {
                    for (var content in mdContextSrv.outcome.ids) {
                        if (mdContextSrv.outcome.ids[content]) {
                            mdViewCtrl[content].refreshAndSelect(mdContextSrv.outcome.ids[content]);
                        } else if (mdContextSrv.outcome.id) {
                            mdViewCtrl[content].refreshAndSelect(mdContextSrv.outcome.id);
                        } else if (refreshId) {
                            mdViewCtrl[content].refreshAndSelect(refreshId);
                        } else {
                            mdViewCtrl[content].refresh();
                        }
                    }
                }
                mdContextSrv.outcome = null;
            } else {
                updateSelection(mdViewCtrl, masterName, mdView, screen);
                if (mdContextSrv.selectedTabContentForInCanvas && mdContextSrv.selectedTabContentForInCanvas !== masterName) {
                    updateSelection(mdViewCtrl, masterName, mdView, screen, mdContextSrv.selectedTabContentForInCanvas);
                }
            }
        }
        function getScreens() {
            var allScreensDefer = $q.defer();
            if(appType !== 'runtime' && appType !== 'debug'){
                allScreensDefer.resolve();
                return allScreensDefer.promise;
            }
            $http.get('screens.json').then(function (response) {
                if (response) {
                    allScreensDefer.resolve(response.data);
                } else {
                    allScreensDefer.resolve();
                }
            }, function (reason) {
                allScreensDefer.reject(reason);
            });
            return allScreensDefer.promise;
        }

        function initScreens() {
            getScreens().then(function (result) {
                vm.allAvailableScreens = [];
                if (result && result.screens && result.screens.length) {
                    vm.allAvailableScreens = result.screens.map(function (item) {
                        return item.id;
                    });
                }
            }, function () {
                vm.allAvailableScreens = [];
            });
        }

        function initStates() {
            var path = 'allStates.json'
            allModulesDefer = $q.defer();
            var allStatesPath = path;
            if (allScreens && allScreens.length > 0) {
                allModulesDefer.resolve(allScreens);
                return allModulesDefer.promise;
            }
            if (appType !== 'studio') {
                createStates(allStatesPath).then(nextStep, nextStep);
            } else {
                nextStep();
            }
            return allModulesDefer.promise;
        }

        function createStates(path) {
            var defer = $q.defer();
            $http.get(path).then(function (response) {
                var allStatesData = response.data;
                logger.logInfo('allStatesData processed:', allStatesData, SERVICE_NAME);

                addStates(allStatesData);
                defer.resolve(allStatesData);
            }, function (reason) {
                logger.logError('Error processing module manifest: ', reason, SERVICE_NAME);
                defer.reject(reason);
            });
            return defer.promise;
        }

        function addStates(states) {
            states.forEach(function (state) {
                // is the manifest outdated? if yes, show an outdated message to upgrade and return
                if (state.isOutdated) {
                    addOutdatedScreenState(state);
                    return;
                }
                allScreens.push({ 'id': state.id, 'module': state.module});
                // First step: add screen state
                if (state.type === undefined && (state.autoGenerate !== undefined ? state.autoGenerate : true)) {
                    addScreenState(state);
                }
                if (state.actions) {
                    state.actions.forEach(function (action) {
                        addActionState(action, state.id);
                    })

                }
            });
        }

        function getFolderPath(moduleName) {
            // folder name (assuming folder name to match the module name) + modules + module name + .json
            var folderName = moduleName.substring(0, moduleName.lastIndexOf('.'));
            return folderName + '/modules/' + moduleName + '.json';
        }

        function nextStep() {
            pendingModulesCount = pendingModulesCount - 1;
            if (0 < pendingModulesCount) {
                return;
            }
            allModulesDefer.resolve(allStates);
        }

        function getCurrentModuleInfo(screenId) {
            var moduleInfo = {};
            for (var i = 0; i < allScreens.length; i++) {
                if (allScreens[i].id === screenId) {
                    var folderName = getFolderPath(allScreens[i].module);
                    moduleInfo = allManifests[folderName];
                }
            }
            return moduleInfo;
        }

        /**
        * @ngdoc method
        * @name common.services.modelDriven.service#getManifest
        * @access internal
        * @module siemens.simaticit.common.services.modelDriven
        * @param {string} path (optional) When path is specified the manifest is loaded, merged with others and elaborated.
        * When path is omitted the current application model is returned.
        * @returns {Promise} A promise object containing requested manifest.
        * @description Load or simply return a md manifest.
        */
        function loadModule(stateId) {
            var defer = $q.defer();
            var moduleName = getModuleNameByStateId(stateId);
            if (!moduleName && $state.get(stateId) && $state.get(stateId).views && $state.get(stateId).views['panel-in-canvas@']) {
                var parentState = $state.current.parent;
                moduleName = getModuleNameByStateId(parentState);
            }
            loadManifest(getFolderPath(moduleName)).then(function (manifest) {
                defer.resolve(manifest);
            });

            return defer.promise;


        }
        function getModuleNameByStateId(stateId) {
            var moduleName;
            for (var i = 0; i < allScreens.length; i++) {
                if (allScreens[i].id === stateId) {
                    moduleName = allScreens[i].module;
                }
            }
            return moduleName;
        }

        function getManifestVersionNumber(versionString) {
            var versions, manifestVersion = 0;
            if (versionString) {
                versions = versionString.split('.');
                if (versions && versions.length === 3) {
                    manifestVersion = versions[0] + '.' + versions[1] + versions[2];
                    manifestVersion = Number(manifestVersion);
                }
            }
            return manifestVersion;
        }

        /**
        * @ngdoc method
        * @name common.services.modelDriven.service#loadManifest
        * @access internal
        * @module siemens.simaticit.common.services.modelDriven
        * @param {string} path the manifest url to be loaded
        * @description
        * Performs the manifest request and start status and entities elaboration
        */
        function loadManifest(path) {
            var defer = $q.defer();
            if (allManifests && allManifests[path]) {
                defer.resolve(allManifests[path]);
                return defer.promise;
            }
            $http.get(path).then(function (response) {
                var manifest = response.data;
                logger.logInfo('Module manifest processed:', manifest, SERVICE_NAME);

                // Is the module model-driven? if not don't process
                if (!manifest.hasOwnProperty('type') || manifest.type != "model-driven") {
                    defer.reject('Invalid model-driven module.');
                    return;
                }

                // Is the module an extension to a module
                if (manifest.hasOwnProperty('baseAppName')) {
                    defer.reject('Extension model-driven module.');
                    return;
                }

                var isOutdated = false;
                var manifestVersion = getManifestVersionNumber(manifest.manifestVersion);
                if (manifestVersion < 2) {
                    isOutdated = true;
                }

                //migrate 02.00.00 manifests
                if (!isOutdated && manifestVersion < 2.01) {
                    var migrationResponse = migrationService.getMigratedManifest(manifest);
                    manifest = migrationResponse.manifest;
                }
                //add all entities query and actions command implementation
                if (!isOutdated) {
                    dataService.buildManifestEntity(manifest);
                }

                // Store the module manifest in the collection
                allManifests[path] = manifest;
                if (undefined === allStates.customServices) {
                    allStates.customServices = [];
                }
                // Merge the module states with the collection
                allStates.states = allStates.states.concat(manifest.states);
                if (undefined !== manifest.customServices) {
                    allStates.customServices = allStates.customServices.concat(manifest.customServices);
                }
                defer.resolve(manifest);
            }, function (reason) {
                logger.logError('Error processing module manifest: ', reason, SERVICE_NAME);
                defer.reject(reason);
            });
            return defer.promise;
        }
        function addOutdatedScreenState(stateDetails) {
            var errorMessage = 'The screen cannot be displayed because it was developed with a previous version.Please consider updating the required Apps.';
            try {
                $stateProvider.state({
                    name: stateDetails.id,
                    url: '/' + stateDetails.urlPrefix + '-list',
                    views: {
                        'Canvas@': {
                            template: '<div class="content-area content-area-relative" style="height: calc(100% - 50px) !important" id="itemlist">'
                                + '<h2>Error</h2>'
                                + '<h3>' + errorMessage + '</h3>'
                                + '</div>'
                        }
                    },
                    data: {
                        title: $translate.instant(stateDetails.header) || stateDetails.title
                    }
                });
            } catch (error) {
                logger.logError('Error adding state',error)
            }
            
        }

        function getBlueprint(stateInfo) {
            var templateUrl = '', controller = '', isCustomBlueprint = false;
            //check first for custom template
            if (stateInfo.blueprint) {
                //custom and backward compatibility
                controller = stateInfo.blueprint.controller;
                templateUrl = stateInfo.blueprint.url;
                isCustomBlueprint = true;
            } else if (stateInfo.layoutTemplate === 'masterDetails' || stateInfo.layoutTemplate === 'masterDetailsArchiving') {
                controller = TEMPLATE_MODULE + '.MDCtrl';
                templateUrl = 'common/blueprints/masterDetailsTemplate/masterDetailsLayoutTemplate.html';
            } else {
                controller = TEMPLATE_MODULE + '.SECtrl';
                templateUrl = 'common/blueprints/singleEntityTemplate/singleEntityLayoutTemplate.html';
            }

            return { ctrl: controller, tpl: templateUrl, isCustomBlueprint: isCustomBlueprint };
        }

        function addScreenState(stateDetails) {

            var bluePrintInfo = getBlueprint(stateDetails);

            var params = { isDrillDownState: false };
            // Check state params
            if (stateDetails.params) {
                //smart navigation ... collect possible status parameter
                stateDetails.params.forEach(function (name) {
                    params[name] = null;
                });
            }

            var stateParams = {};

            if (bluePrintInfo.isCustomBlueprint) {
                Object.keys(params).forEach(function (key) {
                    stateParams[key] = params[key];
                });
            }

            var helpString = '';
            if (stateDetails.help) {
                helpString = stateDetails.help;
            }

            try {
                $stateProvider.state({
                    name: stateDetails.id,
                    url: '/' + stateDetails.id + '?mduiCtx',
                    params: stateParams,
                    views: {
                        'Canvas@': {
                            templateUrl: bluePrintInfo.tpl,
                            controller: bluePrintInfo.ctrl,
                            controllerAs: 'vm'
                        }
                    },
                    data: {
                        title: $translate.instant(stateDetails.header) || stateDetails.title,
                        help: helpString
                    }
                });
            }catch (error) {
                logger.logError('Error adding state', error);
            }
        }

        function addActionState(actionDetails, screenId) {
            var templateUrl = '', controller = '';

            if (actionDetails.type) {
                if ('command' === actionDetails.type) {
                    if (actionDetails.blueprint && actionDetails.blueprint.url && actionDetails.blueprint.controller) {
                        templateUrl = actionDetails.blueprint.url;
                        controller = actionDetails.blueprint.controller;
                    } else {
                        templateUrl = 'common/blueprints/executeCommandTemplate/execute-commandTemplate.html';
                        controller = 'common.layout.modelDriven.template.ExecuteCommandCtrl';
                    }
                } else if ('view' === actionDetails.type) {
                    if (actionDetails.blueprint && actionDetails.blueprint.url && actionDetails.blueprint.controller) {
                        templateUrl = actionDetails.blueprint.url;
                        controller = actionDetails.blueprint.controller;
                    } else {
                        templateUrl = 'common/blueprints/overviewTemplate/overviewTemplate.html';
                        controller = 'common.layout.modelDriven.template.Overview';
                    }
                }
            } else {
                //default if not specified
                if (actionDetails.commandRef) {
                    templateUrl = 'common/blueprints/executeCommandTemplate/execute-commandTemplate.html';
                    controller = 'common.layout.modelDriven.template.ExecuteCommandCtrl';
                }
            }

            var stateParams = {};
            //collect navigation params
            if (actionDetails.params) {
                Object.getOwnPropertyNames(actionDetails.params).forEach(function (name) {
                    stateParams[name] = null;
                });
            }

            try {
                if (actionDetails.displayMode === 'inCanvas') {
                    $stateProvider.state({
                        name: screenId + '_' + actionDetails.id,
                        url: '/' + actionDetails.id,
                        params: stateParams,
                        views: {
                            'panel-in-canvas@': {
                                templateUrl: templateUrl,
                                controller: controller,
                                controllerAs: 'vm'
                            }
                        },
                        parent: screenId,
                        data: {
                            title: $translate.instant(actionDetails.title)
                        }
                    });
                } else {
                    $stateProvider.state({
                        name: screenId + '.' + actionDetails.id,
                        url: '/' + actionDetails.id,
                        params: stateParams,
                        views: {
                            'property-area-container@': {
                                templateUrl: templateUrl,
                                controller: controller,
                                controllerAs: 'vm'
                            }
                        },
                        data: {
                            title: $translate.instant(actionDetails.title)
                        }
                    });
                }

            } catch (error) {
                logger.logError('Error adding state', error)
            }
            
        }
    }
}());

"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        var MigrationService = /** @class */ (function () {
            function MigrationService() {
            }
            MigrationService.prototype.getMigratedManifest = function (manifest) {
                try {
                    var migratedManifest = this.migrateModule(manifest);
                    return { 'succeeded': true, 'manifest': migratedManifest };
                }
                catch (e) {
                    return { 'succeeded': false, 'manifest': manifest };
                }
            };
            MigrationService.prototype.migrateModule = function (manifest) {
                if (!manifest.hasOwnProperty('customServices')) {
                    manifest.customServices = [];
                }
                for (var i = 0; i < manifest.states.length; i++) {
                    try {
                        var migratedScreen = this.migrateScreen(manifest.states[i]);
                        manifest.states[i] = migratedScreen;
                    }
                    catch (e) {
                        continue;
                    }
                }
                manifest.manifestVersion = '02.01.00';
                return manifest;
            };
            MigrationService.prototype.migrateScreen = function (screenObj) {
                //if (!screenObj.contents.id) {
                //}
                this.appName = screenObj.appName;
                var layoutTemplate = !screenObj.layoutTemplate && !screenObj.hasOwnProperty('blueprint') ? 'singleEntity' : screenObj.layoutTemplate;
                if (!screenObj.layoutTemplate && !screenObj.hasOwnProperty('blueprint')) {
                    screenObj.layoutTemplate = 'singleEntity';
                }
                if (!screenObj.header) {
                    screenObj.header = screenObj.title;
                }
                if (!screenObj.hasOwnProperty('contents')) {
                    screenObj.contents = {};
                }
                if (!screenObj.hasOwnProperty('params')) {
                    screenObj.params = [];
                }
                if (!screenObj.hasOwnProperty('autoGenerate')) {
                    screenObj.autoGenerate = true;
                }
                if (screenObj.hasOwnProperty('appAcronym')) {
                    delete screenObj.appAcronym;
                }
                for (var content in screenObj.contents) {
                    if (content) {
                        try {
                            var migratedContent = this.migrateContent(screenObj.contents[content], layoutTemplate);
                            screenObj.contents[content] = migratedContent;
                        }
                        catch (e) {
                            continue;
                        }
                    }
                }
                return screenObj;
            };
            MigrationService.prototype.migrateContent = function (contentObj, screenTemplate) {
                if (!contentObj.hasOwnProperty('master')) {
                    contentObj.master = false;
                }
                if (!contentObj.hasOwnProperty('actions')) {
                    contentObj.actions = [];
                }
                if (contentObj.multiplicity !== 'auditTrail') {
                    contentObj.properties = this.migrateContentProperties(contentObj.properties);
                }
                contentObj.blueprintSettings = this.migrateContentBlueprintSettings(contentObj, screenTemplate);
                if (contentObj.entityRef) {
                    contentObj.entityRef.app = contentObj.entityRef.app || this.appName;
                }
                else if (contentObj.readingFunctionRef) {
                    contentObj.readingFunctionRef.app = contentObj.readingFunctionRef.app || this.appName;
                }
                for (var i = 0; i < contentObj.actions.length; i++) {
                    try {
                        contentObj.actions[i] = this.migrateAction(contentObj.actions[i]);
                    }
                    catch (e) {
                        continue;
                    }
                }
                return contentObj;
            };
            MigrationService.prototype.migrateContentProperties = function (properties) {
                var serviceScope = this;
                properties.forEach(function (property, index) {
                    if (property.propertyRef) {
                        property.propertyRef.app = property.propertyRef.app || serviceScope.appName;
                    }
                    if (!property.hasOwnProperty('sortable')) {
                        property.sortable = false;
                    }
                    if (!property.hasOwnProperty('searchable')) {
                        property.searchable = false;
                    }
                    if (!property.hasOwnProperty('groupable')) {
                        property.groupable = false;
                    }
                    if (property.hasOwnProperty('title')) {
                        delete property.title;
                    }
                    if (property.hasOwnProperty('values')) {
                        delete property.values;
                    }
                    if (property.hasOwnProperty('isDescription')) {
                        delete property.isDescription;
                    }
                    if (property.hasOwnProperty('isTitle')) {
                        delete property.isTitle;
                    }
                    if (property.hasOwnProperty('id')) {
                        delete property.id;
                    }
                    if (property.hasOwnProperty('isSelected')) {
                        delete property.isSelected;
                    }
                });
                return properties;
            };
            MigrationService.prototype.migrateContentBlueprintSettings = function (contentObj, screenTemplate) {
                if (contentObj.multiplicity === 'one') {
                    var blueprintSettings = {
                        'gridConfig': { 'columnDefs': [] },
                        'layoutSettings': {
                            'layout': 'Vertical',
                            'columns': '1',
                            'type': 'Fixed'
                        }
                    };
                    if (contentObj.blueprintSettings && contentObj.blueprintSettings.gridConfig) {
                        blueprintSettings.gridConfig = contentObj.blueprintSettings.gridConfig;
                    }
                    if (contentObj.blueprintSettings && contentObj.blueprintSettings.layoutSettings) {
                        blueprintSettings.layoutSettings = contentObj.blueprintSettings.layoutSettings;
                    }
                    contentObj.blueprintSettings = blueprintSettings;
                }
                if (contentObj.blueprintSettings && contentObj.multiplicity === 'many') {
                    if (!contentObj.blueprintSettings.viewMode && !contentObj.blueprintSettings.viewOptions) {
                        if (contentObj.master && screenTemplate === 'masterDetails') {
                            contentObj.blueprintSettings.viewMode = 'c';
                            contentObj.blueprintSettings.viewOptions = 'c';
                        }
                        else {
                            contentObj.blueprintSettings.viewMode = 'm';
                            contentObj.blueprintSettings.viewOptions = 'm';
                        }
                    }
                    if (!contentObj.blueprintSettings.tileConfig) {
                        contentObj.blueprintSettings.tileConfig = { 'icon': '', 'titleField': '', 'descriptionField': '', 'isCell': false, 'propertyFields': [], 'indicators': [], 'commands': [] };
                    }
                    else {
                        contentObj.blueprintSettings.tileConfig.icon = contentObj.blueprintSettings.tileConfig.icon || '';
                        contentObj.blueprintSettings.tileConfig.titleField = contentObj.blueprintSettings.tileConfig.titleField || '';
                        contentObj.blueprintSettings.tileConfig.descriptionField = contentObj.blueprintSettings.tileConfig.descriptionField || '';
                        if (contentObj.blueprintSettings.tileConfig.isCell === undefined) {
                            contentObj.blueprintSettings.tileConfig.isCell = false;
                        }
                        contentObj.blueprintSettings.tileConfig.propertyFields = contentObj.blueprintSettings.tileConfig.propertyFields || [];
                        contentObj.blueprintSettings.tileConfig.indicators = contentObj.blueprintSettings.tileConfig.indicators || [];
                        contentObj.blueprintSettings.tileConfig.commands = contentObj.blueprintSettings.tileConfig.commands || [];
                    }
                    if (!contentObj.blueprintSettings.gridConfig) {
                        contentObj.blueprintSettings.gridConfig = { 'columnDefs': [] };
                    }
                    if (!contentObj.blueprintSettings.pagingOptions && !contentObj.blueprintSettings.serverSidePagination) {
                        contentObj.blueprintSettings.pagingOptions = {
                            'pageSizes': [
                                5,
                                10,
                                25,
                                100,
                                250,
                                500
                            ],
                            'pageSize': 10,
                            'currentPage': 1
                        };
                    }
                    contentObj.blueprintSettings.tagField = contentObj.blueprintSettings.tagField || '';
                    contentObj.blueprintSettings.filterBarOptions = contentObj.blueprintSettings.filterBarOptions || 'sqgf';
                    contentObj.blueprintSettings.filterFields = contentObj.blueprintSettings.filterFields || [];
                    if (!contentObj.blueprintSettings.filterOptions) {
                        contentObj.blueprintSettings.filterOptions = {
                            'showDefaultClause': false,
                            'showMatchCase': false,
                            'allowedOperators': '',
                            'groupEnabled': false
                        };
                    }
                    if (contentObj.blueprintSettings.filterEnabled === undefined) {
                        contentObj.blueprintSettings.filterEnabled = false;
                    }
                    if (contentObj.blueprintSettings.tagsManager === undefined) {
                        contentObj.blueprintSettings.tagsManager = true;
                    }
                }
                if (contentObj.multiplicity !== 'auditTrail' && !contentObj.blueprintSettings.gridConfig.columnDefs.length) {
                    contentObj.blueprintSettings.gridConfig.columnDefs = this.getMigratedGridConfig(contentObj);
                }
                return contentObj.blueprintSettings;
            };
            MigrationService.prototype.getMigratedGridConfig = function (contentObj) {
                var properties = contentObj.properties;
                var columnDefs = [];
                properties.forEach(function (property, index) {
                    columnDefs.push({ 'field': property.name, 'displayName': property.label, visible: true, 'type': property.type });
                });
                return columnDefs;
            };
            MigrationService.prototype.migrateAction = function (actionObj) {
                var serviceScope = this;
                if (!actionObj.hasOwnProperty('params') || typeof actionObj.params === 'string') {
                    actionObj.params = {};
                }
                if (actionObj.hasOwnProperty('authorizationCmd')) {
                    delete actionObj.authorizationCmd;
                }
                if (!actionObj.hasOwnProperty('main')) {
                    actionObj.main = false;
                }
                if (actionObj.behavior.commandRef && actionObj.behavior.commandRef.command) {
                    actionObj.behavior.commandRef.app = actionObj.behavior.commandRef.app || this.appName;
                    if (!actionObj.behavior.hasOwnProperty('onExit')) {
                        actionObj.behavior.onExit = {};
                    }
                    actionObj.behavior.onExit.key = actionObj.behavior.onExit.key || 'Id';
                    actionObj.behavior.onExit.refreshAndSelectContents = actionObj.behavior.onExit.refreshAndSelectContents || [];
                    if (actionObj.behavior.type === 'command') {
                        actionObj.behavior.shortTitle = actionObj.behavior.shortTitle || actionObj.behavior.commandRef.command;
                    }
                    actionObj.behavior.fields.forEach(function (field) {
                        if (field.parameterRef) {
                            field.parameterRef.app = field.parameterRef.app || serviceScope.appName;
                        }
                        if (!field.hasOwnProperty('useEntityPicker')) {
                            field.useEntityPicker = false;
                        }
                        if (!field.hasOwnProperty('readOnly')) {
                            field.readOnly = false;
                        }
                        if (!field.hasOwnProperty('values')) {
                            field.values = [];
                        }
                        if (!field.hasOwnProperty('validation') && !field.hidden) {
                            field.validation = {};
                        }
                        if (field.hasOwnProperty('entityRef')) {
                            field.entityRef.app = field.entityRef.app || serviceScope.appName;
                        }
                        if (field.hasOwnProperty('description')) {
                            delete field.description;
                        }
                        if (field.hasOwnProperty('isList')) {
                            delete field.isList;
                        }
                        if (typeof (field.type) === 'object') {
                            field.type = {};
                        }
                        if (!field.inputMode) {
                            var fieldType;
                            if ((field.hasOwnProperty('entityRef') && field.entityRef.entity) || typeof (field.type) === 'object') {
                                fieldType = 'object';
                            }
                            else if (field.values && field.values.length > 0) {
                                fieldType = 'enum';
                            }
                            else if (typeof (field.type) === 'string') {
                                fieldType = field.type.toLowerCase();
                            }
                            field.inputMode = serviceScope.getDefaultInputMode(fieldType);
                        }
                    });
                }
                if (actionObj.behavior.type === 'command' && !actionObj.behavior.hasOwnProperty('disableWhen')) {
                    actionObj.behavior.disableWhen = { 'expression': '' };
                }
                if ((actionObj.behavior.type === 'command' || actionObj.behavior.type === 'view') && !actionObj.behavior.blueprint) {
                    actionObj.behavior.sidePanelMode = actionObj.behavior.sidePanelMode || 'large';
                }
                if (actionObj.behavior.entityRef) {
                    actionObj.behavior.entityRef.app = actionObj.behavior.entityRef.app || this.appName;
                }
                else if (actionObj.behavior.readingFunctionRef) {
                    actionObj.behavior.readingFunctionRef.app = actionObj.behavior.readingFunctionRef.app || this.appName;
                }
                return actionObj;
            };
            MigrationService.prototype.getDefaultInputMode = function (type) {
                switch (type) {
                    case 'int16':
                    case 'int32':
                    case 'int':
                    case 'int64':
                    case 'decimal':
                    case 'byte':
                    case 'number': {
                        return 'numeric';
                    }
                    case 'boolean': {
                        return 'checkbox';
                    }
                    case 'datetimeoffset':
                    case 'datetime': {
                        return 'dateTimePicker';
                    }
                    case 'timespan': {
                        return 'timePicker';
                    }
                    case 'string':
                    case 'guid': {
                        return 'inputText';
                    }
                    case 'object': {
                        return 'queryResult';
                    }
                    case 'enum': {
                        return 'enum';
                    }
                    case 'blob': {
                        return 'fileUploader';
                    }
                    default: {
                        return 'inputText';
                    }
                }
            };
            return MigrationService;
        }());
        framework.MigrationService = MigrationService;
        angular.module('siemens.simaticit.common.services.modelDriven')
            .service('common.services.modelDriven.migrationService', MigrationService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=migrationService.js.map
/* This module should be added to the framework */
(function () {
    'use strict';
    /**
  * @ngdoc service
  * @name common.services.modelDriven.runtimeService
  * @module siemens.simaticit.common.services.modelDriven
  * @access public
  * @description
  * The service provide access to the ModelViewCtrl class/constructor used by status layout template (NOTE:not for actions)
  * ModelViewCtrl provides:
  *     - configuration for standard template contents (e.g.contents[<content name>].runtimeConf)
  *     - data for standard template contents (e.g.contents[<content name>].runtimeData)
  *     - Automation object for contents and commandBar
  *
  */
    angular.module('siemens.simaticit.common.services.modelDriven')
        .service('common.services.modelDriven.runtimeService', [
            '$q',
            'common.services.modelDriven.service',
            'common.services.modelDriven.contextService',
            'common.services.modelDriven.dataService',
            'filterFilter',
            '$parse',
            '$state',
            '$stateParams',
            '$timeout',
            '$translate',
            'common.base',
            '$rootScope',
            'common.widgets.busyIndicator.service',
            '$filter',
            'common.widgets.messageOverlay.service',
            'common.mduiBreadcrumb.breadcrumbService',
            'common.services.security.ui.authorization',
            'common.services.navigation.navigationManagementService',
            'common.services.modelDriven.warningService',
            function ($q, md, mdContextSrv, multiDataService, filterFilter, $parse, $state, $stateParams, $timeout, $translate, base, $rootScope,
                busyService, $filter, overlayService, breadcrumbService, UIAuthorization, navigationManagementService, warningService) {
                var backendService = base.services.runtime.backendService;

                function getEvaluatedReadingFunctionParams(params) {
                    var evaluatedParams = {};
                    if (Object.keys(params).length > 0) {
                        for (var param in params) {
                            if (params[param]) {
                                evaluatedParams[param] = mdContextSrv.parseWithStateCtx(params[param]);
                                if (!evaluatedParams[param]) {
                                    evaluatedParams[param] = null;
                                }
                            } else {
                                evaluatedParams[param] = params[param];
                            }
                        }
                    }
                    return JSON.stringify(evaluatedParams);
                }

                /**
                * @ngdoc method
                * @name common.services.modelDriven.runtimeService#ModelViewCtrl
                * @access public
                * @module siemens.simaticit.common.services.modelDriven
                * @param {object} screen A MD manifest status descriptor
                * @param {object} confDataRepository An empty object for contents runtimeData and runtimeConf
                * @param {object} viewStateParam (optional) The current $stateParams
                * @returns {object} A ModelViewCtrl with access to the contents automation api (refresh/clear)
                * @description
                * Used by screen template controller the ModelViewCtrl constructor provides both configuration data
                * and automation APIs for current screen
                */
                this.ModelViewCtrl = function (screenData, confDataRepository, viewStateParam) {
                    var screen = {};
                    angular.copy(screenData, screen);
                    var self = this, contentName = null, commandBarData = null, applName = screen.appName, parkConf = {},
                        parkExtraConf = {}, runtimeContextRepository = { contents: {}, params: viewStateParam }, i = 0,
                        newFields = ["sortInfo", "groupFields", "quickSearchOptions", "tileConfig", "gridConfig", "defaultSortingField"], actionGroupsData = [];
                    var isExtended = false, extensionId;
                    if (typeof confDataRepository !== "object" || confDataRepository === null) {
                        return null;
                    }

                    if (md.getCurrentModuleInfo(screenData.id).actionGroups) {
                        actionGroupsData = md.getCurrentModuleInfo(screenData.id).actionGroups
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#getMasterContentNames
                    * @access public
                    * @module siemens.simaticit.common.services.modelDriven
                    * @returns {string|Array} An array with all master content names.
                    * @description Get current screen master content names
                    */
                    self.getMasterContentNames = function () {
                        if (screen && screen.contents) {
                            return Object.getOwnPropertyNames(screen.contents).filter(function (contentName) {
                                return screen.contents[contentName].master;
                            });
                        }
                        return [];
                    };

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#getMasterContentNames
                    * @access public
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {string} contentName The active content name
                    * @description Context switch (used by masterDetail template when a details tab become active)
                    */
                    self.setActiveContent = function (contentName) {
                        if (runtimeContextRepository["activeContent"] !== contentName) {
                            runtimeContextRepository["activeContent"] = contentName;
                        }
                    }

                    self.refreshBreadCrumbChainForMaster = function (chain) {
                        breadcrumbService.setBreadcrumbChain(chain);
                    }

                    function evaluateDynamicDestScreens(screen, contextInfo) {
                        var isCurrentScreen = false;
                        if (!screen) {
                            return isCurrentScreen;
                        }
                        if (!screen.condition) {
                            return isCurrentScreen;
                        }
                        if (screen.condition.expression) {
                            isCurrentScreen = mdContextSrv.parseWithStateCtx(screen.condition.expression, {
                                currentContentItem: contextInfo
                            });
                        } else if (screen.condition.body) {
                            var evaluation = mdContextSrv.evalFunctionWithStateCtx(screen.condition.body, {
                                currentContentItem: contextInfo
                            });
                            if (typeof evaluation === "object" && evaluation !== null && typeof evaluation.then === "function") {
                                evaluation.then(function (outcome) {
                                    isCurrentScreen = outcome;
                                    return isCurrentScreen;
                                });
                            }
                            else {
                                isCurrentScreen = evaluation;
                            }
                        }
                        return isCurrentScreen;
                    }

                    function getDefaultDestinationScreen(destScreens) {
                        var screen = {
                            name: '',
                            params: {}
                        };
                        if (!destScreens) {
                            return screen;
                        }
                        var defaultScreens = destScreens.filter(function (screen) {
                            return screen.default;
                        });
                        screen = defaultScreens && defaultScreens[0] ? defaultScreens[0] : screen;
                        return screen;
                    }

                    function getDestinationScreen(commandInfo, contextInfo) {
                        var screen = {
                            name: '',
                            params: {}
                        }
                        if (!commandInfo.destinationScreens) {
                            screen.name = commandInfo.destination;
                            screen.params = commandInfo.drillDownParams || commandInfo.navigationParams;
                        } else if (commandInfo.destinationScreens.length) {
                            var defaultScreen = getDefaultDestinationScreen(commandInfo.destinationScreens);
                            var filteredScreen = commandInfo.destinationScreens.filter(function (destScreen) {
                                return evaluateDynamicDestScreens(destScreen, contextInfo)
                            });
                            screen = filteredScreen && filteredScreen.length ? filteredScreen[0] : defaultScreen;
                        }
                        return screen;
                    }

                    function missingOverlayMessage() {
                        var overlay = {
                            text: $translate.instant('common.mdui.missingDestinationScreen'),
                            buttons: [{
                                id: 'okButton',
                                displayName: $translate.instant('filterPanel.overlay.displayName'),
                                onClickCallback: function () {
                                    overlayService.hide();
                                }
                            }]
                        };
                        overlayService.set(overlay);
                        overlayService.show();
                    }
                    function onDrillDownCommandClick(item, contentName, command) {
                        var paramValue;
                        var obj = {};
                        if (item && item.Id) {
                            runtimeContextRepository.contents[contentName].selectedItem = item;
                            var screen = getDestinationScreen(command, item);
                            if (!screen || !screen.name || $state.get("home." + screen.name) === null) {
                                missingOverlayMessage();
                                return;
                            }
                            if (screen && screen.params) {
                                Object.getOwnPropertyNames(screen.params).forEach(function (name) {
                                    paramValue = mdContextSrv.parseWithStateCtx(screen.params[name], { currentContentItem: item });
                                    obj[name] = paramValue;
                                });
                            }
                            mdContextSrv.setPropertyPanelState(false, null);
                            if (typeof self[contentName].onOpenClick === 'function' && screen.name) {
                                self[contentName].onOpenClick(item, screen.name, obj);
                            }
                        }
                    }

                    function addDrillDownCommandToColumn(columns, command, contentName) {
                        if (!command || !columns) {
                            return columns;
                        }
                        if (command.type === 'drill-down') {
                            //attach the on click callback
                            command.onClick = function (row) {
                                onDrillDownCommandClick(row, contentName, command);
                            }
                            //index to be considered later in cased of multiple commands
                            command.fieldName = columns[0].field;

                            columns[0].cellTemplate = '<sit-grid-command ng-class="::col.colIndex()" sit-row="::row" sit-options="::col.colDef.options"></sit-grid-command>';
                            columns[0].options = command;
                            columns[0].isExpression = false;
                            if (command.destination && !UIAuthorization.isScreenAccessible('home.' + command.destination, md.allAvailableScreens)) {
                                columns[0].options.visible = false;
                            }
                        }
                        return columns;
                    }

                    function migrateCommand(command) {
                        if (!command) {
                            return command;
                        }
                        if (command.hasOwnProperty('cmdIcon')) {
                            command.img = 'svg cmd' + command.cmdIcon + '24';
                        }
                        return command;
                    }

                    function addCommandToColumn(gridConfig, contentName) {
                        var commands = gridConfig.commands;
                        var columns = gridConfig.columnDefs;
                        if (!commands || !columns) {
                            return columns;
                        }
                        if (commands.length > 0) {
                            commands.forEach(function (command, index) {
                                command.tooltip = $translate.instant(command.tooltip) || command.tooltip;
                                command = migrateCommand(command);
                                columns = addDrillDownCommandToColumn(columns, command, contentName);
                            });
                        }
                        return columns;
                    }

                    function getGridCommands(blueprintSettings) {
                        var commands = [];
                        if (!blueprintSettings.gridConfig || !blueprintSettings.tileConfig) {
                            return commands;
                        }
                        commands = blueprintSettings.gridConfig.commands || [];
                        var tileCommands = blueprintSettings.tileConfig.commands || [];
                        if (blueprintSettings.viewOptions === 'gm') {
                            commands = tileCommands;
                        }
                        return commands;
                    }

                    function getAllAvailableGridFields(allFields, selectedFields, tagField, serverSidePagination) {
                        var allAvailableFields = [];
                        if (!allFields || !selectedFields) {
                            return allAvailableFields;
                        }
                        var selectedFieldNames = selectedFields.map(function (item) {
                            return item.field;
                        })
                        allFields.forEach(function (field) {
                            var fieldName;
                            if (field.fieldSource && serverSidePagination) {
                                fieldName = field.name.replace(field.fieldSource + '.', "");
                                field.name = fieldName;
                            }
                            var isDataSegregationField = field.name === tagField;
                            if (selectedFieldNames.indexOf(field.name) === -1 && !isDataSegregationField) {
                                var availableField = {
                                    field: field.name,
                                    displayName: $translate.instant(field.label) || field.name,
                                    type: typeof field.type === 'string' && field.type ? field.type.toLowerCase() : field.type,
                                    visible: false
                                };
                                if (field.fieldSource) {
                                    availableField.fieldSource = field.fieldSource;
                                }
                                if (field.type === 'number') {
                                    availableField.cellFilter = 'number';
                                } else if (field.type === 'decimal') {
                                    availableField.cellFilter = 'number';
                                } else if (field.type === 'boolean') {
                                    availableField.cellTemplate = '<sit-mdtoggle ng-disabled="true" sit-row="row" sit-col="col" sit-field="' + field.name + '" ></sit-mdtoggle>';
                                } else if (field.type === 'datetimeoffset' || field.type === 'datetime') {
                                    availableField.cellFilter = 'date:\'medium\'';
                                } else {
                                    availableField.isExpression = true;
                                }
                                selectedFields.push(availableField);
                            }
                            if (field.fieldSource && serverSidePagination) {
                                fieldName = field.fieldSource.concat('.', fieldName);
                                field.name = fieldName;
                            }
                        });
                        allAvailableFields = selectedFields;
                        return allAvailableFields;
                    }

                    function getAllAvailableTileFields(allFields, tileConfig, tagField, serverSidePagination) {
                        var allAvailableFields = [];
                        var titleField;
                        var descriptionField;
                        var selectedFieldNames = [];

                        if (!allFields || !tileConfig) {
                            return allAvailableFields;
                        }
                        var selectedFields = tileConfig.propertyFields || [];
                        if (tileConfig.titleField) {
                            titleField = tileConfig.titleField.hasOwnProperty('field') ? tileConfig.titleField.field : tileConfig.titleField;
                        }
                        if (tileConfig.descriptionField) {
                            descriptionField = tileConfig.descriptionField.hasOwnProperty('field') ?
                                tileConfig.descriptionField.field : tileConfig.descriptionField;
                        }
                        selectedFieldNames = selectedFields.map(function (item) {
                            return item.field;
                        });

                        allFields.forEach(function (field) {
                            var fieldName;
                            if (field.fieldSource && serverSidePagination) {
                                fieldName = field.name.replace(field.fieldSource + '.', "");
                                field.name = fieldName;
                            }
                            var isFieldAlreadyAdded = (field.name === tagField || field.name === titleField || field.name === descriptionField);
                            if (selectedFieldNames.indexOf(field.name) === -1 && !isFieldAlreadyAdded) {
                                var availableField = {
                                    field: field.name,
                                    displayName: $translate.instant(field.label) || field.name,
                                    type: field.type,
                                    visible: false
                                };
                                if (field.fieldSource) {
                                    availableField.fieldSource = field.fieldSource;
                                }
                                if (field.type === 'datetimeoffset' || field.type === 'datetime') {
                                    availableField.dataType = 'date';
                                    availableField.format = 'medium';
                                }
                                selectedFields.push(availableField);
                            }
                            if (field.fieldSource && serverSidePagination) {
                                fieldName = field.fieldSource.concat('.', fieldName);
                                field.name = fieldName;
                            }
                        });
                        allAvailableFields = selectedFields;
                        return allAvailableFields;
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#createExtraICVGridConf
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {object|Array} properties A MD content.properties manifest field
                    * @param {object} blueprintSettings (optional) ICV tile additional configuration
                    * @returns {object} An object with ICV/Grid conf info: sortInfo, groupFields, quickSearchOptions, tileConfig e gridConfig
                    * @description Context switch (used by masterDetail template when a details tab become active)
                    */
                    function createExtraICVGridConf(contentName, properties, blueprintSettings) {
                        // Inspect content properties to complete ICV configuration
                        var quickSearchOptions, groupFields, sortInfo, gridConfig, tileConfig, tempObj = {};
                        properties.forEach(function (p) {
                            var prop = p, name = p.name, displayName = $translate.instant(prop.label) || p.name, propProps = Object.getOwnPropertyNames(prop);
                            if (prop.type && prop.type.length > 0) {
                                prop.type = prop.type.toLowerCase();
                            }
                            tempObj[prop.name] = prop;
                            if (!gridConfig) {
                                gridConfig = { columnDefs: [] };
                            }
                            if (prop.type === 'number') {
                                gridConfig.columnDefs.push({ field: name, displayName: displayName, cellFilter: 'number' });
                            } else if (prop.type === 'decimal') {
                                gridConfig.columnDefs.push({ field: name, displayName: displayName, cellFilter: 'number' });
                            }
                            else if (prop.type === 'boolean') {
                                gridConfig.columnDefs.push(
                                    {
                                        field: name,
                                        displayName: displayName,
                                        cellTemplate: '<sit-mdtoggle ng-disabled="true" sit-row="row" sit-col="col" sit-field="' + name + '" ></sit-mdtoggle>'
                                    }
                                );
                            } else if (prop.type === 'datetimeoffset' || prop.type === 'datetime') {
                                gridConfig.columnDefs.push({ field: name, displayName: displayName, cellFilter: 'date:\'medium\'' });
                            }
                            else {
                                gridConfig.columnDefs.push({ field: name, displayName: displayName });
                            }
                            if (prop.fieldSource && blueprintSettings.serverSidePagination) {
                                var columnCount = gridConfig.columnDefs.length;
                                var field = gridConfig.columnDefs[columnCount - 1].field.replace(prop.fieldSource + '.', "");
                                gridConfig.columnDefs[columnCount - 1].field = field;
                                gridConfig.columnDefs[columnCount - 1].fieldSource = prop.fieldSource;
                            }
                            propProps.forEach(function (attr) {
                                switch (attr) {
                                    case 'sortable':
                                        var sortDirection = 'asc';
                                        var defaultSortField;
                                        if (prop[attr]) { //is a boolean
                                            if (blueprintSettings) {
                                                sortDirection = blueprintSettings.sortingDirection;
                                                defaultSortField = blueprintSettings.defaultSortingField;
                                            }
                                            if (!sortInfo) {
                                                sortInfo = {
                                                    field: defaultSortField || name,
                                                    direction: sortDirection || 'asc',
                                                    fields: []
                                                };
                                            }
                                            if (name === defaultSortField) sortInfo.fields.unshift({ field: name, displayName: displayName });
                                            else sortInfo.fields.push({ field: name, displayName: displayName });
                                            if (prop.fieldSource && blueprintSettings.serverSidePagination) {
                                                var proprertyField = {};
                                                for (var i = 0; i < sortInfo.fields.length; i++) {
                                                    if (sortInfo.fields[i].field === prop.name) {
                                                        proprertyField = sortInfo.fields[i];
                                                    }
                                                }
                                                if (proprertyField && proprertyField.field) {
                                                    proprertyField.field = proprertyField.field.replace(prop.fieldSource + '.', "");
                                                    proprertyField.fieldSource = prop.fieldSource;
                                                }
                                                if (prop.name === defaultSortField && proprertyField) {
                                                    sortInfo.fieldSource = prop.fieldSource;
                                                    sortInfo.field = proprertyField.field;
                                                    blueprintSettings.defaultSortingField = blueprintSettings.defaultSortingField.replace(prop.fieldSource + '.', "");
                                                }
                                            }
                                        }
                                        break;
                                    case 'groupable':
                                        if (prop[attr]) { //is a boolean
                                            if (!groupFields) {
                                                groupFields = [];
                                            }
                                            groupFields.push({ field: name, displayName: displayName });
                                            if (prop.fieldSource && blueprintSettings.serverSidePagination) {
                                                var groupFieldCount = groupFields.length;
                                                groupFields[groupFieldCount - 1].fieldSource = prop.fieldSource;
                                                var fieldName = groupFields[groupFieldCount - 1].field;
                                                groupFields[groupFieldCount - 1].field = fieldName.replace(prop.fieldSource + '.', "");
                                            }
                                        }
                                        break;
                                    case 'searchable':
                                        if (prop[attr]) { //is a boolean
                                            var placeholderText = '';
                                            if (blueprintSettings) {
                                                placeholderText = $translate.instant(blueprintSettings.quickSearchPlaceholder) || '';
                                                if (placeholderText) {
                                                    placeholderText += ' ' + displayName;
                                                }
                                            }
                                            quickSearchOptions = {
                                                enabled: true, field: name, displayName: displayName, placeholderText: placeholderText
                                            };
                                            if (prop.fieldSource && blueprintSettings.serverSidePagination) {
                                                quickSearchOptions.fieldSource = prop.fieldSource;
                                                var searchFieldName = quickSearchOptions.field.replace(prop.fieldSource + '.', "");
                                                quickSearchOptions.field = searchFieldName;
                                            }
                                        }
                                        break;
                                    case 'isTitle':
                                    case 'isDescription':
                                        if (!tileConfig) {
                                            tileConfig = {};
                                        }
                                        tileConfig[attr + 'Field'] = name;
                                        break;
                                }
                            });
                        });
                        if (blueprintSettings && blueprintSettings.tileConfig) {
                            tileConfig = tileConfig || {};
                            if (blueprintSettings.tileConfig.titleFieldSource && blueprintSettings.serverSidePagination) {
                                tileConfig["titleFieldSource"] = blueprintSettings.tileConfig.titleFieldSource;
                            }
                            if (blueprintSettings.tileConfig.titleField) {
                                var titleValue = window.$UIF.Object.safeGet(blueprintSettings.tileConfig.titleField, 'field');
                                tileConfig["titleField"] = {
                                    field: titleValue || blueprintSettings.tileConfig.titleField,
                                    displayName: getPropertyLevel(properties, titleValue || blueprintSettings.tileConfig.titleField)
                                };
                                var titleField = typeof tileConfig.titleField === 'object' ? tileConfig.titleField.field : tileConfig.titleField;
                                if (tempObj[titleField] && (tempObj[titleField].type === 'datetimeoffset' || tempObj[titleField].type === 'datetime')) {
                                    tileConfig['titleFieldFilter'] = { dataType: 'date', format: 'medium' };
                                }
                                if (tileConfig["titleFieldSource"] && blueprintSettings.serverSidePagination) {
                                    tileConfig["titleField"] = tileConfig["titleField"].replace(tileConfig["titleFieldSource"] + '.', "");
                                }
                            }
                            if (blueprintSettings.tileConfig.descriptionFieldSource && blueprintSettings.serverSidePagination) {
                                tileConfig["descriptionFieldSource"] = blueprintSettings.tileConfig.descriptionFieldSource;
                            }
                            if (blueprintSettings.tileConfig.descriptionField) {
                                var descriptionValue = window.$UIF.Object.safeGet(blueprintSettings.tileConfig.descriptionField, 'field');
                                tileConfig["descriptionField"] = {
                                    field: descriptionValue || blueprintSettings.tileConfig.descriptionField,
                                    displayName: getPropertyLevel(properties, descriptionValue || blueprintSettings.tileConfig.descriptionField)
                                };
                                var descriptionField = typeof tileConfig.descriptionField === 'object' ? tileConfig.descriptionField.field : tileConfig.descriptionField;
                                if (tempObj[descriptionField] && (tempObj[descriptionField].type === 'datetimeoffset' || tempObj[descriptionField].type === 'datetime')) {
                                    tileConfig['descriptionFieldFilter'] = { dataType: 'date', format: 'medium' };
                                }
                                if (tileConfig["descriptionFieldSource"] && blueprintSettings.serverSidePagination) {
                                    tileConfig["descriptionField"] = descriptionField.replace(tileConfig["descriptionFieldSource"] + '.', "");
                                }
                            }
                            if (blueprintSettings.tileConfig.propertyFields) {
                                blueprintSettings.tileConfig.propertyFields.forEach(function (propField) {
                                    if (propField.fieldSource && blueprintSettings.serverSidePagination) {
                                        var fieldName = propField.field.replace(propField.fieldSource + '.', "");
                                        propField.field = fieldName;
                                    }
                                    if (propField.displayName) {
                                        propField.displayName = $translate.instant(propField.displayName);
                                    }
                                    if (tempObj[propField.field] && (tempObj[propField.field].type === 'datetimeoffset' || tempObj[propField.field].type === 'datetime')) {
                                        propField.dataType = 'date';
                                        propField.format = 'medium';
                                    }
                                    if (propField.visible && propField.visible.body && propField.visible.body.length > 1) {
                                        propField.visible = generateTileVisibilityCallBackMethod(propField.visible.body);
                                    } else if (propField.visible && propField.visible.expression && propField.visible.expression.length > 1) {
                                        propField.visible = propField.visible.expression;
                                    } else {
                                        propField.visible = true;
                                    }
                                });
                                tileConfig["propertyFields"] = blueprintSettings.tileConfig.propertyFields;
                            }
                            else {
                                tileConfig["propertyFields"] = [];
                            }
                            if (blueprintSettings.tileConfig.indicators && blueprintSettings.tileConfig.indicators.length > 0) {
                                blueprintSettings.tileConfig.indicators.forEach(function (indicator) {
                                    getUpdatedWidgetConfig(indicator, indicator.svgIcon);
                                    indicator.tooltip = $translate.instant(indicator.tooltip);
                                    if (indicator.visible.body && indicator.visible.body.length > 1) {
                                        indicator.visible = generateTileVisibilityCallBackMethod(indicator.visible.body);
                                    }
                                    else if (indicator.visible.expression && indicator.visible.expression.length > 1) {
                                        indicator.visible = indicator.visible.expression;
                                    }
                                });
                                tileConfig["indicators"] = blueprintSettings.tileConfig.indicators;
                            }
                            if (blueprintSettings.tileConfig.isCell !== undefined) {
                                tileConfig["isCell"] = blueprintSettings.tileConfig.isCell;
                            }
                            //tile commands
                            if (blueprintSettings.tileConfig.commands && blueprintSettings.tileConfig.commands.length > 0) {
                                tileConfig["commands"] = [];
                                blueprintSettings.tileConfig.commands.forEach(function (command) {
                                    if (command.tooltip) {
                                        command.tooltip = $translate.instant(command.tooltip);
                                    }

                                    if (command.img && command.img.indexOf('svg ') !== -1) {
                                        var svgIcon = command.img.slice(4);
                                        svgIcon = svgIcon.substring(3, svgIcon.length - 2);
                                        command.cmdIcon = svgIcon;
                                    }

                                    if (command.visible.body && command.visible.body.length > 1) {
                                        command.visible = generateTileVisibilityCallBackMethod(command.visible.body);
                                    }
                                    else if (command.visible.expression && command.visible.expression.length > 1) {
                                        command.visible = command.visible.expression;
                                    } else if (command.destination && !UIAuthorization.isScreenAccessible(command.destination, md.allAvailableScreens)) {
                                        command.visible = false;
                                    } else {
                                        command.visible = true;
                                    }

                                    if (command.type === "drill-down") {
                                        command.onClick = function (tileContent) {
                                            onDrillDownCommandClick(tileContent, contentName, command);
                                        }
                                    } else {
                                        //TBD: Support for custom onClick callback
                                        command.onClick = function () { }
                                    }
                                    tileConfig.commands.push(command);
                                });
                            }
                        }
                        if (blueprintSettings && blueprintSettings.tagField) {
                            if (blueprintSettings.tagField.displayName) {
                                blueprintSettings.tagField.displayName = $translate.instant(blueprintSettings.tagField.displayName);
                            }
                            if (blueprintSettings.tagField.fieldSource && blueprintSettings.serverSidePagination) {
                                var fieldName = blueprintSettings.tagField.field.replace(blueprintSettings.tagField.fieldSource + '.', "");
                                blueprintSettings.tagField.field = fieldName;
                            }
                        }
                        if (blueprintSettings && blueprintSettings.gridConfig) {
                            gridConfig = blueprintSettings.gridConfig;
                            gridConfig.commands = getGridCommands(blueprintSettings);
                            if (gridConfig.columnDefs) {
                                for (var i = 0; i < gridConfig.columnDefs.length; i++) {
                                    properties.forEach(function (property) {
                                        if (property.type && property.type.length > 0) {
                                            property.type = property.type.toLowerCase();
                                        }
                                        if (gridConfig.columnDefs[i].field === property.name) {
                                            gridConfig.columnDefs[i].isExpression = true;
                                            gridConfig.columnDefs[i].displayName = $translate.instant(gridConfig.columnDefs[i].displayName);
                                            if (property.type === 'boolean') {
                                                gridConfig.columnDefs[i].isExpression = false;
                                                gridConfig.columnDefs[i].cellTemplate = '<sit-mdtoggle ng-disabled="true" sit-row="row" sit-col="col" sit-field="' + property.name + '" >'
                                                    + '</sit-mdtoggle>';
                                            }
                                            if (property.type === 'number') {
                                                gridConfig.columnDefs[i].isExpression = false;
                                                gridConfig.columnDefs[i].cellFilter = 'number';
                                            } else if (property.type === 'decimal') {
                                                gridConfig.columnDefs[i].isExpression = false;
                                                gridConfig.columnDefs[i].cellFilter = 'number';
                                            } else if (property.type === 'datetimeoffset' || property.type === 'datetime') {
                                                gridConfig.columnDefs[i].isExpression = false;
                                                gridConfig.columnDefs[i].cellFilter = 'date:\'medium\'';
                                            }
                                            gridConfig.columnDefs[i].sortable = typeof property.sortable === 'boolean' ? property.sortable : false;
                                        }
                                    });
                                    if (gridConfig.columnDefs[i].indicators && gridConfig.columnDefs[i].indicators.length) {
                                        gridConfig.columnDefs[i].displayIcon = (function (icon) {
                                            if (!icon) return;
                                            if (icon.indexOf('svg ') !== -1) {
                                                var svgIcon = icon.slice(4); //removes 'svg '
                                                icon = 'common/icons/' + svgIcon + '.svg';
                                                return icon;
                                            } else return icon;
                                        })(gridConfig.columnDefs[i].displayIcon);
                                        gridConfig.columnDefs[i].indicators.forEach(function (indicator) {
                                            getUpdatedWidgetConfig(indicator, indicator.svgIcon);
                                            indicator.tooltip = $translate.instant(indicator.tooltip);
                                            if (!indicator.visible) return;
                                            if (indicator.visible.expression) {
                                                indicator.visible = indicator.visible.expression.replace(/tileContent/g, 'row');
                                            } else if (indicator.visible.body) {
                                                indicator.visible = new Function('row', indicator.visible.body.replace(/tileContent/g, 'row')); //NOSONAR
                                            }
                                        });
                                    }
                                }
                                gridConfig.columnDefs = addCommandToColumn(gridConfig, contentName);
                            }
                            gridConfig.columnDefs.forEach(function (column) {
                                if (column.fieldSource && blueprintSettings.serverSidePagination) {
                                    var field = column.field.replace(column.fieldSource + '.', "");
                                    column.field = field;
                                }
                            });
                        }
                        var tagField = blueprintSettings && blueprintSettings.tagField ? blueprintSettings.tagField.field : null;
                        tileConfig.propertyFields = getAllAvailableTileFields(properties, tileConfig, tagField, blueprintSettings.serverSidePagination);
                        gridConfig.columnDefs = getAllAvailableGridFields(properties, gridConfig.columnDefs, tagField, blueprintSettings.serverSidePagination);
                        return {
                            sortInfo: sortInfo,
                            groupFields: groupFields,
                            quickSearchOptions: quickSearchOptions,
                            tileConfig: tileConfig,
                            gridConfig: gridConfig,
                            defaultSortingField: blueprintSettings.defaultSortingField
                        };
                    }

                    /** This function will return translated label for matching field
                     * @param {any} properties
                     * @param {any} fieldName
                     */
                    function getPropertyLevel(properties, fieldName) {
                        var displayName = '';
                        properties.forEach(function (property) {
                            if (property.name === fieldName) {
                                displayName = $translate.instant(property.label) || property.name;
                            }
                        });
                        return displayName;
                    }

                    function generateTileVisibilityCallBackMethod(functionBody) {
                        if (functionBody) {
                            var fn = 'return function (tileContent) {' + functionBody + '};';
                            var defFunction = new Function(fn)(); //NOSONAR
                            return defFunction;
                        } else {
                            return functionBody;
                        }
                    }

                    function getUserPrefId(cntName) {
                        var userPrefId = cntName;
                        try {
                            var lastIndex = screen.id.indexOf('.');
                            var screenId = screen.id.substring(lastIndex + 1);
                            userPrefId = screenId + '_' + cntName;
                        } catch (error) {
                            return userPrefId;
                        }
                        return userPrefId;
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#ensureSidepanelVisibility
                   * @access internal
                   * @module siemens.simaticit.common.services.modelDriven
                   * @description Manages the property mode sidepanels visibility
                   */
                    var ensureSidepanelVisibility = _.debounce(function () {
                        $timeout(function () {
                            var sidepanelState = mdContextSrv.getPropertyPanelState();
                            var isSidepanelShown = evalSidepanelVisibility(sidepanelState);
                            if (sidepanelState.isSidepanelOpen && !isSidepanelShown) {
                                mdContextSrv.setPropertyPanelState(false, null);
                                $state.go('^');
                            }
                        }, 200);
                    }, 200, true);

                    function mapFieldSources(fieldSources) {
                        var result = {};
                        fieldSources.forEach(function (fieldSource) {
                            if (fieldSource.fullName && fieldSource.fullName.indexOf("ReadingModel") === -1) {
                                var splitName = fieldSource.fullName.split(".");
                                splitName.splice(splitName.length - 1, 0, "ReadingModel");
                                fieldSource.fullName = splitName.join(".");
                            }
                        });
                        for (var i = 0; i < fieldSources.length; i++) {
                            result[fieldSources[i].alias] = { "name": fieldSources[i].fullName, "type": fieldSources[i].type };
                        }
                        return result;
                    }

                    function getContentDataArtifact(content) {
                        var dataArtifact = null;
                        if (content.entityRef && content.entityRef.entity) {
                            dataArtifact = content.entityRef.entity;
                        }
                        else if (content.readingFunctionRef && content.readingFunctionRef.functionName) {
                            dataArtifact = content.readingFunctionRef.functionName;
                        }
                        return dataArtifact;
                    }                    

                    function getContentEntityAppName(content) {
                        var entityAppName = null;
                        if (content.entityRef && content.entityRef.app) {                           
                            entityAppName = getAppShortName(content.entityRef.app);
                        }
                        else if (content.readingFunctionRef && content.readingFunctionRef.app) {
                            entityAppName = getAppShortName(content.readingFunctionRef.app);
                        }
                        return entityAppName;
                    }

                    function isReadingFunctionContent(content) {
                        var isReadingFunction = false;
                        if (content.readingFunctionRef && content.readingFunctionRef.functionName) {
                            isReadingFunction = true;
                        }
                        return isReadingFunction;
                    }

                    function getOptionsForFilterPanel(values) {
                        var options = [];
                        if (values && values.length) {
                            options = values.map(function (item) {
                                return { id: item, name: item };
                            });
                        }
                        return options;
                    }

                    function mapGridconfigDataForFilters(item) {
                        var columnDefs = [];
                        for (var key in item) {
                            var obj = {};
                            if (item[key] !== null && typeof item[key] === "object") {
                                obj.field = Object.getOwnPropertyNames(item[key])[0];
                                obj.displayName = Object.getOwnPropertyNames(item[key])[0];
                                obj.visible = true;
                            } else if (typeof item[key] === "string") {
                                obj.field = key;
                                obj.displayName = key;
                                obj.visible = true;
                                var checkDateProperty = new Date(item[key]);
                                if (checkDateProperty.toString() !== "Invalid Date") {
                                    obj.cellFilter = 'date:\'medium\'';
                                }
                            } else {
                                obj.field = key;
                                obj.displayName = key;
                                obj.visible = true;
                            }
                            columnDefs.push(obj);
                        }
                        return columnDefs;
                    }

                    function configureFindAllForServerSide(fieldProperty, isFilterPanel) {
                        var propName = fieldProperty.field;
                        self.findAllData[propName] = {};
                        self.findAllData[propName].currentField = propName;
                        self.findAllData[propName].findAll = function (icvServerConfig) {
                            self.currentField = this.currentField;
                            var defer = $q.defer();
                            icvServerConfig.options = interpolateQuery(icvServerConfig.options);
                            var options = [];
                            var combinedQueryList = [];
                            if (icvServerConfig.options && typeof (icvServerConfig.options) === 'string') {
                                var keyList = [];
                                options = icvServerConfig.options.split('&');
                                options.forEach(function (key, index) {
                                    var keyName = key.substring(0, key.indexOf('='));
                                    if (keyList.indexOf(keyName) === -1) {
                                        combinedQueryList.push(combineQueryOptions(keyName, options));
                                        keyList.push(keyName);
                                    }
                                });
                                icvServerConfig.options = combinedQueryList.join('&');
                            }
                            var backendSvcMethodToCall = '';
                            var backendSvcMethodParams = {};

                            if (fieldProperty.dataSource.selectedEntity && fieldProperty.dataSource.selectedEntity.id) {
                                backendSvcMethodToCall = 'findAll';
                                var entityAppName = fieldProperty.dataSource.selectedEntity.app;
                                backendSvcMethodParams = {
                                    appName: entityAppName || icvServerConfig.appName,
                                    entityName: icvServerConfig.entityName,
                                    options: icvServerConfig.options,
                                    facetInfo: icvServerConfig.facetInfo,
                                    dataTransformInfo: icvServerConfig.dataTransformInfo
                                };
                            } else if (fieldProperty.dataSource.readingFunction && fieldProperty.dataSource.readingFunction.name) {
                                backendSvcMethodToCall = 'read';
                                var entityAppName = fieldProperty.dataSource.readingFunction.app || icvServerConfig.appName;
                                backendSvcMethodParams = {
                                    appName: entityAppName,
                                    functionName: fieldProperty.dataSource.readingFunction.name,
                                    params: fieldProperty.dataSource.readingFunction.param ? fieldProperty.dataSource.readingFunction.param : {},
                                    options: icvServerConfig.options
                                };
                            }

                            backendService[backendSvcMethodToCall](backendSvcMethodParams)
                                .then(function (data) {
                                    data.value.forEach(function (item) {
                                        if (!isFilterPanel && !fieldProperty.icvOptions.gridConfig.columnDefs.length) {
                                            fieldProperty.icvOptions.gridConfig.columnDefs = mapGridconfigDataForFilters(item);
                                            fieldProperty.icvOptions.sortInfo.fields = mapGridconfigDataForFilters(item);
                                            fieldProperty.icvOptions.groupFields = mapGridconfigDataForFilters(item);
                                            fieldProperty.icvOptions.refresh(true);
                                        }
                                        if (isFilterPanel && !fieldProperty.widgetAttributes["sit-picker-options"].gridConfig.columnDefs.length) {
                                            fieldProperty.widgetAttributes["sit-picker-options"].gridConfig.columnDefs = mapGridconfigDataForFilters(item);
                                            fieldProperty.widgetAttributes["sit-picker-options"].sortInfo.fields = mapGridconfigDataForFilters(item);
                                            fieldProperty.widgetAttributes["sit-picker-options"].groupFields = mapGridconfigDataForFilters(item);
                                            fieldProperty.widgetAttributes["sit-picker-options"].refresh(true);
                                        }
                                        item.id = item[fieldProperty.dataSource.displayProperty];
                                        item.name = item[fieldProperty.dataSource.valueProperty];
                                    });
                                    defer.resolve(data);
                                }, function (error) {
                                    defer.reject(error);
                                })
                            return defer.promise;
                        }
                    }

                    function interpolateQuery(propertyQuery) {
                        var interpolatedQuery;
                        interpolatedQuery = mdContextSrv.interpolateQuery(propertyQuery);
                        return interpolatedQuery;
                    }

                    function findIndexOfFilter(array) {
                        var index = -1;
                        for (var i = 0; i < array.length; i++) {
                            array[i] = array[i].trim();
                            if (array[i].startsWith('$filter')) {
                                index = i;
                                break;
                            }
                        }
                        return index;
                    }

                    function getConcatenatedFilterQuery(query, optionString) {
                        if (query) {
                            var array = query.split('&');
                            var indexOfFilter = findIndexOfFilter(array); //returns the index of $filter
                            if (indexOfFilter === -1) {
                                array.push('$filter=' + optionString);    //push the $filter query to the array
                            } else {
                                array[indexOfFilter] = array[indexOfFilter] + ' and ' + optionString; //appends the optionstring to the existing $filter
                            }
                            query = array.join('&');
                        } else {
                            query = '$filter=' + optionString;
                        }
                        return query;
                    }

                    function getEntityPickerData(prop, searchString) {
                        var defer = $q.defer();
                        if (searchString) {
                            var propQuery, optionString = "contains(" + prop.dataSource.valueProperty + ",'" + searchString + "')";
                            propQuery = interpolateQuery(prop.dataSource.query);
                            var query = getConcatenatedFilterQuery(propQuery, optionString);

                            var backendSvcMethodToCall = '';
                            var backendSvcMethodParams = {};
                            if (prop.dataSource.entityName) {
                                backendSvcMethodToCall = 'findAll';
                                backendSvcMethodParams = {
                                    appName: prop.dataSource.appName,
                                    entityName: prop.dataSource.entityName,
                                    options: query
                                };
                            } else if (prop.dataSource.readingFunction) {
                                backendSvcMethodToCall = 'read';
                                backendSvcMethodParams = {
                                    appName: prop.dataSource.appName,
                                    functionName: prop.dataSource.readingFunction.name,
                                    params: prop.dataSource.readingFunction.params,
                                    options: query
                                };
                            }

                            backendService[backendSvcMethodToCall](backendSvcMethodParams)
                                .then(function (data) {

                                    defer.resolve(data.value);
                                }, function (error) {
                                    defer.reject(error);
                                })
                        } else {
                            defer.resolve([]);
                        }
                        return defer.promise;
                    }

                    function configureEntityPickerforServerSide(fieldProperty, isFilterPanel) {
                        self.findAllData = [];
                        var dataArtifact = "";
                        var entityAppName = "";
                        if (fieldProperty.dataSource.selectedEntity && fieldProperty.dataSource.selectedEntity.id) {
                            dataArtifact = fieldProperty.dataSource.selectedEntity.id;
                            entityAppName = fieldProperty.dataSource.selectedEntity.app;
                        } else if (fieldProperty.dataSource.readingFunction) {
                            dataArtifact = fieldProperty.dataSource.readingFunction.name;
                            entityAppName = fieldProperty.dataSource.readingFunction.app;
                        }
                        configureFindAllForServerSide(fieldProperty, isFilterPanel);
                        if (!isFilterPanel) {
                            fieldProperty.dataService = self.findAllData[fieldProperty.field];
                            fieldProperty.icvOptions.serverDataOptions = {
                                dataService: self.findAllData[fieldProperty.field],
                                dataEntity: dataArtifact,
                                appName: entityAppName || applName,
                                optionsString: fieldProperty.dataSource.query
                            }
                        } else {
                            fieldProperty.widgetAttributes["sit-picker-options"].serverDataOptions = {
                                dataService: self.findAllData[fieldProperty.field],
                                dataEntity: dataArtifact,
                                appName: entityAppName || applName,
                                optionsString: fieldProperty.dataSource.query
                            };
                            fieldProperty.widgetAttributes['sit-datasource'] = function (searchString) {
                                return getEntityPickerData(fieldProperty, searchString).then(function (data) {
                                    return data;
                                }, function (error) {
                                    return [];
                                });
                            }
                        }
                    }

                    function getFilterConfig(field, isFilterPanel) {
                        if (field.dataSource.selectedEntity && field.dataSource.selectedEntity.app) {
                            var appName = field.dataSource.selectedEntity.app;
                        }
                        if (field.dataSource.readingFunction && field.dataSource.readingFunction.app) {
                            var appName = field.dataSource.readingFunction.app;
                        }
                       
                        if (!isFilterPanel) {
                            if (field.widget === "sit-entity-picker") {
                                configureEntityPickerForFilterBuilder(field);
                                if (field.pagingMode === 'server') {
                                    configureEntityPickerforServerSide(field, isFilterPanel);
                                    field.appName = appName || screen.appName;
                                }
                            } else {
                                field.dataService = backendService;
                                field.appName = appName || screen.appName;
                            }
                            return field;
                        }
                        field.widgetAttributes = {};
                        if (field.widget === 'sit-select') {
                            field.widget = 'sit-advanced-select';
                            field.widgetAttributes = {
                                'sit-options': getOptionsForFilterPanel(field.values),
                                'sit-to-display': 'name',
                                'sit-to-keep': 'id'
                            }
                        }
                        if (field.widget === 'sit-date-time-picker') {
                            field.widgetAttributes['sit-format'] = 'medium';
                            field.widgetAttributes['sit-show-seconds'] = true;
                        }
                        if (field.widget === "sit-entity-picker") {
                            configureEntityPickerForFilterPanel(field);
                        }
                        if (field.pagingMode === 'server') {
                            configureEntityPickerforServerSide(field, isFilterPanel);
                        }
                        if (field.validation) {
                            field.widgetAttributes['sit-validation'] = field.validation;
                        }
                        if (field.dataSource && (field.dataSource.selectedEntity || field.dataSource.readingFunction)) {
                            field.dataSource.appName = appName || screen.appName;
                            if (field.dataSource.selectedEntity && field.dataSource.selectedEntity.id) {
                                field.dataSource.entityName = field.dataSource.selectedEntity.id;
                            }
                            field.dataSource.optionsString = field.dataSource.query;
                        }
                        return field;
                    }

                    function getGridConfig(gridConfigFields, entityPickerFields) {
                        var gridConfig = { 'columnDefs': [] }, tempObj = {};
                        if (entityPickerFields.length > 0) {
                            entityPickerFields.forEach(function (entityPickerField) {
                                tempObj[entityPickerField.name] = entityPickerField;
                            });
                            if (typeof gridConfigFields === 'string') {
                                gridConfigFields = gridConfigFields.split(',');
                            }
                            if (gridConfigFields && gridConfigFields.length > 0) {
                                for (var i = 0; i < gridConfigFields.length; i++) {
                                    var field = { 'field': gridConfigFields[i], 'displayName': $translate.instant(tempObj[gridConfigFields[i]].label) };
                                    if (tempObj[gridConfigFields[i]].type === 'Boolean') {
                                        field.cellTemplate =
                                            '<sit-mdtoggle ng-disabled="true" sit-value="row.getProperty(\'' +
                                            gridConfigFields[i] + '\') === null ? false : row.getProperty(\'' + gridConfigFields[i] + '\')" ></sit-mdtoggle>';
                                    }
                                    if (tempObj[gridConfigFields[i]].type === 'DateTimeOffset' || tempObj[gridConfigFields[i]].type === 'DateTime' ||
                                        tempObj[gridConfigFields[i]].type === 'Date') {
                                        field.cellFilter = 'date:\'medium\'';
                                    }
                                    gridConfig.columnDefs.push(field);
                                }
                            }
                        }
                        return gridConfig;
                    }

                    function getTranslatedFieldLabel(fieldName, entityPickerFields) {
                        var translatedLabel;
                        if (!fieldName || !entityPickerFields) {
                            return translatedLabel;
                        }
                        entityPickerFields.forEach(function (property) {
                            if (property.name === fieldName) {
                                translatedLabel = $translate.instant(property.label) || fieldName;
                            }
                        });
                        return translatedLabel;
                    }

                    function getFilterSettingsFieldConfig(fieldData) {
                        var filterFields;
                        if (fieldData.entityPickerConfig.filterFields && fieldData.entityPickerConfig.filterFields.length) {
                            filterFields = angular.copy(fieldData.entityPickerConfig.filterFields);
                        } else {
                            filterFields = [];
                        }
                        for (var i = 0; i < filterFields.length; i++) {
                            filterFields[i].displayName = $translate.instant(filterFields[i].displayName);
                            filterFields[i].allowedCompareOperators = getMigratedOperators(filterFields[i].allowedCompareOperators);
                            filterFields[i].dataService = self;  
                            filterFields[i].appName = screen.appName;
                            if (filterFields[i].dataSource && filterFields[i].dataSource.query) {
                                filterFields[i].dataSource.query = interpolateQuery(filterFields[i].dataSource.query);
                            }
                            if (filterFields[i].dataSource && filterFields[i].dataSource.selectedEntity) {
                                filterFields[i].appName = filterFields[i].dataSource.selectedEntity.app;
                            }
                            if (filterFields[i].dataSource && filterFields[i].dataSource.readingFunction) {
                                filterFields[i].appName = filterFields[i].dataSource.readingFunction.app;
                            }
                        }
                        if (fieldData.icvOptions) {
                            fieldData.icvOptions.filterFields = filterFields;
                        } else if (fieldData.widgetAttributes && fieldData.widgetAttributes["sit-picker-options"]) {
                            fieldData.widgetAttributes["sit-picker-options"].filterFields = filterFields;
                        }
                    }

                    self.findAll = function (payload) {
                        var defer = $q.defer();
                        backendService.findAll(payload).then(function (data) {
                            defer.resolve(data);
                        });

                        return defer.promise;
                    }

                    function configureEntityPickerForFilterBuilder(fieldData) {
                        var sortableFields;
                        fieldData.toKeep = fieldData.dataSource.valueProperty;
                        var icvOptions = {
                            containerID: 'globalDialogId-entity-picker-popup',
                            gridConfig: { columnDefs: [] },
                            placeHolder: $translate.instant('entityPicker.defaultPlaceHolder'),
                            attributetodisplay: fieldData.dataSource.displayProperty,
                            required: true,
                            sortInfo: {
                                field: '',
                                direction: 'asc',
                                fields: []
                            },
                            alwaysShowPager: true,
                            quickSearchOptions: {
                                enabled: true,
                                field: fieldData.dataSource.displayProperty,
                                filterText: ''
                            },
                            enablePaging: true,
                            pagingOptions: {
                                pageSizes: [5, 10, 25, 100, 250, 500],
                                pageSize: 10,
                                currentPage: 1
                            },
                            tagsManager: false,
                            filterBarOptions: 'sqf',
                            filterOptions: [],
                            onSelectionChangeCallback: function () {
                            },
                            selectionMode: 'single',
                            selectStyle: 'alternate',
                            viewMode: 'g',
                            viewOptions: 'g',
                            refresh: function () { }
                        };
                        fieldData.icvOptions = {};
                        if (fieldData.entityPickerConfig) {
                            if (fieldData.entityPickerConfig.gridConfig) {
                                icvOptions.gridConfig = getGridConfig(fieldData.entityPickerConfig.gridConfig, fieldData.entityPickerConfig.fields);
                            }
                            if (fieldData.entityPickerConfig.sortable) {
                                sortableFields = fieldData.entityPickerConfig.sortable.split(',');
                                sortableFields = sortableFields.map(function (fieldName) {
                                    return {
                                        field: fieldName,
                                        displayName: getTranslatedFieldLabel(fieldName, fieldData.entityPickerConfig.fields)
                                    };
                                });
                                icvOptions.sortInfo = {
                                    field: sortableFields[0].field,
                                    direction: 'asc',
                                    fields: sortableFields
                                }
                            }
                            icvOptions.placeHolder = $translate.instant(fieldData.entityPickerConfig.placeholder);
                            icvOptions.quickSearchOptions.field = fieldData.entityPickerConfig.searchable;
                            icvOptions.enablePaging = fieldData.entityPickerConfig.enablePaging;
                            icvOptions.alwaysShowPager = fieldData.entityPickerConfig.enablePaging;
                            if (fieldData.entityPickerConfig.filterEnabled) {
                                icvOptions.filterBarOptions = fieldData.entityPickerConfig.filterBarOptions;
                                icvOptions.filterOptions = fieldData.entityPickerConfig.filterFields;
                            }
                        }
                        fieldData.icvOptions = icvOptions;
                        if (fieldData.dataSource.readingFunction && !fieldData.dataSource.readingFunction.params) {
                            fieldData.dataSource.readingFunction.params = {};
                        }
                        if (fieldData.entityPickerConfig && fieldData.entityPickerConfig.filterFields && fieldData.entityPickerConfig.filterEnabled) {
                            getFilterSettingsFieldConfig(fieldData);
                        }

                    }

                    function configureEntityPickerForFilterPanel(fieldData) {
                        var sortableFields;
                        var fieldName = fieldData.field;
                        fieldData.toKeep = fieldData.dataSource.valueProperty;
                        fieldData.widgetAttributes = {
                            "sit-selected-attribute-to-display": fieldData.dataSource.displayProperty,
                            "sit-editable": false,
                            "sit-title": fieldData.entityPickerTitle,
                            "sit-placeholder": $translate.instant('entityPicker.defaultPlaceHolder'),
                            "sit-picker-options": {
                                containerID: 'globalDialogId-entity-picker-popup',
                                alwaysShowPager: true,
                                selectionMode: 'single',
                                quickSearchOptions: {
                                    enabled: true,
                                    field: fieldData.dataSource.displayProperty,
                                    filterText: ''
                                },
                                sortInfo: {
                                    field: '',
                                    direction: 'asc',
                                    fields: []
                                },
                                gridConfig: { columnDefs: [] },
                                pagingOptions: {
                                    pageSizes: [5, 10, 25, 100, 250, 500],
                                    pageSize: 10,
                                    currentPage: 1
                                },
                                tagsManager: false,
                                filterOptions: [],
                                filterBarOptions: 'sqf',
                                onSelectionChangeCallback: function () { },
                                selectStyle: 'alternate',
                                viewMode: 'g',
                                viewOptions: 'g'
                            }
                        };
                        if (fieldData.entityPickerConfig) {
                            if (fieldData.entityPickerConfig.gridConfig) {
                                fieldData.widgetAttributes['sit-picker-options'].gridConfig = getGridConfig(fieldData.entityPickerConfig.gridConfig, fieldData.entityPickerConfig.fields);
                            }
                            if (fieldData.entityPickerConfig.sortable) {
                                sortableFields = fieldData.entityPickerConfig.sortable.split(',');
                                sortableFields = sortableFields.map(function (fieldName) {
                                    return {
                                        field: fieldName,
                                        displayName: getTranslatedFieldLabel(fieldName, fieldData.entityPickerConfig.fields)
                                    };
                                });
                                fieldData.widgetAttributes['sit-picker-options'].sortInfo = {
                                    field: sortableFields[0].field,
                                    direction: 'asc',
                                    fields: sortableFields
                                }
                            }
                            fieldData.widgetAttributes['sit-placeholder'] = $translate.instant(fieldData.entityPickerConfig.placeholder);
                            fieldData.widgetAttributes['sit-picker-options'].quickSearchOptions.field = fieldData.entityPickerConfig.searchable;
                            fieldData.widgetAttributes['sit-picker-options'].enablePaging = fieldData.entityPickerConfig.enablePaging;
                            fieldData.widgetAttributes['sit-picker-options'].alwaysShowPager = fieldData.entityPickerConfig.enablePaging;
                            if (fieldData.entityPickerConfig.enableFilter) {
                                fieldData.widgetAttributes['sit-picker-options'].filterBarOptions = fieldData.entityPickerConfig.filterBarOptions;
                                fieldData.widgetAttributes['sit-picker-options'].filterOptions = fieldData.entityPickerConfig.filterFields;
                            }
                        }
                        if (fieldData.entityPickerConfig && fieldData.entityPickerConfig.filterFields && fieldData.entityPickerConfig.filterEnabled) {
                            getFilterSettingsFieldConfig(fieldData);
                        }
                    }
                    /**
                   * @ngdoc method
                    * @name ModelViewCtrl#initICVGridConf
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {string} cntName The content name
                    * @returns {object} An object with ICV/Grid initial conf info
                    * @description Init contents runtimeConf and selection callback for status context update
                    */
                    function initICVGridConf(cntName, isMaster, selectionMode, uniqueID) {
                        var uniqueUserPrefId = getUserPrefId(cntName);
                        var id = isMaster ? 'masterList' : 'detailList';
                        var icon;
                        var localConf = {
                            selectionMode: selectionMode,
                            containerID: id,
                            viewOptions: 'c',
                            viewMode: 'c',
                            uniqueID: uniqueID,
                            userPrefId: uniqueUserPrefId,
                            tagsManager: true,
                            onSelectionChangeCallback: function (items, item) {
                                runtimeContextRepository.contents[cntName].selectedItemsCount = items.length;
                                if (selectionMode === 'multi') {
                                    runtimeContextRepository.contents[cntName].selectedItems = items;
                                    runtimeContextRepository.contents[cntName].selectedItem = items.length > 0 ? items[items.length - 1] : undefined;
                                }
                                //asynch
                                if (item && item.selected === true) {
                                    runtimeContextRepository.contents[cntName].selectedItem = item;
                                    $rootScope.$broadcast('mdui-icv-item-selected');
                                } else if (item !== null && selectionMode !== 'multi') {
                                    runtimeContextRepository.contents[cntName].selectedItem = undefined;
                                }
                                if (item) {
                                    $rootScope.$broadcast('mdui-icv-item-changed', { 'selected': item.selected, 'item': item, 'items': items });
                                }
                                if (self[cntName].onContentSelection) { //bubble the event for template notification (e.g. details or toolbar refresh)
                                    self[cntName].onContentSelection(items, item);
                                }

                                //manager property mode sidepanel's open/close state
                                var isSidepanelOpen = mdContextSrv.getPropertyPanelState().isSidepanelOpen;
                                if (isSidepanelOpen) {
                                    ensureSidepanelVisibility();
                                }
                            }
                        };
                        if (screen.contents[cntName].blueprintSettings && screen.contents[cntName].blueprintSettings.image) {
                            icon = screen.contents[cntName].blueprintSettings.image;
                        } else {
                            icon = screen.icon;
                        }
                        getUpdatedWidgetConfig(localConf, icon);
                        if (screen.contents[cntName].blueprintSettings) { // add not 'tile' info to the runtimeConf
                            for (var opt in screen.contents[cntName].blueprintSettings) {
                                if (screen.contents[cntName].blueprintSettings.hasOwnProperty(opt) && opt !== "tileConfig") { //tileconfig is handled later
                                    localConf[opt] = screen.contents[cntName].blueprintSettings[opt]; //other property are added 'blindly'
                                }

                                if (opt === "serverSidePagination" && screen.contents[cntName].blueprintSettings[opt]) {
                                    var dataArtifact = null;
                                    var entityAppName = null;
                                    dataArtifact = getContentDataArtifact(screen.contents[cntName]);
                                    entityAppName = getContentEntityAppName(screen.contents[cntName]);
                                    if (screen.contents[cntName].master) { //to prevent default loading of detail content's serverSide ICV
                                        var query = mdContextSrv.interpolateQuery(screen.contents[cntName].query, null);
                                        localConf.serverDataOptions = {
                                            dataService: self[cntName],
                                            dataEntity: dataArtifact,
                                            appName: entityAppName || screen.appName,
                                            optionsString: query
                                        };
                                        if (screen.contents[cntName].fieldSources) {
                                            var fieldSources = screen.contents[cntName].fieldSources;
                                            localConf.serverDataOptions.fieldSources = mapFieldSources(fieldSources);
                                        }
                                    }
                                }
                                if (opt === "filterFields") {
                                    var isFilterPanel = screen.contents[cntName].blueprintSettings.isFilterPanel;
                                    screen.contents[cntName].blueprintSettings[opt].forEach(function (value) {
                                        if (value.fieldSource && screen.contents[cntName].blueprintSettings["serverSidePagination"]) {
                                            value.field = value.field.replace(value.fieldSource + '.', "");
                                        }
                                        if (value.type === "DateTimeOffset") {
                                            value.type = "date";
                                        }
                                        value.allowedCompareOperators = getMigratedOperators(value.allowedCompareOperators);
                                        if (!((value.dataSource.selectedEntity && value.dataSource.selectedEntity.name) ||
                                            (value.dataSource.readingFunction && value.dataSource.readingFunction.name))) {
                                            value.dataSource = {};
                                        }
                                        else {
                                            var swap = value.dataSource.valueProperty;
                                            value.dataSource.valueProperty = value.dataSource.displayProperty;
                                            value.dataSource.displayProperty = swap;
                                        }
                                        value = getFilterConfig(value, isFilterPanel);
                                        value.displayName = $translate.instant(value.displayName);
                                    });
                                }

                                if (screen.contents[cntName].entityRef && screen.contents[cntName].entityRef.entity) {
                                    var appName = getAppShortName(screen.contents[cntName].entityRef.app) || screen.appName;
                                    var entityName = '';
                                    if (screen.contents[cntName].rootEntity && screen.contents[cntName].rootEntity.name) {
                                        entityName = screen.contents[cntName].rootEntity.name;
                                        appName = screen.contents[cntName].rootEntity.app || appName;
                                    } else {
                                        entityName = screen.contents[cntName].entityRef.entity;
                                    }
                                    initTagsManager(localConf, appName, entityName);
                                    initExportManager(localConf, appName, entityName);
                                }
                                if (opt === "filterFields" && screen.contents[cntName].blueprintSettings.isFilterPanel) {
                                    localConf[opt] = {
                                        type: 'filterPanel',
                                        dataService: backendService,
                                        fields: screen.contents[cntName].blueprintSettings[opt]
                                    }
                                }

                                if (screen.contents[cntName].readingFunctionRef && screen.contents[cntName].readingFunctionRef.functionName) {
                                    var appName = getAppShortName(screen.contents[cntName].readingFunctionRef.app) || screen.appName;
                                    if (screen.contents[cntName].rootEntity) {
                                        var entity = screen.contents[cntName].rootEntity.name;
                                        initTagsManager(localConf, screen.contents[cntName].rootEntity.app || appName, entity);
                                        initExportManager(localConf, screen.contents[cntName].rootEntity.app || appName, entity);
                                    } else {
                                        var isReadingFunction = true;
                                        var readingFunctionName = screen.contents[cntName].readingFunctionRef.functionName;
                                        initTagsManager(localConf, appName, readingFunctionName, isReadingFunction);
                                    }

                                }
                            }
                        }
                        return localConf;
                    }

                    function initTagsManager(configuration, appName, entityName, isReadingFunction) {
                        if (!configuration.tagsManager) return;

                        if (typeof isReadingFunction !== 'undefined') {
                            configuration.tagsManagerOptions = {
                                appName: appName,
                                readingFunctionName: entityName
                            };
                        } else {
                            configuration.tagsManagerOptions = {
                                appName: appName,
                                entityName: entityName
                            };
                        }
                    }

                    function initExportManager(configuration, appName, entityName) {
                        if (!configuration.exportManager) return;

                        configuration.exportManagerOptions = {
                            appName: appName,
                            entityName: entityName
                        };
                    }

                    /* test-code */
                    self.__testonly__ = function () {
                        return { initExportManager: initExportManager };
                    };
                    /* end-test-code */

                    function getMigratedOperators(operators) {
                        var migratedOperators = [];
                        if (operators && operators.length > 0) {
                            for (var i = 0; i < operators.length; i++) {
                                if (operators[i] === "startsWith" || operators[i] === "endsWith") {
                                    migratedOperators[i] = operators[i];
                                }
                                else if (!(operators[i] === "Starts With" || operators[i] === "Ends With")) {
                                    migratedOperators[i] = operators[i].replace(/\s/g, '').toLowerCase();
                                } else {
                                    migratedOperators[i] = operators[i].charAt(0).toLowerCase() + operators[i].slice(1).replace(/\s/g, '');
                                }
                            }
                        }
                        return migratedOperators;
                    }
                    /**
                   * @ngdoc method
                   * @name ModelViewCtrl#evalSidepanelVisibility
                   * @access internal
                   * @module siemens.simaticit.common.services.modelDriven
                   * @param {object} sidepanelState Current sidepanel state
                   * @description Evaluates expression/function for managing the sidepanel visibility
                   * @returns {Boolean} Result of expression/function body evaluation.
                   */
                    function evalSidepanelVisibility(sidepanelState) {
                        if (!sidepanelState.show) {
                            return true;
                        }
                        if (sidepanelState.show.expression) {
                            return mdContextSrv.parseWithStateCtx(sidepanelState.show.expression);
                        }
                        else if (sidepanelState.show.body) {
                            var evaluation = mdContextSrv.evalFunctionWithStateCtx(sidepanelState.show.body);
                            if (typeof evaluation === "object" && evaluation !== null && typeof evaluation.then === "function") {
                                evaluation.then(function (outcome) {
                                    return outcome;
                                });
                            }
                            else {
                                return evaluation;
                            }
                        }
                    }


                    function addExtendedFields(prop) {
                        isExtended = true;
                        extensionId = prop.id;
                        if (prop.blueprintSettings && prop.blueprintSettings.gridConfig && prop.blueprintSettings.gridConfig.columnDefs) {
                            mapFieldsToGridConfig(prop.blueprintSettings.gridConfig, prop.properties);
                            prop.blueprintSettings.gridConfig.columnDefs.forEach(addFieldRuntimeConf, { confDataRepository: confDataRepository, contentName: contentName });
                        } else {
                            prop.properties.forEach(addFieldRuntimeConf, { confDataRepository: confDataRepository, contentName: contentName });
                        }
                    }

                    function getPropVisibility(visible) {
                        var isVisible = true;
                        if (typeof visible === "boolean") {
                            return visible;
                        }
                        if (visible && visible.expression) {
                            isVisible = mdContextSrv.parseWithStateCtx(visible.expression);
                            return isVisible;
                        }
                        if (visible && visible.body) {
                            var evaluation = mdContextSrv.evalFunctionWithStateCtx(visible.body);
                            if (typeof evaluation === "object" && evaluation !== null && typeof evaluation.then === "function") {
                                evaluation.then(function (outcome) {
                                    isVisible = outcome;
                                });
                            }
                            else {
                                isVisible = evaluation;
                            }
                            return isVisible;
                        }
                        return isVisible;
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#addFieldRuntimeConf
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {object} prop A valid md manifest content property object
                    * @description Init contents runtimeConf for property grid -> multiplicity one
                    */
                    function addFieldRuntimeConf(prop) {
                        if (prop.type && prop.type.length > 0) {
                            prop.type = prop.type.toLowerCase();
                        }
                        var isVisible = getPropVisibility(prop.visible);
                        confDataRepository.contents[contentName].runtimeConf.data.push({
                            "id": prop.name || prop.field,
                            "widget": prop.type !== 'boolean' ? "sit-label" : "sit-mdtoggle",
                            "disabled": true,
                            "visibilityLogic": prop.visible,
                            "invisible": !isVisible,
                            "isExtended": isExtended,
                            "extensionId": extensionId,
                            "label": (prop.label) ? $translate.instant(prop.label) : prop.name || $translate.instant(prop.displayName),
                            "dataType": prop.type,
                            "group": prop.group,
                            "fieldSource": prop.fieldSource
                        });
                        if (!confDataRepository.contents[contentName].runtimeConf.showGroups && prop.group !== undefined) {
                            confDataRepository.contents[contentName].runtimeConf.showGroups = true;
                        }
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#fillCmdBar
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {object} action A valid md manifest action object
                    * @description Add a command to the toolbar
                    */
                    function fillCmdBar(action) {
                        // Configure Action Handlers
                        var currDataService = null, content = contentName;
                        if (action.behavior.entityRef && action.behavior.entityRef.entity) { //navigation have no entity
                            currDataService = multiDataService[action.behavior.entityRef.entity]; // select correct dataProvider
                        } else if (action.behavior.readingFunctionRef && action.behavior.readingFunctionRef.functionName) { //navigation have no entity
                            currDataService = multiDataService[action.behavior.readingFunctionRef.functionName]; // select correct dataProvider
                        } else { //use current content entity
                            if (screen && contentName) {
                                if (screen.contents[contentName].entityRef && screen.contents[contentName].entityRef.entity) {
                                    currDataService = multiDataService[screen.contents[contentName].entityRef.entity];
                                } else if (screen.contents[contentName].readingFunctionRef && screen.contents[contentName].readingFunctionRef.functionName) {
                                    currDataService = multiDataService[screen.contents[contentName].readingFunctionRef.functionName];
                                }
                            }
                        }
                        //prepare a callback function
                        var btnCallback = function () {
                            var stateId = '', stateParams = {}, cmdParams = null, destScreen = '';
                            var isSidepanelOpen = mdContextSrv.getPropertyPanelState().isSidepanelOpen;
                            stateId = isSidepanelOpen ? $state.$current.parent.toString() : $state.$current.toString();

                            switch (action.behavior.type) {
                                case 'navigation':
                                    if (!action.behavior.destination || $state.get(action.behavior.destination) === null) {
                                        missingOverlayMessage();
                                        break;
                                    }
                                    stateParams = getEvaluatedStateParams(action.behavior.navigationParams);
                                    mdContextSrv.setPropertyPanelState(false, null);
                                    var params = $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)) : {};
                                    var tracking = params.tracking ? params.tracking : [];
                                    if (action.behavior.destination === stateId && tracking.length) {
                                        var index = tracking.length - 1;
                                        tracking[index].title = getStateTitle($state.get(stateId));
                                        tracking[index].master = { id: null };
                                        tracking[index].detail = { content: '', id: null };
                                        tracking[index].params = stateParams;
                                        tracking[index].params.isDrillDownState = true;
                                    } else {
                                        tracking = [];
                                    }
                                    performStateNavigation(action.behavior.destination, { 'mduiCtx': { 'stateParams': stateParams, 'tracking': tracking } }, { reload: true });
                                    break;
                                case 'drill-down':
                                    var contextInfo = runtimeContextRepository.contents[content];
                                    var selectedContextInfo = contextInfo && contextInfo.selectedItem ? contextInfo.selectedItem : {};
                                    destScreen = getDestinationScreen(action.behavior, selectedContextInfo);
                                    if (!destScreen || !destScreen.name || $state.get("home." + destScreen.name) === null) {
                                        missingOverlayMessage();
                                        break;
                                    }
                                    if (destScreen && destScreen.params) {
                                        stateParams = getEvaluatedStateParams(destScreen.params, selectedContextInfo);
                                    }
                                    mdContextSrv.setPropertyPanelState(false, null);
                                    if (self[content].onOpenClick && typeof self[content].onOpenClick === 'function' && destScreen.name) {
                                        self[content].onOpenClick(selectedContextInfo, destScreen.name, stateParams);
                                    }
                                    break;
                                case 'command':
                                case 'view':
                                    stateParams = getEvaluatedStateParams(action.params);
                                    var redirectingState = stateId + '.' + action.id;
                                    if ($state.$current.toString() !== redirectingState) {
                                        mdContextSrv.setPropertyPanelState(false, null);
                                    }
                                    mdContextSrv.isFromMduiParent = true;
                                    if (action.behavior.displayMode === 'inCanvas') {
                                        var warning = warningService.initCustomOverlayOnStateChange();
                                        warning.setIsViewAction(true);
                                        var params1 = $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)) : {};
                                        var index1 = params1.tracking && params1.tracking.length ? params1.tracking.length - 1 : 0;

                                        var latestTracking = breadcrumbService.getBreadcrumbChain();
                                        params1.tracking = latestTracking;

                                        mdContextSrv.selectedTabContentForInCanvas = mdContextSrv.getContextInfo().activeContent;
                                        if (latestTracking.length === 0) {
                                            md.loadModule(stateId).then(function (manifest) {
                                                var field = '';
                                                var currentScreen = manifest.states.filter(function (s) {
                                                    return s.id === stateId;
                                                })[0];
                                                if (!currentScreen) {
                                                    return field;
                                                }
                                                if (!currentScreen.contents) {
                                                    return field;
                                                }
                                                for (var name in currentScreen.contents) {
                                                    var currentContent = currentScreen.contents[name];
                                                    if (currentContent && currentContent.master && currentContent.blueprintSettings) {
                                                        field = currentContent.blueprintSettings.breadcrumbTitle || currentScreen.title;
                                                    }
                                                }
                                                var srcScreen = {
                                                    index: index1,
                                                    screenId: stateId,
                                                    title: getBreadCrumbDisplayTitle(stateId, field, true, {}),
                                                    master: { id: '' },
                                                    detail: { content: '', id: null },
                                                    params: params1.stateParams
                                                };
                                                params1.tracking[index1] = srcScreen;
                                                breadcrumbService.setBreadcrumbChain(params1.tracking);
                                                $state.go(stateId + '_' + action.id, stateParams);
                                            });
                                        } else {
                                            breadcrumbService.setBreadcrumbChain(params1.tracking);
                                            $state.go(stateId + '_' + action.id, stateParams);
                                        }
                                    } else {
                                        $state.go(stateId + '.' + action.id, stateParams);
                                    }
                                    break;
                                case 'confirm':
                                case 'automatic-command':
                                    if (action.behavior.commandRef) {
                                        cmdParams = mdContextSrv.prepareMethodParams(action.behavior.fields);
                                        //build command execution function
                                        var execute = function (showBusy) {
                                            hideOverlay();
                                            var outputParameters = cmdParams;
                                            isSidepanelOpen = mdContextSrv.getPropertyPanelState().isSidepanelOpen;
                                            if (showBusy) {
                                                busyService.show();
                                            }
                                            if (isSidepanelOpen) {
                                                mdContextSrv.setPropertyPanelState(false, null);
                                                $state.go('^');
                                            }
                                            var actionId = screen.id + '_' + action.id;
                                            currDataService[actionId](outputParameters, getAppShortName(action.behavior.commandRef.app) || applName).then(function (outcome) {
                                                var vCtrl = null;
                                                if (outcome) {
                                                    var onExit = action.behavior.onExit;
                                                    var isValidOnExit = onExit && onExit.refreshAndSelectContents && onExit.refreshAndSelectContents.length > 0;
                                                    if (isValidOnExit) {
                                                        vCtrl = mdContextSrv.getViewCtrl();
                                                        if (action.behavior.onExit.refreshContents) {
                                                            if (vCtrl) {
                                                                action.behavior.onExit.refreshContents.forEach(function (cntName) {
                                                                    if (vCtrl[cntName]) {
                                                                        vCtrl[cntName].refresh();
                                                                    }
                                                                });
                                                            }
                                                        }
                                                        else if (action.behavior.onExit.refreshAndSelectContents) {
                                                            if (vCtrl) {
                                                                //search for entity id
                                                                action.behavior.onExit.refreshAndSelectContents.forEach(function (item) {
                                                                    var cntName = item.content || item;
                                                                    if (vCtrl[cntName]) {
                                                                        if (outcome.id) {
                                                                            vCtrl[cntName].refreshAndSelect(outcome.id);
                                                                        } else if (outcome.ids && outcome.ids[cntName]) {
                                                                            vCtrl[cntName].refreshAndSelect(outcome.ids[cntName]);
                                                                        }
                                                                        else {
                                                                            vCtrl[cntName].refresh();
                                                                        }
                                                                    }
                                                                });
                                                                var eventParams = {
                                                                    event: 'onActionCompletion',
                                                                    eventSource: actionId,
                                                                    data: typeof outcome === "object" && (outcome.id || outcome.ids) ? outcome : null
                                                                };
                                                                $rootScope.$broadcast('mdui-context-refreshed', eventParams);
                                                            }
                                                        }
                                                        if (showBusy) {
                                                            busyService.hide();
                                                        }
                                                    }
                                                    else {
                                                        if (showBusy) {
                                                            busyService.hide();
                                                        }
                                                        mdContextSrv.setPropertyPanelState(false, null);
                                                        $state.go(stateId, {}, { reload: true });
                                                    }
                                                }
                                                else {
                                                    if (showBusy) {
                                                        busyService.hide();
                                                    }
                                                }
                                            }, backendService.backendError);
                                        };
                                        if (action.behavior.confirm) {
                                            var overlayButtons = function () {
                                                return [{
                                                    id: 'no',
                                                    displayName: $translate.instant(action.behavior.confirmNo) || $translate.instant('common.no'),
                                                    onClickCallback: hideOverlay
                                                },
                                                {
                                                    id: 'yes',
                                                    displayName: $translate.instant(action.behavior.confirmYes) || $translate.instant('common.yes'),
                                                    onClickCallback: execute
                                                }
                                                ];
                                            }
                                            $rootScope.globalOverlayData.title = $translate.instant(action.behavior.confirmTitle) || $translate.instant('common.confirmation');
                                            $rootScope.globalOverlayData.text = mdContextSrv.translateString(action.behavior.confirm);
                                            $rootScope.globalOverlayData.buttons = overlayButtons();
                                            overlayService.show('globalMsgOverlayId');
                                        }
                                        else {
                                            execute(true);
                                        }
                                    }
                                    break;
                                case 'reload':
                                    mdContextSrv.setPropertyPanelState(false, null);
                                    performStateNavigation(stateId, stateParams, { reload: true });
                                    break;
                                default:
                                    break;
                            }
                        };
                        // Add action to Command Bar

                        var command = {
                            type: (action.main) ? 'MainCommand' : 'Command',
                            name: "",
                            label: $translate.instant(action.title),
                            tooltip: $translate.instant(action.tooltip) || $translate.instant(action.title),
                            //                  showLogic: action.showExpression, // custom attribute...
                            onClickCallback: btnCallback,
                            isAuthorized: function () {
                                var destScreen = "";
                                if (action.behavior.type === 'drill-down') {
                                    destScreen = 'home.' + action.behavior.destination;
                                } else if (action.behavior.type === 'navigation') {
                                    destScreen = action.behavior.destination;
                                }
                                return !(destScreen && !UIAuthorization.isScreenAccessible(destScreen, md.allAvailableScreens));
                            }
                        };

                        getUpdatedWidgetConfig(command, action.icon);
                        if (action.behavior) {
                            if (action.behavior.commandRef) {
                                command.name = action.behavior.commandRef.command;
                                if (action.behavior.commandRef.fullName) {
                                    command.unauthorizedBehavior = 'hide';
                                    command.name = action.behavior.commandRef.fullName;
                                }
                                else {
                                    command.unauthorizedBehavior = 'hide';
                                }
                            }
                        }
                        if (command.name.length === 0) {
                            command.name = action.id;
                        }

                        if (action.show) {
                            if (action.show.expression) {
                                command["showLogic"] = action.show.expression;
                            }
                            else if (action.show.body) {
                                command["showLogicFunction"] = action.show.body;
                            }
                        } else if (action.showFunction) {
                            command["showLogicFunction"] = action.showFunction;
                        }

                        updateCommandBarData(commandBarData, action, command);
                    }

                    function updateCommandBarData(commandBarData, actionObj, commandObj) {
                        if (actionObj.group) {
                            var groupIndex = getGroupIndex(commandBarData.bar, actionObj.group);
                            if (groupIndex !== -1) {
                                commandBarData.bar[groupIndex].group.push(commandObj);
                            } else {
                                var groupObj = getActionGroupDetails(actionObj.group); //assuming the group exists
                                groupObj.type = 'Group';
                                groupObj.group = [];
                                groupObj.group.push(commandObj);
                                commandBarData.bar.push(groupObj);
                            }
                        } else {
                            commandBarData.bar.push(commandObj);
                        }
                    }

                    function getGroupIndex(commandBarData, groupName) {
                        var isGroupCreated = -1;
                        for (var i = 0; i < commandBarData.length; i++) {
                            if (commandBarData[i].name === groupName && commandBarData[i].type === 'Group') {
                                isGroupCreated = i;
                            }
                        }
                        return isGroupCreated;
                    }

                    function getActionGroupDetails(groupName) {
                        var groupInfo = {};
                        for (var i = 0; i < actionGroupsData.length; i++) {
                            if (actionGroupsData[i].name === groupName) {
                                groupInfo = actionGroupsData[i];
                                groupInfo.label = $translate.instant(groupInfo.label) || groupInfo.name;
                                getUpdatedWidgetConfig(groupInfo, groupInfo.icon);
                                break;
                            }
                        }
                        return groupInfo;
                    }

                    function hideOverlay() {
                        overlayService.hide();
                    }


                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#addNavigationFilter
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {string} query A valid oData query
                    * @param {object} navFilterObj The naviation params to be added
                    * @description Add navigation parameter to oData query
                    */
                    function checkIsFirstDetailContent(name, contents) {
                        var isFirstDetailContent = false;
                        var detailContents = [];
                        for (var content in contents) {
                            if (!contents[content].master) {
                                detailContents.push(contents[content]);
                            }
                        }
                        if (detailContents.length === 1) {
                            isFirstDetailContent = true;
                        } else if (detailContents.length > 1) {
                            detailContents.forEach(function (detailContent, index) {
                                if (name === detailContent.id && index === 0) {
                                    isFirstDetailContent = true;
                                }
                            });
                        }

                        return isFirstDetailContent;
                    }

                    function evalDisableTabs(contents, confDataRepository) {
                        var content = null;
                        var isFirstDetailContent = false;
                        if (contents) {
                            for (var name in contents) {
                                content = contents[name];
                                if (!content.master && content.disableWhen) {
                                    confDataRepository.contents[content.id].isDisabled = false;
                                    isFirstDetailContent = checkIsFirstDetailContent(content.id, contents);
                                    if (!isFirstDetailContent && content.disableWhen.expression) {
                                        confDataRepository.contents[content.id].isDisabled = mdContextSrv.parseWithStateCtx(content.disableWhen.expression);
                                    } else if (!isFirstDetailContent && content.disableWhen.body) {
                                        var evaluation = mdContextSrv.evalFunctionWithStateCtx(content.disableWhen.body);
                                        if (typeof evaluation === "object" && evaluation !== null && typeof evaluation.then === "function") {
                                            evaluation.then(function (outcome) {
                                                confDataRepository.contents[content.id].isDisabled = outcome;
                                            });
                                        }
                                        else {
                                            confDataRepository.contents[content.id].isDisabled = evaluation;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    self.evalDisableTabs = evalDisableTabs;

                    function refreshExtendedEntity(args) {
                        var retDef = $q.defer();
                        var applName = args.applName;
                        var extension = args.extension;
                        var name = args.contentName;
                        var isReadingFunction = false;
                        var dataService;
                        var dataTransformInfo = {};
                        var filter = "";

                        //get the dataSvc api for the entity/reading function
                        if (extension.entityRef && extension.entityRef.entity) {
                            dataService = multiDataService[extension.entityRef.entity];
                            applName = getAppShortName(extension.entityRef.app) || args.applName;
                        }
                        if (extension.readingFunctionRef && extension.readingFunctionRef.functionName) {
                            isReadingFunction = true;
                            dataService = multiDataService[extension.readingFunctionRef.functionName];
                            applName = getAppShortName(extension.readingFunctionRef.app) || args.applName;

                        }
                        //evaluate the query
                        if (extension.query) {
                            filter = extension.query;
                            filter = mdContextSrv.interpolateQuery(filter, null);
                        }
                        if (isReadingFunction && extension.readingFunctionRef.params) {
                            var interpolatedQuery = filter;
                            filter = {
                                query: interpolatedQuery,
                                params: getEvaluatedReadingFunctionParams(extension.readingFunctionRef.params)
                            }
                        }

                        if (extension.fieldSources) {
                            extension.fieldSources = Array.isArray(extension.fieldSources) ?
                                mapFieldSources(extension.fieldSources) : extension.fieldSources;

                            if (isReadingFunction && extension.readingFunctionRef.params) {
                                    filter.query = addExpandFacetsToQuery(filter.query);
                            }
                            else {
                                 filter = addExpandFacetsToQuery(filter);
                            }

                            dataTransformInfo = { facetKeys: {} };
                            _.forEach(Object.keys(extension.fieldSources), function (fieldSource) {
                                dataTransformInfo.facetKeys[fieldSource] = extension.fieldSources[fieldSource] ? {
                                    fullyQualifiedName: extension.fieldSources[fieldSource].name
                                } : '';
                            });
                        }

                        if (!dataService) {
                            return asyncFunc(true);
                        }
                        dataService.getAll(filter, applName, screen.layoutTemplate, dataTransformInfo).then(function (data) {
                            //asynch code
                            //reset selection ... of provide behavior conf
                            var parkData = null;
                            parkData = [];
                            if ((data) && (data.succeeded)) {
                                parkData = data.value;
                                //to set the context of base content with extended content
                                runtimeContextRepository.contents[name][extension.id] = parkData[0];
                            }
                            confDataRepository.contents[name].runtimeConf.data.forEach(function (dataField) {
                                if (dataField.isExtended && dataField.extensionId === extension.id) {
                                    var value = mdContextSrv.parseExpr(dataField.id, parkData[0]);
                                    if (dataField.dataType === 'datetime' || dataField.dataType === 'datetimeoffset') {
                                        dataField.value = $filter('date')(value, 'medium');
                                    } else {
                                        dataField.value = value;
                                    }
                                }
                            });
                            retDef.resolve();
                        });
                        return retDef.promise;
                    }

                    function refreshPropertyVisibility(contentName) {
                        confDataRepository.contents[contentName].runtimeConf.data.forEach(function (dataField) {
                            dataField.invisible = !getPropVisibility(dataField.visibilityLogic);
                        });
                    }

                    /**
                    * @ngdoc method
                    * @name ModelViewCtrl#createRunTimeAutomationObj
                    * @access internal
                    * @module siemens.simaticit.common.services.modelDriven
                    * @param {string} nameCont A content name
                    * @description Build content automation interface (refresh, refreshAndSelect, clear, onContentSelection)
                    */
                    function createRunTimeAutomationObj(nameCont) {
                        var content = screen.contents[nameCont], mdObj = self[nameCont];
                        var applName = "";
                        var detailsDataService;
                        var isReadingFunction = false;
                        if (content.entityRef && content.entityRef.entity) {
                            applName = getAppShortName(content.entityRef.app) || screen.appName;
                            detailsDataService = multiDataService[content.entityRef.entity]; // Master data management
                        }
                        else if (content.readingFunctionRef && content.readingFunctionRef.functionName) {
                            isReadingFunction = true;
                            applName = getAppShortName(content.readingFunctionRef.app) || screen.appName;
                            detailsDataService = multiDataService[content.readingFunctionRef.functionName];
                        }
                        if (content.fieldSources) {
                            content.fieldSources.forEach(function (fieldSource) {
                                var splitName = fieldSource.fullName.split(".");
                                splitName.splice(splitName.length - 1, 0, "ReadingModel");
                                fieldSource.fullName = splitName.join(".");
                            });
                        }
                        mdObj.refresh = function (isFirstLoad) {
                            if (screen.contents[nameCont].multiplicity === 'custom') {
                                return;
                            }

                            var blueprintSettings = screen.contents[nameCont].blueprintSettings;
                            if (screen.contents[nameCont].multiplicity == 'many' && blueprintSettings && blueprintSettings.serverSidePagination) {
                                var param = confDataRepository.params && confDataRepository.params[nameCont] ? confDataRepository.params[nameCont] : null;
                                refreshServerSideICV(nameCont, param, isFirstLoad);
                                return;
                            }
                            var retDef = $q.defer();
                            /* obsolete ... params are added to the content query
                            if (content.params) {
                                navigationFilter = {};
                                content.params.forEach(function (navParName) {
                                    if (viewStateParam[navParName] && viewStateParam[navParName] !== null) {
                                        navigationFilter[navParName] = viewStateParam[navParName];
                                    }
                                });
                            }*/
                            (function (detailsObj, name) {
                                var filter, newMode = false, transformedObj;

                                if ('auditTrail' === detailsObj.multiplicity) {
                                    if (detailsObj.auditTrailRefId) {
                                        var auditTrailRefId = mdContextSrv.parseWithStateCtx(detailsObj.auditTrailRefId);
                                        confDataRepository.contents[name].runtimeConf.filter.EntityId = auditTrailRefId;
                                        if (undefined !== confDataRepository.contents[name].runtimeConf.config.refreshData) {
                                            confDataRepository.contents[name].runtimeConf.config.refreshData();
                                        }
                                    }
                                    retDef.resolve();
                                    return;
                                }
                                if (detailsObj.fieldSources && detailsObj.fieldSources.length > 0) {
                                    detailsObj.query = addExpandFacetsToQuery(detailsObj.query);
                                    var fieldSources = detailsObj.fieldSources;
                                    transformedObj = { facetKeys: {} };
                                    fieldSources.forEach(function (fieldSource) {
                                        transformedObj.facetKeys[fieldSource.alias] = { "fullyQualifiedName": fieldSource.fullName, "type": fieldSource.type };
                                    });
                                }
                                if (detailsObj.query) {
                                    filter = detailsObj.query;
                                    filter = mdContextSrv.interpolateQuery(filter, null);
                                    newMode = true;
                                }
                                var isDBView = window.$UIF.Object.safeGet(confDataRepository.contents[name], 'entityRef.entity') &&
                                    window.$UIF.Object.safeGet(confDataRepository.contents[name], 'rootEntity.name');
                                if (confDataRepository.contents[name].multiplicity === "many" &&
                                    confDataRepository.contents[name].extensionRef && confDataRepository.contents[name].extensionRef.length > 0 && isDBView) {
                                    var icvExtensions = getExtensionsForBackendAPI(confDataRepository.contents[name]);
                                }
                                if (isReadingFunction && detailsObj.readingFunctionRef.params) {
                                    var interpolatedQuery = filter;
                                    filter = {
                                        query: interpolatedQuery,
                                        params: getEvaluatedReadingFunctionParams(detailsObj.readingFunctionRef.params)
                                    }
                                    if (confDataRepository.contents[name].multiplicity === "many" && confDataRepository.contents[name].extensionRef && confDataRepository.contents[name].extensionRef.length > 0) {
                                        filter.extensions = getExtensionsForBackendAPI(confDataRepository.contents[name]);
                                    }
                                }
                                detailsDataService.getAll(filter, applName, screen.layoutTemplate, transformedObj, null ,icvExtensions).then(function (data) {
                                    //asynch code
                                    //reset selection ... of provide behavior conf
                                    var parkData = null, i = 0, selectedData = null, extensionRefreshPromise = [];
                                    if (runtimeContextRepository.contents[nameCont] && runtimeContextRepository.contents[nameCont].selectedItem) {


                                        parkData = runtimeContextRepository.contents[nameCont].selectedItem;
                                        runtimeContextRepository.contents[nameCont].selectedItem = undefined;
                                        parkData.selected = false;
                                        //force uniqueID deselection
                                        if (confDataRepository.contents[nameCont].runtimeConf.selectAll) {
                                            confDataRepository.contents[nameCont].runtimeConf.selectAll(false);
                                        }
                                        if (typeof self[nameCont].onContentSelection === 'function') {
                                            self[nameCont].onContentSelection(undefined, parkData);
                                        }
                                    }

                                    parkData = [];
                                    if ((data) && (data.succeeded)) {
                                        parkData = data.value;
                                    }
                                    if (confDataRepository.params && confDataRepository.params[nameCont]) {
                                        for (i = 0; i < parkData.length; i++) {
                                            if (parkData[i].Id && parkData[i].Id === confDataRepository.params[nameCont]) {
                                                parkData[i].selected = true;
                                                selectedData = parkData[i];
                                                break;
                                            }
                                        }
                                    }

                                    confDataRepository.contents[name].runtimeData = parkData;
                                    if (selectedData) {
                                        runtimeContextRepository.contents[nameCont].selectedItem = selectedData;
                                        runtimeContextRepository.contents[nameCont].selectedItemsCount = selectedData.length;
                                    }
                                    if (typeof self[nameCont].onContentSelection === 'function') {
                                        self[nameCont].onContentSelection(undefined, selectedData);
                                    }
                                    if (confDataRepository.contents[name].multiplicity === "one") {
                                        //replicate data on runtimeConf for pg support
                                        confDataRepository.contents[name].runtimeConf.data.forEach(function (dataField) {
                                            var value;
                                            if (!dataField.isExtended) {
                                                if (dataField.fieldSource) {
                                                    var fieldid = dataField.id.replace(dataField.fieldSource + ".", "");
                                                    value = mdContextSrv.parseExpr(fieldid, parkData[0][dataField.fieldSource]);
                                                } else {
                                                    value = mdContextSrv.parseExpr(dataField.id, parkData[0]);
                                                }
                                                if (dataField.dataType === 'datetime' || dataField.dataType === 'datetimeoffset') {
                                                    dataField.value = $filter('date')(value, 'medium');
                                                } else {
                                                    dataField.value = value;
                                                }
                                            }
                                        });
                                        //to set the context for content of multiplicty one
                                        runtimeContextRepository.contents[nameCont] = parkData[0];
                                        if (confDataRepository.contents[name].extensionRef) {
                                            confDataRepository.contents[name].extensionRef.forEach(function (extension) {
                                                var args = { applName: applName, extension: extension, contentName: name };
                                                extensionRefreshPromise.push(refreshExtendedEntity(args));
                                            });
                                        }
                                    }

                                    $q.all(extensionRefreshPromise).then(function () {
                                        // evaluate the visibilty condition for multiplicty one properties
                                        if (confDataRepository.contents[name].multiplicity === "one") {
                                            refreshPropertyVisibility(name);
                                            if (typeof self[nameCont].onContentRefresh === 'function') {
                                                self[nameCont].onContentRefresh(undefined, selectedData);
                                            }
                                        }
                                        retDef.resolve();
                                    });
                                });
                            })(content, nameCont);
                            return retDef.promise;
                        };
                        mdObj.refreshAndSelect = function (identifier) {
                            if (confDataRepository.contents[nameCont].multiplicity === "one") {
                                var tempvCtrl = mdContextSrv.getViewCtrl();
                                if (tempvCtrl) {
                                    tempvCtrl[nameCont].refresh();
                                }
                            }

                            if (confDataRepository.params && confDataRepository.params[nameCont]) {
                                confDataRepository.params[nameCont] = null;
                            }

                            if (screen.contents[nameCont].multiplicity === 'custom') {
                                return;
                            }

                            var blueprintSettings = screen.contents[nameCont].blueprintSettings;
                            if (screen.contents[nameCont].multiplicity == 'many' && blueprintSettings && blueprintSettings.serverSidePagination) {
                                refreshServerSideICV(nameCont, identifier);
                                return;
                            }
                            var retDef = $q.defer();
                            /* obsolete ... params are added to the content query
                            if (content.params) {
                                navigationFilter = {};
                                content.params.forEach(function (navParName) {
                                    if (viewStateParam[navParName] && viewStateParam[navParName] !== null) {
                                        navigationFilter[navParName] = viewStateParam[navParName];
                                    }
                                });
                            } */
                            (function (detailsObj, name) {
                                var filter, newMode = false, transformedObj;

                                if ('auditTrail' === detailsObj.multiplicity) {
                                    if (detailsObj.auditTrailRefId) {
                                        var auditTrailRefId = mdContextSrv.parseWithStateCtx(detailsObj.auditTrailRefId);
                                        confDataRepository.contents[name].runtimeConf.filter.EntityId = auditTrailRefId;
                                        if (undefined !== confDataRepository.contents[name].runtimeConf.config.refreshData) {
                                            confDataRepository.contents[name].runtimeConf.config.refreshData();
                                        }
                                    }
                                    retDef.resolve();
                                    return;
                                }
                                if (detailsObj.fieldSources && detailsObj.fieldSources.length > 0) {
                                    detailsObj.query = addExpandFacetsToQuery(detailsObj.query);
                                    var fieldSources = detailsObj.fieldSources;
                                    transformedObj = { facetKeys: {} };
                                    fieldSources.forEach(function (fieldSource) {
                                        transformedObj.facetKeys[fieldSource.alias] = { "fullyQualifiedName": fieldSource.fullName, "type": fieldSource.type };
                                    });
                                }
                                if (detailsObj.query) {
                                    filter = detailsObj.query;
                                    filter = mdContextSrv.interpolateQuery(filter, null);
                                    newMode = true;
                                }
                                var isDBView = window.$UIF.Object.safeGet(confDataRepository.contents[name], 'entityRef.entity') &&
                                    window.$UIF.Object.safeGet(confDataRepository.contents[name], 'rootEntity.name');
                                if (confDataRepository.contents[name].multiplicity === "many" && confDataRepository.contents[name].extensionRef && confDataRepository.contents[name].extensionRef.length > 0 && isDBView) {
                                    var icvExtensions = getExtensionsForBackendAPI(confDataRepository.contents[name]);
                                }
                                if (isReadingFunction && detailsObj.readingFunctionRef.params) {
                                    var interpolatedQuery = filter;
                                    filter = {
                                        query: interpolatedQuery,
                                        params: getEvaluatedReadingFunctionParams(detailsObj.readingFunctionRef.params)
                                    }
                                    if (confDataRepository.contents[name].multiplicity === "many" && confDataRepository.contents[name].extensionRef && confDataRepository.contents[name].extensionRef.length > 0) {
                                        filter.extensions = getExtensionsForBackendAPI(confDataRepository.contents[name]);
                                    }
                                }
                                detailsDataService.getAll(filter, applName, screen.layoutTemplate, transformedObj, null ,icvExtensions).then(function (data) {
                                    //asynch code
                                    //reset selection ... of provide behavior conf
                                    var parkData = null, i = 0, selectedData = null;
                                    if (runtimeContextRepository.contents[nameCont] && runtimeContextRepository.contents[nameCont].selectedItem) {
                                        parkData = runtimeContextRepository.contents[nameCont].selectedItem;
                                        runtimeContextRepository.contents[nameCont].selectedItem = undefined;
                                        parkData.selected = false;
                                        //force uniqueID deselection
                                        if (confDataRepository.contents[nameCont].runtimeConf.selectAll) {
                                            confDataRepository.contents[nameCont].runtimeConf.selectAll(false);
                                        }
                                    }
                                    parkData = [];
                                    if ((data) && (data.succeeded)) {
                                        parkData = data.value;
                                    }

                                    if (identifier && Array.isArray(identifier)) {
                                        var tempObj = {}, selectedItemsCount = 0;
                                        selectedData = [];
                                        identifier.forEach(function (item) {
                                            tempObj[item] = item;
                                        });
                                        for (i = 0; i < parkData.length; i++) {
                                            if (parkData[i].Id && tempObj[parkData[i].Id] !== undefined) {
                                                parkData[i].selected = true;
                                                selectedData.push(parkData[i]);
                                                selectedItemsCount += 1;
                                                if (identifier.length === selectedItemsCount) {
                                                    runtimeContextRepository.contents[nameCont].selectedItems = selectedData;
                                                    runtimeContextRepository.contents[nameCont].selectedItem = selectedData[selectedItemsCount - 1];
                                                    runtimeContextRepository.contents[nameCont].selectedItemsCount = selectedData.length;
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (identifier) {
                                        for (i = 0; i < parkData.length; i++) {
                                            if (parkData[i].Id && parkData[i].Id === identifier) {
                                                parkData[i].selected = true;
                                                selectedData = parkData[i];
                                                runtimeContextRepository.contents[nameCont].selectedItem = selectedData;
                                                if (detailsObj.enableMultiSelection) {
                                                    runtimeContextRepository.contents[nameCont].selectedItems = [selectedData];
                                                }
                                                runtimeContextRepository.contents[nameCont].selectedItemsCount = 1;
                                                break;
                                            }
                                        }
                                    }
                                    confDataRepository.contents[name].runtimeData = parkData;
                                    if (typeof self[nameCont].onContentSelection === 'function') {
                                        self[nameCont].onContentSelection(undefined, selectedData);
                                    }
                                    if (confDataRepository.contents[name].multiplicity === "one") {
                                        //replicate data on runtimeConf for pg support
                                        confDataRepository.contents[name].runtimeConf.data.forEach(function (dataField) {
                                            var value;
                                            if (dataField.fieldSource) {
                                                var fieldid = dataField.id.replace(dataField.fieldSource + ".", "");
                                                value = mdContextSrv.parseExpr(fieldid, parkData[0][dataField.fieldSource]);
                                            } else {
                                                value = mdContextSrv.parseExpr(dataField.id, parkData[0]);
                                            }
                                            dataField.value = value;
                                        });
                                        refreshPropertyVisibility(name);
                                        if (typeof self[nameCont].onContentRefresh === 'function') {
                                            self[nameCont].onContentRefresh(undefined, selectedData);
                                        }
                                    }
                                    retDef.resolve();
                                });
                            })(content, nameCont);
                            return retDef.promise;
                        };
                        mdObj.clear = function () {
                            confDataRepository.contents[nameCont].runtimeData = [];
                            switch (confDataRepository.contents[nameCont].multiplicity) {
                                case 'one': {
                                    confDataRepository.contents[nameCont].runtimeConf.data.forEach(function (prop) {
                                        prop.value = "";
                                    });
                                    break;
                                }
                                case 'auditTrail': {
                                    confDataRepository.contents[nameCont].runtimeConf.filter.EntityId = '';
                                    break;
                                }
                                default: { //multiplicity:many
                                    if (confDataRepository.contents[nameCont].runtimeConf.selectAll) {
                                        confDataRepository.contents[nameCont].runtimeConf.selectAll(false);
                                    }
                                }
                            }
                        };
                        mdObj.onContentSelection = undefined;
                    }

                    //Constructor code
                    self['commandBars'] = []; //init command repository
                    //initialize conf and Data repository
                    confDataRepository["contents"] = {};
                    mdContextSrv.setContexInfo(runtimeContextRepository, viewStateParam, self); //update context service
                    for (var detailName in screen.contents) {
                        if (screen.contents.hasOwnProperty(detailName)) {
                            confDataRepository["contents"][detailName] = {};
                            runtimeContextRepository["contents"][detailName] = {};
                            //init with deep copy of content manifest info
                            angular.copy(screenData.contents[detailName], confDataRepository["contents"][detailName]);
                        }
                    }

                    //create serverside findAll apis
                    for (contentName in screen.contents) {
                        if (screen.contents[contentName].multiplicity === 'many' && screen.contents[contentName].blueprintSettings
                            && screen.contents[contentName].blueprintSettings.serverSidePagination) {
                            self[screen.contents[contentName].id] = {};
                            var isArchiving = screen.layoutTemplate === 'masterDetailsArchiving' || screen.layoutTemplate === 'singleEntityArchiving';
                            createFindAll(contentName, isArchiving);
                        }
                    }

                    //create contents configuration objects
                    for (contentName in screen.contents) {
                        if (screen.contents.hasOwnProperty(contentName)) {
                            if (screen.contents[contentName].multiplicity === "many") {
                                runtimeContextRepository.contents[contentName].selectedItem = null;
                                runtimeContextRepository.contents[contentName].selectedItemsCount = 0;
                                runtimeContextRepository.contents[contentName].selectedItems = [];
                                var selectionMode = 'single';
                                if (screen.contents[contentName].enableMultiSelection) {
                                    selectionMode = 'multi';
                                }
                                if (screen.contents[contentName].extensionRef) {
                                    mergeExtensionIcvConfig(screen.contents[contentName]);
                                }
                                parkConf = initICVGridConf(contentName, screen.contents[contentName].master, selectionMode, getUniqueId(screen.contents[contentName]));
                                if (screen.contents[contentName].blueprintSettings) {
                                    parkExtraConf = createExtraICVGridConf(contentName, screen.contents[contentName].properties, screen.contents[contentName].blueprintSettings);
                                }
                                else {
                                    parkExtraConf = createExtraICVGridConf(contentName, screen.contents[contentName].properties, null);
                                }
                                for (i = 0; i < newFields.length; i++) {
                                    if (parkExtraConf && parkExtraConf[newFields[i]]) {
                                        parkConf[newFields[i]] = parkExtraConf[newFields[i]];
                                    }
                                }
                                confDataRepository.contents[contentName].runtimeConf = parkConf;
                            }
                            else if (screen.contents[contentName].multiplicity === "one") {
                                runtimeContextRepository.contents[contentName] = null;
                                var layoutSettings = {};
                                isExtended = false;
                                extensionId = null;
                                if (screen.contents[contentName].blueprintSettings && screen.contents[contentName].blueprintSettings.layoutSettings) {
                                    layoutSettings = screen.contents[contentName].blueprintSettings.layoutSettings;
                                }
                                confDataRepository.contents[contentName].runtimeConf = {
                                    'layout': 'Horizontal',
                                    'type': layoutSettings.type || 'Fixed',
                                    'mode': 'list',
                                    'columns': layoutSettings.columns || 1,
                                    'data': [],
                                    'showGroups': false
                                };
                                if (screen.contents[contentName].blueprintSettings && screen.contents[contentName].blueprintSettings.gridConfig
                                    && screen.contents[contentName].blueprintSettings.gridConfig.columnDefs) {
                                    mapFieldsToGridConfig(screen.contents[contentName].blueprintSettings.gridConfig, screen.contents[contentName].properties);
                                    screen.contents[contentName].blueprintSettings.gridConfig.columnDefs.forEach(
                                        addFieldRuntimeConf, { confDataRepository: confDataRepository, contentName: contentName }
                                    );
                                } else {
                                    screen.contents[contentName].properties.forEach(
                                        addFieldRuntimeConf, { confDataRepository: confDataRepository, contentName: contentName }
                                    );
                                }
                                if (screen.contents[contentName].extensionRef && screen.contents[contentName].extensionRef.length > 0) {
                                    screen.contents[contentName].extensionRef.forEach(
                                        addExtendedFields, { confDataRepository: confDataRepository, contentName: contentName }
                                    );
                                }
                            }
                            else if ('auditTrail' === screen.contents[contentName].multiplicity) {
                                runtimeContextRepository.contents[contentName].selectedItem = null;
                                runtimeContextRepository.contents[contentName].selectedItems = null;
                                runtimeContextRepository.contents[contentName].selectedItemsCount = null;
                                confDataRepository.contents[contentName].runtimeConf = {
                                    filter: { EntityId: '' },
                                    startEmpty: false,
                                    config: {}
                                }
                            } else {
                                confDataRepository.contents[contentName].runtimeConf = {};
                            }
                        }
                    }

                    var masterContents = self.getMasterContentNames();
                    runtimeContextRepository.masterContent = masterContents[0];
                    if (screen.activeContent) {
                        runtimeContextRepository.activeContent = screen.activeContent;
                    }
                    else {
                        runtimeContextRepository.activeContent = masterContents[0];
                    }
                    //actions
                    commandBarData = {
                        barType: "Action",
                        bar: [],
                        refresh: function () {
                            this.bar.forEach(function (obj) {
                                if (obj.type === 'Group') {
                                    obj.group.forEach(function (cmd) {
                                       cmd.visibility = getButtonVisibility(cmd);
                                    });
                                } else {
                                    obj.visibility = getButtonVisibility(obj);
                                }
                            });
                        }
                    };
                    self['commandBars'].push(commandBarData);
                    for (contentName in screen.contents) {
                        if (screen.contents[contentName].actions) {
                            screen.contents[contentName].actions.forEach(fillCmdBar);
                        }
                    }
                    if (commandBarData.bar.length > 0) {
                        commandBarData.bar.reverse();
                    }
                    //create runtime automation content objects
                    for (contentName in screen.contents) {
                        if (screen.contents.hasOwnProperty(contentName)) {
                            if (self[screen.contents[contentName].id] === undefined) {
                                self[screen.contents[contentName].id] = {};
                            }
                            createRunTimeAutomationObj(screen.contents[contentName].id);
                        }
                    }

                    function getButtonVisibility(commandObj) {
                        var visibility, evaluation;
                        if (!commandObj.isAuthorized()) {
                            visibility = false;
                        } else if (commandObj.showLogic) {
                            try {
                                visibility = mdContextSrv.parseWithStateCtx(commandObj.showLogic);
                            }
                            catch (e) {
                                // continue regardless of error
                            }
                        } else if (commandObj.showLogicFunction) {
                            try {
                                evaluation = mdContextSrv.evalFunctionWithStateCtx(commandObj.showLogicFunction);
                                if (typeof evaluation === "object" && evaluation !== null && typeof evaluation.then === "function") {
                                    evaluation.then(function (outcome) {
                                        visibility = outcome;
                                    });
                                }
                                else {
                                    visibility = evaluation;
                                }
                            }
                            catch (e) {
                                // continue regardless of error
                            }
                        } else {
                            visibility = true;
                        }
                        return visibility;
                    }


                    function combineQueryOptions(key, queryOptions) {
                        var keyInstances = [];
                        queryOptions.forEach(function (item, index) {
                            if (item.indexOf(key) === 0) {
                                keyInstances.push(index);
                            }
                        });
                        var combinedQuery = queryOptions[keyInstances[0]];
                        if (keyInstances.length > 1) {
                            if (key === '$filter') {
                                for (var index = 1; index < keyInstances.length; index++) {
                                    var conditionToBeAppended = queryOptions[keyInstances[index]].substring(queryOptions[keyInstances[index]].indexOf('=') + 1);
                                    combinedQuery = combinedQuery + ' and (' + conditionToBeAppended + ')';
                                }
                            }
                        }
                        return combinedQuery;
                    }

                    function createFindAll(contentName, isArchiving) {
                        var serverApiObj = self[contentName];
                        serverApiObj.findAll = function (icvServerConfig) {
                            var defer = $q.defer();
                            var options = [];
                            var combinedQueryList = [];
                            if (icvServerConfig.options && typeof (icvServerConfig.options) === 'string') {
                                var keyList = [];
                                options = icvServerConfig.options.split('&');
                                options.forEach(function (key, index) {
                                    var keyName = key.substring(0, key.indexOf('='));
                                    if (keyList.indexOf(keyName) === -1) {
                                        combinedQueryList.push(combineQueryOptions(keyName, options));
                                        keyList.push(keyName);
                                    }
                                });
                                icvServerConfig.options = combinedQueryList.join('&');
                            }

                            var backendSvcMethodToCall = isArchiving ? 'findAllArchiving' : 'findAll';

                            var backendSvcMethodParams = {
                                appName: icvServerConfig.appName,
                                entityName: icvServerConfig.entityName,
                                options: icvServerConfig.options,
                                facetInfo: icvServerConfig.facetInfo,
                                dataTransformInfo: icvServerConfig.dataTransformInfo
                            };
                            if (window.$UIF.Object.safeGet(screen.contents[contentName], 'entityRef.entity') &&
                                window.$UIF.Object.safeGet(screen.contents[contentName], 'rootEntity.name')) {
                                backendSvcMethodParams.extensions = getExtensionsForBackendAPI(screen.contents[contentName]);
                            }
                            if (isReadingFunctionContent(screen.contents[contentName])) {
                                backendSvcMethodToCall = 'read';
                                var readingFunctionParams = {};
                                readingFunctionParams = getEvaluatedReadingFunctionParams(screen.contents[contentName].readingFunctionRef.params);
                                if (typeof readingFunctionParams === 'string') {
                                    readingFunctionParams = JSON.parse(readingFunctionParams);
                                }
                                backendSvcMethodParams = {
                                    appName: icvServerConfig.appName,
                                    functionName: icvServerConfig.entityName,
                                    params: readingFunctionParams,
                                    options: icvServerConfig.options
                                };
                                if (screen.contents[contentName].extensionRef && screen.contents[contentName].extensionRef.length > 0) {
                                    backendSvcMethodParams.extensions = getExtensionsForBackendAPI(screen.contents[contentName]);
                                }
                            }
                            backendService[backendSvcMethodToCall](backendSvcMethodParams).then(function (data) {
                                if (data && data.value) {
                                    $timeout(function () {
                                        var contextInfo = runtimeContextRepository.contents && runtimeContextRepository.contents[contentName] ?
                                            angular.copy(runtimeContextRepository.contents[contentName]) : null;
                                        if (contextInfo && (contextInfo.selectedItem || (contextInfo.selectedItems && contextInfo.selectedItems.length > 0)) &&
                                            confDataRepository.contents[contentName].runtimeConf.selectItems !== undefined &&
                                            typeof confDataRepository.contents[contentName].runtimeConf.selectItems === 'function') {
                                            if (confDataRepository.contents[contentName].runtimeConf.selectionMode === 'multi') {
                                                confDataRepository.contents[contentName].runtimeConf.selectItems(contextInfo.selectedItems, true, true);
                                            } else {
                                                confDataRepository.contents[contentName].runtimeConf.selectItems([contextInfo.selectedItem], true, true);
                                            }
                                        } else if (confDataRepository.contents[contentName].runtimeConf.selectAll !== undefined &&
                                            typeof confDataRepository.contents[contentName].runtimeConf.selectAll === 'function') {
                                            confDataRepository.contents[contentName].runtimeConf.selectAll(false);
                                        }
                                    }, 750);
                                }
                                defer.resolve(data);
                            }, function (reject) {
                                defer.reject(reject);
                            });
                            return defer.promise;
                        }
                    }

                    self.initBreadcrumb = function () {
                        var chain = mdContextSrv.getBreadCrumbChain();
                        if (chain) {
                            breadcrumbService.setBreadcrumbChain(chain);
                        }
                        return chain;
                    }

                    self.getBreadcrumbChain = getBreadcrumbChain;

                    self.interpolateQuery = function (query) {
                        var contentQuery = mdContextSrv.interpolateQuery(query);
                        return contentQuery;
                    }

                    self.getInterpolatedValue = getInterpolatedValue;

                    self.getContentDataArtifact = function (content) {
                        return getContentDataArtifact(content);
                    }
                    self.getContentEntityAppName = function (content) {
                        return getContentEntityAppName(content);
                    }
                    self.isReadingFunctionContent = function (content) {
                        return isReadingFunctionContent(content);
                    }
                    self.getEvaluatedReadingFunctionParams = function (params) {
                        return getEvaluatedReadingFunctionParams(params);
                    }

                    function refreshServerSideICV(content, selectItem, isFirstLoad) {
                        if (selectItem) {
                            //clears the selection of items if selectAll on grid was clicked
                            resetSelectAll(confDataRepository, content, runtimeContextRepository.contents[content].selectedItemsCount);
                            var optionString, query, dataTransformObject;
                            optionString = getFilterSelectQuery(selectItem);
                            if (confDataRepository.contents[content] && confDataRepository.contents[content].query) {
                                var interpolatedQuery = mdContextSrv.interpolateQuery(confDataRepository.contents[content].query, null);
                                var concatenatedQuery = interpolatedQuery + '&' + optionString;
                                var options = [];
                                var combinedQueryList = [];
                                var keyList = [];
                                options = concatenatedQuery.split('&');
                                options.forEach(function (key, index) {
                                    var keyName = key.substring(0, key.indexOf('='));
                                    if (keyList.indexOf(keyName) === -1) {
                                        combinedQueryList.push(combineQueryOptions(keyName, options));
                                        keyList.push(keyName);
                                    }
                                });
                                query = combinedQueryList.join('&');
                            } else {
                                query = optionString;
                            }

                            var fieldSources = [];
                            // if any fieldSources (facets) exist with the base content, consider them as part of query
                            if (confDataRepository.contents[content].fieldSources) {
                                fieldSources = fieldSources.concat(confDataRepository.contents[content].fieldSources);
                            }

                            // consider facets from extensions. facets information will be possible for ...
                            // ... entity - always
                            // ... dbview and reading function, only if valid rootEntity defined, in this case extensions backendSvcMethodParams.extensions will take care.

                            // are there any extensions available and the content is of type entity?
                            // entity type will have valid entity ref, rootEntity will be empty
                            // dbview and reading function type will not have valid entity, if defined will have only valid rootEntity
                            if (confDataRepository.contents[content].extensionRef &&
                                window.$UIF.Object.safeGet(confDataRepository.contents[content], 'entityRef.entity') &&
                                !window.$UIF.Object.safeGet(confDataRepository.contents[content], 'rootEntity.name')) {
                                confDataRepository.contents[content].extensionRef.forEach(function (extension) {
                                    fieldSources = fieldSources.concat(extension.fieldSources);
                                });
                            }

                            if (fieldSources.length > 0) {
                                query = addExpandFacetsToQuery(query);
                                dataTransformObject = setDataTranformInfo(fieldSources);
                            }

                            var backendSvcMethodToCall = 'findAll';
                            var backendSvcMethodParams = {};
                            if (isReadingFunctionContent(screen.contents[content])) {
                                backendSvcMethodToCall = 'read';
                                var readingFunctionParams = getEvaluatedReadingFunctionParams(screen.contents[content].readingFunctionRef.params);
                                readingFunctionParams = JSON.parse(readingFunctionParams);
                                backendSvcMethodParams = {
                                    appName: screen.contents[content].readingFunctionRef && getAppShortName(screen.contents[content].readingFunctionRef.app) || applName,
                                    functionName: screen.contents[content].readingFunctionRef.functionName,
                                    params: readingFunctionParams, options: query
                                };
                                if (screen.contents[content].extensionRef && screen.contents[content].extensionRef.length > 0) {
                                    backendSvcMethodParams.extensions = getExtensionsForBackendAPI(screen.contents[content]);
                                }
                            } else {
                                backendSvcMethodParams = {
                                    appName: screen.contents[content].entityRef && getAppShortName(screen.contents[content].entityRef.app) || applName,
                                    entityName: screen.contents[content].entityRef.entity,
                                    options: query
                                };
                                if (window.$UIF.Object.safeGet(screen.contents[content], 'entityRef.entity') &&
                                    window.$UIF.Object.safeGet(screen.contents[content], 'rootEntity.name')) {
                                    backendSvcMethodParams.extensions = getExtensionsForBackendAPI(screen.contents[content]);
                                }
                            }

                            backendSvcMethodParams.dataTransformInfo = dataTransformObject;

                            backendService[backendSvcMethodToCall](backendSvcMethodParams).then(function (data) {
                                var selectedItem, selectedItems = [];
                                if (data && data.value) {
                                    data.value.forEach(function (item, index) {
                                        item.selected = true;
                                        selectedItems.push(item);
                                        if (index + 1 === data.value.length) {
                                            selectedItem = item;
                                        }
                                    });
                                }
                                runtimeContextRepository.contents[content].selectedItem = selectedItem;
                                runtimeContextRepository.contents[content].selectedItemsCount = selectedItems.length;
                                if (confDataRepository.contents[content].runtimeConf.selectionMode === 'multi') {
                                    runtimeContextRepository.contents[content].selectedItems = selectedItems;
                                }
                                if (typeof self[content].onContentSelection === 'function') {
                                    self[content].onContentSelection(runtimeContextRepository.contents[content].selectedItems, selectedItem);
                                }
                                refreshIcv(confDataRepository.contents[content].runtimeConf, isFirstLoad);
                            });
                        } else if (confDataRepository.contents[content].runtimeConf.refresh !== undefined
                            && typeof confDataRepository.contents[content].runtimeConf.refresh === "function") {
                            if (runtimeContextRepository.contents[content].selectedItem) {
                                runtimeContextRepository.contents[content].selectedItem = undefined;
                                runtimeContextRepository.contents[content].selectedItemsCount = 0;
                            }
                            if (confDataRepository.contents[content].runtimeConf.selectionMode === 'multi') {
                                runtimeContextRepository.contents[content].selectedItems = [];
                            }
                            if (typeof self[content].onContentSelection === 'function') {
                                self[content].onContentSelection(undefined, undefined);
                            }
                            refreshIcv(confDataRepository.contents[content].runtimeConf, isFirstLoad);
                        }
                    }

                    function setDataTranformInfo(fieldSources) {
                        var dataTransformInfo = {};

                        if (fieldSources) {
                            fieldSources = Array.isArray(fieldSources) ?
                                mapFieldSources(fieldSources) : fieldSources;

                            dataTransformInfo = { facetKeys: {} };

                            _.forEach(Object.keys(fieldSources), function (fieldSource) {
                                dataTransformInfo.facetKeys[fieldSource] = fieldSources[fieldSource] ? {
                                    fullyQualifiedName: fieldSources[fieldSource].name,
                                    type: fieldSources[fieldSource].type
                                } : '';
                            });
                        }

                        return dataTransformInfo;
                    }

                    self.getStateInfo = getStateInfo;

                    //exposing the method to perform state navigation when the breadcrumb is clicked
                    self.goToPreviousLevel = goToPreviousLevel;

                    self.performDrillDown = performDrillDown;

                    self.getBreadCrumbDisplayTitle = getBreadCrumbDisplayTitle;
                };

                function getAppShortName(fullName) {
                    var wordsArray = fullName && fullName.split('.');
                    if (wordsArray && wordsArray.length >= 3) {
                        return wordsArray[2];
                    }
                    return fullName;
                }

                function refreshIcv(icvConfig, isFirstLoad) {
                    var sortInfo;
                    var userSortInfoConfig = angular.copy(icvConfig.sortInfo);

                    //capture sortinfo before refreshing
                    if (icvConfig.getSortInfo && typeof icvConfig.getSortInfo === 'function') {
                        sortInfo = icvConfig.getSortInfo();
                        if (sortInfo.field && sortInfo.direction && icvConfig.sortInfo) {
                            icvConfig.sortInfo.field = sortInfo.field;
                            icvConfig.sortInfo.direction = sortInfo.direction;
                            icvConfig.sortInfo.fieldSource = sortInfo.fieldSource;
                        }
                    }

                    if (icvConfig.refresh && typeof icvConfig.refresh === 'function' && !isFirstLoad) icvConfig.refresh(true);
                    icvConfig.sortInfo = userSortInfoConfig;
                }

                function getStateInfo(currentStateId) {
                    var result;
                    var tracking = $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)).tracking : [];
                    for (var i = tracking.length - 1; i >= 0; i--) {
                        if (tracking[i].screenId === currentStateId) {
                            result = tracking[i];
                            break;
                        }
                    }
                    return result;
                }

                function getBreadcrumbChain() {
                    return mdContextSrv.getBreadCrumbChain() || [];
                }

                this.initCustomAction = function () {
                    var result = null;
                    try {
                        if (mdContextSrv.isFromMduiParent) {
                            sessionStorage.storeContext = JSON.stringify(mdContextSrv.getContextInfo());
                            sessionStorage.currentContext = JSON.stringify(mdContextSrv.currentContext);
                            sessionStorage.storeMdState = JSON.stringify(mdContextSrv.MDState);
                            sessionStorage.selectedTabContentForInCanvas = mdContextSrv.selectedTabContentForInCanvas;
                            sessionStorage.breadCrumb = JSON.stringify(breadcrumbService.getBreadcrumbChain());
                        } else {
                            mdContextSrv.setContexInfo(JSON.parse(sessionStorage.storeContext));
                            mdContextSrv.currentContext = JSON.parse(sessionStorage.currentContext);
                            mdContextSrv.MDState = JSON.parse(sessionStorage.storeMdState);
                            mdContextSrv.selectedTabContentForInCanvas = sessionStorage.selectedTabContentForInCanvas;
                            breadcrumbService.setBreadcrumbChain(JSON.parse(sessionStorage.breadCrumb));
                        }
                        result = { 'onExit': onCustomActionExit };
                    } catch (ex) {
                        result = null;
                    }
                    return result;
                }

                function onCustomActionExit(identifier) {
                    var stateId = $state.$current.parent.toString();
                    var actionName = $state.$current.toString().replace(stateId + '.', '');
                    var action = null, content = null, vCtrl = null, screen = null;
                    md.loadModule(stateId).then(function (manifest) {
                        screen = manifest.states.filter(function (s) { return s.id === stateId; })[0];
                        if (screen.type === "drill-down" && screen.referenceState) {
                            screen = manifest.states.filter(function (s) {
                                return s.id === screen.referenceState;
                            })[0];
                        }
                        //search for action obj
                        function initAndSearchAction(elem) {
                            if (elem.id === this.act) {
                                action = elem;
                            }
                        }
                        for (content in screen.contents) {
                            if (screen.contents[content].actions) {
                                screen.contents[content].actions.some(initAndSearchAction, { act: actionName });
                            }
                        }

                        if (action && action.behavior) {
                            if (mdContextSrv.MDState) { //previous status info available
                                if (action.behavior.onExit) {
                                    vCtrl = mdContextSrv.getViewCtrl();
                                    if (action.behavior.onExit.refreshAndSelectContents) {
                                        if (vCtrl) {
                                            action.behavior.onExit.refreshAndSelectContents.forEach(function (item) {
                                                var cntName = item.content || item;
                                                if (vCtrl[cntName]) {
                                                    if (!identifier) {
                                                        vCtrl[cntName].refresh();
                                                    }
                                                    else {
                                                        if (typeof identifier === 'object' && identifier[cntName]) {
                                                            vCtrl[cntName].refreshAndSelect(identifier[cntName]);
                                                        } else {
                                                            vCtrl[cntName].refreshAndSelect(identifier);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        $state.go(mdContextSrv.MDState.previousState, mdContextSrv.MDState.previousData);
                                    }
                                }
                                else {
                                    $state.go(mdContextSrv.MDState.previousState, mdContextSrv.MDState.previousData, { reload: true });
                                }
                            } else {
                                $state.go('^', {}, { reload: true });
                            }
                        } else {
                            $state.go('^', {}, { reload: true });
                        }
                    }, function () {
                        $state.go('^', {}, { reload: true });
                    });
                }

                function getUpdatedWidgetConfig(configObj, icon) {
                    try {
                        if (icon.indexOf('.svg') !== -1) {
                            configObj.svgIcon = icon;
                        } else if (icon.indexOf('svg ') !== -1) {
                            var svgIcon = icon.slice(4); //removes 'svg '
                            configObj.svgIcon = 'common/icons/' + svgIcon + '.svg';
                        } else {
                            configObj.image = icon;
                        }
                    }
                    catch (e) {
                        configObj.image = '';
                    }
                }

                function asyncFunc(isResolve, response) {
                    var defer = $q.defer();
                    $timeout(function () {
                        if (isResolve) {
                            response ? defer.resolve(response) : defer.resolve();
                        } else {
                            response ? defer.reject(response) : defer.reject();
                        }
                    }, 100)
                    return defer.promise;
                }

                function getCustomContentApiList(screen, contentName) {
                    var apiList = {};
                    apiList.getContext = function () {
                        return angular.copy(mdContextSrv.getContextInfo());
                    };

                    apiList.setContext = function (selectedItem) {
                        mdContextSrv.setContentContext(contentName, selectedItem);
                        $rootScope.$broadcast('mdui-context-updated');
                    };

                    apiList.getData = function (options) {
                        var dataSvc, filter, content, applName, isReadingFunction = false;
                        var deffered = $q.defer();
                        content = screen.contents[contentName];
                       

                        //get the service end points
                        if (content.entityRef && content.entityRef.entity) {
                            dataSvc = multiDataService[content.entityRef.entity];
                            applName = getAppShortName(content.entityRef.app) || screen.appName;
                        } else if (content.readingFunctionRef && content.readingFunctionRef.functionName) {
                            applName = getAppShortName(content.readingFunctionRef.app) || screen.appName;
                            dataSvc = multiDataService[content.readingFunctionRef.functionName];
                            isReadingFunction = true;
                        } else {
                            var error = 'Entity or Reading Function is not configured.'
                            return asyncFunc(false, error);
                        }

                        //interpolate the query
                        if (options) {
                            filter = mdContextSrv.interpolateQuery(options, null);
                        }
                        if (screen.contents[contentName].query && !options) {
                            filter = screen.contents[contentName].query;
                            filter = mdContextSrv.interpolateQuery(filter, null);
                        }
                        if (isReadingFunction && screen.contents[contentName].readingFunctionRef.params) {
                            var interpolatedQuery = filter;
                            filter = {
                                query: interpolatedQuery,
                                params: getEvaluatedReadingFunctionParams(screen.contents[contentName].readingFunctionRef.params)
                            }
                        }

                        //perform the call
                        dataSvc.getAll(filter, applName, screen.layoutTemplate).then(function (data) {
                            var parkData = [];
                            if ((data) && (data.succeeded)) {
                                parkData = data.value;
                            }
                            deffered.resolve(parkData);
                        });
                        return deffered.promise;
                    };

                    return apiList;
                }

                this.initCustomContent = function (name) {
                    var error = 'Invalid Custom Content';
                    var defer = $q.defer();
                    if (!name) {
                        return asyncFunc(false, error);
                    }
                    var contentName = name;
                    var stateId = $state.$current.toString();
                    md.loadModule(stateId).then(function (manifest) {
                        var screen = manifest.states.filter(function (s) {
                            return s.id === stateId;
                        })[0];
                        if (screen.type === "drill-down" && screen.referenceState) {
                            screen = manifest.states.filter(function (s) {
                                return s.id === screen.referenceState;
                            })[0];
                        }
                        if (screen && screen.contents[contentName] && screen.contents[contentName].multiplicity === 'custom') {
                            //create the apis
                            var apiList = getCustomContentApiList(screen, contentName);
                            defer.resolve(apiList);
                        } else {
                            defer.reject(error);
                        }
                    });
                    return defer.promise;
                }

                //gets the breadcrumb title for the destination screen drill-downed from custom screen
                function getCustomDrillDownBreadcrumbTitle(destScreen, item) {
                    var title = getStateTitle(destScreen);
                    var field;
                    var useScreenTitle;
                    if (!destScreen || !item) {
                        return title;
                    }
                    var moduleInfo = md.getCurrentModuleInfo(destScreen.name) || {};
                    if (!moduleInfo.states) {
                        return title;
                    }
                    var currentScreen = moduleInfo.states.filter(function (s) {
                        return s.id === destScreen.name;
                    })[0];
                    if (!currentScreen) {
                        return title;
                    }
                    if (!currentScreen.contents) {
                        return title;
                    }
                    for (var name in currentScreen.contents) {
                        var content = currentScreen.contents[name];
                        if (content && content.master && content.blueprintSettings) {
                            field = content.blueprintSettings.breadcrumbTitle || '';
                            useScreenTitle = content.blueprintSettings.useScreenTitleInBreadcrumb;
                        }
                    }
                    if (!field) {
                        return title;
                    }
                    if (item[field]) {
                        title = useScreenTitle ? title + ' (' + item[field] + ')' : item[field];
                    }
                    return title;
                }

                //api to set the breadcrumb title for custom screen drill-downed from MDUI Screen
                function setCustomDrillDownBreadcrumbTitle(title) {
                    if (!title) {
                        return;
                    }
                    var sourceScreen = angular.copy($state.$current.self);
                    if (sourceScreen.views && !sourceScreen.views['Canvas@']) {
                        sourceScreen = angular.copy($state.$current.parent.self);
                    }
                    var chain = breadcrumbService.getBreadcrumbChain() || [];
                    if (!chain.length) {
                        return;
                    }
                    for (var i = chain.length - 1; i >= 0; i--) {
                        if (chain[i].screenId === sourceScreen.name) {
                            chain[i].title = title;
                            break;
                        }
                    }
                    breadcrumbService.setBreadcrumbChain(chain);
                }

                //api to perform drill down from Custom screen to MDUI screen
                function performCustomDrillDown(item, destinationInfo, srcBreadcrumbTitle, contextInfo) {
                    if (!item || !destinationInfo) {
                        return 'Invalid parameters. Unable to do the custom drill down.';
                    }
                    destinationInfo.params['isDrillDownState'] = true;
                    destinationInfo.screenId = 'home.' + destinationInfo.screenId;
                    var sourceScreen = angular.copy($state.$current.self);
                    if (sourceScreen.views && !sourceScreen.views['Canvas@']) {
                        sourceScreen = angular.copy($state.$current.parent.self);
                    }
                    var sourceInfo = {
                        screenId: sourceScreen.name,
                        breadCrumbTitle: srcBreadcrumbTitle,
                        selectionInfo: {
                            master: { id: item.Id }
                        }
                    };

                    if (contextInfo) {
                        sourceInfo.selectionInfo.contextInfo = contextInfo;
                    }
                    destinationInfo.breadCrumbTitle = getCustomDrillDownBreadcrumbTitle(destinationInfo.screenId, item);
                    performDrillDown(sourceInfo, destinationInfo, item);
                }

                // api to get the info related to drill down selection and breadcrumb items
                function getCustomDrillDownInfo(stateName) {
                    var drillDownInfo = {
                        selection: {},
                        breadcrumbList: []
                    };
                    if (!stateName) {
                        return drillDownInfo;
                    }
                    var ctx = $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)) : {};
                    if (ctx.tracking) {
                        drillDownInfo.breadcrumbList = ctx.tracking;
                        drillDownInfo.selection = getStateInfo(stateName) || {};
                    }
                    return drillDownInfo;
                }

                function goToPreviousLevel(item) {
                    var ctx = $stateParams.mduiCtx ? JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)) : {};
                    ctx.tracking.length = item.index + 1;
                    breadcrumbService.setBreadcrumbChain(ctx.tracking);
                    performStateNavigation(item.screenId, { mduiCtx: { stateParams: item.params, tracking: ctx.tracking } }, { reload: true });
                }

                //exposes the required apis to achieve drill down to/fro custom screens
                this.initCustomDrillDown = function () {
                    var ctx = JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx));
                    $timeout(function () {
                        navigationManagementService.setQueryString($stateParams);
                    }, 0, false);
                    if (ctx.tracking) {
                        breadcrumbService.setBreadcrumbChain(ctx.tracking);
                    }
                    return {
                        navigate: performCustomDrillDown,
                        getInfo: getCustomDrillDownInfo,
                        goToPreviousLevel: goToPreviousLevel,
                        setTitle: setCustomDrillDownBreadcrumbTitle
                    }
                }

                function mapFieldsToGridConfig(gridConfig, fields) {
                    var tempObj = {};
                    for (var i = 0; i < fields.length; i++) {
                        tempObj[fields[i].name] = fields[i];
                    }
                    for (var j = 0; j < gridConfig.columnDefs.length; j++) {
                        var propName = gridConfig.columnDefs[j].field || gridConfig.columnDefs[j].name;
                        if (tempObj[propName] && tempObj[propName].group) {
                            gridConfig.columnDefs[j].group = tempObj[propName].group;
                        }
                    }
                }

                function getEvaluatedStateParams(params, additionalCtx) {
                    var obj = {};
                    if (params) {
                        Object.getOwnPropertyNames(params).forEach(function (name) {
                            obj[name] = mdContextSrv.parseWithStateCtx(params[name], {
                                currentContentItem: additionalCtx || {}
                            });
                        });
                    }
                    return obj;
                }

                function getFilterSelectQuery(items) {
                    var query = '';
                    if (!Array.isArray(items)) {
                        items = [items];
                    }
                    if (items.length > 0) {
                        query = '$filter='
                    }
                    items.forEach(function (item, index) {
                        var pattern = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi; //NOSONAR
                        var isGuid = pattern.test(item);
                        if (isGuid) {
                            query += 'Id eq ' + item;
                        } else {
                            query += 'Id eq \'' + item + '\'';
                        }
                        if (index < items.length - 1) {
                            query += ' or ';
                        }
                    });
                    return query;
                }

                function getUniqueId(contentObj) {
                    var uniqueId = '';
                    if (contentObj.entityRef && contentObj.entityRef.entity) {
                        uniqueId = 'Id';
                    } else if (Array.isArray(contentObj.properties)) {
                        for (var index = 0; index < contentObj.properties.length; index++) {
                            if (contentObj.properties[index].name === 'Id') {
                                uniqueId = 'Id';
                                break;
                            }
                        }
                    }
                    return uniqueId;
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

                function resetSelectAll(confDataRepository, content, selectedItemsCount) {
                    var currentData = window.$UIF.Function.safeCall(confDataRepository.contents[content].runtimeConf, 'getCurrentData');
                    if (currentData && currentData.length === selectedItemsCount) {
                        confDataRepository.contents[content].runtimeConf.selectAll(false);
                    }
                }

                function getInterpolatedValue(expression, context) {
                    var interpolatedValue = '';
                    if (expression && context) {
                        interpolatedValue = mdContextSrv.parseWithStateCtx(expression, context);
                    }
                    var interpolatedValueType = typeof interpolatedValue;
                    if (interpolatedValueType === 'object' || interpolatedValueType === 'undefined') {
                        interpolatedValue = '';
                    }
                    return typeof interpolatedValue === 'string' ? interpolatedValue : interpolatedValue.toString();
                }

                function getStateTitle(state) {
                    return (state.data && state.data.title) ? $filter('translate')(state.data.title) : state.name;
                }

                function getBreadCrumbDisplayTitle(screenId, breadcrumbField, useScreenTitleInBreadcrumb, item) {
                    var title = '';
                    var allStates = $state.get();
                    if (allStates && allStates.length) {
                        allStates.forEach(function (state) {
                            if (state.name === screenId) {
                                var temp = getInterpolatedValue(breadcrumbField, item);
                                title = useScreenTitleInBreadcrumb ? getStateTitle(state) + ' ' + temp : temp;
                            }
                        });
                    }
                    return title;
                }

                function performDrillDown(sourceInfo, destInfo, item, drillDownSelectionKey) {
                    updateSourceScreenInfo(sourceInfo).then(function () {
                        updateTrackingWithDestinationInfo(destInfo.screenId, destInfo.breadCrumbTitle, item, drillDownSelectionKey).then(function (tracking) {
                            breadcrumbService.setBreadcrumbChain(tracking);
                            performStateNavigation(destInfo.screenId, { mduiCtx: { stateParams: destInfo.params, tracking: tracking } });
                        });
                    });
                }

                function updateSourceScreenInfo(obj) {
                    var defer = $q.defer();
                    navigationManagementService.getQueryString().then(function (data) {
                        var params = data.mduiCtx ? JSON.parse(window.$UIF.String.decode(data.mduiCtx)) : { tracking: [] };
                        var index = params.tracking && params.tracking.length ? params.tracking.length - 1 : 0;
                        var srcScreen = {
                            index: index,
                            screenId: obj.screenId,
                            title: obj.breadCrumbTitle,
                            master: obj.selectionInfo.master,
                            detail: obj.selectionInfo.detail,
                            params: params.stateParams,
                            contextInfo: obj.selectionInfo.contextInfo ? obj.selectionInfo.contextInfo : null
                        };
                        params.tracking[index] = srcScreen;
                        $stateParams.mduiCtx = window.$UIF.String.encode((JSON.stringify(params)));
                        defer.resolve(navigationManagementService.setQueryString($stateParams));
                    });
                    return defer.promise;
                }

                function updateTrackingWithDestinationInfo(screenId, breadCrumbTitle, item, drillDownSelectionKey) {
                    var defer = $q.defer();
                    navigationManagementService.getQueryString().then(function (data) {
                        var tracking = data.mduiCtx ? JSON.parse(window.$UIF.String.decode(data.mduiCtx)).tracking : [];
                        var destScreen = {
                            index: tracking.length,
                            screenId: screenId,
                            title: breadCrumbTitle,
                            master: { id: drillDownSelectionKey ? window.$UIF.Object.safeGet(item, drillDownSelectionKey) : item.Id },
                            detail: {},
                            params: {}
                        };
                        tracking.push(destScreen);
                        defer.resolve(tracking);
                    });
                    return defer.promise;
                }

                //If the destination screen is custom, all the params must be used in the state navigation to make them available with $stateParams
                function performStateNavigation(stateId, params, options) {
                    var stateInfo = $state.get(stateId);
                    var masterDetailCtrl = 'common.layout.modelDriven.template.MDCtrl';
                    var singleEntityCtrl = 'common.layout.modelDriven.template.SECtrl';
                    if (stateInfo.views && stateInfo.views['Canvas@'] && stateInfo.views['Canvas@'].controller !== masterDetailCtrl && stateInfo.views['Canvas@'].controller !== singleEntityCtrl) {
                        Object.keys(params.mduiCtx.stateParams).forEach(function (key) {
                            params[key] = params.mduiCtx.stateParams[key];
                        });
                    }
                    if (params.mduiCtx) {
                        params.mduiCtx = window.$UIF.String.encode(JSON.stringify(params.mduiCtx));
                    }
                    $state.go(stateId, params, options);
                }

                //API to navigate to mdui state from custom states
                this.navigateToMduiState = function (stateId, params, options) {
                    var stateParams = {
                        'mduiCtx': window.$UIF.String.encode(JSON.stringify({ 'stateParams': params, 'tracking': [] }))
                    };
                    $state.go(stateId, stateParams, options);
                }

                function mergeExtensionIcvConfig(contentObj) {
                    var isPartialExtension = false; //extensions for reading function with facet or view with facets
                    if ((contentObj.readingFunctionRef && contentObj.readingFunctionRef.functionName) || (
                        window.$UIF.Object.safeGet(contentObj, 'entityRef.entity') && window.$UIF.Object.safeGet(contentObj, 'rootEntity.name'))) {
                        isPartialExtension = true;
                    }
                    if (!contentObj.fieldSources) contentObj.fieldSources = [];
                    if (!contentObj.properties) contentObj.properties = [];
                    if (!contentObj.blueprintSettings) contentObj.blueprintSettings = {};
                    if (!contentObj.blueprintSettings.tileConfig) contentObj.blueprintSettings.tileConfig = {};
                    if (!contentObj.blueprintSettings.gridConfig) contentObj.blueprintSettings.gridConfig = {};
                    if (!contentObj.blueprintSettings.tileConfig.propertyFields) contentObj.blueprintSettings.tileConfig.propertyFields = [];
                    if (!contentObj.blueprintSettings.tileConfig.indicators) contentObj.blueprintSettings.tileConfig.indicators = [];
                    if (!contentObj.blueprintSettings.gridConfig.columnDefs) contentObj.blueprintSettings.gridConfig.columnDefs = [];
                    if (!contentObj.blueprintSettings.filterFields) contentObj.blueprintSettings.filterFields = [];
                    contentObj.extensionRef.forEach(function (extension) {
                        if (!isPartialExtension) {
                            contentObj.fieldSources = contentObj.fieldSources.concat(extension.fieldSources);
                        } else {
                            if (extension.properties) {
                                extension.properties.forEach(function (property) {
                                    property.sortable = false;
                                    property.groupable = false;
                                    delete property.fieldSource;
                                    delete property.facetName;
                                });
                            }
                            if (window.$UIF.Object.safeGet(extension, 'blueprintSettings.gridConfig.columnDefs')) {
                                extension.blueprintSettings.gridConfig.columnDefs.forEach(function (columnDef) {
                                    delete columnDef.fieldSource;
                                    delete columnDef.facetName;
                                });
                            }
                            if (window.$UIF.Object.safeGet(extension, 'blueprintSettings.tileConfig.propertyFields')) {
                                extension.blueprintSettings.tileConfig.propertyFields.forEach(function (propertyField) {
                                    delete propertyField.fieldSource;
                                    delete propertyField.facetName;
                                });
                            }
                        }
                        contentObj.properties = contentObj.properties.concat(extension.properties);
                        contentObj.blueprintSettings.tileConfig.propertyFields = contentObj.blueprintSettings.tileConfig.propertyFields.concat(extension.blueprintSettings.tileConfig.propertyFields);
                        contentObj.blueprintSettings.tileConfig.indicators = contentObj.blueprintSettings.tileConfig.indicators.concat(extension.blueprintSettings.tileConfig.indicators);
                        contentObj.blueprintSettings.gridConfig.columnDefs = contentObj.blueprintSettings.gridConfig.columnDefs.concat(extension.blueprintSettings.gridConfig.columnDefs);
                        contentObj.blueprintSettings.filterFields = contentObj.blueprintSettings.filterFields.concat(extension.blueprintSettings.filterFields);
                    });
                }

                function getExtensionsForBackendAPI(contentObj) {
                    if (!contentObj.extensionRef || !contentObj.extensionRef.length > 0) {
                        return [];
                    }
                    var extensionsObj = [{
                        entity: window.$UIF.Object.safeGet(contentObj, 'rootEntity.name'),
                        app: window.$UIF.Object.safeGet(contentObj, 'rootEntity.app') || window.$UIF.Object.safeGet(contentObj, 'readingFunctionRef.app')
                            || window.$UIF.Object.safeGet(contentObj, 'entityRef.app'),
                        bindingProperty: contentObj.mappingKey || 'Id',
                        facets: []
                    }];
                    contentObj.extensionRef.forEach(function (extension) {
                        extension.fieldSources.forEach(function (fieldSource) {
                            if (fieldSource.fullName && fieldSource.fullName.indexOf("ReadingModel") === -1) {
                                var splitName = fieldSource.fullName.split(".");
                                splitName.splice(splitName.length - 1, 0, "ReadingModel");
                                fieldSource.fullName = splitName.join(".");
                            }
                        });
                        extensionsObj[0].facets = extensionsObj[0].facets.concat(extension.fieldSources);
                    });
                    return extensionsObj;
                }
            }]);
}());

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.modelDriven')
        /**
          * @ngdoc service
          * @name common.services.modelDriven.warningService
          * @module siemens.simaticit.common.services.modelDriven
          * @access internal
          * @description
          * this service to create confirmation popup whenever state changes on setting isOverlayToBeDisplayed true
          *
          */
        .service('common.services.modelDriven.warningService', ['$rootScope', '$state', 
            'common.services.swac.SwacUiModuleManager', 'common.mduiBreadcrumb.breadcrumbService', 'common.widgets.messageOverlay.service',
            function ($rootScope, $state, swacManager, breadcrumbService, overlayService) {
                var self = this;

                function isInCanvas() {
                    var currentState = $state.get($state.current.name);
                    self.isInCanvas = currentState && currentState.views && currentState.views['panel-in-canvas@'];
                    return self.isInCanvas;
                }

                function setOverlayData(overlayText, overlayButtons) {
                    self.message = overlayText;
                    self.overlayButtons = overlayButtons;
                }

                function setIsFromIncanvas(isFromInCanvas) {
                    self.isFromInCanvas = isFromInCanvas;
                }

                function getIsFromIncanvas() {
                    return self.isFromInCanvas;
                }

                function setIsViewAction(isViewAction) {
                    self.isViewAction = isViewAction;
                }

                function getIsViewAction() {
                    return self.isViewAction;
                }

                function setOverlayToBeDisplay(isOverlayToBeDisplayed) {
                    self.isConfirmationDisplayed = isOverlayToBeDisplayed;
                }

                function getCurrentState() {
                    return self.currentState;
                }

                function getCurrentParam() {
                    return self.param;
                }

                function getOverlayToBeDisplay() {
                    return self.isConfirmationDisplayed;
                }

                function hideOverlay() {
                    overlayService.hide();
                }

                function showOverlay(overlayTitle, overlayText, overlayButtons) {
                    var overlayData = {
                        'title': overlayTitle,
                        'text': overlayText,
                        'buttons': overlayButtons
                    };
                    overlayService.set(overlayData);
                    overlayService.show();
                }

                $rootScope.$on("$stateChangeStart", function (event, state, param, _fromState, _fromParams, options) {
                    if (isInCanvas() && !getIsViewAction()) {
                        if (options.isBackNavigation === true || options.isBackNavigation === undefined) {
                            event.preventDefault();
                            return;
                        }
                    }
                    if (self.isOverlayToBeDisplayed && !getIsViewAction()) {
                        event.preventDefault();
                        self.currentState = state.name;
                        self.param = param;
                        showOverlay('Confirmation', self.message, self.overlayButtons);
                        self.isOverlayToBeDisplayed = false;
                        return;
                    } else{
                        self.isConfirmationDisplayed = false;
                    }
                });

                function eventSubscription(event) {
                    //historyNavigation event is raised on back button click as well as sidebar navigation where as 'mom.navigation.start' is only trigerred in case of sidebar navigation
                    //So subscribed to both the events to eliminate the false events.
                    if (isInCanvas()) {
                        if (event.data.topic === 'mom.navigation.start') {
                            self.isOverlayToBeDisplayed = true;
                            self.isConfirmationDisplayed = true;
                        }
                        if (event.data.topic === 'historyNavigation') {
                            self.isOverlayToBeDisplayed = true;
                            self.isConfirmationDisplayed = true;
                            $state.go('^');
                            if (getIsViewAction()) {
                                breadcrumbService.setBreadcrumbChain(breadcrumbService.getBreadcrumbChain().pop());
                            }
                        }
                    }
                    else {
                        $rootScope.isInCanvasView = false;
                        self.isConfirmationDisplayed = false;
                    }
                }


                function subscribeEvents() {
                    if (swacManager.enabled) {
                        swacManager.eventBusServicePromise.promise.then(function (eventBusSvc) {
                            eventBusSvc.register('mom.navigation.start');
                            eventBusSvc.register('historyNavigation');
                            eventBusSvc.event.subscribe(eventSubscription);
                        });
                    }
                }

                subscribeEvents();

                function showOverlayOnClick(isOverlayToBeDisplayed) {
                    self.isOverlayToBeDisplayed = isOverlayToBeDisplayed;
                }

                self.eventSubscription = eventSubscription;
                //exposes the required apis to achieve overlay on state change to/fro custom screens or action
                self.initCustomOverlayOnStateChange = function () {
                    return {
                        getState: getCurrentState,
                        getParam: getCurrentParam,
                        setOverlayDisplay: setOverlayToBeDisplay,
                        getOverlayDisplay: getOverlayToBeDisplay,
                        setOverlay: setOverlayData,
                        hideOverlay: hideOverlay,
                        setIsViewAction: setIsViewAction,
                        getIsViewAction: getIsViewAction,
                        setIsFromIncanvas: setIsFromIncanvas,
                        getIsFromIncanvas: getIsFromIncanvas,
                        showOverlayOnClick: showOverlayOnClick
                    }
                }
            }]);
}());