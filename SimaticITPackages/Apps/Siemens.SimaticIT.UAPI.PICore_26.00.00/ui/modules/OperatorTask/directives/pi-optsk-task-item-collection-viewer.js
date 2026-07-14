/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .directive('piOptskTaskItemCollectionViewer', tskTaskItemCollectionViewer);

    function tskTaskItemCollectionViewer() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-task-item-collection-viewer.html',
            controller: TaskItemCollectionViewerController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterApi: '&',
                onRowSelectionChanged: '&',
                onTileActionClicked: '&',
                multiSelect: '@'
            }
        };
    }

    TaskItemCollectionViewerController.$inject = ['Siemens.SimaticIT.UAPI.PICore.commonService', 'uapi_taskService', '$translate', '$timeout', '$q', '$filter', 'common.base', 'common.services.logger.service'];

    function TaskItemCollectionViewerController(commonService, taskService, $translate, $timeout, $q, $filter, base, uiLogger) {
        var vm = this;

        vm.customTemplate = '<div data-internal-type=\"custom-container\" style="height:100%">' +
            '<div class=\"wide-item-left-col\" data-internal-type=\"left-column\">' +
            '<div class=\"image-container-48x48\" data-internal-type=\"image-container\">' +
            '<div class=\"image-vcenter-48x48 \" data-internal-type=\"image-vcenter\" ng-class=\"itemTileCtrl.tileContent.svgIcon || itemTileCtrl.tileContent.typeIcon ? \'remove-font-awesome\':\'\'\">' +
            '<div ng-if=\"(itemTileCtrl.tileContent.image || itemTileCtrl.tileContent.svgIcon || itemTileCtrl.tileContent.typeIcon) && !itemTileCtrl.tileContent.imageTemplate\" class=\"fa fa-2x {{itemTileCtrl.tileContent.image}} \" sit-mom-icon=\"itemTileCtrl.tileContent.svgIcon || itemTileCtrl.tileContent.typeIcon\"></div>' +
            '<div ng-if=\"itemTileCtrl.tileContent.imageTemplate\" class=\"fa fa-2x\" ng-bind-html=\"itemTileCtrl.tileContent.imageTemplate\"></div>' +
            ' </div>' +
            ' </div>' +
            '</div>' +
            '<div class=\"wide-item-text wide-item-text-short\" data-internal-type="text-container">' +
            '<div title=\"{{itemTileCtrl.displayTooltip}}\" class=\"wide-item-title\" data-internal-type=\"title\">{{itemTileCtrl.displayTitle}}</div>' +
            '<div title=\"{{itemTileCtrl.descriptionTooltip}}\" class=\"wide-item-description-single\" data-internal-type=\"description\">{{itemTileCtrl.displayDescription}}</div>' +
            '</div>' +

            '<div class="action-buttons" ng-if="itemTileCtrl.isCell && itemTileCtrl._commands.length > 0">' +
            '<div ng-repeat="command in itemTileCtrl._commands track by $index" class="action-button-item" ng-if="$index <= 1 && command.isVisible">' +
            '<div title=\"{{command.tooltip}}\" ng-class="command.cmdIcon ? \'remove-font-awesome\':\'action-button-icon\'" class="remove-font-awesome">' +
            '<em class="fa" sit-mom-icon="command.cmdIcon" ng-click="itemTileCtrl.commandCallback($event, command)">' +
            '<img ng-if="momIconCtrl.iconPath" class="momIcon" height="24px" width="24px"></em>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div  class="wide-item-properties wide-item-properties-long" ng-class="itemTileCtrl.getPropertiesDivHeight(); itemTileCtrl._commands.length > 1 ? \'wide-item-properties-short\' : \'wide-item-properties-long\'" data-internal-type="properties">' +
            '<div title="\{{itemTileCtrl.displayProp1.sanitizedVal}}\" ng-if="\itemTileCtrl.displayProp1\" class=\"wide-item-property wide-item-property-name\"><span class="property-name">{{itemTileCtrl.displayProp1.name}}</span></div>' +
            '<div title="\{{itemTileCtrl.displayProp1.sanitizedVal}}\" ng-if="\itemTileCtrl.displayProp1\" class=\"wide-item-property wide-item-property-value\"><span class="property-value">{{itemTileCtrl.displayProp1.value}}</span></div>' +
            '<div title=\"{{itemTileCtrl.displayProp2.sanitizedVal}}\" ng-if=\"itemTileCtrl.displayProp2\" class=\"wide-item-property wide-item-property-name\"><span class="property-name">{{itemTileCtrl.displayProp2.name}}</span></div>' +
            '<div title=\"{{itemTileCtrl.displayProp2.sanitizedVal}}\" ng-if=\"itemTileCtrl.displayProp2\" class=\"wide-item-property wide-item-property-value\"><span class="property-value">{{itemTileCtrl.displayProp2.value}}</span></div>' +
            '<div title=\"{{itemTileCtrl.displayProp3.sanitizedVal}}\" ng-if=\"itemTileCtrl.displayProp3\" class=\"wide-item-property wide-item-property-name\"><span class="property-name">{{itemTileCtrl.displayProp3.name}}</span></div>' +
            '<div title=\"{{itemTileCtrl.displayProp3.sanitizedVal}}\" ng-if=\"itemTileCtrl.displayProp3\" class=\"wide-item-property wide-item-property-value\"><span class="property-value">{{itemTileCtrl.displayProp3.value}}</span></div>' +
            '</div>' +
            '<div class=\"wide-item-indicators\">' +
            '<div class="indicator-icon" style="display: flex">' +
            '<div style="margin-right: 10px"><img ng-class=\"{\'error\': itemTileCtrl.tileContent.ErrorCount!=0 }\" class="momIcon" ng-show=\"itemTileCtrl.tileContent.ErrorCount!=0\"  width=\"24px\" height=\"24px\" src=\"common/icons/indicatorStatusError16.svg\"/></div>' +
            '<div><img ng-class=\"{\'error\': itemTileCtrl.tileContent.IsTaskExpired==true }\" class="momIcon" ng-show=\"itemTileCtrl.tileContent.IsTaskExpired==true\"  width=\"24px\" height=\"24px\" src=\"common/icons/indicatorRedCircle16.svg\"/></div>' +
            '</div>' +
            '</div>' +
            '</div>';

        var equipments = [];     // Used to store the actual list of equipments of the Production context

        var productionContext;
        var showOnlyUnfinalizedTasks;

        activate();

        function activate() {
            vm.api = {
                refresh: refresh,
                unselect: unselect,
                getSelectedItem: getSelectedItem,
                setCompactMode: setCompactMode,
                getCurrentData: getCurrentData,
                getEquipments: getEquipments,
                refreshErrorCountAsync: refreshErrorCountAsync,
                getAll: getAll
            };
            if (vm.onRegisterApi) {
                vm.onRegisterApi({ api: vm.api });
            }
            vm.viewerOptions = getViewerOptions(); // Needs API to be defined
            vm.viewerData = [];
        }


        // ==============================================================================
        //                              Grid Management
        // ==============================================================================


        function getViewerOptions() {
            return {
                containerID: 'TaskContainer',
                userPrefId: 'prefPIWOTL',
                serverDataOptions: {
                    dataService: vm.api,
                    dataEntity: 'NA',
                    optionsString: ''
                },
                gridConfig: {
                    columnDefs: [
                        { field: 'ErrorCount', displayName: '', width: '25px', cellTemplate: '<pi-optsk-error-count-cell-template value="row.getProperty(col.field)"><pi-optsk-error-count-cell-template>' },
                        { field: 'StatusNId', width: '100px', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.StatusNId'), cellTemplate: '<pi-optsk-status-cell-template status="{NId: row.getProperty(col.field)}"><pi-optsk-status-cell-template>' },
                        { field: 'NId', width: '80px', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.id') },
                        { field: 'Name', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.name') },
                        //{ field: 'WorkProcedureNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedure') },
                        //{ field: 'WorkProcedureRevision', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedureRevision') },
                        { field: 'WorkOrderNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrder') },
                        { field: 'WorkOrderOperationNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrderOperation') },
                        { field: 'EquipmentNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Equipment') },
                        { field: 'Description', visible: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.description') },
                        { field: 'Sequence', visible: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Sequence') },
                        { field: 'TaskFlow', visible: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskFlow') },
                        { field: 'CreatedOn', visible: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.CreatedOn'), cellFilter: 'date:"medium"' }
                    ]
                },
                enablePaging: false,
                quickSearchOptions: { enabled: true, field: 'Name' },
                filterBarOptions: 'sqgf',
                filterFields: [
                    { field: 'WorkOrderNId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrder'), type: 'string' },
                    { field: 'WorkOrderOperationNId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrderOperation'), type: 'string' },
                    { field: 'StatusNId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.StatusNId'), type: 'string' },
                    { field: 'EquipmentNId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Equipment'), type: 'string' },
                    //{ field: 'WorkProcedureNId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedure'), type: 'string' },
                    //{ field: 'WorkProcedureRevision', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedureRevision'), type: 'string' },
                    { field: 'NId', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.id'), type: 'string' },
                    { field: 'TaskFlow', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskFlow'), type: 'string' },
                    { field: 'Name', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.name'), type: 'string' },
                    { field: 'Description', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.description'), type: 'string' },
                    { field: 'ErrorCount', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.ErrorCount'), type: 'number' },
                    { field: 'Sequence', default: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Sequence'), type: 'number' }
                ],

                sortInfo: {
                    field: 'Sequence',
                    direction: 'asc',
                    fields: [
                        { field: 'StatusNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.StatusNId'), width: '80px' },
                        { field: 'NId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.id') },
                        { field: 'Name', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.name') },
                        { field: 'Description', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.description') },
                        //{ field: 'WorkProcedureNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedure') },
                        //{ field: 'WorkProcedureRevision', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedureRevision') },
                        { field: 'WorkOrderNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrder') },
                        { field: 'WorkOrderOperationNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrderOperation') },
                        { field: 'Sequence', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Sequence') },
                        { field: 'TaskFlow', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskFlow') },
                        { field: 'EquipmentNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Equipment') },
                        { field: 'ErrorCount', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.ErrorCount') },
                        { field: 'CreatedOn', visible: false, displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.CreatedOn'), type: 'datetimeoffset' }
                    ]
                },
                onSelectionChangeCallback: onSelectionChangeCallback,
                multiSelect: 'false',
                selectionMode: 'single',
                selectStyle: 'alternate',
                enableResponsiveBehaviour: false,


                tileConfig: {
                    titleField: {
                        field: 'Name',
                        displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Name')
                    },
                    descriptionField: {
                        field: 'TaskDefinitionNId',
                        displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskDefinitionNId')
                    },
                    propertyFields: [
                        { field: 'WorkOrderNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrder') },
                        { field: 'EquipmentNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Equipment') },
                        { field: 'StatusNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.StatusNId') },
                        { field: 'WorkOrderOperationNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkOrderOperation') },
                        //{ field: 'WorkProcedureNId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedure') },
                        //{ field: 'WorkProcedureRevision', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.WorkProcedureRevision') },
                        { field: 'NId', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.id') },
                        { field: 'TaskFlow', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.TaskFlow') },
                        { field: 'Description', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.description') },
                        { field: 'ErrorCount', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.ErrorCount') },
                        { field: 'Sequence', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.Sequence') },
                        { field: 'CreatedOn', displayName: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.CreatedOn'), dataType: 'date', format: 'medium' }
                    ],
                    isCell: true,
                    commands: [
                        {
                            cmdIcon: 'TaskActivate',
                            onClick: function (command) {
                                var obj = { Task: command, name: "activate" };
                                if (vm.onTileActionClicked) { vm.onTileActionClicked({ command: obj }); }
                            },
                            tooltip: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.activate'),
                            visible: 'tileContent.StatusNId === "Created" || tileContent.StatusNId === "NotReady" || tileContent.StatusNId === "Suspended"'
                        },
                        {
                            cmdIcon: 'Start',
                            onClick: function (command) {
                                var obj = { Task: command, name: "start" };
                                if (vm.onTileActionClicked) { vm.onTileActionClicked({ command: obj }); }
                            },
                            tooltip: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.start'),
                            visible: 'tileContent.StatusNId === "Ready"'

                        },
                        {
                            cmdIcon: 'Forwards',
                            onClick: function (command) {
                                var obj = { Task: command, name: "resume" };
                                if (vm.onTileActionClicked) { vm.onTileActionClicked({ command: obj }); }
                            },
                            tooltip: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.resume'),
                            visible: 'tileContent.StatusNId === "Paused"'
                        }
                    ],
                    indicators: [
                        { svgIcon: 'common/icons/indicatorStatusError16.svg', visible: true }
                    ]
                },
                typeIcon: 'Task',
                viewMode: 'm',//l: Large tile
                viewOptions: 'gl',//UI elements to be shown in the viewbar

                smallTileTemplate: vm.customTemplate,
                mediumTileTemplate: vm.customTemplate,
                largeTileTemplate: vm.customTemplate,

                tileContainerClass: 'tile-container'
            };
        }

        function onSelectionChangeCallback(rows, row) {
            if (vm.onRowSelectionChanged) { vm.onRowSelectionChanged({ rows: rows, row: row }); }
        }

        function setCompactMode(value) {
            //vm.viewerOptions.viewMode = (value) ? 'c' : 'g';//G: Shows data in a grid.
        }

        function refreshErrorCountAsync(taskId, errorCount) {
            var defer = $q.defer();
            for (var i = 0; i < vm.viewerData.length; i++) {
                if (vm.viewerData[i].Id == taskId) {
                    $timeout(function updateErrorCount() {
                        vm.viewerData[i].ErrorCount = errorCount;
                        defer.resolve();
                    });
                    break;
                }
            }
            return defer.promise;
        }

        function unselect() {
            var selectItem = getSelectedItem();
            if (selectItem != null) {
                vm.viewerOptions.selectItems([selectItem], false, true);
                // onSelectionChangeCallback is not called in this case.
                // so, should be triggered here
                onSelectionChangeCallback(null, null);
            }
        }

        function getSelectedItem() {
            var data = getCurrentData();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].selected) { return data[i]; }
                }
            }
            return null;
        }

        function getCurrentData() {
            if (typeof vm.viewerOptions.getCurrentData === 'function') {
                return vm.viewerOptions.getCurrentData();
            } else {
                return null;
            }
        }

        // Return all the equipmentsNIds that are selected in the production context based on hierarchies
        function getEquipments() {
            uiLogger.log('pi-optsk-task-item-collection-viewer: getEquipments()');
            return equipments;
        }

        function refresh(inProductionContext, inShowOnlyUnfinalizedTasks) {
            uiLogger.logDebug('pi-optsk-task-item-collection-viewer: entering refresh with productionContext: ' + inProductionContext.toString());
            var defer = $q.defer();

            // Store the parameters and refresh the serverdataoption manually
            productionContext = inProductionContext;
            showOnlyUnfinalizedTasks = inShowOnlyUnfinalizedTasks;

            // Unselect the current task to avoid action bar inconsistency
            unselect();
            uiLogger.logDebug('pi-optsk-task-item-collection-viewer: called unselect ');

            // Look for the EquipmentNId that is stored in the production context
            var equipmentNId = extractEquipmentNId();
            uiLogger.logDebug('pi-optsk-task-item-collection-viewer: equipmentNId from extractEquipmentNId: ' + equipmentNId);
            if (equipmentNId != null) {
                uiLogger.logDebug('pi-optsk-task-item-collection-viewer: equipmentNId ok -> getting equipment hierarchy');
                taskService.getEquipementHierachy(equipmentNId).then(function (data) {
                    uiLogger.logDebug('pi-optsk-task-item-collection-viewer: getEquipementHierachy.then... -> setting equipments');
                    equipments = data.value[0].EquipmentNIds;
                    triggerGetAll();
                });
            } else {
                triggerGetAll();
            }

            defer.resolve();
            return defer.promise;
        }

        function triggerGetAll() {
            // Refresh the serverdataoption manually, it calls the getAll
            if (vm.viewerOptions.refresh) {
                vm.viewerOptions.refresh();
            }
        }

        // Extract the EquipmentNId that is stored in the production context
        function extractEquipmentNId() {
            uiLogger.logDebug('pi-optsk-task-item-collection-viewer: called extractEquipmentNId');
            // Examine every field of the production context
            for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                var prodContextField = productionContext.ProductionContextFields[i];
                // Try to find the equipment iin the production context
                if (prodContextField.NId === 'EquipmentNId') {
                    return prodContextField.FieldValue;
                }
            }
            return null;
        }

        // Override the getAll method to use a ReadingFunction in server side mode
        // It must respect the getAll Standard signature, but dataEntity is not used
        function getAll(dataEntity, inOptionsString) {
            var defer = $q.defer();
            var filters = [];

            if (!productionContext) {
                defer.resolve([]); // return no data
                return defer.promise;
            }

            var WorkOrderNId = null;
            var WorkOrderOperationNId = null;
            // Transform the Production Context into parameters for the Reading Function
            if (productionContext && productionContext.ProductionContextFields.length > 0) {
                for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                    // Add a new filter pair in the list
                    filters[filters.length] = {
                        NId: productionContext.ProductionContextFields[i].NId,
                        FieldValue: productionContext.ProductionContextFields[i].FieldValue
                    };

                    if (productionContext.ProductionContextFields[i].NId === 'WorkOrderNId') {
                        WorkOrderNId = productionContext.ProductionContextFields[i].FieldValue;
                    }

                    if (productionContext.ProductionContextFields[i].NId === 'WorkOrderOperationNId') {
                        WorkOrderOperationNId = productionContext.ProductionContextFields[i].FieldValue;
                    }
                }
            }

            var params = {
                ProductionContext: filters,
                ShowFinalizedTasks: showOnlyUnfinalizedTasks
            };

            taskService.getConfigKey().then(function (data) {

                if (data.value && data.value.length > 0 && data.value[0].Val.toLowerCase() === 'true' && WorkOrderNId !== null) {
                    var paramGetExpiredTask = {
                        WorkOrderNId: WorkOrderNId,
                        WorkOrderOperationNId: WorkOrderOperationNId
                    };

                    var p1 = taskService.executeReadingFunction('RF_GetOTLTasks', params, inOptionsString);
                    var p2 = taskService.executeReadingFunction('RFGetTimeBasedExpiredTasks', paramGetExpiredTask);

                    $q.all([p1, p2]).then(function (values) {
                        if (values !== null && values.length > 0) {
                            for (var k = 0; k < values[0].value.length; k++) {
                                var da = $filter('filter')(values[1].value, values[0].value[k].Id);
                                if (da.length > 0) {
                                    values[0].value[k].IsTaskExpired = da[0].IsTaskExpired;
                                }
                            }
                        }
                    }).catch(function (e) {
                        defer.reject(e);
                    }).finally(function (f) {
                        defer.resolve(p1);
                    });
                }
                else {
                    defer.resolve(taskService.executeReadingFunction('RF_GetOTLTasks', params, inOptionsString));
                }
            }).catch(function (error) { defer.reject(error); });
            return defer.promise;
        }
    }
})();
