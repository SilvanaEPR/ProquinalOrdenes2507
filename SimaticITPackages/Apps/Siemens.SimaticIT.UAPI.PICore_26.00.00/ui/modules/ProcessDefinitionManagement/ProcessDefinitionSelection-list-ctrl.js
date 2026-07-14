(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.ProcessDefinitionManagement').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['$state', '$stateParams', '$rootScope', '$scope', '$translate', '$window', 'common.base', 'common.services.logger.service'];
    function ListScreenController($state, $stateParams, $rootScope, $scope, $translate, $window, base, loggerService) {
        var self = this;
        var logger, rootstate, backendService, notificationTileService;
        var entityListInJson, equipmentNId;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.ProcessDefinitionManagement.ProcessDefinitionSelection');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.Siemens_SimaticIT_UAPI_PICore_ProcessDefinitionManagement_ProcessDefinitionSelection';
            notificationTileService = base.widgets.notificationTile.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];
            equipmentNId = uriDecode($stateParams.EquipmentNId);
            var mainEntity = JSON.parse(uriDecode($stateParams.MainEntity));
            self.entityNId = mainEntity.EntityNId;
            self.entityRevision = mainEntity.EntityRevision != null ? mainEntity.EntityRevision : '';

            //Expose Model Methods
            self.StartWorkProcessButtonHandler = StartWorkProcessButtonHandler;
        }

        function initGridOptions() {
            self.viewerOptions = {
                containerID: 'ListContainer',
                userPrefId: 'prefPIPD',
                selectionMode: 'single',
                viewMode: 'l',
                viewOptions: 'gl',
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc'
                },
                svgIcon: 'common/icons/typeWorkflowProcess48.svg',
                tileConfig: {
                    'titleField': 'NId',
                    'descriptionField': 'Description',
                    'propertyFields': [
                      {
                          'field': 'Name',
                          'displayName': $translate.instant('picore.headers.tables.name')
                      },
                      {
                          'field': 'Revision',
                          'displayName': $translate.instant('picore.headers.tables.revision')
                      },
                      {
                          'field': 'Isexecutable',
                          'displayName': $translate.instant('picore.headers.tables.isExecutable')
                      }
                    ]
                },
                gridConfig: {
                    columnDefs: [
                      { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                      { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                      { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                      { field: 'Revision', displayName: $translate.instant('picore.headers.tables.revision') },
                      { field: 'Isexecutable', displayName: $translate.instant('picore.headers.tables.isExecutable') }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            };
        }

        function initGridData() {
            if ($stateParams.MainEntity != null || $stateParams.RelatedEntities != null) {
                entityListInJson = JSON.parse('{"MainEntity":' + uriDecode($stateParams.MainEntity) +
                    ',"RelatedEntities":' + uriDecode($stateParams.RelatedEntities) +
                    '}');
                execRead('RF_GetAssociatedProcessDefinitionByEntity', entityListInJson).then(function (data) {
                    if ((data) && (data.succeeded)) {
                        self.viewerData = data.value[0].ProcessDefinitions;
                    } else {
                        self.viewerData = [];
                    }
                }, backendService.backendError);
            }
        }

        function execRead(publicName, params) {
            return backendService.read({
                'appName': 'PICore',
                'functionName': publicName,
                'params': params
            });
        }

        function StartWorkProcessButtonHandler(clickedCommand) {
            var params = {
                TriggeringEntityNId: entityListInJson.MainEntity.EntityNId,
                TriggeringEntityRevision: entityListInJson.MainEntity.EntityRevision === undefined ? '' : entityListInJson.MainEntity.EntityRevision,
                TriggeringEntityType: entityListInJson.MainEntity.AssociatedType,
                TriggeringEntityEquipmentNId: equipmentNId,
                ProcessDefinitionNId: self.selectedItem.NId,
                ProcessDefinitionRevision: self.selectedItem.Revision
            };
            return execCommand('StartNewWorkProcessFromEntity', params).then(onStartWorkProcessCompleted);
        }

        function onStartWorkProcessCompleted(data) {
            notificationTileService.info($translate.instant('picore.notifications.info.WorkProcessStartedCorrectly', { WorkProcessNId: data.data.WorkProcessNId }));
            var stateParams = { };
            stateParams.EquipmentNId = equipmentNId;
            $state.go('home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList', stateParams);
        }

        function execCommand(publicName, params) {
            logger.logDebug('Executing command.......', publicName);
            return backendService.invoke({
                'appName': 'PICore',
                'commandName': publicName,
                'params': params
            });
        }

        function onGridItemSelectionChanged(items, item) {
            if (item && item.selected) {
                self.selectedItem = item;
                setButtonsVisibility(true);
            } else {
                self.selectedItem = null;
                setButtonsVisibility(false);
            }
        }

        // Internal function to make item-specific buttons visible
        function setButtonsVisibility(visible) {
            self.isButtonVisible = visible;
        }

        // Decode correctly the uri
        function uriDecode(str) {
            if (str == null) {
                return '""';
            }
            return decodeURIComponent(str.replace(/\+/g, ' '));
        }
    }

    ListScreenRouteConfig.$inject = ['$stateProvider'];
    function ListScreenRouteConfig($stateProvider) {
        var moduleStateName = 'home.Siemens_SimaticIT_UAPI_PICore_ProcessDefinitionManagement';
        var moduleStateUrl = 'Siemens_SimaticIT_UAPI_PICore_ProcessDefinitionManagement';
        var moduleFolder = 'Siemens.SimaticIT.UAPI.PICore/modules/ProcessDefinitionManagement';

        var state = {
            name: moduleStateName + '_ProcessDefinitionSelection',
            url: '/' + moduleStateUrl + '_ProcessDefinitionSelection',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/ProcessDefinitionSelection-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Process Definition Selection'
            },
            params: {
                MainEntity: null,
                RelatedEntities: null,
                EquipmentNId: null
            }
        };
        $stateProvider.state(state);
    }
}());
