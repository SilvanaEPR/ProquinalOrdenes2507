/*
* SIMATIC IT Unified Architecture for Process Industries V1.2.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular
        .module('Siemens.SimaticIT.UAPI.PICore')//,['ui.tree']
        .directive('sitPiHierarchyTree', sitPiHierarchyTreeDirective);

    function sitPiHierarchyTreeDirective() {
        return {
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/piHierarchyTree/pi-hierarchy-tree.html',
            controller: sitPiHierarchyTreeController,
            restrict: 'E',
            controllerAs: 'vm',
            scope: {
            },
            bindToController: {
                onHierarchySelectedApi: '&',
                onSelectionChanged: '&',
                readOnly: '=readOnly',
                noDataTemplateValue: '=noDataTemplateValue',
                showDetail: '=showDetail'
            }
        };
    }

    sitPiHierarchyTreeController.$inject = [
        '$scope',
        '$stateParams',
        'Siemens.SimaticIT.UAPI.PICore.storageHierarchyService',
        'common.services.logger.service'];
    function sitPiHierarchyTreeController(
        $scope,
        $stateParams,
        dataService,
        logger) {
        var vm = this;
        var newNode;
        vm.equipmentGraphConfigurationId = null;
        vm.currentHierarchy = null;
        vm.hierarchy = {
            tree: null,
            equipmentGraphConfigurationId: vm.equipmentGraphConfigurationId
        };

        vm.hideTree = true;
        vm.api = {
            setSelectedHierarchy: setSelectedHierarchy,
            drawHierarchy: drawHierarchy,
            getSelectedNode: getSelectedNode,
            setSelectedNode: setSelectedNode,
            getSelectedHierarchy: getSelectedHierarchy,
            redraw: redraw
        };
        vm.onHierarchySelectedApi({ api: vm.api });

        init();

        function init() {
            logger.logDebug('Initializing controller.......');
            vm.itemClicked = itemClicked;
            vm.toggle = toggle;
        }

        function drawHierarchy(equipmentGraphConfigurationId, nodes) {
            vm.hierarchy.tree = JSON.parse(nodes);
        }

        function setSelectedHierarchy(id) {
            if (id === null) {
                setSelectedNode(null);
                vm.hideTree = true;
            } else {
                var inputParam = {
                    EquipmentGraphConfigurationId: id
                    , ReturnOneLevel: true
                };
                vm.hierarchy.equipmentGraphConfigurationId = id;
                dataService.getHierarchyTree(inputParam)
                .then(onGetHierarchyTreeSuccess, function () {
                    logger.logErr('Unable to load equipment hierarchy tree for the specified equipment graph configuration');
                });
            }
        }

        function getSelectedHierarchy() {
            return vm.hierarchy.tree;
        }

        function getSelectedNode() {
            if (vm.currentItem && vm.currentItem.selected) {
                return vm.currentItem;
            } else {
                return null;
            }
        }

        function setSelectedNode(item) {
            vm.currentItem = item;
        }

        function checkNodes() {
            for (var i = 0; i < vm.hierarchy.tree.length; i++) {
                if (!vm.hierarchy.tree[i].ChildrenNodes) {
                    vm.hierarchy.tree[i].ChildrenNodes = [];
                }
                if (vm.hierarchy.tree[i].EquipmentNId === newNode[0].EquipmentNId) {
                    vm.hierarchy.tree[i].ChildrenNodes = vm.hierarchy.tree[i].ChildrenNodes.concat(newNode[0].ChildrenNodes);
                    vm.hierarchy.tree[i].ChildrenNodes.sort(compareNodes);
                    break;
                } else {
                    for (var j = 0; j < vm.hierarchy.tree[i].ChildrenNodes.length; j++) {
                        checkNode(vm.hierarchy.tree[i].ChildrenNodes[j]);
                    }
                }

            }
        }

        function checkNode(node) {
            if (node.EquipmentNId === newNode[0].EquipmentNId) {
                node.ChildrenNodes = newNode[0].ChildrenNodes;

            } else {
                if (node && node.ChildrenNodes) {
                    for (var j = 0; j < node.ChildrenNodes.length; j++) {
                        checkNode(node.ChildrenNodes[j]);
                    }
                }
            }
        }

        function compareNodes(a, b) {
            if (a.EquipmentNId < b.EquipmentNId) { return -1; }
            if (a.EquipmentNId > b.EquipmentNId) { return 1; }
            return 0;
        }

        function redraw(currentHierarchy) {
            vm.hierarchy.tree = currentHierarchy;
            vm.hideTree = !(Array.isArray(vm.hierarchy.tree) && vm.hierarchy.tree.length > 0);
        }

        function onGetHierarchyTreeSuccess(data) {
            if ((data) && (data.succeeded)) {
                if (data.value === undefined || data.value === null || data.value.length === 0) {
                    return;
                }
                var res = data.value[0].EquipmentHierarchy;
                vm.hierarchy.tree = JSON.parse(res);
                vm.hideTree = !(Array.isArray(vm.hierarchy.tree) && vm.hierarchy.tree.length > 0);
            } else {
                logger.logInfo('Unable to read data: ', data);
            }
        }

        function getChildrenNodesByParentNId(item) {

            var inputParam = {
                EquipmentGraphConfigurationId: vm.hierarchy.equipmentGraphConfigurationId,
                ParentEquipmentNodeNId: item.EquipmentNId,
                ReturnOneLevel: true
            };
            item.ChildrenLoaded = true;
            dataService.getHierarchyTreeOnDemand(inputParam)
            .then(onGetHierarchyTreeOnDemandSuccess, function () {
                logger.logErr('Unable to load equipment hierarchy tree for the specified equipment graph configuration');
            });
        }

        function onGetHierarchyTreeOnDemandSuccess(data) {
            if ((data) && (data.succeeded)) {
                if (data.value === undefined || data.value === null || data.value.length === 0) {
                    return;
                }
                var res = data.value[0].EquipmentHierarchy;
                newNode = JSON.parse(res);

                checkNodes();

                vm.hideTree = !(Array.isArray(vm.hierarchy.tree) && vm.hierarchy.tree.length > 0);
            } else {
                logger.logInfo('Unable to read data: ', data);
            }
        }

        function toggle(par, item) {
            if (par.collapsed && !item.ChildrenLoaded) {
                getChildrenNodesByParentNId(item);
            }
            if (par.collapsed && par.expand) {
                par.expand();
            }            else if (!par.collapsed && par.collapse) {
                par.collapse();
            }
        }

        function itemClicked(item) {
            if (vm.currentItem) {
                if (vm.currentItem.EquipmentId === item.EquipmentId) {
                    var isSelected = false;
                    if (vm.currentItem.selected !== undefined) {
                        isSelected = vm.currentItem.selected = !vm.currentItem.selected;
                    }
                    vm.currentItem = item;
                    vm.currentItem.selected = isSelected;
                    if (vm.onSelectionChanged) {
                        vm.onSelectionChanged({ item: vm.currentItem });
                    }
                    return vm.currentItem.selected;
                }
            }

            vm.currentItem = item;
            vm.currentItem.selected = true;
            if (vm.onSelectionChanged) {
                vm.onSelectionChanged({ item: vm.currentItem });
            }
            return vm.currentItem;
        }
    }
})();
