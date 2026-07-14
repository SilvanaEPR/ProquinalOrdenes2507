/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
      * @ngdoc controller
      * @name common.layout.modelDriven.template.Overview
      * @module siemens.simaticit.common.services.modelDriven
      * @access public
      * @description
      * The controller for the MD overview command template
      *
      */
    angular.module('siemens.simaticit.common.services.modelDriven').controller('common.layout.modelDriven.template.Overview', [
        'common.services.modelDriven.dataService', '$q', '$state', '$stateParams', '$translate', 'common.base', 'common.services.modelDriven.service',
        '$scope', 'common.services.modelDriven.contextService', '$rootScope', '$filter', 'common.services.swac.SwacUiModuleManager',
        'common.mduiBreadcrumb.breadcrumbService', 'common.services.modelDriven.warningService',
        function (multiDataService, $q, $state, $stateParams, $translate, base, md, $scope, mdContextSrv, $rootScope, $filter, SwacUiModuleManager, breadcrumbService, warningService) {
            var self = this, sidePanelManager = base.services.sidePanel.service, backendService = base.services.runtime.backendService,
                stateId, actionName;

            if ($state.$current && $state.$current.views && $state.$current.views["panel-in-canvas@"]) {
                stateId = $state.current.parent;
                actionName = $state.$current.toString().safeReplace(stateId + '_', '');
            } else {
                stateId = $state.$current.parent.toString();
                actionName = $state.$current.toString().safeReplace(stateId + '.', '');
            }

            var listner = [];
            self.currentItem = {};
            self.groupDetails = [];
            var parentContentName = '';
            warningService.initCustomOverlayOnStateChange().setIsViewAction(true);
            if (mdContextSrv.isFromMduiParent) {
                sessionStorage.storeContext = JSON.stringify(mdContextSrv.getContextInfo());
                sessionStorage.storeMdState = JSON.stringify(mdContextSrv.MDState);
            } else {
                mdContextSrv.setContexInfo(JSON.parse(sessionStorage.storeContext));
                mdContextSrv.MDState = JSON.parse(sessionStorage.storeMdState);
            }

            md.loadModule(stateId).then(function (manifest) {
                /* md.getManifest().then(function (manifest) {*/ // Assuming manifest has already been retrieved.
                var screen = manifest.states.filter(function (s) { return s.id === stateId; })[0], applName = screen.appName,
                    dataService = null, action = null, content = null, displayField = [], fillQueryResult = null;

                if (screen.type === "drill-down" && screen.referenceState) {
                    screen = manifest.states.filter(function (s) { return s.id === screen.referenceState; })[0];
                    applName = screen.appName;
                }

                var moduleInfo = md.getCurrentModuleInfo(screen.id);
                if (moduleInfo.groupDetails) {
                    self.groupDetails = moduleInfo.groupDetails;
                }

                //retrieve current action and data service
                function initAndSearchAction(elem) {
                    if (elem.id === this.act) {
                        action = elem;
                        parentContentName = this.contentName;
                        return true;
                    }
                    return false;
                }
                for (content in screen.contents) {
                    if (screen.contents[content].actions) {
                        if (screen.contents[content].actions.some(initAndSearchAction, { act: actionName, contentName: content })) {
                            dataService = multiDataService[action.behavior.entityRef.entity];
                            break;
                        }
                    }
                }
                self.cancel = function () {
                    removeInCanvasState();
                    sidePanelManager.close();
                    mdContextSrv.setPropertyPanelState(false, null);
                    $state.go('^');
                };
                self.displayMode = action.behavior.displayMode;
                if (action.behavior.displayMode === 'inCanvas') {
                    self.inCanvasColumns = action.behavior.inCanvasProperties && action.behavior.inCanvasProperties.columns ?
                        action.behavior.inCanvasProperties.columns : 3;
                    self.inCanvasCommandBarData = {
                        'barType': 'Action',
                        'bar': [
                            {
                                'name': 'Back', 'onClickCallback': self.cancel, 'cmdIcon': 'GoBack',
                                'type': 'Command', 'label': $translate.instant(action.behavior.cancelTitle) || $translate.instant('sidePanel.close'),
                                'tooltip': $translate.instant(action.behavior.cancelTitle) || $translate.instant('sidePanel.close'), 'visibility': true
                            }
                        ]
                    };
                } else {
                    self.buttonLabel = $translate.instant(action.shortLabel) || "Close";
                    self.sidepanelConfig = {
                        title: getTitle(),
                        messages: [{
                            type: 'warning',
                            text: ''
                        }],
                        actionButtons: [
                            {
                                label: $translate.instant(action.behavior.cancelTitle) || $translate.instant('sidePanel.close'),
                                onClick: self.cancel,
                                enabled: true,
                                visible: true
                            }
                        ],
                        closeButton: {
                            showClose: true,
                            tooltip: $translate.instant('sidePanel.close'),
                            onClick: self.cancel
                        }
                    };
                }

                function removeInCanvasState() {
                    if (action.behavior.displayMode === 'inCanvas') {
                        var tracking = breadcrumbService.getBreadcrumbChain();
                        tracking.pop();
                        breadcrumbService.setBreadcrumbChain(tracking);
                    }
                }

                self.displayData = [];
                self.selectFields = [];
                function findValue(source, prop, propIndex) {
                    var index = propIndex || 0;
                    return index + 1 === prop.length ? source[prop[index]] : findValue(source[prop[index]], prop, index + 1);
                }

                //recreate displayField string array
                function addFields(field, currFieldName, realIndex) {
                    if (field.group) {
                        var isGroupCreated = false, property;
                        for (var i = 0; i < self.displayData.length; i++) {
                            if (self.displayData[i].name === field.group && self.displayData[i].container === 'g') {
                                isGroupCreated = true;
                                property = { 'name': currFieldName, 'realFieldIndex': realIndex };
                                property.extensionName = field.extensionName;
                                self.displayData[i].fields.push(property);
                                break;
                            }
                        }
                        if (!isGroupCreated) {
                            var groupDetails = getGroupDetails(field.group);
                            var group = {
                                container: 'g',
                                fields: [],
                                name: groupDetails.id,
                                groupDetails: {
                                    'id': groupDetails.id,
                                    'heading': $translate.instant(groupDetails.heading),
                                    'collapsible': groupDetails.collapsible
                                }
                            };
                            property = { 'name': currFieldName, 'realFieldIndex': realIndex };
                            property.extensionName = field.extensionName;
                            group.fields.push(property);
                            self.displayData.push(group);
                        }
                    } else {
                        var fieldContainerCreated = false;
                        var displayDataLength = self.displayData.length;
                        if (displayDataLength && self.displayData[displayDataLength - 1].container === 'f') {
                            fieldContainerCreated = true;
                            property = { 'name': currFieldName, 'realFieldIndex': realIndex };
                            self.displayData[displayDataLength - 1].fields.push(property);
                        }

                        if (!fieldContainerCreated) {
                            property = { 'container': 'f', 'name': currFieldName, 'realFieldIndex': realIndex, 'fields': [] };
                            property.fields.push({ 'name': currFieldName, 'realFieldIndex': realIndex });
                            self.displayData.push(property);
                        }

                    }

                    if (typeof field.type === "object") {
                        Object.getOwnPropertyNames(field.type).forEach(function (propName) {
                            addFields(field.type[propName], currFieldName + "." + propName);
                        });
                    }
                }

                action.behavior.fields.forEach(function (propName, index) { addFields(propName, propName.name, index); });
                if (self.displayMode === 'inCanvas') {
                    self.displayData.sort(function (a, b) {
                        return a.container > b.container ? -1 : 1;
                    });
                }
                function createPropertyGridConfig(action, applName) {
                    self.displayData.forEach(function (arrayItem, index) {
                        if (arrayItem.container === 'g') {
                            arrayItem.fields.forEach(function (field, fieldIndex) {
                                self.displayData[index].fields[fieldIndex] = populateFields(action.behavior.fields[field.realFieldIndex]);
                            });
                        } else {
                            var field = arrayItem;
                            field.container = 'f';
                            arrayItem.fields.forEach(function (field, fieldIndex) {
                                self.displayData[index].fields[fieldIndex] = populateFields(action.behavior.fields[field.realFieldIndex]);
                            });
                        }
                    });
                }


                function getGroupDetails(groupId) {
                    var groupDetails = {};
                    for (var i = 0; i < self.groupDetails.length; i++) {
                        if (self.groupDetails[i].id === groupId) {
                            groupDetails = self.groupDetails[i];
                            break;
                        }
                    }
                    return groupDetails;
                }


                function populateFields(prop) {
                    var propName = prop.name, compositName = '', field = {};
                    if (!prop) {
                        compositName = propName.split('.');
                        prop = findValue(action.behavior.fields, compositName);
                        if (!prop) {
                            return;
                        }
                    }
                    field = {
                        id: propName,
                        name: propName,
                        label: $translate.instant(prop.label) || propName,
                        value: self.currentItem[propName],
                        container: prop.container

                    };
                    if (prop.type === 'boolean' || prop.type === 'Boolean') {
                        field.widget = 'sit-mdtoggle';
                    }
                    else if (prop.type === 'DateTimeOffset' || prop.type === 'DateTime') {
                        field.widget = 'sit-date-time-picker';
                    } else if (prop.type === 'TimeSpan') {
                        field.widget = 'sit-time-picker';
                    } else if (prop.type === 'Blob' || prop.type === 'blob') {
                        var mimeType = extractBlobInfo(field.value);
                        field.widget = 'sit-document-viewer';
                        field.widgetAttributes = {
                            'sit-config': {
                                "title": propName,
                                "showFirstDocument": true,
                                "mode": "display",
                                "fullScreenMode": "toolbar",
                                "plugins": [
                                    {
                                        "format": "svg",
                                        "viewer": "sit-vector-viewer"
                                    }
                                ]
                            },
                            'sit-categories': [{
                                'id': 'Category',
                                'name': propName
                            }],
                            'sit-document': {
                                'name': propName,
                                'source': field.value,
                                'format': mimeType,
                                'category': propName
                            },
                            'sit-data': [{
                                'name': propName,
                                'source': field.value,
                                'format': mimeType,
                                'category': propName
                            }],
                            'sit-actions': []
                        }
                    }
                    else {
                        field.widget = 'sit-label';
                    }
                    return field;
                }

                function getData() {
                    var filter;
                    var isPropetyModeOpen = mdContextSrv.getPropertyPanelState().isSidePanelOpen;
                    if (action.behavior.query) {
                        filter = mdContextSrv.interpolateQuery(action.behavior.query, null);
                        dataService.getAll(filter, applName, screen.layoutTemplate).then(function (data) {
                            var result;
                            if (data.value.length > 0) {
                                fillQueryResult = data.value;
                                action.behavior.fields.forEach(function (prop, index) {
                                    var propName = prop.name;
                                    if (action.behavior.fields[index].default) {
                                        if (typeof action.behavior.fields[index].default.expression === "string") {
                                            self.currentItem[propName] = mdContextSrv.parseWithStateCtx(action.behavior.fields[index].default.expression, {
                                                action: {
                                                    item: fillQueryResult[0], items: fillQueryResult
                                                }
                                            });
                                        }
                                        else if (typeof action.behavior.fields[index].default.body === "string") {
                                            result = mdContextSrv.evalFunctionWithStateCtx(action.behavior.fields[index].default.body, {
                                                action: {
                                                    item: fillQueryResult[0], items: fillQueryResult
                                                }
                                            });
                                            if (typeof result === "object" && result !== null && typeof result.then === "function") {
                                                result.then(function (outcome) {
                                                    self.currentItem[propName] = outcome;
                                                });
                                            }
                                            else {
                                                self.currentItem[propName] = result;
                                            }
                                        }
                                    }
                                    else {
                                        self.currentItem[propName] = mdContextSrv.parseExpr(propName, data.value[0]);
                                    }
                                    if (typeof action.behavior.fields[index].type === 'string' &&
                                        (action.behavior.fields[index].type.toLowerCase() === 'datetime' ||
                                            action.behavior.fields[index].type.toLowerCase() === 'datetimeoffset')) {
                                        self.currentItem[propName] = $filter('date')(self.currentItem[propName], 'medium');
                                    }
                                });
                            }
                            if (isPropetyModeOpen && self.displayData.length) {
                                updateSidepanelFieldData(self.currentItem);
                            } else {
                                createPropertyGridConfig(action, applName);
                            }
                        }, backendService.backendError);
                    }
                    else {
                        //evaluate "default" initial value
                        action.behavior.fields.forEach(function (prop, index) { //also hidden fields
                            var result;
                            var propName = prop.name;
                            if (action.behavior.fields[index].default) {
                                if (typeof action.behavior.fields[index].default.expression === "string") {
                                    self.currentItem[propName] = mdContextSrv.parseWithStateCtx(action.behavior.fields[index].default.expression, null);
                                }
                                else if (typeof action.behavior.fields[index].default.body === "string") {
                                    result = mdContextSrv.evalFunctionWithStateCtx(action.behavior.fields[index].default.body, null);
                                    if (typeof result === "object" && result !== null && typeof result.then === "function") {
                                        result.then(function (outcome) {
                                            self.currentItem[propName] = outcome;
                                        });
                                    }
                                    else {
                                        self.currentItem[propName] = result;
                                    }
                                }
                            }
                            if (typeof action.behavior.fields[index].type === 'string' &&
                                (action.behavior.fields[index].type.toLowerCase() === 'datetime'
                                    || action.behavior.fields[index].type.toLowerCase() === 'datetimeoffset')) {
                                self.currentItem[propName] = $filter('date')(self.currentItem[propName], 'medium');
                            }
                        });
                    }
                }

                function updateSidepanelFieldData(currentItem) {
                    if (!self.displayData.length) {
                        return;
                    }
                    self.displayData.forEach(function (item) {
                        item.value = currentItem[item.id];
                    });
                }

                function extractBlobInfo(data) {
                    var result = 'text';
                    if (typeof data !== 'string') {
                        return result;
                    }
                    var mime = data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/); //NOSONAR
                    if (mime && mime.length) {
                        var format = mime[1].split('/')
                        if (format[0] === 'application') {
                            result = format[1];
                        } else {
                            result = format[0];
                        }
                    }
                    return result;
                }

                (function () {
                    if (action.behavior.displayMode === 'inCanvas') {
                        self.screenTitle = getTitle();
                        if (SwacUiModuleManager.enabled) {
                            SwacUiModuleManager.contextServicePromise.promise.then(function (service) {
                                service.updatePartialCtx('location.titles', { headerTitle: self.screenTitle });
                            });
                        }

                        var tracking;
                        if (mdContextSrv.isFromMduiParent) {
                            tracking = breadcrumbService.getBreadcrumbChain();
                            tracking[tracking.length] = {
                                title: self.screenTitle
                            };
                            sessionStorage.storeBreadCrumb = JSON.stringify(tracking);
                        } else {
                            tracking = JSON.parse(sessionStorage.storeBreadCrumb);
                        }

                        breadcrumbService.setBreadcrumbChain(tracking);
                        self.inCanvasBreadCrumbOptions = {
                            onClick: function (breadcrumbItem) {
                                tracking.length = breadcrumbItem.index + 1;
                                breadcrumbService.setBreadcrumbChain(tracking);
                                var params = {};
                                params.mduiCtx = {
                                    stateParams: breadcrumbItem.params,
                                    tracking: tracking
                                };
                                params.mduiCtx.stateParams.isDrillDownState = tracking.length > 1 ? true : false;
                                params.mduiCtx = window.$UIF.String.encode(JSON.stringify(params.mduiCtx));
                                $state.go(breadcrumbItem.screenId, params, { reload: true });
                            }
                        };
                    } else {
                        sidePanelManager.setTitle($translate.instant(action.title) || $translate.instant(action.tooltip));
                        if (action.behavior.sidePanelProperties) {
                            var sidePanelMode = action.behavior.sidePanelProperties.mode;
                            if (sidePanelMode === 'modal' || action.behavior.sidePanelProperties.size === 'large') {
                                sidePanelMode = 'e';
                            } else {
                                sidePanelMode = 'p';
                            }
                            sidePanelManager.open({
                                'mode': sidePanelMode,
                                'size': action.behavior.sidePanelProperties.size
                            });
                            if (sidePanelMode === 'p') {
                                mdContextSrv.setPropertyPanelState(true, action.show);
                                listner[listner.lenght + 1] = $rootScope.$on('mdui-icv-item-selected', getData);
                            }
                        } else if (action.behavior.sidePanelMode === 'compact') {
                            sidePanelManager.open('p'); //show property mode panel
                            mdContextSrv.setPropertyPanelState(true, action.show);
                            listner[listner.lenght + 1] = $rootScope.$on('mdui-icv-item-selected', getData);
                        } else {
                            sidePanelManager.open('e');
                        }
                    }
                    getData();
                })();
                $scope.$on("$destroy", function () {
                    listner.forEach(function (listner) {
                        listner();
                    });
                });

                function checkValidTitle(fieldTitle) {
                    if (fieldTitle === null || fieldTitle === '' || fieldTitle === undefined) {
                        return false;
                    }
                    return true;
                }

                function getTitle() {
                    var title = $translate.instant(action.behavior.panelTitle) || $translate.instant(action.title);
                    var fieldTitle = '';
                    var contents = mdContextSrv.getContextInfo().contents;
                    if (action.behavior.panelTitleField && contents) {
                        if (contents[parentContentName]) {
                            if (contents[parentContentName].selectedItem) {
                                fieldTitle = contents[parentContentName].selectedItem[action.behavior.panelTitleField];
                            } else {
                                fieldTitle = contents[parentContentName][action.behavior.panelTitleField];
                            }
                        }
                        if (checkValidTitle(fieldTitle)) {
                            title = title + ' ' + fieldTitle;
                        }
                    }
                    return title;
                }
            }
            );
        }]
    );
}());
