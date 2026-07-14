(function(){
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore.ProductionSetup', []).config(StateConfig);

    StateConfig.$inject = ['$stateProvider'];
    function StateConfig($stateProvider) {
        var moduleStateName = 'home.Siemens_SimaticIT_UAPI_PICore_ProductionSetup_Settings';
        var moduleStateUrl = 'Siemens.SimaticIT.UAPI_PICore_ProductionSetup_Settings';
        var moduleFolder = 'Siemens.SimaticIT.UAPI.PICore/modules/ProductionSetup';

        var state = {
            name: moduleStateName,
            url: '/' + moduleStateUrl,
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/ProductionSetup.html',
                    controller: 'productionSetupController',
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'picore.titles.productionSetup'
            }
        };
        $stateProvider.state(state);
    }
}());
