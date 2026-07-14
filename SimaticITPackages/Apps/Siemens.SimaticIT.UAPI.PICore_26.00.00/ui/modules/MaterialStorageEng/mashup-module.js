
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.MaterialStorageEng', [])
        .config(['$stateProvider', function ($stateProvider) {


            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageEng_eng',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_MaterialStorageEng_eng',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/MaterialStorageEng/home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageEng_eng.html',
                        controller: 'home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageEng_engController',
                        controllerAs: 'mashup'
                    }
                },
                data: {
                    title: 'picore.titles.materialStorageEng'
                },


                context: {

                },
                params: {

                }
            };
            $stateProvider.state(mashupHomeView0);
        }]);
})();
