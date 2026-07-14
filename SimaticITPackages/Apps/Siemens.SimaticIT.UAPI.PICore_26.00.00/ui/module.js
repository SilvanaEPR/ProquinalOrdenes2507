/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';


    //angular.module('Siemens.SimaticIT.UAPI.PICore', ['angularMoment', 'Siemens.SimaticIT.UAPI.PICore.services', 'ui.tree'])
    angular.module('Siemens.SimaticIT.UAPI.PICore', ['angularMoment', 'ui.tree']).config([
            '$stateProvider', 'treeConfig',
            function ($stateProvider, treeConfig) {
                treeConfig.defaultCollapsed = true;
            }
        ]).run([
            'RESOURCE', '$state', 'common.services.swac.SwacUiModuleManager', '$translate', 'uapi-productionContextService', '$timeout', function (RESOURCE, $state, swacManager, $translate, productionContextService, $timeout) {
                RESOURCE.path.push({
                    name: 'Siemens.SimaticIT.UAPI.PICore/resources/',
                    modules: [
                        { name: 'Siemens.SimaticIT.UAPI.PICore.common' }
                    ]
                });
                /* Timeout is mandatory because sometimes, the ressource containing the translation for the production context
                *   is not loaded before the get of prod ctx. Anyway, the busy indicator will disappear after the loading of the prod ctx
                */
                $timeout(function () { productionContextService.updateApolloHeader(); }, 2000);

                // Push the production context access to the bottom left command bar
                if (swacManager.enabled) {
                    swacManager.contextServicePromise.promise.then(function () {
                        var cmds = { commands: {}, commandHandlers: {}, commandPlacements: {}, actions: {} };
                        var ProductionContext = 'prodCtxCommand';
                        cmds.commands[ProductionContext] = {
                            iconId: 'cmdProductionContext',
                            title: $translate.instant('picore.buttonsAndTooltips.productionSetup'),
                            isToggle: true,
                            template: ''
                        };
                        cmds.commandHandlers[ProductionContext] = {
                            id: ProductionContext, action: 'goToProductionContextScreen',
                            activeWhen: { condition: 'conditions.true' }, visibleWhen: { condition: 'conditions.true' }
                        };
                        cmds.commandPlacements[ProductionContext] = { id: ProductionContext, uiAnchor: 'aw_userSessionbar', priority: 1 };
                        cmds.actions.goToProductionContextScreen = {
                            actionType: 'JSFunction', method: 'navigateToState',
                            inputData: {
                                state: 'home.Siemens_SimaticIT_UAPI_PICore_ProductionSetup_Settings',
                                params: {}, options: { reload: false }
                            }, deps: 'js/mom.swac.compatibility.service'
                        };
                        swacManager.eventBusServicePromise.promise.then(function (eventBusSvc) {
                            eventBusSvc.publish('mom.commands.update', cmds);
                        });
                    });
                }
            }
        ]).filter('durationFormatter', function () {
            return function (value) {
                var dur = moment.duration(value);
                value = new Date().setTime(dur.as('milliseconds'));
                if (!moment.isDuration(value)) {
                    value = moment.duration(value);
                }
                if (value.asMilliseconds() === 0) {
                    return '';
                } else if (value.asDays() >= 1) {
                    return Math.floor(value.asDays()) + '.' + ('0' + value.hours()).slice(-2) + ':' + ('0' + value.minutes()).slice(-2) + ':' + ('0' + value.seconds()).slice(-2);
                } else {
                    return ('0' + value.hours()).slice(-2) + ':' + ('0' + value.minutes()).slice(-2) + ':' + ('0' + value.seconds()).slice(-2);
                }
            };
        });
})();
