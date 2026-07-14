(function () {
    'use strict';
    angular.module('Siemens.SimaticIT.UAPI.PICore.WorkOrderHeaderParameters').controller('Siemens_SimaticIT_UAPI_PICore_WorkOrderHeaderParameters_homeController', Controller);

	Controller.$inject = ['$scope'];
	function Controller($scope) {
		var vm = this;
		var isLargeScreen, isCalculated;
		var tablet, mobile, large, small;
		activate();

		function activate() {
			init();
			initGridster();
			subscribeEvents();

			updateComponentInstancesLayout();
			broadcastEvents();
		}

		function init() {
			isLargeScreen = true;
			isCalculated = false;
			vm.componentInstances = [];

			tablet = 1024;
			mobile = 768;
			large = 12;
			small = large/2;

			vm.componentInstances.push({
				name: 'home_mashup_1',
				layout: {
					row: 0,
					col: 0,
					sizeX: 2,
					sizeY: 2
				},
				contracts: {
					methods: ['setContext','navigateTo','display','setPosition'],
					events: ['onLoad','onContextChanged'],
					properties: {}
				},
				isVisible: true
			});
			vm.componentInstances.push({
				name: 'home_workorderheaderparameterlist_2',
				layout: {
					row: 0,
					col: 0,
					sizeX: 12,
					sizeY: 12
				},
				contracts: {
					methods: ['setActionBarVisibility','setWorkOrderId'],
					events: [],
					properties: {EntityNames: {node:'data',type:'Array',category:'Extensibility',description:'',permission:'rw',default: []},FacetNames: {node:'data',type:'Array',category:'Extensibility',description:'',permission:'rw',default: []},Properties: {node:'data',type:'Array',category:'Extensibility',description:'',permission:'rw',default: [
  {
    'PropertyName': 'ParameterNId',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.nId',
    'QuickSearch': true,
    'CanBeSorted': true,
    'IsSortDefault': true,
    'CanBeFiltered': true,
    'IsVisible': true
  },
  {
    'PropertyName': 'ParameterName',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.name',
    'QuickSearch': false,
    'CanBeSorted': true,
    'IsSortDefault': false,
    'CanBeFiltered': true,
    'IsVisible': true
  },
  {
    'PropertyName': 'ParameterDescription',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.description',
    'QuickSearch': false,
    'CanBeSorted': true,
    'IsSortDefault': false,
    'CanBeFiltered': true,
    'IsVisible': true
  },
  {
    'PropertyName': 'ParameterTargetValue',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.targetValue',
    'QuickSearch': false,
    'CanBeSorted': true,
    'IsSortDefault': false,
    'CanBeFiltered': true,
    'IsVisible': true
  },
  {
    'PropertyName': 'ParameterType',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.type',
    'QuickSearch': false,
    'CanBeSorted': true,
    'IsSortDefault': false,
    'CanBeFiltered': true,
    'IsVisible': true
  },
  {
    'PropertyName': 'ParameterUoMNId',
    'DataType': 'string',
    'DisplayName': 'picore.headers.tables.uoM',
    'QuickSearch': false,
    'CanBeSorted': true,
    'IsSortDefault': false,
    'CanBeFiltered': true,
    'IsVisible': true
  }
]},PageSizes: {node:'data',type:'Array',category:'Visibility',description:'',permission:'rw',default: [
  5,
  10,
  30,
  50
]},PageSizeDefault: {node:'data',type:'Number',category:'Visibility',description:'',permission:'rw',default: 5},IsTitleVisible: {node:'data',type:'Boolean',category:'Visibility',description:'',permission:'rw',default: false}}
				},
				isVisible: true
			});

			vm.onLoadConverter = {
					'home_workorderheaderparameterlist_2': function(input) {
	var evtObj = input[0];
	var result = [];
	result.push(evtObj['WorkOrderId']);
	return result;
}
								};
		}

		function initGridster() {
			vm.layOutOptions = {
				columns: 12,
				pushing: false,
				floating: false,
				swapping: false,
				width: 'auto',
				colWidth: 'auto',
				rowHeight: 'match',
				margins: [5,5],
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
				draggable:{
  'enabled': false,
  'handle': '.editorSmallComponent'
}
			};
			if (vm.layOutOptions !== undefined) {
				vm.isResizeEnabled = (vm.layOutOptions.resizable.enabled === true);
				vm.isDragEnabled = (vm.layOutOptions.draggable.enabled === true);
				vm.layOutOptions.floating = false;
				vm.layOutOptions.draggable.enabled = false;
				vm.layOutOptions.resizable.enabled = false;

				vm.layOutOptions.resizable.resize = function (event, $element) {
					$element.parent().height('100%');
				};
			}
		}

		function subscribeEvents() {
			$scope.$on('common.service.layout.h-adapter.height-changed', canvasHeightChanged);
 			$scope.$on('siemens.simaticit.common.services.layout.shell.gridster-resizable-draggable-changed', onGridsterResizableDraggableOptionChanged);
			$scope.$on('gridster-draggable-changed', onGridsterDraggableResizableChanged);
			$scope.$on('gridster-resizable-changed', onGridsterDraggableResizableChanged);
			$scope.$on('gridster-mobile-changed', onGridsterMobileChanged);

			$scope.$on('mashup.home_mashup_1.onDisplayChanged', function (event, eventArgs) {
				if (eventArgs) {
					vm.componentInstances.forEach(function (element) {
						if (element.name === eventArgs.UIComponentId) {
							element.isVisible = eventArgs.toggle;
						}
					}, this);
				}
			});
			$scope.$on('mashup.home_mashup_1.onComponentMoveResize', function (event, eventArgs) { //topLeft, bottomRight
				if (eventArgs) {
					vm.componentInstances.forEach(function (element) {
						if (element.name === eventArgs.UIComponentId) {
							element.layout = {
								row: (eventArgs.position && eventArgs.position.row) || element.layout.row,
								col: (eventArgs.position && eventArgs.position.col) || element.layout.col,
								sizeX: (eventArgs.size && eventArgs.size.x) || element.layout.sizeX,
								sizeY: (eventArgs.size && eventArgs.size.y) || element.layout.sizeY
							};
						}
					}, this);
				}
			});

			$scope.$on('common.service.layout.h-adapter.height-changed', function (event, eventArgs) {
				vm.layOutOptions.rowHeight = Math.floor((eventArgs.windowHeight - 10) / 12);
				updateComponentInstancesLayout();
				broadcastEvents();
			});
		}

		function broadcastEvents() {
			var dragResize = vm.isResizeEnabled === true && vm.isDragEnabled === true;
			if(isLargeScreen === false) {
				dragResize = false;
			}
			$scope.$emit('siemens.simaticit.common.runtime.app.gridster-options-loaded', { 'dragResize' : dragResize, 'isLargeScreen': isLargeScreen });
		}

		function updateComponentInstancesLayout() {
			// tablet
			if ((window.innerWidth > mobile && window.innerWidth <= tablet)) {
				isLargeScreen = false;
				if (isCalculated === false) {
					calculateMediumModeProps();
				}
				// $timeout(function () {
				// 	calculateMediumModeProps();
				// });
			} else if( window.innerWidth <= mobile ) {
				isLargeScreen = false;
			} else {
				isLargeScreen = true;
			}
		}

		function calculateMediumModeProps() {
			isCalculated = true;
			var length = vm.componentInstances.length;

			var mid = large / 2;
			var prev, next, element;
			for (var i = 1; i < vm.componentInstances.length; i++) {
				prev = next = undefined;
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
					continue;
				}
				if (next === undefined) {
					// Last
					element.layout.row = prev.layout.row + prev.layout.sizeY;
					element.layout.sizeX = large;
					continue;
				}

				// First Element
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
						if (next.layout.sizeY >= element.layout.sizeY) { element.layout.sizeY = next.layout.sizeY; } else { next.layout.sizeY = element.layout.sizeY; }
						i++; // next element already aligned
					}
				}
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
				return;
			}

			$('sit-component').each(function (i, item) {
				$(item).children('div').css({
					height: '100%'
				});
			});
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
	}
})();
