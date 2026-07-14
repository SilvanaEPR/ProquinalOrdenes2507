(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore').component('siemensSimaticitUapiPicoreTaskerrormessagecomponent', ComponentDefinition());

    function ComponentDefinition() {
        return {
            bindings: {
                name: '@',
                id: '@'
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/components/TaskErrorMessageComponent/TaskErrorMessageComponent.html',
            controller: ComponentController,
            controllerAs: 'vm'
        };
    }

    ComponentController.$inject = ['common.base','$stateParams'];
    function ComponentController(base, $stateParams) {
        var vm = this;
        var logger;

        activate();
        function activate() {
            logger = base.services.logger.service.getModuleLogger('siemensSimaticitUapiPicoreTaskerrormessagecomponent');

            init();
            exposeApi();
        }

        function init() {
            logger.logDebug('Initializing component....', vm.name);
            vm.viewerData = [];
            vm.viewerOptions = {};
            vm.taskId = $stateParams.componentStateParams.taskId;
        }

        function exposeApi() {
            vm._onComponentDestroy = onComponentDestroy;
            vm._onComponentResize = onComponentResize;
            vm._onDesignModeToggle = onDesignModeToggle;
        }

        function onComponentDestroy() {
            logger = null;
            vm.viewerData = null;
            vm.viewerOptions = null;

            //In the last, make the vm to null
            vm = null;
        }

        function onComponentResize(size) {
            logger.logDebug('Component resized....:' + size.width + ',' + size.height);
        }

        function onDesignModeToggle(isEnabled) {
            logger.logDebug('Design mode toggled....' + isEnabled);
        }
    }
})();
