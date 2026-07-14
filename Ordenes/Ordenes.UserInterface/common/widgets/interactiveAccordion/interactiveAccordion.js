/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
      * @ngdoc module
      * @name siemens.simaticit.common.widgets.interactiveAccordion
      * @description This module provides functionalities related to the {@ sitInteractiveAccordion} widget.
      */
    angular.module('siemens.simaticit.common.widgets.interactiveAccordion', ['ui.tree']);

})();

(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name sitInteractiveBasicAccordion
    * @module siemens.simaticit.common.widgets.interactiveAccordion
    * @description
    * A directive which is used as a basic interactive accordion with drag & drop functionality.
    * @usage
    * As an html element:
    * ```
    *   <sit-interactive-basic-accordion sit-options="interactiveAccCtrl.interactiveAccordionOptions"></sit-interactive-basic-accordion>
    * ```
    * @restrict E
    *
    *@param {Object} sit-options object specifies the required data to render the interactive basic accordion.
    * For description of this object see {@link interactiveAccordionOptions}    
    * @example
    * In a view template, you can use the **sitInteractiveBasicAccordion** as follows:
    *  ```
    * <sit-interactive-basic-accordion sit-options="interactiveAccCtrl.interactiveAccordionOptions">
    * </sit-interactive-basic-accordion>
    *
    * ```
    *
    * The following example shows how to configure a sit-interactive-accordion widget:
    *
    * In Controller:
    * ```
    *    interactiveAccordionOptions: {
    *         accordionstyle: 'Basic',
    *         $init: function (eventArgs) {
    *             this.$subscribe('onNodeExpand', function (eventArgs) {
    *                 console.log(JSON.stringify(eventArgs.node.headerData) + ' is Expanded')
    *             });
    *             this.$subscribe('onNodeCollapse', function (eventArgs) {
    *                 console.log(JSON.stringify(eventArgs.node.headerData) + ' is Collapse')
    *             });
    *             this.$subscribe('onAction', function (eventArgs) {
    *                 console.log(JSON.stringify(eventArgs.action.name) + ' is executed');
    *                 console.log(JSON.stringify(eventArgs.node.headerData) + ' is executed')
    *             });
    *         },
    *         dataSource: [
    *             {
    *                 cellLayout: 'double',
    *                 gripperVisible: true,
    *                 headerData: [{
    *                     title: 'Hello World1',
    *                     desc: 'Hello World1 Description',
    *                 },
    *                     {
    *                         title: 'Hello World2',
    *                         desc: 'Hello World2 Description',
    *                     }
    *                 ],
    *                 svgIcon: { path: 'common/icons/cmdBrush24.svg' },
    *                 checkbox: true,
    *                 commands: [
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdTrash24.svg' },
    *                         name: 'Delete',
    *                     },
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdEdit24.svg' },
    *                         name: 'Edit'
    *                     },
    *                    {
    *                         svgIcon: { path: 'common/icons/cmdCopy24.svg' },
    *                         name: 'Copy'
    *                     }
    *                 ],
    *                 template: "<div>This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>" +
    *                     "<div> This is 1st accordion body</div>",
    *             },
    *             {
    *                 cellLayout: 'single',
    *                 headerData: [{
    *                     title: 'Hello World2',
    *                 }],
    *                 commands: [
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdTrash24.svg' },
    *                         name: 'Delete'
    *                     },
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdEdit24.svg' },
    *                         name: 'Edit'
    *                     },
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdCopy24.svg' },
    *                         name: 'Copy'
    *                     },
    *                     {
    *                         svgIcon: { path: 'common/icons/cmdCut24.svg' },
    *                         name: 'Cut'
    *                     },
    *                 ],
    *                 templateUrl: "common/examples/interactiveAccordion/interactive-accordion-dev-template.html",
    *             },
    *             {
    *                 cellLayout: 'double',
    *                 headerData: [{
    *                     title: 'Item One',
    *                     desc: 'Hello World1 Description'
    *                 },
    *                     {
    *                     title: 'Item Two',
    *                     desc: 'Hello World1 Description'
    *                     }],
    *                 commands: [{
    *                     svgIcon: { path: 'common/icons/cmdTrash24.svg' },
    *                     onActionCallBack: function () {
    *                         alert("Delete Icon Clicked");
    *                     },
    *                     name: 'Delete'
    *                 }],
    *                indicatorIcon: "indicatorGreenCircle16",
    *                 template: "<div>This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>" +
    *                     "<div> This is 3rd accordion body</div>",
    *                },
    *             {
    *                 cellLayout: 'single',
    *                 headerData: [{
    *                     title: 'Hello World4',
    *                 }],
    *                 checkbox: true,
    *                 commands: [{
    *                     svgIcon: { path: 'common/icons/cmdTrash24.svg' },
    *                     name: 'Delete'
    *                 }],
    *                 indicatorIcon: "indicatorHome16",
    *                 template: "<div>This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>" +
    *                     "<div> This is 4th accordion body</div>",
    *             }
    *         ]
    *    }
    * ```
    */

    /**
   * @ngdoc type
   * @name interactiveAccordionOptions
   * @module siemens.simaticit.common.widgets.interactiveAccordion
   * @description A configuration object that contains details for configuring the interactive tree accordion widget.
   * The object must have the following format:
   * @property {string} accordionstyle The string that represents the type of the basic interactive accordion.It must be one of the following values: "Basic" or "Styled".
   * Basic accordion has a grey background and styled accordion has a transparent background with border.
   * @property {array} dataSource Data to be passed for displaying the basic interactive accordion. Each object will contain the following data.
   * * cellLayout: It can be configured as single/double cellLayout. In the case of double cellLayout,it will display two sets of title & description for single cellLayout,
   * it will display one set of title & description.
   * * gripperVisible: This is an optional field.If it is true, gripper image will be visible otherwise it is not displayed.
   * * headerData: Data to be passed for displaying the title and description.Each object will contain the following data.
   *  * title: This field is required.It contains basic accordion title.It accepts the value of the type string.
   *  * desc: This is an optional field.It contains basic accordion description.It accepts the value of the type string.
   * * svgIcon: This is an optional field.It contains path of svg icon for basic accordion.
   * * checkbox: This is an optional field.If the checkbox is selected then the corresponding accordion gets selected.
   * * commands: This is an optional field.The array of objects to be passed for displaying the action command for basic interactive accordion.It must contain following data.
   *  * svgIcon: It contains path of svg icon for action command of basic accordion.It accepts the value of the type string.
   *  * name: It contains the name of svg icon for action command of basic accordion.It accepts the value of the type string.
   * * indicatorIcon: This is an optional field.It contains the name of indicator icon and it must be of the type, indicator.
   * * template: It will accept the content of accordion.
   * * templateUrl: It will accept the content of accordion as URL.
   */


    angular.module('siemens.simaticit.common.widgets.interactiveAccordion').directive('sitInteractiveBasicAccordion',
        ['$timeout', '$compile', '$templateRequest', 'common.widgets.service',
            function ($timeout, $compile, $templateRequest, widgetService) {


                InteractiveBasicAccordionController.prototype = new widgetService.BaseWidget('Interactive Accorion widget', {
                    dataSource: []
                }, ['onNodeExpand', 'onNodeCollapse', 'onAction', 'selectNode']);

                InteractiveBasicAccordionController.$inject = ['$scope'];

                function InteractiveBasicAccordionController($scope) {
                    var vm = this;
                    this.$init($scope);

                    (function (vm) {
                        init(vm);
                    })(this);


                    function init(vm) {
                        vm.isSelected = false;
                        vm.toggle = toggle;
                        vm.dragStop = dragStop;
                        vm.selectNode = selectNode;
                        vm.checkIndicator = checkIndicator;
                        vm.executeAction = executeAction;
                        vm.$register('selectNode', selectNode);
                    }

                    function checkIndicator(icon) {
                        return (typeof icon === 'string' && icon.startsWith('indicator'));
                    }

                    function executeAction(action, node) {
                        vm.$invokeEvent('onAction', { node: node, action: action });
                    }

                    function selectNode(currentNode) {
                        currentNode.selected = !currentNode.selected ? true : false;
                    }

                    function toggle(currentObj, item, ev) {
                        var el;
                        var targetElem = $(ev.currentTarget).parents('.angular-ui-tree-handle').find('.body');

                        if (item.template) {
                            el = $compile(item.template)($scope);
                            expandCollapsed(currentObj, targetElem, el);
                        } else if (item.templateUrl) {
                            $templateRequest(item.templateUrl).then(function (html) {
                                var template = angular.element(html);
                                el = $compile(template)($scope);
                                expandCollapsed(currentObj, targetElem, el);
                            });

                        }

                    }


                    function expandCollapsed(currentObj, targetElem, el) {
                        if (currentObj && currentObj.collapsed && currentObj.expand) {
                            currentObj.expand();
                            $(targetElem).empty().append(el);
                            vm.$invokeEvent('onNodeExpand', { node: currentObj });
                        }
                        else if (currentObj && !currentObj.collapsed && currentObj.collapse) {
                            currentObj.collapse();
                            $(targetElem).empty();
                            vm.$invokeEvent('onNodeCollapse', { node: currentObj });
                        }

                    }

                    function dragStop(event) {
                        if (event.source.nodeScope.$parentNodeScope && event.source.nodeScope.$parentNodeScope.$modelValue) {
                            event.source.nodeScope.$parentNodeScope.$modelValue.HasChildren = false;
                        }
                    }

                }

                return {
                    scope: {},
                    restrict: 'E',
                    transclude: true,
                    bindToController: {
                        'options': '=sitOptions'
                    },
                    controller: InteractiveBasicAccordionController,
                    controllerAs: 'interactiveBasicAccordionCtrl',
                    link: function (scope, element, attrs, ctrl) {
                        $timeout(function () {
                            ctrl.$invokeEvent('onLoad', { element: element });
                        },0,false);
                    },
                    templateUrl: 'common/widgets/interactiveAccordion/interactive-basic-accordion.html'
                };
            }]);
})();
/*jshint -W098 */
(function () {
    'use strict';

    /**
   * @ngdoc directive
   * @name sitInteractiveTreeAccordion
   * @module siemens.simaticit.common.widgets.interactiveAccordion
   * @description
   * A directive which can be used to create a tree structure with drag & drop functionality.
   * @usage
   * As an html element:
   * ```
   *   <sit-interactive-tree-accordion sit-options="interactiveAccCtrl.interactiveTreeAccordionOptions"></sit-interactive-tree-accordion>
   * ```
   * @restrict E
   * 
   * @param {Object} sit-options object specifies the required data to render the interactive tre accordion. For a description of this object see {@link interactiveTreeAccordionOptions}
   * 
   * @example
   * In a view template, you can use the **sitInteractiveTreeAccordion** as follows:
   *  ```
   * <sit-interactive-tree-accordion sit-options="interactiveAccCtrl.interactiveAccordionOptions">
   * </sit-interactive-tree-accordion>
   *
   * ```
   *
   * The following example shows how to configure a sit-interactive-accordion widget:
   *
   * In Controller:
   * ```
   *    interactiveAccordionOptions: {
   *         accordionstyle: 'Styled',
   *         $init: function () {
   *             this.$subscribe('onAddClick', function (eventArgs) {
   *                 window.$UIF.Function.safeCall(vm.options, 'api.addNode', eventArgs, generateNode());
   *             });
   *             this.$subscribe('onRemoveClick', function (eventArgs) {
   *                 console.log(eventArgs.title + ' is removed');
   *             });
   *         },
   *         dataSource: [
   *             {
   *                 title: 'Root Node one',
   *                 gripperVisible: true,
   *                 svgIcon: { path: 'common/icons/cmdBrush24.svg' },
   *                 childrenNodes: [{
   *                     title: 'Child Node one',
   *                     childrenNodes: []
   *                 }],
   *             },
   *            {
   *                 title: 'Root Node two',
   *                childrenNodes: []
   *             },
   *             {
   *                 title: 'Root Node three',
   *                 childrenNodes: []
   *             },
   *             {
   *                 title: 'Root Node four',
   *                 gripperVisible: true,
   *                 childrenNodes: [{
   *                     title: 'Child Node one',
   *                     childrenNodes: [{
   *                         title: 'Child Node two',
   *                         childrenNodes: [{
   *                             title: 'Child Node three',
   *                             childrenNodes: []
   *                         }],
   *                     }],
   *                 }],
   *             },
   *             {
   *                 title: 'Root Node five',
   *                 childrenNodes: []
   *             },
   *             {
   *                 title: 'Root Node six',
   *                 childrenNodes: []
   *             },
   *             {
   *                 title: 'Root Node seven',
   *                 childrenNodes: [{
   *                     title: 'Child Node one',
   *                     childrenNodes: [{
   *                         title: 'Child Node two',
   *                         childrenNodes: [{
   *                             title: 'Child Node three',
   *                             childrenNodes: [{
   *                                 title: 'Child Node four',
   *                                 childrenNodes: [{
   *                                     title: 'Child Node five',
   *                                     childrenNodes: []
   *                                 }],
   *                             }],
   *                         }],
   *                     }],
   *                 }],
   *            },
   *             {
   *                 title: 'Root Node eight',
   *                 childrenNodes: []
   *             },
   *             {
   *                 title: 'Root Node nine',
   *                 childrenNodes: []
   *             }
   *         ]
   *    }
   * ```
   */

    /**
   * @ngdoc type
   * @name interactiveTreeAccordionOptions
   * @module siemens.simaticit.common.widgets.interactiveAccordion
   * @description A configuration object that contains details for configuring the interactive tree accordion widget.
   * The object must have the following format:
   * @property {string} accordionstyle The string that represents the type of the tree interactive accordion.It must be one of the following values: "Basic" or "Styled".Basic accordion has a grey background and styled accordion has a transparent background with border.
   * @property {array} dataSource Data to be passed for displaying the tree interactive accordion. Each object will contain the following data:
   * * gripperVisible: This is an optional field.If it is true, gripper image will be visible otherwise it is not displayed.
   * * title: This field is required.It contains basic accordion title.It accepts the value of the type string.
   * * svgIcon: This is an optional field.It contains path of svg icon for tree interactive accordion.
   * * childrenNodes: The array of objects to be passed for displaying the childnode information of the root node. One root node can contain maximum 28th level of child nodes.Each object will contain the following data: title, gripperVisible, svgIcon.
   */

    /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.interactiveAccordion
        * @name #addNode
        * @description
        * An API method which gets the information on the node being added.
        * @returns {object} the parent node information
        * */

    angular.module('siemens.simaticit.common.widgets.interactiveAccordion').directive('sitInteractiveTreeAccordion',
        ['$timeout', 'common.widgets.service',
            function ($timeout, widgetService) {


                InteractiveTreeAccordionController.prototype = new widgetService.BaseWidget('Interactive Tree Accordion widget', {
                    dataSource: []
                }, ['addNode', 'onAddClick', 'onRemoveClick']);

                InteractiveTreeAccordionController.$inject = ['$scope', '$translate'];

                function InteractiveTreeAccordionController($scope, $translate) {
                    var vm = this;
                    this.$init($scope);

                    (function (vm) {
                        init(vm);
                        vm.$register('addNode', addChildNode);
                    })(this);


                    function init(vm) {
                        vm.toggle = toggle;
                        vm.dragStop = dragStop;
                        vm.remove = remove;
                        vm.addNewNode = addNewNode;
                        vm.addChildNode = addChildNode;
                    }

                    function addNewNode(item) {
                        vm.$invokeEvent('onAddClick', item);
                    }

                    function addChildNode(item, newChildNode) {
                        newChildNode = newChildNode || {
                            title: $translate.instant('interactiveAccordion.newNode') + (item.childrenNodes.length + 1),
                            childrenNodes: []
                        };

                        if (item.childrenNodes.length < 28) {
                            item.childrenNodes.push(newChildNode); 
                            
                        }
                       
                    }

                    function remove(par, item) {
                        if (par.remove) {
                            var parentNode = par.$parentNodesScope.$parent.$modelValue;
                            removeNodeAndItsChildren(item);
                            if (parentNode) {
                                for (var i = 0; i < vm.options.dataSource.length; i++) {
                                    var nodeFound = contain(vm.options.dataSource[i], parentNode.title);
                                    if (nodeFound) {
                                        break;
                                    }
                                }
                            }
                            par.remove();
                        }
                        vm.$invokeEvent('onRemoveClick', item);
                    }

                    function contain(tree, parentNode) {
                        if (tree.title === parentNode) {
                            return true;
                        }
                        for (var i = 0; i < tree.childrenNodes.length; i++) {
                            contain(tree.childrenNodes[i], parentNode);
                        }
                    }

                    function removeNodeAndItsChildren(node) {
                        node.ToBeDeleted = true;
                        if (node.childrenNodes) {
                            removeChildrenNodes(node.childrenNodes);
                        }
                    }

                    function removeChildrenNodes(childrenNodes) {
                        for (var i = 0; i < childrenNodes.length; i++) {
                            removeNodeAndItsChildren(childrenNodes[i]);
                        }
                    }

                    function toggle(currentObj, item) {
                        if (currentObj.collapsed && currentObj.expand) {
                            currentObj.expand();
                        }
                        else if (!currentObj.collapsed && currentObj.collapse) {
                            currentObj.collapse();
                        }
                    }
                    function dragStop(event) {
                        if (event.source.nodeScope.$parentNodeScope && event.source.nodeScope.$parentNodeScope.$modelValue) {
                            event.source.nodeScope.$parentNodeScope.$modelValue.HasChildren = false;
                        }
                    }

                }

                return {
                    scope: {},
                    restrict: 'E',
                    transclude: true,
                    bindToController: {
                        'options': '=sitOptions'
                    },
                    controller: InteractiveTreeAccordionController,
                    controllerAs: 'interactiveTreeAccordionCtrl',
                    link: function (scope, element, attrs, ctrl) {
                        $timeout(function () {
                            ctrl.$invokeEvent('onLoad', { element: element });
                        },0,false);
                    },
                    templateUrl: 'common/widgets/interactiveAccordion/interactive-tree-accordion.html'
                };
            }]);
})();


