/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
     * @ngdoc module
     * @name siemens.simaticit.common.widgets.export
     * @description
     * This module provides UI elements to configure export options and to start the Export operation.
     */
    angular.module('siemens.simaticit.common.widgets.export', []);
})();
(function () {
    'use strict';
    angular.module('siemens.simaticit.common.widgets.export').controller('siemens.simaticit.common.widgets.export.ExportScreenController', ExportScreenController);

    ExportScreenController.$inject = [
        'common.services.export.service',
        '$state',
        '$stateParams',
        'common.base',
        '$filter',
        '$scope',
        '$translate',
        '$log',
        'common.widgets.notificationTile.globalService'
    ];
    function ExportScreenController(exportService, $state, $stateParams, common, $filter, $scope, $translate, $log, notificationTile) {
        var self = this;
        var sidePanelManager, backendService;
        self.title = $translate.instant('export.title');
        self.actionButtons = [];
        self.closeButton = {
            showClose: true,
            tooltip: $translate.instant('export.sidePanel.closeToolTip'),
            onClick: function () {
                $state.go('^');
            }
        };
        self.exportInfo = {
            EntitiesId: [],
            ExportDescendants: false,
            AppShortName: ""
            //SolutionName, User,...?
        };
        activate();

        function activate() {
            listen();
            init();
            registerEvents();
            setActionButtons();

            sidePanelManager.open({
                mode: 'e',
                size: 'small'
            });            
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            backendService = common.services.runtime.backendService;

            //Expose Model Methods
            self.save = save;
            self.cancel = cancel;
        }

        function setActionButtons() {
            self.actionButtons = [
                {
                    label: $translate.instant("common.export-sidepanel"),
                    tooltip: $translate.instant("common.export-sidepanel"),
                    onClick: self.save,
                    enabled: true
                },
                {
                    label: $translate.instant("common.cancel"),
                    tooltip: $translate.instant("common.cancel"),
                    onClick: self.cancel,
                    enabled: true,
                    visible: true
                }
            ];
        }

        function registerEvents() {
        }

        function listen() {
            $scope.$watch(function () {
                return self.descendantsSelected;
            }, function (newValue, oldValue) {
                if (newValue == undefined || newValue == null) {
                    return;
                }
            }, true);
        }

        function save() {
            var ids = $stateParams['objIds'];
            var masterEntity = $stateParams['entity'];
            var applName = $stateParams['app'];
            var descSelected = self.descendantsSelected;

            exportService.export(ids, masterEntity, applName, descSelected).then(onExportSuccess, backendService.backendError);

            //tagsManagementService.setEntityInfo(self.entityinfo);
            //tagsManagementService.setSegregationTags(id, tags).then(onSaveSuccess, backendService.backendError);
        }

        function cancel() {
            sidePanelManager.close();
            $state.go('^');
        }

        function onExportSuccess(data) {
            notificationTile.info($translate.instant("common.export.exportInProgress"));
            sidePanelManager.close();
            $state.go('^', {}, { reload: true });
        }
    }
}());

(function () {
    'use strict';
    /**
    * @ngdoc directive
    * @name sit-export-manager
    * @module siemens.simaticit.common.widgets.export
    * @description
    * This directive allows to manage the export operation.
    * By using this directive it is possible to start the export operation and include or not the descendants of the selected items.
    *
    *
    * @usage
    * As an element:
    * ```
    * <sit-export-manager descendants-selected="vm.descendantsSelected">
        </sit-export-manager>
	*```
    * 
    * Configuration Example:
    *
    * ```
    * vm.descendantsSelected = true
    * ```
    */

    angular
        .module('siemens.simaticit.common.widgets.export')
        .directive('sitExportManager', exportManager);


    function exportManager() {
        return {
            templateUrl: 'common/widgets/export/sit-export-manager.directive.html',
            controller: ExportManagerController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                descendantsSelected: '=',
                onRegisterApi: '&'
            }
        }
    }

    ExportManagerController.$inject = ['$translate', '$timeout', '$q', '$scope', 'common.services.tagsManager.tagsManagementService'];

    function ExportManagerController($translate, $timeout, $q, $scope, tagsManagementService) {
        var self = this;

        function activate() {
            self.setDescendantsSelected = setDescendantsSelected;
            self.value = [
                {
                    label: $translate.instant('common.export.exportDescendants'),
                    checked: false
                }];
            self.descendantsSelected = self.value[0].checked;
            showDataSegregationMessage();

            function showDataSegregationMessage() {
                if (tagsManagementService.isDataSegregationEnabled()) {
                    self.visible = true;
                    self.message = $translate.instant('common.export.exportWithDataSegregation');
                    self.typeOfMessageWarning = $translate.instant('common.export.warningInformation');
                }
            }
        }
        activate();

        function setDescendantsSelected(oldValue, newValue) {
            if (newValue) {
                self.descendantsSelected = true;
            }
            else {
                self.descendantsSelected = false;
            }
        }
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.export').provider('siemens.simaticit.common.widgets.export.exportMgt', exportMgtProvider);

    exportMgtProvider.$inject = ['$stateProvider'];
    function exportMgtProvider($stateProvider) {
        var vm = this;
        activate();

        function activate() {
            vm.$get = getService;
            vm.getService = getService;
        }

        function getService() {
            return new Service($stateProvider);
        }
    }

    function Service($stateProvider) {
        this.addState = function (currentState) {
            $stateProvider.state({
                name: currentState + '.Export',
                url: '/ExportMgt',
                views: {
                    'property-area-container@': {
                        templateUrl: 'common/widgets/export/sit-export.html',
                        controller: 'siemens.simaticit.common.widgets.export.ExportScreenController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    title: 'Export'
                },
                params: {
                    objIds: {array: true},
                    entity: '',
                    app: ''
                }
            });
        }
    }
})();