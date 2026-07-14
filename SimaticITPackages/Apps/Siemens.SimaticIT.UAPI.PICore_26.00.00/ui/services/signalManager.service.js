/*
* SIMATIC IT Unified Architecture for Process Industries V2.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('Siemens.SimaticIT.UAPI.PICore.signalManagerService', signalManagerService);

    signalManagerService.$inject = ['$q', '$timeout', 'common.services.signalManager', 'common.services.logger.service', 'common.base'];

    function signalManagerService($q, $timeout, signalManager, uiLogger, base) {
        var vm = this;
        vm._connections = {};
        var logger = base.services.logger.service.getModuleLogger('boopitemequipmentlist');
        vm._reconnectionsCounters = {};
        vm.destroyConnectionsOperationInProgressDefer = null;

        var service = {
            subscribe: subscribe,
            destroyConnections: destroyConnections
        };

        activate();

        return service;

        function activate() {
        }

        function destroyConnections() {
            var defs = [];
            for (var connectionName in vm._connections) {
                defs[defs.length] = signalManager.deleteConnection(vm._connections[connectionName].id).then(onSuccess.bind(null, connectionName), onError);
            }
            vm.destroyConnectionsOperationInProgressDefer = $q.all(defs);

            function onSuccess(connectionName) {
                vm._connections[connectionName] = undefined;
                uiLogger.log('Closed Connection ' + connectionName);
            }

            function onError(error) {
                uiLogger.log('Error on Closed Connection \n' + angular.toJson(error, true));
            }
        }

        function subscribe(appName, signalName, onSignalChanged) {
            if (vm.destroyConnectionsOperationInProgressDefer) {
                vm.destroyConnectionsOperationInProgressDefer.then(createConnection.bind(null, appName, signalName, onSignalChanged));
            }            else { createConnection(appName, signalName, onSignalChanged); }

            function createConnection(appName, signalName, onSignalChanged) {
                vm.destroyConnectionsOperationInProgressDefer = null;
                vm._reconnectionsCounters[signalName] = 0;
                signalManager.createConnection(appName, signalName, connectionErrorCallback).then(onSuccess.bind(null, appName, signalName, onSignalChanged), onError);
            }

            function onSuccess(appName, signalName, onSignalChanged, signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm._connections[signalName] = signalConnection;
                    uiLogger.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToSignalChanged(appName, signalName, onSignalChanged);
                }                else {
                    uiLogger.log('signalConnection is not opened');
                }
            }

            function onError(error) {
                logger.logErr('Error in opening a connection \n' + angular.toJson(error, true));
            }

            function connectionErrorCallback(conn, reason) {
                var clientId = conn.signalManager && conn.signalManager.clientId !== undefined ? conn.signalManager.clientId : '';
                uiLogger.log('Connection Error Callback: ' + conn.signalApp + ' ' + conn.name + ', ClientId:' + clientId + ', Reason: ' + reason.reason);
                vm._reconnectionsCounters[conn.name]++;
                if (vm._reconnectionsCounters[conn.name] <= 10) {
                    wait(10000).then(function () {
                        uiLogger.log('Retry connection attempt number ' + vm._reconnectionsCounters[conn.name] + ' for ' + conn.signalApp + ' ' + conn.name);
                        return conn.reconnect().then(onReconnectionSuccess);
                    });
                }                else {
                    vm._reconnectionsCounters[conn.name] = undefined;
                    destroyConnections();
                }

                function wait(milliseconds) {
                    var def = $q.defer();
                    $timeout(function () {
                        def.resolve();
                    }, milliseconds);
                    return def.promise;
                }

                function onReconnectionSuccess() {
                    uiLogger.log('Reconnection succeeded for ' + conn.signalApp + ' ' + conn.name);
                }
            }

            function subscribeToSignalChanged(appName, signalName, onSignalChanged) {
                if (vm._connections[signalName] !== undefined) {
                    vm._connections[signalName].subscribe('', onSignalChanged, onError, onComplete.bind(null, appName, signalName)).then(function (data) {
                        uiLogger.log('subscribe to signal ' + appName + '.' + signalName + ' successfully completed.');
                    }, onError);
                }

                function onError(error) {
                    logger.logErr('An error occurred: \n' + angular.toJson(error, true));
                }

                function onComplete(appName, signalName) {
                    uiLogger.log('Signal \'' + appName + '.' + signalName + '\' stopped sending messages.');
                }
            }
        }
    }
})();
