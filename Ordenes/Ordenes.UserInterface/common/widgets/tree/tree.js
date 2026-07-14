/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.tree
 *
 * @description
 * This module provides functionalities to display the hierarchical structure in data.
 */

(function () {
    'use strict';  
    angular.module('siemens.simaticit.common.widgets.tree', []);

})();

/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */

(function () {
    'use strict';

    /**
    * @ngdoc type
     * @module siemens.simaticit.common.widgets.tree
     * @name treeOptions
     */

    /**
   *@ngdoc directive
   * @name sitTree
   * @module siemens.simaticit.common.widgets.tree
   * @description
   * Display data in a structured format. It can be used to show a hierarchical structure in data.
   * @usage
   * As an element:
   * ```
   *     <sit-tree sit-options="treeOptions"></sit-tree>
   * ```
   * @restrict E
   *
   * @param {Object} sit-options Specifies the required data to be rendered in hierarchical structure. The object must contain the following fields:
   * * **enableMultiselection**: (Optional)It must be one of the following values: "true" or "false".The default value is "false".
   * * **data**: The array of objects to be passed for displaying the data. Each object must contain the following data:
   *  * **id** : Id corresponding to the respective node.
   *  * **label**: The label for the corresponding node.
   *  * **icon**: (Optional)The icon for the corresponding node. Only type icons are allowed.
   *  * **expanded**: (Optional)Specifies if the node is expanded/collapsed when the tree is rendered.The default value is "false".
   *  * **selected**: (Optional)Specifies if the node is selected when the tree is rendered.The default value is "false".
   *  * **children**: (Optional)Specifies the child nodes of the current node.
   *  
   * **Note**: This widget supports upto six level as of now.
   * @example
   * In a view template, the **sit-tree** directive is used as follows:
   *
   * ```
   *     <sit-tree sit-options="data"></sit-tree>
   *
    * In Controller:
     * For Type: numeric
     * (function () {
     *     'use strict';
     *     var app = angular.module('siemens.simaticit.app');
     *     app.controller('TreeController', function(){
     *     treeOptions = {
     *         enableMultiselection: true,
     *         $init: function () {
     *             this.$subscribe('onNodeSelected', function (eventArgs) {
     *                 console.log('Node clicked: ' + eventArgs.node.id);
     *             })
     *         },
     *         data: [
     *               {
     *                   id: 'parent',
     *                   label: 'Parent',
     *                   icon: '3D',
     *                   expanded: true,
     *                   selected: true,
     *                   children: [
     *                       {
     *                           id: 'child1',
     *                           label: 'Child 1',
     *                           icon: '3D',
     *                           children: [
     *                               {
     *                                   id: 'child5',
     *                                   expanded: true,
     *                                   label: 'Child 5',
     *                                   icon: '3D',
     *                                   children: [
     *                                       { id: 'child7', label: 'Child 7', icon: '3D' },
     *                                       { id: 'child68', label: 'Child 8', icon: '3D' }]
     *                               },
     *                               { id: 'child6', label: 'Child 6', icon: '3D' }]
     *                       },
     *                       {
     *                           id: 'child2',
     *                           label: 'Child 2',
     *                           icon: '3D'
     *                       },
     *                       {
     *                           id: 'child3',
     *                           label: 'Child 3',
     *                           icon: '3D',
     *                           children: [
     *                               { id: 'child9', label: 'Child 9', icon: '3D' },
     *                               { id: 'child10', label: 'Child 10', icon: '3D' }
     *                           ]
     *                       },
     *                       {
     *                           id: 'child4',
     *                           label: 'Child 4',
     *                           icon: '3D',
     *                           children: []
     *                       }
     *                   ]
     *               }
     *           ]
     *       };
     *     }
     *   });
   * ```
   *
   */
    /**
            * @ngdoc method
            * @module siemens.simaticit.common.widgets.tree
            * @name treeOptions#refresh
            * @description
            * An API method which re-renders the tree.This method can be called after changing the data.
            *  */
    /**
            * @ngdoc method
            * @module siemens.simaticit.common.widgets.tree
            * @name treeOptions#expandNodes
            * @param {Array/object} nodes Specify the node/nodes which need to be expanded/collapsed
            * @param {Boolean} state Set true to expand, false to collapse.
            * @description
            * An API method to expand/collapse the nodes.
            *  */
    /**
            * @ngdoc method
            * @module siemens.simaticit.common.widgets.tree
            * @name treeOptions#getSelectedNodes
            * @description
            * An API method which returns the array of selected nodes
            * @returns {Array} The array of selected nodes
            *  */
    /**
            * @ngdoc method
            * @module siemens.simaticit.common.widgets.tree
            * @name treeOptions#selectNodes
            * @param {Array/object} nodes Specify the node/nodes which need to be selected/unselected
            * @param {Boolean} state Set true to select, false to unselect.
            * @param {Boolean} clear If true, any existing selections are cleared before selecting the specified items.
            * @description
            * An API method to select/unselect the nodes.
            *  */

    angular.module('siemens.simaticit.common.widgets.tree')
        .directive('sitTree', TreeDirective);

    TreeDirective.$inject = ['common.widgets.service', '$timeout'];

    function TreeDirective(widgetService, $timeout) {

        TreeController.prototype = new widgetService.BaseWidget('Tree Widget', {
            enableMultiselection: false,
            data: []
        }, ['refresh', 'expandNodes', 'getSelectedNodes', 'selectNodes', 'onNodeSelected']);

        TreeController.$inject = ['$scope'];
        function TreeController($scope) {
            var vm = this;
            var tempExpandNodesArr = [];
            var tempSelectNodesArr = [];
            this.$init($scope);

            (function (vm) {
                init(vm);
            })(this);

            function init(vm) {
                vm.level = 0;
                vm.isNodeWithImage = false;
                vm.toggleNode = toggleNode;
                vm.selectNode = selectNode;
                vm.arrowSvgIcon = {
                    path: 'common/icons/miscRightArrow16.svg',
                    size: '16px'
                };
                registerApi();
            }

            vm.$onInit = function () {
                refresh();
            }

            function registerApi() {
                vm.$register('refresh', refresh);
                vm.$register('expandNodes', expandNodes);
                vm.$register('getSelectedNodes', getSelectedNodes);
                vm.$register('selectNodes', selectNodes);
            }

            function refresh() {
                vm.modifiedData = [];
                createModifiedArray(vm.options.data);
                expandNodes(tempExpandNodesArr, true);
                tempExpandNodesArr = [];
                selectNodes(tempSelectNodesArr, true);
                tempSelectNodesArr = [];
                if (vm.options.data[0] && vm.options.data[0].icon) {
                    vm.isNodeWithImage = true;
                } else {
                    vm.isNodeWithImage = false;
                }
            }

            function createModifiedArray(arr) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i].expanded ? tempExpandNodesArr.push(arr[i]) : arr[i].expanded = false;
                    arr[i].selected ? tempSelectNodesArr.push(arr[i]) : arr[i].selected = false;
                    arr[i].level = vm.level;
                    arr[i].hasChildren = arr[i].children && arr[i].children.length > 0;
                    vm.level === 0 ? arr[i].visible = true : arr[i].visible = false;
                    vm.modifiedData.push(arr[i]);
                    if (arr[i].hasChildren) {
                        vm.level += 1;
                        createModifiedArray(arr[i].children);
                        vm.level -= 1;
                    }
                }
            }

            function toggleNode(node, expandNode) {
                var indexOfItem = _.findIndex(vm.modifiedData, { id: node.id });
                var i = indexOfItem + 1;
                while (i < vm.modifiedData.length && vm.modifiedData[i].level !== node.level) {
                    if ((expandNode && vm.modifiedData[i].level === node.level + 1) || vm.modifiedData[i].level === 0) {
                        vm.modifiedData[i].visible = true;
                    } else if (vm.modifiedData[i].level !== node.level - 1 && vm.modifiedData[i].level !== node.level - 2 && vm.modifiedData[i].level !== node.level - 3)
                        {
                            vm.modifiedData[i].visible = false;
                            vm.modifiedData[i].expanded = false;
                        }
                    
                    i = i + 1;
                }
                node.expanded = expandNode;
            }

            function selectNode(node, selected, invokeEvent) {
                if (vm.options.enableMultiselection) {
                    node.selected = selected;
                } else {
                    vm.modifiedData.forEach(function (item) {
                        item.selected = item.id === node.id ? selected : false;
                    });
                }
                invokeEvent && vm.$invokeEvent('onNodeSelected', { 'node': node });
            }

            function expandNodes(nodes, state) {
                if (!nodes) {
                    return;
                } else if (!Array.isArray(nodes)) {
                    nodes = [nodes];
                }
                nodes.forEach(function (node) {
                    var index = _.findIndex(vm.modifiedData, { id: node.id });
                    expandParentNodes(vm.modifiedData[index], index);
                    index !== -1 && toggleNode(vm.modifiedData[index], state);
                });
            }

            function expandParentNodes(node, index) {
                if (node.level === 0) {
                    return;
                }
                var _modifiedData = angular.copy(vm.modifiedData);
                _modifiedData.splice(index);
                var i = _.findLastIndex(_modifiedData, { level: node.level - 1 });
                if (!_modifiedData[i].expanded) {
                    expandNodes(_modifiedData[i], true);
                }
                return;
            }

            function getSelectedNodes() {
                var selectedItems = [];
                vm.modifiedData.forEach(function (dataItem) {
                    dataItem.selected &&  selectedItems.push(dataItem);
                });
                return selectedItems;
            }

            function selectNodes(items, state, clear) {
                if (!items) {
                    return;
                } else if (!Array.isArray(items)) {
                    items = [items];
                }
                if (clear) {
                    vm.modifiedData.forEach(function (item) {
                        item.selected = false;
                    });
                }
                items.forEach(function (item) {
                    var index = _.findIndex(vm.modifiedData, { id: item.id });
                    index !== -1 && selectNode(vm.modifiedData[index], state, false);
                });
            }
        }

        return {
            scope: {},
            restrict: 'E',
            bindToController: {
                options: '=?sitOptions'
            },
            controller: TreeController,
            controllerAs: 'treeCtrl',
            link: function (scope, element, attrs, ctrl) {
                $timeout(function () {
                    ctrl.$invokeEvent('onLoad', { element: element });
                },0,false);
            },
            templateUrl: 'common/widgets/tree/tree.html'
        };
    }
})();
