/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    var folder = 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask';

    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask', []).config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider.state(getStateTaskListFiltered());
                $stateProvider.state(getStateProductionContextDisplayed());
                $stateProvider.state(getStateStartProcessDefinitionDisplayed());
            }
    ]);

    function getStateTaskListFiltered() {
        return {
            name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList',
            url: '/home_Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList',
            views: {
                'Canvas@': {
                    templateUrl: folder + '/OperatorTaskList.controller.html',
                    controller: 'piOperatorTaskListController',
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.OperatorTaskList'
            },
            context: {
                workOrderId: null

            },
            params: {
                WorkOrderNId: null,
                WorkOrderOperationNId: null,
                EquipmentNId: null,
                //WorkProcedureNId: null,
                //WorkProcedureRevision: null,
                WorkOrderOperationActivityId: null,
                originUrl: null,
                isEditEnabled: 'true',
                isActionBarVisible: 'true',
                woopOpenTargetState: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrder_WorkOrderOperationContent',
                isOpenEnabled: 'true',
                workOrderId: null,
                workOrderOperationId: null,
                woOpActionBarVisible: 'true',
                woListAddTargetState: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrder_WorkOrderCreation',
                woListViewTargetState: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrder_WorkOrderContent',
                woListAddByOrderTargetState: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrder_WorkOrderCreationFromOrder'
            },
            resolve: {
                initUdmServices: ['uapi-statusColorMapService', function (statusColorMapService) {
                    return statusColorMapService.initialized;
                }],
                taskHeaderComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskHeader').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                        });
                    }
                ],
                taskDetailComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskDetail').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                            });
                    }
                ],
                taskContextComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskContext').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                        });
                    }
                ],
                globalLeftSideComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('GlobalLeftSide').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                            });
                    }
                ],
                leftSideTaskComponent: ['$location', '$log','Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskLeftSide').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                            });
                    }
                ],
                taskRightSideComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskRightSide').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                            });
                    }
                ],
                taskFooterComponent: ['$location', '$log', 'Siemens.SimaticIT.UAPI.PICore.commonService',
                    function ($location, $log, commonService) {
                        //Load the component manifest using defined folder structure if a component has been defined
                        return commonService.getManifest('TaskFooter').then(function (data) {
                            return data;
                        }, function () {
                            $log.error('Please check the name of app and component.');
                            $location.url('/');
                            });
                    }
                ]
            }
        };
    }

    // State in which the Production Context is displayed
    function getStateProductionContextDisplayed() {
        var folder = 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask';
        return {
            name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.ProductionContext',
            url: '/ProductionContext',
            views: {
                'property-area-container@': {
                    templateUrl: folder + '/ProductionContextArea.controller.html',
                    controller: 'piProductionContextAreaController',
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.OperatorTaskList'
            }
        };
    }

    // State in which the Production Context is displayed
    function getStateStartProcessDefinitionDisplayed() {
        var folder = 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask';
        return {
            name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.StartProcessDefinition',
            url: '/StartProcessDefinition',
            views: {
                'property-area-container@': {
                    templateUrl: folder + '/StartProcessDefinition.controller.html',
                    controller: 'piStartProcessDefinitionAreaController',
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.OperatorTaskList'
            }
        };
    }


}());
