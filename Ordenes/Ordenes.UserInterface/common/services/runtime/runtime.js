/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.services.runtime
     * @module siemens.simaticit.common
     *
     * @description
     * This module provides objects and services related to retrieving runtime data.
     *
     */
    angular.module('siemens.simaticit.common.services.runtime', []);

})();

(function () {
    'use strict';
})();

"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
            * @ngdoc service
            * @name common.services.runtime.archivingDataService
            * @module siemens.simaticit.common.services.runtime
            * @requires $q
            * @requires $resource
            * @requires $http
            * @requires service:CommandResponse
            * @requires service:ExecutionError
            * @requires common.services.runtime.DataConfig
            *
            * @description
            * Exposes a method that can be used to read entities from archiving database.
            *
            * @example
            * In a controller, the **common.services.runtime.archivingDataService** can be used as follows:
            *
            * ```
            *    vm.findAll = findAll;
            *
            *    function findAll() {
            *       var findAllPayload = {
            *           appName: "TestApp",
            *           entityName: "TestEntity",
            *           options: "$select=Name,Quantity"
            *       };
            *        busyIndicatorService.show();
            *        result = null;
            *        archiving.findAll(findAllPayload).then( function(data) {
            *            result = data;
            *            busyIndicatorService.hide();
            *        }, function (error) {
            *            busyIndicatorService.hide();
            *            messageOverlayService.setOverlayData({
            *                buttons: [{
            *                    id: 'ok',
            *                    displayName: 'OK',
            *                    onClickCallback: function () {
            *                        // some logic goes here
            *                        messageOverlayService.hideOverlayModal();
            *                    }
            *                }],
            *                title: "Backend Data Error",
            *                text: error.data.error.errorCode + ' - ' + error.data.error.errorMessage
            *            });
            *            messageOverlayService.showOverlayModal();
            *        });
            *    }
            *
            *
            *```
            */
        var ArchivingData = /** @class */ (function () {
            function ArchivingData($q, $resource, $http, $translate, common, CommandResponse, ExecutionError, businessDataConfig) {
                var _this = this;
                this.$q = $q;
                this.$resource = $resource;
                this.$http = $http;
                this.$translate = $translate;
                this.common = common;
                this.CommandResponse = CommandResponse;
                this.ExecutionError = ExecutionError;
                this.ERRORS = function (statusCode) {
                    switch (statusCode) {
                        case 404: return _this.$translate.instant('ERRORS.404');
                        case 503: return _this.$translate.instant('ERRORS.503');
                        case 400: return _this.$translate.instant('ERRORS.400');
                        case 403: return _this.$translate.instant('ERRORS.403');
                        case 500: return _this.$translate.instant('ERRORS.500');
                        case '4XX': return _this.$translate.instant('ERRORS.4XX');
                        case '5XX': return _this.$translate.instant('ERRORS.5XX');
                    }
                };
                this.transformResObj = function (data, headersGetter, statusCode) {
                    var res = null;
                    if (data) {
                        try {
                            var Jsondata = JSON.parse(data);
                            //odata Response Error
                            if (Jsondata['odata.error']) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(Jsondata['odata.error'].code, Jsondata['odata.error'].message.value));
                                _this.common.logger.logError(Jsondata['odata.error'].code + ' : ' + Jsondata['odata.error'].message.value, '', 'Archiving Data Service');
                            }
                            //odata Response with data
                            if (Jsondata['@odata.context']) {
                                res = new _this.CommandResponse(true, new _this.ExecutionError(0, ''));
                                var suffix = '$entity';
                                if (Jsondata['@odata.context'].indexOf(suffix, Jsondata['@odata.context'].length - suffix.length) !== -1) {
                                    delete Jsondata['@odata.context'];
                                    res.value = [Jsondata];
                                }
                                else {
                                    res.value = Jsondata.value;
                                }
                                // parse count from response
                                if (Jsondata['@odata.count']) {
                                    res.count = Jsondata['@odata.count'];
                                }
                            }
                            //http error
                            if (Jsondata.error) {
                                res = new _this.CommandResponse('false', new _this.ExecutionError(Jsondata.error.code, Jsondata.error.message));
                                _this.common.logger.logError(Jsondata.error.code + ' : ' + Jsondata.error.message, '', 'Archiving Data Service');
                            }
                        }
                        catch (ex) {
                            var errorSeries = Math.floor(statusCode / 100);
                            if (_this.ERRORS(statusCode)) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Archiving Data Service');
                            }
                            else if (_this.ERRORS(errorSeries + 'XX')) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(errorSeries + 'XX')));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(errorSeries + 'XX') + '', 'Archiving Data Service');
                            }
                            else {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(-1, "Error: " + ex.message));
                                _this.common.logger.logError('-1: Error: ' + ex.message, '', 'Archiving Data Service');
                            }
                        }
                    }
                    else {
                        res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Generic Error'));
                        _this.common.logger.logError('-1: Error: Generic Error', '', 'Archiving Data Service');
                    }
                    return res;
                };
                this.archivingServiceUrls = businessDataConfig.config.applicationArchivingServiceUrls;
            }
            ArchivingData.prototype.escapeSpecialCharacters = function (path) {
                var result = path;
                var parts = path.split('?');
                if (parts.length > 1) {
                    result = parts[0];
                    for (var i = 1; i < parts.length; parts++) {
                        // this to avoid removal of :string from the path
                        // $resource uses : to identify parameters.
                        // which intern replaces :along_with_string is removed.
                        result += '?' + parts[i].split(':').join('\\:');
                    }
                }
                return result;
            };
            ArchivingData.prototype.getCmd = function (path) {
                var escapedPath = this.escapeSpecialCharacters(path);
                return this.$resource('', {}, {
                    getAll: {
                        method: 'Get',
                        url: escapedPath,
                        transformResponse: [this.transformResObj].concat(this.$http.defaults.transformResponse)
                    }
                });
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.archivingDataService#findAll
            * @module siemens.simaticit.common.services.runtime
            * @param {QueryModel} object See {@link type:QueryModel}.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            *
            * @description
            * Retrieves data from an entity exposed by an App on the Archiving Service Layer.
            *
            */
            ArchivingData.prototype.findAll = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                var archvingServiceUrls = this.archivingServiceUrls;
                if (!object) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.executeNoInput'))) });
                    return deferred.promise;
                }
                var appName = object.appName;
                var appPath = archvingServiceUrls[appName];
                //TODO: Compatibility EndPoint for Archiving Does it makes sense?
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                var path = '';
                if (!object.entityName) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noEntityName'))) });
                }
                else {
                    try {
                        if (appPath.slice(-1) !== "/") {
                            appPath = appPath + '/';
                        }
                        path = appPath + object.entityName;
                        if (object.options) {
                            path += '?' + object.options;
                        }
                        var fnc = this.getCmd(path);
                        return fnc.getAll(function (data) {
                            deferred.resolve(data);
                        }, function (err) {
                            var exeError = _this.common.setExecutionError(err);
                            deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                        }).$promise;
                    }
                    catch (jse) {
                        deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: jse.message } } });
                    }
                }
                return deferred.promise;
            };
            ArchivingData.$inject = ['$q', '$resource', '$http', '$translate', 'common', 'CommandResponse', 'ExecutionError', 'common.services.runtime.DataConfig'];
            return ArchivingData;
        }());
        framework.ArchivingData = ArchivingData;
        angular.module('siemens.simaticit.common.services.runtime').service('common.services.runtime.archivingDataService', ArchivingData);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=archivingData.svc.js.map
"use strict";
/// <reference path="business.svc.ts" />
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        var BackendConfigModel = /** @class */ (function () {
            function BackendConfigModel(enableBusyIndicator, enableMessageOverlay) {
                this.enableBusyIndicator = enableBusyIndicator;
                this.enableMessageOverlay = enableMessageOverlay;
            }
            return BackendConfigModel;
        }());
        framework.BackendConfigModel = BackendConfigModel;
        /**
        *  @ngdoc provider
        *  @name common.services.runtime.backendConfigProvider
        *  @module siemens.simaticit.common.services.runtime
        *  @description Specifies whether or not the BackendService must show the busy indicator and overlay when requesting data.
        *
        *  @property {Object} config An object with an **enableBusyIndicator** property, which specifies whether to use the busy indicator or not,
        *  and an **enableMessageOverlay** property, which specifies whether to use message overlay or not.
        *
        */
        var BackendConfig = /** @class */ (function () {
            function BackendConfig() {
                this.config = new BackendConfigModel(true, true);
            }
            /**
            *  @ngdoc service
            *  @name common.services.runtime.backendConfig
            *  @module siemens.simaticit.common.services.runtime
            *  @description Specifies whether the BackendService must show the busy indicator and overlay when requesting data.
            *
            *  @property {Object} config An object with an **enableBusyIndicator** property, which specifies whether to use the busy indicator or not,
            *  and an **enableMessageOverlay** property, which specifies whether to use the message overlay or not.
            *
            */
            BackendConfig.prototype.$get = function () {
                return {
                    config: this.config
                };
            };
            return BackendConfig;
        }());
        framework.BackendConfig = BackendConfig;
        var CommandModel = /** @class */ (function () {
            function CommandModel(appName, commandName, params, additionalParams) {
                this.appName = appName;
                this.commandName = commandName;
                this.params = params;
                this.additionalParams = additionalParams;
            }
            return CommandModel;
        }());
        framework.CommandModel = CommandModel;
        /**
        *  @ngdoc service
        *  @name common.services.runtime.backendService
        *  @module siemens.simaticit.common.services.runtime
        *  @description A high-level service that provides common functionalities on top of the {@link common.services.runtime.commandService},
        *  {@link common.services.runtime.dataService} and {@link common.services.runtime.archivingDataService}
        *
        * @example
        * In a controller, the **common.services.runtime.backendService** is used as follows:
        *
        * ```
        * (function () {
        * 'use strict';
        *
        *angular.module('siemens.simaticit.common').run(['$rootScope', 'common.services.runtime.backendService', function ($rootScope,backendService) {
        *
        *    // Websocket for an App can be opened by calling the 'connectSignals' method.
        *
        *	var appName = 'EvtMgrApp';
        *	backendService.connectSignals(appName).then(function () {
        *		console.log(appName + ": WebSocket Opened Successfully");
        *	}, function (error) {
        *		 // On socket connection error you can try to connect to the socket again
        *        console.log("Error in socket connection...");q
        *        setTimeout(function(){
        *           console.log("Reconnecting...");
        *           backendService.reconnectSignals(appName).then(function () {
        *		    console.log(appName + ": WebSocket Opened Successfully");
        *	        }, function (error) {
        *		        console.log("Error in opening a web socket \n" + angular.toJson(error, true));
        *	        });
        *       }, 5000);
        *   });
        *
        *   // You may choose to close the web-socket according to the business case
        *   $rootScope.$on('appCleanup',function () {
        *       backendService.disconnectSignals(appName).then(function () {
        *           console.log(appName + ": WebSocket Closed Successfully");
        *       }, function (error) {
        *          console.log("Error in closing the web socket \n" + angular.toJson(error, true));
        *       });
        *   });
        * }]);
        *
        * BackendExampleController.$inject = ['common.services.runtime.backendService' ];
        * function BackendExampleController(backendService) {
        *    var vm = this;
        *
        *    activate();
        *
        *    function activate() {
        *
        *       vm.invokeBackendError = invokeBackendError;
        *
        *       vm.query = {appName: "DemoApp", entityName: "Container"};
        *       vm.result = '';
        *       vm.retrieveData = retrieveData;
        *       vm.getReadData = getReadData;
        *       vm.getRecordCount = getRecordCount;
        *
        *       vm.errorMessage = '';
        *       vm.errorTitle = '';
        *       vm.invokeGenericError = invokeGenericError;
        *
        *       vm.command = {appName: "DemoApp", commandName: "editContainer", params: {Id: "AAA1", Name: "Test #2"}};
        *       vm.title = '';
        *       vm.operation = '';
        *       vm.invokeConfirmation = invokeConfirmation;
        *
        *       vm.signalNameBS = "Signal1";
        *       vm.filterBS = "";
        *       vm.appNameBS = "App1";
        *       vm.connectionId;
        *   }
        *
        *   function invokeBackendError() {
        *       backendService.invoke(vm.command).then(function (data) {
        *           vm.result = data;
        *       }, backendService.backendError);
        *   }
        *
        *   function retrieveData() {
        *       vm.result = null;
        *       backendService.findAll(vm.query).then(function (data) {
        *           vm.result = data;
        *       }, function (error) {
        *           vm.result = error.data;
        *       });
        *   }
        *
        *   function retrieveDataFromArchivingDB() {
        *       vm.result = null;
        *       backendService.findAllArchiving(vm.query).then(function (data) {
        *           vm.result = data;
        *       }, function (error) {
        *           vm.result = error.data;
        *       });
        *   }
        *
        *   function getRecordCount() {
        *       vm.count = null;
        *       var countPayload = {
        *           appName: "TestApp",
        *           entityName: "TestEntity",
        *           options: "$filter= Name eq 'Test1'"
        *       };
        *       backendService.getCount(countPayload).then(function (data) {
        *           vm.count = data.count;
        *       }, function (error) {
        *           vm.count = "";
        *       });
        *   }
        *
        *   function getReadData() {
        *       backendService.read({
        *           appName: "DemoApp",
        *           functionName: "myFunc",
        *           params: {id: 1234} ,
        *           options: "$select=Name,Quantity"
        *       }).then(function (data) {
        *           vm.result = data;
        *       }, function (error) {
        *           vm.result = error.data;
        *       });
        *   }
        *
        *   function invokeGenericError() {
        *       backendService.genericError(vm.errorMessage, vm.errorTitle);
        *   }
        *
        *   function invokeConfirmation() {
        *       backendService.confirm(vm.operation, function () {
        *           console.log('confirmed....');
        *       }, vm.title);
        *   }
        *
        *   function subscribeSignalBS() {
        *        var signalName = ('' + (conCounter++) + '_' + vm.signalNameBS)
        *        var connectionObj = {
        *            appName: vm.appNameBS,
        *            signalName: vm.signalNameBS,
        *            options: vm.filterBS,
        *            onMessage: onMessageBS,
        *            onComplete: onCompleteBS
        *        }
        *        backendService.subscribe(connectionObj).then(function (id) {
        *            vm.connectionId = id;
        *            console.log("Subscribed to signal");
        *        }, function (error) {
        *            console.log("Subscription error");
        *            setTimeout(function(){
        *               // Try to subscribe to the signal again after 5 seconds.
        *               subscribeSignalBS();
        *            }, 5000);
        *        });
        *    }
        *
        *    function onMessageBS(data) {
        *      console.log("Received data from signal: "+ data);
        *    }
        *
        *    function onSubscriptionError(errReason) {
        *       console.log("Error occured "+ errReason);
        *    }
        *
        *   function onCompleteBS(){
        *       // Unsubscibe from signal on completion of message transfer
        *       unsubscribeSignalBS();
        *   }
        *
        *
        *   function unsubscribeSignalBS() {
        *       // When the second argument is passed as true, the websocket for the App will be closed after the last active subscription closes.
        *        backendService.unsubscribe(vm.connectionId, true).then(function (id) {
        *            console.log("unsubscribe successfull");
        *        }, function (error) {
        *            console.log("unsubscribe error");
        *        });
        *   }
        *
        *   function reconnectAppBS() {
        *      backendService.reconnectSignals(vm.appNameBS).then(function (reconnIds) {
        *           console.log("re-connection successful;");
        *      }, function (error) {
        *           console.log("re-connection failed");
        *      });
        *   }
        * }
        * angular.module('siemens.simaticit.common').controller('backendExampleController', BackendExampleController);
        * })();
        *
        *
        * ```
        */
        var BackendService = /** @class */ (function () {
            function BackendService($q, $translate, common, commandService, dataService, archivingDataService, busyIndicator, messageOverlay, logger, backendConfig, signalManager, CommandResponse, ExecutionError) {
                var _this = this;
                this.$q = $q;
                this.$translate = $translate;
                this.common = common;
                this.commandService = commandService;
                this.dataService = dataService;
                this.archivingDataService = archivingDataService;
                this.busyIndicator = busyIndicator;
                this.messageOverlay = messageOverlay;
                this.logger = logger;
                this.backendConfig = backendConfig;
                this.signalManager = signalManager;
                this.CommandResponse = CommandResponse;
                this.ExecutionError = ExecutionError;
                /**
                * @ngdoc method
                * @name common.services.runtime.backendService#backendError
                * @module siemens.simaticit.common.services.runtime
                * @param {Object} reject Rejects object provided by the promise object.
                * @description Displays an error message using an overlay.
                *
                */
                this.backendError = function (reject) {
                    if (!reject) {
                        _this.logger.logError('reject is missing', {}, 'common.services.runtime.backendService::backendError');
                        return;
                    }
                    _this.showErrorMessage(_this.$translate.instant('common.error'), _this.common.formatErrorMessage(reject));
                };
                this.signalConnections = [];
            }
            BackendService.prototype.getAppEndPoint = function (appName) {
                return this.dataService.getAppEndPoint(appName);
            };
            /**
                * @ngdoc method
                * @name common.services.runtime.backendService#invoke
                * @module siemens.simaticit.common.services.runtime
                * @description
                * See the same method exposed by {@link common.services.runtime.commandService#invoke}.
                */
            BackendService.prototype.invoke = function (inputObject) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!inputObject) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidInput'))) });
                    return deferred.promise;
                }
                this.showBusyIndicator();
                this.commandService.invoke(inputObject).then(function (data) {
                    _this.hideBusyIndicator();
                    deferred.resolve(data);
                }, function (reject) {
                    _this.hideBusyIndicator();
                    _this.showBackendErrorMessage(reject);
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#findAll
            * @module siemens.simaticit.common.services.runtime
            * @description
            * See the same method exposed by {@link common.services.runtime.dataService#findAll}.
            */
            BackendService.prototype.findAll = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                this.showBusyIndicator();
                this.dataService.findAll(object).then(function (data) {
                    _this.hideBusyIndicator();
                    deferred.resolve(data);
                }, function (reject) {
                    _this.hideBusyIndicator();
                    _this.showBackendErrorMessage(reject);
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#findAllArchiving
            * @module siemens.simaticit.common.services.runtime
            * @description
            * See the same method exposed by {@link common.services.runtime.archivingDataService#findAll}.
            */
            BackendService.prototype.findAllArchiving = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                this.showBusyIndicator();
                this.archivingDataService.findAll(object).then(function (data) {
                    _this.hideBusyIndicator();
                    deferred.resolve(data);
                }, function (reject) {
                    _this.hideBusyIndicator();
                    _this.showBackendErrorMessage(reject);
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#read
            * @module siemens.simaticit.common.services.runtime
            * @description
            * See the same method exposed by {@link common.services.runtime.dataService#read}.
            */
            BackendService.prototype.read = function (object) {
                var _this = this;
                if (object.options) {
                    if (object.options.includes("&$expand=Facets")) {
                        object.options = object.options.replace('&$expand=Facets', '');
                    }
                    else {
                        object.options = object.options.replace('$expand=Facets', '');
                    }
                }
                var deferred = this.$q.defer();
                this.showBusyIndicator();
                this.dataService.read(object).then(function (data) {
                    _this.hideBusyIndicator();
                    deferred.resolve(data);
                }, function (reject) {
                    _this.hideBusyIndicator();
                    _this.showBackendErrorMessage(reject);
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#connectSignals
            * @module siemens.simaticit.common.services.runtime
            * @param {String} appName Name of the App for which the web socket has to be opened.
            * @return {Promise} A promise that is resolved if the connection is successful, otherwise it is rejected.
            * @description Opens the websocket for the aforementioned App.
            *
            */
            BackendService.prototype.connectSignals = function (appName, onConnectionError) {
                var deferred = this.$q.defer();
                if (!appName) {
                    deferred.reject("Input paramter 'app name' is missing");
                }
                else {
                    this.signalManager.connect(appName, onConnectionError).then(function () {
                        deferred.resolve();
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            };
            /**
            * @ngdoc type
            * @name SignalConfigObject
            * @module siemens.simaticit.common.services.runtime
            * @description
            * Represents an object that contains data needed to subscribe to the signal.
            *
            * @property {string} appName The name of the App to connect to.
            * @property {string} signalName The name of the signal to subscribe to.
            * @property {string} [options] An OData query string.
            * @property {Function} onMessage A callback that is invoked every time a new message is received from the signal.
            * @property {Function} onSubscriptionError A callback (optional) that is invoked whenever an error occurs.
            * @property {Function} onComplete A callback (optional) that is invoked when the server notifies the client that it has finished sending messages for the currently active subscription.
            */
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#subscribe
            * @module siemens.simaticit.common.services.runtime
            * @param {SignalConfigObject} configObject  See {@link SignalConfigObject}.
            * @returns {Promise} A promise object containing the ID of the new signal subscription.
            * @description
            * Subscribes to a signal using the {@link common.services.signalManager#createConnection} and {@link SignalConnection#subscribe} methods.
            * If there is no already established web socket connection, This method will create the necessary connection before subscribing.
            * <br>**Note:**This method should not be used with any methods provided by the {@link siemens.simaticit.common.services.signalManager} service as it will result in incorrect behavior.
            */
            BackendService.prototype.subscribe = function (configObject) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!configObject.appName) {
                    deferred.reject("Paramter 'appName' is missing in the config object");
                    return deferred.promise;
                }
                if (!configObject.signalName) {
                    configObject.signalName = configObject.appName;
                }
                this.signalManager.createConnection(configObject.appName, configObject.signalName, configObject.onConnectionError).then(function (signalConnObj) {
                    signalConnObj.subscribe(configObject.options, configObject.onMessage, configObject.onSubscriptionError, configObject.onComplete)
                        .then(function (signalConnObj) {
                        _this.signalConnections.push(signalConnObj);
                        deferred.resolve(signalConnObj.id);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            /**
                * @ngdoc method
                * @name common.services.runtime.backendService#unsubscribe
                * @param {string} id Id of the connection to unsubscribe from.
                * @param {boolean} closeWebSocket Boolean value to indicate if the websocket has to be closed after unsubscribing from the signal or not.
                * @returns {Promise} A promise object containing the Id of the unsubscribed signal connection and an error response object if there is one.
                * @description Unsubscribes from a signal using the {@link common.services.signalManager#deleteConnection deleteConnection} method.
                * If the closeWebSocket value is set to true, it closes the corresponding websocket for the App after the last subscription closes.
                * <br>**Note:**This method should not be used with any methods provided by the {@link siemens.simaticit.common.services.signalManager} service as it will result in incorrect behavior.
                */
            BackendService.prototype.unsubscribe = function (connId, closeWebsocket) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!connId) {
                    deferred.reject("Input paramter 'connId' is missing");
                    return deferred.promise;
                }
                var signalConnObj = _.findWhere(this.signalConnections, { id: connId });
                if (!signalConnObj) {
                    deferred.reject("Invalid 'connId' passed");
                    return deferred.promise;
                }
                this.signalManager.deleteConnection(connId).then(function () {
                    _this.deleteConnection(signalConnObj.id);
                    if (closeWebsocket) {
                        _this.signalManager.disconnect(signalConnObj.appName || signalConnObj.signalApp).then(function () {
                            deferred.resolve(signalConnObj.id);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    }
                    else {
                        deferred.resolve(signalConnObj.id);
                    }
                }, function (error) {
                    deferred.resolve(error);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#reconnectSignals
            * @param {string} app Name of the App to reconnect to.
            * @returns {Promise} A promise object containing a hash of the old connection Ids to new Ids, and an error response object if there is one.
            * @description
            * Reconnects to a signal using the {@link SignalConnection#reconnect} method.
            * <br>**Note:**This method should not be used with any methods provided by the {@link siemens.simaticit.common.services.signalManager} service as it will result in incorrect behavior.
            */
            BackendService.prototype.reconnectSignals = function (app) {
                var deferred = this.$q.defer();
                var reconnectPromises = {};
                var signalConnArray = _.where(this.signalConnections, { signalApp: app });
                if (!signalConnArray.length) {
                    deferred.reject("Signal Connection with the supplied app name is not present");
                    return deferred.promise;
                }
                _.each(signalConnArray, function (signalConn) {
                    reconnectPromises[signalConn.id] = signalConn.reconnect();
                });
                this.$q.all(reconnectPromises).then(function (reconnections) {
                    var oldIds = Object.keys(reconnections);
                    var i = 0, length = oldIds.length;
                    for (i; i < length; i++) {
                        reconnections[oldIds[i]] = reconnections[oldIds[i]].id;
                    }
                    deferred.resolve(reconnections);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#disconnectSignals
            * @module siemens.simaticit.common.services.runtime
            * @param {String} appName Name of the App for which the web socket has to be closed.
            * @return {Promise} A promise that is resolved if the disconnection is successful, otherwise it is rejected.
            * @description Closes the websocket for the aforementioned App.
            *
            */
            BackendService.prototype.disconnectSignals = function (appName) {
                var deferred = this.$q.defer();
                if (!appName) {
                    deferred.reject("Input paramter 'app name' is missing");
                }
                else {
                    this.signalManager.disconnect(appName).then(function () {
                        deferred.resolve();
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            };
            BackendService.prototype.disconnectAllSignalsOfApp = function (appName) {
                var deferred = this.$q.defer();
                if (!appName) {
                    deferred.reject("Input paramter 'app name' is missing");
                }
                else {
                    this.signalManager.disconnectAppWithSignals(appName).then(function () {
                        deferred.resolve();
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            };
            BackendService.prototype.deleteConnection = function (id) {
                var i = 0, length = this.signalConnections.length;
                for (i; i < length; i++) {
                    if (this.signalConnections[i].id === id) {
                        this.signalConnections.splice(i, 1);
                        break;
                    }
                }
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#genericError
            * @module siemens.simaticit.common.services.runtime
            * @param {String} message Error message to be displayed.
            * @param {String} title Title to be displayed.
            * @description Displays an error message using an overlay.
            *
            */
            BackendService.prototype.genericError = function (message, title) {
                if (!message) {
                    this.logger.logError('message is missing', {}, 'common.services.runtime.backendService::genericError');
                    return;
                }
                if (!title) {
                    title = this.$translate.instant('common.error');
                }
                this.showErrorMessage(title, message);
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#confirm
            * @module siemens.simaticit.common.services.runtime
            * @param {String} message Error message to be displayed.
            * @param {Callback} callback Callback to be called on confirmation.
            * @param {String} title Title to be displayed.
            * @description Displays a confirmation message.
            *
            */
            BackendService.prototype.confirm = function (message, callback, title) {
                var _this = this;
                if (!message) {
                    this.logger.logError('message is missing', {}, 'common.services.runtime.backendService::confirm');
                    return;
                }
                if (!callback) {
                    this.logger.logError('callback is missing', {}, 'common.services.runtime.backendService::callback');
                    return;
                }
                if (!title) {
                    title = this.$translate.instant('common.confirmation');
                }
                this.messageOverlay.set({
                    buttons: [{
                            id: 'no',
                            displayName: this.$translate.instant('common.no'),
                            onClickCallback: this.messageOverlay.hide
                        }, {
                            id: 'yes',
                            displayName: this.$translate.instant('common.yes'),
                            onClickCallback: function () {
                                _this.messageOverlay.hide();
                                callback();
                            }
                        }],
                    title: title,
                    text: message
                });
                this.messageOverlay.show();
            };
            /**
            * @ngdoc method
            * @access internal
            * @name common.services.runtime.backendService#getMetaData
            * @module siemens.simaticit.common.services.runtime
            * @param {String} appName Name of the App whose metadata is to be extracted.
            * @return {Promise} A promise that is resolved if the connection is successful, otherwise it is rejected.
            * @description Retrieves the metadata in XML format.
            */
            BackendService.prototype.getMetaData = function (appName) {
                var deferred = this.$q.defer();
                this.dataService.getMetaData(appName).then(function (data) {
                    deferred.resolve(data);
                }, function (reject) {
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.backendService#getCount
            * @module siemens.simaticit.common.services.runtime
            * @param {QueryModel} queryObject See {@link type:QueryModel}.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            * @description Retrieves the count of records from an entity exposed by an App on the Runtime Service Layer.
            */
            BackendService.prototype.getCount = function (queryObject) {
                var _this = this;
                var deferred = this.$q.defer();
                this.showBusyIndicator();
                this.dataService.getCount(queryObject).then(function (data) {
                    _this.hideBusyIndicator();
                    deferred.resolve(data);
                }, function (reject) {
                    _this.hideBusyIndicator();
                    _this.showBackendErrorMessage(reject);
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            BackendService.prototype.showBusyIndicator = function () {
                if (!this.backendConfig.config.enableBusyIndicator) {
                    return;
                }
                this.busyIndicator.show();
            };
            BackendService.prototype.hideBusyIndicator = function () {
                if (!this.backendConfig.config.enableBusyIndicator) {
                    return;
                }
                this.busyIndicator.hide();
            };
            BackendService.prototype.showBackendErrorMessage = function (reject) {
                if (!this.backendConfig.config.enableMessageOverlay) {
                    return;
                }
                this.backendError(reject);
            };
            BackendService.prototype.showErrorMessage = function (title, message) {
                var _this = this;
                this.messageOverlay.set({
                    buttons: [{
                            id: 'ok',
                            displayName: this.$translate.instant('common.ok'),
                            onClickCallback: function () {
                                _this.hideErrorMessage();
                            }
                        }],
                    title: title,
                    text: message
                });
                this.messageOverlay.show();
            };
            BackendService.prototype.hideErrorMessage = function () {
                this.messageOverlay.hide();
            };
            BackendService.$inject = ['$q', '$translate', 'common', 'common.services.runtime.commandService', 'common.services.runtime.dataService', 'common.services.runtime.archivingDataService',
                'common.widgets.busyIndicator.service', 'common.widgets.messageOverlay.service', 'common.services.logger.service', 'common.services.runtime.backendConfig', 'common.services.signalManager', 'CommandResponse', 'ExecutionError'];
            return BackendService;
        }());
        framework.BackendService = BackendService;
        angular.module('siemens.simaticit.common.services.runtime')
            .provider('common.services.runtime.backendConfig', BackendConfig)
            .service('common.services.runtime.backendService', BackendService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=backend-svc.js.map
(function () {
    'use strict';

    /**
     * @ngdoc type
     * @name common.services.runtime.dataModel
     * @module siemens.simaticit.common.services.runtime
     * @access internal
     *
     * @description
     * This module provides information on a business entity.
     *
     * @property {String} entityName The entity name.
     * @property {String} properties The property list of an entity.
     * @property {String} orderBy The order-by property of an entity.
     * @property {String} filter The filter-by property of an entity.
     */
    angular.module('siemens.simaticit.common.services.runtime').factory('common.services.runtime.dataModel', [function () {
        function DataModel(EntityName, Properties, OrderBy, Filter) {
            this.entityName = EntityName;
            this.properties = Properties;
            this.orderBy = OrderBy;
            this.filter  = Filter;
        }
        return DataModel;
    }]);


})();

"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
            * @ngdoc provider
            * @name common.services.runtime.DataConfigProvider
            * @module siemens.simaticit.common.services.runtime
            * @description
            * Configures the endpoint for the runtime service layer where data will be retrieved. This property is automatically set when the UI Application starts.
            *
            * @property {Object} config An object with an **applicationServiceUrls** and **applicationArchivingServiceUrls** property, containing service end points for each deployed packages.
            */
        var DataConfigProvider = /** @class */ (function () {
            function DataConfigProvider() {
                this.config = {
                    // These are the properties we need to set
                    applicationServiceUrls: {},
                    applicationArchivingServiceUrls: {}
                };
            }
            /**
                * @ngdoc service
                * @name common.services.runtime.DataConfig
                * @module siemens.simaticit.common.services.runtime
                * @description
                * Configures the endpoint for the runtime service layer where data will be retrieved. This property is automatically set when the UI Application starts.
                *
                * @property {Object} config An object with an **applicationServiceUrls** and **applicationArchivingServiceUrls** property, containing service end points for each deployed packages.
                */
            DataConfigProvider.prototype.$get = function () {
                return {
                    config: this.config
                };
            };
            return DataConfigProvider;
        }());
        framework.DataConfigProvider = DataConfigProvider;
        angular.module('siemens.simaticit.common.services.runtime').provider('common.services.runtime.DataConfig', [DataConfigProvider]);
        /**
            * @ngdoc service
            * @name common.services.runtime.dataService
            * @module siemens.simaticit.common.services.runtime
            * @requires $q
            * @requires $resource
            * @requires $http
            * @requires service:CommandResponse
            * @requires service:ExecutionError
            * @requires common.services.runtime.DataConfig
            *
            * @description
            * Exposes a set of methods that can be used to retrieve runtime entities.
            *
            * @example
            * In a controller, the **common.services.runtime.dataService** can be used as follows:
            *
            * ```
            *    vm.findAll = findAll;
            *    vm.read = read;
            *    vm.getCount = getCount;
            *
            *    function findAll() {
            *       var findAllPayload = {
            *           appName: "TestApp",
            *           entityName: "TestEntity",
            *           options: "$select=Name,Quantity"
            *       };
            *        busyIndicatorService.show();
            *        result = null;
            *        dataService.findAll(findAllPayload).then( function(data) {
            *            result = data;
            *            busyIndicatorService.hide();
            *        }, function (error) {
            *            busyIndicatorService.hide();
            *            messageOverlayService.setOverlayData({
            *                buttons: [{
            *                    id: 'ok',
            *                    displayName: 'OK',
            *                    onClickCallback: function () {
            *                        // some logic goes here
            *                        messageOverlayService.hideOverlayModal();
            *                    }
            *                }],
            *                title: "Backend Data Error",
            *                text: error.data.error.errorCode + ' - ' + error.data.error.errorMessage
            *            });
            *            messageOverlayService.showOverlayModal();
            *        });
            *    }
            *
            *   function read() {
            *       busyIndicatorService.show();
            *       var readPayload = {
            *           appName: "DemoApp",
            *           functionName: "myFunc",
            *           params: { id: 1234 }
            *           options: "$select=Name, Quantity"
            *       };
            *       dataService.read(readPayload).then(function (data) {
            *           result = data;
            *           busyIndicatorService.hide();
            *       }, function (error) {
            *           busyIndicatorService.hide();
            *           messageOverlayService.setOverlayData({
            *               buttons: [{
            *                   id: 'ok',
            *                   displayName: 'OK',
            *                   onClickCallback: function () {
            *                       // some logic goes here
            *                       messageOverlayService.hideOverlayModal();
            *                   }
            *               }],
            *               title: "Backend Data Error",
            *               text: error.data.error.errorCode + ' - ' + error.data.error.errorMessage
            *           });
            *           messageOverlayService.showOverlayModal();
            *       });
            *   }
            *
            *   function getCount() {
            *       vm.count = null;
            *       var countPayload = {
            *           appName: "TestApp",
            *           entityName: "TestEntity",
            *           options: "$filter= Name eq 'Test1'"
            *       };
            *       busyIndicatorService.show();
            *       dataService.getCount(countPayload).then(function (data) {
            *           busyIndicatorService.hide();
            *           vm.count = data.count;
            *       }, function (error) {
            *           vm.count = "";
            *           busyIndicatorService.hide();
            *           messageOverlayService.setOverlayData({
            *                    buttons: [{
            *                    id: 'ok',
            *                    displayName: 'OK',
            *                    onClickCallback: function () {
            *                       // some logic goes here
            *                       messageOverlayService.hideOverlayModal();
            *                    }
            *               }],
            *               title: "Backend Data Error",
            *               text: error.data.error.errorCode + ' - ' + error.data.error.errorMessage
            *           });
            *         messageOverlayService.showOverlayModal();
            *       });
            *   }
            *
            *```
            */
        var BusinessData = /** @class */ (function () {
            function BusinessData($q, $resource, $http, $translate, common, CommandResponse, ExecutionError, businessDataConfig) {
                var _this = this;
                this.$q = $q;
                this.$resource = $resource;
                this.$http = $http;
                this.$translate = $translate;
                this.common = common;
                this.CommandResponse = CommandResponse;
                this.ExecutionError = ExecutionError;
                this.ERRORS = function (statusCode) {
                    switch (statusCode) {
                        case 404: return _this.$translate.instant('ERRORS.404');
                        case 503: return _this.$translate.instant('ERRORS.503');
                        case 400: return _this.$translate.instant('ERRORS.400');
                        case 403: return _this.$translate.instant('ERRORS.403');
                        case 500: return _this.$translate.instant('ERRORS.500');
                        case 502: return _this.$translate.instant('ERRORS.502');
                        case '4XX': return _this.$translate.instant('ERRORS.4XX');
                        case '5XX': return _this.$translate.instant('ERRORS.5XX');
                    }
                };
                this.METADATA = '$metadata';
                this.XML_FORMAT = '$format=xml';
                this.COUNT = '$count';
                this.SLASH = '/';
                this.QUERY_IDENTIFIER = '?';
                this.RESPONSE_SUCCESS_SERIES = '2XX';
                this.transformResObj = function (data, headersGetter, statusCode) {
                    var res = null;
                    if (data) {
                        try {
                            var Jsondata = JSON.parse(data);
                            //odata Response Error
                            if (Jsondata['odata.error']) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(Jsondata['odata.error'].code, Jsondata['odata.error'].message.value));
                                _this.common.logger.logError(Jsondata['odata.error'].code + ' : ' + Jsondata['odata.error'].message.value, '', 'Business Data Service');
                            }
                            //odata Response with data
                            if (Jsondata['@odata.context']) {
                                // is there any error from reading function? if yes: handle like error
                                if (Jsondata.Error) {
                                    res = new _this.CommandResponse(Jsondata.Succeeded, new _this.ExecutionError(Jsondata.Error.ErrorCode, Jsondata.Error.ErrorMessage));
                                    res.data = Jsondata;
                                }
                                else {
                                    res = new _this.CommandResponse(true, new _this.ExecutionError(0, ''));
                                    var suffix = '$entity';
                                    if (Jsondata['@odata.context'].indexOf(suffix, Jsondata['@odata.context'].length - suffix.length) !== -1) {
                                        delete Jsondata['@odata.context'];
                                        res.value = [Jsondata];
                                    }
                                    else {
                                        res.value = Jsondata.value;
                                    }
                                    // parse count from response
                                    if (Jsondata['@odata.count'] !== undefined) {
                                        res.count = Jsondata['@odata.count'];
                                    }
                                }
                            }
                            //http error
                            if (Jsondata.error) {
                                if (_this.ERRORS(statusCode)) {
                                    res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                                    _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Business Data Service');
                                }
                                else {
                                    res = new _this.CommandResponse('false', new _this.ExecutionError(Jsondata.error.code, Jsondata.error.message));
                                    _this.common.logger.logError(Jsondata.error.code + ' : ' + Jsondata.error.message, '', 'Business Data Service');
                                }
                            }
                        }
                        catch (ex) {
                            var errorSeries = Math.floor(statusCode / 100);
                            if (_this.ERRORS(statusCode)) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Business Data Service');
                            }
                            else if (_this.ERRORS(errorSeries + 'XX')) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(errorSeries + 'XX')));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(errorSeries + 'XX') + '', 'Business Data Service');
                            }
                            else {
                                if (ex.message === null || ex.message === '') {
                                    ex.message = _this.$translate.instant('svcErrors.business.defaultErrorMessage');
                                }
                                res = new _this.CommandResponse(false, new _this.ExecutionError(-1, "Error: " + ex.message));
                                _this.common.logger.logError('-1: Error: ' + ex.message, '', 'Business Data Service');
                            }
                        }
                    }
                    else {
                        res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Generic Error'));
                        _this.common.logger.logError('-1: Error: Generic Error', '', 'Business Data Service');
                    }
                    return res;
                };
                this.transformResMeta = function (data, headersGetter, statusCode) {
                    var res = null;
                    if (!data) {
                        res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Generic Error'));
                        _this.common.logger.logError('-1: Error: Generic Error', '', 'Business Data Service');
                        return res;
                    }
                    return { data: data };
                };
                this.transformResCount = function (data, headersGetter, statusCode) {
                    var res = null;
                    //current response series
                    var responseSeries = statusCode.toString().charAt(0) + 'XX';
                    // check for 2xx(successful response) series
                    var isResponseSuccess = responseSeries === _this.RESPONSE_SUCCESS_SERIES;
                    if (data) {
                        try {
                            var response = JSON.parse(data);
                            //on success return data and on failure return error response
                            res = isResponseSuccess ? { count: response } : _this.getErrorResponse(response, statusCode, responseSeries);
                        }
                        catch (exception) {
                            res = _this.getErrorResponse(exception, statusCode, responseSeries);
                        }
                    }
                    else {
                        _this.logError('-1', 'Generic Error');
                        res = _this.getCommandResponse(false, -1, 'Generic Error');
                    }
                    return res;
                };
                this.applicationServiceUrls = businessDataConfig.config.applicationServiceUrls;
            }
            BusinessData.prototype.escapeSpecialCharacters = function (path) {
                var result = path;
                var parts = path.split('?');
                if (parts.length > 1) {
                    result = parts[0];
                    for (var i = 1; i < parts.length; parts++) {
                        // this to avoid removal of :string from the path
                        // $resource uses : to identify parameters.
                        // which intern replaces :along_with_string is removed.
                        result += '?' + parts[i].split(':').join('\\:');
                    }
                }
                return result;
            };
            BusinessData.prototype.getCmd = function (path) {
                var escapedPath = this.escapeSpecialCharacters(path);
                return this.$resource('', {}, {
                    getAll: {
                        method: 'Get',
                        url: escapedPath,
                        transformResponse: [this.transformResObj].concat(this.$http.defaults.transformResponse)
                    }
                });
            };
            BusinessData.prototype.getMetaDataCmd = function (path) {
                var escapedPath = this.escapeSpecialCharacters(path);
                return this.$resource('', {}, {
                    getAllMeta: {
                        method: 'Get',
                        url: escapedPath,
                        transformResponse: [this.transformResMeta]
                    }
                });
            };
            BusinessData.prototype.getCountCmd = function (path) {
                var escapedPath = this.escapeSpecialCharacters(path);
                return this.$resource('', {}, {
                    getAllCount: {
                        method: 'Get',
                        url: escapedPath,
                        transformResponse: [this.transformResCount]
                    }
                });
            };
            BusinessData.prototype.getErrorResponse = function (data, statusCode, responseSeries) {
                if (data.hasOwnProperty('Message')) {
                    this.logError(statusCode, data.Message);
                    return this.getCommandResponse(false, statusCode, data.Message);
                }
                else if (this.ERRORS(statusCode)) {
                    this.logError(statusCode, this.ERRORS(statusCode));
                    return this.getCommandResponse(false, statusCode, this.ERRORS(statusCode));
                }
                else if (this.ERRORS(responseSeries)) {
                    this.logError(statusCode, this.ERRORS(statusCode));
                    return this.getCommandResponse(false, statusCode, this.ERRORS(responseSeries));
                }
                else if (data.hasOwnProperty('message')) {
                    this.logError('-1', data.message);
                    return this.getCommandResponse(false, -1, data.message);
                }
            };
            BusinessData.prototype.getCommandResponse = function (isSucceeded, errorCode, errorMessage) {
                return new this.CommandResponse(isSucceeded, new this.ExecutionError(errorCode, "Error: " + errorMessage));
            };
            BusinessData.prototype.logError = function (statusCode, message) {
                this.common.logger.logError(statusCode + ' Error: ' + message + ' Business Data Service');
            };
            BusinessData.prototype.getAppEndPoint = function (appName) {
                if (!this.applicationServiceUrls.hasOwnProperty(appName)) {
                    return null;
                }
                return this.applicationServiceUrls[appName];
            };
            BusinessData.prototype.setAppEndPoint = function (appName, url) {
                this.applicationServiceUrls[appName] = url;
            };
            /**
                * @ngdoc type
                * @name QueryModel
                * @module siemens.simaticit.common.services.runtime
                *
                * @description
                * Represents an OData query to be executed on an entity within an App.
                *
                * @property {string} appName The name of the App conaining the entity to be queried.
                * @property {string} entityName The name of the runtime entity to be queried.
                * @property {string} options An OData query string to represent the query parameters for the entity.
                * @property {FacetInfo} facetInfo Represents the information while sorting entities on properties from facets. See {@link type:FacetInfo}.
                * @property {DataTransformInfo} dataTransformInfo The information to transform the resultant data in a required format. See {@link type:DataTransformInfo}.
            */
            /**
                 * @ngdoc type
                 * @name FacetInfo
                 * @module siemens.simaticit.common.services.runtime
                 *
                 * @description
                 * Represents the information while sorting entities on properties from facet.
                 *
                 * @property {string} name The name of the runtime facet to which the property choosen for sorting belongs to.
                 * @property {string} queryParams OData query parameters applicable for facet.
                 * @property {PrevReqState} prevReqState The information to query facet and entity and required for pagination. See {@link type:PrevReqState}.
            */
            /**
                * @ngdoc type
                * @name DataTransformInfo
                * @module siemens.simaticit.common.services.runtime
                *
                * @description
                * Represents the information to transform the resultant data in a required format.
                *
                * @property {FacetKeys} facetKeys Represents the data transformation info. See {@link type:FacetKeys}.
                *
                * Example:
                * ```
                * dataTransformInfo : {
                *        facetKeys: {
                *            Defect: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Defect' },
                *            Location: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Location' },
                *            Status: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Status' }
                *        }
                * }
                * ```
            */
            /**
                * @ngdoc type
                * @name FacetKeys
                * @module siemens.simaticit.common.services.runtime
                *
                * @description
                * Represents the information to transform the resultant data in a required format.
                *
                * @property {string} key Denotes the property name to which the result of transformation will be assigned in the response.
                * @property {FacetFQN} facetFQN Denotes the information for identifying the facet undergoing transformation. See {@link type:FacetFQN}.
                *
                * Example:
                * ```
                *        facetKeys: {
                *            Defect: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Defect' },
                *            Location: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Location' },
                *            Status: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Status' }
                *        }
                * ```
            */
            /**
                * @ngdoc type
                * @name FacetFQN
                * @module siemens.simaticit.common.services.runtime
                *
                * @description
                * Represents the information for identifying the facet undergoing transformation.
                *
                * @property {string} fullyQualifiedName Denotes the fully Qualified Name of the facet undergoing transformation as exposed from metadata.
                *
                * Example:
                * ```
                *        Alias_Key: { fullyQualifiedName: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Status' }
                * ```
            */
            /**
                 * @ngdoc type
                 * @name PrevReqState
                 * @module siemens.simaticit.common.services.runtime
                 *
                 * @description
                 * Represents the information required from the previous request for sorting entities.
                 * Optional while retrieving data for client side configuration.
                 *
                 * @property {Boolean} areMoreFacetsAvailable Boolean flag to denotes if the query to fetch facets must be performed or not.
                 * @property {Number} entityQueriedCount Denotes the previously queried entity count.
                 * @property {Number} facetQueriedCount Denotes the previously queried facet count.
                 * @property {Number} totalFacetCount Denotes the number of facets instances.
                 * @property {Number} totalEntityCount Denotes the number of entity instances.
            */
            /**
                 * @ngdoc type
                 * @name Extension
                 * @module siemens.simaticit.common.services.runtime
                 *
                 * @description
                 * Represents the information of each extension for a reading function.
                 * Optional while retrieving data from reading function without extensions.
                 *
                 * @property {string} entity Denotes the root entity for the reading function.
                 * @property {string} app Denotes the Short App Name from where the facets are exposed.
                 * @property {string} bindingProperty One of the output parameter from the Reading Function. Useful in retrieving the facets related to the root entity. Denotes the logical key of the Entity and also the foreign key for the facets.
                 * @property {Facet} facets Represents the information for all the Facets used for extending a reading function.
                 *
                 * Example:
                 * ```
                 *        {
                 *            entity:
                 *            app:
                 *            bindingProperty:
                 *            facets: [
                 *                      {
                 *                          fullInfo: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Defect',
                 *                          shortName: 'Defect',
                 *                          alias: 'EXT_Defect'
                 *                      },
                 *                      {
                 *                          fullInfo: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Location',
                 *                          shortName: 'Location',
                 *                          alias: 'EXT_Location'
                 *                      }
                 *                    ]
                 *        }
                 * ```
            */
            /**
                 * @ngdoc type
                 * @name Facet
                 * @module siemens.simaticit.common.services.runtime
                 *
                 * @description
                 * Represents the information of each Facet used for extending a reading function.
                 * Optional while retrieving data from reading function without extensions.
                 *
                 * @property {string} fullInfo Denotes the fully qualified name for the facet as exposed from the reading model.
                 * @property {string} shortName Denotes the short Name of the facet.
                 * @property {string} alias Denotes the unique alias given for the facet while configuring extensions.
                 *
                 * Example:
                 * ```
                 *        {
                 *          fullInfo: 'Siemens.MaterialFacetsTest.MaterialFacetsTest.VKPOMModel.DataModel.ReadingModel.Defect',
                 *          shortName: 'Defect',
                 *          alias: 'EXT_Defect'
                 *        }
                 * ```
            */
            /**
            * @ngdoc method
            * @name common.services.runtime.dataService#findAll
            * @module siemens.simaticit.common.services.runtime
            * @param {QueryModel} object See {@link type:QueryModel}.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            *
            * @description
            * Retrieves data from an entity exposed by an App on the Runtime Service Layer.
            *
            * To retrieve entities sorted on properties from facets, provide value for:
            ** **facetInfo**: Object representing query parameters for the entity and information for facet. See {@link type:FacetInfo}.
            *
            * To retrieve entities with transformed facet data provide value for:
            ** **dataTransformInfo**: The information to transform the resultant data in a required format. See {@link type:DataTransformInfo}.
            *
            * To retrieve extensions such as facets along with a View, provide value for:
            ** **extensions**: Array of **Extension** object representing information for facet. See {@link type:Extension}.
            *
            */
            BusinessData.prototype.findAll = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!object) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.executeNoInput'))) });
                    return deferred.promise;
                }
                if (object.extensions && object.extensions.length > 0) {
                    this.getEntity(object).then(function (data) {
                        if (!data.value || data.value.length === 0) {
                            deferred.resolve(data);
                        }
                        else {
                            _this.getExtensionsData(data.value, object.extensions).then(function (mergedData) {
                                data.value = mergedData;
                                deferred.resolve(data);
                            }, function (err) {
                                var exeError = _this.common.setExecutionError(err);
                                deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                            });
                        }
                    }, function (reject) {
                        deferred.reject(reject);
                    });
                }
                else if (object.facetInfo) {
                    this.getEntitySortedOnFacetProperty(object).then(function (data) {
                        if (object.dataTransformInfo) {
                            deferred.resolve(_this.transformFacetData(data, object.dataTransformInfo));
                        }
                        else {
                            deferred.resolve(data);
                        }
                    }, function (reject) {
                        deferred.reject(reject);
                    });
                }
                else {
                    this.getEntity(object).then(function (data) {
                        if (object.dataTransformInfo) {
                            deferred.resolve(_this.transformFacetData(data, object.dataTransformInfo));
                        }
                        else {
                            deferred.resolve(data);
                        }
                    }, function (reject) {
                        deferred.reject(reject);
                    });
                }
                return deferred.promise;
            };
            BusinessData.prototype.getEntity = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                var applicationServiceUrls = this.applicationServiceUrls;
                var appName = object.appName;
                var appPath = applicationServiceUrls[appName];
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                var path = '';
                if (!object.entityName) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noEntityName'))) });
                }
                else {
                    try {
                        if (appPath.slice(-1) !== "/") {
                            appPath = appPath + '/';
                        }
                        path = appPath + object.entityName;
                        if (object.options) {
                            path += '?' + object.options;
                        }
                        var fnc = this.getCmd(path);
                        return fnc.getAll(function (data) {
                            deferred.resolve(data);
                        }, function (err) {
                            var exeError = _this.common.setExecutionError(err);
                            deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                        }).$promise;
                    }
                    catch (jse) {
                        deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: jse.message } } });
                    }
                }
                return deferred.promise;
            };
            BusinessData.prototype.getEntitySortedOnFacetProperty = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                var totalEntityCount = null;
                if (!object.facetInfo) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noPrevReqState'))) });
                    return deferred.promise;
                }
                if (!object.facetInfo.name) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noFacetName'))) });
                    return deferred.promise;
                }
                if (!object.facetInfo.prevReqState) {
                    object.facetInfo.prevReqState = {
                        areMoreFacetsAvailable: true
                    };
                }
                var entitiesSortedOnFacetProperties = [];
                var stateInfo = {
                    facetQueriedCount: object.facetInfo.prevReqState.facetQueriedCount ? object.facetInfo.prevReqState.facetQueriedCount : 0,
                    entityQueriedCount: object.facetInfo.prevReqState.entityQueriedCount ? object.facetInfo.prevReqState.entityQueriedCount : 0,
                    totalFacetCount: object.facetInfo.prevReqState.totalFacetCount ? object.facetInfo.prevReqState.totalFacetCount : 0,
                    totalEntityCount: object.facetInfo.prevReqState.totalEntityCount ? object.facetInfo.prevReqState.totalEntityCount : 0,
                    areMoreFacetsAvailable: object.facetInfo.prevReqState.areMoreFacetsAvailable
                };
                var rowsToTake = this.getRowsToTake(object.options);
                this.getTotalEntityCount(object).then(function (count) {
                    totalEntityCount = count;
                    if (!object.facetInfo.prevReqState.areMoreFacetsAvailable) {
                        _this.queryEntityAfterSortingOnFacetProperty(object, stateInfo, entitiesSortedOnFacetProperties).then(function (data) {
                            data.stateInfo = stateInfo;
                            deferred.resolve(data);
                        }, function (reject) {
                            deferred.reject(reject);
                        });
                        return deferred.promise;
                    }
                    var facetParams = {
                        entityName: object.facetInfo.name,
                        appName: object.appName,
                        options: object.facetInfo.queryParams
                    };
                    _this.processFacetProjection(facetParams, object.entityName).then(function (data) {
                        stateInfo.facetQueriedCount = data.value.length;
                        stateInfo.totalFacetCount = data.count;
                        entitiesSortedOnFacetProperties = data.value;
                        data.count = totalEntityCount ? totalEntityCount + data.count : data.count;
                        if (rowsToTake) {
                            if (rowsToTake === entitiesSortedOnFacetProperties.length) {
                                stateInfo.entityQueriedCount = 0;
                                data.stateInfo = stateInfo;
                                deferred.resolve(data);
                                return;
                            }
                            if (entitiesSortedOnFacetProperties.length > 0 && entitiesSortedOnFacetProperties.length <= rowsToTake) {
                                stateInfo.areMoreFacetsAvailable = false;
                            }
                            _this.computeNewRowsToTakeForEntity(rowsToTake, object, stateInfo);
                        }
                        _this.queryEntityAfterSortingOnFacetProperty(object, stateInfo, entitiesSortedOnFacetProperties).then(function (data) {
                            data.stateInfo = stateInfo;
                            deferred.resolve(data);
                        }, function (reject) {
                            deferred.reject(reject);
                        });
                    }, function (reject) {
                        deferred.reject(reject);
                    });
                }, function (reject) {
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            BusinessData.prototype.computeNewRowsToTakeForEntity = function (rowsToTake, object, stateInfo) {
                var regexExpr = /\$top=[0-9]+/; //NOSONAR
                var newTakeForEntity;
                if (stateInfo.facetQueriedCount >= 0) {
                    newTakeForEntity = rowsToTake - stateInfo.facetQueriedCount;
                    object.options = object.options.replace(regexExpr, '$top=' + newTakeForEntity);
                }
            };
            BusinessData.prototype.getRowsToTake = function (entityQueryParams) {
                var regexExpr = /\$top=\d+&/; //NOSONAR
                var parsedRowsToTake = null;
                if (entityQueryParams) {
                    var stringContainingTop = entityQueryParams.match(regexExpr);
                    if (stringContainingTop) {
                        regexExpr = /\d+/; //NOSONAR
                        var extractedRowsToTake = stringContainingTop.toString().match(regexExpr);
                        if (extractedRowsToTake) {
                            parsedRowsToTake = parseInt(extractedRowsToTake.toString(), 10);
                        }
                    }
                }
                return parsedRowsToTake;
            };
            BusinessData.prototype.getTotalEntityCount = function (object) {
                var deferred = this.$q.defer();
                var totalEntityCount;
                if (object.options.indexOf('$count=true') >= 0 && object.facetInfo.queryParams.indexOf('$skip=0') >= 0) {
                    var entityParams = {
                        entityName: object.entityName,
                        appName: object.appName,
                        options: object.options
                    };
                    this.getEntity(entityParams).then(function (data) {
                        totalEntityCount = data.count;
                        deferred.resolve(totalEntityCount);
                    }, function (reject) {
                        deferred.reject(reject);
                    });
                }
                else {
                    deferred.resolve(null);
                }
                return deferred.promise;
            };
            BusinessData.prototype.transformFacetData = function (response, dataTransformInfo) {
                var _this = this;
                if (response.value && dataTransformInfo.facetKeys) {
                    response.value.forEach(function (item) {
                        var facetObj = _this.convertFacetsArrayIntoObj(item);
                        Object.keys(dataTransformInfo.facetKeys).forEach(function (key) {
                            var facetInfo = facetObj[dataTransformInfo.facetKeys[key].fullyQualifiedName];
                            if (facetInfo) {
                                item[key] = facetInfo;
                            }
                        });
                        delete (item.Facets);
                    });
                }
                return response;
            };
            BusinessData.prototype.convertFacetsArrayIntoObj = function (item) {
                var facetObj = {};
                if (item.Facets) {
                    item.Facets.forEach(function (facet) {
                        var odataType = facet['@odata.type'].replace('#', '');
                        facetObj[odataType] = facet;
                    });
                }
                return facetObj;
            };
            BusinessData.prototype.processFacetProjection = function (object, entityName) {
                var deferred = this.$q.defer();
                this.getEntity(object).then(function (data) {
                    data.value = data.value.map(function (item) { return item[entityName]; });
                    deferred.resolve(data);
                }, function (reject) {
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            BusinessData.prototype.queryEntityAfterSortingOnFacetProperty = function (object, stateInfo, sortedEntityList) {
                var deferred = this.$q.defer();
                var entityParams = {
                    entityName: object.entityName,
                    appName: object.appName,
                    options: object.options
                };
                this.getEntity(entityParams).then(function (data) {
                    stateInfo.totalEntityCount = data.count;
                    data.count = data.count + stateInfo.totalFacetCount;
                    stateInfo.entityQueriedCount += data.value.length;
                    data.value.forEach(function (entity) { sortedEntityList.push(entity); });
                    data.value = sortedEntityList;
                    data.stateInfo = stateInfo;
                    deferred.resolve(data);
                }, function (reject) {
                    deferred.reject(reject);
                });
                return deferred.promise;
            };
            BusinessData.prototype.getQueryStringForFilteringOnId = function (readingFunctionResponse, entity, bindingProperty) {
                var commaSeperatedIds = readingFunctionResponse.reduce(function (accumulator, item, index) {
                    if (index !== readingFunctionResponse.length - 1)
                        return "".concat(accumulator, "'").concat(item[bindingProperty], "',");
                    else
                        return "".concat(accumulator, "'").concat(item[bindingProperty], "'");
                }, '');
                return "$filter=".concat(entity, "_Id in (").concat(commaSeperatedIds, ")");
            };
            BusinessData.prototype.getExtensionDataInChunks = function (baseResponseChunk, extensions) {
                var _this = this;
                var deferred = this.$q.defer();
                var allPromises = [];
                extensions.forEach(function (extension) {
                    if (extension.bindingProperty) {
                        var params = {
                            appName: extension.app,
                            entityName: extension.entity + 'Facet',
                            options: _this.getQueryStringForFilteringOnId(baseResponseChunk, extension.entity, extension.bindingProperty)
                        };
                        var promise = _this.findAll(params);
                        allPromises.push(promise);
                        promise.then(function (data) {
                            var tempObj = {};
                            if (data.value && data.value.length > 0) {
                                data.value.forEach(function (item) {
                                    var id = item["".concat(extension.entity, "_Id")];
                                    if (!tempObj[id])
                                        tempObj[id] = {};
                                    tempObj[id][item['@odata.type']] = item;
                                });
                                baseResponseChunk.forEach(function (item) {
                                    extension.facets.forEach(function (facet) {
                                        var obj = tempObj[item[extension.bindingProperty]];
                                        if (obj)
                                            item[facet.alias] = obj["#".concat(facet.fullName)] || {};
                                        else
                                            item[facet.alias] = {};
                                    });
                                });
                            }
                        });
                    }
                });
                this.$q.all(allPromises).then(function () {
                    deferred.resolve(baseResponseChunk);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            };
            BusinessData.prototype.getExtensionsData = function (baseResponse, extensions) {
                var deferred = this.$q.defer();
                var promises = [];
                var chunkSize = 25;
                var numberOfCalls = Math.floor(baseResponse.length / chunkSize);
                if (baseResponse.length % chunkSize !== 0) {
                    numberOfCalls += 1;
                }
                var _loop_1 = function (i) {
                    var startIndex = i * chunkSize;
                    var endIndex = (i + 1) * chunkSize;
                    var promise = this_1.getExtensionDataInChunks(baseResponse.slice(startIndex, endIndex), extensions);
                    promises.push(promise);
                    promise.then(function (data) {
                        baseResponse.splice.apply(baseResponse, __spreadArray([startIndex, chunkSize], data, false));
                    });
                };
                var this_1 = this;
                for (var i = 0; i < numberOfCalls; i++) {
                    _loop_1(i);
                }
                this.$q.all(promises).then(function () {
                    deferred.resolve(baseResponse);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            };
            /**
            * @ngdoc type
            * @name FunctionModel
            * @module siemens.simaticit.common.services.runtime
            * @description
            * Represents an input object used to execute a reading function on a runtime App.
            *
            * @property {string} appName The name of the App containing the function to execute.
            * @property {string} functionName The name of the function to execute on the App.
            * @property {Object} params An object containing the function parameters.
            * @property {Array} extensions An array of {Extension} objects containing the information for the facets retrieval.
            * @property {string} options An OData-compliant query string.
            */
            /**
            * @ngdoc method
            * @name common.services.runtime.dataService#read
            * @module siemens.simaticit.common.services.runtime
            * @param {FunctionModel} object See {@link type:FunctionModel}.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            *
            * @description
            * Executes a reading API exposed by an App and returns the response.
            *
            *
            * To retrieve extensions such as facets along with Reading Function, provide value for:
            ** **extensions**: Array of **Extension** object representing information for facet. See {@link type:Extension}.
            *
            */
            BusinessData.prototype.read = function (object) {
                var _this = this;
                var deferred = this.$q.defer();
                var applicationServiceUrls = this.applicationServiceUrls;
                if (!object) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.executeNoInput'))) });
                    return deferred.promise;
                }
                var appName = object.appName;
                var appPath = applicationServiceUrls[appName];
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                var path = '';
                if (!object.functionName) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noFunctionName'))) });
                }
                else {
                    try {
                        if (appPath.slice(-1) !== "/") {
                            appPath = appPath + '/';
                        }
                        path = appPath + object.functionName;
                        path += '(function=@x)';
                        if (object.params) {
                            var strParams = object.params;
                            if ('object' === typeof strParams) {
                                strParams = JSON.stringify(strParams);
                            }
                            path += '?@x=' + encodeURIComponent(strParams);
                        }
                        if (object.options && object.params) {
                            path += '&' + object.options;
                        }
                        else if (object.options) {
                            path += '?' + object.options;
                        }
                        var fnc = this.getCmd(path);
                        fnc.getAll(function (data) {
                            if (!object.extensions || object.extensions.length === 0 || !data.value || data.value.length === 0) {
                                deferred.resolve(data);
                            }
                            else {
                                _this.getExtensionsData(data.value, object.extensions).then(function (mergedData) {
                                    data.value = mergedData;
                                    deferred.resolve(data);
                                }, function (err) {
                                    var exeError = _this.common.setExecutionError(err);
                                    deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                                });
                            }
                        }, function (err) {
                            var exeError = _this.common.setExecutionError(err);
                            deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                        });
                    }
                    catch (jse) {
                        deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: jse.message } } });
                    }
                }
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @access internal
            * @name common.services.runtime.dataService#getMetaData
            * @module siemens.simaticit.common.services.runtime
            * @param {String} appName Name of the App whose metadata is to be extracted.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            * @description Retrieves the metadata in XML format.
            */
            BusinessData.prototype.getMetaData = function (appName) {
                var _this = this;
                var deferred = this.$q.defer();
                var path = '';
                var applicationServiceUrls = this.applicationServiceUrls;
                if (!appName) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.executeNoInput'))) });
                    return deferred.promise;
                }
                var appPath = applicationServiceUrls[appName];
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                try {
                    if (appPath.slice(-1) !== "/") {
                        appPath = appPath + '/';
                    }
                    path = appPath + this.METADATA + '?' + this.XML_FORMAT;
                    var fnc = this.getMetaDataCmd(path);
                    return fnc.getAllMeta(function (data) {
                        deferred.resolve(data);
                    }, function (err) {
                        var exeError = _this.common.setExecutionError(err);
                        deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                    }).$promise;
                }
                catch (exception) {
                    deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: exception.message } } });
                }
                return deferred.promise;
            };
            /**
            * @ngdoc method
            * @name common.services.runtime.dataService#getCount
            * @module siemens.simaticit.common.services.runtime
            * @param {QueryModel} queryObject See {@link type:QueryModel}.
            * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
            * @description Retrieves the count of records from an entity exposed by an App on the Runtime Service Layer.
            */
            BusinessData.prototype.getCount = function (queryObject) {
                var _this = this;
                var deferred = this.$q.defer();
                var applicationServiceUrls = this.applicationServiceUrls;
                if (!queryObject) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.executeNoInput'))) });
                    return deferred.promise;
                }
                var appName = queryObject.appName;
                var appPath = applicationServiceUrls[appName];
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                var path = '';
                if (!queryObject.entityName) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noEntityName'))) });
                }
                else {
                    try {
                        if (appPath.slice(-1) !== this.SLASH) {
                            appPath = appPath + this.SLASH;
                        }
                        path = appPath + queryObject.entityName + this.SLASH + this.COUNT;
                        if (queryObject.options) {
                            path += this.QUERY_IDENTIFIER + queryObject.options;
                        }
                        var fnc = this.getCountCmd(path);
                        return fnc.getAllCount(function (data) {
                            deferred.resolve(data);
                        }, function (err) {
                            var exeError = _this.common.setExecutionError(err);
                            deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(exeError.data.error.errorCode, exeError.data.error.errorMessage)) });
                        }).$promise;
                    }
                    catch (exception) {
                        deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: exception.message } } });
                    }
                }
                return deferred.promise;
            };
            BusinessData.$inject = ['$q', '$resource', '$http', '$translate', 'common', 'CommandResponse', 'ExecutionError', 'common.services.runtime.DataConfig'];
            return BusinessData;
        }());
        framework.BusinessData = BusinessData;
        angular.module('siemens.simaticit.common.services.runtime').service('common.services.runtime.dataService', BusinessData);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=business.svc.js.map
(function () {
    'use strict';

    /**
     * @ngdoc type
     * @name CommandModel
     * @module siemens.simaticit.common.services.runtime
     *
     * @description
     * Represents a runtime command.
     *
     * @property {String} appName The name of the App.
     * @property {String} commandName The name of the runtime command.
     * @property {Object} params The JSON payload of the runtime command.
     * @property {Object} additionalParams The JSON payload of the additional arguments.
     */

    /**
     * @ngdoc service
     * @name common.services.runtime.commandModel
     * @module siemens.simaticit.common.services.runtime
     * @description Factory used to create {@link type:CommandModel} objects.
     *
     * @param {String} appName The name of the app.
     * @param {String} commandName The name of the runtime command.
     * @param {Object} params The JSON payload of the runtime command.
     * @param {Object} additionalParams The JSON payload of the additional arguments.
     *
     * @returns {CommandModel} A {@link type:CommandModel} objects.
     */
    angular.module('siemens.simaticit.common.services.runtime').factory('common.services.runtime.commandModel', function () {
        function CommandModel(appName, commandName, params, additionalParams) {
            this.appName = appName;
            this.commandName = commandName;
            this.params = params;
            this.additionalParams = additionalParams;
        }
        return CommandModel;
    });


    /**
     * @ngdoc service
     * @name CommandResponse
     * @module siemens.simaticit.common.services.runtime
     * @requires service:CommandResponse
     *
     * @description
     * Factory used to create {@link siemens.simaticit.common.type:CommandResponse} objects representing responses of runtime commands.
     * @returns {CommandResponse} A {@link siemens.simaticit.common.type:CommandResponse} object.
     */
    angular.module('siemens.simaticit.common.services.runtime').factory('common.services.runtime.commandResponse', ['CommandResponse', function (Response) {
        function CommandResponse() { }
        CommandResponse.prototype = new Response();
        return CommandResponse;
    }]);



})();

"use strict";
var sit;
(function (sit) {
    var framwork;
    (function (framwork) {
        var RuntimeConfigProvider = /** @class */ (function () {
            function RuntimeConfigProvider() {
                this.config = {
                    oDataServiceURI: '',
                    applicationServiceUrls: {}
                };
            }
            RuntimeConfigProvider.prototype.$get = function () {
                return {
                    config: this.config
                };
            };
            return RuntimeConfigProvider;
        }());
        framwork.RuntimeConfigProvider = RuntimeConfigProvider;
        /**
            * @ngdoc service
            * @name common.services.runtime.commandService
            * @module siemens.simaticit.common.services.runtime
            *
            * @requires $q
            * @requires $resource
            * @requires $http
            * @requires service:CommandResponse
            * @requires service:ExecutionError
            * @requires common.services.runtime.commandModel
            *
            * @description
            * A data service, used to retrieve **runtime** data.
            * This service provides APIs to execute runtime commands.
            *
            *
            * @example
            * In a controller, the **common.services.runtime.commandService** is used as follows:
            *
            * ```
            * (function () {
            *   'use strict';
            *
            *   var app = angular.module('myModule');
            *
            *   var runtimeCtrl = 'runtimeCtrl';
            *
            *   function runtimeController(commandService) {
            *       var rt = this;
            *
            *       var cmdModel = {
            *           appName: "DemoApp",
            *           commandName: "CreateContainer",
                        params: {Name: "Test1", Product: "P-0005"},
                        additionalParams: {Param1: "MyParam1", Param2: "MyParam2"}
            *       };
            *
            *       rt.myData = null;
            *
            *       rt.executeCommand = function () {
            *       commandService.invoke(cmdModel).then(function (data) {
            *            //get response data.
            *            rt.myData = data;
            *        },function(error){
            *            //error response
            *        });
            *
            *   }
            *
            *
            *   app.controller(runtimeCtrl, ['common.services.runtime.commandService', runtimeController]);
            * })();
            *
            *
            * ```
            *
            */
        var BusinessCommands = /** @class */ (function () {
            function BusinessCommands($q, $resource, $http, $translate, common, CommandResponse, ExecutionError, RuntimeCommandModel, businessConfig) {
                var _this = this;
                this.$q = $q;
                this.$resource = $resource;
                this.$http = $http;
                this.$translate = $translate;
                this.common = common;
                this.CommandResponse = CommandResponse;
                this.ExecutionError = ExecutionError;
                this.RuntimeCommandModel = RuntimeCommandModel;
                this.businessConfig = businessConfig;
                this.ERRORS = function (statusCode) {
                    switch (statusCode) {
                        case 404: return _this.$translate.instant('ERRORS.404');
                        case 503: return _this.$translate.instant('ERRORS.503');
                        case 400: return _this.$translate.instant('ERRORS.400');
                        case 403: return _this.$translate.instant('ERRORS.403');
                        case 500: return _this.$translate.instant('ERRORS.500');
                        case 502: return _this.$translate.instant('ERRORS.502');
                        case '4XX': return _this.$translate.instant('ERRORS.4XX');
                        case '5XX': return _this.$translate.instant('ERRORS.5XX');
                    }
                };
                this.transformResObj = function (data, headersGetter, statusCode) {
                    if (!data) {
                        return new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Generic Error'));
                    }
                    var res = null;
                    try {
                        //TODO: cast message with SitUafExecutionDetail not null to a new type
                        var Jsondata = JSON.parse(data);
                        if (Jsondata.Error) {
                            res = new _this.CommandResponse(Jsondata.Succeeded, new _this.ExecutionError(Jsondata.Error.ErrorCode, Jsondata.Error.ErrorMessage));
                            res.data = Jsondata;
                        }
                        else {
                            res = new _this.CommandResponse(false, new _this.ExecutionError(Jsondata.error.code, Jsondata.error.message));
                            res.data = Jsondata;
                        }
                    }
                    catch (e) {
                        var errorSeries = Math.floor(statusCode / 100);
                        if (_this.ERRORS(statusCode)) {
                            res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                            _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Business Command Service');
                        }
                        else if (_this.ERRORS(errorSeries + 'XX')) {
                            res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(errorSeries + 'XX')));
                            _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(errorSeries + 'XX') + '', 'Business Command Service');
                        }
                        else {
                            if (e.message === null || e.message === '') {
                                e.message = _this.$translate.instant('svcErrors.business.defaultErrorMessage');
                            }
                            res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Error: ' + e.message));
                            _this.common.logger.logError('-1: Error: ' + e.message, '', 'Business Command Service');
                        }
                    }
                    return res;
                };
                this.applicationServiceUrls = businessConfig.config.applicationServiceUrls;
            }
            /**
             * @ngdoc method
             * @name common.services.runtime.commandService#invoke
             * @module siemens.simaticit.common.services.runtime
             *
             * @param {CommandModel} object See {@link type:CommandModel}
             *
             * @returns {Object} Promise object containing the command result.
             * @description Executes a runtime command and returns a Promise object containing the result.
             */
            BusinessCommands.prototype.invoke = function (inputObject) {
                var _this = this;
                var deferred = this.$q.defer();
                var path, appPath = '';
                var formatCommand;
                if (!inputObject) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidInput'))) });
                    return deferred.promise;
                }
                if (!inputObject.appName) {
                    //error
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidApp'))) });
                    return deferred.promise;
                }
                if (!inputObject.commandName) {
                    //error
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidCommand'))) });
                    return deferred.promise;
                }
                if (!inputObject.params) {
                    inputObject.params = {};
                }
                if (inputObject.additionalParams === null || inputObject.additionalParams === undefined) {
                    inputObject.additionalParams = {};
                }
                var applicationServiceUrls = this.applicationServiceUrls;
                var appName = inputObject.appName;
                appPath = applicationServiceUrls[appName];
                if (!appPath || appPath.trim() === '') {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.business.noConfig'))) });
                    return deferred.promise;
                }
                if (appPath.slice(-1) !== "/") {
                    appPath = appPath + '/';
                }
                formatCommand = inputObject.commandName;
                path = appPath + formatCommand;
                this.callCommand(path).cmd(inputObject, function (data) {
                    deferred.resolve(data);
                }, function (err) {
                    var exeError = _this.common.setExecutionError(err);
                    deferred.reject(exeError);
                });
                return deferred.promise;
            };
            BusinessCommands.prototype.transformDataObj = function (data) {
                if (Object.keys(data.additionalParams).length === 0) {
                    return {
                        command: data.params
                    };
                }
                else {
                    return {
                        command: data.params,
                        additional: data.additionalParams
                    };
                }
            };
            BusinessCommands.prototype.callCommand = function (path) {
                return this.$resource('', {}, {
                    cmd: {
                        method: 'Post',
                        url: path,
                        transformRequest: [this.transformDataObj].concat(this.$http.defaults.transformRequest),
                        transformResponse: [this.transformResObj].concat(this.$http.defaults.transformResponse)
                    }
                });
            };
            BusinessCommands.$inject = [
                '$q',
                '$resource',
                '$http',
                '$translate',
                'common',
                'CommandResponse',
                'ExecutionError',
                'common.services.runtime.commandModel',
                'common.services.runtime.Config'
            ];
            return BusinessCommands;
        }());
        framwork.BusinessCommands = BusinessCommands;
        angular.module('siemens.simaticit.common.services.runtime')
            .provider('common.services.runtime.Config', RuntimeConfigProvider)
            .service('common.services.runtime.commandService', BusinessCommands);
    })(framwork = sit.framwork || (sit.framwork = {}));
})(sit || (sit = {}));
//# sourceMappingURL=businessCommand.svc.js.map
"use strict";
/// <reference path="../engineeringData/engineering.svc.ts" />
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
        * @ngdoc provider
        * @name common.services.runtime.BusinessDataConfig
        * @module siemens.simaticit.common.services.runtime
        * @access internal
        * @description
        * Configures the path to the OData endpoint to utilize engineering data services
        * used to generate required information
        *
        * @property {string} config.oDataServiceURI Gets the URI of the data service
        */
        angular.module('siemens.simaticit.common.services.runtime').provider('common.services.runtime.BusinessDataConfig', [function () {
                this.config = {
                    oDataServiceURI: ''
                };
                this.$get = function () {
                    return {
                        config: this.config
                    };
                };
            }]);
        /**
        * @ngdoc service
        * @name common.services.runtime.SystemDataService
        * @module siemens.simaticit.common.services.runtime
        *
        * @description
        * This service is used to retrieve system data and execute system commands.
        *
        * @example
        * In a controller, the **common.services.runtime.SystemDataService** can be used as follows:
        *
        * ```
        *
        *    (function () {
        *     'use strict';
        *
        *       function RuntimeAccessController($scope, SystemDataService) {
        *            var vm = this;
        *            var entityName = 'MyEnitytName';
        *            var options = "$filter= Id ne '2'";
        *            function get() {
        *                SystemDataService.findAll(entityName, options).then(function (data) {
        *                    vm.entityValue = data.value;
        *                },
        *                function(error){
        *                    vm.entityValue = error.data.error.errorMessage;
        *                });
        *            }
        *
        *           function invokeCommand() {
        *               var inputObject = {};
        *               inputObject.commandName = 'myCmmandName';
        *               inputObject.params = {'Name':'XYZ', 'Id':456};
        *               SystemDataService.invoke(inputObject).then(function (data) {
        *                   vm.invokeResult = "Command execution succeeded = " + data.succeeded;
        *               }, function (error) {
        *                   vm.invokeResult = error.data.error.errorMessage;;
        *               });
        *           }
        *           // Getting entity data
        *           get();
        *
        *           // Invoking a command
        *           invokeCommand();
        *       }
        *       RuntimeAccessController.$inject = ['$scope', 'common.services.runtime.SystemDataService'];
        *
        *       angular
        *         .module('siemens.simaticit.common.examples')
        *         .controller('RuntimeAccessController', RuntimeAccessController);
        *    })();
        *
        *```
        */
        var BusinessSystemService = /** @class */ (function () {
            function BusinessSystemService($q, $resource, $http, $translate, $timeout, common, CommandResponse, ExecutionError, RuntimeCommandModel, engineeringBusinessConfig, entityConfig, commandConfig, plantService) {
                var _this = this;
                this.$q = $q;
                this.$resource = $resource;
                this.$http = $http;
                this.$translate = $translate;
                this.$timeout = $timeout;
                this.common = common;
                this.CommandResponse = CommandResponse;
                this.ExecutionError = ExecutionError;
                this.RuntimeCommandModel = RuntimeCommandModel;
                this.engineeringBusinessConfig = engineeringBusinessConfig;
                this.entityConfig = entityConfig;
                this.commandConfig = commandConfig;
                this.plantService = plantService;
                this.ERRORS = function (statusCode) {
                    switch (statusCode) {
                        case 404: return _this.$translate.instant('ERRORS.404');
                        case 503: return _this.$translate.instant('ERRORS.503');
                        case 400: return _this.$translate.instant('ERRORS.400');
                        case 403: return _this.$translate.instant('ERRORS.403');
                        case 500: return _this.$translate.instant('ERRORS.500');
                        case 502: return _this.$translate.instant('ERRORS.502');
                        case '4XX': return _this.$translate.instant('ERRORS.4XX');
                        case '5XX': return _this.$translate.instant('ERRORS.5XX');
                    }
                };
                this.transformResObj = function (data, headersGetter, statusCode) {
                    var res = null;
                    if (data) {
                        try {
                            var Jsondata = JSON.parse(data);
                            //odata Response Error
                            if (Jsondata['odata.error']) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(Jsondata['odata.error'].code, Jsondata['odata.error'].message.value));
                                _this.common.logger.logError(Jsondata['odata.error'].code + ' : ' + Jsondata['odata.error'].message.value, '', 'Engineering Data Service');
                            }
                            //odata Response with data
                            if (Jsondata['@odata.context']) {
                                res = new _this.CommandResponse(true, new _this.ExecutionError(0, ''));
                                //res.value = Jsondata.value;
                                var suffix = '$entity';
                                if (Jsondata['@odata.context'].indexOf(suffix, Jsondata['@odata.context'].length - suffix.length) !== -1) {
                                    delete Jsondata['@odata.context'];
                                    res.value = [Jsondata];
                                }
                                else {
                                    res.value = Jsondata.value;
                                }
                                // parse count from response
                                if (Jsondata['@odata.count']) {
                                    res.count = Jsondata['@odata.count'];
                                }
                            }
                            //http error
                            if (Jsondata.error) {
                                res = new _this.CommandResponse('false', new _this.ExecutionError(Jsondata.error.code, Jsondata.error.message));
                                _this.common.logger.logError(Jsondata.error.code + ' : ' + Jsondata.error.message, '', 'Engineering Data Service');
                            }
                        }
                        catch (ex) {
                            var errorSeries = Math.floor(statusCode / 100);
                            if (_this.ERRORS(statusCode)) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Engineering Data Service');
                            }
                            else if (_this.ERRORS(errorSeries + 'XX')) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(errorSeries + 'XX')));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(errorSeries + 'XX') + '', 'Engineering Data Service');
                            }
                            else {
                                if (ex.message === null || ex.message === '') {
                                    ex.message = _this.$translate.instant('svcErrors.business.defaultErrorMessage');
                                }
                                res = new _this.CommandResponse(false, new _this.ExecutionError(-1, "Error: " + ex.message));
                                _this.common.logger.logError('-1: Error: ' + ex.message, '', 'Engineering Data Service');
                            }
                        }
                    }
                    else {
                        res = new _this.CommandResponse(false, new _this.ExecutionError(-1, _this.$translate.instant('svcErrors.engineering.generic')));
                        _this.common.logger.logError('-1: Error: Generic Error', '', 'Engineering Data Service');
                    }
                    return res;
                };
                this.transformResObjInvoke = function (data, headersGetter, statusCode) {
                    var res = null;
                    if (data) {
                        try {
                            var Jsondata = JSON.parse(data);
                            if (Jsondata.Error) {
                                res = new _this.CommandResponse(Jsondata.Succeeded, new _this.ExecutionError(Jsondata.Error.ErrorCode, Jsondata.Error.ErrorMessage));
                                res.data = Jsondata;
                            }
                            else {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(Jsondata.error.code, Jsondata.error.message));
                                res.data = Jsondata;
                            }
                        }
                        catch (e) {
                            var errorSeries = Math.floor(statusCode / 100);
                            if (_this.ERRORS(statusCode)) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(statusCode)));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(statusCode) + '', 'Business Command Service');
                            }
                            else if (_this.ERRORS(errorSeries + 'XX')) {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(statusCode, 'Error: ' + _this.ERRORS(errorSeries + 'XX')));
                                _this.common.logger.logError(statusCode + 'Error: ' + _this.ERRORS(errorSeries + 'XX') + '', 'Business Command Service');
                            }
                            else {
                                res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Error: ' + e.message));
                                _this.common.logger.logError('-1: Error: ' + e.message, '', 'Business Command Service');
                            }
                        }
                    }
                    else {
                        res = new _this.CommandResponse(false, new _this.ExecutionError(-1, 'Generic Error'));
                    }
                    return res;
                };
                this.oDataPath = engineeringBusinessConfig.config.oDataServiceURI;
            }
            BusinessSystemService.prototype.getCmd = function (path) {
                // If plantService is available, then pass the plantInfo.NId as parameter
                // The reason for this is that the business data service expose engineering data on a Runtime UI Application.
                // Since the engineering service layer does not have the plant information on the url segment it is not aware of the plant, so the plantInfo.NId is passed as a query string parameter. 
                // and later the engineering service layer will use this plantInfo query string parameter to contextualize the call on the plant.
                var params = {};
                if (this.plantService && this.plantService.plantInfo && this.plantService.plantInfo.NId) {
                    params = { "plantInfo": this.plantService.plantInfo.NId };
                }
                return this.$resource('', params, {
                    getAll: {
                        method: 'Get',
                        url: path,
                        transformResponse: [this.transformResObj].concat(this.$http.defaults.transformResponse)
                    }
                });
            };
            BusinessSystemService.prototype.mergeFilter = function (query, filter) {
                // No additional filter
                if (!filter) {
                    return query;
                }
                //No filter exist in the query. Therefore just prepend the filter to query
                if (-1 === query.indexOf('$filter=')) {
                    var appendedquery = query ? '&' + query : query;
                    return '$filter=' + filter + appendedquery;
                }
                //Filter exist in the query and additional filter is available
                //Split the Query by means of &
                //Look for the part with $filter
                //Merge the additional filter with group
                //Compile the parts and return the complete query
                var parts = query.split('&');
                var index = parts.findIndex(function (part) {
                    if (0 !== part.indexOf('$filter')) {
                        return false;
                    }
                    return true;
                });
                //Take the part with filter
                var filterPart = parts[index];
                //Remove $filter= from the part
                filterPart = filterPart.replace('$filter=', '');
                //form the final filter as $filter=(query filter) and (additional filter)
                parts[index] = '$filter=(' + filterPart + ') and (' + filter + ')';
                //combine the parts with & join
                return parts.join('&');
            };
            /**
             * @ngdoc method
             * @name common.services.runtime.SystemDataService#findAll
             * @param {String} entityName Name of the runtime entity to be queried.
             * @param {String} [options] An OData query string.
             * @returns {Promise} A promise containing a {@link type:CommandResponse} object.
             * @description
             * Retrieves data from one of the following system entities:
             *
             *   * Role
             *   * UserRoleAssociation
             *   * GroupRoleAssociation
             *   * User
             *   * Group
             */
            BusinessSystemService.prototype.findAll = function (entityName, options) {
                var deferred = this.$q.defer();
                if (this.isEntityPlantSpecific(entityName)) {
                    var plantId = this.getPlantIdentifier();
                    var additionalFilter = 'Plant_Id eq ' + plantId;
                    if (!options) {
                        options = '';
                    }
                    options = this.mergeFilter(options, additionalFilter);
                    this.executeQuery(entityName, options).then(function (data) {
                        deferred.resolve(data);
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
                else {
                    this.executeQuery(entityName, options).then(function (data) {
                        deferred.resolve(data);
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            };
            BusinessSystemService.prototype.isEntityPlantSpecific = function (entityName) {
                if (entityName === 'UserRoleAssociation' || entityName === 'GroupRoleAssociation') {
                    return true;
                }
                return false;
            };
            BusinessSystemService.prototype.executeQuery = function (entityName, options) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!this.entityConfig[entityName]) {
                    deferred.reject({
                        data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.engineering.wrongEntityName')))
                    });
                }
                else {
                    entityName = this.entityConfig[entityName];
                    var path = this.oDataPath + entityName;
                    if (!this.oDataPath || this.oDataPath.trim() === '') {
                        deferred.reject({
                            data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.engineering.noConfig')))
                        });
                    }
                    else if (!entityName || entityName === '') {
                        deferred.reject({
                            data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.engineering.noEntityName')))
                        });
                    }
                    else {
                        try {
                            if (options) {
                                path += '?' + options;
                            }
                            var fnc = this.getCmd(path);
                            fnc.getAll(function (data) {
                                deferred.resolve(data);
                            }, function (err) {
                                deferred.reject({ data: new _this.CommandResponse(false, new _this.ExecutionError(err.data.error.errorCode, err.data.error.errorMessage)) });
                            });
                            return deferred.promise;
                        }
                        catch (jse) {
                            deferred.reject({ data: { Error: { ErrorCode: -1, ErrorMessage: jse.message } } });
                            return deferred.promise;
                        }
                    }
                }
                return deferred.promise;
            };
            BusinessSystemService.prototype.getPlantIdentifier = function () {
                return this.plantService.plantInfo.Id;
            };
            //Invoke
            BusinessSystemService.prototype.transformDataObj = function (data) {
                return { command: data };
            };
            BusinessSystemService.prototype.callCommand = function (path) {
                return this.$resource('', {}, {
                    cmd: {
                        method: 'Post',
                        url: path,
                        transformRequest: [this.transformDataObj].concat(this.$http.defaults.transformRequest),
                        transformResponse: [this.transformResObjInvoke].concat(this.$http.defaults.transformResponse)
                    }
                });
            };
            /**
            * @ngdoc type
            * @name SystemCommandModel
            * @module siemens.simaticit.common.services.runtime
            * @description
            * Represents a system command to be invoked using the {@link common.services.runtime.SystemDataService#invoke invoke} method.
            *
            * @property {string} commandName The name of the system command to be executed.
            * @property {Object} params The JSON payload of the  command.
            */
            /**
           * @ngdoc method
           * @name common.services.runtime.SystemDataService#invoke
           * @module siemens.simaticit.common.services.runtime
           *
           * @param {SystemCommandModel} inputObject {@link type:SystemCommandModel}
           *
           * @returns {Object} Promise object containing the command result.
           * @description Executes one of the following system commands:
           *
           *    * CreateUserRoleAssociation(RoleName, UserID)
           *    * CreateGroupRoleAssociation (RoleName, GroupID)
           *    * DeleteUserRoleAssociation  (RoleName, UserID)
           *    * DeleteGroupRoleAssociation (RoleName, GroupID)
           *    * ApplyUMAC()
           */
            BusinessSystemService.prototype.invoke = function (inputObject) {
                var _this = this;
                var deferred = this.$q.defer();
                var path, appPath = '';
                var formatCommand;
                if (!inputObject) {
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidInput'))) });
                    return deferred.promise;
                }
                if (!this.commandConfig[inputObject.commandName]) {
                    //error
                    deferred.reject({ data: new this.CommandResponse(false, new this.ExecutionError(-1, this.$translate.instant('svcErrors.businessCommand.executeInvalidCommand'))) });
                    return deferred.promise;
                }
                inputObject.commandName = this.commandConfig[inputObject.commandName];
                if (!inputObject.params) {
                    inputObject.params = {};
                }
                inputObject.params.PlantId = this.plantService.plantInfo.NId;
                appPath = this.oDataPath;
                if (appPath.slice(-1) !== "/") {
                    appPath = appPath + '/';
                }
                formatCommand = inputObject.commandName;
                path = appPath + formatCommand;
                this.callCommand(path).cmd(inputObject.params, function (data) {
                    deferred.resolve(data);
                }, function (err) {
                    var exeError = _this.common.setExecutionError(err);
                    deferred.reject(exeError);
                });
                return deferred.promise;
            };
            BusinessSystemService.$inject = ['$q', '$resource', '$http', '$translate', '$timeout', 'common', 'CommandResponse', 'ExecutionError', 'common.services.runtime.commandModel',
                'common.services.runtime.BusinessDataConfig', 'entityConfig', 'commandConfig', 'common.services.plant.plantService'];
            return BusinessSystemService;
        }());
        framework.BusinessSystemService = BusinessSystemService;
        angular.module('siemens.simaticit.common.services.runtime').service('common.services.runtime.SystemDataService', BusinessSystemService);
        angular.module('siemens.simaticit.common.services.runtime').constant('entityConfig', {
            "Role": "PublicRole",
            "UserRoleAssociation": "PublicUserRoleAssociation",
            "GroupRoleAssociation": "PublicGroupRoleAssociation",
            "User": "PublicUser",
            "Group": "PublicGroup"
        });
        angular.module('siemens.simaticit.common.services.runtime').constant('commandConfig', {
            "CreateUserRoleAssociation": "PublicCreateUserRoleAssociationCommand",
            "CreateGroupRoleAssociation": "PublicCreateGroupRoleAssociationCommand",
            "DeleteUserRoleAssociation": "PublicDeleteUserRoleAssociationCommand",
            "DeleteGroupRoleAssociation": "PublicDeleteGroupRoleAssociationCommand",
            "ApplyUMAC": "PublicApplyUMACCommand"
        });
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=businessSystemData.svc.js.map
(function () {
    'use strict';
    /**
        * @ngdoc service
        * @name common.services.runtime.modulesScreensDataService
        * @module siemens.simaticit.common.services.runtime
        * @description A service that returns the information of screens at runtime. The activities include:
        * * getting data from screens.json file.
        * * returning screens data based on UIAppName and its type.
        * * returning screen details based on the screen id.
        *
        * @example
        * In a controller, the **common.services.runtime.modulesScreensDataService** can be used as follows:
        *
        * ```
        *
        *    (function () {
        *     'use strict';
        *
        *       function RuntimeAccessController($scope, dataService) {
        *            var vm = this;
        *            var uiAppName = 'testApp';
        *            var type = 'ModelDriven';
        *            var screenId = 'home.Siemens_SimaticIT_ApplicationLog_ApplicationLog_MaintenanceConfiguration';
        *
        *            function getAllScreens() {
        *                dataService.getScreens(uiAppName, type).then(function (data) {
        *                    vm.screensList = data.value;
        *                },
        *                function(error){
        *                    vm.screensList = error.data.error.errorMessage;
        *                });
        *            }
        *
        *            function getScreenData() {
        *                dataService.getScreenDetails(screenId).then(function (data) {
        *                    vm.screenData = data.value;
        *                },
        *                function(error){
        *                    vm.screenData = error.data.error.errorMessage;
        *                });
        *            }
        *
        *           // Getting screens data
        *           getAllScreens();
        *
        *           // Getting details of a screen
        *           getScreenData();
        *       }
        *       RuntimeAccessController.$inject = ['$scope', 'common.services.runtime.modulesScreensDataService'];
        *
        *       angular
        *         .module('siemens.simaticit.common.examples')
        *         .controller('RuntimeAccessController', RuntimeAccessController);
        *    })();
        *
        *```
    */
    angular.module('siemens.simaticit.common.services.runtime').service('common.services.runtime.modulesScreensDataService', ModulesScreensDataService);

    ModulesScreensDataService.$inject = ['$http', '$q', 'common.services.logger.service', 'CONFIG','common.ctx'];
    function ModulesScreensDataService($http, $q, logger, CONFIG, commonContext) {
        var vm = this;
        var allScreensData = {};
        var newScreensData = {};
        var getScreensData;
        var getScreenDetailsData = {};
        var appType;
        vm.screensPath = 'screens.json';
        vm.solutionName = '';

        //Function to fetch the data from screens.json file
        function fetchData(path) {
            var deferred = $q.defer();            
            $http.get(path).then(function (data) {
                if (path === 'screens.json') {
                    allScreensData = data;
                    deferred.resolve(allScreensData);
                } else {
                    newScreensData = data;
                    deferred.resolve(newScreensData);
                }
            }, function (err) {
                deferred.reject(err);
            })
            return deferred.promise;
        }

        function logError(message, data) {
            logger.logError(message, data, 'common.services.component.swacComponentService');
        }

        /**
            * @ngdoc method
            * @name common.services.runtime.modulesScreensDataService#getScreens
            * @module siemens.simaticit.common.services.runtime
            * @description Registers the callback method to be executed when all the screens data is requested.
            * It returns a promise with the list of all screens based on the UI App name and type of the screen.
            * @param {string} UIAppName Name of the UI App.
            * @param {string} Type Type of the screen. You must use one of the following type:
            * * **Standard**
            * * **ModelDriven**
            * * **Mashup**
        */
        function getScreens(UIAppName, Type) {
            var deferred = $q.defer();
            var noUIAppName = UIAppName === undefined || UIAppName === '' || UIAppName === null;
            var noType = Type === undefined || Type === '' || Type === null;

            if (noUIAppName) {
                logError('UIAppName is null, unable to get screens');
            }

            if (noType) {
                logError('Type is null, unable to get screens');
            }

            if (allScreensData.data && allScreensData.data.screens && !noUIAppName && !noType) {
                vm.solutionName = CONFIG.clientID.replace('.' + allScreensData.data.uiapp, '');
                if (allScreensData.data.uiapp === UIAppName) {
                    getScreensData = [];
                    var screens = allScreensData.data.screens;
                    screens.forEach(function (screen) {
                        if (screen.type === Type) {
                            getScreensData.push(screen);
                        }
                    });
                    deferred.resolve(getScreensData);
                } else {
                    getOtherUIAppScreens(UIAppName).then(function (newScreensData) {
                        if (newScreensData.data && newScreensData.data.screens) {
                            getScreensData = [];
                            var screens = newScreensData.data.screens;
                            screens.forEach(function (screen) {
                                if (screen.type === Type) {
                                    getScreensData.push(screen);
                                }
                            });
                        }
                        deferred.resolve(getScreensData);
                    });
                }
            } else {
                deferred.reject();
            }
            return deferred.promise;
        }

        //function to get screens of other uiApps
        function getOtherUIAppScreens(UIAppName) {
            var newScreensPath = '../../runtime/' + vm.solutionName + '.' + UIAppName + '/screens.json';
            return fetchData(newScreensPath);
        }

        /**
            * @ngdoc method
            * @name common.services.runtime.modulesScreensDataService#getScreenDetails
            * @module siemens.simaticit.common.services.runtime
            * @description Registers the callback method to be executed when a particular screen data is requested.
            * It returns a promise with the details of the screen based on the screen id.
            * @param {string} ScreenId Id of the screen.
        */
        function getScreenDetails(ScreenId) {
            var deferred = $q.defer();
            var noScreenId = ScreenId === undefined || ScreenId === '' || ScreenId === null;

            if (noScreenId) {
                logError('ScreenId is null, unable to get screen details');
            }

            if (allScreensData.data && allScreensData.data.screens && !noScreenId) {
                var screens = allScreensData.data.screens;
                screens.forEach(function (screen) {
                    if (screen.id === ScreenId) {
                        getScreenDetailsData = screen;
                    }
                });
                deferred.resolve(getScreenDetailsData);
            } else {
                deferred.reject();
            }
            return deferred.promise;
        }

        function init() {
            //service methods
            vm.fetchData = fetchData;
            vm.getScreens = getScreens;
            vm.getScreenDetails = getScreenDetails;
            vm.getOtherUIAppScreens = getOtherUIAppScreens;
            appType = commonContext.getAppType();
        }

        function activate() {
            init();
            if(appType !== 'runtime' && appType !== 'debug'){
               return;
            }
            fetchData(vm.screensPath);
        }

        activate();
    }
})();

"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
        * @ngdoc service
        * @name common.services.runtime.systemConfigurationService
        * @module siemens.simaticit.common.services.runtime
        *
        * @description
        * This service is used to retrieve information on the system configuration.
        *
        * @example
        * In a controller, the **common.services.runtime.systemConfigurationService** can be used as follows:
        *
        * ```
        *
        *   (function () {
        *       'use strict';
        *
        *       systemConfigurationExampleController.$inject = ['common.services.runtime.systemConfigurationService'];
        *       function systemConfigurationExampleController(systemConfService) {
        *
        *           activate();
        *
        *           function activate() {
        *               var isDataSegregationEnabled = systemConfService.isDataSegregationEnabled();
        *               console.log("DataSegregation is " + ((isDataSegregationEnabled) ? ('ENABLED') : ('DISABLED')));
        *           }
        *
        *       }
        *       angular.module('siemens.simaticit.common').controller('systemConfigurationExampleController', systemConfigurationExampleController);
        *   })();
        *
        *```
        */
        var SystemConfigurationService = /** @class */ (function () {
            function SystemConfigurationService(CONFIG, APPCONFIG) {
                this.CONFIG = CONFIG;
                this.APPCONFIG = APPCONFIG;
                this.config = angular.extend({}, this.APPCONFIG, this.CONFIG);
            }
            /**
             * @ngdoc method
             * @name common.services.runtime.systemConfigurationService#isDataSegregationEnabled
             * @returns {Boolean} A boolean value indicating whether Opcenter EX FN DataSegregation is enabled or not.
             * @description
             * Retrieves information about the Opcenter EX FN DataSegregation status
             */
            SystemConfigurationService.prototype.isDataSegregationEnabled = function () {
                return (this.config && this.config.applicationServiceUrls && this.config.applicationServiceUrls.DataSegregation) ? true : false;
            };
            SystemConfigurationService.prototype.isTagSelectionEnabled = function () {
                return (this.isDataSegregationEnabled() && this.config && this.config.isTagSelectionEnabled) ? true : false;
            };
            SystemConfigurationService.$inject = ['CONFIG', 'APPCONFIG'];
            return SystemConfigurationService;
        }());
        framework.SystemConfigurationService = SystemConfigurationService;
        angular.module('siemens.simaticit.common.services.runtime').service('common.services.runtime.systemConfigurationService', SystemConfigurationService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=systemConfiguration.svc.js.map