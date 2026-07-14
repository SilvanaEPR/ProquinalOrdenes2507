(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskParameters', taskParametersDirective);

    function taskParametersDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskParameters/piTaskParameters.html',
            controller: taskParametersController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                'taskId': '='
            },
            bindToController: {}
        };
    }
    taskParametersController.$inject = ['$rootScope',
        '$q',
        '$filter',
        '$translate',
        'common.base',
        'task.service',
        '$scope'];

    function taskParametersController($rootScope, $q, $filter, $translate, base, taskService, $scope) {
        var vm = this;
        var backendService;

        activate();

        function activate() {
            init();
            initICV();
            exposeModelMethods();
        }

        function exposeModelMethods() {
            vm.getAll = getAll;
        }

        function init() {
            backendService = base.services.runtime.backendService;
            vm.directions = {
                "Input": "Input",
                "Input_Output": "Input/Output",
                "Output": "Output"
            };
        }

        function initICV() {
            vm.viewerOptions = {
                containerID: 'TaskParameterContainer',
                userPrefId: 'TaskDetailParameterPref',
                filterBarOptions: 'sqgf',
                enablePaging: false,
                alwaysShowPager: false,
                filterFields: [
                    {
                        field: 'NId',
                        displayName: $translate.instant('SIT.TSK.common.id'),
                        type: 'string',
                        default: false
                    },
                    //{ field: 'ParameterType', displayName: $translate.instant('task.ParameterType'), type: 'enum', values: _.pluck(taskService.types, 'Id'), default: false, widget: 'sit-select', visible: false },
                    //{ field: 'ParameterValue', displayName: $translate.instant('task.ParameterValue'), type: 'string', default: false, visible: false },
                    //{ field: 'ParameterUoMNId', displayName: $translate.instant('task.ParameterUoM'), type: 'string', default: false, visible: false },
                    {
                        field: 'Direction',
                        displayName: $translate.instant('task.Direction'),
                        type: 'enum',
                        values: Object.keys(vm.directions),
                        default: false,
                        allowedCompareOperators: [
                            '=',
                            '<>'
                        ]
                    }
                    //,{ field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly'), type: 'boolean', default: false, visible: false }
                ],
                gridConfig: {
                    columnDefs: [
                        { field: 'NId', displayName: $translate.instant('SIT.TSK.common.id') },
                        { field: 'ParameterType', displayName: $translate.instant('task.ParameterType'), visible: false },
                        { field: 'ParameterValue', displayName: $translate.instant('task.ParameterValue') },
                        { field: 'ParameterUoMNId', displayName: $translate.instant('task.ParameterUoM') },
                        { field: 'Direction', displayName: $translate.instant('task.Direction') },
                        {
                            field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly'),
                            showCheckbox: true, dataType: 'boolean', visible: false
                        },
                        { field: 'CreatedOn', displayName: $translate.instant('task.createdOn'), cellFilter: 'date:\'medium\'', visible: false },
                        { field: 'LastUpdatedOn', displayName: $translate.instant('task.lastUpdatedOn'), cellFilter: 'date:\'medium\'', visible: false }
                    ]
                },
                quickSearchOptions: { enabled: true, field: 'NId', displayName: $translate.instant('SIT.TSK.common.id') },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc',
                    fields: [
                        { field: 'NId', displayName: $translate.instant('SIT.TSK.common.id') },
                        //{ field: 'ParameterType', displayName: $translate.instant('task.ParameterType') },
                        { field: 'Direction', displayName: $translate.instant('task.Direction') }
                        //,{ field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly') }
                    ]
                },
                groupFields: [
                    //{ field: 'ParameterType', displayName: $translate.instant('task.ParameterType') },
                    { field: 'Direction', displayName: $translate.instant('task.Direction') }
                    //,{ field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly') }
                ],
                tileConfig: {
                    titleField: 'NId',
                    descriptionField: 'ParameterType',
                    isCell: true,
                    propertyFields: [
                        { field: 'Direction', displayName: $translate.instant('task.Direction') },
                        { field: 'ParameterValue', displayName: $translate.instant('task.ParameterValue') },
                        {
                            field: 'ParameterUoMNId', displayName: $translate.instant('task.ParameterUoM'), visible: function (tileContent) {
                                if (tileContent && tileContent.ParameterType === 'Quantity') {
                                    return true;
                                }
                                return false;
                            }
                        },
                        { field: 'IsReadOnly', displayName: $translate.instant('task.isReadOnly'), visible: false },
                        { field: 'CreatedOn', displayName: $translate.instant('task.createdOn'), visible: false },
                        { field: 'LastUpdatedOn', displayName: $translate.instant('task.lastUpdatedOn'), visible: false }
                    ]
                },
                selectionMode: 'none',
                selectStyle: 'alternate',
                typeIcon: 'TaskExecution',
                viewMode: 'g',
                viewOptions: 'gm',
                serverDataOptions: {
                    dataEntity: 'TaskParameter',
                    optionsString: '',
                    dataService: vm
                },
                uniqueID: 'Id'
            };
            vm.viewerData = [];
        }

        function getAll(dataEntity, optionsString) {
            var defer = $q.defer();
            taskService.getParameterByTask($scope.taskId, optionsString).then(function (data) {
                if ((data) && (data.succeeded)) {
                    data.value.map(function (parameter) {
                        parameter.Direction = vm.directions[parameter.Direction];
                        parameter.CreatedOn = $filter('date')(parameter.CreatedOn, 'medium');
                        parameter.LastUpdatedOn = $filter('date')(parameter.LastUpdatedOn, 'medium');
                        if (parameter.ParameterType === 'Datetime' && parameter.ParameterValue !== undefined && parameter.ParameterValue !== null && parameter.ParameterValue.length > 0) {
                            var date = new Date(parameter.ParameterValue + ' UTC');
                            parameter.ParameterValue = $filter('date')(date, 'medium');
                        }
                        return parameter;
                    });
                    vm.viewerData = data.value;
                } else {
                    vm.viewerData = [];
                }

                defer.resolve(data);
            }, backendService.backendError);

            return defer.promise;
        }
    }
})();
