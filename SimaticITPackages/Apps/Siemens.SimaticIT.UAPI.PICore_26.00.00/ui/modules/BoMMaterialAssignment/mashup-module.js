/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.BoMMaterialAssignment', []).config(StateConfig);

    StateConfig.$inject = ['$stateProvider'];
    function StateConfig($stateProvider) {

        var mashupHomeView = {
            name: 'home.Siemens_SimaticIT_UAPI_PICore_BoMMaterialAssignment_home',
            url: '/home_Siemens_SimaticIT_UAPI_PICore_BoMMaterialAssignment_home',
            views: {
                'Canvas@': {
                    templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/BoMMaterialAssignment/home.Siemens_SimaticIT_UAPI_PICore_BoMMaterialAssignment_home.html',
                    controller: 'home.Siemens_SimaticIT_UAPI_PICore_BoMMaterialAssignment_homeController',
                    controllerAs: 'mashup'
                }
            },
            data: {
                title: 'Set BoM Material'
            },


            context: {

            },
            params: {

            }
        };
        $stateProvider.state(mashupHomeView);
    }
}());
