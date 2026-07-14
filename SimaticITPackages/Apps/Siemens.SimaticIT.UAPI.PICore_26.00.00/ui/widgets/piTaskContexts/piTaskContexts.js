(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskContexts', eqpAllocationTaskContextDirective);

    function eqpAllocationTaskContextDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskContexts/piTaskContexts.html',
            controller: eqpAllocationTaskContextController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                'taskId': '='
            },
            bindToController: {}
        };
    }

    eqpAllocationTaskContextController.$inject = ['$rootScope',
        '$translate',
        'Siemens.SimaticIT.UAPI.PICore.Task.service',
        '$scope'];

    function eqpAllocationTaskContextController($rootScope, $translate, taskService, $scope) {
        var vm = this;
        activate();

        function activate() {
            vm.contextOptions = getContextOptions();
            refresh();
        }

        function getContextOptions() {
            return {
                containerID: 'TaskContextContainer',
                userPrefId: 'TaskContextPref',
                gridConfig: {
                    columnDefs: [
                        { field: 'Context', displayName: $translate.instant('picore.headers.tables.context'), visible: false },
                        { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                        { field: 'Type', displayName: $translate.instant('picore.headers.tables.type'), visible: false },
                        { field: 'Value', displayName: $translate.instant('picore.headers.tables.value') }
                    ]
                },
                tileConfig: {
                    isCell: false,
                    titleField: 'NId',
                    descriptionField: 'Type',
                    propertyFields: [
                        { field: 'Value', displayName: $translate.instant('picore.headers.tables.value') }
                    ]
                },
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc',
                    fields: [
                        { field: 'Context', displayName: $translate.instant('picore.headers.tables.context') },
                        { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                        { field: 'Type', displayName: $translate.instant('picore.headers.tables.type') }
                    ]
                },
                groupFields: [
                    { field: 'Context', displayName: $translate.instant('picore.headers.tables.context') },
                    { field: 'Type', displayName: $translate.instant('picore.headers.tables.type') }
                ],
                groupField: 'Context',
                filterBarOptions: 'sqfg',
                filterFields: [
                    {
                        field: 'Context',
                        displayName: $translate.instant('picore.headers.tables.context'),
                        type: 'string',
                        default: true,
                        allowedCompareOperators: [
                            '=',
                            '<>',
                            'contains',
                            'startsWith',
                            'endsWith'
                        ]
                    },
                    {
                        field: 'NId',
                        displayName: $translate.instant('picore.headers.tables.nId'),
                        type: 'string',
                        default: true,
                        allowedCompareOperators: [
                            '=',
                            '<>',
                            'contains',
                            'startsWith',
                            'endsWith'
                        ]
                    },
                    {
                        field: 'Type',
                        displayName: $translate.instant('picore.headers.tables.type'),
                        type: 'string',
                        default: true,
                        allowedCompareOperators: [
                            '=',
                            '<>',
                            'contains',
                            'startsWith',
                            'endsWith'
                        ]
                    }
                ],
                enablePaging: false,
                multiSelect: false,
                selectionMode: 'none',
                viewMode: 'g',//g: Shows data in a grid.
                viewOptions: 'gm'//UI elements to be shown in the viewbar
            };
        }

        function refresh() {
            return taskService.getTaskContextsByTaskId($scope.taskId).then(onGetContextData);
            function onGetContextData(data) {
                if ((data) && (data.succeeded)) {
                    vm.contextData = prepareData(data.value);
                } else {
                    vm.contextData = [];
                }
            }
        }

        function prepareData(contexts) {
            var data = [];
            contexts.forEach(function (context) {
                context.UserFields.forEach(function (field) {
                    var entry = { Context: context.NId, NId: field.NId, Value: field.UserFieldValue, Type: field.UserFieldType };
                    data.push(entry);
                });
            });
            return data;
        }
    }
})();
