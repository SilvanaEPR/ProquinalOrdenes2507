(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.ProductionSetup').controller('productionSetupController', productionSetupController);

    productionSetupController.$inject = ['$state', 'common.services.logger.service'];
    function productionSetupController($state,  loggerService) {
        var self = this;
        var logger;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('Siemens.SimaticIT.UAPI.PICore.ProductionSetup');

            init();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            (function prodCtx(self) {
                self.onProdCtxResgisterApi = onProdCtxResgisterApi;
                self.saveProductionContext = saveProductionContext;

                function onProdCtxResgisterApi(api) {
                    self._prodCtxApi = api;
                }

                function saveProductionContext() {
                    logger.logDebug('Start - Save production context');
                    if (self._prodCtxApi) {
                        self._prodCtxApi.saveProductionContext();
                    }
                }
            })(self);

            self.onProdCtxResgisterApi();
        }

        self.save = function () {
            self.saveProductionContext();
        };
    }
}());
