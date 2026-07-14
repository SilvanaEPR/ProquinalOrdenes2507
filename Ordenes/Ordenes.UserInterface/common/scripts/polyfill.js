/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

/*************************************************************************
 * This File is to place Common Utility and Extension Methods            *
 *************************************************************************/

/********************************************************************************
 *   (window.$UIF) is global variable for extension method collection           *
 ********************************************************************************/
(function () {
    window.$UIF = {};
}());


/********************************************************************************
 *   String                                                                     *
 ********************************************************************************/
(function ($UIF) {

    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
            value: function (search, rawPos) {
                var pos = rawPos > 0 ? rawPos | 0 : 0;
                return this.substring(pos, pos + search.length) === search;
            }
        });
    }

    //Performance statistics: https://jsperf.com/string-replace-vs-safereplace/1
    function replace(searchValue, newValue) {
        return window.$UIF.Object.isString(this) &&
            window.$UIF.Object.isString(searchValue) &&
            window.$UIF.Object.isString(newValue) ? this.replace(searchValue, newValue) : null;
    }

    function safeReplace(searchValue, newValue) {
        var result = this.toString();
        var searchIndex = result.indexOf(searchValue);
        var searchLength = searchValue.length;
        if (searchIndex !== -1 && searchLength > 0) {
            var partA = result.substr(0, searchIndex);
            var partB = result.substr(partA.length + searchValue.length, result.length - 1);
            result = [partA, newValue, partB].join('');
        }
        return result;
    }

    //Performance statistics: https://jsperf.com/string-replace-vs-safereplace/1
    function safeReplaceAll(searchValue, newValue) {
        return this.toString().split(searchValue).join(newValue);
    }

    function safeTrim(str) {
        return str.split(' ').filter(function (item) { return item; }).join(' ');
    }

    //Reference URL https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
    function encode(string) {
        if (!string) {
            return '';
        }
        var codeUnits = new Uint16Array(string.length);
        for (var i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = string.charCodeAt(i);
        }
        return btoa(String.fromCharCode.apply(null, new Uint8Array(codeUnits.buffer)));
    }

    //Reference URL https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
    function decode(encodedString) {
        if (!encodedString) {
            return '';
        }
        encodedString = atob(encodedString);
        var bytes = new Uint8Array(encodedString.length);
        for (var i = 0; i < bytes.length; i++) {
            bytes[i] = encodedString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(bytes.buffer));
    }

    String.prototype.safeReplace = safeReplace;
    String.prototype.safeReplaceAll = safeReplaceAll;

    $UIF.String = {
        replace: replace,
        safeReplace: safeReplace,
        safeReplaceAll: safeReplaceAll,
        safeTrim: safeTrim,
        encode: encode,
        decode: decode
    };

})(window.$UIF);


/********************************************************************************
 *  Object                                                                      *
 ********************************************************************************/
(function ($UIF) {
    function isString(context) {
        var _that = context || this;
        return _that.constructor === String;
    }

    function isNumber(context) {
        var _that = context || this;
        return _that.constructor === Number;
    }

    function isFunction(context) {
        var _that = context || this;
        return _that.constructor === Function;
    }

    function safeGet(context, arg) {
        return $UIF.Function.safeCall(context, arg);
    }

    $UIF.Object = {
        isString: isString,
        isNumber: isNumber,
        isFunction: isFunction,
        safeGet: safeGet
    }

})(window.$UIF);


/********************************************************************************
 *   Function                                                                   *
 ********************************************************************************/
(function ($UIF) {

    function safeCall(context, arg) {
        var _that = context;
        var params = [].slice.call(arguments);
        params.shift();
        if ($UIF.Object.isString(context)) {
            _that = this;
            arg = context;
        } else {
            if (!context) return null;
            params.shift();
        }
        if (arg.indexOf('.') !== -1) {
            var parts = arg.split('.');
            var firstPart = parts.shift();
            if (_that[firstPart]) {
                params.unshift(parts.join('.'));
                return safeCall.apply(_that[firstPart], params);
            } else return null;
        } else {
            return _that[arg] ? ($UIF.Object.isFunction(_that[arg]) ? _that[arg].apply(_that[arg], params) : _that[arg]) : null;
        }
    };

    $UIF.Function = {
        safeCall: safeCall
    };

})(window.$UIF);


/********************************************************************************
 *   Utility                                                                    *
 ********************************************************************************/
(function ($UIF) {
    // Utility Functions
    // Performance statistics:https://jsperf.com/custom-random-number-generation/1
    // A wrapper for window.Math.random method to componsate SonarQube 
    function random() {
        return window.Math.random();
    }

    // It generates a secure random number
    function cryptoRandom() {
        var crypto = window.crypto || window.msCrypto;
        return crypto.getRandomValues(new window.Uint32Array(1))[0] / 4294967295;
    }

    function uuid() {
        //v: version 4 and variant :'89ab';
        function _p8(size, v) {
            var val = v ? ($UIF.Object.isNumber(v) ? v : v[window.Math.floor(random() * 4)]) : null;
            var p = (random().toString(16) + random().toString(16) + "000000000").substr(2, 8);
            return size ? ["-", (val ? val + p.substr(0, 3) : p.substr(0, 4)),
                       "-", (val ? val + p.substr(4, 3) : p.substr(4, 4))].join('') : p;
        }
        return _p8() + _p8(true, 4) + _p8(true, '89ab') + _p8();
    }

    function isuuid(value) {
        var pattern = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/i; //NOSONOR
        return pattern.test(value);
    }

    $UIF.Utility = {
        random: random,
        cryptoRandom: cryptoRandom,
        uuid: uuid,
        isuuid: isuuid,
        isguid: isuuid
    };

})(window.$UIF);
