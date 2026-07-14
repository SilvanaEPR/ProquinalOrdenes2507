/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    var ctrl = 'common.layout.modelDriven.template.CNFCtrl';
    angular.module('siemens.simaticit.common.services.modelDriven')
        /**
          * @ngdoc controller
          * @name common.layout.modelDriven.template.MDCtrl
          * @module siemens.simaticit.common.services.modelDriven
          * @access public
          * @description
          * The controller for the MD master/details template
          *
          */
        .controller(ctrl, ['$state', '$rootScope', '$translate', 'common.base', function ($state, $rootScope, $translate, base) {
                var self = this;
                var stateParams = {}, tracking = [];              
            }]);
}());

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.services.modelDriven').controller('common.layout.modelDriven.template.MDCtrl', Controller);
    /**
    * @ngdoc controller
    * @name common.layout.modelDriven.template.MDCtrl
    * @module siemens.simaticit.common.services.modelDriven
    * @access public
    * @description
    * The controller for the MD master/details template
    *
    */
    Controller.$inject = [
        '$state',
        '$rootScope',
        '$scope',
        '$translate',
        'common.base',
        '$q',
        '$timeout',
        'common.services.modelDriven.service',
        'common.services.modelDriven.runtimeService',
        '$stateParams',
        'common.services.modelDriven.contextService',
        'common.services.swac.SwacUiModuleManager',
        'common.mduiBreadcrumb.breadcrumbService',
        'common.services.modelDriven.warningService'
    ];
    function Controller(
        $state,
        $rootScope,
        $scope,
        $translate,
        base,
        $q,
        $timeout,
        md,
        mdrt,
        $stateParams,
        mdContextSrv,
        swacMgr,
        breadcrumbService,
        warningService
    ) {
        var self = this;
        var stateParams = {}, tracking = [];
        (function (params) {
            stateParams = params.stateParams;
            tracking = params.tracking;
        })(JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)));
        var detailName = "", stateId = $state.$current.toString();
        self.isInitComplete = false;
        self.activeContentId = null;
        var isDetailToBeSelected = false;
        var useScreenTitle = false;
        self.isDrillDownState = stateParams.isDrillDownState;
        var masterSelectedItem = null;
        self.stateInfo = null;
        self.propertiesLoaded = true;
        //reset sidepanel state
        mdContextSrv.setPropertyPanelState(false, null);

        md.loadModule(stateId).then(function (manifest) {
            var screen = manifest.states.filter(function (s) { return s.id === stateId; })[0], masterName = "";
            self.groupDetails = md.getCurrentModuleInfo(screen.id).groupDetails || [];
            self.groupDetails.forEach(function (group) {
                if (group.heading) {
                    group.name = $translate.instant(group.heading);
                }
            });
            self.mdView = { "params": {} };
            setScreenTitle();
            //Layout standard behaviours:
            // When a detail tab is activated the command bar is refreshed
            // When a detail tab is activated the 'activeContent' context is changed to the active
            self.setActiveTabIndex = function (content) {
                self.ready = false;
                if (content) {
                    self.mdViewCtrl.setActiveContent(content);
                    self.mdViewCtrl.commandBars[0].refresh();
                    self.activeContentId = content;

                    //managing sidepanel visibility on tab switch
                    ensureSidepanelVisibility();
                    if (self.mdView.contents[content].multiplicity === "one") {
                        $timeout(function () {
                            self.ready = true;
                        });
                    }
                }
            };

            function loadProperties() {
                $timeout(function () {
                    self.propertiesLoaded = true;
                }, 50);
            }

            function ensureSidepanelVisibility() {
                var sidepanelState = mdContextSrv.getPropertyPanelState();
                var isSidepanelToBeShown = evalSidepanelVisibility(sidepanelState);
                if (sidepanelState.isSidepanelOpen && !isSidepanelToBeShown) {
                    mdContextSrv.setPropertyPanelState(false, null);
                    $state.go('^');
                }
            }

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

            function setScreenTitle(breadcrumbField) {
                if (typeof breadcrumbField === 'undefined') {
                    self.screenTitle = $translate.instant(screen.header) || screen.title;
                } else {
                    self.screenTitle = $translate.instant(screen.header) + ' ' + breadcrumbField || screen.title + ' ' + breadcrumbField;
                }
                if (swacMgr.enabled) {
                    swacMgr.contextServicePromise.promise.then(function (service) {
                        service.updatePartialCtx('location.titles', { headerTitle: self.screenTitle });
                    });
                }
            }

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

            self.mdViewCtrl = new mdrt.ModelViewCtrl(screen, self.mdView, stateParams);
            //Reoder contents to simplify layout management
            self.newObj = {
                details: [], //array with table details only
                actions: self.mdViewCtrl.commandBars[0], //commandBar conf
                activeContent: ""
            };
            //Create newObj.master, newObj.overview and newObj.details[] objects
            for (detailName in self.mdView.contents) {
                if (self.mdView.contents[detailName].master) {
                    if (self.mdView.contents[detailName].multiplicity === "many") {
                        self.newObj.master = self.mdView.contents[detailName];
                    }
                }
                else {
                    self.newObj.details.push(self.mdView.contents[detailName]);
                }
            }
            // set first detail content as active
            self.newObj.details[0].isActive = true;
            masterName = self.newObj.master.id;

            function getBreadcrumbField(stateId) {
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
                    var content = currentScreen.contents[name];
                    if (content && content.master && content.blueprintSettings) {
                        field = content.blueprintSettings.breadcrumbTitle || '';
                        useScreenTitle = content.blueprintSettings.useScreenTitleInBreadcrumb;
                    }
                }
                return field;
            }

            self.stateInfo = self.mdViewCtrl.getStateInfo(stateId);
            if (self.stateInfo && self.stateInfo.master) {
                self.mdView.params[masterName] = self.stateInfo.master.id;
                isDetailToBeSelected = true;
            }

            function setBreadCrumbforMasterSelection() {
                var breadCrumbField, breadCrumbChain, breadCrumbTitle = '';
                breadCrumbField = getBreadcrumbField(stateId);
                var masterInfo = getContentInfo(masterSelectedItem, breadCrumbField, $stateParams);
                if (masterInfo) {
                    setScreenTitle();
                    breadCrumbTitle = setBreadCrumTitleForMasterSelection(masterInfo);
                    breadCrumbChain = tracking;
                    if (breadCrumbChain && breadCrumbChain.length > 0) {
                        breadCrumbChain[breadCrumbChain.length - 1].title = breadCrumbTitle;
                        self.mdViewCtrl.refreshBreadCrumbChainForMaster(breadCrumbChain);
                    }
                    if (masterInfo.field) {
                        setScreenTitle(masterInfo.title);
                    }
                }
            }

            function setBreadCrumTitleForMasterSelection(masterInfo) {
                if (masterInfo.useScreenTitle && masterInfo.field) {
                    return self.screenTitle + ' ' + masterInfo.title;
                } else if (masterInfo.field && masterInfo.field !== '') {
                    return masterInfo.title;
                } else {
                    return self.screenTitle;
                }
            }

            if (!self.isDrillDownState) {
                breadcrumbService.setBreadcrumbChain([]);
            }
            if (self.isDrillDownState || tracking.length) {
                self.mdViewCtrl.initBreadcrumb();
                self.breadcrumbOptions = {
                    onClick: function (breadcrumbItem) {
                        self.mdViewCtrl.goToPreviousLevel(breadcrumbItem);
                    }
                }
            }

            //Build Master details standard behaviors
            self.onMasterDataSelection = function () {
                self.propertiesLoaded = false;
                var refreshPromise = [];

                //select the active detail content after drill-down
                if (self.stateInfo && self.stateInfo.detail && self.stateInfo.detail.content && isDetailToBeSelected) {
                    self.mdView.params[self.stateInfo.detail.content] = self.stateInfo.detail.id;
                }
                self.newObj.details.forEach(function (content, index) {
                    if (content.multiplicity === 'many' && content.blueprintSettings && content.blueprintSettings.serverSidePagination) {
                        var dataArtifact = self.mdViewCtrl.getContentDataArtifact(content);
                        var appName = self.mdViewCtrl.getContentEntityAppName(content);
                        self.newObj.details[index].runtimeConf.serverDataOptions = {
                            dataService: self.mdViewCtrl[content.id],
                            dataEntity: dataArtifact,
                            appName: appName || screen.appName
                        };

                        var fieldSources = [];
                        if (content.fieldSources) {
                            fieldSources = fieldSources.concat(content.fieldSources);
                        }
                        if (content.extensionRef && content.extensionRef.length > 0) {
                            for (var i = 0; i < content.extensionRef.length; i++) {
                                var contentExtension = content.extensionRef[i];
                                if (!contentExtension.fieldSources) {
                                    continue;
                                }
                                fieldSources = fieldSources.concat(contentExtension.fieldSources);
                            }
                        }
                        self.newObj.details[index].runtimeConf.serverDataOptions.fieldSources = mapFieldSources(fieldSources);

                        var query = self.mdViewCtrl.interpolateQuery(content.query);
                        self.newObj.details[index].runtimeConf.serverDataOptions.optionsString = query;
                        self.mdViewCtrl[content.id].refresh();
                    }
                    else {
                        var promise = self.mdViewCtrl[content.id].refresh();
                        refreshPromise.push(promise);
                    }
                });
                if (self.isDrillDownState) {
                    setBreadCrumbforMasterSelection();
                }

                return refreshPromise;
            };
            self.onMasterDataUnselection = function () {
                self.propertiesLoaded = false;
                self.newObj.details.forEach(function (content, index) {
                    if (self.newObj.details[index].runtimeConf.serverDataOptions) {
                        delete self.newObj.details[index].runtimeConf.serverDataOptions;
                    }
                    self.mdViewCtrl[content.id].clear(); //clear is synch and do not provide promises
                });
                setScreenTitle();
                var breadCrumbChain = self.mdViewCtrl.getBreadcrumbChain();
                if (breadCrumbChain && breadCrumbChain.length > 0) {
                    if (self.stateInfo.master.field && !self.stateInfo.master.useScreenTitle) {
                        breadCrumbChain[breadCrumbChain.length - 1].title = '';
                    } else {
                        breadCrumbChain[breadCrumbChain.length - 1].title = self.screenTitle;
                    }
                    self.mdViewCtrl.refreshBreadCrumbChainForMaster(breadCrumbChain);
                }
                self.mdView.params = {};
                masterSelectedItem = null;
                var eventParams = {
                    'event': 'onMasterUnselection',
                    'data': null
                }
                $rootScope.$broadcast('mdui-context-refreshed', eventParams);
            };
            //Build master conf context
            if (self.mdViewCtrl[masterName]) {
                //master content select/deselect callback
                self.mdViewCtrl[masterName].onContentSelection = function (items, item) {
                    var refreshPromises = [];
                    var eventParams = {};
                    if (item && item.selected === true) {
                        if (!isDetailToBeSelected) {
                            self.mdView.params = {};
                        }
                        masterSelectedItem = item;
                        refreshPromises = self.onMasterDataSelection();
                        eventParams = {
                            'event': 'onMasterSelection',
                            'data': item
                        }
                        //$rootScope.$broadcast('mdui-context-refreshed', eventParams);
                    }
                    else if (item !== null) {
                        self.onMasterDataUnselection();
                    }
                    self.mdViewCtrl.evalDisableTabs(self.newObj.details, self.mdView);
                    $q.all(refreshPromises).then(function () {// command refresh on contents refresh completed
                        //select the active detail content after drill-down
                        if (item && item.selected === true) $rootScope.$broadcast('mdui-context-refreshed', eventParams);
                        if (warningService.initCustomOverlayOnStateChange().getIsFromIncanvas()
                            && mdContextSrv.selectedTabContentForInCanvas) {
                            var selectedTab = mdContextSrv.selectedTabContentForInCanvas;
                            mdContextSrv.selectedTabContentForInCanvas = false;
                            $timeout(function () {
                                selectActiveTab(selectedTab);
                            }, 100, false);
                        } else if (self.stateInfo && self.stateInfo.detail && self.stateInfo.detail.content && isDetailToBeSelected) {
                            $timeout(function () {
                                selectActiveTab(self.stateInfo.detail.content);
                                isDetailToBeSelected = false;
                            }, 100, false);
                        }
                        self.mdViewCtrl.commandBars[0].refresh();
                        loadProperties();
                    });
                };
                self.mdViewCtrl[masterName].onOpenClick = function (item, destScreen, drillDownParams) {
                    if (item && item.Id) {
                        var prop = screen.contents[masterName].blueprintSettings.drillDownSelectionKey;
                        drillDownParams['isDrillDownState'] = true;
                        destScreen = 'home.' + destScreen;
                        var sourceInfo = {
                            screenId: stateId,
                            breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(stateId, getBreadcrumbField(stateId), useScreenTitle, masterSelectedItem),
                            selectionInfo: {
                                master: { id: masterSelectedItem.Id },
                                detail: { content: '', id: null }
                            }
                        };
                        var destInfo = {
                            screenId: destScreen,
                            params: drillDownParams,
                            breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(destScreen, getBreadcrumbField(destScreen), useScreenTitle, masterSelectedItem)
                        };
                        self.mdViewCtrl.performDrillDown(sourceInfo, destInfo, item, prop);
                    }
                };
            }

            function getContentInfo(item, breadcrumbField, stateParams, prop) {
                var contentInfo = {};
                if (!item) {
                    return contentInfo;
                }
                contentInfo = {
                    id: prop ? window.$UIF.Object.safeGet(item, prop) : item.Id,
                    title: self.mdViewCtrl.getInterpolatedValue(breadcrumbField, item),
                    field: breadcrumbField,
                    useScreenTitle: useScreenTitle,
                    params: stateParams
                };
                return contentInfo;
            }

            self.newObj.details.forEach(function (detail) {
                //detaisl content select/deselect callback

                if ('auditTrail' !== detail.multiplicity) {
                    self.mdViewCtrl[detail.id].onContentSelection = function (items, item) {
                        self.mdViewCtrl.commandBars[0].refresh();
                    };
                    self.mdViewCtrl[detail.id].onContentRefresh = function (items, item) {
                        self.mdViewCtrl.commandBars[0].refresh();
                        if ('one' === detail.multiplicity) {
                            self.propertiesLoaded = false;
                            $timeout(function () {
                                self.propertiesLoaded = true;
                            }, 50);
                        }
                    };
                    self.mdViewCtrl[detail.id].onOpenClick = function (item, destScreenId, drillDownParams) {
                        if (item && item.Id) {
                            drillDownParams['isDrillDownState'] = true;
                            destScreenId = 'home.' + destScreenId;
                            var sourceInfo = {
                                screenId: stateId,
                                breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(stateId, getBreadcrumbField(stateId), useScreenTitle, masterSelectedItem),
                                selectionInfo: {
                                    master: { id: masterSelectedItem ? masterSelectedItem.Id : '' },
                                    detail: { content: detail.id, id: item.Id }
                                }
                            };
                            var destInfo = {
                                screenId: destScreenId,
                                params: drillDownParams,
                                breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(destScreenId, getBreadcrumbField(destScreenId), useScreenTitle, item)
                            };
                            self.mdViewCtrl.performDrillDown(sourceInfo, destInfo, item);
                        }
                    };

                }
            });
            // Initialization function
            if (warningService.initCustomOverlayOnStateChange().getIsFromIncanvas()) {
                md.inCanvasRefreshLogic(self.mdViewCtrl, masterName, self.mdView, screen);
            } else {
                if (self.mdViewCtrl[masterName]) {
                    self.mdViewCtrl.evalDisableTabs(self.newObj.details, self.mdView);
                    self.mdViewCtrl.commandBars[0].refresh();
                    var masterRefreshPromise = self.mdViewCtrl[masterName].refresh(true);
                    $q.all(masterRefreshPromise).then(function () {// command refresh on contents refresh completed
                        self.mdViewCtrl.commandBars[0].refresh();
                    });
                }
            }

            function selectActiveTab(content) {
                self.newObj.details.forEach(function (detail) {
                    if (detail.id === content) {
                        detail.isActive = true;
                        self.setActiveTabIndex(content);
                    } else {
                        detail.isActive = false;
                    }
                });
            }

            $rootScope.$on('mdui-context-updated', function () {
                self.mdViewCtrl.commandBars[0].refresh();
            });

            var includeContentErrorListener = $rootScope.$on('$includeContentError', function (angularEvent, src) {
                var contentError = self.newObj.details.filter(function (s) { return s.templatePath === src; })[0];
                if (contentError) {
                    contentError.templatePath = 'common\\blueprints\\masterDetailsTemplate\\contentNotFoundTemplate.html';
                }
            });

            $scope.$on('$destroy', function () {
                includeContentErrorListener();
            });

            $timeout(function () {
                self.isInitComplete = true;
            }, 50);
        });
    }
}());
