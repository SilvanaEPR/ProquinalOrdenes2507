/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state({
                name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.custom-component',
                url: '/component/:app/:component',
                params: {
                    componentStateParams: null
                },
                views: {

                    'property-area-container@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/ComponentViewer/ComponentViewer.html',
                        controller: 'uapi_ComponentViewerController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    title: 'Custom Component'
                },
                resolve: {
                    componentManifest: ['$stateParams', '$location', '$log', 'common.services.component.uiComponentService',
                        function ($stateParams, $location, $log, uiComponentService) {
                            //Load the component manifest using defined folder structure
                            return uiComponentService.getComponentManifest($stateParams.app, $stateParams.component).then(function (data) {
                                return data;
                            }, function () {
                                $log.error('Please check the name of app and component.');
                                $location.url('/');
                            });
                        }
                    ]
                }
            });
        }]);
})();

