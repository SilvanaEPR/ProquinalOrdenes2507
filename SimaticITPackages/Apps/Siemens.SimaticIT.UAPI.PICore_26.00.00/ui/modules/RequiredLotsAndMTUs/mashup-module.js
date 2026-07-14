(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.RequiredLotsAndMTUs',[])
        .config(['$stateProvider', function ($stateProvider) {

            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_RequiredLotsAndMTUs_home',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_RequiredLotsAndMTUs_home/?closeButtonEnabled&MatReqId',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/RequiredLotsAndMTUs/home.Siemens_SimaticIT_UAPI_PICore_RequiredLotsAndMTUs_home',
						 controller: 'Siemens_SimaticIT_UAPI_PICore_RequiredLotsAndMTUs_homeController',
						 controllerAs: 'mashup'
                    }
                },
                data: {
                    title: ''
                },
				context:{
				},
				params:{
									_closeButtonEnabledType : 'boolean',
					closeButtonEnabled : 'false',
									_MatReqIdType : 'string',
					MatReqId : null
				}
            };
            $stateProvider.state(mashupHomeView0);
			        }]);
})();
