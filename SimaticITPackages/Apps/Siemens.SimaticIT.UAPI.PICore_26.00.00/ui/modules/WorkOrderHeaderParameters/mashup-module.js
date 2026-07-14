
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.WorkOrderHeaderParameters', [])
        .config(['$stateProvider', function ($stateProvider) {


            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderHeaderParameters_home',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_WorkOrderHeaderParameters_home/?WorkOrderId',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/WorkOrderHeaderParameters/home.Siemens_SimaticIT_UAPI_PICore_WorkOrderHeaderParameters_home.html',
                        controller: 'Siemens_SimaticIT_UAPI_PICore_WorkOrderHeaderParameters_homeController',
                        controllerAs: 'mashup'
                    }
                },
                data: {
                    title: 'home screen'
                },


                context: {

                },
                params: {
                    _WorkOrderIdType: 'string',
                    WorkOrderId: null

                }
            };
            $stateProvider.state(mashupHomeView0);
        }]);
})();
