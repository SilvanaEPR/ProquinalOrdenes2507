/*
* SIMATIC IT Unified Architecture for Process Industries V2.4.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state({
                name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.overview-custom-component',
                url: '/overviewcomponent/:app/:component',
                params: {
                    componentStateParams: null
                },
                views: {
                    'property-area-container@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/components/TaskOverviewComponent.html',
                        controller: 'uapi_OperatorTaskOverviewController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    title: 'Overview Custom Component'
                },
                resolve: {
                    componentManifest: ['$stateParams', '$location', '$log', 'common.services.component.uiComponentService', '$q', '$http',
                        function ($stateParams, $location, $log, uiComponentService, $q, $http) {
                            //Load the component manifest using defined folder structure if a component has been defined
                            if ($stateParams.app !== '' && $stateParams.component !== '') {
                                return getManifest($stateParams.app, $stateParams.component).then(function (data) {
                                    $stateParams.componentStateParams.action = 'operator_view';
                                    return data;
                                }, function () {
                                    $log.error('Please check the name of app and component.');
                                    $location.url('/');
                                });
                            } else {
                                $log.info('No component defined for this task type.');
                                return null;
                            }
                            function getManifest(appName, cmpName) {
                                var url = appName + '\\components\\' + cmpName + '.json';
                                var defaultCmp = { 'name': 'name' };
                                var deferred = $q.defer();
                                $http.get(url)
                                    .then(function (response) {
                                        deferred.resolve(response.data);
                                    }, function (reason) {
                                        deferred.resolve(defaultCmp);
                                    }).catch(function () {
                                        //deferred.reject;
                                    });
                                return deferred.promise;
                            }
                        }
                    ]
                }
            });

            $stateProvider.state({
                name: 'home.Siemens_SimaticIT_UAPI_PICore_OperatorTask_OperatorTaskList.visibility-custom-component',
                url: '/visibilitycomponent/:app/:component',
                params: {
                    componentStateParams: null
                },
                views: {
                    'property-area-container@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/components/VisibilityComponent.html',
                        controller: 'uapi_OperatorVisibilityController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    title: 'Visibility Custom Component'
                },
                resolve: {
                    componentManifest: ['$stateParams', '$location', '$log', '$q', '$http',
                        function ($stateParams, $location, $log, $q, $http) {
                            //Load the component manifest using defined folder structure if a component has been defined
                            if ($stateParams.app !== '' && $stateParams.component !== '') {
                                return getManifest($stateParams.app, $stateParams.component).then(function (data) {
                                    return data;
                                }, function () {
                                    $log.error('Please check the name of app and component.');
                                    $location.url('/');
                                });
                            } else {
                                $log.info('No component defined for this task type.');
                                return null;
                            }
                            function getManifest(appName, cmpName) {
                                var url = appName + '\\components\\' + cmpName + '.json';
                                var deferred = $q.defer();
                                $http.get(url)
                                    .then(function (response) {
                                        deferred.resolve(response.data);
                                    }, function (reason) {
                                        deferred.resolve('');
                                    }).catch(function () {
                                        deferred.reject('');
                                    });
                                return deferred.promise;
                            }
                        }
                    ]
                }
            });
        }]);
})();

