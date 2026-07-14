
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.ActualLotsAndMTUs',[])
        .config(['$stateProvider', function ($stateProvider) {


            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_ActualLotsAndMTUs_home',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_ActualLotsAndMTUs_home/?closeButtonEnabled&MatReqId',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/ActualLotsAndMTUs/home.Siemens_SimaticIT_UAPI_PICore_ActualLotsAndMTUs_home.html',
						 controller: 'Siemens_SimaticIT_UAPI_PICore_ActualLotsAndMTUs_homeController',
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
