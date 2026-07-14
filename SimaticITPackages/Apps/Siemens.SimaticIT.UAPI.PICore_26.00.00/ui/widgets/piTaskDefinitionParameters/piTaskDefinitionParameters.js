(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskDefinitionParameters', taskDefinitionParametersDirective);

    function taskDefinitionParametersDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskDefinitionParameters/piTaskDefinitionParameters.html',
            controller: taskDefinitionParametersController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                'taskDefinitionId': '='
            },
            bindToController: {}
        };
    }
    taskDefinitionParametersController.$inject = ['$rootScope',
        '$translate',
        'taskDefinition.service',
        'Siemens.SimaticIT.UAPI.PICore.TaskDefinition.service',
        '$scope'];

    function taskDefinitionParametersController($rootScope, $translate, taskDefinitionService, uapiTaskDefinitionService, $scope) {
        var vm = this;

        vm._directions = {
            'Input': 'Input',
            'Input_Output': 'Input/Output',
            'Output': 'Output'
        };

        activate();

        function activate() {

            vm.viewerOptions = getViewerOptions();
            refresh();
        }

        function getViewerOptions() {
            return {
                containerID: 'TaskDefinitionParameterContainer',
                gridConfig: {
                    columnDefs: [
                        { field: 'NId', displayName: $translate.instant('picore.headers.tables.nId') },
                        { field: 'ParameterType', displayName: $translate.instant('task.ParameterType') },
                        { field: 'ParameterValue', displayName: $translate.instant('task.ParameterValue') },
                        { field: 'ParameterUoMNId', displayName: $translate.instant('task.ParameterUoM') },
                        { field: 'Direction', displayName: $translate.instant('task.Direction') },
                        {
                            field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly'),
                            cellTemplate: '<input type="checkbox" style="margin: 5px;" disabled ng-checked="row.getProperty(col.field)">'
                        }
                    ]
                },
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc',
                    fields: [
                        { field: 'NId', displayName: 'Id' }
                    ]
                },
                groupFields: [
                    {
                        field: 'ParameterType',
                        displayName: $translate.instant('task.ParameterType')
                    },
                    {
                        field: 'Direction',
                        displayName: $translate.instant('task.Direction')
                    },
                    {
                        field: 'IsReadOnly',
                        displayName: $translate.instant('task.isReadOnly')
                    }
                ],
                pagingOptions: {
                    pageSize: 10
                },
                onSelectionChangeCallback: onSelectionChangeCallback,
                multiSelect: false,
                enablePaging: false,
                selectionMode: 'single',
                selectStyle: 'alternate',
                tileConfig: {
                    titleField: 'NId',
                    descriptionField: 'ParameterType',
                    propertyFields: [
                        { field: 'ParameterValue', displayName: $translate.instant('task.ParameterValue') }
                    ]
                },
                image: 'sit sit-tasklist',
                viewMode: 'g',//g: Shows data in a grid.
                viewOptions: 'gl'//UI elements to be shown in the viewbar
            };
        }

        function onSelectionChangeCallback(rows, row) {
            $rootScope.$emit('TaskDefinition:selectionChanged', { row: row });
        }

        function refresh() {
            return uapiTaskDefinitionService.getTaskDefinitionParametersByTaskDefinitionId($scope.taskDefinitionId).then(onGetViewerData);

            function onGetViewerData(data) {
                vm.viewerData = data.value;

                vm.viewerData.map(function (parameter) {
                    parameter.Direction = vm._directions[parameter.Direction];
                    return parameter;
                });

                if (taskDefinitionService.selectedTDPId) {
                    var found = _.find(vm.viewerData, function (parameter) {
                        return parameter.Id === taskDefinitionService.selectedTDPId;
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
