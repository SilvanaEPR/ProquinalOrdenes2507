/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

/* Version 1.6.0, Boot version 1.6.0, copyright (C) 2019, Siemens AG. All Rights Reserved. */


(function () {
  var swacBootModule = function () {


/**
 * Class that manages the boot of the component.
 *
 * @class SWACBoot
 * @constructor
 * 
 */
var SWACBoot = (function () {
  

  //////////////
  // PRIVATE  //
  //////////////

  var
      //local SWAC object
      SWACInstance = null,

      // Current bootloader phase.
      _state = 'pending',

      _bootStarted = false,

      // Timer for bootloader timeout.
      _bootTimer = -1,

      _checkIfWorker = function (obj) {
        if (((typeof WorkerGlobalScope !== 'undefined') && (obj instanceof WorkerGlobalScope)) ||
            ((typeof DedicatedWorkerGlobalScope !== 'undefined') && (obj instanceof DedicatedWorkerGlobalScope))) {
          return true;
        }
        else {
          return false;
        }
      },

      // worker instance or parent window of the iframe component is hosted in.
      _p = _checkIfWorker(this) ? this : window.parent,

      // Handler for incoming messages.
      _msgHandler = null,

      // Content with type, name and authentication info
      _content = null,

      // raw content received from container
      _containerInfo = {},

      _injectionQueue = [],

      _extensionsAliasMap = {},

      _configTimeout = null,

      _timeoutEnabled = (function () {
        try {
          var _enabled = window.sessionStorage.getItem('swac.timeouts.enabled');
          return (typeof JSON.parse(_enabled) === 'boolean') ? JSON.parse(_enabled) : true;
        }
        catch (e) {
          return true;
        }
      })(),

      /**
     * Clear timer and remove event listener
     *
     * @private
     * @method _clearTimerAndListener
     */
      _clearTimerAndListener = function () {
        if (_timeoutEnabled) {
          window.clearTimeout(_bootTimer);
        }
        window.removeEventListener('message', _msgHandler);
      },

     /**
     * Load a Javascript
     *
     * @private
     * @method _jsLoadUtil
     * @param {string} url url for the script to load
     * @param {function} success function to call when success
     * @param {function} failure function to call when fail
     */
      _jsLoadUtil = function (url, success, failure) {

        if (_checkIfWorker(this)) {
          try {
            importScripts(url);
            if (success) {
              success();
            }
            else {
              throw new Error('Load failure');
            }
          }
          catch (e) {
            if (failure) {
              failure('Failed to load ' + url + ' library');
            }
          }
        }
        else {
          var baselib = document.createElement('script');
          baselib.setAttribute('type', 'text/javascript');
          baselib.setAttribute('src', url);

          if (success || failure) {
            if (success) {
              baselib.addEventListener('load', success);
            }
            if (failure) {
              baselib.addEventListener('error', function () { failure('Failed to load ' + url + ' library'); });
            }
          }
          if (document.getElementsByTagName('head')) { //head is an optional tag
            document.getElementsByTagName('head')[0].appendChild(baselib);
          }
          else {
            document.getElementsByTagName('body')[0].appendChild(baselib);
          }
        }
      },

     /**
     * Creates a message
     *
     * @private
     * @method _createMessage
     * @param {object} content content of the message
     * @return {object} a JSON object containing the content of the message
     */
      _createMessage = function (content) {
        return JSON.stringify({ t: 'boot', c: content });
      },

      /**
      * Check if SWAC object is valid
      *
      * @private
      * @method _checkSWAC
      * @return {boolean} SWAC object is valid
      */
      _checkSWAC = function () {
        if (SWAC && (typeof SWAC === 'object') && (typeof SWAC.Communication === 'object')) {
          return true;
        }
        else {
          return false;
        }
      },

     /**
     * Receives reply from container
     *
     * @private
     * @method _receiveMessage
     * @param {object} event Event object
     * @param {function} success success callback
     * @param {function} failure failure callback
     */
      _receiveMessage = function (event, success, failure) {
        var data = {},
            succCallback,
            failedCb,
            done,
            p,
            regex = null,
            aggregator,
            extension,
            extensionCount = null,
            containerVersion = null,
            bootInstance = null;

        if (_state === 'waiting' || _state === 'ok') {
          if ((typeof (event.data) === 'string') && (event.data.length > 0)) {
            try {
              // Check for URL in response and start loading script
              data = JSON.parse(event.data);
              if (!data || !data.t || !data.c) {
                throw new Error('Incompatible message received');
              }
              else if (data.t !== 'boot') {
                throw new Error('Unknown message received: ' + data.t);
              }
            }
            catch (e) {
              return;
            }

            failedCb = function (reason) {
              _state = 'failed';
              _clearTimerAndListener();
              failure({ message: reason });
              swacPostMessage(_createMessage({ message: 'failed' }), '*');
            };

            if ((data.t === 'boot') && (data.c.message === 'pong')) {
              if (typeof data.c.timeouts !== 'undefined') {
                _configTimeout = data.c.timeouts;
              }
              done = function () {
                SWACInstance.isContainer = false;
                _state = 'ok';
                _content = data.c;
                _content.containerVersion = _content.containerVersion || '1.0.0';
                swacPostMessage(_createMessage({ message: 'ok' }), '*');
              };

              aggregator = function () {
                var _script,
                  injectionQueueCount = _injectionQueue.length,
                  extensionObj = {};

                if (typeof SWACInstance.Hub.prototype.Extensions !== 'undefined'
                  ) {
                  if (typeof SWACInstance.Hub.prototype.Extensions !== 'undefined' && Object.keys(SWACInstance.Hub.prototype.Extensions).length > 0) {
                    extensionObj = SWACInstance.Hub.prototype.Extensions;
                  }
                }
                else {
                  // Old container version, no extensions inject
                  done();
                  return;
                }

                if (extensionCount !== null) {
                    for (var ext in extensionObj) {
                      if (extensionObj.hasOwnProperty(ext)) {
                        if (typeof _extensionsAliasMap[ext] !== 'undefined') {
                          extensionObj[_extensionsAliasMap[ext]] = extensionObj[ext];
                          delete extensionObj[ext];
                          delete _extensionsAliasMap[ext];
                        }
                      }
                    }
                }

                if
                  (
                  (injectionQueueCount === 0)
                  || (SWACInstance._internal.Utils.checkVersion(containerVersion, '1.4.1') < 0))
                {
                  done();
                } else {
                  _state = 'upgrading';
                  _script = _injectionQueue.pop();
                  if (typeof defineExtension === 'undefined') {
                    // Load defineExtension
                    _jsLoadUtil(_script, function () {
                      if (typeof defineExtension !== 'undefined') {
                        defineExtension = defineExtension.bind({ SWAC: SWACInstance });
                      }
                      aggregator();
                    }, failedCb);
                  }
                  else {
                      // Load the extension
                      if (_script === '$$unknownExtension$$') {
                        aggregator();
                      }
                      else {
                        extensionCount = Object.keys(extensionObj).length;
                        _jsLoadUtil(_script, aggregator, aggregator);
                      }
                  }
                }
              };

              if (data.c.extensions) {
                for (extension in data.c.extensions) {
                  if (data.c.extensions.hasOwnProperty(extension)) {
                    _injectionQueue.unshift(data.c.extensions[extension]);
                  }
                }
              }

              containerVersion = data.c.containerVersion || '1.0.0';

              bootInstance = (typeof SWACBoot !== 'undefined') ? SWACBoot : null;

              if (window.SWAC && typeof window.SWAC !== 'undefined') {
                if (_checkSWAC()) {
                  SWACInstance = window.SWAC;
                  SWACInstance.BootInstance = bootInstance;
                  aggregator();
                }
                else {
                  failedCb('SWAC is a reserved variable name');
                }
              }
              else {
                if (containerVersion === '1.5.0') {
                  window.console.warn('SWAC version 1.5.0 is incompatible with current version');
                  failedCb('SWAC version 1.5.0 is incompatible with current version');
                  return;
                }

                regex = /^\s+|\s+$/g;

                if ((data.c.url === undefined) || (data.c.url === null) || (data.c.url.replace(regex, '') === '')) {
                  failedCb('Failed to load SWAC.Config.Container.URLs library');
                }
                else {
                  succCallback = function () {
                    if ((window.SWAC && typeof SWAC !== 'undefined') || ((typeof data.c.namespace !== 'undefined') && (typeof window[data.c.namespace] !== 'undefined'))) {
                      if (_checkSWAC()) {
                        SWACInstance = SWAC;
                        SWACInstance.BootInstance = bootInstance;
                        aggregator();
                      }
                      else {
                        failedCb('SWAC is a reserved variable name');
                      }
                    }
                    else {
                      failedCb('Failed to load SWAC.Config.Container.URLs library');
                    }
                  };

                  _state = 'upgrading';

                  _jsLoadUtil(data.c.url, succCallback, failedCb);
                }
                regex = null;
              }
            }
            else if ((data.t === 'boot') && (data.c.message === 'ok2')) {
              // Container object has been created and is ready to be accepted
              _state = 'done';
              _bootStarted = false;

              _clearTimerAndListener();
              for (p in _content) {
                if (_content.hasOwnProperty(p)) {
                  _containerInfo[p] = _content[p];
                }
              }

              _content.message = 'SWAC successfully loaded';
              _content.auth = _content.authentication;
              _content.SWAC = (typeof SWACInstance === 'object') ? SWACInstance : new SWACInstance();
              if (_configTimeout) {
                _content.SWAC.Config.TimeOuts = _configTimeout;
              }
              delete _content.authentication;
              delete _content.url;
              delete _content.extensions;
              delete _content.namespace;
              if (!data.c.details) { //introduced in 1.4.0 for fullName 
                _containerInfo['details'] = {
                  path: ['<root>']
                };
              }
              //merge ok2 message info into containerInfo object
              for (p in data.c) {
                if (p !== 'message' && data.c.hasOwnProperty(p)) {
                  if (!_containerInfo.hasOwnProperty(p)) {
                    _containerInfo[p] = data.c[p]; //used first for fullName and designMode 18/07/2017
                  }
                }
              }

              delete _content._internal;

              SWACInstance.Hub.prototype.containerVersion = _content.containerVersion;

              success(_content);
            }
            else if ((data.t === 'boot') && (data.c.message === 'peng')) {
              _clearTimerAndListener();
              failure({ message: data.c.reason });
            }
          }
        }
      },

     /**
     * Check for alternative communication channel
     *
     * @private
     * @method _checkAlternativeCommunicationChannel
     * @return {function} function for communications
     */
      _checkAlternativeCommunicationChannel = function () {
        if (_p === self) {
          if (_checkIfWorker(_p)) {
            return _p.postMessage;
          }
          else if (typeof swacNative === 'object' && typeof swacNative.postMessage === 'function') {
            return swacNative.postMessage; //chromioum convention
          }
          else if (window.external && typeof window.external.postMessage === 'function') {
            return window.external.postMessage; //IE convention
          }
        }
        return null;
      },

      // Initiates the bootstrap mechanism with pre-checks and time-out.
      _bootstrap = function (success, failure, version, auth, timeout) {
        version = version || '*';                     // default is container's current
        timeout = timeout || 1000;                    // default timeout is 1s
        failure = failure || function (event) { };    // do nothing, if no onfailure callback was specified
        auth = auth || 'no';                          // default is no authentication

        var otherChannel,
            pingMsg,
            extensionList = [],
            k;

        if (_checkIfWorker(this)) {
          window = this;
        }

        if (_state === 'done') {
          window.setTimeout(function () {
            failure({ message: 'Boot phase already done' });
          }, 0);
          return;
        }
        else if (!_bootStarted) {
          _bootStarted = true;
        }
        else {
          window.setTimeout(function () {
            failure({ message: 'Boot phase in progress' });
          }, 0);
          return;
        }

        otherChannel = _checkAlternativeCommunicationChannel();

        if (_p === self && typeof otherChannel !== 'function' && typeof window['swacPostMessage'] !== 'function') {
          _state = 'failed';
          _containerInfo['details'] = {
            path: ['<root>']
          };
          window.setTimeout(function () {
            failure({ message: 'Component is not embedded into an iframe' });
          }, 0);
        }
        else {
          //check wrong boot phase scenario
          if (window.SWAC && (typeof SWAC === 'object') && (typeof SWAC.Container === 'object')) {
            var cmpL = SWAC.Container.get();
            if (cmpL && (Array.isArray(cmpL) && cmpL.length > 0)) {
              //mixed component with child component present
              SWAC._internal.wrongMixedBoothSequence = true;
              window.console.warn('Mixed component: wrong boot sequence detected');
            }
          }

          if (typeof window['swacPostMessage'] !== 'function') {
            if (_checkIfWorker(window)) {
              window['swacPostMessage'] = function (message, targetOrigin, transfer) {
                return otherChannel(message);
              };
            }
            else if (typeof otherChannel === 'function') {
              window['swacPostMessage'] = otherChannel;
            }
            else {
              window['swacPostMessage'] = function (message, targetOrigin, transfer) {
                return _p.postMessage(message, targetOrigin);
              };
            }
          }
          _msgHandler = function (event) {
            _receiveMessage(event, success, failure);
          };

          _state = 'waiting';
          window.addEventListener('message', _msgHandler, false);

          if (_timeoutEnabled) {
            _bootTimer = window.setTimeout(function () {
              if (_state !== 'done') {
                _state = 'timedout';
                _containerInfo['details'] = {
                  path: ['<root>']
                };
                _clearTimerAndListener();
                failure({ message: 'Bootload sequence timed out' });
              }
            }, timeout);
          }

          if ((arguments[6] !== null) && (typeof arguments[6] !== 'undefined')) {
            // Normalize extension list to support old versions
            for (k = 0; k < arguments[6].length; k++) {
              if (typeof arguments[6][k] === 'object') {
                extensionList.push(arguments[6][k].extension);
                _extensionsAliasMap[arguments[6][k].extension] = arguments[6][k].as;
              }
              else {
                extensionList.push(arguments[6][k]);
              }
            }
          }

          pingMsg = _createMessage({ message: 'ping', version: version, authentication: auth, attributes: arguments[5], extensions: extensionList });
          swacPostMessage(pingMsg, '*'); // targetOrigin is application-specific, use * here.
        }
      };

  var _bootstrapSWAC = function (success, failure, version, auth, extensions, timeout) {
    var _timeout = timeout,
      _extensions = extensions;

    if (typeof extensions === 'number') {
      _timeout = extensions;
      _extensions = null;
    }
    _bootstrap(success, failure, version, auth, _timeout, null, _extensions);
  };


  //////////////
  // PUBLIC   //
  //////////////

  return {
    /**
    * Initialize the SWAC component boot phase
    *
    * @method start
    * @param {function} success success callback.
    * @param {function} failure failure callback.
    * @param {string} version SWAC version used to develop the component.
    * @param {string} auth Specify if component require authentication.
    * @param {number} timeout SWACBoot.start timeout in milliseconds.
    */
    start: _bootstrapSWAC,
    
    _internal: {
      /**
      * Container informations.
      *
      * @protected
      * @property _internal.containerInfo
      * @return {object} returns an object containing informations received from the container
      */
      containerInfo: _containerInfo,
      /**
      * Check if an object is a Worker instance
      *
      * @protected
      * @method _internal.checkIfWorker
      * @return {boolean} object is a Worker
      */
      checkIfWorker: _checkIfWorker
    }
  };

}());

/**
* Provide the version of the object.
*
* @property version
* @type String
*/
SWACBoot.version = '1.6.0';

    return SWACBoot;
  };

  try {
    var _SWACBoot = swacBootModule();

    if (_SWACBoot._internal.checkIfWorker(this)) {
      window = this;
    }

    if (typeof window.SWACBoot === 'undefined') {
      window.SWACBoot = _SWACBoot;
    }

    if ((typeof module !== 'undefined') && (typeof module.exports !== 'undefined')) {
      module.exports = window.SWACBoot;
      module.exports['default'] = module.exports;
    }
    else if ((typeof define === 'function' && (typeof define.amd !== 'undefined')) &&
        (typeof requirejs !== 'undefined') &&
        (typeof requirejs.s.contexts._.config !== 'undefined') &&
        (typeof requirejs.s.contexts._.config.paths['@swac/boot'] !== 'undefined')) {
      define(function () {
        return window.SWACBoot;
      });
    }
    else if ((typeof SystemJS !== 'undefined') && SystemJS.map.hasOwnProperty('@swac/boot')) {
      define(function () {
        return window.SWACBoot;
      });
    }
  }
  catch (e) { }

})();