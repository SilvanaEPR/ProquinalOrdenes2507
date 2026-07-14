/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .service('uapi_eventDispatcherService', EventDispatcherService);
    EventDispatcherService.$inject = ['common.services.logger.service'];

    function EventDispatcherService(uiLogger) {
        this._listeners = {};
        this._uiLogger = uiLogger;
    }
    EventDispatcherService.prototype.addEventListener = addEventListener;
    EventDispatcherService.prototype.removeEventListener = removeEventListener;
    EventDispatcherService.prototype.dispatchEvent = dispatchEvent;


    /**
        * Add a listener on the object
        * @param type : Event type
        * @param listener : Listener callback
    */
    function addEventListener(type, listener) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    }

    /**
           * Remove a listener on the object
           * @param type : Event type
           * @param listener : Listener callback
    */
    function removeEventListener(type, listener) {
        if (this._listeners[type]) {
            var index = this._listeners[type].indexOf(listener);

            if (index !== -1) {
                this._listeners[type].splice(index, 1);
            }
        }
    }


    /**
        * Dispatch an event to all registered listener
        * @param Mutiple params available, first must be string
    */
    function dispatchEvent() {
        if (typeof arguments[0] !== 'string') {
            if (this._uiLogger) {
                var logger = this._uiLogger.getModuleLogger('EventDispatcherService');
                var warningMessage = 'First params must be an event type (String)';
                logger.logWarn(warningMessage, '');
            }
        } else {
            var listeners;
            listeners = this._listeners[arguments[0]];

            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    //This could use .apply(arguments) instead, but there is currently a bug with it.
                    listeners[key](arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                }
            }
        }
    }


})();

