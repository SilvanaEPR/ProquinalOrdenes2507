/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .controller('piProductionContextAreaController', piProductionContextAreaController);

    piProductionContextAreaController.$inject = ['$translate', '$state', 'common.base'];

    function piProductionContextAreaController($translate, $state, common) {

        var sidePanelManager;

        var self = this;

        activate();

        function activate() {
            init();

            // Show
            sidePanelManager.open({ mode: 'e', size: 'small' });
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            initSidePanel();

            (function prodCtx(self) {
                self.onProdCtxResgisterApi = onProdCtxResgisterApi;
                self.saveProductionContext = saveProductionContext;

                function onProdCtxResgisterApi(api) {
                    self._prodCtxApi = api;
                }

                function saveProductionContext() {
                    if (self._prodCtxApi) {
                        self._prodCtxApi.saveProductionContext();
                    }
                }
            })(self);

            self.onProdCtxResgisterApi();
        }

        function initSidePanel() {
            var cancel = {
                label: $translate.instant('picore.buttonsAndTooltips.cancel'),
                onClick: closeSidePanel,
                enabled: true,
                visible: true
            };
            var apply = {
                label: $translate.instant('picore.buttonsAndTooltips.apply'),
                onClick: applyProductionContext,
                enabled: true,
                visible: true
            };
            self.sidePanelConfig = {
                actionButtons: [
                    apply,
                    cancel
                ],
                closeButton: {
                    showClose: true,
                    onClick: closeSidePanel
                }
            };
        }

        // ==========================================
        // Production Context Backup
        // ==========================================

        function applyProductionContext() {
            self.saveProductionContext();
            $state.go('^');
        }

        function closeSidePanel() {
            sidePanelManager.close();
            $state.go('^');
        }
    }
})();
