(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskDefinitionContexts', eqpAllocationTaskDefinitionDirective);

    function eqpAllocationTaskDefinitionDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskDefinitionContexts/piTaskDefinitionContexts.html',
            controller: eqpAllocationTaskDefinitionContextController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                'taskDefinitionId': '='
            },
            bindToController: {}
        };
    }

    eqpAllocationTaskDefinitionContextController.$inject = ['$rootScope',
        '$translate',
        'taskDefinition.service',
        '$scope',
        'task.service'];

    function eqpAllocationTaskDefinitionContextController($rootScope, $translate, taskDefinitionService, $scope, taskService) {
        var vm = this;
        activate();

        function activate() {
            vm.contextOptions = getContextOptions();
            refresh($scope.taskDefinitionId);
        }

        function getContextOptions() {
            return {
                containerID: 'contextList',
                userPrefId: 'TDContextPref',
                selectionMode: 'single',
                multiSelect: false,
                enablePaging: false,
                gridConfig: {
                    columnDefs: [
                        { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                        { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                        { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                        { field: 'ContextEntityType', displayName: $translate.instant('picore.headers.tables.contextEntityType') }
                    ]
                },
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc',
                    fields: [
                        { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                        { field: 'Name', displayName: $translate.instant('picore.headers.tables.name') },
                        { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') },
                        { field: 'ContextEntityType', displayName: $translate.instant('picore.headers.tables.contextEntityType') }
                    ]
                },
                pagingOptions: {
                    pageSize: 10
                },
                tileConfig: {
                    titleField: 'NId',
                    descriptionField: 'Name',
                    propertyFields: [
                        { field: 'Description', displayName: $translate.instant('picore.headers.tables.description') }
                    ]
                },
                onSelectionChangeCallback: onContextSelectionChanged,
                selectStyle: 'alternate',
                image: 'fa fa-list',
                viewMode: 'g',
                viewOptions: 'gl'
            };
        }


        function onContextSelectionChanged(rows, row) {
            $rootScope.$emit('TaskDefinition:selectionChanged', { row: row });
        }

        function refresh(taskDefinitionId) {
            // BUG #185438, #185439
            var options = taskDefinitionId;
            return taskService.getContextByDefinition(options).then(onGetContextData);

            function onGetContextData(data) {
                if ((data) && (data.succeeded)) {
                    vm.contextData = data.value;
                } else {
                    vm.contextData = [];
                }

                if (taskDefinitionService.selectedTDCId) {
                    var found = _.find(vm.contextData, function (context) {
                        return context.Id === taskDefinitionService.selectedTDCId;
                    });
                    if (found) {
                        found.selected = true;
                    }
                }
                return data.value;
            }
        }
    }
})();
