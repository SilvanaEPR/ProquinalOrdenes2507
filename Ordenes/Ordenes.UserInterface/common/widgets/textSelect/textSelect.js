/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.textSelect
 * @description
 * Displays a combobox dropdown in which user is allowed to type as well as select the value. The dropdown options are alphabatically sorted.
 */

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.widgets.textSelect', []);

})();

(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name sitTextSelect
    * @access internal
    * @module siemens.simaticit.common.widgets.textSelect
    * @description
    * Displays a combobox dropdown in which user is allowed to type as well as select the value. The dropdown options are alphabatically sorted.
    * 
    * @usage
    * As an element:
    * ```
    *  <sit-text-select ng-if="(vm.sitDropdownMode ==='comboBox')"
                        sit-value="vm.value"
                        sit-validation="vm.selectValidation"
                        ng-readonly="vm.readOnly"
                        sit-to-display="vm.toDisplay"
                        sit-to-keep="vm.toKeep"
                        sit-options="vm.options"
                        sit-change= "vm.selectionChanged">
       </sit-text-select>

    * ```
    * @restrict E
    *
    * @param {string} sit-value Value of the select widget.
    * @param {Object[]} sit-options Array of objects that contains list of attributes.
    * @param {string} sit-to-display Attribute name to be displayed.
    * @param {string} sit-to-keep Attribute name to be stored as an identifier.
    * @param {ValidationModel} sit-validation See {@link ValidationModel}.
    * @param {string} [sit-change] _(Optional)_ An expression to evaluate on change of value.
    * @param {string} [ng-disabled] _(Optional)_ If this expression is truthy, the element will be disabled.
    * @param {string} [ng-readonly] _(Optional)_ If this expression is truthy, the element will be set as read-only.
    *
    *
    * @example
	* In a view template, the **sit-text-select** directive is used as follows:
	*
	* ```
	*  <sit-text-select ng-if="(vm.sitDropdownMode ==='comboBox')"
                 sit-value="vm.value"
                 sit-validation="vm.selectValidation"
                 ng-readonly="vm.readOnly"
                 sit-to-display="vm.toDisplay"
                 sit-to-keep="vm.toKeep"
                 sit-options="vm.options">
       </sit-text-select>
    * ```
    *
    */

    function TextSelectController($scope, $element, $timeout) {
        var ctrl = this, customValidation = null;
        activate();

        function activate(){
            init();
        }

        function init() {
            if (ctrl.value) {
                ctrl.sitSelectedString = ctrl.value;
            } else {
                ctrl.sitSelectedString = '';
            }
            formatOptions();

            ctrl.compare = compare;
            ctrl.sitOptions.sort(ctrl.compare);
            ctrl.setDropDownLabelWidth = setDropDownLabelWidth;
            ctrl.setDropDownPosition = setDropDownPosition;
            ctrl.toggleSelected = toggleSelected;
            ctrl.updateSelectedString = updateSelectedString;
        }


        function formatOptions(){
            ctrl.sitOptions = [];
            if (ctrl.options && ctrl.options.length > 0) {
                ctrl.options.forEach(function (obj) {
                    ctrl.sitOptions.push({
                        'id': obj[ctrl.sitToKeep],
                        'name': obj[ctrl.sitToDisplay]
                    });
                })
            }
        }


        function compare(a, b) {
            var nameA = a.name.toLowerCase();
            var nameB = b.name.toLowerCase();

            var comparison = 0;
            if (nameA > nameB) {
                comparison = 1;
            } else if (nameA < nameB) {
                comparison = -1;
            }
            return comparison;
        }


        var optionListner = $scope.$watchCollection(function () {
            return ctrl.options;
        }, function (newValue, oldValue) {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                formatOptions();
            }
        });

        $scope.$on('$destroy', function () {
            optionListner();
        });

        function setDropDownLabelWidth() {
            var elemWidth = $element.find('.text-select-input').width();
            var PADDING_BORDER = 10;
            var BUTTONWIDTH = 32;
            $element.find('.dropdown.text-select-dropdown').find('.dropdown-menu').css('width', (elemWidth + BUTTONWIDTH + PADDING_BORDER) + "px");
        }

        function setDropDownPosition(){
            var BUTTONWIDTH = 32;
            var elemWidth = $element.find('ng-form[name="textSelectForm"]').width();
            $element.find('.dropdown.text-select-dropdown').find('.dropdown-menu').css('left', '-' + (elemWidth - BUTTONWIDTH) + "px");
        }


        function toggleSelected($event, selectable) {
            clearSelection();
            selectable.selected = !selectable.selected;
            ctrl.updateSelectedString();
        }


        function clearSelection() {
            ctrl.sitOptions.forEach(function (selectable) { selectable.selected = false; });
            ctrl.sitSelectedString = '';
        }

        function updateSelectedString() {
            var selectedObjs = ctrl.sitOptions.filter(function (selectable) { return selectable.selected; });
            ctrl.sitSelectedString = selectedObjs.map(function (selectable) { return selectable.id; })[0];
        }
    }
    TextSelectController.$inject = ['$scope', '$element', '$timeout'];
    angular.module('siemens.simaticit.common.widgets.textSelect').controller('TextSelectController', TextSelectController);

    angular.module('siemens.simaticit.common.widgets.textSelect').directive('sitTextSelect', ['$timeout', '$window', function($timeout, $window) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                readOnly: '=sitReadOnly',
                options: '=sitOptions',
                value: '=sitValue',
                sitPlaceholder: '=sitPlaceholder',
                validation: '=sitValidation',
                sitToDisplay: '=sitToDisplay',
                sitToKeep: '=sitToKeep',
                sitChange: '=?',
                ngDisabled: '=?',
                ngReadonly: '=?'
            },
            templateUrl: 'common/widgets/textSelect/text-select.html',
            controllerAs: 'ctrl',
            controller: TextSelectController,
            link: function (scope, element, attr, ctrl) {
                var KEY_UP = 38,
                    KEY_DOWN = 40,
                    ENTER_KEY = 13;

                $timeout( function() {
                    element.find('.text-select-dropdown').on('show.bs.dropdown', onDropdownVisible);
                    element.find('.text-select-dropdown').on('shown.bs.dropdown', onShowDropdown);
                    ctrl.setDropDownLabelWidth();
                    ctrl.setDropDownPosition();
                },0,false);



                scope.$watch('ctrl.sitSelectedString',function(newVal,oldVal){
                    if(oldVal !== newVal){
                        var foundItem = ctrl.sitOptions.find(function(item){
                            return item.name === ctrl.sitSelectedString;
                        });
                        if(foundItem){
                            element.find('div.dropdown').removeClass('show');
                            element.find('#textSelectCombo').attr('aria-expanded', false);
                            element.find('[aria-labelledby="textSelectCombo"]').removeClass('show');
                            return;
                        }

                        var filteredList = [];
                        element.find('div.dropdown').addClass('show');
                        element.find('#textSelectCombo').attr('aria-expanded', true);
                        element.find('[aria-labelledby="textSelectCombo"]').addClass('show');


                        ctrl.sitOptions.forEach(function(item) {
                            item.selected = false;
                            if(ctrl.sitSelectedString && item.name.toLowerCase().startsWith(ctrl.sitSelectedString.toLowerCase())){
                                filteredList.push(item) ;
                                ctrl.sitOptions = ctrl.sitOptions.filter(function(filteredItem) {
                                    return item.name !== filteredItem.name;
                                })
                                ctrl.sitOptions.sort(ctrl.compare);
                            }
                        })
                        for (var i=0; i<filteredList.length; i++){
                            ctrl.sitOptions.splice(i, 0, filteredList[i]);
                        }
                        if(filteredList.length === 0){
                            ctrl.sitOptions.sort(ctrl.compare);
                        }
                    }
                })

                function onShowDropdown(){
                    var dropDownElement = element.find('.text-select-dropdown ul.dropdown-menu');
                    dropDownElement.focus();
                    dropDownElement.on('keydown', navigate);
                }

                function onDropdownVisible(){
                    $timeout(function () {
                        ctrl.setDropDownLabelWidth();
                        ctrl.setDropDownPosition();
                    }, 0, false);
                }

                function closeDropdown() {
                    element.find('div.dropdown').removeClass('show');
                    element.find('#textSelectCombo').attr('aria-expanded', false);
                    element.find('[aria-labelledby="textSelectCombo"]').removeClass('show');
                }

                function deactivateKeyEvent() {
                    var dropDownElement = element.find('ul.dropdown-menu');
                    var inputElement = element.find('button#textSelectCombo');
                    dropDownElement.off('keydown', navigate);
                    inputElement.focus();
                }

                function navigate(event){
                    var itemId, selected;
                    if (event.keyCode === KEY_UP) {
                        selected = element.find("li.selected");
                        if (selected.length === 0) {
                            ctrl.toggleSelected(event, ctrl.sitOptions[0]);
                            scope.$apply();
                        } else if (selected.prev().length === 0) {
                            itemId = selected.siblings().last().attr('data-internal-type');
                        } else {
                            itemId = selected.prev().attr('data-internal-type');
                        }
                    } else if (event.keyCode === KEY_DOWN) {
                        selected = element.find("li.selected");
                        if (selected.length === 0) {
                            ctrl.toggleSelected(event, ctrl.sitOptions[0]);
                            scope.$apply();
                        } else if (selected.next().length === 0) {
                            itemId = selected.siblings().first().attr('data-internal-type');
                        } else {
                            itemId = selected.next().attr('data-internal-type');
                        }
                    } else if (event.keyCode === ENTER_KEY) {
                        deactivateKeyEvent();
                        closeDropdown();
                        event.preventDefault();
                    }
                    if (itemId) {
                        var item = _.find(ctrl.sitOptions, function (option) {
                            return option.id === itemId;
                        });
                        ctrl.toggleSelected(event, item);
                        scope.$apply();
                    }
                }
            }
        };
    }]);

})();
