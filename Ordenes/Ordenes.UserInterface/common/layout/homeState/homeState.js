/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.layout')
        .controller('HomeStateController', HomeStateController)
        .config(['$locationProvider', '$compileProvider', AngularConfig]);

    function AngularConfig($locationProvider) {
        //configured on angular migration to 1.6.3
        $locationProvider.hashPrefix("");
    }

    HomeStateController.$inject = ['$timeout', '$rootScope', '$state', '$interval',
        'common.services.security.ui.authorization', 'CONFIG', 'APPCONFIG', 'common.sidebar.sidebarService',
        '$stateParams', 'common.widgets.messageOverlay.service', '$translate', 'checkStartupTasks', '$q', 'common.services.session', 'common.globalization.globalizationConfig',
        'common.services.ui.authentication', 'common.services.authentication.config', 'common.services.layout.shell', 'RESOURCE', 'common.services.logger.service',
        'common.services.startup.service', 'common.services.modelDriven.service',
        'common.services.personalization.personalizationService', 'common.services.nerveBoxStartupService', 'common.services.swac.SwacUiModuleManager', 'common', 'common.widgets.commandBar.service', 'common.ctx'
    ];

    function HomeStateController($timeout, $rootScope, $state, $interval, auth, CONFIG, APPCONFIG, SidebarService, $stateParams,
        globalMsgOverlayManager, $translate, checkStartupTasks,
        $q, sessionService, globalizationConfig, authentication, authenticationConfig, shell,
        RESOURCE, loggerService, startupService, mdService, personalizationService, nerveboxStartupService, swacManagerService, common, commandBarService, commonContext) {
        var config, logger, homeStateInterval, authorizedModules = [];
        var applicationContext;

        activate();

        function activate() {
            applicationContext = common.getApplicationContext();

            angular.element('#initialBusyIndicator').remove();
            init();
            if ($stateParams.stateid && $stateParams.stateToReturn) {
                sessionService.set($stateParams.stateid + '.stateToReturn', $stateParams.stateToReturn);
                if ($stateParams.stateParamsToReturn) {
                    sessionService.set($stateParams.stateid + '.stateParamsToReturn', $stateParams.stateParamsToReturn);
                }
            }
            if ($stateParams.stateUrlToReturn) {
                sessionService.set('stateUrlToReturn', JSON.stringify($stateParams.stateUrlToReturn));
            }

            if (!checkStartupTasks) {
                start();
                return;
            }
            loadResources().then(function () {
                checkAuthentication().then(function () {
                    loadModelDrivenModules().then(function () {
                        if ('runtime' !== APPCONFIG.appConfig.type) {
                            start();
                            if (!nerveboxStartupService.isStarted()) {
                                nerveboxStartupService.start();
                            }
                            return;
                        }
                        personalizationService.getPersonalization().then(function () {
                            $timeout(function () {
                                start();
                                if (!nerveboxStartupService.isStarted()) {
                                    nerveboxStartupService.start();
                                }
                            }, 1000);
                        });
                    }, function () {
                        logger.logDebug('loading model driven modules failed.');
                    });
                }, function () {
                    if (swacManagerService.enabled) {
                        authentication.login();
                    }
                    logger.logDebug('authentication failed.....waiting for redirect');
                });
            });
        }

        function init() {
            config = angular.extend({}, APPCONFIG, CONFIG);
            logger = loggerService.getModuleLogger('HomeStateController');
            if (config.appConfig.type === 'runtime') {
                //Opcenter EX FN 3.1 onwards, for runtime applications, the resource files will be merged and loaded from new folder resources.
                RESOURCE = {
                    path: [{
                        name: 'resources/',
                        modules: [{
                            name: 'resource'
                        }]
                    }]
                };
            }
        }

        function start() {
            if ($state.current.name !== 'home') {
                return;
            }
            if (applicationContext.isStartupTasksCompleted()) {
                redirectToState();
                return;
            }
            if (CONFIG.type !== 'rt') {
                auth.isFunctionalRightsLoaded = true;
                executeStartTasks().finally(redirectToState);
                return;
            }
            auth.initialize().then(function () {
                //hiding inaccessible screens in sidebar at 'RUNTIME'
                hideSidebarMenuItems(auth.getAuthorizedScreens());
                if (swacManagerService.enabled) {
                    var authorizedScreens = auth.getAuthorizedScreens();
                    swacManagerService.contextServicePromise.promise.then(function (service) {
                        service.registerCtx('authorizedScreens', authorizedScreens);
                    });
                    authorizedScreens.length && config.menu.length && config.menu.forEach(function (menuItem) {
                        menuItem.contents && menuItem.contents.forEach(function (itemobject) {
                            _.contains(authorizedScreens, itemobject.id) && authorizedModules.push(menuItem.id);
                        });
                    });
                    swacManagerService.contextServicePromise.promise.then(function (service) {
                        service.registerCtx('authorizedModules', authorizedModules);
                    });
                    var isCommandsLableEnbled = window.sessionStorage.getItem('isCommandLabelVisible');
                    if (isCommandsLableEnbled === 'true') {
                        commandBarService.setCommandLabelVisibility(true)
                    } else {
                        commandBarService.setCommandLabelVisibility(false)
                    }

                    var currentPlantInfo = common.plant.getCurrentPlant();
                    swacManagerService.contextServicePromise.promise.then(function (service) {
                        service.registerCtx('plantContextInfo', {
                            UserContextInfo: {
                                label: 'Plant: ',
                                id: currentPlantInfo.NId,
                                value: currentPlantInfo.Name
                            }
                        });
                    });
                }
            }, function () {

            }).finally(function () {
                executeStartTasks().finally(redirectToState);
            });
        }

        function loadResources() {
            var deferred = $q.defer();
            if (globalizationConfig.resourcesLoaded) {
                deferred.resolve();
                return deferred.promise;
            }
            shell.setGlobalization(RESOURCE, config.languages).then(function () {
                $translate.refresh().then(function () {
                    globalizationConfig.resourcesLoaded = true;
                    deferred.resolve();
                }, function () {
                    deferred.resolve();
                });
            }, function () {
                deferred.resolve();
            });
            return deferred.promise;
        }

        function checkAuthentication() {
            var deferred = $q.defer();
            if (authentication.isAuthorized() && !isAccessTokenValidationRequired()) {
                deferred.resolve();
                return deferred.promise;
            }
            if (!authenticationConfig.config.enableAuthentication) {
                deferred.resolve();
                return deferred.promise;
            }
            authentication.checkAuthentication().then(function () {
                deferred.resolve();
            }, function (reason) {
                logger.logErr('check Authentication Error: ', reason);
                if (reason && reason.status !== undefined && reason.status !== 401 && reason.status !== 404) {
                    $state.go('error');
                    deferred.reject();
                    return;
                }
                if (reason.data.error !== undefined && reason.data.error.errorCode === '6401') {
                    deferred.reject();
                    return;
                }
                if (reason.data.error !== undefined && reason.data.error.errorCode === 503) {
                    showErrorMessage($translate.instant('common.serviceLayerError.title'), reason.data.error.errorMessage);
                    deferred.reject();
                    return;
                }
                deferred.resolve();
            });
            return deferred.promise;
        }

        function loadModelDrivenModules() {
            var deferred = $q.defer();
            mdService.initStates().then(function () {
                deferred.resolve();
            }, function () {
                deferred.resolve();
            });
            return deferred.promise;
        }

        function executeStartTasks() {
            var deferred = $q.defer();
            startupService.execute().finally(function () {
                deferred.resolve();
            });
            return deferred.promise;
        }

        function hideSidebarMenuItems(accessibleStates) {
            var hideInSidebar = [],
                menuIds = [];
            var menuItems = CONFIG.menu;
            var contentsGroupedByCategory = {};

            menuItems.forEach(function (menuItem) {
                menuIds.push(menuItem.id);
                var contents = menuItem.contents;
                if (contents && contents.length > 0) {
                    var idsToHide = [];
                    contents.forEach(function (content) {
                        if (content.securable === true) {
                            var isStateAccessible = _.contains(accessibleStates, content.id);

                            if (!isStateAccessible) {
                                idsToHide.push(content.id);
                            }
                        }
                    });
                    if (contents.length === idsToHide.length) {
                        hideInSidebar.push(menuItem.id);
                    } else if (idsToHide.length > 0) {
                        idsToHide.forEach(function (id) {
                            hideInSidebar.push(id);
                        });
                    }
                    //In case of configuration by top menu groups the screens by category because it will shown on the menu in this way.
                    //This operation is only necessary at this point to compute at the end of the loop if at least screen is visible 
                    if (isConfiguredByToolMenu()) {
                        var groupedByCategoryPartial = groupByCategory(contents);
                        for (var key in groupedByCategoryPartial) {
                            if (groupedByCategoryPartial.hasOwnProperty(key)) {
                                if (contentsGroupedByCategory.hasOwnProperty(key)) {
                                    contentsGroupedByCategory[key] = contentsGroupedByCategory[key].concat(groupedByCategoryPartial[key])
                                } else {
                                    contentsGroupedByCategory[key] = groupedByCategoryPartial[key]
                                }
                            }
                        }
                    }
                } else {
                    if (menuItem.securable === true) {
                        var isStateAccessible = _.contains(accessibleStates, menuItem.id);
                        if (!isStateAccessible) {
                            hideInSidebar.push(menuItem.id);
                        }
                    }
                }
            });

            if (isConfiguredByToolMenu()) {
                //If the menu configuration is By Top Menu then if all the screens belonging to a Category are not visible then also the Category must not be visible on the Menu.
                for (var key in contentsGroupedByCategory) { //iterate over the categories
                    if (contentsGroupedByCategory.hasOwnProperty(key)) {
                        var areThereAtLeastOneAccessibleStateForTheCategory = contentsGroupedByCategory[key].some(function (element) {
                            return accessibleStates.includes(element.id);
                        });
                        
                        //If it is not already present the category on the primary button menu to be hidden and this category has not at least one visible screen --> Hide the primary button menu
                        if (!areThereAtLeastOneAccessibleStateForTheCategory && !hideInSidebar.includes(key)) {
                            hideInSidebar.push(key);
                        }
                    }
                }
            }

            var matchStates = _.difference(menuIds, hideInSidebar);
            if (matchStates.length === 0 && hideInSidebar.length === menuIds.length) {
                $rootScope.hideSidebar = true;
            } else {
                SidebarService.hideMenuItems(hideInSidebar);
            }
            if (swacManagerService.enabled) {
                swacManagerService.contextServicePromise.promise.then(function (service) {
                    service.registerCtx('unAuthorizedModules', hideInSidebar);
                });
            }
        }

        function groupByCategory(data) {
            var groupedData = data.reduce(function (acc, obj) {
                var key = obj.category;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
            return groupedData;
        }

        function isConfiguredByToolMenu() {
            if (CONFIG && CONFIG.home && CONFIG.home.navigationMode === 'category') {
                return true;
            }
            return false;
        }

        function getStateNameByUrl(stateURL) {
            var stateUrlToBeSearched = stateURL.childUrl ? stateURL.childUrl : stateURL.parentUrl;
            //omitting the query string params while comparing
            var indexOfQuestionMark = stateUrlToBeSearched.indexOf('?');
            stateUrlToBeSearched = indexOfQuestionMark !== -1 ? stateUrlToBeSearched.substring(0, indexOfQuestionMark) : stateUrlToBeSearched;
            var stateName, stateParams, stateObj;
            var allStates = $state.get();
            if (allStates && allStates.length) {
                allStates.forEach(function (state, index) {
                    indexOfQuestionMark = state.url && state.url.indexOf('?');
                    var stateUrl = indexOfQuestionMark >= 0 ? state.url.substring(0, indexOfQuestionMark) : state.url;
                    if (stateUrl === stateUrlToBeSearched) {
                        stateObj = state;
                        if (!state.views['Canvas@']) {
                            stateObj = getStateNameByUrl({
                                'parentUrl': stateURL.parentUrl
                            });
                        }
                        stateName = stateObj.name;
                        stateParams = stateObj.params;
                    }
                });
            }
            return {
                'name': stateName,
                'params': stateParams
            };
        }

        function redirectToState() {
            var stateConfig = null;

            //Complete final steps
            //set container context.........
            setContainerContext();
            applicationContext.setStartupTasksCompleted(true);

            var state = null,
                stateParams, stateUrl = {},
                isStateFromConfig;
            var pendingNavigation = applicationContext.getPendingNavigation();
            if (null !== pendingNavigation) {
                state = pendingNavigation.stateName;
                stateParams = JSON.stringify(pendingNavigation.stateParams);

                applicationContext.setPendingNavigation(null);
            }

            if (null === state && $stateParams.stateid) {
                state = sessionService.get($stateParams.stateid + '.stateToReturn');
                stateParams = sessionService.get($stateParams.stateid + '.stateParamsToReturn');

                sessionService.remove($stateParams.stateid + '.stateToReturn');
                sessionService.remove($stateParams.stateid + '.stateParamsToReturn');
            }
            if (undefined === state || null === state || 'home' === state) {

                stateUrl = JSON.parse(sessionService.get('stateUrlToReturn'));
                sessionService.remove('stateUrlToReturn');
                if (stateUrl && stateUrl.parentUrl) {
                    var stateObj = getStateNameByUrl(stateUrl);
                    if (stateObj && stateObj.name) {
                        state = stateObj.name;
                        stateParams = JSON.stringify(stateObj.params);
                    }
                }
                if (undefined === state || null === state) {
                    if (!config.home && !config.home.screen) {
                        showErrorMessage($translate.instant('common.undefinedHome.title'), $translate.instant('common.undefinedHome.text'));
                        return;
                    }

                    state = config.home.screen || config.home;
                    isStateFromConfig = true;
                }
            }
            if (!isStateFromConfig) {
                if (undefined !== stateParams && null !== stateParams) {
                    stateParams = JSON.parse(stateParams);
                } else {
                    stateParams = {};
                }
                stateConfig = $.extend({
                    inherit: false
                }, stateConfig);
                $state.go(state, stateParams, stateConfig);
                return;
            }
            var homeState = getStateValue(state);
            if (undefined !== homeState && null !== homeState) {
                navigateToHomeState(state, stateConfig);
                return;
            }
            homeStateInterval = $interval(function () {
                var homeState = getStateValue(state);
                if (homeState && Object.keys(homeState).length) {
                    navigateToHomeState(state, stateConfig);
                }
            }, 100, 0, false);
        }

        function setContainerContext() {
            if (!swacManagerService.enabled) {
                return;
            }
            //set container language.....
            swacManagerService.i18NServicePromise.promise.then(function (service) {
                service.set($translate.use());
            });
            //inform container about component status.....
            swacManagerService.eventBusServicePromise.promise.then(function (service) {
                service.publish('mom.sit.loadComplete', {
                    language: $translate.use()
                });
            });
        }

        function getStateValue(stateName) {
            return $state.get(stateName);
        }

        function navigateToHomeState(stateName, stateConfig) {
            if (undefined !== homeStateInterval) {
                $interval.cancel(homeStateInterval);
            }
            stateConfig = $.extend({
                inherit: false
            }, stateConfig);
            $state.go(stateName, {}, stateConfig);
        }

        function hideOverlay() {
            globalMsgOverlayManager.hide();
        }

        function showErrorMessage(title, text) {
            var overlaySettings = {
                buttons: [{
                    id: 'ok',
                    displayName: $translate.instant('common.ok'),
                    onClickCallback: hideOverlay
                }],
                title: title,
                text: text
            };

            globalMsgOverlayManager.set(overlaySettings);
            globalMsgOverlayManager.show();
        }

        function isAccessTokenValidationRequired() {
            var result = false;
            try {
                //i am in normal mode, ideally can use session storage
                if ('normal' === commonContext.getAppMode()) {
                    return result;
                }
                var componentPath = window.location.origin + window.location.pathname;
                if (componentPath.indexOf('.html')) {
                    componentPath = componentPath.slice(0, componentPath.lastIndexOf('/') + 1);
                }

                var containerPath = window.parent.location.origin + window.parent.location.pathname;
                if (containerPath.indexOf('.html')) {
                    containerPath = containerPath.slice(0, containerPath.lastIndexOf('/') + 1);
                }
                //both component and container are same applications
                if (componentPath === containerPath) {
                    return result;
                }
                result = true;
            } catch (ex) {
                logger.logDebug('error while fetching parent location...', ex);
                result = true;
            }
            return result;
        }
    }
})();