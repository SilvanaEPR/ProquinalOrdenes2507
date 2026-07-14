/*  * SIMATIC IT Unified Architecture Foundation V2.2 | Copyright (C) Siemens AG 2017. All Rights Reserved.
 */
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore.OperatorTask')
        .directive('piOptskTags', piOptskTagsDirective);

    function piOptskTagsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/modules/OperatorTask/directives/pi-optsk-tags.directive.html',
            controller: piOptskTagsController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                onRegisterApi: '&',
                onTagClicked: '&'
            }
        };
    }
    piOptskTagsController.$inject = ['$scope', '$translate', '$q', '$state', 'common.base', 'uapi_eventDispatcherService', 'uapi-productionContextService'];


    function piOptskTagsController($scope, $translate, $q, $state, common, eventDispatcherService, productionContextService) {
        var vm = this;
        vm.tags = [];
        vm.tagSet = false;

        function activate() {

            vm.api = {
                refresh: refresh
            };
            vm.onRegisterApi({ api: vm.api });
            vm.remove = removeTag;
        }

        activate();

        // We receive a new Production Context to display
        function refresh(productionContext) {
            var defer = $q.defer();

            // Reset the list of tags
            vm.tags = [];
            for (var i = 0; i < productionContext.ProductionContextFields.length; i++) {
                var field = productionContext.ProductionContextFields[i];

                // Ignore some filters to display only overriden Production Context values
                if (field.NId != 'showTaskWithoutWorkOrderNId' && field.NId != 'showTaskWithoutEquipmentNId' && field.IsOverriden) {
                    // Prepare the binding
                    vm.tagSet = field.NId == 'WorkOrderNId' || field.NId == 'WorkOrderOperationNId';
                    vm.tags[vm.tags.length] = field;
                }
            }
            return defer.promise;
        }

        // The operator has clicked to remove a Tag
        function removeTag(tag) {
            // Propagate the event
            if (vm.onTagClicked) {
                vm.onTagClicked({ tag: tag });
                // Refresh size of the task list
                $timeout(function () {
                    $(window).trigger('resize');
                }, 300);
            }
        }
    }

})();
