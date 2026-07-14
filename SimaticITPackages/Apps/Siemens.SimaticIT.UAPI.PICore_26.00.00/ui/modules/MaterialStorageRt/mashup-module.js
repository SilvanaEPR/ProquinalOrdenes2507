
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.MaterialStorageRt', [])
        .config(['$stateProvider', function ($stateProvider) {


            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageRt_runtime',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_MaterialStorageRt_runtime/?isActionEnabled',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/MaterialStorageRt/home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageRt_runtime.html',
                        controller: 'home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageRt_runtimeController',
                        controllerAs: 'mashup'
                    }
                },
                data: {
                    title: 'picore.titles.materialStorageRt'
                },


                context: {

                },
                params: {
                    _isActionEnabledType: 'boolean',
                    isActionEnabled: 'false'
                }
            };
            $stateProvider.state(mashupHomeView0);
        }]);
})();
