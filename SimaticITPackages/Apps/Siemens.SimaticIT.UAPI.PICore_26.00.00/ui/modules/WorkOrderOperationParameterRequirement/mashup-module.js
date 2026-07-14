
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.WorkOrderOperationParameterRequirement',[])
        .config(['$stateProvider', function ($stateProvider) {


            var mashupHomeView0 = {
                name: 'home.Siemens_SimaticIT_UAPI_PICore_WorkOrderOperationParameterRequirement_home',
                url: '/home_Siemens_SimaticIT_UAPI_PICore_WorkOrderOperationParameterRequirement_home/?WorkOrderOperationId',
                views: {
                    'Canvas@': {
                        templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/WorkOrderOperationParameterRequirement/home.Siemens_SimaticIT_UAPI_PICore_WorkOrderOperationParameterRequirement_home.html',
                        controller: 'Siemens_SimaticIT_UAPI_PICore_WorkOrderOperationParameterRequirement_homeController',
						 controllerAs: 'mashup'
                    }
                },
                data: {
                    title: 'home screen'
                },


				context:{

				},
				params: {
                    _WorkOrderOperationIdType: 'string',
                    WorkOrderOperationId: null

                }
            };
            $stateProvider.state(mashupHomeView0);
			        }]);
})();
