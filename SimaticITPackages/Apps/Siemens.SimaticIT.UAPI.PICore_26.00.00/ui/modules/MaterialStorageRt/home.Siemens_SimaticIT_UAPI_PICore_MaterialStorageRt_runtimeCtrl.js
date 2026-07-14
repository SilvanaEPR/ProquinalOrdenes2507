
angular.module('Siemens.SimaticIT.UAPI.PICore.MaterialStorageRt')
.controller('home.Siemens_SimaticIT_UAPI_PICore_MaterialStorageRt_runtimeController', ['$scope', function ($scope) {

    var vm = this;
    var isLargeScreen = true;

    var tablet = 1024;
    var mobile = 768;
    var isCalculated = false;

    vm.componentInstances = [
			{
			    'name': 'runtime_mashup_1',
			    'layout': {
			        'row': 0,
			        'col': 0,
			        'sizeX': 2,
			        'sizeY': 2
			    },
			    contracts: {
			        methods: ['setContext', 'navigateTo', 'display', 'setPosition'],
			        events: ['onLoad', 'onContextChanged'],
			        properties: {}
			    },
			    isVisible: true
			},
			{
			    'name': 'runtime_storagehierarchylist_2',
			    'layout': {
			        'row': 0,
			        'col': 0,
			        'sizeX': 12,
			        'sizeY': 5
			    },
			    contracts: {
			        methods: ['setActionBarVisibility'],
			        events: ['onStorageHierarchySelected'],
			        properties: {}
			    },
			    isVisible: true
			},
			{
			    'name': 'runtime_storagehierarchydetails_4',
			    'layout': {
			        'row': 5,
			        'col': 0,
			        'sizeX': 6,
			        'sizeY': 12
			    },
			    contracts: {
			        methods: ['setStorageHierarchyId', 'setActionBarVisibility'],
			        events: ['onEquipmentGraphNodeSelected'],
			        properties: {
			            storageHierarchyEquipmentProperties: {
			                node: 'data', type: 'Array', category: 'Extensibility', description: '', permission: 'rw', default: [
          {
              'NId': 'ActualQuantity',
              'Label': 'picore.labels.actualQuantity',
              'PropertyType': 'Decimal',
              'PropertyValue': null,
              'Attributes': [
                {
                    'NId': 'UoM',
                    'PropertyType': 'String',
                    'PropertyValue': ''
                }
              ]
          },
          {
              'NId': 'Capacity',
              'Label': 'picore.labels.capacity',
              'PropertyType': 'Decimal',
              'PropertyValue': null,
              'Attributes': [
                {
                    'NId': 'UoM',
                    'PropertyType': 'String',
                    'PropertyValue': ''
                }
              ]
          },
          {
              'NId': 'IsEmpty',
              'Label': 'picore.labels.isEmpty',
              'PropertyType': 'Bool',
              'PropertyValue': 'false',
              'Attributes': []
          },
          {
              'NId': 'InputLocked',
              'Label': 'picore.labels.inputLocked',
              'PropertyType': 'Bool',
              'PropertyValue': 'false',
              'Attributes': []
          },
          {
              'NId': 'OutputLocked',
              'Label': 'picore.labels.outputLocked',
              'PropertyType': 'Bool',
              'PropertyValue': 'false',
              'Attributes': []
          }
			                ]
			            }
			        }
			    },
			    isVisible: true
			},
			{
			    'name': 'runtime_storagehierarchyequipmentcontent_3',
			    'layout': {
			        'row': 5,
			        'col': 6,
			        'sizeX': 6,
			        'sizeY': 12
			    },
			    contracts: {
			        methods: ['setStorageHierarchyEquipmentContext'],
			        events: ['onMtuSelected', 'onMaterialLotSelected', 'onMaterialSelected'],
			        properties: {}
			    },
			    isVisible: true
			}
    ];


    function activate(vm) {
        init(vm);
        subscribeEvents($scope);
        updateComponentInstancesLayout();
        broadcastEvents(vm, $scope);
    }

    function init(vm) {
        setGridsterOptions(vm);
        if (vm.layOutOptions !== undefined) {
            vm.isResizeEnabled = (vm.layOutOptions.resizable.enabled === true);
            vm.isDragEnabled = (vm.layOutOptions.draggable.enabled === true);
            vm.layOutOptions.floating = false;
            vm.layOutOptions.draggable.enabled = false;
            vm.layOutOptions.resizable.enabled = false;
        }
        converters(vm);
    }

    function converters(vm) {
        vm.DisableActionsConverter = {
            'runtime_storagehierarchydetails_4': function (input) {
                var evtObj = input[0];
                var result = [];
                result.push(evtObj['isActionEnabled']);
                return result;
            },
            'runtime_storagehierarchylist_2': function (input) {
                var evtObj = input[0];
                var result = [];
                result.push(evtObj['isActionEnabled']);
                return result;
            }

        };
        vm.onSelectionChangedConverter = {
            'runtime_storagehierarchyequipmentcontent_3': function (input) {
                var evtObj = input[0];
                var result = [];
                result.push(evtObj['storageHierarchyId']);
                result.push(evtObj['equipmentId']);
                return result;
            }

        };
        vm.selectItemConverter = {
            'runtime_storagehierarchydetails_4': function (input) {
                var evtObj = input[0];
                var result = [];
                result.push(evtObj['StorageHierarchyId']);
                return result;
            }

        };
    }

    function calculateMediumModeProps() {
        isCalculated = true;
        var length = vm.componentInstances.length;
        var large = 12;
        var small = 12 / 2;
        var mid = large / 2;
        var prev, next, element;
        for (var i = 1; i < vm.componentInstances.length; i++) {
            prev = next = element = undefined;
            element = vm.componentInstances[i];
            if (i + 1 < length) {
                next = vm.componentInstances[i + 1];
            }
            if (i - 1 > 0) {
                prev = vm.componentInstances[i - 1];
            }

            // Only one element
            if (prev === undefined && next === undefined) {
                element.layout.sizeX = large;
            }
                // Last
            else if (next === undefined) {
                element.layout.row = prev.layout.row + prev.layout.sizeY;
                element.layout.sizeX = large;
            }
                // First Element
            else {
                element.layout.col = 0;
                if (prev === undefined) {
                    element.layout.row = 0;
                } else {
                    element.layout.row = prev.layout.row + prev.layout.sizeY;
                }
                if (element.layout.sizeX > mid) {
                    element.layout.sizeX = large;
                    next.layout.col = 0;
                    next.layout.row = element.layout.row + element.layout.sizeY;
                } else {
                    // check next size
                    if (next.layout.sizeX > mid) {
                        element.layout.sizeX = large;
                        next.layout.col = 0;
                        next.layout.row = element.layout.row + element.layout.sizeY;
                    } else {
                        element.layout.sizeX = small;
                        next.layout.col = mid;
                        next.layout.row = element.layout.row;
                        next.layout.sizeX = small;
                        if (next.layout.sizeY >= element.layout.sizeY) {
                            element.layout.sizeY = next.layout.sizeY;
                        } else {
                            next.layout.sizeY = element.layout.sizeY;
                        }
                        i++; // next element already aligned
                    }
                }
            }
        }
    }

    function updateComponentInstancesLayout() {
        // tablet
        if ((window.innerWidth > mobile && window.innerWidth <= tablet)) {
            isLargeScreen = false;
            if (isCalculated === false) {
                calculateMediumModeProps();
            }
        } else if (window.innerWidth <= mobile) {
            isLargeScreen = false;
        } else {
            isLargeScreen = true;
        }
    }


    function setGridsterOptions(vm) {
        vm.layOutOptions = {
            columns: 12,
            pushing: false,
            floating: false,
            swapping: false,
            width: 'auto',
            colWidth: 'auto',
            rowHeight: 'match',
            margins: [5, 5],
            outerMargin: true,
            isMobile: true,
            mobileBreakPoint: 768,
            mobileModeEnabled: true,
            minColumns: 12,
            maxRows: 100,
            defaultSizeX: 3,
            defaultSizeY: 3,
            minSizeX: 0,
            maxSizeX: null,
            minSizeY: 0,
            maxSizeY: null,
            resizable: {
                'enabled': false,
                'handles': [
                  'n',
                  'e',
                  's',
                  'w',
                  'ne',
                  'se',
                  'sw',
                  'nw'
                ]
            },
            draggable: {
                'enabled': false,
                'handle': '.editorSmallComponent'
            }
        };

        if (vm.layOutOptions !== undefined) {
            vm.layOutOptions.resizable.resize = function (event, $element) {
                $element.parent().height('100%');
            };
        }
    }

    function canvasHeightChanged(event, eventArgs) {
        vm.layOutOptions.rowHeight = Math.floor((eventArgs.windowHeight - 5) / 12);
    }


    function onGridsterResizableDraggableOptionChanged(event, eventArgs) {
        vm.layOutOptions.resizable.enabled = eventArgs;
        vm.layOutOptions.draggable.enabled = eventArgs;
    }

    function onGridsterMobileChanged(gridster, options) {
        if (options.isMobile === true) {
            $.each($('iframe'), function (index, item) {
                var height = $(item).parents('sit-component').data('mobile-height');
                $(item).parent().css({
                    height: height + 'px'
                });
            });

            $('sit-component').each(function (i, item) {
                $(item).children('div').css({
                    height: $(item).data('mobile-height') + 'px'
                });
            });
        } else {
            $('sit-component').each(function (i, item) {
                $(item).children('div').css({
                    height: '100%'
                });
            });

        }
    }

    function onGridsterDraggableResizableChanged(gridster, options) {
        var $element = $('sit-container');
        if (options.draggable.enabled || options.resizable.enabled) {
            $element.addClass('enable-drag');
            if ($element.find('section.gridsteritem-helper').length) {
                $element.find('section.gridsteritem-helper').addClass('enable');
            }
        } else {
            $element.removeClass('enable-drag');
            if ($element.find('section.gridsteritem-helper').length) {
                $element.find('section.gridsteritem-helper').removeClass('enable');
            }
        }
    }

    function subscribeEvents($scope) {
        $scope.$on('common.service.layout.h-adapter.height-changed', canvasHeightChanged);
        $scope.$on('siemens.simaticit.common.services.layout.shell.gridster-resizable-draggable-changed', onGridsterResizableDraggableOptionChanged);
        $scope.$on('gridster-draggable-changed', onGridsterDraggableResizableChanged);
        $scope.$on('gridster-resizable-changed', onGridsterDraggableResizableChanged);
        $scope.$on('gridster-mobile-changed', onGridsterMobileChanged);

        $scope.$on('mashup.mashup_1.onDisplayChanged', function (event, eventArgs) {
            if (eventArgs) {
                vm.componentInstances.forEach(function (element) {
                    if (element.name === eventArgs.UIComponentId) {
                        element.isVisible = eventArgs.toggle;
                    }
                }, this);
            }
        });
        $scope.$on('mashup.mashup_1.onComponentMoveResize', function (event, eventArgs) { //topLeft, bottomRight
            if (eventArgs) {
                vm.componentInstances.forEach(function (element) {
                    if (element.name === eventArgs.UIComponentId) {
                        element.layout = {
                            'row': (eventArgs.position && eventArgs.position.row) || element.layout.row,
                            'col': (eventArgs.position && eventArgs.position.col) || element.layout.col,
                            'sizeX': (eventArgs.size && eventArgs.size.x) || element.layout.sizeX,
                            'sizeY': (eventArgs.size && eventArgs.size.y) || element.layout.sizeY
                        };
                    }
                }, this);
            }
        });

        $scope.$on('common.service.layout.h-adapter.height-changed', function (event, eventArgs) {
            vm.layOutOptions.rowHeight = Math.floor((eventArgs.windowHeight - 10) / 12);
            updateComponentInstancesLayout();
            broadcastEvents(vm, $scope);
        });
    }

    function broadcastEvents(vm, $scope) {
        var dragResize = vm.isResizeEnabled === true && vm.isDragEnabled === true;
        if (isLargeScreen === false) {
            dragResize = false;
        }
        $scope.$emit('siemens.simaticit.common.runtime.app.gridster-options-loaded', { 'dragResize': dragResize, 'isLargeScreen': isLargeScreen });
    }
    activate(this);
}]);
