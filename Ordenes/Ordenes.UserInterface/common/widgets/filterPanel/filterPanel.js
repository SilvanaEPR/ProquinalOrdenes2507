/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.filterPanel
 * @description
 * This module provides functionalities related to defining and saving filters, applying them to a given data set.
 */
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.filterPanel', []);

})();

/*jshint -W117,-W098, -W027 */
(function () {
    'use strict';
    //#region ng-doc comments
    /**
    * @ngdoc directive
    * @module siemens.simaticit.common.widgets.filterPanel
    * @name sitFilterPanel
    *
    * @restrict E
    *
    * @description
    * Provides UI and various functionalities to manage simple filters for a collection of data.
    * On loading the directive, the user can see a filter panel that appears on the left side.
    * The panel displays various html form elements based on the configuration that the user provides through fields parameter in sit-data attribute.
    * The panel shows various buttons at the top that provides functionalities to
    * 1. Save a fiter
    * 2. Save as another filter
    * 3. Load a saved filter
    * 3. Load a saved filter
    * 4. Delete a filter
    * 5. Clear all filter fields
    *
    * It also desplays, at the bottom of the panel, an Apply button which applies the filter on the collection of data
    * and a reset button which resets the filter fields and the filters applied on the data.
    *
    * @usage
    * As an element:
    * ```
    * <sit-filter-panel
    * sit-data="panelData"
    * sit-user-preference ="userID">
    * </sit-filter-panel>

    * ```
    * @param {Object} sitData This is an object that contains the following data:
    * 1. type: String with the value "filterPanel". Filter panel will be displayed in ICV or table only if type is specified as 'filterPanel'.
    * 2. fields: Array of objects where each object contains the details and the data required by a filter field.
    * It is mandatory for every object to specify the widget required, the field that it refers to and the other necessary data for the corresponding widget.
    * The following widgets are supported:
    *  * {@link sitText sit-text}
    *  * {@link sitNumeric sit-numeric}
    *  * {@link sitSelect sit-select}
    *  * {@link sitCheckbox sit-checkbox}
    *  * {@link sitMultiSelect sit-multi-select}
    *  * {@link sitEntityPicker sit-entity-picker}
    *  * {@link sitDatepicker sit-date-picker}
    *  
    *  **Note:** Apart from these widgets, user can also configure a custom widget which adheres to the sitProperty guidelines.
    * 3. floatID: ID of an element which must be pushed in the scenario where a group of items needs to be pushed on opening the filter panel.
    * 4. onApplyCallback: Optional custom callback function that has to be executed on clicking Apply button.
    * The data that is entered by the user will be passed as clauses to the custom method.
    * 5. onResetCallback: Optional custom callback function that has to be executed on clicking Reset button.
    * @param {string} sitUserPreference
    * Specifies the user preference ID from the parent widget's configuration.
    *
    * @example
    *  The following example shows how to configure a filterPanel widget:
    *
    * In Controller
    * ```
    *  (function () {
    *      FilterPanelDemoController.$inject = [];
    *      function FilterPanelDemoController() {
    *          var self = this;
    *          self.filterFields = {
    *      type:"filterPanel",
    *      dataService:backendService,
    *      fields: [
    *            { field: 'number',
    *              displayName: 'Number',
    *              type: 'string',
    *              widget: 'sit-numeric'
    *            },
    *            { field: 'product',
    *                displayName: 'Product',
    *                type: 'string' ,
    *                widget:'sit-select',
    *                options: [{id:'Aspirin',name:'Aspirin'},{id:'Dolipran',name:'Dolipran'},{id:'Vaccine',name:'Vaccine'}],
    *                "toDisplay": 'id',
    *                "toKeep": 'name',
    *                "onChange":function(){}
    *            },
    *            { field: 'tasks',
    *                displayName: 'Tasks',
    *                type: 'string' ,
    *                widget:'sit-advanced-select',
    *                widgetAttributes: {
    *                'sit-options':[],
    *                'sit-to-display': 'name',
    *                'sit-to-keep':'id
    *                },
    *               dataSource:{
    *                  entityName:'TaskDefinition',
    *                  appName:'Task',
    *                  optionsString:'$orderBy=NId asc',
    *                  displayProperty:'NId',
    *                  valueProperty:'Id'
    *               }
    *            },
    *            { field: 'name',
    *              displayName: 'Name',
    *              type: 'string',
    *              widget: 'sit-text'
    *            },
    *            {
    *              field: 'state',
    *              displayName: 'Entity Picker',
    *              type: 'string',
    *              widget: 'sit-entity-picker',
    *              toKeep: 'status',
    *              widgetAttributes: {
    *                          "sit-datasource": ['state1', 'state2', 'state3'], // [{status:'Approved'},{status:'In editing'},{status:'Saved'}],
    *                          "sit-selected-attribute-to-display": 'status',
    *                          "sit-template-url": 'Siemens.WidgetApp/modules/FilterPanel/entity-picker.html'
    *                      }
    *            },
    *            {
    *              field: 'status',
    *              displayName: 'status',
    *              type: 'string',
    *              widget: 'sit-multi-select',
    *              widgetAttributes: {
    *                      "sit-options": [
    *                          { "id": 'Approved', "name": 'Approved' },
    *                          { "id": 'In editing', "name": 'In editing' },
    *                          { "id": 'Waiting', "name": 'Waiting' }
    *                       ],
    *                       "sit-selected-string":""
    *                        },
    *              onChange: function() { }
    *              },
    {
    *              field: 'country',
    *              displayName: 'Country',
    *              type: 'string',
    *              widget: 'sit-advanced-select',
    *              widgetAttributes: {
    *                      "sit-options": [
    *                          { "id": 'India', "name": 'India' },
    *                          { "id": 'Italy', "name": 'Italy' },
    *                          { "id": 'US', "name": 'US' }
    *                       ],
    *                       "sit-selected-string":""
    *                        },
    *              onChange: function() { }
    *              },
    *              {
    *                  field: 'number',
    *                  displayName: 'date',
    *                  type: 'string',
    *                  widget: 'sit-datepicker'
    *              },
    *              {
    *                  field: 'name',
    *                  displayName: 'Name',
    *                  type: 'string',
    *                  widget: 'custom-widget',
    *                  validation: {
    *                       custom: function customValidationCallback(viewModel) {
    *                          //return whether the value is valid or not
    *                          return !!viewModel;
    *                      }
    *                  }
    *              },
    *              {
    *                   id: "F3",
    *                   field: "gender",
    *                   displayName: 'gender',
    *                   widget: 'sit-checkbox',
    *                   value: [
    *                       {
    *                           label: "Raw",
    *                           checked: true
    *                       },
    *                       {
    *                           label: "Gross",
    *                           checked: false
    *                       }
    *                   ]
    *
    *                }
    *          ],
    * floatID:'divID',
    * onApplyCallback:function(){ },
    * onResetCallback:function(){ }
    *}
    *
    *      self.sitUserPreference = "userID1"
    * })();
    * ```
    * In Template
    *```
    *  <sit-filter-panel
    *   sit-data = "ctrl.filterFields"
    *   sit-user-preference = "ctrl.sitUserPreference"
    *  </sit-filter-panel>
    *```
    *
    */

    angular.module('siemens.simaticit.common.widgets.filterPanel')
        .directive('sitFilterPanel', ['$compile', '$rootScope', '$http', FilterPanelDirective]);

    function FilterPanelDirective($compile, $rootScope, $http) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                'data': '=sitData',
                'userPrefId': '=sitUserPreference'
            },
            controller: FilterPanelController,
            controllerAs: 'filterPanelCtrl',
            link: function (scope, element, attr, ctrl) {
                var PANEL_WIDTH = 360;
                var BORDER_SPACE = 8;
                var LEFT_PADDING_FROM_PARENT = 16;
                var parentElement;
                ctrl.panelElm = undefined;
                ctrl.filterFields = ctrl.data.fields;
                var isPanelAppended = false;
                function loadPanel() {
                    $http.get("common/widgets/filterPanel/sit-filter-panel.html").then(function (data) {
                        ctrl.panelElm = $compile(data.data)(scope);
                    });
                }
                loadPanel();
                if (ctrl.data.floatID) {
                    parentElement = $(element).parents().find("#" + ctrl.data.floatID);
                } else {
                    parentElement = $(element).parents(ctrl.data.parentWidget);
                }

                if (!parentElement.first().hasClass("filter-panel-wrapper")) {
                    var dataContainer = parentElement.find('#data-container')[0];
                    var offset = 0;
                    if (dataContainer) {
                        offset = dataContainer.scrollHeight - dataContainer.scrollTop;
                    }
                    parentElement.first().wrap("<div class='filter-panel-wrapper'></div>");
                    parentElement.find('#data-container').scrollTop(offset);
                }

                var filterPanelScroll = element.find('div.simple-filter-panel');
                $('.simple-filter-clauses').on("scroll", setFilterPanelShadow);

                function setFilterPanelShadow() {
                    if (this.scrollTop > 0) {
                        filterPanelScroll.children('.action-button-footer').addClass('shadow');
                    } else {
                        filterPanelScroll.children('.action-button-footer').removeClass('shadow');
                    }
                }

                var listener = scope.$watch(function () {
                    return ctrl.panelElm;
                }, function (panelElm) {
                    if (panelElm !== undefined && !isPanelAppended) {
                        $(element).parents('.filter-panel-wrapper').prepend(panelElm);
                        $(element).parents().find('#filter-panel')[0].style.width = PANEL_WIDTH;
                        $($(parentElement)).children().css('width', 'calc(100% - ' + (PANEL_WIDTH + BORDER_SPACE - LEFT_PADDING_FROM_PARENT) + 'px)');
                        $($(parentElement)).children().css('margin-left', (PANEL_WIDTH + BORDER_SPACE - LEFT_PADDING_FROM_PARENT));
                        $('#ButtontoggleFilterOpen').css('pointer-events', 'none');
                        isPanelAppended = true;
                        $rootScope.$broadcast('sit-filter-panel-opened');
                        $('.canvas-ui-view').attr('filter-panel-open', 'true');
                        listener();
                    }
                }, true);


                ctrl.close = function () {
                    var dataContainer = parentElement.find('#data-container')[0];
                    var offset = 0;
                    if (dataContainer) {
                        offset = dataContainer.scrollHeight - dataContainer.scrollTop;
                    }
                    $(element).parents().find('#filter-panel').unwrap();
                    parentElement.find('#data-container').scrollTop(offset);
                    $(element).parents().find('#filter-panel').remove();
                    $($(parentElement)).children().css('margin-left', '0');
                    $($(parentElement)).children().css('width', '100%');
                    $('#ButtontoggleFilterOpen').css('pointer-events', 'auto');
                    $rootScope.$broadcast('sit-filter-panel-closed');
                    $('.canvas-ui-view').removeAttr('filter-panel-open');
                };
            }
        };
    }
    FilterPanelController.$inject = ['$translate', '$rootScope', '$scope', '$timeout', '$q',
        'common.services.filterPersonalization.filterPersonalizationService', 'common.filterPanel.filterPanelService',
        'common.widgets.globalDialog.service', 'common.widgets.messageOverlay.service', 'common.services.runtime.backendService'];
    function FilterPanelController($translate, $rootScope, $scope, $timeout, $q, filterPersonalizationService, filterPanelService,
        globalDialogService, messageOverlayService, backendService) {

        function parseValueToBool(value) {
            var returnValue = !!value;
            if (value === false) {
                returnValue = true;
            }
            return returnValue;
        }

        function LocalProxy(validateAllClauses, callback) {
            var originalCallback = callback;
            function _callback(viewValue, ngModelController, viewValueProperty) {
                if (typeof viewValue === 'object' && viewValueProperty) {
                    viewValue = viewValue[viewValueProperty];
                }
                var isValid = !!(typeof originalCallback === 'function' ? originalCallback(viewValue, ngModelController) : !!viewValue);
                if (typeof viewValue === 'boolean') {
                    ngModelController.$validate();
                    var parsedViewValue = parseValueToBool(viewValue);
                    isValid = ngModelController.$valid && !!(typeof originalCallback === 'function' ? originalCallback(viewValue, ngModelController) : parsedViewValue);
                }
                validateAllClauses({ id: ngModelController.$$scope.$id, isValid: isValid });
            }
            _callback.isProxy = true;
            this.callback = _callback;
        }

        var vm = this;
        activate();
        function activate() {
            init();
            initMethods();
            getSavedFilters();
            setFilterList();
        }

        function proxyCustomValidationInClauses(clauses) {
            vm.isValueNotEmpty = false;
            vm.validationResult = [];
            return clauses.map(function (item) {
                if (item.widgetAttributes && item.widgetAttributes['sit-validation']) {
                    var sitValidation = item.widgetAttributes['sit-validation'];
                    sitValidation.custom = sitValidation.custom && !sitValidation.custom.isProxy ?
                        new LocalProxy(validateClauses, sitValidation.custom).callback
                        : new LocalProxy(validateClauses).callback;
                }

                if (item.validation && item.validation.custom && !item.validation.custom.isProxy) {
                    item.validation.custom = new LocalProxy(validateClauses, item.validation.custom).callback;
                } else {
                    item.validation = { custom: new LocalProxy(validateClauses).callback };
                }
                return item;
            });
        }

        function validateClauses(item) {
            var field = _.findWhere(vm.validationResult, { id: item.id });
            if (field) {
                field.isValid = item.isValid;
            } else {
                vm.validationResult.push(item);
            }
            // in case item is true enable button
            vm.isValueNotEmpty = !!_.find(vm.validationResult, function (data) { return data.isValid === true })
        }

        function init() {
            vm.savedFilters = null;
            vm.widget = "sit-filter-panel";
            vm.isDataRetainEnabled = vm.data.isDataRetainEnabled === false ? false : true;
            vm.filterData = {
                filterName: $translate.instant('filterPanel.newFilter'),
                description: '',
                default: false,
                filterClauses: proxyCustomValidationInClauses(vm.data.fields)
            };
            vm.setFilterAsDefault = setFilterAsDefault;

            vm.closeIcon = {
                path: 'common/icons/cmdClosePanel24.svg',
                size: '16px'
            };
        }

        function initMethods() {
            vm.save = save;
            vm.saveAs = saveAs;
            vm.clear = clear;
            vm.delete = deleteFilter;
            vm.onFilterChange = onFilterChange;
            vm.apply = apply;
            vm.reset = reset;
            vm.onValidityChangeCallback = onValidityChangeCallback;
            vm.retainFilterData = retainFilterData;
            vm.commandButtons = {
                "barType": "Action",
                "bar": [
                    {
                        "name": "open_filter",
                        "svgIcon": "common/icons/homeFolderOpen24.svg",
                        "tooltip": $translate.instant('filterPanel.openFilter'),
                        "type": "Group",
                        "showas": "List",
                        "group": [
                        ]
                    },
                    {
                        "type": "Command",
                        "name": "clear",
                        "visibility": true,
                        "svgIcon": "common/icons/cmdDelete24.svg",
                        "tooltip": $translate.instant('commandBar.clearToolTip'),
                        'onClickCallback': vm.clear
                    },
                    {
                        "type": "Command",
                        "name": "save_as",
                        "visibility": true,
                        "svgIcon": "common/icons/cmdSaveAs24.svg",
                        "tooltip": $translate.instant('commandBar.saveAsToolTip'),
                        'onClickCallback': vm.saveAs

                    },
                    {
                        "type": "Command",
                        "name": "save",
                        "visibility": true,
                        "svgIcon": "common/icons/cmdSave24.svg",
                        "tooltip": $translate.instant('commandBar.saveToolTip'),
                        'onClickCallback': vm.save
                    },
                    {
                        "type": "Command",
                        "name": "setDefault",
                        "visibility": false,
                        "svgIcon": "common/icons/cmdFilterSet24.svg",
                        "tooltip": $translate.instant('filterPanel.setDefault'),
                        'onClickCallback': vm.setFilterAsDefault
                    },
                    {
                        "type": "Command",
                        "name": "unSetDefault",
                        "visibility": false,
                        "svgIcon": "common/icons/cmdFilterUnset24.svg",
                        "tooltip": $translate.instant('filterPanel.unSetDefault'),
                        'onClickCallback': vm.setFilterAsDefault
                    },
                    {
                        "type": "Command",
                        "name": "delete",
                        "visibility": false,
                        "svgIcon": "common/icons/cmdTrash24.svg",
                        "tooltip": $translate.instant('filterPanel.delete'),
                        'onClickCallback': vm.delete
                    }

                ]
            };
            vm.saveAsDialogButtons = [
                {
                    id: "save",
                    displayName: $translate.instant('filterPanel.save'),
                    disabled: true,
                    onClickCallback: function (value) {
                        getSavedFilters();
                        var index = _.findIndex(vm.savedFilters, function (filterData) {
                            return _.isEqual(filterData.filterName.toLowerCase(), vm.dialogData.templatedata.name.value.toLowerCase());
                        });
                        if (index > -1) {
                            globalDialogService.hide();
                            showErrorMessage();
                        } else {
                            vm.filterData.filterName = vm.dialogData.templatedata.name.value;
                            vm.filterData.description = vm.dialogData.templatedata.description.value;
                            vm.filterData.default = false;
                            var dataToSave = angular.copy(vm.filterData);
                            filterPersonalizationService.saveFilterClauses(vm.widget, vm.userPrefId, dataToSave);
                            vm.commandButtons.bar[0].group[vm.commandButtons.bar[0].group.length] = {
                                "label": dataToSave.filterName,
                                "type": "toggle",
                                "name": dataToSave.filterName,
                                "description": dataToSave.description,

                                "visibility": true,

                                "tooltip": dataToSave.filterName,
                                "onClickCallback": vm.onFilterChange,
                                "data": dataToSave
                            };
                            vm.commandButtons.bar[6].visibility = true;
                            vm.commandButtons.bar[4].visibility = true;
                            vm.commandButtons.bar[5].visibility = false;
                            globalDialogService.hide();
                        }

                    }
                },
                {
                    id: "cancel",
                    displayName: $translate.instant('filterPanel.cancel'),
                    onClickCallback: function () {
                        globalDialogService.hide();
                    }
                }
            ];
        }

        //This method is used to retain the data entered in filters even after the panel is closed or the state is changed
        function retainFilterData() {
            filterPanelService.setPreviousFilterClauses({ id: vm.userPrefId, data: angular.copy(vm.filterData) });
        }

        function resetDefaultFilters() {
            vm.savedFilters.forEach(function (filterData) {
                filterData.default = false;
            });
        }

        function isDefaultFilter(filterName) {
            var isDefault = false;
            if (vm.savedFilters && vm.savedFilters.length) {
                var filter = vm.savedFilters.filter(function (filterData) {
                    return filterData.filterName === filterName;
                });
                isDefault = filter && filter[0] && filter[0].hasOwnProperty('default') ? filter[0].default : false;
            }
            return isDefault;
        }

        function refreshSavedFilterDefaultSelection() {
            vm.commandButtons.bar[0].group.forEach(function (element) {
                element.selected = false;
                if (isDefaultFilter(element.name)) {
                    element.selected = true;
                }
            });
        }

        function setFilterAsDefault() {
            var isDefault = arguments[0] && arguments[0].name === 'setDefault' ? true : false;
            getSavedFilters();
            vm.isFilterSetAsDefault = isDefault;
            vm.commandButtons.bar[4].visibility = !isDefault;
            vm.commandButtons.bar[5].visibility = isDefault;
            var index = _.findIndex(vm.savedFilters, function (filterData) {
                return _.isEqual(filterData.filterName, vm.filterData.filterName);
            });
            if (index > -1) {
                resetDefaultFilters();
                filterPersonalizationService.saveDefaultFilter(vm.widget, vm.userPrefId, vm.filterData, isDefault);
                vm.commandButtons.bar[0].group[index].data = angular.copy(vm.filterData);
                refreshSavedFilterDefaultSelection();
            }
        }

        function save() {
            getSavedFilters();
            if (!vm.savedFilters) {
                saveAs();
            } else {
                var index = _.findIndex(vm.savedFilters, function (filterData) {
                    return _.isEqual(filterData.filterName, vm.filterData.filterName);
                });
                if (index > -1) {
                    filterPersonalizationService.saveFilterClauses(vm.widget, vm.userPrefId, vm.filterData);
                    vm.commandButtons.bar[0].group[index].data = angular.copy(vm.filterData);
                } else {
                    saveAs();
                }
            }
        }

        function saveAs() {
            vm.dialogData = {
                title: $translate.instant('filterPanel.saveFilterAs'),
                templatedata: {
                    name: {
                        value: '',
                        placeholder: $translate.instant('filterPanel.filterName'),
                        validation: {
                            required: true,
                            pattern: ".{3,25}",
                            patternInfo: $translate.instant('filterPanel.nameInfo')
                        }
                    },
                    description: {
                        value: '',
                        placeholder: $translate.instant('filterPanel.optionalDescription'),
                        validation: {
                            pattern: "[A-Za-z0-9_]{3,25}",
                            patternInfo: $translate.instant('filterPanel.descInfo')
                        }
                    },
                    onValidityChangeCallback: vm.onValidityChangeCallback
                },
                templateuri: 'common/widgets/filterPanel/save-filter-panel.html',
                buttons: vm.saveAsDialogButtons
            };
            globalDialogService.set(vm.dialogData);
            globalDialogService.show();
        }

        function clear() {
            vm.filterData.filterName = $translate.instant('filterPanel.newFilter');
            vm.filterData.description = "";
            vm.commandButtons.bar[4].visibility = false;
            vm.commandButtons.bar[5].visibility = false;
            vm.commandButtons.bar[6].visibility = false;
            vm.filterData.filterClauses.forEach(function (filterField, i) {
                if (vm.filterData.filterClauses[i].widget === "sit-checkbox") {
                    vm.filterData.filterClauses[i].value.forEach(function (val) {
                        val.checked = false;
                    });
                } else if ((vm.filterData.filterClauses[i].widget === "sit-multi-select" || vm.filterData.filterClauses[i].widget === "sit-advanced-select")
                    && vm.filterData.filterClauses[i].widgetAttributes) {
                    if (filterField.dataSource && (filterField.dataSource.entityName || filterField.dataSource.readingFunction)) {
                        getQueryResultOptions(filterField).then(function (data) {
                            filterField.widgetAttributes["sit-options"] = data;
                        });
                    }
                    vm.filterData.filterClauses[i].widgetAttributes["sit-selected-string"] = '';
                    if (vm.filterData.filterClauses[i].widgetAttributes["sit-options"].length) {

                        for (var j = 0; j < vm.filterData.filterClauses[i].widgetAttributes["sit-options"].length; j++) {
                            vm.filterData.filterClauses[i].widgetAttributes["sit-options"][j].selected = false;
                            vm.filterData.filterClauses[i].widgetAttributes["sit-options"][j].value = false;
                        }

                    }
                }
                else {
                    vm.filterData.filterClauses[i].value = "";
                }
            });
            vm.isValueNotEmpty = false;
        }

        function onValidityChangeCallback(formState) {
            if (formState && formState.isValid) {
                vm.saveAsDialogButtons[0].disabled = false;
            } else {
                vm.saveAsDialogButtons[0].disabled = true;
            }
        }

        function deleteFilter() {
            var index = _.findIndex(vm.commandButtons.bar[0].group, function (filterData) {
                return _.isEqual(filterData.data.filterName, vm.filterData.filterName);
            });

            if (index > -1) {
                vm.commandButtons.bar[0].group.splice(index, 1);
            }
            filterPersonalizationService.deleteFilterClauses(vm.widget, vm.userPrefId, vm.filterData);
            vm.clear();
        }

        function getSavedFilters() {
            vm.savedFilters = filterPersonalizationService.retrieveFilterClauses(vm.widget, vm.userPrefId);
        }

        function setFilterList() {
            if (vm.savedFilters && vm.savedFilters.length) {
                vm.savedFilters.forEach(function (filterData) {
                    vm.commandButtons.bar[0].group[vm.commandButtons.bar[0].group.length] = {
                        "label": filterData.filterName,
                        "type": "toggle",

                        "name": filterData.filterName,
                        "description": filterData.description,

                        "visibility": true,
                        "selected": filterData.default,
                        "tooltip": filterData.filterName,
                        "data": filterData,
                        "onClickCallback": vm.onFilterChange
                    };
                });
            }

            if (!vm.isDataRetainEnabled) {
                clear();
                return;
            }

            var filter = filterPanelService.getPreviousFilterClauses(vm.userPrefId);
            if (filter && filter.data && Object.keys(filter.data).length) {
                clear();
                $timeout(function () {
                    setFilterClauses(filter.data);
                }, 1000)
            } else {
                clear();
            }
        }

        function onFilterChange() {
            vm.commandButtons.bar[6].visibility = true;
            var filterData = angular.copy(arguments[0].data);
            var isDefault = isDefaultFilter(filterData.filterName);
            $rootScope.$broadcast('save-filter-opened', filterData);
            refreshSavedFilterDefaultSelection();
            if (isDefault) {
                vm.commandButtons.bar[4].visibility = false;
                vm.commandButtons.bar[5].visibility = true;
            } else {
                vm.commandButtons.bar[4].visibility = true;
                vm.commandButtons.bar[5].visibility = false;
            }
            setFilterClauses(filterData);
        }

        function getQueryResultOptions(filterClause) {
            var options = [];
            var defer = $q.defer();
            if (!filterClause) {
                defer.resolve(options);
                return defer.promise;
            }
            if (!filterClause.dataSource) {
                defer.resolve(options);
                return defer.promise;
            }
            var isValidDataSource = vm.data.dataService && typeof vm.data.dataService.findAll === 'function'
                && filterClause.dataSource && (filterClause.dataSource.entityName || filterClause.dataSource.readingFunction);
            if (!isValidDataSource) {
                defer.resolve(options);
                return defer.promise;
            }

            if (filterClause.dataSource.entityName) {
                vm.data.dataService.findAll({
                    appName: filterClause.dataSource.appName,
                    entityName: filterClause.dataSource.entityName,
                    options: filterClause.dataSource.optionsString
                }).then(function (response) {
                    if (response.hasOwnProperty('value') && Array.isArray(response.value)) {
                        defer.resolve(setFilterFieldOptions(response.value, filterClause.dataSource));
                    }
                });
            } else if (filterClause.dataSource.readingFunction) {
                backendService.read({
                    appName: filterClause.dataSource.appName,
                    functionName: filterClause.dataSource.readingFunction.name,
                    params: filterClause.dataSource.readingFunction.params,
                    options: filterClause.dataSource.optionsString
                }).then(function (response) {
                    if (response.hasOwnProperty('value') && Array.isArray(response.value)) {
                        defer.resolve(setFilterFieldOptions(response.value, filterClause.dataSource));
                    }
                });
            }

            return defer.promise;
        }

        function setFilterFieldOptions(data, dataSource) {
            var options = [];
            if (dataSource) {
                options = data.map(function (val) {
                    return {
                        id: val[dataSource.displayProperty],
                        name: val[dataSource.valueProperty]
                    };
                });
                options.unshift({ id: '', name: '' });
            }
            return options;
        }

        function setFilterClauses(filterData) {
            var isDefault = isDefaultFilter(filterData.filterName);
            var index = _.findIndex(vm.savedFilters, function (filter) {
                return filter.filterName === filterData.filterName;
            });
            vm.filterData.filterName = index !== -1 ? filterData.filterName : $translate.instant('filterPanel.newFilter');
            vm.filterData.description = filterData.description;
            vm.filterData.default = isDefault;
            if (index === -1) {
                vm.commandButtons.bar[4].visibility = false;
                vm.commandButtons.bar[5].visibility = false;
                vm.commandButtons.bar[6].visibility = false;
            } else if (isDefault) {
                vm.commandButtons.bar[4].visibility = false;
                vm.commandButtons.bar[5].visibility = true;
                vm.commandButtons.bar[6].visibility = true;
            } else {
                vm.commandButtons.bar[4].visibility = true;
                vm.commandButtons.bar[5].visibility = false;
                vm.commandButtons.bar[6].visibility = true;
            }
            for (var i = 0; i < filterData.filterClauses.length; i++) {
                if (vm.filterData.filterClauses[i].value === "" || vm.filterData.filterClauses[i].value === undefined) {
                    if ((vm.filterData.filterClauses[i].widget === "sit-multi-select" ||
                        vm.filterData.filterClauses[i].widget === "sit-advanced-select")
                        && vm.filterData.filterClauses[i].hasOwnProperty("widgetAttributes")) {
                        vm.filterData.filterClauses[i].widgetAttributes["sit-selected-string"] = filterData.filterClauses[i].widgetAttributes["sit-selected-string"];
                        if (vm.filterData.filterClauses[i].widgetAttributes["sit-options"].length) {
                            vm.filterData.filterClauses[i].widgetAttributes["sit-options"] = angular.copy(filterData.filterClauses[i].widgetAttributes["sit-options"]);
                        }
                    } else {
                        vm.filterData.filterClauses[i].value = filterData.filterClauses[i].value;
                    }
                }
                else {
                    if (vm.filterData.filterClauses[i].widget === "sit-checkbox") {
                        filterData.filterClauses[i].value.forEach(function (val, valIndex) {
                            vm.filterData.filterClauses[i].value[valIndex].checked = val.checked;
                        });
                    } else {
                        vm.filterData.filterClauses[i].value = filterData.filterClauses[i].value;
                    }
                }
            }
        }

        function apply(values) {
            vm.retainFilterData();
            var applyFilterData = [];
            var value;
            values.forEach(function (field) {
                if (field.value || (field.widgetAttributes && field.widgetAttributes["sit-selected-string"] !== ''
                    && field.widgetAttributes["sit-selected-string"] !== undefined)) {
                    if (field.widget === 'sit-select') {
                        value = field.value[field.toKeep];
                    } else if (field.widget === 'sit-checkbox') {
                        value = field.value[0].checked;
                    } else if (field.widget === 'sit-multi-select' || field.widget === 'sit-advanced-select') {
                        value = field.widgetAttributes["sit-selected-string"];
                    } else if (field.widget === 'sit-entity-picker') {
                        value = field.value[field.toKeep] || field.value[field.field];
                    } else {
                        value = field.value;
                    }

                    applyFilterData[applyFilterData.length] = {
                        "filterField": field,
                        "value": value,
                        "widget": field.widget,
                        "andOr": "and",
                        "operator": "=",
                        "matchCase": false,
                        "showValueField": false
                    };
                    value = '';
                }
            });

            if (vm.data.onApplyCallback) {
                vm.data.onApplyIcvCallback && vm.data.onApplyIcvCallback();
                vm.data.onApplyCallback(applyFilterData, vm.filterData.filterName);
            } else {
                vm.data.defaultApplyCallback && vm.data.defaultApplyCallback(applyFilterData, vm.filterData.filterName);
            }
            $scope.$emit('sit-filter.apply', null, 'sitFilterPanel');
        }

        function reset() {
            var applyFilterData = [];
            vm.clear();
            filterPanelService.setPreviousFilterClauses({ id: vm.userPrefId, data: {} });
            if (vm.data.onResetCallback) {
                vm.data.onApplyIcvCallback && vm.data.onApplyIcvCallback();
                vm.data.onResetCallback(applyFilterData);               
            } else {
                vm.data.defaultApplyCallback && vm.data.defaultApplyCallback(applyFilterData);
            }
            $scope.$emit('sit-filter.reset');
        }

        function showErrorMessage() {
            vm.overlay = {
                text: $translate.instant('filterPanel.overlay.text'),
                title: $translate.instant('filterPanel.overlay.title'),
                buttons: [{
                    id: 'okButton',
                    displayName: $translate.instant('filterPanel.overlay.displayName'),
                    onClickCallback: function () {
                        messageOverlayService.hide();
                        globalDialogService.show();
                    }
                }]
            };
            messageOverlayService.set(vm.overlay);
            messageOverlayService.show();
        }
    }
})();

(function () {
    'use strict';

    function FilterPanel() {
        this.filterData = [];

        this.setPreviousFilterClauses = setPreviousFilterClauses;
        this.getPreviousFilterClauses = getPreviousFilterClauses;
        /**
       * @ngdoc method
       * @access internal
       * @name common.filterPanel.filterPanelService#setPreviousFilterClauses
       * @module siemens.simaticit.common.widgets.filterPanel
       * @description Saves a copy of the filter data entered so that if the panel is closed and reopened the panel retains the data.
       * @param {Object} filter data object.
       */
        function setPreviousFilterClauses(filter) {
            var index = _.findIndex(this.filterData, function (item) { return item.id === filter.id });
            if (index === -1) {
                this.filterData.push(filter);
            } else {
                this.filterData[index].data = filter.data;
            }
        }

        /**
    * @ngdoc method
    * @access internal
    * @name common.filterPanel.filterPanelService#getPreviousFilterClauses
    * @module siemens.simaticit.common.widgets.filterPanel
    * @description Returns a copy of the filter data entered previously before closing the panel, so that when the panel is reopened the data is retained.
    */
        function getPreviousFilterClauses(id) {
            var index = _.findIndex(this.filterData, function (item) { return item.id === id });
            if (index === -1) {
                return
            }
            return angular.copy(this.filterData[index]);
        }


    }

    angular.module('siemens.simaticit.common.widgets.filterPanel').service('common.filterPanel.filterPanelService', [FilterPanel]);
})();
