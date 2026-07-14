/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('materialbomset', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/MaterialBoMSet/MaterialBoMSet.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    /**
    * Component controller for Materials/Bill Of materials Association
    * @constructor
    * @ngdoc object
    * @name ComponentController
    * @scope
    * @requires $rootScope {service} $rootScope
    * @requires $scope {service} $scope
    * @requires loggerService {service} common.services.logger.service
    * @requires base {service} common.base
    * @requires $translate {service} translate
    */
    ComponentController.$inject = ['$rootScope',
        '$scope',
        'common.services.logger.service',
        'common.services.component.uiComponentService',
        'common.base',
        '$translate'];
    function ComponentController($rootScope,
        $scope,
        loggerService,
        uiComponentService,
        base,
        $translate) {
        var vm = this;
        var logger;
        vm.materialBoMAssociationComponentTitle = $translate.instant('picore.titles.materialToBoMAssociationComponentTitle');
        vm.translatedAssociate = $translate.instant('picore.buttonsAndTooltips.associate');
        vm.translatedCancel = $translate.instant('picore.buttonsAndTooltips.cancel');
        activate();
        function activate() {
            logger = loggerService.getModuleLogger('materialbomset');
            init();
            registerEvents();
            exposeApi();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
        }

        function exposeApi() {
            vm.setTargetStates = setTargetStates;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
        }

        function registerEvents() {
            $scope.$on('$destroy', deregisterEvents);
            $scope.$on('materialBoMSuccessfulAssociation', onSuccessfulAssociation);
            $scope.$on('materialBoMAssociationCancel', onCancelClick);
        }

        function onCancelClick() {
            onCancel(vm.cancelTargetStateId);
        }

        function onSuccessfulAssociation(e, data) {
            onMaterialBoMSet(data.materialId, data.bomId, vm.setTargetStateId);
        }

        function deregisterEvents() {
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }

        /**
         * @ngdoc event
         * @name onMaterialBoMSet
         * @eventType broadcast on root scope
         * @description
         * Raised when the associate action button is clicked.
         *
         * @param {string} materialId The identifier of the material that has been asssociated.
         * @param {string} bomId The identifier of the bill of materials associated to the materials.
         * @param {string} setTargetStateId The module to navigate to.
         */
        function onMaterialBoMSet(materialId, bomId, setTargetStateId) {
            var eventName = 'materialbomset.' + vm.name + '.onMaterialBoMSet';
            $rootScope.$emit(eventName, { 'materialId': materialId, 'bomId': bomId, 'setTargetStateId': setTargetStateId });
        }

        /**
         * @ngdoc event
         * @name onCancel
         * @eventType broadcast on root scope
         * @description
         * Raised when the cancel action button is clicked.
         *
         * @param {string} cancelTargetStateId The module that manages the cancel operation.
         */
        function onCancel(cancelTargetStateId) {
            var eventName = 'materialbomset.' + vm.name + '.onCancel';
            $rootScope.$emit(eventName, { 'cancelTargetStateId': cancelTargetStateId });
        }

        /**
         * @ngdoc method
         * @name setTargetStates
         * @module Siemens.SimaticIT.UAPI.PICore
         *
         * @description Sets the module to navigate to in case of save operation and in case of cancel operation.
         * @param {string} setStateId The module name to navigate to performing successfully the association.
         * @param {string} cancelStateId The module name to navigate to clicking on cancel button.
         */
        function setTargetStates(setStateId, cancelStateId) {
            vm.setTargetStateId = setStateId;
            vm.cancelTargetStateId = cancelStateId;
        }
    }
})();
