(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')
        .directive('piTaskApplicationLogs', taskApplicationLogsDirective);

    function taskApplicationLogsDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piTaskApplicationLogs/piTaskApplicationLogs.html',
            controller: taskApplicationLogsController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
                'taskId': '='
            },
            bindToController: {}
        };
    }
    taskApplicationLogsController.$inject = ['$rootScope',
        '$translate',
        'Siemens.SimaticIT.UAPI.PICore.Task.service',
        '$scope',
        '$filter'];

    function taskApplicationLogsController($rootScope, $translate, piTaskService, $scope, $filter) {
        var vm = this;
        activate();

        function activate() {

            vm.viewerOptions = getViewerOptions();
            refresh();
        }

        function getViewerOptions() {
            return {
                containerID: 'notificationListDiv',
                userPrefId: 'UserPreferences4Notification',
                selectionMode: 'none',
                viewOptions: 'g',
                quickSearchOptions: {
                    enabled: true,
                    field: 'LongMessage',
                    displayName: $translate.instant('picore.headers.tables.longMessage'),
                    filterText: ''
                },
                filterBarOptions: 'sqfg',
                filterFields: [
                    {
                        field: 'LongMessage',
                        displayName: $translate.instant('picore.headers.tables.longMessage'),
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
                        field: 'Level',
                        displayName: $translate.instant('picore.headers.tables.level'),
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
                        field: 'User',
                        displayName: $translate.instant('picore.headers.tables.user'),
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
                pagingOptions: {
                    pageSizes: [5, 10, 25, 50, 100],
                    pageSize: 10,
                    currentPage: 1
                },
                enablePaging: false,
                sortInfo: {
                    field: 'Timestamp',
                    direction: 'desc',
                    fields: [
                        { field: 'Timestamp', displayName: $translate.instant('picore.headers.tables.timestamp') },
                        { field: 'Level', displayName: $translate.instant('picore.headers.tables.level') },
                        { field: 'LongMessage', displayName: $translate.instant('picore.headers.tables.longMessage') },
                        { field: 'User', displayName: $translate.instant('picore.headers.tables.user') }
                    ]
                },
                gridConfig: {
                    columnDefs: [
                        { field: 'Timestamp', displayName: $translate.instant('picore.headers.tables.timestamp'), width: 200 },
                        { field: 'MessageId', displayName: $translate.instant('picore.headers.tables.messageId'), visible: false, width: 60 },
                        { field: 'CorrelationId', displayName: $translate.instant('picore.headers.tables.correlationId'), visible: false},
                        { field: 'Level', displayName: $translate.instant('picore.headers.tables.level'), width: 90 },
                        { field: 'User', displayName: $translate.instant('picore.headers.tables.user'), width: 200 },
                        { field: 'ShortMessage', displayName: $translate.instant('picore.headers.tables.shortMessage'), visible: false },
                        {
                            field: 'LongMessage',
                            displayName: $translate.instant('picore.headers.tables.longMessage'),
                            cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" title="{{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</div>'
                        }
                    ],
                    enableColumnResize: true,
                    showSelectionCheckbox: false,
                    showRowHighlight: true
                },
                groupFields: [
                    { field: 'Level', displayName: $translate.instant('picore.headers.tables.level') },
                    { field: 'User', displayName: $translate.instant('picore.headers.tables.user') }
                ]
            };
        }

        function refresh() {
            return piTaskService.fetchApplicationLogMessages($scope.taskId).then(onGetViewerData);

            function onGetViewerData(data) {
                if (data && data.value && data.value.length > 0) {
                    vm.viewerData = data.value;
                    vm.viewerData.forEach(conv);
                } else {
                    vm.viewerData = [];
                }

                function conv(d) {
                    if (d.Timestamp) {
                        var dt = $filter('date')(d.Timestamp, 'MM/dd/yyyy h:mm:ss a');
                        d.Timestamp = dt;
                    }
                }
            }
        }
    }
})();
