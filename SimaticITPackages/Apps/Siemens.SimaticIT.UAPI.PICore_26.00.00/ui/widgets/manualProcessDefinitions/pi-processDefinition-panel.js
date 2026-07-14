(function () {
    angular.module('Siemens.SimaticIT.UAPI.PICore').directive('piStartProcessDefinition', startProcessDefinitionDirective);

    function startProcessDefinitionDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/manualProcessDefinitions/pi-processDefinition-panel.html',
            controller: startProcessDefinitionController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
            },
            bindToController: {
                onRegisterApi: '&',
                onConfirmClicked: '&'
            }
        };
    }

    startProcessDefinitionController.$inject = ['$scope', '$translate', 'common.base', '$stateParams','uapi_processDefinitionService','$state'];

    function startProcessDefinitionController($scope, $translate, common, $stateParams,ProcessDefinitionService,$state) {

        var self = this;
        self.workOrderTypeConfig = {
            options: [],
            toDisplay: 'workOrderType',
            toKeep: 'workOrderType',
            value: ''
        };
        activate();

        function activate() {
            init();
            registerEvents();
            initProcessDefinitionPanel(); // Must be executed only once the init() has been completed

            self.api = {
                startProcessDefinitionApi: startProcessDefinition,
                setManualProcessDefinitionCatalog: setManualProcessDefinitionCatalog,
                getSelectedProcessDefinition: getSelectedProcessDefinition
            };
            self.onRegisterApi({ api: self.api });
        }

        function init() {

            var sidePanelStyle = getSidePanelStyle();
            self.processDefinitionsData = [];

            self.processDefinitionsOptions = {
                uniqueID: '',
                containerID: "PDContainer",
                // bgColor: '#fafafa',
                // bgColorSelected:'#73b4c8',
                //  colorSelected:'#73b4c8',
                //  color: 'black',
                //colorSelected: '#647887',
                alwaysShowPager: false,
                enablePaging: false,
                enableResponsiveBehaviour: false,
                sortInfo: {
                    field: 'Name',
                    direction: 'asc',
                    fields: [
                        { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                        { field: 'WorkOrderOperationNId', displayName: $translate.instant('picore.tiles.labels.workOrderOperation') }
                    ]
                },
                height: sidePanelStyle.height,
                tileConfig: {
                    isCell: false,
                    titleField: { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                    descriptionField: { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                    propertyFields: [
                        { field: 'WorkOrderOperationNId', displayName: $translate.instant('picore.tiles.labels.workOrderOperation') }, //, visible: $stateParams.WorkOrderOperationNId ? false : true }
                        { field: 'NameAndRevision', displayName: $translate.instant('picore.headers.tables.nId') }
                    ]
                    /*commands: [
                        {
                            cmdIcon: 'Start',
                            onClick: function (command) { StartNewWorkProcess(command); },
                            tooltip: $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.startManualWorkProcess'),
                            visible: true
                        }
                    ]*/
                },
                gridConfig: {
                    columnDefs: [{
                         field: 'Name',
                        displayName: $translate.instant('picore.headers.tables.name')
                        },{
                         field: 'Description',
                            displayName: $translate.instant('picore.headers.tables.description'),
                         resizable: false
                        },{
                         field: 'WorkOrderOperationNId',
                         displayName: $translate.instant('picore.tiles.labels.workOrderOperation')
                        },{
                         field: 'NameAndRevision',
                         displayName: $translate.instant('picore.headers.tables.nId')
                        }
                    ],
                    showSelectionCheckbox: false,
                    showRowHighlight: true
                },
                onSelectionChangeCallback: onSelectionChangeCallback,
                filterBarOptions: 'S',
                selectionMode: 'single',
                viewMode: 'l',
                viewOptions: 'gml',
                svgIcon: 'common/icons/typeWorkflowProcess48.svg',
                tileContainerClass: 'lightStyle'/*,
                smallTileTemplate: self.customTemplate,
                mediumTileTemplate: self.customTemplate,
                largeTileTemplate: self.customTemplate*/

                //tileContainerClass: 'tile-container'
            };

            self.gridSelectedItems = [];
        }

        function getSidePanelStyle() {
            var sidePanelStyle = {};
            var sidePanelElement = document.getElementsByClassName("side-panel-custom")[0];
            sidePanelStyle.height = sidePanelElement.offsetHeight;
            return sidePanelStyle;
        }

        function onSelectionChangeCallback(selectedItem) {
            self.gridSelectedItems = [];
            if (selectedItem.length > 0) {
                self.gridSelectedItems.push(selectedItem[0]);
            }
        }

        function getSelectedProcessDefinition() {
            return self.gridSelectedItems;
        }

        function registerEvents() {
            self.onPDPanelRegisterApi = onPDPanelRegisterApi;
        }


        // ==========================================
        // Production Context Restore
        // ==========================================

        // Read the production context and fill the filters
        function initProcessDefinitionPanel() {
        }

        function setManualProcessDefinitionCatalog(processDefinitionList) {
            self.processDefinitionsData = processDefinitionList;
        }

        //function selectionConfirm(selectedItem) {
        //    if (vm.onConfirmClicked) {
        //        vm.onConfirmClicked({ command: selectedItem });
        //        if (selectedItem.selected && selectedItem.name === 'unshowFinalizedTasks') {
        //            vm.IsShowFinalizedTasksVisible = true;
        //        } else if (selectedItem.name === 'showFinalizedTasks') {
        //            vm.IsShowFinalizedTasksVisible = false;
        //        }
        //    }
        //}



        // ==========================================
        // Production Context Backup
        // ==========================================

        function startProcessDefinition() {
        }

        function onPDPanelRegisterApi(api) {
            self._pdPanelApi = api;
        }
    }
})();
