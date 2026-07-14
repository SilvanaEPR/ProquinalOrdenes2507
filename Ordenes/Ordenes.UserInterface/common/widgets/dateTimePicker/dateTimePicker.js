/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.dateTimePicker
    *
    * @description
    * This module provides functionalities related to displaying date-time pickers.
    */
    angular.module('siemens.simaticit.common.widgets.dateTimePicker', [
        //any dependencies?
    ]);

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.dateTimePicker')
        .directive('sitDateTimePicker', DateTimeDirective);


    DateTimePickerController.$inject = ['$rootScope','$scope', '$timeout', '$translate', '$document'];
    function DateTimePickerController($rootScope, $scope, $timeout, $translate, $document) {

        var vm = this,
            oldDateTimeValue = null,
            changefn = null,
            validationfn = null,
            timer;


        function activate() {
            init();
            initButtonLabel();
            initMethods();
            updateAccordianDisplay();
        }

        function is24Clock(locale) {
            var result = true;
            var cdate = new Date(11, 11, 2222).toLocaleTimeString(locale);
            if (cdate !== '00 h 00 min 00 s') {
                var charArray = cdate.split('');
                for (var i = 0; i < charArray.length; i++) {
                    if (['0', ':', '.', '۰'].indexOf(charArray[i]) === -1) {
                        result = false;
                        break;
                    }
                }
            }
            return result;
        }

        function init() {
            vm.isOpen = false;
            vm.isDateShown = true;
            vm.modalValue = null;
            vm.isGlobalDropdown = false;
            var globalConfigLocale = window.$UIF.Object.safeGet($rootScope, 'globalWidgetConfiguration.dateTimePicker.locale');

            if (globalConfigLocale !== null) {
                vm.is24 = is24Clock(globalConfigLocale);
            } else if (vm.showMeridian !== undefined) {
                vm.is24 = !vm.showMeridian;
            } else {
                vm.is24 = is24Clock($translate.use());
            }
            vm.locale = globalConfigLocale !== null ? globalConfigLocale : $translate.use();
            if (!vm.value) {
                vm.value = '';
            }

            // if value is passed as a string it will be converted to a date object
            if (!(vm.value instanceof Date) && vm.value !== '') {
                vm.value = parseDate(vm.value);
            }

            if (vm.value.toString() === 'Invalid Date') {
                vm.value = null;
            }

            if (!vm.format) {
                vm.format = 'medium';
            }

            if (vm.showWeeks === undefined) {
                vm.showWeeks = false;
            }

            if (vm.showMeridian === undefined) {
                vm.showMeridian = !vm.is24H;
            }

            if (vm.showSeconds === undefined) {
                vm.showSeconds = false;
            }

            vm.dateOptions = {
                showWeeks: vm.showWeeks
            };

            if (vm.minDate) {
                vm.dateOptions.minDate = vm.minDate;
            }
            if (vm.maxDate) {
                vm.dateOptions.maxDate = vm.maxDate;
            }

            if (typeof vm.sitChange === 'function') {
                changefn = vm.sitChange;
                vm.sitChange = dateTimeChange;
            }

            if (vm.validation && typeof vm.validation.custom === 'function') {
                validationfn = vm.validation.custom;
                vm.validation.custom = dateTimeValidation;
            }

            oldDateTimeValue = vm.modalValue = vm.value;
        }

        function initButtonLabel() {
            vm.clearLabel = $translate.instant('dateTimePicker.clear');
            vm.okLabel = $translate.instant('dateTimePicker.ok');
            vm.todayLabel = $translate.instant('dateTimePicker.today');
            vm.nowLabel = $translate.instant('dateTimePicker.now');
        }

        function initMethods() {
            vm.clear = clear;
            vm.clicked = clicked;
            vm.close = close;
            vm.setCurrentTime = setCurrentTime;
            vm.setCurrentDate = setCurrentDate;
            vm.keydownPressed = keydownPressed;
            vm.today = today;
            vm.toggleIcon = toggleIcon;
        }

        function parseDate(value) {
            var mDate = window.moment(value);
            if (mDate.parsingFlags().iso) {
                return new Date(mDate.toISOString());
            }
            mDate = window.moment(value, 'L LT');
            if (mDate.isValid()) {
                return new Date(mDate.toISOString());
            }
            return new Date(value);
        }

        function dateTimeChange(oldValue, newValue, ngModel) {
            oldValue = oldDateTimeValue && new Date(oldDateTimeValue).toISOString();
            newValue = vm.value && new Date(vm.value).toISOString();
            changefn(oldValue, newValue, ngModel);
            oldDateTimeValue = ngModel.$modelValue;
        }

        function dateTimeValidation(value, ngModel) {
            value = vm.value && new Date(vm.value).toISOString();
            validationfn(value, ngModel);
        }

        function focusElement() {
            timer = $timeout(function () {
                if (vm.isDateShown) {
                    $(vm.element).find('.uib-datepicker div[uib-daypicker]').focus();
                } else {
                    $(vm.element).find('table.uib-timepicker td.uib-time.hours>input')[0].focus();
                }
            }, 0, false);
        }

        function clicked() {
            vm.isOpen = !vm.isOpen;
            vm.element.find('ng-form div.property-grid-input-group input.property-grid-control').focus();
            if (typeof (vm.ngFocus) === "function") {
                vm.ngFocus();
            }
            if (vm.isOpen) {
                if (!vm.value) {
                    if (vm.defaultTimeValue) {
                        vm.value = vm.defaultTimeValue;
                    }
                    else
                        vm.value = new Date();
                }
                focusElement();
                $document.bind('click', vm.documentClickBind);

                //attach date-time dropdown to body if element used in sit-filter for better user-experience.
                if (vm.element.parents('ng-form[name=filterForm]').length > 0) {
                    vm.attachGobalDropdown();
                    vm.setDropdownPosition();
                    vm.attachFilterEvents();
                }
            } else if (!vm.isOpen && vm.isGlobalDropdown) {
                vm.removeGlobalDropdown();
            }
        }

        function keydownPressed(event) {
            var downKey = 40;
            var popupElement = $(vm.element).find('div[uib-datepicker-popup-wrap]');
            if (event.which === downKey) {
                // removing datepicker-popup-wrap to avoid keydown shortcut conflict
                if (popupElement) {
                    $(vm.element).find('ul.uib-datepicker-popup').remove();
                    popupElement.remove();
                }
                clicked();
            }
        }

        function today(pickerVal) {
            if (pickerVal === 'date') {
                var month = new Date().getMonth();
                var date = new Date().getDate();
                var year = new Date().getFullYear();
                vm.datevalue = month + ' ' + date + ',' + year;
                vm.value = new Date(new Date(vm.value).setDate(date));
                vm.value = new Date(new Date(vm.value).setMonth(month));
                vm.value = new Date(new Date(vm.value).setFullYear(year));
            }
            else {
                var hours = new Date().getHours();
                var minutes = new Date().getMinutes();
                var seconds = new Date().getSeconds();
                var milliSeconds = new Date().getMilliseconds();
                vm.timevalue = new Date(vm.value).toLocaleTimeString(vm.locale); 
                vm.value = new Date(new Date(vm.value).setHours(hours));
                vm.value = new Date(new Date(vm.value).setMinutes(minutes));
                vm.value = new Date(new Date(vm.value).setSeconds(seconds));
                vm.value = new Date(new Date(vm.value).setMilliseconds(milliSeconds));
            }
        }

        function clear() {
            vm.value = null;
        }

        function close() {
            vm.isOpen = false;

            if (typeof (vm.ngBlur) === "function") {
                vm.ngBlur();
            }

            if (vm.isGlobalDropdown) {
                vm.removeGlobalDropdown();
            }
        }

        function setCurrentDate() {
            vm.value = new Date();
        }

        function setCurrentTime() {
            var currentTime = new Date();
            var selectedDate = vm.value;
            vm.value = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
                currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        }

        function toggleIcon() {
            vm.isDateShown = !vm.isDateShown;
        }

        function updateAccordianDisplay() {
            var options = { month: 'short' };
            var month = new Intl.DateTimeFormat(vm.locale, options).format(vm.value);
            var date = new Date(vm.value).getDate();
            var year = new Date(vm.value).getFullYear();
            vm.datevalue = month + ' ' + date + ',' + year;
            vm.timevalue = new Date(vm.value).toLocaleTimeString(vm.locale); 
        }

        activate();

        $scope.$on('$destroy', function () {
            if (timer) {
                $timeout.cancel(timer);
            }
        });

        $scope.$watch(function () {
            return vm.value;
        }, function (oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            updateAccordianDisplay();
            vm.modalValue = vm.value;
        });

        vm.disableAccordion = function (clickedOn) {
            if (!(clickedOn === 'date' && vm.isDateShown) && !(clickedOn === 'time' && !vm.isDateShown)) {
                vm.toggleIcon();
            }
        }
    }


    /**
    * @ngdoc directive
    * @name sitDateTimePicker
    * @module siemens.simaticit.common.widgets.dateTimePicker
    * @description
    * Displays a date-time picker control.
    *
    * @usage
    * As an element:
    * ```
    * <sit-date-time-picker
                sit-value="value"
                sit-format="format"
                sit-show-weeks="showWeeks"
                sit-show-meridian="showMeridian"
                sit-read-only="readOnly"
                sit-validation="validation"
                sit-change="change"
                ng-readonly="ngReadonly"
                ng-blur="ngBlur"
                ng-disabled="ngDisabled"
                ng-focus="ngFocus"
                sit-show-seconds="showSeconds"
                sit-default-time-value="defaultTimeValue">
    * </sit-date-time-picker>
    * ```
    * @restrict E
    *
    * @param {String | Object} sit-value Contains the value of the date-picker widget. It accepts the value in one of the following formats:
    * * As a **String** - accepts a date in valid ISO string format. Example: '1970-01-01T00:00:00Z'.
    * * As an **Object** - accepts a valid javascript date object. Example: new Date().
    * @param {String} [sit-format = 'medium'] _(Optional)_ The format in which the selected date is displayed on the widget.
    * 
    * The parameter supports two way of configuration:
    * * A custom format - a user defined date-time format. But the format remains unchanged for different locales.
    * Example: 'dd/MMM/yyyy hh:mm a'.
    * * A predefined format - the format supported by framework which also supports date-time locale format.
    * The possible values are: fullDate, longDate, mediumDate, shortDate, medium, short.
    * @param {Boolean} [sit-show-weeks = false] _(Optional)_ A boolean value which specifies whether to display week numbers.
    * @param {Boolean} [sit-show-meridian = false] _(Optional)_ A boolean value which specifies whether or not to display time meridian.
    * @param {ValidationModel} sit-validation _(Optional)_{@link ValidationModel}.
    * @param {String} sit-change _(Optional)_ A function expression to be evaluated on change of date-time value. 
    * The function is passed with two arguments, which represents the change of selected value against the old value. Please refer below examples.
    * @param {String | Boolean} sit-read-only _(Optional)_ Specifies if the property is editable.
    * @param {String} ng-blur _(Optional)_ An expression to evaluate on blur event.
    * @param {String} ng-focus _(Optional)_ An expression to evaluate on focus event.
    * @param {Boolean} ng-disabled _(Optional)_ If this expression is true, the element will be disabled.
    * @param {Boolean} ng-readonly _(Optional)_ If this expression is true, the element will be set as read-only.
    * @param  {Boolean} [sit-show-seconds = false] _(Optional)_ A boolean which specifies whether or not to show the input field for seconds in the time picker.   
    * @param  {Date} sit-default-time-value _(Optional)_ Sets the default time in the date-time picker widget. The time value should be provided in 24-hour format. Example:
    * ```
    * sit-default-time-value = new Date().setHours(17,59,59,0);
    * ```

    * 
    * @example
    * The following example shows how to configure a date-time picker widget:
    * 
    * Example with javascript date object as input value
    * ```
    *  {
    *     value: new Date(),            //javascript date object
    *     format:"dd/MMM/yyyy hh:mm a",  //custom format
    *     showWeeks: true,
    *     showMeridian: true,
    *     readOnly: false,
    *     ngReadonly: false,
    *     ngDisabled: false,
    *     validation: {
    *           reqired:true,
    *           custom:function(newValue, ngModel){
    *                //params
    *                //newValue:ISOString
    *                //ngModel:Object
    *                
    *                //execution code goes here
    *           },
    *     },
    *     change: function(oldValue, newValue){
    *                //params
    *                //oldValue:ISOString
    *                //newValue:ISOString
    *                
    *                //execution code goes here
    *     },
    *     ngBlur: function(){
    *        //execution code goes here
    *     },
    *     ngFocus: function(){
    *        //execution code goes here
    *     },
    *     showSeconds : true,
    *     sit-default-time-value : new Date().setHours(0,0,0,0)
    *
    *  }
    * ```
    *
    * Example with standard ISO string as input value
    * ```
    *  {
    *     value: "1970-01-01T00:00:00Z",    //ISO date time string
    *     format:"medium",                  //supports locale formatting
    *     showWeeks: true,
    *     showMeridian: true,
    *     readOnly: false,
    *     ngReadonly: false,
    *     ngDisabled: false,
    *     validation: {
    *           reqired:true,
    *           custom:function(newValue, ngModel){
    *                //params
    *                //newValue:ISOString
    *                //ngModel:Object
    *                
    *                //execution code goes here
    *           },
    *     },
    *     change: function(oldValue, newValue){
    *                //params
    *                //oldValue:ISOString
    *                //newValue:ISOString
    *                                
    *                //execution code goes here
    *     },
    *     ngBlur: function(){
    *        //execution code goes here
    *     },
    *     ngFocus: function(){
    *        //execution code goes here
    *     },
    *     showSeconds : true
    *
    *  }
    * ```
    */
    DateTimeDirective.globalDropdownCount = 0;
    DateTimeDirective.$inject = ['$document', '$window'];
    function DateTimeDirective($document, $window) {
        return {
            scope: {},
            restrict: 'E',
            bindToController: {
                'readOnly': '=?sitReadOnly',
                'value': '=sitValue',
                'validation': '=?sitValidation',
                'format': '=?sitFormat',
                'showWeeks': '=?sitShowWeeks',
                'showMeridian': '=?sitShowMeridian',
                'sitChange': '=?',
                'ngDisabled': '=?',
                'ngReadonly': '=?',
                'ngBlur': '&?',
                'ngFocus': '&?',
                'showSeconds': '=?sitShowSeconds',
                'minDate': '=?sitMinDate',
                'maxDate': '=?sitMaxDate',
                'defaultTimeValue': '=?sitDefaultTimeValue',
                'placeholder': '=?sitPlaceholder'
            },

            templateUrl: 'common/widgets/dateTimePicker/date-time-picker.html',

            controller: DateTimePickerController,

            controllerAs: 'dateTimePickerCtrl',

            link: function (scope, element, attrs, ctrl) {
                var isEventsAttached = false,
                    cachedDropdownElement = null,
                    id = DateTimeDirective.globalDropdownCount++,
                    INPUT_MARGIN = 5;
                ctrl.element = element;
                ctrl.setDropdownPosition = setDropdownPosition;
                ctrl.documentClickBind = documentClickBind;
                ctrl.attachFilterEvents = attachFilterEvents;
                ctrl.attachGobalDropdown = attachGobalDropdown;
                ctrl.removeGlobalDropdown = removeGlobalDropdown;

                function closeOnFilterScroll() {
                    if (ctrl.isOpen) {
                        ctrl.close();
                    }
                }

                function documentClickBind(event) {
                    var isDropdownClicked = angular.element(event.target).parents('div.dropdown-menu').length > 0;
                    if (ctrl.isOpen && !isDropdownClicked) {
                        var offsetX = 0,
                            offsetY = 0,
                            width = 0,
                            height = 0,
                            dropdownElement = null;
                        //hide dropdown on outside click
                        if (ctrl.isGlobalDropdown) {
                            dropdownElement = document.getElementById('globalDateTimeDropown_' + id);
                            var dropdownChildElement = dropdownElement.children[0];
                            offsetX = dropdownElement.offsetLeft;
                            offsetY = dropdownElement.offsetTop;
                            width = dropdownChildElement.offsetWidth;
                            height = dropdownChildElement.offsetHeight;
                        } else {
                            dropdownElement = element.find('div.property-grid-input-group').children('.dropdown-menu')
                            offsetX = dropdownElement.offset().left;
                            offsetY = dropdownElement.offset().top;
                            width = dropdownElement.width();
                            height = dropdownElement.height();
                        }

                        if (ctrl.isOpen && !element.find(event.target).length) {
                            if ((event.clientX <= offsetX) || (event.clientX >= offsetX + width) || (event.clientY <= offsetY) || (event.clientY >= offsetY + height)) {
                                scope.$apply(function () {
                                    $document.unbind('click', documentClickBind);
                                    ctrl.close();

                                    if (typeof (ctrl.ngBlur) === "function") {
                                        ctrl.ngBlur();
                                    }
                                });
                            }
                        }

                    }
                }

                function setDropdownPosition() {
                    var inputFiledHeight = ctrl.element.find('ng-form[name=dateTimePickerForm] div.property-grid-input-group:last-child input.property-grid-control').outerHeight();
                    var globalDropDownElement = document.getElementById('globalDateTimeDropown_' + id);
                    if (globalDropDownElement) {
                        //add styles to global date-time dropdown
                        globalDropDownElement.style.top = ctrl.element.offset().top + inputFiledHeight + INPUT_MARGIN + 'px';
                        globalDropDownElement.style.left = ctrl.element.offset().left + INPUT_MARGIN + 'px';
                        globalDropDownElement.style.position = 'fixed';
                        globalDropDownElement.style.width = '360px';
                        globalDropDownElement.style.zIndex = 1;
                    }
                }

                function attachGobalDropdown() {
                    if (!cachedDropdownElement) {
                        cachedDropdownElement = ctrl.element.find('ng-form[name=dateTimePickerForm] div.dropdown-menu');
                    }
                    // attach the date-time picker dropdown to body
                    var element = document.createElement('div');
                    element.id = 'globalDateTimeDropown_' + id;
                    element.classList.add('global-date-time-dropdown');
                    element.appendChild(cachedDropdownElement[0]);
                    document.body.appendChild(element);
                    ctrl.isGlobalDropdown = true;
                }

                function removeGlobalDropdown() {
                    // remove the date-time picker dropdown from body
                    var globalDropdown = document.getElementById('globalDateTimeDropown_' + id);
                    if (globalDropdown) {
                        document.body.removeChild(globalDropdown);
                        removeFilterEvents();
                    }
                    ctrl.isGlobalDropdown = false;
                }

                function keydownEvent(event) {
                    var key = { esc: 27 };
                    if (ctrl.isOpen) {
                        if (event.which === key['esc']) {
                            scope.$apply(function () {
                                ctrl.close();
                            });
                        }
                    }
                }

                element.on('keydown', keydownEvent);

                function attachFilterEvents() {
                    //attach events if date-time widget used inside sit-filter
                    isEventsAttached = true;
                    angular.element($window).bind('resize', setDropdownPosition);
                    angular.element($document.find('.canvas-ui-view')).bind('scroll', setDropdownPosition);
                    ctrl.element.parents('sit-filter').find('table.sit-filter-table>tbody').bind('scroll', closeOnFilterScroll);
                }

                function removeFilterEvents() {
                    if (isEventsAttached) {
                        angular.element($window).unbind('resize', setDropdownPosition);
                        angular.element($document.find('.canvas-ui-view')).unbind('scroll', setDropdownPosition);
                        ctrl.element.parents('sit-filter').find('table.sit-filter-table>tbody').unbind('scroll', closeOnFilterScroll);
                    }
                    isEventsAttached = false;
                }

                scope.$on('$destroy', function () {
                    element.off('keydown', keydownEvent);
                    $document.unbind('click', documentClickBind);
                    removeFilterEvents();
                    removeGlobalDropdown();
                });
            }
        };
    }
})();
