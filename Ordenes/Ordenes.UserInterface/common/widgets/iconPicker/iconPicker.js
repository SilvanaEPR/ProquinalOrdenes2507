/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

(function () {
    'use strict';

    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.iconPicker
    *
    * @description
    * This module provides functionalities for selecting an icon from a predefined list of font awesome and sit icons.
    */

    angular.module('siemens.simaticit.common.widgets.iconPicker', []);

})();

/// <reference path="icon-selection-template.html" />
(function () {
    'use strict'

    var app = angular.module('siemens.simaticit.common.widgets.iconPicker');

    /**
     * @ngdoc directive
     * @name sitIconPicker
     * @module siemens.simaticit.common.widgets.iconPicker
     * @description
     * The **iconpicker** is a widget that is used to select an icon from a predefined list of font-awesome, sit and SVG icons.
     *
     * When a user types 'fa ', the widget shows the list of font awesome icons.
     * Typing 'sit ', will list all the sit icons.
     * Typing 'svg ' will list all the svg icons.
     *
     * In case of font-awesome icons addition to the class of the icon selected, additional classes can also be specified in the text box, to modify the appearance of the icon.
       The user will need to have knowledge on
     * what classes will work with the icon specified. <br>
     * For eg: Using **fa-stack** with a font-awesome icon in icon picker will not be a valid scenario as **fa-stack** is meant for stacking more than one icons.
     *
     * You can find more details on the font-awesome classes to be used at the <a href= 'http://fontawesome.io/examples'> Font Awesome</a> website.
     * Apart from this, you may also specify custom classes that are loaded in custom css files. This will work like any other css classes.
     *
     * @usage
     * As an element:
     * ```
     * <sit-icon-picker sit-id="iconPickerID" sit-limit="limit" sit-selected-object="selectedObject" sit-restrict = 'svg sit'  sit-validation="validation"
     *        ng-blur="ngBlur" ng-change="ngChange" ng-disabled="ngDisabled" ng-focus="ngFocus" ng-readonly="ngReadonly">
     * </sit-icon-picker>
     *
     * ```
     * @restrict E
     * @param {String} sit-id Unique identifier of the icon picker.
     * @param {Object} [sit-selected-object] _(Optional)_ Default entity selected when the page is loaded. Updated when the user selects another entity.
     * Object should of the format: { icon : 'icon-name'}.
     *```
     * eg: var selectedObject = { icon: "fa-book" }
     *```
     * @param {String} sit-value Value of the icon picker widget, i.e the name of the icon selected
     * @param {Number} [sit-limit=8] _(Optional)_ Maximum number of icons to be displayed. <br> **Note:** If the specified limit is more than 50 ,
     * performance issues maybe observed in some browsers. The recommended limit is 50 and below.
     * @param {ValidationModel} sit-validation See {@link ValidationModel}.
     * @param {string} [ng-blur] _(Optional)_ An expression to evaluate on blur event.
     * @param {string} [ng-disabled] _(Optional)_ If this expression is truthy, the element will be disabled.
     * @param {string} [ng-focus] _(Optional)_ An expression to evaluate on focus event.
     * @param {string} [ng-readonly] _(Optional)_ If this expression is truthy, the element will be set as read-only.
     * @param {Bool} sit-read-only Specifies if the property is editable.
     * @param {string} [sit-restrict] _(Optional)_ Specifies the type of icons that has to be listed in the widget.
       It is a space separated string which can contain the following values :
     * 'fa' - for fontawesome
     * 'sit' - for sit icons
     * 'svg' - for SVG icons.
     * If the user wants to restrict the widget to list only certain type of SVG icons, then the following dot separated string must be used.
     * 'svg.cmd.indicator.type' or 'svg.indicator' to restrict only indicator icons.
     * @param {Bool} sit-required _(Deprecated)_ Specifies if the property is mandatory or not. **Note:** If ctrl.sitValidation.required is defined,
     * it will override ctrl.sitRequired value. (default:false)
     *
     * @example
     * In a view template, the `sit-icon-picker` directive is used as follows:
     *
     * ```
     * <sit-icon-picker sit-id="id" ng-disabled="false" ng-blur="true" sit-limit="50"
                          sit-required="true" sit-validation ="validation"/>
     * ```
     *
     **/


    function sitIconPicker() {
        return {
            restrict: 'E',
            scope: {},
            bindToController:
            {
                id: "=?sitId",
                restrict: "=?sitRestrict",
                readOnly: '=?sitReadOnly',
                selectedObject: "=?sitSelectedObject",
                value: "=?sitValue",
                limit: "=?sitLimit",
                validation: "=?sitValidation",
                ngBlur: '&?',
                ngDisabled: '=?',
                ngFocus: '&?',
                ngReadonly: '=?',
                required: '=?sitRequired',
                placeholder: '=?sitPlaceholder'
            },
            controller: IconPickerController,
            controllerAs: 'iconPickerCtrl',
            templateUrl: 'common/widgets/iconPicker/iconPicker.html'
        }
    }

    IconPickerController.$inject = ['$scope', '$translate', "common.graph.fontAwesomIconData", "common.iconPicker.sitIconData", "common.iconPicker.sitIconSvgData"];
    function IconPickerController($scope, $translate, fontawesomeData, sitIconsData, sitIconSvgData) {
        var SIT_ICON_LIMIT = 50;
        var vm = this;
        var defaultPlaceholder = $translate.instant('iconPicker.defaultPlaceHolder');
        vm.editable = true;
        vm.valueChanged = valueChanged;
        vm.limit = vm.limit === parseInt(vm.limit, 10) ? vm.limit : SIT_ICON_LIMIT;
        vm.templateUrl = 'common/widgets/iconPicker/icon-selection-template.html';
        var dataSourceArray = [];

        //startsWith Polyfill
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (search, pos) {
                return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
            };
        }

        if (vm.restrict) {
            var restrictItems = vm.restrict.split(" ");
            var index = restrictItems.indexOf("fa");
            if (index !== -1) {
                dataSourceArray = dataSourceArray.concat(loadFontAwesome());
            }
            index = restrictItems.indexOf("sit");
            if (index !== -1) {
                dataSourceArray = dataSourceArray.concat(loadSit());
            }
            var svgItem = _.find(restrictItems, function (item) {
                if (item.startsWith("svg")) {
                    return item;
                } else {
                    return null;
                }
            });
            if (svgItem) {
                var filter = svgItem.split('.');
                dataSourceArray = dataSourceArray.concat(loadSvg(filter.length > 1 ? filter : undefined));
            }
        } else {
            dataSourceArray = dataSourceArray.concat(loadFontAwesome());
            dataSourceArray = dataSourceArray.concat(loadSit());
            dataSourceArray = dataSourceArray.concat(loadSvg());
        }
        vm.datasource = dataSourceArray;
        vm.selectedAttributeToDisplay = 'text';
        vm.placeholder = vm.placeholder || defaultPlaceholder;

        if (vm.selectedObject && vm.selectedObject.icon) {
            vm.value = vm.selectedObject.icon;
        }

        if (vm.value) {
            vm.selectedObject = _.find(vm.datasource, function (item) {
                return item.text === vm.value;
            });
        }

        $scope.$watch(function () {
            return vm.value
        }, function (newValue, oldValue) {
            if (oldValue !== newValue) {
                vm.selectedObject = _.find(vm.datasource, function (item) {
                    return item.text === newValue;
                });
            }
        });

        $scope.$on('sit-entity-picker.entity-selected', function (event, data) {
            vm.value = data.model.text;
        });

        function valueChanged(oldVal, newVal) {
            vm.value = newVal;
            $scope.$emit('sit-icon-picker-icon-selected', { icon: vm.value });
        }

        function loadFontAwesome() {
            var fa = fontawesomeData.fontAwesomIcon;
            _.map(fontawesomeData.fontAwesomIcon, function (item) {
                item.type = 'fa';
                item.text = item.icon;
            });
            return fa;
        }
        function loadSit() {
            var sit = sitIconsData.sitIcon;
            _.map(sitIconsData.sitIcon, function (item) {
                item.type = 'sit'
                item.text = item.icon;
            });
            return sit;
        }
        function loadSvg(filterList) {
            var svg;
            if (filterList && filterList.length > 1) {
                filterList.shift();
                svg = _.filter(sitIconSvgData.sitIcons, function (item) {
                    return _.contains(filterList, item.iconType);
                });
            } else {
                svg = sitIconSvgData.sitIcons;
                _.map(sitIconSvgData.sitIcons, function (item) {
                    item.type = 'svg'
                });
            }

            return svg;
        }

    }

    app.directive('sitIconPicker', [sitIconPicker]);

})();

(function () {
	"use strict";

    /**
    * @ngdoc service
    * @name common.iconPicker.sitIconData
    * @module siemens.simaticit.common.widgets.iconPicker
    *
    * @description
    * This service provides a list of icon names. It includes sit icons and all types of SVG icons(command, indicator and type icons).
    *
    */
	var sitIconJson = {
		"sitIcon": [
			{ "icon": "sit sit-active" },
			{ "icon": "sit sit-active-circle" },
			{ "icon": "sit sit-anchor-up" },
			{ "icon": "sit sit-application" },
			{ "icon": "sit sit-assign" },
			{ "icon": "sit sit-associate" },
			{ "icon": "sit sit-available" },
			{ "icon": "sit sit-batch" },
			{ "icon": "sit sit-robot" },
			{ "icon": "sit sit-bi-solution" },
			{ "icon": "sit sit-bom" },
			{ "icon": "sit sit-business-logic-distribution" },
			{ "icon": "sit sit-calendar" },
			{ "icon": "sit sit-certification" },
			{ "icon": "sit sit-cnc-program" },
			{ "icon": "sit sit-component" },
			{ "icon": "sit sit-custom-time-aggregation" },
			{ "icon": "sit sit-data-gateway" },
			{ "icon": "sit sit-data-warehouse-project" },
			{ "icon": "sit sit-deploy" },
			{ "icon": "sit sit-disable" },
			{ "icon": "sit sit-doc-center" },
			{ "icon": "sit sit-document" },
			{ "icon": "sit sit-drag" },
			{ "icon": "sit sit-engineering" },
			{ "icon": "sit sit-enterprise" },
			{ "icon": "sit sit-event-subscription" },
			{ "icon": "sit sit-ewi" },
			{ "icon": "sit sit-ewi-document" },
			{ "icon": "sit sit-export" },
			{ "icon": "sit sit-field" },
			{ "icon": "sit sit-flow" },
			{ "icon": "sit sit-flows" },
			{ "icon": "sit sit-form" },
			{ "icon": "sit sit-freeze" },
			{ "icon": "sit sit-functionality" },
			{ "icon": "sit sit-grid" },
			{ "icon": "sit sit-hold" },
			{ "icon": "sit sit-holiday" },
			{ "icon": "sit sit-holiday-set" },
			{ "icon": "sit sit-identifier-format" },
			{ "icon": "sit sit-import" },
			{ "icon": "sit sit-in-progress" },
			{ "icon": "sit sit-items" },
			{ "icon": "sit sit-kpi" },
			{ "icon": "sit sit-layout" },
			{ "icon": "sit sit-log" },
			{ "icon": "sit sit-machine" },
			{ "icon": "sit sit-management" },
			{ "icon": "sit sit-measure" },
			{ "icon": "sit sit-model" },
			{ "icon": "sit sit-monitoring" },
			{ "icon": "sit sit-obsolete" },
			{ "icon": "sit sit-ontology" },
			{ "icon": "sit sit-ontology-alt" },
			{ "icon": "sit sit-package-administration" },
			{ "icon": "sit sit-parts-and-products" },
			{ "icon": "sit sit-push" },
			{ "icon": "sit sit-push-alt" },
			{ "icon": "sit sit-release" },
			{ "icon": "sit sit-resize" },
			{ "icon": "sit sit-routing-alt" },
			{ "icon": "sit sit-routing" },
			{ "icon": "sit sit-scrap" },
			{ "icon": "sit sit-section" },
			{ "icon": "sit sit-set" },
			{ "icon": "sit sit-site" },
			{ "icon": "sit sit-skills" },
			{ "icon": "sit sit-smart-navigation" },
			{ "icon": "sit sit-sn" },
			{ "icon": "sit sit-sn-change" },
			{ "icon": "sit sit-solution" },
			{ "icon": "sit sit-solution-repository" },
			{ "icon": "sit sit-source" },
			{ "icon": "sit sit-stackable-access" },
			{ "icon": "sit sit-stackable-add" },
			{ "icon": "sit sit-stackable-bkg" },
			{ "icon": "sit sit-stackable-config" },
			{ "icon": "sit sit-stackable-deploy" },
			{ "icon": "sit sit-stackable-edit" },
			{ "icon": "sit sit-stackable-enable" },
			{ "icon": "sit sit-stackable-intelligence" },
			{ "icon": "sit sit-stackable-machine" },
			{ "icon": "sit sit-stackable-management" },
			{ "icon": "sit sit-stackable-ok" },
			{ "icon": "sit sit-stackable-operation" },
			{ "icon": "sit sit-stackable-order" },
			{ "icon": "sit sit-stackable-reason" },
			{ "icon": "sit sit-stackable-remove" },
			{ "icon": "sit sit-stackable-set" },
			{ "icon": "sit sit-stackable-setting" },
			{ "icon": "sit sit-stackable-show" },
			{ "icon": "sit sit-stackable-activate" },
			{ "icon": "sit sit-stackable-time" },
			{ "icon": "sit sit-stackable-source" },
			{ "icon": "sit sit-system-configuration" },
			{ "icon": "sit sit-tasklist" },
			{ "icon": "sit sit-time-period" },
			{ "icon": "sit sit-time-slice" },
			{ "icon": "sit sit-time-slice-category" },
			{ "icon": "sit sit-tools" },
			{ "icon": "sit sit-ui" },
			{ "icon": "sit sit-ui-application" },
			{ "icon": "sit sit-ui-component" },
			{ "icon": "sit sit-ui-module" },
			{ "icon": "sit sit-ui-module-mashup" },
			{ "icon": "sit sit-ui-screen" },
			{ "icon": "sit sit-unassign" },
			{ "icon": "sit sit-unset" },
			{ "icon": "sit sit-update" },
			{ "icon": "sit sit-user" },
			{ "icon": "sit sit-user-group" },
			{ "icon": "sit sit-user-id" },
			{ "icon": "sit sit-user-role" },
			{ "icon": "sit sit-work" },
			{ "icon": "sit sit-worker-role" },
			{ "icon": "sit sit-working-aggregation-type" },
			{ "icon": "sit sit-working-pattern" },
			{ "icon": "sit sit-work-order" },
			{ "icon": "sit sit-work-schedule-rule" },
			{ "icon": "sit sit-pi-boop-item-material-create-from-bom" },
			{ "icon": "sit sit-pi-boop-item-material-list" },
			{ "icon": "sit sit-pi-boop-item-param-association" },
			{ "icon": "sit sit-pi-boop-item-param-list" },
			{ "icon": "sit sit-pi-boop-items-list" },
			{ "icon": "sit sit-pi-material-behavior-set" },
			{ "icon": "sit sit-pi-material-bom-set" },
			{ "icon": "sit sit-pi-material-contribution" },
			{ "icon": "sit sit-pi-material-requirement-create-from-bom" },
			{ "icon": "sit sit-pi-mtu-create" },
			{ "icon": "sit sit-pi-mtu-details" },
			{ "icon": "sit sit-pi-mtu-filtered-list" },
			{ "icon": "sit sit-pi-mtu-history" },
			{ "icon": "sit sit-pi-mtu-move" },
			{ "icon": "sit sit-pi-work-master-content" },
			{ "icon": "sit sit-pi-work-master-create" },
			{ "icon": "sit sit-pi-work-master-details" },
			{ "icon": "sit sit-pi-work-master-filtered-list" },
			{ "icon": "sit sit-pi-work-master-header-parameter-list" },
			{ "icon": "sit sit-pi-work-order-context" },
			{ "icon": "sit sit-pi-work-order-create" },
			{ "icon": "sit sit-pi-work-order-details" },
			{ "icon": "sit sit-pi-work-order-filtered-list" },
			{ "icon": "sit sit-pi-work-order-header-parameters" },
			{ "icon": "sit sit-pi-work-order-operation" },
			{ "icon": "sit sit-pi-work-order-operation-material-list" },
			{ "icon": "sit sit-pi-work-order-operation-param-list" },
			{ "icon": "sit sit-workflow-alt" },
			{ "icon": "sit sit-workflow-template" }
		]
	};
	angular.module('siemens.simaticit.common.widgets.iconPicker').value("common.iconPicker.sitIconData", sitIconJson);

	var sitIconSvgJson = {
        "sitIcons": [
            {
                "iconType": "cmd",
                "text": "svg cmd3DPrinter24",
                "icon": "common/icons/cmd3DPrinter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmd3DView24",
                "icon": "common/icons/cmd3DView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmd5Why24",
                "icon": "common/icons/cmd5Why24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmd8DReport24",
                "icon": "common/icons/cmd8DReport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAbacus24",
                "icon": "common/icons/cmdAbacus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAccept24",
                "icon": "common/icons/cmdAccept24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAccessControl24",
                "icon": "common/icons/cmdAccessControl24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAccessControlManagement24",
                "icon": "common/icons/cmdAccessControlManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddReverse24",
                "icon": "common/icons/cmdAddReverse24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAgenda24",
                "icon": "common/icons/cmdAgenda24.svg"
            }, 
            {
                "iconType": "cmd",
                "text": "svg cmdAGV24",
                "icon": "common/icons/cmdAGV24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBackToEngineering16",
                "icon": "common/icons/cmdBackToEngineering16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBackToEngineering24",
                "icon": "common/icons/cmdBackToEngineering24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBadgeFour24",
                "icon": "common/icons/cmdBadgeFour24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBadgeOne24",
                "icon": "common/icons/cmdBadgeOne24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBadgeThree24",
                "icon": "common/icons/cmdBadgeThree24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBadgeTwo24",
                "icon": "common/icons/cmdBadgeTwo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCompareView24",
                "icon": "common/icons/cmdCompareView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentPicker16",
                "icon": "common/icons/cmdComponentPicker16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentPicker24",
                "icon": "common/icons/cmdComponentPicker24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentGeometryCheck24",
                "icon": "common/icons/cmdComponentGeometryCheck24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentGeometryImportPackage24",
                "icon": "common/icons/cmdComponentGeometryImportPackage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentGeometryReset24",
                "icon": "common/icons/cmdComponentGeometryReset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentGeometryRotate24",
                "icon": "common/icons/cmdComponentGeometryRotate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentGeometryView24",
                "icon": "common/icons/cmdComponentGeometryView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDueDateAssign16",
                "icon": "common/icons/cmdDueDateAssign16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDueDateAssign24",
                "icon": "common/icons/cmdDueDateAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCreditLine24",
                "icon": "common/icons/cmdCreditLine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDatabaseMaintenance24",
                "icon": "common/icons/cmdDatabaseMaintenance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEventSignalCancel24",
                "icon": "common/icons/cmdEventSignalCancel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEventSignalCheck24",
                "icon": "common/icons/cmdEventSignalCheck24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGreenWorld24",
                "icon": "common/icons/cmdGreenWorld24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHourglass24",
                "icon": "common/icons/cmdHourglass24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImportAndExport24",
                "icon": "common/icons/cmdImportAndExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInvoice24",
                "icon": "common/icons/cmdInvoice24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListApproved24",
                "icon": "common/icons/cmdListApproved24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBoxUndo24",
                "icon": "common/icons/cmdListBoxUndo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBoxUndoSelected24",
                "icon": "common/icons/cmdListBoxUndoSelected24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBoxUndoSession24",
                "icon": "common/icons/cmdListBoxUndoSession24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListSummaryView16",
                "icon": "common/icons/cmdListSummaryView16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListView16",
                "icon": "common/icons/cmdListView16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNetwork24",
                "icon": "common/icons/cmdNetwork24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNewIdea24",
                "icon": "common/icons/cmdNewIdea24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSaveAll16",
                "icon": "common/icons/cmdSaveAll16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSaveAll24",
                "icon": "common/icons/cmdSaveAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPerformanceMonitoring24",
                "icon": "common/icons/cmdPerformanceMonitoring24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPerformanceMonitoring16",
                "icon": "common/icons/cmdPerformanceMonitoring16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTableSummaryView16",
                "icon": "common/icons/cmdTableSummaryView16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTableView16",
                "icon": "common/icons/cmdTableView16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTrackingMap24",
                "icon": "common/icons/cmdTrackingMap24.svg"
            }, {
                "iconType": "cmd",
                "text": "svg cmdTransferred24",
                "icon": "common/icons/cmdTransferred24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUIApplicationExecution24",
                "icon": "common/icons/cmdUIApplicationExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarning24",
                "icon": "common/icons/cmdWarning24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderSplitPreview24",
                "icon": "common/icons/cmdWorkOrderSplitPreview24.svg"
            }, 
            {
                "iconType": "cmd",
                "text": "svg cmdAccount24",
                "icon": "common/icons/cmdAccount24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAcknowledgment24",
                "icon": "common/icons/cmdAcknowledgment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAct24",
                "icon": "common/icons/cmdAct24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAction24",
                "icon": "common/icons/cmdAction24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdActionAdd24",
                "icon": "common/icons/cmdActionAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdActivate24",
                "icon": "common/icons/cmdActivate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdActivateRule24",
                "icon": "common/icons/cmdActivateRule24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAttributeImport24",
                "icon": "common/icons/cmdAttributeImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarImport24",
                "icon": "common/icons/cmdCalendarImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriage24",
                "icon": "common/icons/cmdCarriage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriage24",
                "icon": "common/icons/cmdCarriage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriageAdd24",
                "icon": "common/icons/cmdCarriageAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdColumnConfigurations24",
                "icon": "common/icons/cmdColumnConfigurations24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdResourceImport24",
                "icon": "common/icons/cmdResourceImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderImport24",
                "icon": "common/icons/cmdWorkOrderImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarehouseDelete24",
                "icon": "common/icons/cmdWarehouseDelete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarehouseAdd24",
                "icon": "common/icons/cmdWarehouseAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleReport24",
                "icon": "common/icons/cmdScheduleReport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleImport24",
                "icon": "common/icons/cmdScheduleImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartDeleteFromBom24",
                "icon": "common/icons/cmdPartDeleteFromBom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOpenFileHistory24",
                "icon": "common/icons/cmdOpenFileHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUIApplicationExecution24",
                "icon": "common/icons/cmdUIApplicationExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNamePattern24",
                "icon": "common/icons/cmdNamePattern24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryMerge24",
                "icon": "common/icons/cmdMachineryMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryLineImport24",
                "icon": "common/icons/cmdMachineryLineImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryLineAdd24",
                "icon": "common/icons/cmdMachineryLineAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryLine24",
                "icon": "common/icons/cmdMachineryLine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryAdd24",
                "icon": "common/icons/cmdMachineryAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHoldImport24",
                "icon": "common/icons/cmdHoldImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGraphGroup24",
                "icon": "common/icons/cmdGraphGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGeneralDataMaintenanceImport24",
                "icon": "common/icons/cmdGeneralDataMaintenanceImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGenericDownload24",
                "icon": "common/icons/cmdGenericDownload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterTemplate24",
                "icon": "common/icons/cmdFilterTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFeeder24",
                "icon": "common/icons/cmdFeeder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormulaAdd24",
                "icon": "common/icons/cmdFormulaAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormulaEditor16",
                "icon": "common/icons/cmdFormulaEditor16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormulaEditor24",
                "icon": "common/icons/cmdFormulaEditor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormulaRemove24",
                "icon": "common/icons/cmdFormulaRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExportGroup24",
                "icon": "common/icons/cmdExportGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsMerge24",
                "icon": "common/icons/cmdElectronicsMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeliveryDelete24",
                "icon": "common/icons/cmdDeliveryDelete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeliveryAdd24",
                "icon": "common/icons/cmdDeliveryAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentImport24",
                "icon": "common/icons/cmdComponentImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentConsumption24",
                "icon": "common/icons/cmdComponentConsumption24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponent24",
                "icon": "common/icons/cmdComponent24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAdd16",
                "icon": "common/icons/cmdAdd16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAdd24",
                "icon": "common/icons/cmdAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddAction24",
                "icon": "common/icons/cmdAddAction24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddAll24",
                "icon": "common/icons/cmdAddAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddDocument24",
                "icon": "common/icons/cmdAddDocument24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddFromEquipment24",
                "icon": "common/icons/cmdAddFromEquipment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddFromEquipmentGroup24",
                "icon": "common/icons/cmdAddFromEquipmentGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddFromOrder24",
                "icon": "common/icons/cmdAddFromOrder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddFromPartLot24",
                "icon": "common/icons/cmdAddFromPartLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddNewChild24",
                "icon": "common/icons/cmdAddNewChild24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddNewFirstLevel24",
                "icon": "common/icons/cmdAddNewFirstLevel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddPicture24",
                "icon": "common/icons/cmdAddPicture24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAdHoc24",
                "icon": "common/icons/cmdAdHoc24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAdmin24",
                "icon": "common/icons/cmdAdmin24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAdminChange24",
                "icon": "common/icons/cmdAdminChange24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlertAdd24",
                "icon": "common/icons/cmdAlertAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlertClear24",
                "icon": "common/icons/cmdAlertClear24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlertEdit24",
                "icon": "common/icons/cmdAlertEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlertRefresh24",
                "icon": "common/icons/cmdAlertRefresh24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlerts24",
                "icon": "common/icons/cmdAlerts24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlignLeft24",
                "icon": "common/icons/cmdAlignLeft24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlignRight24",
                "icon": "common/icons/cmdAlignRight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAlignTop24",
                "icon": "common/icons/cmdAlignTop24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAnimate24",
                "icon": "common/icons/cmdAnimate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppAbort24",
                "icon": "common/icons/cmdAppAbort24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppInstall24",
                "icon": "common/icons/cmdAppInstall24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppManagement24",
                "icon": "common/icons/cmdAppManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppReload24",
                "icon": "common/icons/cmdAppReload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppRemove24",
                "icon": "common/icons/cmdAppRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppUpdate24",
                "icon": "common/icons/cmdAppUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppUpdateAll24",
                "icon": "common/icons/cmdAppUpdateAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppUpdateAllReferences24",
                "icon": "common/icons/cmdAppUpdateAllReferences24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppUpdateSelected24",
                "icon": "common/icons/cmdAppUpdateSelected24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAppUpdateSelectedReferences24",
                "icon": "common/icons/cmdAppUpdateSelectedReferences24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdArcFeature24",
                "icon": "common/icons/cmdArcFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdArchive24",
                "icon": "common/icons/cmdArchive24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdArchiving24",
                "icon": "common/icons/cmdArchiving24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAsBuilt24",
                "icon": "common/icons/cmdAsBuilt24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssemblyAdd24",
                "icon": "common/icons/cmdAssemblyAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssemblyLink24",
                "icon": "common/icons/cmdAssemblyLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssemblyMerge24",
                "icon": "common/icons/cmdAssemblyMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssemblyOpen24",
                "icon": "common/icons/cmdAssemblyOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssemblyVPL24",
                "icon": "common/icons/cmdAssemblyVPL24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssign24",
                "icon": "common/icons/cmdAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssignGroupToRole24",
                "icon": "common/icons/cmdAssignGroupToRole24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssignLot24",
                "icon": "common/icons/cmdAssignLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssignTo24",
                "icon": "common/icons/cmdAssignTo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAssociateRole24",
                "icon": "common/icons/cmdAssociateRole24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAuditTrail24",
                "icon": "common/icons/cmdAuditTrail24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAutomatedUpdate24",
                "icon": "common/icons/cmdAutomatedUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAutomationChannel24",
                "icon": "common/icons/cmdAutomationChannel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAutomationNodeTemplate24",
                "icon": "common/icons/cmdAutomationNodeTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBack24",
                "icon": "common/icons/cmdBack24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBackwards24",
                "icon": "common/icons/cmdBackwards24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBarChart24",
                "icon": "common/icons/cmdBarChart24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBarcode24",
                "icon": "common/icons/cmdBarcode24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBarcodeHistory24",
                "icon": "common/icons/cmdBarcodeHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBarcodeSet24",
                "icon": "common/icons/cmdBarcodeSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBarcodeUnset24",
                "icon": "common/icons/cmdBarcodeUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBoardDefect24",
                "icon": "common/icons/cmdBoardDefect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBofSet24",
                "icon": "common/icons/cmdBofSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBofUnset24",
                "icon": "common/icons/cmdBofUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBringToFront24",
                "icon": "common/icons/cmdBringToFront24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBrush24",
                "icon": "common/icons/cmdBrush24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBufferAdd24",
                "icon": "common/icons/cmdBufferAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBuild24",
                "icon": "common/icons/cmdBuild24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBuildForce24",
                "icon": "common/icons/cmdBuildForce24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdBuyOffNotification24",
                "icon": "common/icons/cmdBuyOffNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdByWeight24",
                "icon": "common/icons/cmdByWeight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalculator24",
                "icon": "common/icons/cmdCalculator24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalculatorUpdate24",
                "icon": "common/icons/cmdCalculatorUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendar16",
                "icon": "common/icons/cmdCalendar16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendar24",
                "icon": "common/icons/cmdCalendar24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarChangeStatus24",
                "icon": "common/icons/cmdCalendarChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarConfiguration24",
                "icon": "common/icons/cmdCalendarConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarEventConfiguration24",
                "icon": "common/icons/cmdCalendarEventConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarHide24",
                "icon": "common/icons/cmdCalendarHide24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarLink24",
                "icon": "common/icons/cmdCalendarLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarOverlap24",
                "icon": "common/icons/cmdCalendarOverlap24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarPercentage24",
                "icon": "common/icons/cmdCalendarPercentage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarSave24",
                "icon": "common/icons/cmdCalendarSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarSplit24",
                "icon": "common/icons/cmdCalendarSplit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarTemplate24",
                "icon": "common/icons/cmdCalendarTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCalendarUnlink24",
                "icon": "common/icons/cmdCalendarUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCancel24",
                "icon": "common/icons/cmdCancel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCardId24",
                "icon": "common/icons/cmdCardId24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriageView24",
                "icon": "common/icons/cmdCarriageView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCauseAdd24",
                "icon": "common/icons/cmdCauseAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCauseChange24",
                "icon": "common/icons/cmdCauseChange24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCertificate24",
                "icon": "common/icons/cmdCertificate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCertificateExecution24",
                "icon": "common/icons/cmdCertificateExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeCategory16",
                "icon": "common/icons/cmdChangeCategory16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeCategory24",
                "icon": "common/icons/cmdChangeCategory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeCurrency24",
                "icon": "common/icons/cmdChangeCurrency24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeManagement24",
                "icon": "common/icons/cmdChangeManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeManagementNotification24",
                "icon": "common/icons/cmdChangeManagementNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeSequence24",
                "icon": "common/icons/cmdChangeSequence24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeSerialNumber24",
                "icon": "common/icons/cmdChangeSerialNumber24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeTextCase24",
                "icon": "common/icons/cmdChangeTextCase24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChangeTime24",
                "icon": "common/icons/cmdChangeTime24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckbox24",
                "icon": "common/icons/cmdCheckbox24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckboxUnchecked24",
                "icon": "common/icons/cmdCheckboxUnchecked24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckConsistency24",
                "icon": "common/icons/cmdCheckConsistency24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckin24",
                "icon": "common/icons/cmdCheckin24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChecklist16",
                "icon": "common/icons/cmdChecklist16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChecklist24",
                "icon": "common/icons/cmdChecklist24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckmark16",
                "icon": "common/icons/cmdCheckmark16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckmark24",
                "icon": "common/icons/cmdCheckmark24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckout24",
                "icon": "common/icons/cmdCheckout24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCheckQuality24",
                "icon": "common/icons/cmdCheckQuality24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChemicalBalance24",
                "icon": "common/icons/cmdChemicalBalance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChemicalBalanceChangeStatus24",
                "icon": "common/icons/cmdChemicalBalanceChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdChildPartial24",
                "icon": "common/icons/cmdChildPartial24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClauseGroup24",
                "icon": "common/icons/cmdClauseGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClauseUngroup24",
                "icon": "common/icons/cmdClauseUngroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClearConfiguration24",
                "icon": "common/icons/cmdClearConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClearForm24",
                "icon": "common/icons/cmdClearForm24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCloseAllTabs24",
                "icon": "common/icons/cmdCloseAllTabs24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCloseMagic24",
                "icon": "common/icons/cmdCloseMagic24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClosePanel24",
                "icon": "common/icons/cmdClosePanel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCloseTab16",
                "icon": "common/icons/cmdCloseTab16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCollapseAllBelow24",
                "icon": "common/icons/cmdCollapseAllBelow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCollapseBelow24",
                "icon": "common/icons/cmdCollapseBelow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCollect24",
                "icon": "common/icons/cmdCollect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdColorBook24",
                "icon": "common/icons/cmdColorBook24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCommands24",
                "icon": "common/icons/cmdCommands24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentIndexer24",
                "icon": "common/icons/cmdComponentIndexer24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentView24",
                "icon": "common/icons/cmdComponentView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCompress24",
                "icon": "common/icons/cmdCompress24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdConnection24",
                "icon": "common/icons/cmdConnection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdConnectionTemplate24",
                "icon": "common/icons/cmdConnectionTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdConstraintsRemove24",
                "icon": "common/icons/cmdConstraintsRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdContainerAttribute24",
                "icon": "common/icons/cmdContainerAttribute24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdContainerLoad24",
                "icon": "common/icons/cmdContainerLoad24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdContainerUnload24",
                "icon": "common/icons/cmdContainerUnload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdControlPlan16",
                "icon": "common/icons/cmdControlPlan16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdControlPlan24",
                "icon": "common/icons/cmdControlPlan24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCopy24",
                "icon": "common/icons/cmdCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCopyLink16",
                "icon": "common/icons/cmdCopyLink16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCreateAnalysisRequest24",
                "icon": "common/icons/cmdCreateAnalysisRequest24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCreateConfigurationSettings24",
                "icon": "common/icons/cmdCreateConfigurationSettings24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCreateProjectPlan24",
                "icon": "common/icons/cmdCreateProjectPlan24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCreateTraceLink24",
                "icon": "common/icons/cmdCreateTraceLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCriteria24",
                "icon": "common/icons/cmdCriteria24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCroppedSquare24",
                "icon": "common/icons/cmdCroppedSquare24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCurrentDate24",
                "icon": "common/icons/cmdCurrentDate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCurve24",
                "icon": "common/icons/cmdCurve24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCut24",
                "icon": "common/icons/cmdCut24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDashboard24",
                "icon": "common/icons/cmdDashboard24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDashboardOperational24",
                "icon": "common/icons/cmdDashboardOperational24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDashboards24",
                "icon": "common/icons/cmdDashboards24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDatabase24",
                "icon": "common/icons/cmdDatabase24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDatabaseUpdate24",
                "icon": "common/icons/cmdDatabaseUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataCollection24",
                "icon": "common/icons/cmdDataCollection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataFromDisk24",
                "icon": "common/icons/cmdDataFromDisk24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataMigration24",
                "icon": "common/icons/cmdDataMigration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataResource24",
                "icon": "common/icons/cmdDataResource24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataSourceEdit24",
                "icon": "common/icons/cmdDataSourceEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDataTime24",
                "icon": "common/icons/cmdDataTime24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDecimalInput24",
                "icon": "common/icons/cmdDecimalInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefectActionRepair24",
                "icon": "common/icons/cmdDefectActionRepair24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefectAdvisorRepair24",
                "icon": "common/icons/cmdDefectAdvisorRepair24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefectReopen24",
                "icon": "common/icons/cmdDefectReopen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefectRepair24",
                "icon": "common/icons/cmdDefectRepair24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefectTypeChange24",
                "icon": "common/icons/cmdDefectTypeChange24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDelete16",
                "icon": "common/icons/cmdDelete16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDelete24",
                "icon": "common/icons/cmdDelete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeletePicture24",
                "icon": "common/icons/cmdDeletePicture24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeliverableWorkOrderERP24",
                "icon": "common/icons/cmdDeliverableWorkOrderERP24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeliveryMerge24",
                "icon": "common/icons/cmdDeliveryMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDependencyAdd24",
                "icon": "common/icons/cmdDependencyAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDependencyRemove24",
                "icon": "common/icons/cmdDependencyRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeploy24",
                "icon": "common/icons/cmdDeploy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDesignElement24",
                "icon": "common/icons/cmdDesignElement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDesignElementChangeStatus24",
                "icon": "common/icons/cmdDesignElementChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDesignFeature24",
                "icon": "common/icons/cmdDesignFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDeviationGraph24",
                "icon": "common/icons/cmdDeviationGraph24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDiagram24",
                "icon": "common/icons/cmdDiagram24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDiagramAdd24",
                "icon": "common/icons/cmdDiagramAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDiagramExport24",
                "icon": "common/icons/cmdDiagramExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDiagramImport24",
                "icon": "common/icons/cmdDiagramImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDifferenceSummaryGenerate24",
                "icon": "common/icons/cmdDifferenceSummaryGenerate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDifferenceSummaryOpen24",
                "icon": "common/icons/cmdDifferenceSummaryOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDisplayColor16",
                "icon": "common/icons/cmdDisplayColor16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDisplayColor24",
                "icon": "common/icons/cmdDisplayColor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDisposition24",
                "icon": "common/icons/cmdDisposition24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDistribute24",
                "icon": "common/icons/cmdDistribute24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDNC24",
                "icon": "common/icons/cmdDNC24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDNCFile24",
                "icon": "common/icons/cmdDNCFile24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDNCFiles24",
                "icon": "common/icons/cmdDNCFiles24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDocument24",
                "icon": "common/icons/cmdDocument24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDocumentChangeStatus24",
                "icon": "common/icons/cmdDocumentChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDocumentControl24",
                "icon": "common/icons/cmdDocumentControl24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDocumentPreview24",
                "icon": "common/icons/cmdDocumentPreview24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDocumentSection24",
                "icon": "common/icons/cmdDocumentSection24.svg"
            },
            {
                "iconType": "cmddomain",
                "text": "svg cmddomain16",
                "icon": "common/icons/cmddomain16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDownload24",
                "icon": "common/icons/cmdDownload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDropdown24",
                "icon": "common/icons/cmdDropdown24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDueDateOrder24",
                "icon": "common/icons/cmdDueDateOrder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDueDateSet24",
                "icon": "common/icons/cmdDueDateSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDumpInfo24",
                "icon": "common/icons/cmdDumpInfo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDuplicate24",
                "icon": "common/icons/cmdDuplicate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDynamicLeftParameter24",
                "icon": "common/icons/cmdDynamicLeftParameter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDynamicParameters24",
                "icon": "common/icons/cmdDynamicParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEarliestStartDateSet24",
                "icon": "common/icons/cmdEarliestStartDateSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEdit24",
                "icon": "common/icons/cmdEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEditExit24",
                "icon": "common/icons/cmdEditExit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEditPanelContent24",
                "icon": "common/icons/cmdEditPanelContent24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronics24",
                "icon": "common/icons/cmdElectronics24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsAdd24",
                "icon": "common/icons/cmdElectronicsAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsImport24",
                "icon": "common/icons/cmdElectronicsImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsLink24",
                "icon": "common/icons/cmdElectronicsLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsOpen24",
                "icon": "common/icons/cmdElectronicsOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRemove24",
                "icon": "common/icons/cmdElectronicsRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotate0Degrees24",
                "icon": "common/icons/cmdElectronicsRotate0Degrees24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotate180Degrees24",
                "icon": "common/icons/cmdElectronicsRotate180Degrees24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotate270Degrees24",
                "icon": "common/icons/cmdElectronicsRotate270Degrees24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotate90Degrees24",
                "icon": "common/icons/cmdElectronicsRotate90Degrees24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotateLeft24",
                "icon": "common/icons/cmdElectronicsRotateLeft24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsRotateRight24",
                "icon": "common/icons/cmdElectronicsRotateRight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElectronicsUnlink24",
                "icon": "common/icons/cmdElectronicsUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElement24",
                "icon": "common/icons/cmdElement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementFunction24",
                "icon": "common/icons/cmdElementFunction24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementIssue24",
                "icon": "common/icons/cmdElementIssue24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementRollup24",
                "icon": "common/icons/cmdElementRollup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElements24",
                "icon": "common/icons/cmdElements24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementSearchToAdd24",
                "icon": "common/icons/cmdElementSearchToAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementTag24",
                "icon": "common/icons/cmdElementTag24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdElementTemplate24",
                "icon": "common/icons/cmdElementTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEllipse24",
                "icon": "common/icons/cmdEllipse24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEmptyStar16",
                "icon": "common/icons/cmdEmptyStar16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEmptyStar24",
                "icon": "common/icons/cmdEmptyStar24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipment24",
                "icon": "common/icons/cmdEquipment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentAdd24",
                "icon": "common/icons/cmdEquipmentAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentEngineering24",
                "icon": "common/icons/cmdEquipmentEngineering24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentExecution24",
                "icon": "common/icons/cmdEquipmentExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentGroupSelect24",
                "icon": "common/icons/cmdEquipmentGroupSelect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentGroupUnselect24",
                "icon": "common/icons/cmdEquipmentGroupUnselect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentLinkParameters24",
                "icon": "common/icons/cmdEquipmentLinkParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentRemove24",
                "icon": "common/icons/cmdEquipmentRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentRuntime24",
                "icon": "common/icons/cmdEquipmentRuntime24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentSet24",
                "icon": "common/icons/cmdEquipmentSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEquipmentUnlinkParameters24",
                "icon": "common/icons/cmdEquipmentUnlinkParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdErase24",
                "icon": "common/icons/cmdErase24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEventSignal24",
                "icon": "common/icons/cmdEventSignal24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEventSignalHistory24",
                "icon": "common/icons/cmdEventSignalHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEventSignalUpdate24",
                "icon": "common/icons/cmdEventSignalUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEwi24",
                "icon": "common/icons/cmdEwi24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEwiExecution24",
                "icon": "common/icons/cmdEwiExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEwiInput24",
                "icon": "common/icons/cmdEwiInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExamineChangeStatus24",
                "icon": "common/icons/cmdExamineChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExamineConfiguration24",
                "icon": "common/icons/cmdExamineConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExamineReanalyze24",
                "icon": "common/icons/cmdExamineReanalyze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExcel24",
                "icon": "common/icons/cmdExcel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExecGroupLink24",
                "icon": "common/icons/cmdExecGroupLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExecGroupUnlink24",
                "icon": "common/icons/cmdExecGroupUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExitFullSizeVertical24",
                "icon": "common/icons/cmdExitFullSizeVertical24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExpandAll24",
                "icon": "common/icons/cmdExpandAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExpandAllBelow24",
                "icon": "common/icons/cmdExpandAllBelow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExpandBelow24",
                "icon": "common/icons/cmdExpandBelow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExpandNow24",
                "icon": "common/icons/cmdExpandNow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExport24",
                "icon": "common/icons/cmdExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExportConfigurationSettings24",
                "icon": "common/icons/cmdExportConfigurationSettings24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdExternalNotification24",
                "icon": "common/icons/cmdExternalNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFailureNotification24",
                "icon": "common/icons/cmdFailureNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFieldChoose24",
                "icon": "common/icons/cmdFieldChoose24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFile24",
                "icon": "common/icons/cmdFile24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFileAdd24",
                "icon": "common/icons/cmdFileAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFileText24",
                "icon": "common/icons/cmdFileText24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFileTextLink24",
                "icon": "common/icons/cmdFileTextLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilledStar16",
                "icon": "common/icons/cmdFilledStar16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilledStar24",
                "icon": "common/icons/cmdFilledStar24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilter24",
                "icon": "common/icons/cmdFilter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterConfiguration24",
                "icon": "common/icons/cmdFilterConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterConfigure24",
                "icon": "common/icons/cmdFilterConfigure24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterEdit24",
                "icon": "common/icons/cmdFilterEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterExclude24",
                "icon": "common/icons/cmdFilterExclude24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterFromBottom24",
                "icon": "common/icons/cmdFilterFromBottom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterFromTop24",
                "icon": "common/icons/cmdFilterFromTop24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterGroup24",
                "icon": "common/icons/cmdFilterGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterHighlight24",
                "icon": "common/icons/cmdFilterHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterInclude24",
                "icon": "common/icons/cmdFilterInclude24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterRecords24",
                "icon": "common/icons/cmdFilterRecords24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterRemove24",
                "icon": "common/icons/cmdFilterRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterSet24",
                "icon": "common/icons/cmdFilterSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterUnset24",
                "icon": "common/icons/cmdFilterUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFind24",
                "icon": "common/icons/cmdFind24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFitToWindow24",
                "icon": "common/icons/cmdFitToWindow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFlipVertical24",
                "icon": "common/icons/cmdFlipVertical24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFlow24",
                "icon": "common/icons/cmdFlow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFMEAFailureSpecification24",
                "icon": "common/icons/cmdFMEAFailureSpecification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFMEAFailureSpecificationAdd24",
                "icon": "common/icons/cmdFMEAFailureSpecificationAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFMEASystemElementSpecificationLink24",
                "icon": "common/icons/cmdFMEASystemElementSpecificationLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFolder24",
                "icon": "common/icons/cmdFolder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFolderOpen24",
                "icon": "common/icons/cmdFolderOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdForceCollectThroughput24",
                "icon": "common/icons/cmdForceCollectThroughput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTask24",
                "icon": "common/icons/cmdFormTask24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskAdd24",
                "icon": "common/icons/cmdFormTaskAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskAssign24",
                "icon": "common/icons/cmdFormTaskAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskChangeStatus24",
                "icon": "common/icons/cmdFormTaskChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskConfiguration24",
                "icon": "common/icons/cmdFormTaskConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskExport24",
                "icon": "common/icons/cmdFormTaskExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskImport24",
                "icon": "common/icons/cmdFormTaskImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskLink24",
                "icon": "common/icons/cmdFormTaskLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFormTaskReanalyze24",
                "icon": "common/icons/cmdFormTaskReanalyze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdForwards24",
                "icon": "common/icons/cmdForwards24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFreeze24",
                "icon": "common/icons/cmdFreeze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFullSizeHorizontal24",
                "icon": "common/icons/cmdFullSizeHorizontal24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFullSizeVertical24",
                "icon": "common/icons/cmdFullSizeVertical24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFunctionality16",
                "icon": "common/icons/cmdFunctionality16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFunctionality24",
                "icon": "common/icons/cmdFunctionality24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGageSelection24",
                "icon": "common/icons/cmdGageSelection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGenealogy24",
                "icon": "common/icons/cmdGenealogy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGeneral24",
                "icon": "common/icons/cmdGeneral24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGeneralDataMaintenance24",
                "icon": "common/icons/cmdGeneralDataMaintenance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGenerateSchedules24",
                "icon": "common/icons/cmdGenerateSchedules24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGenericComponent24",
                "icon": "common/icons/cmdGenericComponent24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGoBack24",
                "icon": "common/icons/cmdGoBack24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGoToElement16",
                "icon": "common/icons/cmdGoToElement16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGoToElement24",
                "icon": "common/icons/cmdGoToElement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGraph24",
                "icon": "common/icons/cmdGraph24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGraphChangeStatus24",
                "icon": "common/icons/cmdGraphChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGripper16",
                "icon": "common/icons/cmdGripper16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGroup24",
                "icon": "common/icons/cmdGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGroupBy24",
                "icon": "common/icons/cmdGroupBy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGroupFilter24",
                "icon": "common/icons/cmdGroupFilter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHealthAndSafety24",
                "icon": "common/icons/cmdHealthAndSafety24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHelp24",
                "icon": "common/icons/cmdHelp24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHide24",
                "icon": "common/icons/cmdHide24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHighlightCancel24",
                "icon": "common/icons/cmdHighlightCancel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHistory24",
                "icon": "common/icons/cmdHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHistoryLock24",
                "icon": "common/icons/cmdHistoryLock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHoldClose24",
                "icon": "common/icons/cmdHoldClose24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHome24",
                "icon": "common/icons/cmdHome24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImageLink24",
                "icon": "common/icons/cmdImageLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImport24",
                "icon": "common/icons/cmdImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImportExport24",
                "icon": "common/icons/cmdImportExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImportExportAdministration24",
                "icon": "common/icons/cmdImportExportAdministration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdImportFromProcess24",
                "icon": "common/icons/cmdImportFromProcess24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInfiniteCapacity24",
                "icon": "common/icons/cmdInfiniteCapacity24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInfo24",
                "icon": "common/icons/cmdInfo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInsert24",
                "icon": "common/icons/cmdInsert24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInsertAfter24",
                "icon": "common/icons/cmdInsertAfter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInsertBefore24",
                "icon": "common/icons/cmdInsertBefore24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInsertPicture24",
                "icon": "common/icons/cmdInsertPicture24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInterlockingCheckHistory24",
                "icon": "common/icons/cmdInterlockingCheckHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInteroperability24",
                "icon": "common/icons/cmdInteroperability24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInvertHighlightedOperations16",
                "icon": "common/icons/cmdInvertHighlightedOperations16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdInvertHighlightedOperations24",
                "icon": "common/icons/cmdInvertHighlightedOperations24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdIshikawa24",
                "icon": "common/icons/cmdIshikawa24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdJson24",
                "icon": "common/icons/cmdJson24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdKPI24",
                "icon": "common/icons/cmdKPI24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLabelPrinter24",
                "icon": "common/icons/cmdLabelPrinter24.svg"
            },
            {
                "iconType": "cmdlanguage",
                "text": "svg cmdlanguage16",
                "icon": "common/icons/cmdlanguage16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLanguage24",
                "icon": "common/icons/cmdLanguage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLanguageReload24",
                "icon": "common/icons/cmdLanguageReload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutHierarchy24",
                "icon": "common/icons/cmdLayoutHierarchy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectAdd24",
                "icon": "common/icons/cmdLayoutProjectAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectBreak24",
                "icon": "common/icons/cmdLayoutProjectBreak24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectCopy24",
                "icon": "common/icons/cmdLayoutProjectCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectExport24",
                "icon": "common/icons/cmdLayoutProjectExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectLink24",
                "icon": "common/icons/cmdLayoutProjectLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLayoutProjectOpen24",
                "icon": "common/icons/cmdLayoutProjectOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLeaveTeam24",
                "icon": "common/icons/cmdLeaveTeam24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLibrary24",
                "icon": "common/icons/cmdLibrary24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLicenseAdd24",
                "icon": "common/icons/cmdLicenseAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLicenseImport24",
                "icon": "common/icons/cmdLicenseImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLicenseRemove24",
                "icon": "common/icons/cmdLicenseRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLicenseSave24",
                "icon": "common/icons/cmdLicenseSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLine24",
                "icon": "common/icons/cmdLine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLineFeature24",
                "icon": "common/icons/cmdLineFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLink24",
                "icon": "common/icons/cmdLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLinkNodeParameters24",
                "icon": "common/icons/cmdLinkNodeParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdList16",
                "icon": "common/icons/cmdList16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdList24",
                "icon": "common/icons/cmdList24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBox16",
                "icon": "common/icons/cmdListBox16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBox24",
                "icon": "common/icons/cmdListBox24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListBoxEdit24",
                "icon": "common/icons/cmdListBoxEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListLoad24",
                "icon": "common/icons/cmdListLoad24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdListView24",
                "icon": "common/icons/cmdListView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLock24",
                "icon": "common/icons/cmdLock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLockStructure24",
                "icon": "common/icons/cmdLockStructure24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLogEntry24",
                "icon": "common/icons/cmdLogEntry24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLoginCustom24",
                "icon": "common/icons/cmdLoginCustom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLoginWindows24",
                "icon": "common/icons/cmdLoginWindows24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLogisticRequestNotification24",
                "icon": "common/icons/cmdLogisticRequestNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdLot24",
                "icon": "common/icons/cmdLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachine24",
                "icon": "common/icons/cmdMachine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineBroken24",
                "icon": "common/icons/cmdMachineBroken24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineBrokenLink24",
                "icon": "common/icons/cmdMachineBrokenLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineRepair24",
                "icon": "common/icons/cmdMachineRepair24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineRepairLink24",
                "icon": "common/icons/cmdMachineRepairLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineSelect24",
                "icon": "common/icons/cmdMachineSelect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineState24",
                "icon": "common/icons/cmdMachineState24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMail24",
                "icon": "common/icons/cmdMail24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMailOpen24",
                "icon": "common/icons/cmdMailOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMailResend24",
                "icon": "common/icons/cmdMailResend24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMailSend24",
                "icon": "common/icons/cmdMailSend24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaintenance24",
                "icon": "common/icons/cmdMaintenance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdManufacturing24",
                "icon": "common/icons/cmdManufacturing24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdManufacturingElementRefresh24",
                "icon": "common/icons/cmdManufacturingElementRefresh24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMashup24",
                "icon": "common/icons/cmdMashup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMashupModuleGenerate24",
                "icon": "common/icons/cmdMashupModuleGenerate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMasterDetailsView24",
                "icon": "common/icons/cmdMasterDetailsView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialArrived24",
                "icon": "common/icons/cmdMaterialArrived24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialAddFromBom24",
                "icon": "common/icons/cmdMaterialAddFromBom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialAddFromLot24",
                "icon": "common/icons/cmdMaterialAddFromLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialAvailability24",
                "icon": "common/icons/cmdMaterialAvailability24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialBehaviourSet24",
                "icon": "common/icons/cmdMaterialBehaviourSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialBom24",
                "icon": "common/icons/cmdMaterialBom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialCancel24",
                "icon": "common/icons/cmdMaterialCancel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialContribution24",
                "icon": "common/icons/cmdMaterialContribution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialExplorerWindow24",
                "icon": "common/icons/cmdMaterialExplorerWindow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialHistoryExecution24",
                "icon": "common/icons/cmdMaterialHistoryExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialLinksWindow24",
                "icon": "common/icons/cmdMaterialLinksWindow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialMigration24",
                "icon": "common/icons/cmdMaterialMigration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialMonitorDIspached24",
                "icon": "common/icons/cmdMaterialMonitorDIspached24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialRequest24",
                "icon": "common/icons/cmdMaterialRequest24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialSetting24",
                "icon": "common/icons/cmdMaterialSetting24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialStorage24",
                "icon": "common/icons/cmdMaterialStorage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialStorageDetails24",
                "icon": "common/icons/cmdMaterialStorageDetails24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaterialStorageHierarchy24",
                "icon": "common/icons/cmdMaterialStorageHierarchy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMaximiseVertically24",
                "icon": "common/icons/cmdMaximiseVertically24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasurementManagement24",
                "icon": "common/icons/cmdMeasurementManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasurementManagementAdd24",
                "icon": "common/icons/cmdMeasurementManagementAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasurementManagementChangeStatus24",
                "icon": "common/icons/cmdMeasurementManagementChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasurementManagementConfiguration24",
                "icon": "common/icons/cmdMeasurementManagementConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasurementManagementReanalyze24",
                "icon": "common/icons/cmdMeasurementManagementReanalyze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMenu24",
                "icon": "common/icons/cmdMenu24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMerge24",
                "icon": "common/icons/cmdMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMergeLeft24",
                "icon": "common/icons/cmdMergeLeft24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMergeRight24",
                "icon": "common/icons/cmdMergeRight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMetricsPerformance24",
                "icon": "common/icons/cmdMetricsPerformance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMilestone24",
                "icon": "common/icons/cmdMilestone24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMilestoneCheckAction24",
                "icon": "common/icons/cmdMilestoneCheckAction24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMilestoneTransition24",
                "icon": "common/icons/cmdMilestoneTransition24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMissingImage24",
                "icon": "common/icons/cmdMissingImage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdModelItem24",
                "icon": "common/icons/cmdModelItem24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMore16",
                "icon": "common/icons/cmdMore16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMore24",
                "icon": "common/icons/cmdMore24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoreVertical24",
                "icon": "common/icons/cmdMoreVertical24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMousePointer24",
                "icon": "common/icons/cmdMousePointer24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMove24",
                "icon": "common/icons/cmdMove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveFromEquipment24",
                "icon": "common/icons/cmdMoveFromEquipment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveLeft24",
                "icon": "common/icons/cmdMoveLeft24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveRight24",
                "icon": "common/icons/cmdMoveRight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveToEquipment24",
                "icon": "common/icons/cmdMoveToEquipment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveToLocation24",
                "icon": "common/icons/cmdMoveToLocation24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveToMTUAggregate24",
                "icon": "common/icons/cmdMoveToMTUAggregate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveToPartAggregate24",
                "icon": "common/icons/cmdMoveToPartAggregate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveUpDown16",
                "icon": "common/icons/cmdMoveUpDown16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveUpDown24",
                "icon": "common/icons/cmdMoveUpDown24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMoveX24",
                "icon": "common/icons/cmdMoveX24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMultiline24",
                "icon": "common/icons/cmdMultiline24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMultipleChoice24",
                "icon": "common/icons/cmdMultipleChoice24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNestedOnOff24",
                "icon": "common/icons/cmdNestedOnOff24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNew24",
                "icon": "common/icons/cmdNew24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNewPanel24",
                "icon": "common/icons/cmdNewPanel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNoComment16",
                "icon": "common/icons/cmdNoComment16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNoComment24",
                "icon": "common/icons/cmdNoComment24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNoFaultFound24",
                "icon": "common/icons/cmdNoFaultFound24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformance24",
                "icon": "common/icons/cmdNonConformance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformanceBuyOff24",
                "icon": "common/icons/cmdNonConformanceBuyOff24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformanceChangeManagement24",
                "icon": "common/icons/cmdNonConformanceChangeManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformanceQuality24",
                "icon": "common/icons/cmdNonConformanceQuality24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformanceReopen24",
                "icon": "common/icons/cmdNonConformanceReopen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNonConformanceTravelling24",
                "icon": "common/icons/cmdNonConformanceTravelling24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNoteProperties24",
                "icon": "common/icons/cmdNoteProperties24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNotProductiveActivity24",
                "icon": "common/icons/cmdNotProductiveActivity24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNumberingPattern24",
                "icon": "common/icons/cmdNumberingPattern24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdNumericInput24",
                "icon": "common/icons/cmdNumericInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdObsolete24",
                "icon": "common/icons/cmdObsolete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOfflineBook24",
                "icon": "common/icons/cmdOfflineBook24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOfflineOpen24",
                "icon": "common/icons/cmdOfflineOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOfflineUnbook24",
                "icon": "common/icons/cmdOfflineUnbook24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOpen24",
                "icon": "common/icons/cmdOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOpenInXS16",
                "icon": "common/icons/cmdOpenInXS16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOpenInXS24",
                "icon": "common/icons/cmdOpenInXS24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOpenManageDataset24",
                "icon": "common/icons/cmdOpenManageDataset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperation24",
                "icon": "common/icons/cmdOperation24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperationAssign24",
                "icon": "common/icons/cmdOperationAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperationCatalog24",
                "icon": "common/icons/cmdOperationCatalog24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperationGroupLink24",
                "icon": "common/icons/cmdOperationGroupLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperationGroupUnlink24",
                "icon": "common/icons/cmdOperationGroupUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperationUnassign24",
                "icon": "common/icons/cmdOperationUnassign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOperatorLanding24",
                "icon": "common/icons/cmdOperatorLanding24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOptimize24",
                "icon": "common/icons/cmdOptimize24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOrder24",
                "icon": "common/icons/cmdOrder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOval24",
                "icon": "common/icons/cmdOval24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdOverviewCompress24",
                "icon": "common/icons/cmdOverviewCompress24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPack24",
                "icon": "common/icons/cmdPack24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPackageAssociate24",
                "icon": "common/icons/cmdPackageAssociate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPackDetails24",
                "icon": "common/icons/cmdPackDetails24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPadFeature24",
                "icon": "common/icons/cmdPadFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPanelsRearrange24",
                "icon": "common/icons/cmdPanelsRearrange24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterAssign24",
                "icon": "common/icons/cmdParameterAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterGroup24",
                "icon": "common/icons/cmdParameterGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterGroupChangeStatus24",
                "icon": "common/icons/cmdParameterGroupChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterGroupConfiguration24",
                "icon": "common/icons/cmdParameterGroupConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterGroupReanalyze24",
                "icon": "common/icons/cmdParameterGroupReanalyze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParametersAssign24",
                "icon": "common/icons/cmdParametersAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterSearchToAdd24",
                "icon": "common/icons/cmdParameterSearchToAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParametersImport24",
                "icon": "common/icons/cmdParametersImport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParameterUnassign24",
                "icon": "common/icons/cmdParameterUnassign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParentBatch24",
                "icon": "common/icons/cmdParentBatch24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartAddFromBom24",
                "icon": "common/icons/cmdPartAddFromBom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartAggregate24",
                "icon": "common/icons/cmdPartAggregate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartAssemble24",
                "icon": "common/icons/cmdPartAssemble24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartAssembleAll24",
                "icon": "common/icons/cmdPartAssembleAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartAssembleInput24",
                "icon": "common/icons/cmdPartAssembleInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartBehaviourSet24",
                "icon": "common/icons/cmdPartBehaviourSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartBom24",
                "icon": "common/icons/cmdPartBom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartBomHierarchy24",
                "icon": "common/icons/cmdPartBomHierarchy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartBomSet24",
                "icon": "common/icons/cmdPartBomSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartBomUnset24",
                "icon": "common/icons/cmdPartBomUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartChangeStatus24",
                "icon": "common/icons/cmdPartChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartConfiguration24",
                "icon": "common/icons/cmdPartConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartContribution24",
                "icon": "common/icons/cmdPartContribution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartDefect24",
                "icon": "common/icons/cmdPartDefect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartDisassemble24",
                "icon": "common/icons/cmdPartDisassemble24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartEngineering24",
                "icon": "common/icons/cmdPartEngineering24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartExecutionApply24",
                "icon": "common/icons/cmdPartExecutionApply24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartExecutionChange24",
                "icon": "common/icons/cmdPartExecutionChange24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartExecutionMore24",
                "icon": "common/icons/cmdPartExecutionMore24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartExecutionRemove24",
                "icon": "common/icons/cmdPartExecutionRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartHistoryExecution24",
                "icon": "common/icons/cmdPartHistoryExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartition24",
                "icon": "common/icons/cmdPartition24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartLink24",
                "icon": "common/icons/cmdPartLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartLot24",
                "icon": "common/icons/cmdPartLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartLotAssign24",
                "icon": "common/icons/cmdPartLotAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartLotUnassign24",
                "icon": "common/icons/cmdPartLotUnassign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartPhantom24",
                "icon": "common/icons/cmdPartPhantom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartProduce24",
                "icon": "common/icons/cmdPartProduce24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartProduceInput24",
                "icon": "common/icons/cmdPartProduceInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartReplace24",
                "icon": "common/icons/cmdPartReplace24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartReport24",
                "icon": "common/icons/cmdPartReport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdParts24",
                "icon": "common/icons/cmdParts24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartSet24",
                "icon": "common/icons/cmdPartSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartsExecution24",
                "icon": "common/icons/cmdPartsExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartStorage24",
                "icon": "common/icons/cmdPartStorage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartStorageDetails24",
                "icon": "common/icons/cmdPartStorageDetails24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartStorageHierarchy24",
                "icon": "common/icons/cmdPartStorageHierarchy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPartUnset24",
                "icon": "common/icons/cmdPartUnset24.svg"
            },
            {
                "iconType": "cmdpassword",
                "text": "svg cmdpassword16",
                "icon": "common/icons/cmdpassword16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPaste24",
                "icon": "common/icons/cmdPaste24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPause24",
                "icon": "common/icons/cmdPause24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPauseArchiving24",
                "icon": "common/icons/cmdPauseArchiving24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPauseRuleSchedule24",
                "icon": "common/icons/cmdPauseRuleSchedule24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPdf24",
                "icon": "common/icons/cmdPdf24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPencilSquare24",
                "icon": "common/icons/cmdPencilSquare24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPhysicalLocation24",
                "icon": "common/icons/cmdPhysicalLocation24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPickEntity16",
                "icon": "common/icons/cmdPickEntity16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPicker24",
                "icon": "common/icons/cmdPicker24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPin16",
                "icon": "common/icons/cmdPin16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPin24",
                "icon": "common/icons/cmdPin24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPinDefect24",
                "icon": "common/icons/cmdPinDefect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPivotTable24",
                "icon": "common/icons/cmdPivotTable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlate24",
                "icon": "common/icons/cmdPlate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlateAdd24",
                "icon": "common/icons/cmdPlateAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlateAssign24",
                "icon": "common/icons/cmdPlateAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlateChangeStatus24",
                "icon": "common/icons/cmdPlateChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlateWell24",
                "icon": "common/icons/cmdPlateWell24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlateWellConfiguration24",
                "icon": "common/icons/cmdPlateWellConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlayRuleSchedule24",
                "icon": "common/icons/cmdPlayRuleSchedule24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPlugin24",
                "icon": "common/icons/cmdPlugin24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderContarinerLoad24",
                "icon": "common/icons/cmdPowderContarinerLoad24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderContarinerSet24",
                "icon": "common/icons/cmdPowderContarinerSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderEdit24",
                "icon": "common/icons/cmdPowderEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderLoad24",
                "icon": "common/icons/cmdPowderLoad24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderMixing24",
                "icon": "common/icons/cmdPowderMixing24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderRecycle24",
                "icon": "common/icons/cmdPowderRecycle24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderRefill24",
                "icon": "common/icons/cmdPowderRefill24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderSetQuantity24",
                "icon": "common/icons/cmdPowderSetQuantity24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPowderUnload24",
                "icon": "common/icons/cmdPowderUnload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPredefinitedWorkspaceOpen24",
                "icon": "common/icons/cmdPredefinitedWorkspaceOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPreKit24",
                "icon": "common/icons/cmdPreKit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPrekitAssembleAndCheck24",
                "icon": "common/icons/cmdPrekitAssembleAndCheck24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPricebook24",
                "icon": "common/icons/cmdPricebook24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPricebookChangeStatus24",
                "icon": "common/icons/cmdPricebookChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPrint24",
                "icon": "common/icons/cmdPrint24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPrintJobFile24",
                "icon": "common/icons/cmdPrintJobFile24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPrintPreview24",
                "icon": "common/icons/cmdPrintPreview24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPriorityMode24",
                "icon": "common/icons/cmdPriorityMode24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPriorityReverseMode24",
                "icon": "common/icons/cmdPriorityReverseMode24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPriorityUp24",
                "icon": "common/icons/cmdPriorityUp24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProblemSolvingProcess24",
                "icon": "common/icons/cmdProblemSolvingProcess24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProcess24",
                "icon": "common/icons/cmdProcess24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProcessCatalog24",
                "icon": "common/icons/cmdProcessCatalog24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProcessClone24",
                "icon": "common/icons/cmdProcessClone24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProcessEvolve24",
                "icon": "common/icons/cmdProcessEvolve24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProcessNotification24",
                "icon": "common/icons/cmdProcessNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductionConfiguration24",
                "icon": "common/icons/cmdProductionConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductionContext24",
                "icon": "common/icons/cmdProductionContext24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductionCoordination24",
                "icon": "common/icons/cmdProductionCoordination24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductionRecordsHistory24",
                "icon": "common/icons/cmdProductionRecordsHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeFeature24",
                "icon": "common/icons/cmdProductTypeFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeFeatureList24",
                "icon": "common/icons/cmdProductTypeFeatureList24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeFeatureListQuality24",
                "icon": "common/icons/cmdProductTypeFeatureListQuality24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeFeatureListSet24",
                "icon": "common/icons/cmdProductTypeFeatureListSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeFeatureListUnset24",
                "icon": "common/icons/cmdProductTypeFeatureListUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeOption24",
                "icon": "common/icons/cmdProductTypeOption24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeOptionList24",
                "icon": "common/icons/cmdProductTypeOptionList24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeOptionListSet24",
                "icon": "common/icons/cmdProductTypeOptionListSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProductTypeOptionListUnset24",
                "icon": "common/icons/cmdProductTypeOptionListUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProject24",
                "icon": "common/icons/cmdProject24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProjectChecklist16",
                "icon": "common/icons/cmdProjectChecklist16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProjectChecklist24",
                "icon": "common/icons/cmdProjectChecklist24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProjectEngineering24",
                "icon": "common/icons/cmdProjectEngineering24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdProjectPublish24",
                "icon": "common/icons/cmdProjectPublish24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPropagationSet24",
                "icon": "common/icons/cmdPropagationSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPropagationUnset24",
                "icon": "common/icons/cmdPropagationUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPropertyCopy24",
                "icon": "common/icons/cmdPropertyCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPublish24",
                "icon": "common/icons/cmdPublish24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPush24",
                "icon": "common/icons/cmdPush24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQMS24",
                "icon": "common/icons/cmdQMS24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQRCode24",
                "icon": "common/icons/cmdQRCode24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQualityNotification24",
                "icon": "common/icons/cmdQualityNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQuantitySet24",
                "icon": "common/icons/cmdQuantitySet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQueryAdd24",
                "icon": "common/icons/cmdQueryAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdQuestionMark24",
                "icon": "common/icons/cmdQuestionMark24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReadyToDispatch24",
                "icon": "common/icons/cmdReadyToDispatch24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRebuild24",
                "icon": "common/icons/cmdRebuild24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordActualHighlight24",
                "icon": "common/icons/cmdRecordActualHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordBottleneckHighlight16",
                "icon": "common/icons/cmdRecordBottleneckHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordBottleneckHighlight24",
                "icon": "common/icons/cmdRecordBottleneckHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordCopy24",
                "icon": "common/icons/cmdRecordCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordDelayHighlight16",
                "icon": "common/icons/cmdRecordDelayHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordDelayHighlight24",
                "icon": "common/icons/cmdRecordDelayHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordEarlyHighlight16",
                "icon": "common/icons/cmdRecordEarlyHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordEarlyHighlight24",
                "icon": "common/icons/cmdRecordEarlyHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordHighlightedUnlock24",
                "icon": "common/icons/cmdRecordHighlightedUnlock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordHighlightedUnlockDisable24",
                "icon": "common/icons/cmdRecordHighlightedUnlockDisable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordInProgressLock24",
                "icon": "common/icons/cmdRecordInProgressLock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordLateHighlight16",
                "icon": "common/icons/cmdRecordLateHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordLateHighlight24",
                "icon": "common/icons/cmdRecordLateHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordLocate24",
                "icon": "common/icons/cmdRecordLocate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordLockedHighlight24",
                "icon": "common/icons/cmdRecordLockedHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordLockedLocate24",
                "icon": "common/icons/cmdRecordLockedLocate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordPreviousHighlight24",
                "icon": "common/icons/cmdRecordPreviousHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsAllBidirectionalHighlight24",
                "icon": "common/icons/cmdRecordsAllBidirectionalHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsAllHighlightedLocate24",
                "icon": "common/icons/cmdRecordsAllHighlightedLocate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsAllPreviousHighlight24",
                "icon": "common/icons/cmdRecordsAllPreviousHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsAllRelatedHighlight24",
                "icon": "common/icons/cmdRecordsAllRelatedHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsAllSubsequentHighlight24",
                "icon": "common/icons/cmdRecordsAllSubsequentHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordsBidirectionalHighlight24",
                "icon": "common/icons/cmdRecordsBidirectionalHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordSubsequentHighlight24",
                "icon": "common/icons/cmdRecordSubsequentHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordTreeHide24",
                "icon": "common/icons/cmdRecordTreeHide24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordTreeHighlight24",
                "icon": "common/icons/cmdRecordTreeHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordTreeHighlightedLock24",
                "icon": "common/icons/cmdRecordTreeHighlightedLock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordTreeHighlightedShow24",
                "icon": "common/icons/cmdRecordTreeHighlightedShow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordTreeShow24",
                "icon": "common/icons/cmdRecordTreeShow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordWarningHighlight16",
                "icon": "common/icons/cmdRecordWarningHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordWarningHighlight24",
                "icon": "common/icons/cmdRecordWarningHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordWithinDeliveryHighlight16",
                "icon": "common/icons/cmdRecordWithinDeliveryHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRecordWithinDeliveryHighlight24",
                "icon": "common/icons/cmdRecordWithinDeliveryHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRedo24",
                "icon": "common/icons/cmdRedo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRedoActivate24",
                "icon": "common/icons/cmdRedoActivate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRefresh24",
                "icon": "common/icons/cmdRefresh24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRefreshGrid24",
                "icon": "common/icons/cmdRefreshGrid24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRefreshToNewRevision24",
                "icon": "common/icons/cmdRefreshToNewRevision24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRegistry24",
                "icon": "common/icons/cmdRegistry24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReject24",
                "icon": "common/icons/cmdReject24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRelease24",
                "icon": "common/icons/cmdRelease24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemoteUpload24",
                "icon": "common/icons/cmdRemoteUpload24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemove16",
                "icon": "common/icons/cmdRemove16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemove24",
                "icon": "common/icons/cmdRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemoveFromLeftList24",
                "icon": "common/icons/cmdRemoveFromLeftList24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemoveFromRightList24",
                "icon": "common/icons/cmdRemoveFromRightList24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRemoveGroup24",
                "icon": "common/icons/cmdRemoveGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRename24",
                "icon": "common/icons/cmdRename24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRepeated24",
                "icon": "common/icons/cmdRepeated24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReplace24",
                "icon": "common/icons/cmdReplace24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReplaceFile24",
                "icon": "common/icons/cmdReplaceFile24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReportEdit24",
                "icon": "common/icons/cmdReportEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReports24",
                "icon": "common/icons/cmdReports24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReportSave24",
                "icon": "common/icons/cmdReportSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRequirementsAdd24",
                "icon": "common/icons/cmdRequirementsAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdResetCounter24",
                "icon": "common/icons/cmdResetCounter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdResumeArchiving24",
                "icon": "common/icons/cmdResumeArchiving24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReuseDocument24",
                "icon": "common/icons/cmdReuseDocument24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRevertChanges24",
                "icon": "common/icons/cmdRevertChanges24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRevertMaximiseVertically24",
                "icon": "common/icons/cmdRevertMaximiseVertically24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReviseAdd24",
                "icon": "common/icons/cmdReviseAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReviseCopy24",
                "icon": "common/icons/cmdReviseCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReworkCode24",
                "icon": "common/icons/cmdReworkCode24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRisk24",
                "icon": "common/icons/cmdRisk24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRole24",
                "icon": "common/icons/cmdRole24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRoleAssign24",
                "icon": "common/icons/cmdRoleAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRotate24",
                "icon": "common/icons/cmdRotate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSameWidth24",
                "icon": "common/icons/cmdSameWidth24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSave24",
                "icon": "common/icons/cmdSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSaveAs24",
                "icon": "common/icons/cmdSaveAs24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSchedule24",
                "icon": "common/icons/cmdSchedule24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleApply16",
                "icon": "common/icons/cmdScheduleApply16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleApply24",
                "icon": "common/icons/cmdScheduleApply24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleBidirectional24",
                "icon": "common/icons/cmdScheduleBidirectional24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleClear16",
                "icon": "common/icons/cmdScheduleClear16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleClear24",
                "icon": "common/icons/cmdScheduleClear24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleComparativeActualOpen24",
                "icon": "common/icons/cmdScheduleComparativeActualOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleComparativeClose24",
                "icon": "common/icons/cmdScheduleComparativeClose24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleComparativeOpen24",
                "icon": "common/icons/cmdScheduleComparativeOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleCopyOf24",
                "icon": "common/icons/cmdScheduleCopyOf24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleDespiteShortage24",
                "icon": "common/icons/cmdScheduleDespiteShortage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleExport24",
                "icon": "common/icons/cmdScheduleExport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleOpen24",
                "icon": "common/icons/cmdScheduleOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleRuleActivate24",
                "icon": "common/icons/cmdScheduleRuleActivate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleSave24",
                "icon": "common/icons/cmdScheduleSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleSet24",
                "icon": "common/icons/cmdScheduleSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleView24",
                "icon": "common/icons/cmdScheduleView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSchematicAvailable24",
                "icon": "common/icons/cmdSchematicAvailable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSchematicDisabled24",
                "icon": "common/icons/cmdSchematicDisabled24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScript24",
                "icon": "common/icons/cmdScript24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSearch24",
                "icon": "common/icons/cmdSearch24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSeason24",
                "icon": "common/icons/cmdSeason24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSecondaryResources24",
                "icon": "common/icons/cmdSecondaryResources24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSectionApply24",
                "icon": "common/icons/cmdSectionApply24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSectionRemove24",
                "icon": "common/icons/cmdSectionRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSegmentDefect24",
                "icon": "common/icons/cmdSegmentDefect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSegregationTagsLog24",
                "icon": "common/icons/cmdSegregationTagsLog24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectAll24",
                "icon": "common/icons/cmdSelectAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectAllVisible24",
                "icon": "common/icons/cmdSelectAllVisible24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectionRemove24",
                "icon": "common/icons/cmdSelectionRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectMachine24",
                "icon": "common/icons/cmdSelectMachine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSendToBack24",
                "icon": "common/icons/cmdSendToBack24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdServer24",
                "icon": "common/icons/cmdServer24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdServerManagement24",
                "icon": "common/icons/cmdServerManagement24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdServerMonitor24",
                "icon": "common/icons/cmdServerMonitor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdServerNodeSwitch24",
                "icon": "common/icons/cmdServerNodeSwitch24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSet24",
                "icon": "common/icons/cmdSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetDefault24",
                "icon": "common/icons/cmdSetDefault24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetFont24",
                "icon": "common/icons/cmdSetFont24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetMaterial24",
                "icon": "common/icons/cmdSetMaterial24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetPoint24",
                "icon": "common/icons/cmdSetPoint24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetPointItem24",
                "icon": "common/icons/cmdSetPointItem24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetStateMachine24",
                "icon": "common/icons/cmdSetStateMachine24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSettingsAdapter24",
                "icon": "common/icons/cmdSettingsAdapter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetWeight24",
                "icon": "common/icons/cmdSetWeight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShield24",
                "icon": "common/icons/cmdShield24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShopfloor24",
                "icon": "common/icons/cmdShopfloor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShopfloorTransaction24",
                "icon": "common/icons/cmdShopfloorTransaction24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShortcut24",
                "icon": "common/icons/cmdShortcut24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShortDefect24",
                "icon": "common/icons/cmdShortDefect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShow24",
                "icon": "common/icons/cmdShow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowCommentaryPanel16",
                "icon": "common/icons/cmdShowCommentaryPanel16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowCommentaryPanel24",
                "icon": "common/icons/cmdShowCommentaryPanel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowGrid24",
                "icon": "common/icons/cmdShowGrid24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSidebarConfiguration24",
                "icon": "common/icons/cmdSidebarConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSignatureCertificateCancel24",
                "icon": "common/icons/cmdSignatureCertificateCancel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSitesLocation24",
                "icon": "common/icons/cmdSitesLocation24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSkip24",
                "icon": "common/icons/cmdSkip24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSkipSquare24",
                "icon": "common/icons/cmdSkipSquare24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSliders24",
                "icon": "common/icons/cmdSliders24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSolutionAdministration24",
                "icon": "common/icons/cmdSolutionAdministration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSort24",
                "icon": "common/icons/cmdSort24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSpecificDate24",
                "icon": "common/icons/cmdSpecificDate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSquare24",
                "icon": "common/icons/cmdSquare24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSquareCheck24",
                "icon": "common/icons/cmdSquareCheck24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStar24",
                "icon": "common/icons/cmdStar24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStart24",
                "icon": "common/icons/cmdStart24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStartArchiving24",
                "icon": "common/icons/cmdStartArchiving24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStateMachineSet24",
                "icon": "common/icons/cmdStateMachineSet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticLeftParameter24",
                "icon": "common/icons/cmdStaticLeftParameter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticParameters24",
                "icon": "common/icons/cmdStaticParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticRightParameter24",
                "icon": "common/icons/cmdStaticRightParameter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStatisticalProcessControl24",
                "icon": "common/icons/cmdStatisticalProcessControl24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStencilDesigner24",
                "icon": "common/icons/cmdStencilDesigner24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStepCatalog24",
                "icon": "common/icons/cmdStepCatalog24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStepComplete24",
                "icon": "common/icons/cmdStepComplete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStepFlow24",
                "icon": "common/icons/cmdStepFlow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStepMultiselect24",
                "icon": "common/icons/cmdStepMultiselect24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockCalculate24",
                "icon": "common/icons/cmdStockCalculate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockHolding24",
                "icon": "common/icons/cmdStockHolding24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockProfileViewer24",
                "icon": "common/icons/cmdStockProfileViewer24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockProfileViewerDisable24",
                "icon": "common/icons/cmdStockProfileViewerDisable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockProfileViewerSingleDisable24",
                "icon": "common/icons/cmdStockProfileViewerSingleDisable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockRefresh24",
                "icon": "common/icons/cmdStockRefresh24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStockUndo24",
                "icon": "common/icons/cmdStockUndo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStop24",
                "icon": "common/icons/cmdStop24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStopArchiving24",
                "icon": "common/icons/cmdStopArchiving24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStopMagic24",
                "icon": "common/icons/cmdStopMagic24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStudyChangeStatus24",
                "icon": "common/icons/cmdStudyChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSubmit24",
                "icon": "common/icons/cmdSubmit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSubTreeDelete24",
                "icon": "common/icons/cmdSubTreeDelete24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSurfaceFeature24",
                "icon": "common/icons/cmdSurfaceFeature24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSWACComponent24",
                "icon": "common/icons/cmdSWACComponent24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSwitchOff24",
                "icon": "common/icons/cmdSwitchOff24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSwitchOn24",
                "icon": "common/icons/cmdSwitchOn24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSwitchOrder24",
                "icon": "common/icons/cmdSwitchOrder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSync24",
                "icon": "common/icons/cmdSync24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSysConfiguration24",
                "icon": "common/icons/cmdSysConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTabAllWindow24",
                "icon": "common/icons/cmdTabAllWindow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTableView24",
                "icon": "common/icons/cmdTableView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTags24",
                "icon": "common/icons/cmdTags24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTagsToGroups24",
                "icon": "common/icons/cmdTagsToGroups24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTakeOwnership24",
                "icon": "common/icons/cmdTakeOwnership24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskActivate24",
                "icon": "common/icons/cmdTaskActivate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskFilter24",
                "icon": "common/icons/cmdTaskFilter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskInstance24",
                "icon": "common/icons/cmdTaskInstance24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskInstanceExecution24",
                "icon": "common/icons/cmdTaskInstanceExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskOperatorExecution24",
                "icon": "common/icons/cmdTaskOperatorExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskRecover24",
                "icon": "common/icons/cmdTaskRecover24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskRepeat24",
                "icon": "common/icons/cmdTaskRepeat24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTaskUnassign24",
                "icon": "common/icons/cmdTaskUnassign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTeam24",
                "icon": "common/icons/cmdTeam24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTeamAdministration24",
                "icon": "common/icons/cmdTeamAdministration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTest24",
                "icon": "common/icons/cmdTest24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRun24",
                "icon": "common/icons/cmdTestRun24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunAdd24",
                "icon": "common/icons/cmdTestRunAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunChangeStatus24",
                "icon": "common/icons/cmdTestRunChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunConfiguration24",
                "icon": "common/icons/cmdTestRunConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunLink24",
                "icon": "common/icons/cmdTestRunLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunReanalyze24",
                "icon": "common/icons/cmdTestRunReanalyze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTestRunUnlink24",
                "icon": "common/icons/cmdTestRunUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTextInput24",
                "icon": "common/icons/cmdTextInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTextRotate24",
                "icon": "common/icons/cmdTextRotate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdThicknessDecrease24",
                "icon": "common/icons/cmdThicknessDecrease24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTileCollection24",
                "icon": "common/icons/cmdTileCollection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTime24",
                "icon": "common/icons/cmdTime24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTimeframeLeftParameter24",
                "icon": "common/icons/cmdTimeframeLeftParameter24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTimeframeParameters24",
                "icon": "common/icons/cmdTimeframeParameters24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTimeTaskModel24",
                "icon": "common/icons/cmdTimeTaskModel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTimeTaskSplit24",
                "icon": "common/icons/cmdTimeTaskSplit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool124",
                "icon": "common/icons/cmdTool124.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool224",
                "icon": "common/icons/cmdTool224.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool24",
                "icon": "common/icons/cmdTool24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool324",
                "icon": "common/icons/cmdTool324.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool424",
                "icon": "common/icons/cmdTool424.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool524",
                "icon": "common/icons/cmdTool524.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool624",
                "icon": "common/icons/cmdTool624.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool724",
                "icon": "common/icons/cmdTool724.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool824",
                "icon": "common/icons/cmdTool824.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTool924",
                "icon": "common/icons/cmdTool924.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolA24",
                "icon": "common/icons/cmdToolA24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolB24",
                "icon": "common/icons/cmdToolB24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolbox24",
                "icon": "common/icons/cmdToolbox24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolC24",
                "icon": "common/icons/cmdToolC24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolChangeStatus24",
                "icon": "common/icons/cmdToolChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolD24",
                "icon": "common/icons/cmdToolD24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolE24",
                "icon": "common/icons/cmdToolE24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolF24",
                "icon": "common/icons/cmdToolF24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolG24",
                "icon": "common/icons/cmdToolG24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolH24",
                "icon": "common/icons/cmdToolH24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolI24",
                "icon": "common/icons/cmdToolI24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolJ24",
                "icon": "common/icons/cmdToolJ24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolK24",
                "icon": "common/icons/cmdToolK24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolL24",
                "icon": "common/icons/cmdToolL24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolM24",
                "icon": "common/icons/cmdToolM24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolN24",
                "icon": "common/icons/cmdToolN24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolO24",
                "icon": "common/icons/cmdToolO24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolP24",
                "icon": "common/icons/cmdToolP24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolQ24",
                "icon": "common/icons/cmdToolQ24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolR24",
                "icon": "common/icons/cmdToolR24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolS24",
                "icon": "common/icons/cmdToolS24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolsAll24",
                "icon": "common/icons/cmdToolsAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolsPanel24",
                "icon": "common/icons/cmdToolsPanel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolT24",
                "icon": "common/icons/cmdToolT24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToolU24",
                "icon": "common/icons/cmdToolU24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdToPartial24",
                "icon": "common/icons/cmdToPartial24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTrackMessage24",
                "icon": "common/icons/cmdTrackMessage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTraining24",
                "icon": "common/icons/cmdTraining24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTransport24",
                "icon": "common/icons/cmdTransport24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTrash24",
                "icon": "common/icons/cmdTrash24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTravellingNotification24",
                "icon": "common/icons/cmdTravellingNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTxt24",
                "icon": "common/icons/cmdTxt24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUIApplication24",
                "icon": "common/icons/cmdUIApplication24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUIApplicationRegenerate24",
                "icon": "common/icons/cmdUIApplicationRegenerate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnassignLot24",
                "icon": "common/icons/cmdUnassignLot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUndeploy24",
                "icon": "common/icons/cmdUndeploy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUndo24",
                "icon": "common/icons/cmdUndo24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnfreeze24",
                "icon": "common/icons/cmdUnfreeze24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUngroupBy24",
                "icon": "common/icons/cmdUngroupBy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnlink24",
                "icon": "common/icons/cmdUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnloadHandlingUnit24",
                "icon": "common/icons/cmdUnloadHandlingUnit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnlock24",
                "icon": "common/icons/cmdUnlock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnpin16",
                "icon": "common/icons/cmdUnpin16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnpin24",
                "icon": "common/icons/cmdUnpin24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnselectAll24",
                "icon": "common/icons/cmdUnselectAll24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnselectAllVisible24",
                "icon": "common/icons/cmdUnselectAllVisible24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnset24",
                "icon": "common/icons/cmdUnset24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUnsetDefault24",
                "icon": "common/icons/cmdUnsetDefault24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowBidirection16",
                "icon": "common/icons/cmdShowBidirection16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowBidirection24",
                "icon": "common/icons/cmdShowBidirection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowBidrectionDashed16",
                "icon": "common/icons/cmdShowBidrectionDashed16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowBidrectionDashed24",
                "icon": "common/icons/cmdShowBidrectionDashed24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowIncomingDashed24",
                "icon": "common/icons/cmdShowIncomingDashed24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowIncomingRelations16",
                "icon": "common/icons/cmdShowIncomingRelations16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowIncomingDashed16",
                "icon": "common/icons/cmdShowIncomingDashed16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUpdate24",
                "icon": "common/icons/cmdUpdate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUpdateLive24",
                "icon": "common/icons/cmdUpdateLive24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUpdateLiveDisabled24",
                "icon": "common/icons/cmdUpdateLiveDisabled24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUpload24",
                "icon": "common/icons/cmdUpload24.svg"
            },
            {
                "iconType": "cmduser",
                "text": "svg cmduser16",
                "icon": "common/icons/cmduser16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUser24",
                "icon": "common/icons/cmdUser24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUserAdd24",
                "icon": "common/icons/cmdUserAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUserInterface24",
                "icon": "common/icons/cmdUserInterface24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUserLink24",
                "icon": "common/icons/cmdUserLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUserRole24",
                "icon": "common/icons/cmdUserRole24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUseToolInput24",
                "icon": "common/icons/cmdUseToolInput24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUtilizationWindow24",
                "icon": "common/icons/cmdUtilizationWindow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUtilizationWindowSetting24",
                "icon": "common/icons/cmdUtilizationWindowSetting24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUtilModeHours24",
                "icon": "common/icons/cmdUtilModeHours24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUtilModePercentage24",
                "icon": "common/icons/cmdUtilModePercentage24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdUtilModeSelection24",
                "icon": "common/icons/cmdUtilModeSelection24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdValidate24",
                "icon": "common/icons/cmdValidate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdViewConvenience24",
                "icon": "common/icons/cmdViewConvenience24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdViewFromBottom24",
                "icon": "common/icons/cmdViewFromBottom24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdViewFromTop24",
                "icon": "common/icons/cmdViewFromTop24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdViewRows24",
                "icon": "common/icons/cmdViewRows24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarehouse24",
                "icon": "common/icons/cmdWarehouse24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarningLink24",
                "icon": "common/icons/cmdWarningLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWarningLinkRed24",
                "icon": "common/icons/cmdWarningLinkRed24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWebGeneral24",
                "icon": "common/icons/cmdWebGeneral24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWhereUsed24",
                "icon": "common/icons/cmdWhereUsed24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowAlert24",
                "icon": "common/icons/cmdWindowAlert24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowEditor24",
                "icon": "common/icons/cmdWindowEditor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowGantt24",
                "icon": "common/icons/cmdWindowGantt24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowGanttEdit24",
                "icon": "common/icons/cmdWindowGanttEdit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowGauge24",
                "icon": "common/icons/cmdWindowGauge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowGaugeSetting24",
                "icon": "common/icons/cmdWindowGaugeSetting24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowNormalized24",
                "icon": "common/icons/cmdWindowNormalized24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowOutlineView24",
                "icon": "common/icons/cmdWindowOutlineView24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowOverview24",
                "icon": "common/icons/cmdWindowOverview24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowOverviewGroup24",
                "icon": "common/icons/cmdWindowOverviewGroup24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowParallel24",
                "icon": "common/icons/cmdWindowParallel24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowPlot24",
                "icon": "common/icons/cmdWindowPlot24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowPlotSetting24",
                "icon": "common/icons/cmdWindowPlotSetting24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowSave24",
                "icon": "common/icons/cmdWindowSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowSelectedEditor24",
                "icon": "common/icons/cmdWindowSelectedEditor24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowStock24",
                "icon": "common/icons/cmdWindowStock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowTraceChart24",
                "icon": "common/icons/cmdWindowTraceChart24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowTreeGantt24",
                "icon": "common/icons/cmdWindowTreeGantt24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWindowZeroEfficiency24",
                "icon": "common/icons/cmdWindowZeroEfficiency24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWOOP24",
                "icon": "common/icons/cmdWOOP24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkerRole24",
                "icon": "common/icons/cmdWorkerRole24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkflowConfiguration24",
                "icon": "common/icons/cmdWorkflowConfiguration24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkflowProcessStep24",
                "icon": "common/icons/cmdWorkflowProcessStep24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkflowStep24",
                "icon": "common/icons/cmdWorkflowStep24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkInProgress24",
                "icon": "common/icons/cmdWorkInProgress24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkMaster24",
                "icon": "common/icons/cmdWorkMaster24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrder24",
                "icon": "common/icons/cmdWorkOrder24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderAvailable24",
                "icon": "common/icons/cmdWorkOrderAvailable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderCopy24",
                "icon": "common/icons/cmdWorkOrderCopy24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderCreate24",
                "icon": "common/icons/cmdWorkOrderCreate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderEnquiry24",
                "icon": "common/icons/cmdWorkOrderEnquiry24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderHistory24",
                "icon": "common/icons/cmdWorkOrderHistory24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderLateHighlight16",
                "icon": "common/icons/cmdWorkOrderLateHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderLateHighlight24",
                "icon": "common/icons/cmdWorkOrderLateHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderNotification24",
                "icon": "common/icons/cmdWorkOrderNotification24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderRemove24",
                "icon": "common/icons/cmdWorkOrderRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderRule24",
                "icon": "common/icons/cmdWorkOrderRule24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrdersLink24",
                "icon": "common/icons/cmdWorkOrdersLink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrdersMerge24",
                "icon": "common/icons/cmdWorkOrdersMerge24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderSplit24",
                "icon": "common/icons/cmdWorkOrderSplit24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrdersRemove24",
                "icon": "common/icons/cmdWorkOrdersRemove24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrdersUnlink24",
                "icon": "common/icons/cmdWorkOrdersUnlink24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderWithinDeliveryHighlight16",
                "icon": "common/icons/cmdWorkOrderWithinDeliveryHighlight16.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkOrderWithinDeliveryHighlight24",
                "icon": "common/icons/cmdWorkOrderWithinDeliveryHighlight24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkProcess24",
                "icon": "common/icons/cmdWorkProcess24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkProcessChangeStatus24",
                "icon": "common/icons/cmdWorkProcessChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkProcessExecution24",
                "icon": "common/icons/cmdWorkProcessExecution24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkProcessResume24",
                "icon": "common/icons/cmdWorkProcessResume24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkProcessTemplate24",
                "icon": "common/icons/cmdWorkProcessTemplate24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorksheet24",
                "icon": "common/icons/cmdWorksheet24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorksheetAdd24",
                "icon": "common/icons/cmdWorksheetAdd24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorksheetAssign24",
                "icon": "common/icons/cmdWorksheetAssign24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorksheetChangeStatus24",
                "icon": "common/icons/cmdWorksheetChangeStatus24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorksheetRow24",
                "icon": "common/icons/cmdWorksheetRow24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkspaceConfigureToolbar24",
                "icon": "common/icons/cmdWorkspaceConfigureToolbar24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkspaceOpen24",
                "icon": "common/icons/cmdWorkspaceOpen24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkspaceSave24",
                "icon": "common/icons/cmdWorkspaceSave24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdWorkspaceTooltipsDisable24",
                "icon": "common/icons/cmdWorkspaceTooltipsDisable24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdXml24",
                "icon": "common/icons/cmdXml24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomIn24",
                "icon": "common/icons/cmdZoomIn24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomInX24",
                "icon": "common/icons/cmdZoomInX24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomInY24",
                "icon": "common/icons/cmdZoomInY24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomLock24",
                "icon": "common/icons/cmdZoomLock24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomOut24",
                "icon": "common/icons/cmdZoomOut24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomOutX24",
                "icon": "common/icons/cmdZoomOutX24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomOutY24",
                "icon": "common/icons/cmdZoomOutY24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomResetX24",
                "icon": "common/icons/cmdZoomResetX24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomResetXY24",
                "icon": "common/icons/cmdZoomResetXY24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomResetY24",
                "icon": "common/icons/cmdZoomResetY24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomTool24",
                "icon": "common/icons/cmdZoomTool24.svg"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriageReport24",
                "icon": "common/icons/cmdCarriageReport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCarriageSlotAdd24",
                "icon": "common/icons/cmdCarriageSlotAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClient24",
                "icon": "common/icons/cmdClient24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClientExport24",
                "icon": "common/icons/cmdClientExport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdClientImport24",
                "icon": "common/icons/cmdClientImport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentAdd24",
                "icon": "common/icons/cmdComponentAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentEdit24",
                "icon": "common/icons/cmdComponentEdit24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentFilter24",
                "icon": "common/icons/cmdComponentFilter24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentImportQuantity24",
                "icon": "common/icons/cmdComponentImportQuantity24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentReport24",
                "icon": "common/icons/cmdComponentReport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponents24",
                "icon": "common/icons/cmdComponents24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdComponentZoom24",
                "icon": "common/icons/cmdComponentZoom24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdConfigurationReport24",
                "icon": "common/icons/cmdConfigurationReport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCoordinateEdit24",
                "icon": "common/icons/cmdCoordinateEdit24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCopyMove24",
                "icon": "common/icons/cmdCopyMove24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefinePolygon24",
                "icon": "common/icons/cmdDefinePolygon24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdDefineRectangle24",
                "icon": "common/icons/cmdDefineRectangle24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEqualWorkOrderLink24",
                "icon": "common/icons/cmdEqualWorkOrderLink24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFeederExport24",
                "icon": "common/icons/cmdFeederExport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFeederGroupAdd24",
                "icon": "common/icons/cmdFeederGroupAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFeederOptimize24",
                "icon": "common/icons/cmdFeederOptimize24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdFilterTemplateAdd24",
                "icon": "common/icons/cmdFilterTemplateAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGraphicsEdit24",
                "icon": "common/icons/cmdGraphicsEdit24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdGridView24",
                "icon": "common/icons/cmdGridView24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHorizontalSplitMoveDown24",
                "icon": "common/icons/cmdHorizontalSplitMoveDown24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHorizontalSplitMoveDownUndo24",
                "icon": "common/icons/cmdHorizontalSplitMoveDownUndo24.SVG"
            },

            {
                "iconType": "cmd",
                "text": "svg cmdHorizontalSplitMoveUp24",
                "icon": "common/icons/cmdHorizontalSplitMoveUp24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdHorizontalSplitMoveUpUndo24",
                "icon": "common/icons/cmdHorizontalSplitMoveUpUndo24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryGroupAdd24",
                "icon": "common/icons/cmdMachineryGroupAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryStationAdd24",
                "icon": "common/icons/cmdMachineryStationAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryStationExport24",
                "icon": "common/icons/cmdMachineryStationExport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryStationImport24",
                "icon": "common/icons/cmdMachineryStationImport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryStationSettings24",
                "icon": "common/icons/cmdMachineryStationSettings24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMachineryStationUnlink24",
                "icon": "common/icons/cmdMachineryStationUnlink24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasureBetweenContours24",
                "icon": "common/icons/cmdMeasureBetweenContours24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasureBetweenPoints24",
                "icon": "common/icons/cmdMeasureBetweenPoints24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdMeasureCancel24",
                "icon": "common/icons/cmdMeasureCancel24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdPopUpView24",
                "icon": "common/icons/cmdPopUpView24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdResourceAdd24",
                "icon": "common/icons/cmdResourceAdd24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdResourceTemplate24",
                "icon": "common/icons/cmdResourceTemplate24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRuleExport24",
                "icon": "common/icons/cmdRuleExport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRuleImport24",
                "icon": "common/icons/cmdRuleImport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRuleRating16",
                "icon": "common/icons/cmdRuleRating16.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRuleRating24",
                "icon": "common/icons/cmdRuleRating24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRunAllChecklist24",
                "icon": "common/icons/cmdRunAllChecklist24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRunChecklistSelected24",
                "icon": "common/icons/cmdRunChecklistSelected24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdRunChecklistUpdated24",
                "icon": "common/icons/cmdRunChecklistUpdated24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdScheduleRequestClear24",
                "icon": "common/icons/cmdScheduleRequestClear24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectionAdditive24",
                "icon": "common/icons/cmdSelectionAdditive24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSelectionFeature24",
                "icon": "common/icons/cmdSelectionFeature24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetOriginLeftLower24",
                "icon": "common/icons/cmdSetOriginLeftLower24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetOriginLeftUpper24",
                "icon": "common/icons/cmdSetOriginLeftUpper24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetOriginRightLower24",
                "icon": "common/icons/cmdSetOriginRightLower24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSetOriginRightUpper24",
                "icon": "common/icons/cmdSetOriginRightUpper24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShowGridDelete24",
                "icon": "common/icons/cmdShowGridDelete24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnakeMode24",
                "icon": "common/icons/cmdSnakeMode24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnapBetweenFeatures24",
                "icon": "common/icons/cmdSnapBetweenFeatures24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnapToCenter24",
                "icon": "common/icons/cmdSnapToCenter24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnapToFeature24",
                "icon": "common/icons/cmdSnapToFeature24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnapToGrid24",
                "icon": "common/icons/cmdSnapToGrid24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSnapToIntersect24",
                "icon": "common/icons/cmdSnapToIntersect24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticSetting24",
                "icon": "common/icons/cmdStaticSetting24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticSettingExport24",
                "icon": "common/icons/cmdStaticSettingExport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticSettingImport24",
                "icon": "common/icons/cmdStaticSettingImport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStaticSettingOptimize24",
                "icon": "common/icons/cmdStaticSettingOptimize24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSurfaceLink24",
                "icon": "common/icons/cmdSurfaceLink24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSurfaceUnlink24",
                "icon": "common/icons/cmdSurfaceUnlink24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdSyncView24",
                "icon": "common/icons/cmdSyncView24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdTimeImport24",
                "icon": "common/icons/cmdTimeImport24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdVerticalSplitMoveLeft24",
                "icon": "common/icons/cmdVerticalSplitMoveLeft24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdVerticalSplitMoveLeftUndo24",
                "icon": "common/icons/cmdVerticalSplitMoveLeftUndo24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdVerticalSplitMoveRight24",
                "icon": "common/icons/cmdVerticalSplitMoveRight24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdVerticalSplitMoveRightUndo24",
                "icon": "common/icons/cmdVerticalSplitMoveRightUndo24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomDelete24",
                "icon": "common/icons/cmdZoomDelete24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomPrevious24",
                "icon": "common/icons/cmdZoomPrevious24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdZoomSelectedArea24",
                "icon": "common/icons/cmdZoomSelectedArea24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCollectDown16",
                "icon": "common/icons/cmdCollectDown16.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdCollectDown24",
                "icon": "common/icons/cmdCollectDown24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdStencilApplication24",
                "icon": "common/icons/cmdStencilApplication24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmd3DPrinterTag16",
                "icon": "common/icons/cmd3DPrinterTag16.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmd3DPrinterTag24",
                "icon": "common/icons/cmd3DPrinterTag24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdAddGroupTemplate24",
                "icon": "common/icons/cmdAddGroupTemplate24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEwiPreview16",
                "icon": "common/icons/cmdEwiPreview16.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdEwiPreview24",
                "icon": "common/icons/cmdEwiPreview24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdReschedule24",
                "icon": "common/icons/cmdReschedule24.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShoppingCart16",
                "icon": "common/icons/cmdShoppingCart16.SVG"
            },
            {
                "iconType": "cmd",
                "text": "svg cmdShoppingCart24",
                "icon": "common/icons/cmdShoppingCart24.SVG"
            },
            {
                "iconType": "grah",
                "text": "svg grahCircleLoader80R",
                "icon": "common/icons/grahCircleLoader80R.SVG"
            },
            {
                "iconType": "home",
                "text": "svg homeChecklist64",
                "icon": "common/icons/homeChecklist64.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeControlPlan64",
                "icon": "common/icons/homeControlPlan64.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeFolder24",
                "icon": "common/icons/homeFolder24.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeFolderOpen24",
                "icon": "common/icons/homeFolderOpen24.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeProjectChecklist64",
                "icon": "common/icons/homeProjectChecklist64.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeQualityAction64",
                "icon": "common/icons/homeQualityAction64.svg"
            },
            {
                "iconType": "home",
                "text": "svg homeQualityProject64",
                "icon": "common/icons/homeQualityProject64.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorActive16",
                "icon": "common/icons/indicatorActive16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorScrewdriver16",
                "icon": "common/icons/indicatorScrewdriver16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAnalysisQuestion16",
                "icon": "common/icons/indicatorAnalysisQuestion16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAnalysisSetting16",
                "icon": "common/icons/indicatorAnalysisSetting16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAppInstalled16",
                "icon": "common/icons/indicatorAppInstalled16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAppUpdate16",
                "icon": "common/icons/indicatorAppUpdate16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorArchived16",
                "icon": "common/icons/indicatorArchived16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorArrowBlue16",
                "icon": "common/icons/indicatorArrowBlue16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorArrowGreen16",
                "icon": "common/icons/indicatorArrowGreen16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorASMProcessing16",
                "icon": "common/icons/indicatorASMProcessing16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAborting16",
                "icon": "common/icons/indicatorAborting16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOwner16",
                "icon": "common/icons/indicatorOwner16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRecordHide16",
                "icon": "common/icons/indicatorRecordHide16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRole16",
                "icon": "common/icons/indicatorRole16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAssemble16",
                "icon": "common/icons/indicatorAssemble16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorAutomationNodeInstance16",
                "icon": "common/icons/indicatorAutomationNodeInstance16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorBarcode16",
                "icon": "common/icons/indicatorBarcode16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorBatch16",
                "icon": "common/icons/indicatorBatch16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorBrickShortcut16",
                "icon": "common/icons/indicatorBrickShortcut16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCheckmarkGreen16",
                "icon": "common/icons/indicatorCheckmarkGreen16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCheckmarkYellow16",
                "icon": "common/icons/indicatorCheckmarkYellow16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleBlack16",
                "icon": "common/icons/indicatorCircleBlack16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleBlue16",
                "icon": "common/icons/indicatorCircleBlue16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleGreen16",
                "icon": "common/icons/indicatorCircleGreen16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleGreenFull16",
                "icon": "common/icons/indicatorCircleGreenFull16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleOrange16",
                "icon": "common/icons/indicatorCircleOrange16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleRed16",
                "icon": "common/icons/indicatorCircleRed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleReleased16",
                "icon": "common/icons/indicatorCircleReleased16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleWhite16",
                "icon": "common/icons/indicatorCircleWhite16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCircleYellow16",
                "icon": "common/icons/indicatorCircleYellow16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCloseLiteRed16",
                "icon": "common/icons/indicatorCloseLiteRed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCloseState16",
                "icon": "common/icons/indicatorCloseState16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCloud16",
                "icon": "common/icons/indicatorCloud16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCollect16",
                "icon": "common/icons/indicatorCollect16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorComment16",
                "icon": "common/icons/indicatorComment16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorComplete16",
                "icon": "common/icons/indicatorComplete16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorConfirmedNegative16",
                "icon": "common/icons/indicatorConfirmedNegative16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorContainer16",
                "icon": "common/icons/indicatorContainer16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorContainsChange16",
                "icon": "common/icons/indicatorContainsChange16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorContainsChange24",
                "icon": "common/icons/indicatorContainsChange24.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCross16",
                "icon": "common/icons/indicatorCross16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDashed16",
                "icon": "common/icons/indicatorDashed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDefaultSet16",
                "icon": "common/icons/indicatorDefaultSet16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDefectiveObjectCheck16",
                "icon": "common/icons/indicatorDefectiveObjectCheck16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDefectiveObjectEdit16",
                "icon": "common/icons/indicatorDefectiveObjectEdit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDefectiveObjectQuestion16",
                "icon": "common/icons/indicatorDefectiveObjectQuestion16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDefectiveObjectStop16",
                "icon": "common/icons/indicatorDefectiveObjectStop16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDisassemble16",
                "icon": "common/icons/indicatorDisassemble16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorDotted16",
                "icon": "common/icons/indicatorDotted16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorEmptyStar16",
                "icon": "common/icons/indicatorEmptyStar16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorEquipmentSelected16",
                "icon": "common/icons/indicatorEquipmentSelected16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorError16",
                "icon": "common/icons/indicatorError16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorEstimatedQuantity16",
                "icon": "common/icons/indicatorEstimatedQuantity16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorExactlySatisfied16",
                "icon": "common/icons/indicatorExactlySatisfied16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorFavorites16",
                "icon": "common/icons/indicatorFavorites16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorFilledStar16",
                "icon": "common/icons/indicatorFilledStar16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorFreeze16",
                "icon": "common/icons/indicatorFreeze16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorFull16",
                "icon": "common/icons/indicatorFull16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorFutureOld16",
                "icon": "common/icons/indicatorFutureOld16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorGenerated16",
                "icon": "common/icons/indicatorGenerated16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorGreenCircle16",
                "icon": "common/icons/indicatorGreenCircle16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorGreenSquare16",
                "icon": "common/icons/indicatorGreenSquare16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorHiden16",
                "icon": "common/icons/indicatorHiden16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorHold16",
                "icon": "common/icons/indicatorHold16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorHoldFuture16",
                "icon": "common/icons/indicatorHoldFuture16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorHome16",
                "icon": "common/icons/indicatorHome16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorImage16",
                "icon": "common/icons/indicatorImage16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInformationError16",
                "icon": "common/icons/indicatorInformationError16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInformationGeneral16",
                "icon": "common/icons/indicatorInformationGeneral16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInformationSuccess16",
                "icon": "common/icons/indicatorInformationSuccess16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInformationSuccessOutline16",
                "icon": "common/icons/indicatorInformationSuccessOutline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInformationWarning16",
                "icon": "common/icons/indicatorInformationWarning16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInput16",
                "icon": "common/icons/indicatorInput16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInputIntended16",
                "icon": "common/icons/indicatorInputIntended16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorInvestigating16",
                "icon": "common/icons/indicatorInvestigating16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorLaunching16",
                "icon": "common/icons/indicatorLaunching16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorLine16",
                "icon": "common/icons/indicatorLine16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorLineDot16",
                "icon": "common/icons/indicatorLineDot16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorLineDotDot16",
                "icon": "common/icons/indicatorLineDotDot16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorLockedWithIssue16",
                "icon": "common/icons/indicatorLockedWithIssue16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMagic16",
                "icon": "common/icons/indicatorMagic16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMandatory16",
                "icon": "common/icons/indicatorMandatory16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMaximizeValueWithHighLimit16",
                "icon": "common/icons/indicatorMaximizeValueWithHighLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMaximizeValueWithLimits16",
                "icon": "common/icons/indicatorMaximizeValueWithLimits16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMaximizeValueWithLowLimit16",
                "icon": "common/icons/indicatorMaximizeValueWithLowLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMaximizeValueWithoutLimits16",
                "icon": "common/icons/indicatorMaximizeValueWithoutLimits16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMilestoneAvailable16",
                "icon": "common/icons/indicatorMilestoneAvailable16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMilestoneNotAvailable16",
                "icon": "common/icons/indicatorMilestoneNotAvailable16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMinimizeValueWithHighLimit16",
                "icon": "common/icons/indicatorMinimizeValueWithHighLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMinimizeValueWithLimits16",
                "icon": "common/icons/indicatorMinimizeValueWithLimits16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMinimizeValueWithLowLimit16",
                "icon": "common/icons/indicatorMinimizeValueWithLowLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMinimizeValueWithoutLimits16",
                "icon": "common/icons/indicatorMinimizeValueWithoutLimits16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMissingImage16",
                "icon": "common/icons/indicatorMissingImage16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorNoFaultFound16",
                "icon": "common/icons/indicatorNoFaultFound16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorNoiseFactorl16",
                "icon": "common/icons/indicatorNoiseFactorl16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorNotExecuted16",
                "icon": "common/icons/indicatorNotExecuted16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorNotSatisfied16",
                "icon": "common/icons/indicatorNotSatisfied16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOffline16",
                "icon": "common/icons/indicatorOffline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOfflineBooked16",
                "icon": "common/icons/indicatorOfflineBooked16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOfflineOp16",
                "icon": "common/icons/indicatorOfflineOp16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOnline16",
                "icon": "common/icons/indicatorOnline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOpen16",
                "icon": "common/icons/indicatorOpen16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOpenState16",
                "icon": "common/icons/indicatorOpenState16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOperationGroup16",
                "icon": "common/icons/indicatorOperationGroup16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOperationLink16",
                "icon": "common/icons/indicatorOperationLink16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOption16",
                "icon": "common/icons/indicatorOption16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOrangeTriangle16",
                "icon": "common/icons/indicatorOrangeTriangle16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOutput16",
                "icon": "common/icons/indicatorOutput16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOutputIntended16",
                "icon": "common/icons/indicatorOutputIntended16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOutputUnintended16",
                "icon": "common/icons/indicatorOutputUnintended16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOverSatisfied16",
                "icon": "common/icons/indicatorOverSatisfied16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorParameters16",
                "icon": "common/icons/indicatorParameters16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPartEdited16",
                "icon": "common/icons/indicatorPartEdited16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPartFunctionalCode16",
                "icon": "common/icons/indicatorPartFunctionalCode16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPartial16",
                "icon": "common/icons/indicatorPartial16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPending16",
                "icon": "common/icons/indicatorPending16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPlay16",
                "icon": "common/icons/indicatorPlay16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPlayLink16",
                "icon": "common/icons/indicatorPlayLink16.svg"
            },
            {
                "iconType": "",
                "text": "svg IndicatorPreKit16",
                "icon": "common/icons/IndicatorPreKit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPrivate16",
                "icon": "common/icons/indicatorPrivate16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorPropagation16",
                "icon": "common/icons/indicatorPropagation16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorQualityGreenRating16",
                "icon": "common/icons/indicatorQualityGreenRating16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorQualityRedRating16",
                "icon": "common/icons/indicatorQualityRedRating16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorQualityYellowRating16",
                "icon": "common/icons/indicatorQualityYellowRating16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorQuestion16",
                "icon": "common/icons/indicatorQuestion16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorReady16",
                "icon": "common/icons/indicatorReady16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRedCircle16",
                "icon": "common/icons/indicatorRedCircle16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRedLine16",
                "icon": "common/icons/indicatorRedLine16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRedTriangle16",
                "icon": "common/icons/indicatorRedTriangle16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorReject16",
                "icon": "common/icons/indicatorReject16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRejected16",
                "icon": "common/icons/indicatorRejected16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorReleasedValidation16",
                "icon": "common/icons/indicatorReleasedValidation16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRelevantCause16",
                "icon": "common/icons/indicatorRelevantCause16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRemoved16",
                "icon": "common/icons/indicatorRemoved16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRemovedOutline16",
                "icon": "common/icons/indicatorRemovedOutline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRequirement16",
                "icon": "common/icons/indicatorRequirement16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorRhombusGray16",
                "icon": "common/icons/indicatorRhombusGray16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorShortcut16",
                "icon": "common/icons/indicatorShortcut16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusAborted16",
                "icon": "common/icons/indicatorStatusAborted16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusCancelled16",
                "icon": "common/icons/indicatorStatusCancelled16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusCompleted16",
                "icon": "common/icons/indicatorStatusCompleted16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusCreated16",
                "icon": "common/icons/indicatorStatusCreated16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusEdit16",
                "icon": "common/icons/indicatorStatusEdit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusError16",
                "icon": "common/icons/indicatorStatusError16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusFailed16",
                "icon": "common/icons/indicatorStatusFailed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusIgnore16",
                "icon": "common/icons/indicatorStatusIgnore16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusInProgress16",
                "icon": "common/icons/indicatorStatusInProgress16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusMaintenance16",
                "icon": "common/icons/indicatorStatusMaintenance16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusNotReady16",
                "icon": "common/icons/indicatorStatusNotReady16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusPaused16",
                "icon": "common/icons/indicatorStatusPaused16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusReady16",
                "icon": "common/icons/indicatorStatusReady16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusSkipped16",
                "icon": "common/icons/indicatorStatusSkipped16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusStopped16",
                "icon": "common/icons/indicatorStatusStopped16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusSuspended16",
                "icon": "common/icons/indicatorStatusSuspended16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusTrashed16",
                "icon": "common/icons/indicatorStatusTrashed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusUnavailable16",
                "icon": "common/icons/indicatorStatusUnavailable16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStatusUnknown16",
                "icon": "common/icons/indicatorStatusUnknown16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorStopped16",
                "icon": "common/icons/indicatorStopped16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSync16",
                "icon": "common/icons/indicatorSync16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSyncFailed16",
                "icon": "common/icons/indicatorSyncFailed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSyncFailedOutline16",
                "icon": "common/icons/indicatorSyncFailedOutline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSyncStart16",
                "icon": "common/icons/indicatorSyncStart16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSyncSucceeded16",
                "icon": "common/icons/indicatorSyncSucceeded16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSystemDefined16",
                "icon": "common/icons/indicatorSystemDefined16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSystemSelection16",
                "icon": "common/icons/indicatorSystemSelection16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorTraceLink16",
                "icon": "common/icons/indicatorTraceLink16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorTransistor16",
                "icon": "common/icons/indicatorTransistor16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUndefined16",
                "icon": "common/icons/indicatorUndefined16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUndefinedOutline16",
                "icon": "common/icons/indicatorUndefinedOutline16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUndetection16",
                "icon": "common/icons/indicatorUndetection16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUnlock16",
                "icon": "common/icons/indicatorUnlock16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUnpinned16",
                "icon": "common/icons/indicatorUnpinned16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorUser16",
                "icon": "common/icons/indicatorUser16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorValueWithHighLimit16",
                "icon": "common/icons/indicatorValueWithHighLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorValueWithLimits16",
                "icon": "common/icons/indicatorValueWithLimits16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorValueWithLowLimit16",
                "icon": "common/icons/indicatorValueWithLowLimit16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorVoided16",
                "icon": "common/icons/indicatorVoided16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarning16",
                "icon": "common/icons/indicatorWarning16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarningGray16",
                "icon": "common/icons/indicatorWarningGray16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarningTriangleOrange16",
                "icon": "common/icons/indicatorWarningTriangleOrange16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarningTriangleRed16",
                "icon": "common/icons/indicatorWarningTriangleRed16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarningTriangleYellow16",
                "icon": "common/icons/indicatorWarningTriangleYellow16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWarningWhite16",
                "icon": "common/icons/indicatorWarningWhite16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWorkOrderAssigned16",
                "icon": "common/icons/indicatorWorkOrderAssigned16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorWorkOrderAvailable16",
                "icon": "common/icons/indicatorWorkOrderAvailable16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorYellowCircle16",
                "icon": "common/icons/indicatorYellowCircle16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorYellowSquare16",
                "icon": "common/icons/indicatorYellowSquare16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorViewerClickedCursor16",
                "icon": "common/icons/indicatorViewerClickedCursor16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorViewerLocationCursor16",
                "icon": "common/icons/indicatorViewerLocationCursor16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorViewerSnapClickedCursor16",
                "icon": "common/icons/indicatorViewerSnapClickedCursor16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorViewerSnapCursor16",
                "icon": "common/icons/indicatorViewerSnapCursor16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicator3DPrinter16",
                "icon": "common/icons/indicator3DPrinter16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorCheckedIn16",
                "icon": "common/icons/indicatorCheckedIn16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMilestone16",
                "icon": "common/icons/indicatorMilestone16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMoveIn16",
                "icon": "common/icons/indicatorMoveIn16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorMoveOut16",
                "icon": "common/icons/indicatorMoveOut16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorOperation16",
                "icon": "common/icons/indicatorOperation16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorProcess16",
                "icon": "common/icons/indicatorProcess16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorSettings16",
                "icon": "common/icons/indicatorSettings16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorViewer16",
                "icon": "common/icons/indicatorViewer16.svg"
            },
            {
                "iconType": "indicator",
                "text": "svg indicatorShoppingCart16",
                "icon": "common/icons/indicatorShoppingCart16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscBackward24",
                "icon": "common/icons/miscBackward24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronDownDouble24",
                "icon": "common/icons/miscChevronDownDouble24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronLeft24",
                "icon": "common/icons/miscChevronLeft24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronLeftDouble24",
                "icon": "common/icons/miscChevronLeftDouble24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronRight16",
                "icon": "common/icons/miscChevronRight16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronRight24",
                "icon": "common/icons/miscChevronRight24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronRightDouble24",
                "icon": "common/icons/miscChevronRightDouble24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronUp24",
                "icon": "common/icons/miscChevronUp24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscChevronUpDouble24",
                "icon": "common/icons/miscChevronUpDouble24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscCircularProgressIndicator80",
                "icon": "common/icons/miscCircularProgressIndicator80.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscCollapse24",
                "icon": "common/icons/miscCollapse24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscDecrease_uxRefresh12",
                "icon": "common/icons/miscDecrease_uxRefresh12.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscDown24",
                "icon": "common/icons/miscDown24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscDownArrow16",
                "icon": "common/icons/miscDownArrow16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscDownArrowBlack16",
                "icon": "common/icons/miscDownArrowBlack16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscExpand24",
                "icon": "common/icons/miscExpand24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscFilter16",
                "icon": "common/icons/miscFilter16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscForward24",
                "icon": "common/icons/miscForward24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscGoToFirst16",
                "icon": "common/icons/miscGoToFirst16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscGoToFirst24",
                "icon": "common/icons/miscGoToFirst24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscGoToLast16",
                "icon": "common/icons/miscGoToLast16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscGoToLast24",
                "icon": "common/icons/miscGoToLast24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscIncrease_uxRefresh12",
                "icon": "common/icons/miscIncrease_uxRefresh12.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscLeftArrow16",
                "icon": "common/icons/miscLeftArrow16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscMoveToLeftList24",
                "icon": "common/icons/miscMoveToLeftList24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscMoveToRightList24",
                "icon": "common/icons/miscMoveToRightList24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscRightArrow16",
                "icon": "common/icons/miscRightArrow16.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscTimeActivity24",
                "icon": "common/icons/miscTimeActivity24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscUp24",
                "icon": "common/icons/miscUp24.svg"
            },
            {
                "iconType": "misc",
                "text": "svg miscUpArrow16",
                "icon": "common/icons/miscUpArrow16.svg"
            },
            {
                "iconType": "type",
                "text": "svg type3D48",
                "icon": "common/icons/type3D48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductsType48",
                "icon": "common/icons/typeProductsType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeErlangQueues48",
                "icon": "common/icons/typeErlangQueues48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessMonitoring48",
                "icon": "common/icons/typeProcessMonitoring48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRabbitMQMonitoring48",
                "icon": "common/icons/typeRabbitMQMonitoring48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSystemOverallMonitoring48",
                "icon": "common/icons/typeSystemOverallMonitoring48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderInspection48",
                "icon": "common/icons/typeWorkOrderInspection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkMasterInspection48",
                "icon": "common/icons/typeWorkMasterInspection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductsTypeConfiguration48",
                "icon": "common/icons/typeProductsTypeConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationCharacteristicLanding48",
                "icon": "common/icons/typeOperationCharacteristicLanding48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationCharacteristicExecution48",
                "icon": "common/icons/typeOperationCharacteristicExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNotificationConfiguration48",
                "icon": "common/icons/typeNotificationConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDashboardTemplate48",
                "icon": "common/icons/typeDashboardTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInboxConfiguration48",
                "icon": "common/icons/typeInboxConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg type3DPrinter48",
                "icon": "common/icons/type3DPrinter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg type3DPrinterTemplate48",
                "icon": "common/icons/type3DPrinterTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg type5Why48",
                "icon": "common/icons/type5Why48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAccessRule48",
                "icon": "common/icons/typeAccessRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAccount48",
                "icon": "common/icons/typeAccount48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAction48",
                "icon": "common/icons/typeAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionCatalog48",
                "icon": "common/icons/typeActionCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionConfirmationOfEffectiveness48",
                "icon": "common/icons/typeActionConfirmationOfEffectiveness48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionCorrective48",
                "icon": "common/icons/typeActionCorrective48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionDefectImmediate48",
                "icon": "common/icons/typeActionDefectImmediate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionExternalImmediate48",
                "icon": "common/icons/typeActionExternalImmediate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionGroup48",
                "icon": "common/icons/typeActionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionInternalImmediate48",
                "icon": "common/icons/typeActionInternalImmediate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionLongTerm48",
                "icon": "common/icons/typeActionLongTerm48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeActionPriority48",
                "icon": "common/icons/typeActionPriority48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAddFromOrder48",
                "icon": "common/icons/typeAddFromOrder48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAlternativeOperationGroup48",
                "icon": "common/icons/typeAlternativeOperationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAppExtension48",
                "icon": "common/icons/typeAppExtension48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeApplicationLogMaintenance48",
                "icon": "common/icons/typeApplicationLogMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAppManagement48",
                "icon": "common/icons/typeAppManagement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeArcFeature48",
                "icon": "common/icons/typeArcFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeASMConfiguration48",
                "icon": "common/icons/typeASMConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssemblyBrickBom48",
                "icon": "common/icons/typeAssemblyBrickBom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssemblyBricks48",
                "icon": "common/icons/typeAssemblyBricks48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssemblyGroup48",
                "icon": "common/icons/typeAssemblyGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssemblyProbe48",
                "icon": "common/icons/typeAssemblyProbe48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssessmentHints48",
                "icon": "common/icons/typeAssessmentHints48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAssignGroupToRole48",
                "icon": "common/icons/typeAssignGroupToRole48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttach48",
                "icon": "common/icons/typeAttach48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttribute48",
                "icon": "common/icons/typeAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeArrow48",
                "icon": "common/icons/typeAttributeArrow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeCatalog48",
                "icon": "common/icons/typeAttributeCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeEditor48",
                "icon": "common/icons/typeAttributeEditor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeGroup48",
                "icon": "common/icons/typeAttributeGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeGroupRevision48",
                "icon": "common/icons/typeAttributeGroupRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeQuality48",
                "icon": "common/icons/typeAttributeQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeQuestion48",
                "icon": "common/icons/typeAttributeQuestion48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeQuestionFamily48",
                "icon": "common/icons/typeAttributeQuestionFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeQuestionGroup48",
                "icon": "common/icons/typeAttributeQuestionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeReSort48",
                "icon": "common/icons/typeAttributeReSort48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAGV48",
                "icon": "common/icons/typeAGV48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAGVGroupSetting48",
                "icon": "common/icons/typeAGVGroupSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChemicalBalanceCodeScanner48",
                "icon": "common/icons/typeChemicalBalanceCodeScanner48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalBalanceCodeScanner48",
                "icon": "common/icons/typeCpgChemicalBalanceCodeScanner48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalCodeScanner48",
                "icon": "common/icons/typeCpgChemicalCodeScanner48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPIValue48",
                "icon": "common/icons/typeKPIValue48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineActionJustInTime48",
                "icon": "common/icons/typeMachineActionJustInTime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineAutomaticWarehouse48",
                "icon": "common/icons/typeMachineAutomaticWarehouse48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineGroupSetting48",
                "icon": "common/icons/typeMachineGroupSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialStorageUnit48",
                "icon": "common/icons/typeMaterialStorageUnit48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialStorageUnitLevel48",
                "icon": "common/icons/typeMaterialStorageUnitLevel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialStorageUnitSetting48",
                "icon": "common/icons/typeMaterialStorageUnitSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomItemChecklist48",
                "icon": "common/icons/typePartBomItemChecklist48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomItemChecklistSearch48",
                "icon": "common/icons/typePartBomItemChecklistSearch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAttributeSort48",
                "icon": "common/icons/typeAttributeSort48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAudit48",
                "icon": "common/icons/typeAudit48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAuditPlan48",
                "icon": "common/icons/typeAuditPlan48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAuditRuleQuality48",
                "icon": "common/icons/typeAuditRuleQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationAdministration48",
                "icon": "common/icons/typeAutomationAdministration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationChannel48",
                "icon": "common/icons/typeAutomationChannel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationNodeInstance48",
                "icon": "common/icons/typeAutomationNodeInstance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationNodeInstanceExecution48",
                "icon": "common/icons/typeAutomationNodeInstanceExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationNodeTemplate48",
                "icon": "common/icons/typeAutomationNodeTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutomationNodeType48",
                "icon": "common/icons/typeAutomationNodeType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBarChart48",
                "icon": "common/icons/typeBarChart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBarChartConfiguration48",
                "icon": "common/icons/typeBarChartConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBarChartGroup48",
                "icon": "common/icons/typeBarChartGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBarcodeDigitalAsset48",
                "icon": "common/icons/typeBarcodeDigitalAsset48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBarcodeHistory48",
                "icon": "common/icons/typeBarcodeHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBehaviourModelSubSystemGroup48",
                "icon": "common/icons/typeBehaviourModelSubSystemGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBinding48",
                "icon": "common/icons/typeBinding48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBMP48",
                "icon": "common/icons/typeBMP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBof48",
                "icon": "common/icons/typeBof48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBrandTemplate48",
                "icon": "common/icons/typeBrandTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBrick48",
                "icon": "common/icons/typeBrick48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBuffer48",
                "icon": "common/icons/typeBuffer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBufferInstance48",
                "icon": "common/icons/typeBufferInstance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBufferMultiple48",
                "icon": "common/icons/typeBufferMultiple48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBuild48",
                "icon": "common/icons/typeBuild48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBuyOffNotification48",
                "icon": "common/icons/typeBuyOffNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendar48",
                "icon": "common/icons/typeCalendar48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarConfiguration48",
                "icon": "common/icons/typeCalendarConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarEvent48",
                "icon": "common/icons/typeCalendarEvent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarEventConfiguration48",
                "icon": "common/icons/typeCalendarEventConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarEventMaintenance48",
                "icon": "common/icons/typeCalendarEventMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarHoliday48",
                "icon": "common/icons/typeCalendarHoliday48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarHolidayGroup48",
                "icon": "common/icons/typeCalendarHolidayGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarHolidayShift48",
                "icon": "common/icons/typeCalendarHolidayShift48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarHolidayUpdate48",
                "icon": "common/icons/typeCalendarHolidayUpdate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarImported48",
                "icon": "common/icons/typeCalendarImported48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarModification48",
                "icon": "common/icons/typeCalendarModification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarRule48",
                "icon": "common/icons/typeCalendarRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCalendarShift48",
                "icon": "common/icons/typeCalendarShift48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriage48",
                "icon": "common/icons/typeCarriage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriageFamily48",
                "icon": "common/icons/typeCarriageFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriageOffline48",
                "icon": "common/icons/typeCarriageOffline48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriageReport48",
                "icon": "common/icons/typeCarriageReport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriages48",
                "icon": "common/icons/typeCarriages48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriageSection48",
                "icon": "common/icons/typeCarriageSection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCarriageSlot48",
                "icon": "common/icons/typeCarriageSlot48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCause48",
                "icon": "common/icons/typeCause48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCell48",
                "icon": "common/icons/typeCell48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCertificate48",
                "icon": "common/icons/typeCertificate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCertificateCalendarEvent48",
                "icon": "common/icons/typeCertificateCalendarEvent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCertificateGroup48",
                "icon": "common/icons/typeCertificateGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCertificateStatus48",
                "icon": "common/icons/typeCertificateStatus48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChangeConfiguration48",
                "icon": "common/icons/typeChangeConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChangeManagementNotification48",
                "icon": "common/icons/typeChangeManagementNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChangeProposalRevision48",
                "icon": "common/icons/typeChangeProposalRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicGroupAttributive48",
                "icon": "common/icons/typeCharacteristicGroupAttributive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicGroupVariable48",
                "icon": "common/icons/typeCharacteristicGroupVariable48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicGroupVisual48",
                "icon": "common/icons/typeCharacteristicGroupVisual48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicRepresentation48",
                "icon": "common/icons/typeCharacteristicRepresentation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicSpecificationAttributive48",
                "icon": "common/icons/typeCharacteristicSpecificationAttributive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicSpecificationVariable48",
                "icon": "common/icons/typeCharacteristicSpecificationVariable48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicSpecificationVariableSingle48",
                "icon": "common/icons/typeCharacteristicSpecificationVariableSingle48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicSpecificationVisual48",
                "icon": "common/icons/typeCharacteristicSpecificationVisual48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCharacteristicSpecificationVisualDefect48",
                "icon": "common/icons/typeCharacteristicSpecificationVisualDefect48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklist48",
                "icon": "common/icons/typeChecklist48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistCatalog48",
                "icon": "common/icons/typeChecklistCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistMfg48",
                "icon": "common/icons/typeChecklistMfg48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistMfgQuestion48",
                "icon": "common/icons/typeChecklistMfgQuestion48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistQuality48",
                "icon": "common/icons/typeChecklistQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistQualityTemplate48",
                "icon": "common/icons/typeChecklistQualityTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistQuestion48",
                "icon": "common/icons/typeChecklistQuestion48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistTemplate48",
                "icon": "common/icons/typeChecklistTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistUsers48",
                "icon": "common/icons/typeChecklistUsers48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChemicalBalance48",
                "icon": "common/icons/typeChemicalBalance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChemicalBalanceConfiguration48",
                "icon": "common/icons/typeChemicalBalanceConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeClassificationElement48",
                "icon": "common/icons/typeClassificationElement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeClientGateway48",
                "icon": "common/icons/typeClientGateway48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCLMAdapter48",
                "icon": "common/icons/typeCLMAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCodeScanner48",
                "icon": "common/icons/typeCodeScanner48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCommands48",
                "icon": "common/icons/typeCommands48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCommandsGroup48",
                "icon": "common/icons/typeCommandsGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeComponentAP48",
                "icon": "common/icons/typeComponentAP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeComponentCAD48",
                "icon": "common/icons/typeComponentCAD48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeComponentVPL48",
                "icon": "common/icons/typeComponentVPL48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeComputer48",
                "icon": "common/icons/typeComputer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeConcept48",
                "icon": "common/icons/typeConcept48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeConfiguratorContext48",
                "icon": "common/icons/typeConfiguratorContext48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeConnectionRevision48",
                "icon": "common/icons/typeConnectionRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeConnectionsDataset48",
                "icon": "common/icons/typeConnectionsDataset48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainer48",
                "icon": "common/icons/typeContainer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainerAttribute48",
                "icon": "common/icons/typeContainerAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainerAttributeQuestion48",
                "icon": "common/icons/typeContainerAttributeQuestion48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainerDimension48",
                "icon": "common/icons/typeContainerDimension48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainerFamily48",
                "icon": "common/icons/typeContainerFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeContainerGroup48",
                "icon": "common/icons/typeContainerGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlInspectionPlan48",
                "icon": "common/icons/typeControlInspectionPlan48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlMethod48",
                "icon": "common/icons/typeControlMethod48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlPlan48",
                "icon": "common/icons/typeControlPlan48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlPlanGroup48",
                "icon": "common/icons/typeControlPlanGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlPlanSetting48",
                "icon": "common/icons/typeControlPlanSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeControlPlanType48",
                "icon": "common/icons/typeControlPlanType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCostCenter48",
                "icon": "common/icons/typeCostCenter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCountry48",
                "icon": "common/icons/typeCountry48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemical48",
                "icon": "common/icons/typeCpgChemical48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalConfiguration48",
                "icon": "common/icons/typeCpgChemicalConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalPause48",
                "icon": "common/icons/typeCpgChemicalPause48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalSplit48",
                "icon": "common/icons/typeCpgChemicalSplit48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgChemicalTemplate48",
                "icon": "common/icons/typeCpgChemicalTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCpgFinishedProduct48",
                "icon": "common/icons/typeCpgFinishedProduct48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCriteriaExchange48",
                "icon": "common/icons/typeCriteriaExchange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeCriteriaExternal48",
                "icon": "common/icons/typeCriteriaExternal48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabase48",
                "icon": "common/icons/typeDatabase48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseAdapter48",
                "icon": "common/icons/typeDatabaseAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseArchive48",
                "icon": "common/icons/typeDatabaseArchive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseCleaning48",
                "icon": "common/icons/typeDatabaseCleaning48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataBaseCleaningSetting48",
                "icon": "common/icons/typeDataBaseCleaningSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseSearch48",
                "icon": "common/icons/typeDatabaseSearch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseView48",
                "icon": "common/icons/typeDatabaseView48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDatabaseViewGroup48",
                "icon": "common/icons/typeDatabaseViewGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataCollection48",
                "icon": "common/icons/typeDataCollection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataCollectionDatumPoint48",
                "icon": "common/icons/typeDataCollectionDatumPoint48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataCollectionDefinition48",
                "icon": "common/icons/typeDataCollectionDefinition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataCollectionFilter48",
                "icon": "common/icons/typeDataCollectionFilter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataCollectionLimits48",
                "icon": "common/icons/typeDataCollectionLimits48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDataHandler48",
                "icon": "common/icons/typeDataHandler48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDefectActionRepairGroup48",
                "icon": "common/icons/typeDefectActionRepairGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDefectCosts48",
                "icon": "common/icons/typeDefectCosts48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDefectiveObject48",
                "icon": "common/icons/typeDefectiveObject48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDefectiveObjectGroup48",
                "icon": "common/icons/typeDefectiveObjectGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDefectiveObjectLimits48",
                "icon": "common/icons/typeDefectiveObjectLimits48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManualOperation48",
                "icon": "common/icons/typeManualOperation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManualOperationOpen48",
                "icon": "common/icons/typeManualOperationOpen48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDepartment48",
                "icon": "common/icons/typeDepartment48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDependency48",
                "icon": "common/icons/typeDependency48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDetectionAction48",
                "icon": "common/icons/typeDetectionAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDetectionActionCatalog48",
                "icon": "common/icons/typeDetectionActionCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDevice48",
                "icon": "common/icons/typeDevice48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDeviceFamily48",
                "icon": "common/icons/typeDeviceFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDeviceGroup48",
                "icon": "common/icons/typeDeviceGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDeviceIdentifier48",
                "icon": "common/icons/typeDeviceIdentifier48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDeviceQRCode48",
                "icon": "common/icons/typeDeviceQRCode48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDiagram48",
                "icon": "common/icons/typeDiagram48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDispatchRule48",
                "icon": "common/icons/typeDispatchRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDnc48",
                "icon": "common/icons/typeDnc48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDNCInvalid48",
                "icon": "common/icons/typeDNCInvalid48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDocumentArchive48",
                "icon": "common/icons/typeDocumentArchive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDocumentParameters48",
                "icon": "common/icons/typeDocumentParameters48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDocumentRevision48",
                "icon": "common/icons/typeDocumentRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDocumentSection48",
                "icon": "common/icons/typeDocumentSection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDocumentViewer48",
                "icon": "common/icons/typeDocumentViewer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEditPosition48",
                "icon": "common/icons/typeEditPosition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElectronicSignature48",
                "icon": "common/icons/typeElectronicSignature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElectronicSignatureItem48",
                "icon": "common/icons/typeElectronicSignatureItem48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElectronicSignatureTemplate48",
                "icon": "common/icons/typeElectronicSignatureTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElement48",
                "icon": "common/icons/typeElement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElementFunction48",
                "icon": "common/icons/typeElementFunction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElementIssue48",
                "icon": "common/icons/typeElementIssue48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElements48",
                "icon": "common/icons/typeElements48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElementTag48",
                "icon": "common/icons/typeElementTag48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElementTemplate48",
                "icon": "common/icons/typeElementTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEnterprise48",
                "icon": "common/icons/typeEnterprise48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEnterpriseGroup48",
                "icon": "common/icons/typeEnterpriseGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEntityExtention48",
                "icon": "common/icons/typeEntityExtention48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEntitySource48",
                "icon": "common/icons/typeEntitySource48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEnvironment48",
                "icon": "common/icons/typeEnvironment48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentExecution48",
                "icon": "common/icons/typeEquipmentExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentLevel48",
                "icon": "common/icons/typeEquipmentLevel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentRuntime48",
                "icon": "common/icons/typeEquipmentRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentUser48",
                "icon": "common/icons/typeEquipmentUser48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentWithOEE48",
                "icon": "common/icons/typeEquipmentWithOEE48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeERPOrderToBeSchedule48",
                "icon": "common/icons/typeERPOrderToBeSchedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeERPOrderToBeScheduled48",
                "icon": "common/icons/typeERPOrderToBeScheduled48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeERPOrderUnschedule48",
                "icon": "common/icons/typeERPOrderUnschedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEvaluation48",
                "icon": "common/icons/typeEvaluation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEventHandler48",
                "icon": "common/icons/typeEventHandler48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEventSignal48",
                "icon": "common/icons/typeEventSignal48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEventSignalHistory48",
                "icon": "common/icons/typeEventSignalHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEWI48",
                "icon": "common/icons/typeEWI48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEwiExecution48",
                "icon": "common/icons/typeEwiExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEWIGroup48",
                "icon": "common/icons/typeEWIGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEWITemplate48",
                "icon": "common/icons/typeEWITemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeExamine48",
                "icon": "common/icons/typeExamine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeExamineConfiguration48",
                "icon": "common/icons/typeExamineConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeExe48",
                "icon": "common/icons/typeExe48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeExecGroup48",
                "icon": "common/icons/typeExecGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeExternalNotification48",
                "icon": "common/icons/typeExternalNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFailureNotification48",
                "icon": "common/icons/typeFailureNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeature48",
                "icon": "common/icons/typeFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeatureOption48",
                "icon": "common/icons/typeFeatureOption48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederCarriage48",
                "icon": "common/icons/typeFeederCarriage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederChecklist48",
                "icon": "common/icons/typeFeederChecklist48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederFamily48",
                "icon": "common/icons/typeFeederFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederGroup48",
                "icon": "common/icons/typeFeederGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederLabel48",
                "icon": "common/icons/typeFeederLabel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederTapeFamily48",
                "icon": "common/icons/typeFeederTapeFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFeederTapeGroup48",
                "icon": "common/icons/typeFeederTapeGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFile48",
                "icon": "common/icons/typeFile48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFileAdapter48",
                "icon": "common/icons/typeFileAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFilter48",
                "icon": "common/icons/typeFilter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFilterConfiguration48",
                "icon": "common/icons/typeFilterConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFilterTag48",
                "icon": "common/icons/typeFilterTag48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFlatFileAdapter48",
                "icon": "common/icons/typeFlatFileAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFlow48",
                "icon": "common/icons/typeFlow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEADifferenceSummary48",
                "icon": "common/icons/typeFMEADifferenceSummary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureAction48",
                "icon": "common/icons/typeFMEAFailureAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureActionGroup48",
                "icon": "common/icons/typeFMEAFailureActionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureInProgress48",
                "icon": "common/icons/typeFMEAFailureInProgress48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureLibrary48",
                "icon": "common/icons/typeFMEAFailureLibrary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureLibraryCatalog48",
                "icon": "common/icons/typeFMEAFailureLibraryCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureLimits48",
                "icon": "common/icons/typeFMEAFailureLimits48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureList48",
                "icon": "common/icons/typeFMEAFailureList48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureLocation48",
                "icon": "common/icons/typeFMEAFailureLocation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailurePosition48",
                "icon": "common/icons/typeFMEAFailurePosition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureRepresentation48",
                "icon": "common/icons/typeFMEAFailureRepresentation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureRepresentationCatalog48",
                "icon": "common/icons/typeFMEAFailureRepresentationCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureRepresentationGroup48",
                "icon": "common/icons/typeFMEAFailureRepresentationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureRule48",
                "icon": "common/icons/typeFMEAFailureRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureSpecification48",
                "icon": "common/icons/typeFMEAFailureSpecification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFailureSpecificationGroup48",
                "icon": "common/icons/typeFMEAFailureSpecificationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFunctionFailure48",
                "icon": "common/icons/typeFMEAFunctionFailure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFunctionRepresentation48",
                "icon": "common/icons/typeFMEAFunctionRepresentation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAFunctionSpecification48",
                "icon": "common/icons/typeFMEAFunctionSpecification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAProject48",
                "icon": "common/icons/typeFMEAProject48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEARootObject48",
                "icon": "common/icons/typeFMEARootObject48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEASystemElementRepresentation48",
                "icon": "common/icons/typeFMEASystemElementRepresentation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEASystemElementSpecification48",
                "icon": "common/icons/typeFMEASystemElementSpecification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFMEAType48",
                "icon": "common/icons/typeFMEAType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFormTaskConfiguration48",
                "icon": "common/icons/typeFormTaskConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFormTaskTemplate48",
                "icon": "common/icons/typeFormTaskTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFrequency48",
                "icon": "common/icons/typeFrequency48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionalArea48",
                "icon": "common/icons/typeFunctionalArea48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionalityExpression48",
                "icon": "common/icons/typeFunctionalityExpression48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionalityRevision48",
                "icon": "common/icons/typeFunctionalityRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionCatalog48",
                "icon": "common/icons/typeFunctionCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionGroup48",
                "icon": "common/icons/typeFunctionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFunctionRepresentationGroup48",
                "icon": "common/icons/typeFunctionRepresentationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGageManagement48",
                "icon": "common/icons/typeGageManagement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGanttMultipleTimeSlice48",
                "icon": "common/icons/typeGanttMultipleTimeSlice48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGanttTimeSlice48",
                "icon": "common/icons/typeGanttTimeSlice48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGenealogy48",
                "icon": "common/icons/typeGenealogy48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGeneral48",
                "icon": "common/icons/typeGeneral48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGenericParts48",
                "icon": "common/icons/typeGenericParts48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGenericSoftwareComponent48",
                "icon": "common/icons/typeGenericSoftwareComponent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGif48",
                "icon": "common/icons/typeGif48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraph48",
                "icon": "common/icons/typeGraph48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraphConnectionRevision48",
                "icon": "common/icons/typeGraphConnectionRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraphForm48",
                "icon": "common/icons/typeGraphForm48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraphGroup48",
                "icon": "common/icons/typeGraphGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraphStandardNoteRevision48",
                "icon": "common/icons/typeGraphStandardNoteRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGraphTag48",
                "icon": "common/icons/typeGraphTag48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGroupAttributeCross48",
                "icon": "common/icons/typeGroupAttributeCross48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGroupMessage48",
                "icon": "common/icons/typeGroupMessage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHandlingUnit48",
                "icon": "common/icons/typeHandlingUnit48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHighAutomation48",
                "icon": "common/icons/typeHighAutomation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHighAvailabilityGroup48",
                "icon": "common/icons/typeHighAvailabilityGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHistory48",
                "icon": "common/icons/typeHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHold48",
                "icon": "common/icons/typeHold48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHoldFailure48",
                "icon": "common/icons/typeHoldFailure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHoldFuture48",
                "icon": "common/icons/typeHoldFuture48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHoldMaintenance48",
                "icon": "common/icons/typeHoldMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHtml48",
                "icon": "common/icons/typeHtml48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeHumanHistory48",
                "icon": "common/icons/typeHumanHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeIdentifierFormat48",
                "icon": "common/icons/typeIdentifierFormat48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeImportExportAdministration48",
                "icon": "common/icons/typeImportExportAdministration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInbox48",
                "icon": "common/icons/typeInbox48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeIncident48",
                "icon": "common/icons/typeIncident48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeIncomingGoods48",
                "icon": "common/icons/typeIncomingGoods48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInfo48",
                "icon": "common/icons/typeInfo48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInfoRevision48",
                "icon": "common/icons/typeInfoRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInstall48",
                "icon": "common/icons/typeInstall48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInterfaceType48",
                "icon": "common/icons/typeInterfaceType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInterlockingCheck48",
                "icon": "common/icons/typeInterlockingCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInterlockingCheckHistory48",
                "icon": "common/icons/typeInterlockingCheckHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInterlockingCheckParameters48",
                "icon": "common/icons/typeInterlockingCheckParameters48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInteroperabilityConfiguration48",
                "icon": "common/icons/typeInteroperabilityConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInteroperabilityMessage48",
                "icon": "common/icons/typeInteroperabilityMessage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInteroperabilityQuery48",
                "icon": "common/icons/typeInteroperabilityQuery48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInteroperabilityTemplate48",
                "icon": "common/icons/typeInteroperabilityTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeInteroperabilityTopic48",
                "icon": "common/icons/typeInteroperabilityTopic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeIshikawa48",
                "icon": "common/icons/typeIshikawa48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeJpg48",
                "icon": "common/icons/typeJpg48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKitPreparation48",
                "icon": "common/icons/typeKitPreparation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKitRequest48",
                "icon": "common/icons/typeKitRequest48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPI48",
                "icon": "common/icons/typeKPI48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPIAssociate48",
                "icon": "common/icons/typeKPIAssociate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPIEvent48",
                "icon": "common/icons/typeKPIEvent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPIFilter48",
                "icon": "common/icons/typeKPIFilter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPIGroup48",
                "icon": "common/icons/typeKPIGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeKPISchedule48",
                "icon": "common/icons/typeKPISchedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelBrand48",
                "icon": "common/icons/typeLabelBrand48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelParameter48",
                "icon": "common/icons/typeLabelParameter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelPrinter48",
                "icon": "common/icons/typeLabelPrinter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelPrinterDefinition48",
                "icon": "common/icons/typeLabelPrinterDefinition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelPrintingHistory48",
                "icon": "common/icons/typeLabelPrintingHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLabelRevisionGroup48",
                "icon": "common/icons/typeLabelRevisionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLanguage48",
                "icon": "common/icons/typeLanguage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLibrary48",
                "icon": "common/icons/typeLibrary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLineage48",
                "icon": "common/icons/typeLineage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLineFeature48",
                "icon": "common/icons/typeLineFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLineMaintenance48",
                "icon": "common/icons/typeLineMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLineType48",
                "icon": "common/icons/typeLineType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLinkNode48",
                "icon": "common/icons/typeLinkNode48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLocation48",
                "icon": "common/icons/typeLocation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLogEntry48",
                "icon": "common/icons/typeLogEntry48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLogisticClasses48",
                "icon": "common/icons/typeLogisticClasses48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLogisticRequest48",
                "icon": "common/icons/typeLogisticRequest48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLogisticRequestNotification48",
                "icon": "common/icons/typeLogisticRequestNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachine48",
                "icon": "common/icons/typeMachine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineAttribute48",
                "icon": "common/icons/typeMachineAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineCatalog48",
                "icon": "common/icons/typeMachineCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineCause48",
                "icon": "common/icons/typeMachineCause48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineChemical48",
                "icon": "common/icons/typeMachineChemical48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineConfiguration48",
                "icon": "common/icons/typeMachineConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineEvaluation48",
                "icon": "common/icons/typeMachineEvaluation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineFailure48",
                "icon": "common/icons/typeMachineFailure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineFamily48",
                "icon": "common/icons/typeMachineFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineFlow48",
                "icon": "common/icons/typeMachineFlow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineForm48",
                "icon": "common/icons/typeMachineForm48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineGroup48",
                "icon": "common/icons/typeMachineGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineLink48",
                "icon": "common/icons/typeMachineLink48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineParameter48",
                "icon": "common/icons/typeMachineParameter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachinePart48",
                "icon": "common/icons/typeMachinePart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachinePartBom48",
                "icon": "common/icons/typeMachinePartBom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineRating48",
                "icon": "common/icons/typeMachineRating48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachinery48",
                "icon": "common/icons/typeMachinery48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryLine48",
                "icon": "common/icons/typeMachineryLine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryLineDisabled48",
                "icon": "common/icons/typeMachineryLineDisabled48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryLineGroup48",
                "icon": "common/icons/typeMachineryLineGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStation48",
                "icon": "common/icons/typeMachineryStation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStationImported48",
                "icon": "common/icons/typeMachineryStationImported48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStationsCombined48",
                "icon": "common/icons/typeMachineryStationsCombined48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryVendor48",
                "icon": "common/icons/typeMachineryVendor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineState48",
                "icon": "common/icons/typeMachineState48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineStatus48",
                "icon": "common/icons/typeMachineStatus48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineStatusCodes48",
                "icon": "common/icons/typeMachineStatusCodes48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineTaskTool48",
                "icon": "common/icons/typeMachineTaskTool48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineWorkflow48",
                "icon": "common/icons/typeMachineWorkflow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineWorkflowProcess48",
                "icon": "common/icons/typeMachineWorkflowProcess48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineExecution48",
                "icon": "common/icons/typeMachineExecution48.svg"
            },

            {
                "iconType": "type",
                "text": "svg typeMail48",
                "icon": "common/icons/typeMail48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMainControl48",
                "icon": "common/icons/typeMainControl48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManagementCounter48",
                "icon": "common/icons/typeManagementCounter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManufacturerAttributive48",
                "icon": "common/icons/typeManufacturerAttributive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManufacturerExchange48",
                "icon": "common/icons/typeManufacturerExchange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManufacturerFrom48",
                "icon": "common/icons/typeManufacturerFrom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManufacturerProduct48",
                "icon": "common/icons/typeManufacturerProduct48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeManufacturerTo48",
                "icon": "common/icons/typeManufacturerTo48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterial48",
                "icon": "common/icons/typeMaterial48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialBom48",
                "icon": "common/icons/typeMaterialBom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialBomItem48",
                "icon": "common/icons/typeMaterialBomItem48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialEngineering48",
                "icon": "common/icons/typeMaterialEngineering48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialExecution48",
                "icon": "common/icons/typeMaterialExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialExecutionTemplate48",
                "icon": "common/icons/typeMaterialExecutionTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialGroup48",
                "icon": "common/icons/typeMaterialGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialGroupEngineering48",
                "icon": "common/icons/typeMaterialGroupEngineering48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialLot48",
                "icon": "common/icons/typeMaterialLot48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialLotExecutionTemplate48",
                "icon": "common/icons/typeMaterialLotExecutionTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialLotRuntime48",
                "icon": "common/icons/typeMaterialLotRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialLotTemplateRuntime48",
                "icon": "common/icons/typeMaterialLotTemplateRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialMigration48",
                "icon": "common/icons/typeMaterialMigration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialStorage48",
                "icon": "common/icons/typeMaterialStorage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialTemplate48",
                "icon": "common/icons/typeMaterialTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMaterialTemplateEngineering48",
                "icon": "common/icons/typeMaterialTemplateEngineering48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMatrix48",
                "icon": "common/icons/typeMatrix48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMeasurableAttribute48",
                "icon": "common/icons/typeMeasurableAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMeasurableAttributeGroup48",
                "icon": "common/icons/typeMeasurableAttributeGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMeasure48",
                "icon": "common/icons/typeMeasure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMenuConfiguration48",
                "icon": "common/icons/typeMenuConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMenuConfigurationRestore48",
                "icon": "common/icons/typeMenuConfigurationRestore48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessage48",
                "icon": "common/icons/typeMessage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageBuffer48",
                "icon": "common/icons/typeMessageBuffer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageChannel48",
                "icon": "common/icons/typeMessageChannel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageDistributionList48",
                "icon": "common/icons/typeMessageDistributionList48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageReceiver48",
                "icon": "common/icons/typeMessageReceiver48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageSMTP48",
                "icon": "common/icons/typeMessageSMTP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageTag48",
                "icon": "common/icons/typeMessageTag48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageTagClient48",
                "icon": "common/icons/typeMessageTagClient48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMessageType48",
                "icon": "common/icons/typeMessageType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMilestone48",
                "icon": "common/icons/typeMilestone48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMilestoneCatalog48",
                "icon": "common/icons/typeMilestoneCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMilestoneTransition48",
                "icon": "common/icons/typeMilestoneTransition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMissingImage48",
                "icon": "common/icons/typeMissingImage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeModelExtention48",
                "icon": "common/icons/typeModelExtention48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMOMAdapter48",
                "icon": "common/icons/typeMOMAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMoveFromEquipment48",
                "icon": "common/icons/typeMoveFromEquipment48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMp448",
                "icon": "common/icons/typeMp448.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMsExcel48",
                "icon": "common/icons/typeMsExcel48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMSMQAdapter48",
                "icon": "common/icons/typeMSMQAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMsPowerpoint48",
                "icon": "common/icons/typeMsPowerpoint48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMsWord48",
                "icon": "common/icons/typeMsWord48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMTUAggregateRuntime48",
                "icon": "common/icons/typeMTUAggregateRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMTUAggregateTemplateRuntime48",
                "icon": "common/icons/typeMTUAggregateTemplateRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMTURuntime48",
                "icon": "common/icons/typeMTURuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMTUTemplateRuntime48",
                "icon": "common/icons/typeMTUTemplateRuntime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformance48",
                "icon": "common/icons/typeNonConformance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceBuyOff48",
                "icon": "common/icons/typeNonConformanceBuyOff48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceCause48",
                "icon": "common/icons/typeNonConformanceCause48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceCauseGroup48",
                "icon": "common/icons/typeNonConformanceCauseGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceChangeManagement48",
                "icon": "common/icons/typeNonConformanceChangeManagement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceControl48",
                "icon": "common/icons/typeNonConformanceControl48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceControlGroup48",
                "icon": "common/icons/typeNonConformanceControlGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceFailure48",
                "icon": "common/icons/typeNonConformanceFailure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceFailureGroup48",
                "icon": "common/icons/typeNonConformanceFailureGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceLifecycle48",
                "icon": "common/icons/typeNonConformanceLifecycle48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceMaintenance48",
                "icon": "common/icons/typeNonConformanceMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceNotification48",
                "icon": "common/icons/typeNonConformanceNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceQuality48",
                "icon": "common/icons/typeNonConformanceQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNonConformanceTravelling48",
                "icon": "common/icons/typeNonConformanceTravelling48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNotProductiveActivity48",
                "icon": "common/icons/typeNotProductiveActivity48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNPIAdapter48",
                "icon": "common/icons/typeNPIAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNumberingPattern48",
                "icon": "common/icons/typeNumberingPattern48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNumberingPatternSection48",
                "icon": "common/icons/typeNumberingPatternSection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOfflineSession48",
                "icon": "common/icons/typeOfflineSession48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOneAvailability48",
                "icon": "common/icons/typeOneAvailability48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOPCUAAdapter48",
                "icon": "common/icons/typeOPCUAAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationCatalog48",
                "icon": "common/icons/typeOperationCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationCharacteristic48",
                "icon": "common/icons/typeOperationCharacteristic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationMachine48",
                "icon": "common/icons/typeOperationMachine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationMfg48",
                "icon": "common/icons/typeOperationMfg48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationStepCategory48",
                "icon": "common/icons/typeOperationStepCategory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationWorkMaster48",
                "icon": "common/icons/typeOperationWorkMaster48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperatorLanding48",
                "icon": "common/icons/typeOperatorLanding48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOptionValueAdd48",
                "icon": "common/icons/typeOptionValueAdd48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOrder48",
                "icon": "common/icons/typeOrder48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOutgoingGoods48",
                "icon": "common/icons/typeOutgoingGoods48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOwner48",
                "icon": "common/icons/typeOwner48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePackageGroup48",
                "icon": "common/icons/typePackageGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePackageTemplate48",
                "icon": "common/icons/typePackageTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePadFeature48",
                "icon": "common/icons/typePadFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePanelLayout48",
                "icon": "common/icons/typePanelLayout48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePanelLayoutGroup48",
                "icon": "common/icons/typePanelLayoutGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePanelLayoutProjects48",
                "icon": "common/icons/typePanelLayoutProjects48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePanelProject48",
                "icon": "common/icons/typePanelProject48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParameter48",
                "icon": "common/icons/typeParameter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParameterCatalog48",
                "icon": "common/icons/typeParameterCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParameterGroupConfiguration48",
                "icon": "common/icons/typeParameterGroupConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParametersConfiguration48",
                "icon": "common/icons/typeParametersConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParentBatch48",
                "icon": "common/icons/typeParentBatch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartAggregate48",
                "icon": "common/icons/typePartAggregate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartAggregateTemplate48",
                "icon": "common/icons/typePartAggregateTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBom48",
                "icon": "common/icons/typePartBom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomERP48",
                "icon": "common/icons/typePartBomERP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomItem48",
                "icon": "common/icons/typePartBomItem48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomProductionRule48",
                "icon": "common/icons/typePartBomProductionRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartBomTemplate48",
                "icon": "common/icons/typePartBomTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartExecution48",
                "icon": "common/icons/typePartExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartExecutionLink48",
                "icon": "common/icons/typePartExecutionLink48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartExecutionStatusCodes48",
                "icon": "common/icons/typePartExecutionStatusCodes48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartExecutionTemplate48",
                "icon": "common/icons/typePartExecutionTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartFunctionalCodes48",
                "icon": "common/icons/typePartFunctionalCodes48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartGroup48",
                "icon": "common/icons/typePartGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartLot48",
                "icon": "common/icons/typePartLot48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartLotTemplate48",
                "icon": "common/icons/typePartLotTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartOut48",
                "icon": "common/icons/typePartOut48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartOutExecution48",
                "icon": "common/icons/typePartOutExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartPhantom48",
                "icon": "common/icons/typePartPhantom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartProductionRule48",
                "icon": "common/icons/typePartProductionRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartProductionRuleGroup48",
                "icon": "common/icons/typePartProductionRuleGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartRevision48",
                "icon": "common/icons/typePartRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartRevisionConfiguration48",
                "icon": "common/icons/typePartRevisionConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartRevisionReport48",
                "icon": "common/icons/typePartRevisionReport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartRevisionView48",
                "icon": "common/icons/typePartRevisionView48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartStorage48",
                "icon": "common/icons/typePartStorage48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartStorageExecution48",
                "icon": "common/icons/typePartStorageExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePartTemplate48",
                "icon": "common/icons/typePartTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePauseReason48",
                "icon": "common/icons/typePauseReason48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePdf48",
                "icon": "common/icons/typePdf48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePencilSquare48",
                "icon": "common/icons/typePencilSquare48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePeople48",
                "icon": "common/icons/typePeople48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePerson48",
                "icon": "common/icons/typePerson48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePhysicalLocationConfiguration48",
                "icon": "common/icons/typePhysicalLocationConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePieChart48",
                "icon": "common/icons/typePieChart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePieMenu48",
                "icon": "common/icons/typePieMenu48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlantRevision48",
                "icon": "common/icons/typePlantRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlantRevisionFlow48",
                "icon": "common/icons/typePlantRevisionFlow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlantRevisionGroup48",
                "icon": "common/icons/typePlantRevisionGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlantRevisionTemplate48",
                "icon": "common/icons/typePlantRevisionTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlate48",
                "icon": "common/icons/typePlate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlateWell48",
                "icon": "common/icons/typePlateWell48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlateWellConfiguration48",
                "icon": "common/icons/typePlateWellConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePlugin48",
                "icon": "common/icons/typePlugin48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePluginTemplate48",
                "icon": "common/icons/typePluginTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePng48",
                "icon": "common/icons/typePng48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePortView48",
                "icon": "common/icons/typePortView48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePostAction48",
                "icon": "common/icons/typePostAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePowder48",
                "icon": "common/icons/typePowder48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePowderBatch48",
                "icon": "common/icons/typePowderBatch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePowderMixing48",
                "icon": "common/icons/typePowderMixing48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePowderRecycle48",
                "icon": "common/icons/typePowderRecycle48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePreventionalAction48",
                "icon": "common/icons/typePreventionalAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePreventionalActionCatalog48",
                "icon": "common/icons/typePreventionalActionCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePricebook48",
                "icon": "common/icons/typePricebook48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrinterConfiguration48",
                "icon": "common/icons/typePrinterConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrinterConnectionConfiguration48",
                "icon": "common/icons/typePrinterConnectionConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrinterData48",
                "icon": "common/icons/typePrinterData48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrinterSetting48",
                "icon": "common/icons/typePrinterSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrinterTypeConfiguration48",
                "icon": "common/icons/typePrinterTypeConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrintingTypeConfiguration48",
                "icon": "common/icons/typePrintingTypeConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrintJobFile48",
                "icon": "common/icons/typePrintJobFile48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrintJobFileTask48",
                "icon": "common/icons/typePrintJobFileTask48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePrintJobFileTaskExecution48",
                "icon": "common/icons/typePrintJobFileTaskExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePriority48",
                "icon": "common/icons/typePriority48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcess48",
                "icon": "common/icons/typeProcess48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessActionCatalog48",
                "icon": "common/icons/typeProcessActionCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessCatalog48",
                "icon": "common/icons/typeProcessCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessData48",
                "icon": "common/icons/typeProcessData48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessNotification48",
                "icon": "common/icons/typeProcessNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessProductionRule48",
                "icon": "common/icons/typeProcessProductionRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProcessResourceReport48",
                "icon": "common/icons/typeProcessResourceReport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductConversion48",
                "icon": "common/icons/typeProductConversion48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionContext48",
                "icon": "common/icons/typeProductionContext48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionCoordinatorDashboard48",
                "icon": "common/icons/typeProductionCoordinatorDashboard48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionCoordinatorTimeUpdate48",
                "icon": "common/icons/typeProductionCoordinatorTimeUpdate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionLine48",
                "icon": "common/icons/typeProductionLine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionLineCharacteristic48",
                "icon": "common/icons/typeProductionLineCharacteristic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionLineMaintenance48",
                "icon": "common/icons/typeProductionLineMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductionRecordsHistory48",
                "icon": "common/icons/typeProductionRecordsHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductModelRevision48",
                "icon": "common/icons/typeProductModelRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductModelRevisionAttributeArrow48",
                "icon": "common/icons/typeProductModelRevisionAttributeArrow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductModelRevisionAttributeTag48",
                "icon": "common/icons/typeProductModelRevisionAttributeTag48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductModelRevisionFamily48",
                "icon": "common/icons/typeProductModelRevisionFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductType48",
                "icon": "common/icons/typeProductType48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeComponents48",
                "icon": "common/icons/typeProductTypeComponents48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeConfiguration48",
                "icon": "common/icons/typeProductTypeConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeFeature48",
                "icon": "common/icons/typeProductTypeFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeFeatureList48",
                "icon": "common/icons/typeProductTypeFeatureList48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeOption48",
                "icon": "common/icons/typeProductTypeOption48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProductTypeOptionList48",
                "icon": "common/icons/typeProductTypeOptionList48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProject48",
                "icon": "common/icons/typeProject48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProjectCatalog48",
                "icon": "common/icons/typeProjectCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePSCViolation48",
                "icon": "common/icons/typePSCViolation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePublishedDashboard48",
                "icon": "common/icons/typePublishedDashboard48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityAction48",
                "icon": "common/icons/typeQualityAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityActionExecution48",
                "icon": "common/icons/typeQualityActionExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityAudit48",
                "icon": "common/icons/typeQualityAudit48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityChecklist48",
                "icon": "common/icons/typeQualityChecklist48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityChecklistTemplate48",
                "icon": "common/icons/typeQualityChecklistTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityLimits48",
                "icon": "common/icons/typeQualityLimits48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityLogBook48",
                "icon": "common/icons/typeQualityLogBook48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityMasterData48",
                "icon": "common/icons/typeQualityMasterData48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityNotification48",
                "icon": "common/icons/typeQualityNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualitySubRating48",
                "icon": "common/icons/typeQualitySubRating48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQualityTestProcedureStepsRevision48",
                "icon": "common/icons/typeQualityTestProcedureStepsRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQueryDataBase48",
                "icon": "common/icons/typeQueryDataBase48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQuestionMark48",
                "icon": "common/icons/typeQuestionMark48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeQuestionMarkGroup48",
                "icon": "common/icons/typeQuestionMarkGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRawMaterialGenealogy48",
                "icon": "common/icons/typeRawMaterialGenealogy48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReason48",
                "icon": "common/icons/typeReason48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReferenceInput48",
                "icon": "common/icons/typeReferenceInput48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReferenceOutput48",
                "icon": "common/icons/typeReferenceOutput48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReportDefinition48",
                "icon": "common/icons/typeReportDefinition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReportingTool48",
                "icon": "common/icons/typeReportingTool48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRequirementCatalog48",
                "icon": "common/icons/typeRequirementCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRequirementGroup48",
                "icon": "common/icons/typeRequirementGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeReworkCode48",
                "icon": "common/icons/typeReworkCode48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRFCAdapter48",
                "icon": "common/icons/typeRFCAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRole48",
                "icon": "common/icons/typeRole48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRoleGroup48",
                "icon": "common/icons/typeRoleGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRootCause48",
                "icon": "common/icons/typeRootCause48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRTF48",
                "icon": "common/icons/typeRTF48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRuleGroup48",
                "icon": "common/icons/typeRuleGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRuleSetting48",
                "icon": "common/icons/typeRuleSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSampleManagement48",
                "icon": "common/icons/typeSampleManagement48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSampleManagementInspection48",
                "icon": "common/icons/typeSampleManagementInspection48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSavedSearch48",
                "icon": "common/icons/typeSavedSearch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScanRule48",
                "icon": "common/icons/typeScanRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScenario48",
                "icon": "common/icons/typeScenario48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleCopy48",
                "icon": "common/icons/typeScheduleCopy48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleExported48",
                "icon": "common/icons/typeScheduleExported48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleMaintenance48",
                "icon": "common/icons/typeScheduleMaintenance48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleReport48",
                "icon": "common/icons/typeScheduleReport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleTaskAttribute48",
                "icon": "common/icons/typeScheduleTaskAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleTaskGroupAttribute48",
                "icon": "common/icons/typeScheduleTaskGroupAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScheduleWorkElementView48",
                "icon": "common/icons/typeScheduleWorkElementView48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeScript48",
                "icon": "common/icons/typeScript48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSearch48",
                "icon": "common/icons/typeSearch48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSearchQueryGroup48",
                "icon": "common/icons/typeSearchQueryGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSearchQueryOnline48",
                "icon": "common/icons/typeSearchQueryOnline48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSearchQueryRelevant48",
                "icon": "common/icons/typeSearchQueryRelevant48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSearchQuerySpecial48",
                "icon": "common/icons/typeSearchQuerySpecial48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSegregationTagsLog48",
                "icon": "common/icons/typeSegregationTagsLog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSemiConductorMaskLayerAttribute48",
                "icon": "common/icons/typeSemiConductorMaskLayerAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSemiConductorMaskLayerFamily48",
                "icon": "common/icons/typeSemiConductorMaskLayerFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSemiConductorMaskLayerGroup48",
                "icon": "common/icons/typeSemiConductorMaskLayerGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSemiConductorProbedWaferConfiguration48",
                "icon": "common/icons/typeSemiConductorProbedWaferConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSemiConductorProbedWaferSort48",
                "icon": "common/icons/typeSemiConductorProbedWaferSort48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSequencer48",
                "icon": "common/icons/typeSequencer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSerialAdapter48",
                "icon": "common/icons/typeSerialAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSerialAdapterl48",
                "icon": "common/icons/typeSerialAdapterl48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeServer48",
                "icon": "common/icons/typeServer48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeServerAttribute48",
                "icon": "common/icons/typeServerAttribute48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeServerCatalog48",
                "icon": "common/icons/typeServerCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeServerMonitor48",
                "icon": "common/icons/typeServerMonitor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSetPoint48",
                "icon": "common/icons/typeSetPoint48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSetPointItem48",
                "icon": "common/icons/typeSetPointItem48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSettings48",
                "icon": "common/icons/typeSettings48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSettingsRestore48",
                "icon": "common/icons/typeSettingsRestore48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSetWeight48",
                "icon": "common/icons/typeSetWeight48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSetWeightExecution48",
                "icon": "common/icons/typeSetWeightExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeShopfloorAdapter48",
                "icon": "common/icons/typeShopfloorAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeShoppingCart48",
                "icon": "common/icons/typeShoppingCart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeShortcut48",
                "icon": "common/icons/typeShortcut48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSignalRuleConfiguration48",
                "icon": "common/icons/typeSignalRuleConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSite48",
                "icon": "common/icons/typeSite48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSiteDestination48",
                "icon": "common/icons/typeSiteDestination48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSiteDestinationGroup48",
                "icon": "common/icons/typeSiteDestinationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSkill48",
                "icon": "common/icons/typeSkill48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSkip48",
                "icon": "common/icons/typeSkip48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSmartView48",
                "icon": "common/icons/typeSmartView48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSoftwareComponent48",
                "icon": "common/icons/typeSoftwareComponent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSolution48",
                "icon": "common/icons/typeSolution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSource48",
                "icon": "common/icons/typeSource48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSourceExtension48",
                "icon": "common/icons/typeSourceExtension48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSPCRules48",
                "icon": "common/icons/typeSPCRules48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStep48",
                "icon": "common/icons/typeSpecificationStep48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepChange48",
                "icon": "common/icons/typeSpecificationStepChange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepOperation48",
                "icon": "common/icons/typeSpecificationStepOperation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepOperationGroup48",
                "icon": "common/icons/typeSpecificationStepOperationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepProbedWaferSchedule48",
                "icon": "common/icons/typeSpecificationStepProbedWaferSchedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepSchedule48",
                "icon": "common/icons/typeSpecificationStepSchedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepStatus48",
                "icon": "common/icons/typeSpecificationStepStatus48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSpecificationStepWaferSchedule48",
                "icon": "common/icons/typeSpecificationStepWaferSchedule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStandardNoteRevision48",
                "icon": "common/icons/typeStandardNoteRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStart48",
                "icon": "common/icons/typeStart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStateMachine48",
                "icon": "common/icons/typeStateMachine48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStateMachineConfiguration48",
                "icon": "common/icons/typeStateMachineConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStateMachineExecution48",
                "icon": "common/icons/typeStateMachineExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStaticExport48",
                "icon": "common/icons/typeStaticExport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStaticImport48",
                "icon": "common/icons/typeStaticImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStatisticalProcessControl48",
                "icon": "common/icons/typeStatisticalProcessControl48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStatusBehaviour48",
                "icon": "common/icons/typeStatusBehaviour48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStatusDefinition48",
                "icon": "common/icons/typeStatusDefinition48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStep48",
                "icon": "common/icons/typeStep48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStepCatalog48",
                "icon": "common/icons/typeStepCatalog48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStepExecution48",
                "icon": "common/icons/typeStepExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStepFlow48",
                "icon": "common/icons/typeStepFlow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStructureDataImport48",
                "icon": "common/icons/typeStructureDataImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSubtrate48",
                "icon": "common/icons/typeSubtrate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSupplierAssessment48",
                "icon": "common/icons/typeSupplierAssessment48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSuppliers48",
                "icon": "common/icons/typeSuppliers48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSurfaceFeature48",
                "icon": "common/icons/typeSurfaceFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSvg48",
                "icon": "common/icons/typeSvg48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSystemDatabaseCleaning48",
                "icon": "common/icons/typeSystemDatabaseCleaning48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSWAC48",
                "icon": "common/icons/typeSWAC48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSystemDispachRule48",
                "icon": "common/icons/typeSystemDispachRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTags48",
                "icon": "common/icons/typeTags48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTask48",
                "icon": "common/icons/typeTask48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskContext48",
                "icon": "common/icons/typeTaskContext48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskContext8",
                "icon": "common/icons/typeTaskContext8.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskDnc48",
                "icon": "common/icons/typeTaskDnc48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskDncExecution48",
                "icon": "common/icons/typeTaskDncExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskElectronicSignatureTemplate48",
                "icon": "common/icons/typeTaskElectronicSignatureTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskEwi48",
                "icon": "common/icons/typeTaskEwi48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskEwiExecution48",
                "icon": "common/icons/typeTaskEwiExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskExecution48",
                "icon": "common/icons/typeTaskExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskOperation48",
                "icon": "common/icons/typeTaskOperation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskOperatorExecution48",
                "icon": "common/icons/typeTaskOperatorExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPart48",
                "icon": "common/icons/typeTaskPart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartBom48",
                "icon": "common/icons/typeTaskPartBom48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartBomExecution48",
                "icon": "common/icons/typeTaskPartBomExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartBoms48",
                "icon": "common/icons/typeTaskPartBoms48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartExecution48",
                "icon": "common/icons/typeTaskPartExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartOut48",
                "icon": "common/icons/typeTaskPartOut48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskPartOutExecution48",
                "icon": "common/icons/typeTaskPartOutExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskProcess48",
                "icon": "common/icons/typeTaskProcess48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskQuality48",
                "icon": "common/icons/typeTaskQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskQualityExecution48",
                "icon": "common/icons/typeTaskQualityExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskTool48",
                "icon": "common/icons/typeTaskTool48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskToolExecution48",
                "icon": "common/icons/typeTaskToolExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskWeight48",
                "icon": "common/icons/typeTaskWeight48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTaskWeightExecution48",
                "icon": "common/icons/typeTaskWeightExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTCAdapter48",
                "icon": "common/icons/typeTCAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTCPSocketAdapter48",
                "icon": "common/icons/typeTCPSocketAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTeam48",
                "icon": "common/icons/typeTeam48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTeamAssignTemplate48",
                "icon": "common/icons/typeTeamAssignTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTeamConfiguration48",
                "icon": "common/icons/typeTeamConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTechnicalDocumentsRevision48",
                "icon": "common/icons/typeTechnicalDocumentsRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTerminal48",
                "icon": "common/icons/typeTerminal48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTestBoard48",
                "icon": "common/icons/typeTestBoard48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTestCaseComment48",
                "icon": "common/icons/typeTestCaseComment48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTestCharacteristic48",
                "icon": "common/icons/typeTestCharacteristic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTestProcedureRevisionInProgress48",
                "icon": "common/icons/typeTestProcedureRevisionInProgress48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTextFeature48",
                "icon": "common/icons/typeTextFeature48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTextVariable48",
                "icon": "common/icons/typeTextVariable48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeActivity48",
                "icon": "common/icons/typeTimeActivity48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeCategory48",
                "icon": "common/icons/typeTimeCategory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeDefinitions48",
                "icon": "common/icons/typeTimeDefinitions48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeDiagram48",
                "icon": "common/icons/typeTimeDiagram48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeHierarchy48",
                "icon": "common/icons/typeTimeHierarchy48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimePeriod48",
                "icon": "common/icons/typeTimePeriod48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeSlice48",
                "icon": "common/icons/typeTimeSlice48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTimeSliceGroup48",
                "icon": "common/icons/typeTimeSliceGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTool48",
                "icon": "common/icons/typeTool48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolAction48",
                "icon": "common/icons/typeToolAction48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolBox48",
                "icon": "common/icons/typeToolBox48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolBoxExecution48",
                "icon": "common/icons/typeToolBoxExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolBoxLink48",
                "icon": "common/icons/typeToolBoxLink48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolConfiguration48",
                "icon": "common/icons/typeToolConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolExecution48",
                "icon": "common/icons/typeToolExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolFamily48",
                "icon": "common/icons/typeToolFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolGroup48",
                "icon": "common/icons/typeToolGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolLink48",
                "icon": "common/icons/typeToolLink48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTransport48",
                "icon": "common/icons/typeTransport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTransportOperationLanding48",
                "icon": "common/icons/typeTransportOperationLanding48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTransportSetting48",
                "icon": "common/icons/typeTransportSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTravellingNotification48",
                "icon": "common/icons/typeTravellingNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTxt48",
                "icon": "common/icons/typeTxt48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUIApplication48",
                "icon": "common/icons/typeUIApplication48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUnitOfMeasure48",
                "icon": "common/icons/typeUnitOfMeasure48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUnknown48",
                "icon": "common/icons/typeUnknown48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUnlinkedDocument48",
                "icon": "common/icons/typeUnlinkedDocument48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUpdaterConfiguration48",
                "icon": "common/icons/typeUpdaterConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUpdaterConsoleConfiguration48",
                "icon": "common/icons/typeUpdaterConsoleConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeUpload48",
                "icon": "common/icons/typeUpload48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVariantChange48",
                "icon": "common/icons/typeVariantChange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVariantGroup48",
                "icon": "common/icons/typeVariantGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVariantLabelAttributive48",
                "icon": "common/icons/typeVariantLabelAttributive48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVariantRevisionRule48",
                "icon": "common/icons/typeVariantRevisionRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVendor48",
                "icon": "common/icons/typeVendor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWarehouse48",
                "icon": "common/icons/typeWarehouse48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWebAPIAdapter48",
                "icon": "common/icons/typeWebAPIAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWebAPIClientAdapter48",
                "icon": "common/icons/typeWebAPIClientAdapter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWeight48",
                "icon": "common/icons/typeWeight48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWeightFamily48",
                "icon": "common/icons/typeWeightFamily48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWindowEditor48",
                "icon": "common/icons/typeWindowEditor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWOOP48",
                "icon": "common/icons/typeWOOP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWOOPExecGroup48",
                "icon": "common/icons/typeWOOPExecGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkAreaQuality48",
                "icon": "common/icons/typeWorkAreaQuality48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkAreaRevision48",
                "icon": "common/icons/typeWorkAreaRevision48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkCenter48",
                "icon": "common/icons/typeWorkCenter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkerRole48",
                "icon": "common/icons/typeWorkerRole48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflow48",
                "icon": "common/icons/typeWorkflow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowChange48",
                "icon": "common/icons/typeWorkflowChange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowConfiguration48",
                "icon": "common/icons/typeWorkflowConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowERP48",
                "icon": "common/icons/typeWorkflowERP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowEvent48",
                "icon": "common/icons/typeWorkflowEvent48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcess48",
                "icon": "common/icons/typeWorkflowProcess48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcessConfiguration48",
                "icon": "common/icons/typeWorkflowProcessConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcessExternal48",
                "icon": "common/icons/typeWorkflowProcessExternal48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcessStart48",
                "icon": "common/icons/typeWorkflowProcessStart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcessStep48",
                "icon": "common/icons/typeWorkflowProcessStep48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowProcessStepStart48",
                "icon": "common/icons/typeWorkflowProcessStepStart48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowStep48",
                "icon": "common/icons/typeWorkflowStep48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowStepChange48",
                "icon": "common/icons/typeWorkflowStepChange48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowStepConfiguration48",
                "icon": "common/icons/typeWorkflowStepConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowTemplate48",
                "icon": "common/icons/typeWorkflowTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkflowTime48",
                "icon": "common/icons/typeWorkflowTime48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkingPattern48",
                "icon": "common/icons/typeWorkingPattern48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkingPatternAggregation48",
                "icon": "common/icons/typeWorkingPatternAggregation48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkMaster48",
                "icon": "common/icons/typeWorkMaster48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrder48",
                "icon": "common/icons/typeWorkOrder48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderAvailable48",
                "icon": "common/icons/typeWorkOrderAvailable48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderERP48",
                "icon": "common/icons/typeWorkOrderERP48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderHistory48",
                "icon": "common/icons/typeWorkOrderHistory48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderInProgress48",
                "icon": "common/icons/typeWorkOrderInProgress48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderMfg48",
                "icon": "common/icons/typeWorkOrderMfg48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderNotification48",
                "icon": "common/icons/typeWorkOrderNotification48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderPreKits48",
                "icon": "common/icons/typeWorkOrderPreKits48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderStatus48",
                "icon": "common/icons/typeWorkOrderStatus48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderTemplate48",
                "icon": "common/icons/typeWorkOrderTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderUpdate48",
                "icon": "common/icons/typeWorkOrderUpdate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderVendor48",
                "icon": "common/icons/typeWorkOrderVendor48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkProcessContext48",
                "icon": "common/icons/typeWorkProcessContext48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkProcessExecution48",
                "icon": "common/icons/typeWorkProcessExecution48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkProcessTemplate48",
                "icon": "common/icons/typeWorkProcessTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorksheet48",
                "icon": "common/icons/typeWorksheet48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorksheetConfiguration48",
                "icon": "common/icons/typeWorksheetConfiguration48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorksheetDynamic48",
                "icon": "common/icons/typeWorksheetDynamic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorksheetRow48",
                "icon": "common/icons/typeWorksheetRow48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorksheetSetting48",
                "icon": "common/icons/typeWorksheetSetting48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeXml48",
                "icon": "common/icons/typeXml48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeYieldTable48",
                "icon": "common/icons/typeYieldTable48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutoInsertCheck48",
                "icon": "common/icons/typeAutoInsertCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutoSubstitutePad48",
                "icon": "common/icons/typeAutoSubstitutePad48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeAutoSubstituteSurface48",
                "icon": "common/icons/typeAutoSubstituteSurface48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeBoardDrillCheck48",
                "icon": "common/icons/typeBoardDrillCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeChecklistLibrary48",
                "icon": "common/icons/typeChecklistLibrary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeComponentPin48",
                "icon": "common/icons/typeComponentPin48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDesignCenter48",
                "icon": "common/icons/typeDesignCenter48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDifferenceSummaryProcess48",
                "icon": "common/icons/typeDifferenceSummaryProcess48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDrillSummary48",
                "icon": "common/icons/typeDrillSummary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEDAImport48",
                "icon": "common/icons/typeEDAImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeElectronicProcessorImport48",
                "icon": "common/icons/typeElectronicProcessorImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEquipmentCapabilities48",
                "icon": "common/icons/typeEquipmentCapabilities48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeEtchCheck48",
                "icon": "common/icons/typeEtchCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeFiducialCheck48",
                "icon": "common/icons/typeFiducialCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeGZFile48",
                "icon": "common/icons/typeGZFile48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeLineUnityCheck48",
                "icon": "common/icons/typeLineUnityCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryLineImport48",
                "icon": "common/icons/typeMachineryLineImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeDrillCheck48",
                "icon": "common/icons/typeDrillCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStationGroup48",
                "icon": "common/icons/typeMachineryStationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStationLink48",
                "icon": "common/icons/typeMachineryStationLink48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryStationSettingsTemplate48",
                "icon": "common/icons/typeMachineryStationSettingsTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeMachineryOpen48",
                "icon": "common/icons/typeMachineryOpen48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeNomenclatureCheck48",
                "icon": "common/icons/typeNomenclatureCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePadStackCheck48",
                "icon": "common/icons/typePadStackCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeParameterRule48",
                "icon": "common/icons/typeParameterRule48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePDCheck48",
                "icon": "common/icons/typePDCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePGCheck48",
                "icon": "common/icons/typePGCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePinToPad48",
                "icon": "common/icons/typePinToPad48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeProfileCheck48",
                "icon": "common/icons/typeProfileCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeRuleRating48",
                "icon": "common/icons/typeRuleRating48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSetSMDCheck48",
                "icon": "common/icons/typeSetSMDCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSignalCheck48",
                "icon": "common/icons/typeSignalCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSilkscreenCheck48",
                "icon": "common/icons/typeSilkscreenCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSMDSummary48",
                "icon": "common/icons/typeSMDSummary48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSolderMaskCheck48",
                "icon": "common/icons/typeSolderMaskCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSolderPasteCheck48",
                "icon": "common/icons/typeSolderPasteCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeStatic48",
                "icon": "common/icons/typeStatic48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSurfaceCheck48",
                "icon": "common/icons/typeSurfaceCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTestPointCheck48",
                "icon": "common/icons/typeTestPointCheck48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeToolImport48",
                "icon": "common/icons/typeToolImport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeVLXFile48",
                "icon": "common/icons/typeVLXFile48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationGrouped48",
                "icon": "common/icons/typeOperationGrouped48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeOperationGroupTemplate48",
                "icon": "common/icons/typeOperationGroupTemplate48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typePreDefinitionOperationGroup48",
                "icon": "common/icons/typePreDefinitionOperationGroup48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeSupport48",
                "icon": "common/icons/typeSupport48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeTraining48",
                "icon": "common/icons/typeTraining48.svg"
            },
            {
                "iconType": "type",
                "text": "svg typeWorkOrderImport48",
                "icon": "common/icons/typeWorkOrderImport48.svg"
            }
        ]
};

	angular.module('siemens.simaticit.common.widgets.iconPicker').value("common.iconPicker.sitIconSvgData", sitIconSvgJson);
})();
