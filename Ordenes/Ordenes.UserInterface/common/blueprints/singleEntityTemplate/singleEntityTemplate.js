/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    var ctrl = "common.layout.modelDriven.template.SECtrl";
    angular.module('siemens.simaticit.common.services.modelDriven')
        /**
          * @ngdoc controller
          * @name common.layout.modelDriven.template.SECtrl
          * @module siemens.simaticit.common.services.modelDriven
          * @access public
          * @description
          * The controller for the MD single entity template
          *
          */
        .controller(ctrl, ['$state', '$rootScope', '$translate', '$timeout', 'common.base', 'common.services.modelDriven.service', 'common.services.modelDriven.runtimeService',
            '$stateParams', 'common.services.modelDriven.contextService', 'common.services.swac.SwacUiModuleManager', 'common.mduiBreadcrumb.breadcrumbService', 'common.services.modelDriven.warningService',
            function ($state, $rootScope, $translate, $timeout, base, md, mdrt, $stateParams, mdContextSrv, swacMgr, breadcrumbService, warningService) {
                var self = this;
                var stateParams = {}, tracking = [];
                (function (params) {
                    stateParams = params.stateParams;
                    tracking = params.tracking;
                })(JSON.parse(window.$UIF.String.decode($stateParams.mduiCtx)));
                var detailName = "", stateId = $state.$current.toString(), masterName = "";
                self.isInitComplete = false;
                self.isDrillDownState = stateParams.isDrillDownState;
                var useScreenTitleInBreadcrumb = false;
                //reset sidepanel state
                mdContextSrv.setPropertyPanelState(false, null);

                mdContextSrv.selectedTabContentForInCanvas = false;
                md.loadModule(stateId).then(function (manifest) {
                    /*  md.getManifest().then(function (manifest) {*/ // Assuming manifest has already been retrieved.
                    var screen = manifest.states.filter(function (s) { return s.id === stateId; })[0];

                    self.mdView = { "params": {} };
                    self.screenTitle = $translate.instant(screen.header) || screen.title;
                    if (swacMgr.enabled) {
                        swacMgr.contextServicePromise.promise.then(function (service) {
                            service.updatePartialCtx('location.titles', { headerTitle: self.screenTitle });
                        });
                    }
                    self.mdViewCtrl = new mdrt.ModelViewCtrl(screen, self.mdView, stateParams);

                    //Reoder contents to simplify layout management
                    self.newObj = {
                        actions: self.mdViewCtrl.commandBars[0]
                    };
                    //Create newObj.master for html template bind
                    for (detailName in self.mdView.contents) {
                        if (self.mdView.contents[detailName].master) {
                            if (self.mdView.contents[detailName].multiplicity === "many") {
                                self.newObj.master = self.mdView.contents[detailName];
                                self.mdViewCtrl.setActiveContent(detailName);
                                break;
                            }
                        }
                    }
                    if (!self.newObj.master) { //master not specified
                        for (detailName in self.mdView.contents) { //use first valid content
                            if (self.mdView.contents[detailName].multiplicity === "many") {
                                self.newObj.master = self.mdView.contents[detailName];
                                self.mdViewCtrl.setActiveContent(detailName);
                                break;
                            }
                        }
                    }

                    function showBreadcrumb() {
                        self.isBreadCrumbToBeShown = false;
                        var breadcrumbChain = self.mdViewCtrl.initBreadcrumb();
                        if (breadcrumbChain.length > 1) {
                            self.isBreadCrumbToBeShown = true;
                        }
                        self.breadcrumbOptions = {
                            onClick: function (breadcrumbItem) {
                                self.mdViewCtrl.goToPreviousLevel(breadcrumbItem);
                            }
                        }
                    }

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
                                useScreenTitleInBreadcrumb = content.blueprintSettings.useScreenTitleInBreadcrumb;
                            }
                        }
                        return field;
                    }

                    if (self.newObj.master) {
                        masterName = self.newObj.master.id;
                        var stateInfo;
                        stateInfo = self.mdViewCtrl.getStateInfo(stateId);
                        if (stateInfo && stateInfo.master) {
                            self.mdView.params[masterName] = stateInfo.master.id;
                        }
                        if (!self.isDrillDownState) {
                            breadcrumbService.setBreadcrumbChain([]);
                        }
                        if (self.isDrillDownState || tracking.length) {
                            showBreadcrumb();
                        }
                        if (self.mdViewCtrl[masterName]) {
                            self.mdViewCtrl[masterName].onContentSelection = function () {  //content selection
                                self.mdViewCtrl.commandBars[0].refresh(); //reevaluate command expression
                            };
                            self.mdViewCtrl[masterName].onOpenClick = function (item, destScreenId, drillDownParams) {
                                if (item && item.Id) {
                                    drillDownParams['isDrillDownState'] = true;
                                    destScreenId = 'home.' + destScreenId;
                                    var sourceInfo = {
                                        screenId: stateId,
                                        breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(stateId, getBreadcrumbField(stateId), useScreenTitleInBreadcrumb, item),
                                        selectionInfo: {
                                            master: { id: item.Id },
                                            detail: { content: '', id: null }
                                        }
                                    };
                                    var destInfo = {
                                        screenId: destScreenId,
                                        params: drillDownParams,
                                        breadCrumbTitle: self.mdViewCtrl.getBreadCrumbDisplayTitle(destScreenId, getBreadcrumbField(destScreenId), useScreenTitleInBreadcrumb, item)
                                    };
                                    self.mdViewCtrl.performDrillDown(sourceInfo, destInfo, item);
                                }
                            };
                        }
                        // Initialization function
                        var init = function () {
                            if (warningService.initCustomOverlayOnStateChange().getIsFromIncanvas()) {
                                md.inCanvasRefreshLogic(self.mdViewCtrl, masterName, self.mdView, screen);
                            } else {
                                self.mdViewCtrl.commandBars[0].refresh();
                                self.mdViewCtrl[masterName].refresh(true);
                            }
                        };
                        init();
                    }
                    $timeout(function () {
                        self.isInitComplete = true;
                    }, 50);
                });
            }]);
}());
