/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.momIcon
    *
    * @description
    * This module provides functionalities to display svg icon.
    */
    angular.module('siemens.simaticit.common.widgets.momIcon', []);

})();

"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        /**
         * @ngdoc service
         * @name host.service
         * @module siemens.simaticit.studio
         *
         * @description
         * Service used for host management operations
         *
         */
        var MomIconService = /** @class */ (function () {
            function MomIconService($q) {
                this.$q = $q;
            }
            MomIconService.prototype.getMomIcon = function (iconType, iconName, iconSize) {
                if (iconType === void 0) { iconType = "cmd"; }
                return "common/icons/" + iconType + iconName + iconSize + ".svg";
            };
            MomIconService.$inject = ['$q'];
            return MomIconService;
        }());
        framework.MomIconService = MomIconService;
        angular.module('siemens.simaticit.common.widgets.momIcon').service('momIcon.service', MomIconService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=mom-icon.svc.js.map
/*jshint -W098 */
(function () {
    'use strict';
    var app = angular.module('siemens.simaticit.common.widgets.momIcon');
    /**
     * @ngdoc directive
     * @name sitMomIcon
     * @module siemens.simaticit.common.widgets.momIcon
     * @description
     * The **momIcon** is a widget that is used to load SVG icons from opexfn-images.json
     *
     * @usage
     * Two ways mom icon can be configured (path and type)
     * 
     * @example
     * ```
     * 
     * <div sit-mom-icon="appDevCtrl.svgIconWithPath"></div>
     * this.svgIconWithPath = { path: 'common/icons/cmd5Why24.svg' };
     * 
     * ```
     * 
     * 
     * ```
     * <div sit-mom-icon="appDevCtrl.svgIconWithType"></div>
     * this.svgIconWithType = { path: 'common/icons/cmd5Why24.svg' };
     *
     * ```
     * set height and width for svg icon using sit-class or size
     *
     * 
     * @example
     * 
     * <h2> setting height and width using `sit-class` for svg </h2>
     * In a view template, the `sit-mom-icon` directive is used as follows:
     *
     * ```
     * <div class="sample-class" sit-mom-icon="appDevCtrl.svgIconWithPath"></div>
     * 
     * ```
     * In the corresponding view controller and view style sheet
     * 
     * ```
     * this.svgIconWithPath = { path: 'common/icons/cmd5Why24.svg' };
     * .sample-class {
            height: 30px;
            width: 30px;
        }
     * ```
     * 
     * <h2> setting height and width using `size` for svg </h2>
     * In a view template, the `sit-mom-icon` directive is used as follows:
     *
     * ```
     * <div class="sample-class" sit-mom-icon="appDevCtrl.svgIconWithPath"></div>
     *
     * ```
     * In the corresponding view controller
     *
     * ```
     * this.svgIconWithPath = { path: 'common/icons/cmd5Why24.svg', size:34 };
     * 
     * ```
     * 
     *
     */
    app.service('common.widgets.momIcon.momIconDataService', ['$http', '$q', function ($http, $q) {
        var _that = this;
        var ICON_REPOSITORY_URL = "common/opexfn-images.json";
        this.iconCache = {};
        this.httpQueue = {};
        this.httpRepositoryQueue = {};
        this.iconRepository = null;
        this.imageContentsLoaded = false;
        this.get = function (path) {
            var deferred = $q.defer();
            if (_that.iconCache.hasOwnProperty(path)) {
                deferred.resolve(_that.iconCache[path]);
            } else {
                _that.httpQueue[path] = _that.httpQueue[path] || [];
                _that.httpQueue[path].push(deferred);
                if (_that.httpQueue[path].length > 1) {
                    _that.httpQueue[path].push(deferred);
                } else {
                    var result;
                    $http.get(path).then(function (response) {
                        response.data = response.data.replace('<svg', '<svg icon-name="' + path.split('/').pop().split('.').shift() + '"');
                        _that.iconCache[path] = response.data;
                        result = _that.iconCache[path];
                    }, function () { result = null; }).finally(function () {
                        _.each(_that.httpQueue[path], function (item) {
                            item.resolve(result);
                        });
                        delete _that.httpQueue[path];
                    });
                }
            }
            return deferred.promise;
        }
        this.getIcon = function (path) {
            var deferred = $q.defer();
            var icon = path.split('/').pop().split('.').shift();
            var repositoryIcon = _that.iconRepository[icon];
            if (!repositoryIcon) {
                _that.get(path).then(function (icon) {
                    deferred.resolve(icon);
                });
            } else {
                deferred.resolve(_that.iconRepository[icon]);
            }
            return deferred.promise;
        }
        this.getIconFromRepository = function (path) {
            var deferred = $q.defer();
            if (_that.iconRepository) {
                _that.getIcon(path).then(function (icon) {
                    deferred.resolve(icon);
                });
            } else {
                _that.httpRepositoryQueue[path] = _that.httpRepositoryQueue[path] || [];
                _that.httpRepositoryQueue[path].push(deferred);
                if (_that.httpRepositoryQueue[path].length > 1) {
                    _that.httpRepositoryQueue[path].push(deferred);
                } else {
                    $http.get(ICON_REPOSITORY_URL).then(function (response) {
                        _that.iconRepository = response.data;
                    }).finally(function () {
                        _.each(_that.httpRepositoryQueue[path], function (item) {
                            _that.getIcon(path).then(function (icon) {
                                item.resolve(icon);
                            });
                        });
                        delete _that.httpRepositoryQueue[path];
                    });
                }
            }
            return deferred.promise;
        }
    }]);

    function momIconController(momIconService) {
        var vm = this;
        init(vm);

        function init(vm) {
            if (vm.momIcon) {
                setIconData(vm.momIcon);
                vm.momIcon.refresh = refresh;
            }
        }

        function setIconData(momIcon) {
            var prefix, name, suffix;
            vm.iconPath = '';
            vm.iconSize = momIcon.size || '24px';

            if (momIcon.path) {
                vm.iconPath = momIcon.path;
            } else if (momIcon.name) {
                prefix = momIcon.prefix || 'cmd';
                name = momIcon.name;
                suffix = momIcon.suffix || '24';
                vm.iconPath = momIconService.getMomIcon(prefix, name, suffix);
            }
        }

        function refresh(momIcon) {
            setIconData(momIcon);
        }
    }

    app.controller('momIconController', ['momIcon.service', momIconController]);

    app.directive('sitMomIcon', ['$compile', '$timeout', 'common.widgets.momIcon.momIconDataService', function ($compile, $timeout, momIcondataService) {

        return {
            scope: {},
            bindToController: {
                'momIcon': '=?sitMomIcon'
            },
            restrict: 'AE',
            controller: 'momIconController',
            controllerAs: 'momIconCtrl',
            link: function (scope, elmnt, attrs, ctrl) {
                if (ctrl.momIcon && ctrl.momIcon.path) {
                    var watch = scope.$watch(function () {
                        return ctrl.momIcon ? ctrl.momIcon.path : false;
                    }, function () {
                        if (ctrl.momIcon) {
                            ctrl.iconPath = ctrl.momIcon.path;
                            loadIcon();
                        }
                    }, true);
                    scope.$on('$destroy', function () {
                        watch();
                    });
                }

                function loadIcon() {
                    if (!ctrl.iconPath) return;
                    var iconName = ctrl.iconPath.split('/').pop().split('.').shift();
                    var imageContent;
                    momIcondataService.getIconFromRepository(ctrl.iconPath).then(function (data) {
                        imageContent = attrs.hasOwnProperty('sitClass')
                        if (attrs.hasOwnProperty('sitClass')) {
                            imageContent = data.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" icon-name="'
                                + iconName + '"');
                        } else {
                            imageContent = data.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" icon-name="'
                                + iconName + '" width="' + ctrl.iconSize + '" height="' + ctrl.iconSize + '"');
                        }
                        imageContent && (elmnt.first().empty().append(($compile(imageContent)(scope)).addClass(attrs['sitClass'])));
                    });
                }
                loadIcon();
            }
        };
    }]);

})();