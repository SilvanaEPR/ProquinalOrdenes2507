/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.progressStepper
 *
 * @description
 * This module provides functionalities to display the state of a specific task.
 */

(function () {
    'use strict';
    angular.module('siemens.simaticit.common.widgets.progressStepper', []);
})();

/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.progressStepper')
        .directive('sitLabelStepper', LabelStepperDirective);

    LabelStepperDirective.$inject = ['common.widgets.service', '$timeout'];

    function LabelStepperDirective(widgetService, $timeout) {
        var TYPE = widgetService.ENUMS.ProgressStepperType;

        LabelStepperController.prototype = new widgetService.BaseWidget('Label stepper Widget', {
            options: {
                'type': TYPE.LABEL,
                'steps': []
            }
        }, ['goToNextStep', 'goToPreviousStep', 'setActiveStep', 'getActiveStep', 'onNextStep', 'onPreviousStep']);

        LabelStepperController.$inject = ['$scope'];
        function LabelStepperController($scope) {
            var vm = this;
            this.$init($scope);

            (function (vm) {
                init(vm);
            })(this);

            function init(vm) {
                vm.activeStepIndex = 0;
                vm.getClassByStatus = getClassByStatus;

                vm.$register('goToNextStep', goToNextStep);
                vm.$register('goToPreviousStep', goToPreviousStep);
                vm.$register('setActiveStep', setActiveState);
                vm.$register('getActiveStep', getActiveState);
            }

            function getClassByStatus(index) {
                if (index < vm.activeStepIndex) return 'achieved-step';
                else if (index === vm.activeStepIndex) return 'active-step';
                return 'future-step';
            }

            function goToNextStep() {
                vm.activeStepIndex + 1 < vm.options.steps.length && (vm.activeStepIndex += 1);
                vm.$invokeEvent('onNextStep', { step: getActiveState() });
            }

            function goToPreviousStep() {
                vm.activeStepIndex - 1 >= 0 && (vm.activeStepIndex -= 1);
                vm.$invokeEvent('onPreviousStep', { step: getActiveState()});
            }

            function setActiveState(stepId) {
                vm.options.steps.forEach(function (step, index) {
                    if (step.id === stepId) vm.activeStepIndex = index;
                });
            }

            function getActiveState() {
                return vm.options.steps[vm.activeStepIndex];
            }
        }

        return {
            scope: {},
            restrict: 'E',
            bindToController: {
                options: '=?sitOptions'
            },
            controller: LabelStepperController,
            controllerAs: 'labelStepperCtrl',
            link: function (scope, element, attrs, ctrl) {
                $timeout(function () {
                    ctrl.$invokeEvent('onLoad', { element: element });
                },0,false);
            },
            templateUrl: 'common/widgets/progressStepper/label-stepper.html'
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.progressStepper')
        .directive('sitNumericStepper', NumericStepperDirective);

    NumericStepperDirective.$inject = ['common.widgets.service', '$timeout', '$window'];

    function NumericStepperDirective(widgetService, $timeout, $window) {
        var TYPE = widgetService.ENUMS.ProgressStepperType;
        var MODE = widgetService.ENUMS.ProgressStepperMode;

        NumericStepperController.prototype = new widgetService.BaseWidget('Numeric stepper Widget', {
            options: {
                'type': TYPE.NUMERIC,
                'mode': MODE.HORIZONTAL,
                'steps': []
            }
        }, ['goToNextStep', 'goToPreviousStep', 'setActiveStep', 'getActiveStep', 'onNextStep', 'onPreviousStep']);

        NumericStepperController.$inject = ['$scope'];
        function NumericStepperController($scope) {
            var vm = this;
            this.$init($scope);

            (function (vm) {
                init(vm);
            })(this);

            function init(vm) {
                if (!vm.options) {
                    return;
                }
                vm.isVertical = vm.options.mode ? vm.options.mode === 'vertical' : false;
                vm.steps = vm.options.steps ? vm.options.steps : [];
                vm.activeStepIndex = getActiveStepIndex(vm.steps);
                vm.isSmallMode = false;
                vm.minimizedDivs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                vm.$register('goToNextStep', goToNextStep);
                vm.$register('goToPreviousStep', goToPreviousStep);
                vm.$register('setActiveStep', setActiveStep);
                vm.$register('getActiveStep', getActiveStep);
            }

            function getActiveStepIndex(steps) {
                var activeStepIndex = 0;
                steps.forEach(function (step, index) {
                    if (step.isActive) {
                        activeStepIndex = index;
                    }
                });
                return activeStepIndex;
            }

            function goToNextStep() {
                if (vm.activeStepIndex + 1 < vm.options.steps.length) {
                    vm.activeStepIndex += 1;
                    vm.$invokeEvent('onNextStep', { step: getActiveStep() });
                }
            }

            function goToPreviousStep() {
                if (vm.activeStepIndex - 1 >= 0) {
                    vm.activeStepIndex -= 1;
                    vm.$invokeEvent('onPreviousStep', { step: getActiveStep() });
                }
            }

            function setActiveStep(stepId) {
                vm.options.steps.forEach(function (step, index) {
                    if (step.id === stepId) {
                        vm.activeStepIndex = index;
                    }
                });
            }

            function getActiveStep() {
                return vm.options.steps[vm.activeStepIndex];
            }
        }

        function addInitialStepIndexes(allSteps, activeStepIndex) {
            if (!allSteps) {
                return allSteps;
            }
            allSteps.forEach(function (step, index) {
                step.initialStepIndex = index + 1;
                step.isActive = activeStepIndex === index;
            });
            return allSteps;
        }

        function addSteps(steps, allSteps, indexes) {
            if (!allSteps || !steps || !indexes) {
                return steps;
            }
            indexes.forEach(function (i) {
                steps.push(allSteps[i]);
            });
            return steps;
        }

        function checkMinimizedSteps(steps) {
            if (!steps) {
                return steps;
            }
            var currentStep,nextStep;
            for (var i = 0; i < steps.length; i++) {
                currentStep = steps[i].initialStepIndex;
                nextStep = steps[i + 1] ? steps[i + 1].initialStepIndex : null;
                if (nextStep && currentStep !== nextStep - 1) {
                    steps[i].isMinimized = true;
                }
            }
            return steps;
        }

        function getSmallModeSteps(allSteps, activeStepIndex) {
            allSteps = addInitialStepIndexes(allSteps, activeStepIndex);
            if (!allSteps) {
                return allSteps;
            }

            var lastStepIndex = allSteps.length-1;
            var steps = [];
            var indexes = [];

            //if the active step is first or last
            if (activeStepIndex === 0 || activeStepIndex === lastStepIndex) {
                //select first 3
                indexes = [0, 1, 2, lastStepIndex - 1, lastStepIndex];
                steps = addSteps(steps, allSteps, indexes);
                steps = checkMinimizedSteps(steps);
                return steps;
            }

            //if the active step is last but one
            if (activeStepIndex + 1 === lastStepIndex) {
                indexes = [0, 1, activeStepIndex - 1, activeStepIndex, activeStepIndex + 1];
            } else if (activeStepIndex - 1 === 0) {
                //if the active step is one step after the first
                indexes = [0, activeStepIndex, activeStepIndex + 1, lastStepIndex - 1, lastStepIndex];
            } else {
                //if the active step is in between first and last
                indexes = [0, activeStepIndex - 1, activeStepIndex, activeStepIndex + 1, lastStepIndex];
            }
            if (indexes.length) {
                steps = addSteps(steps, allSteps, indexes);
                steps = checkMinimizedSteps(steps);
            }
            return steps;
        }

        function initNumericStepper(element, ctrl) {
            var parentDivWidth = element.parent().width();
            var parentDivHeight = element.parent().height();
            var noOfSteps = ctrl.steps ? ctrl.steps.length : 0;
            var requiredSize = ((2 * noOfSteps) - 1) * 24;
            var isWidthAvailable = parentDivWidth > requiredSize;
            var isHeightAvailable = parentDivHeight > requiredSize;
            if (((!ctrl.isVertical && !isWidthAvailable) || (ctrl.isVertical && !isHeightAvailable)) && noOfSteps > 5) {
                ctrl.isSmallMode = true;
                ctrl.smallModeSteps = getSmallModeSteps(angular.copy(ctrl.steps), ctrl.activeStepIndex);
            } else {
                ctrl.isSmallMode = false;
            }
        }

        function postLink(scope, element, attrs, ctrl) {
            initNumericStepper(element, ctrl);

            function onWindowResize() {
              initNumericStepper(element, ctrl);
            }

            function onDirectiveDestroy() {
                angular.element($window).unbind('resize', onWindowResize);
            }

            scope.$watch(function () {
                return ctrl.activeStepIndex;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) initNumericStepper(element, ctrl);
            });

            scope.$on('$destroy', onDirectiveDestroy);
            angular.element($window).bind('resize', onWindowResize);
            $timeout(function () {
                ctrl.$invokeEvent('onLoad', { element: element });
            },0,false);
        }

        return {
            scope: {},
            restrict: 'E',
            bindToController: {
                options: '=sitOptions'
            },
            controller: NumericStepperController,
            controllerAs: 'numericStepperCtrl',
            link: postLink,
            templateUrl: 'common/widgets/progressStepper/numeric-stepper.html'
        };
    }

})();

(function () {
    'use strict';

    /**
    * @ngdoc type
     * @module siemens.simaticit.common.widgets.progressStepper
     * @name progressStepperOptions
     */

    /**
   *@ngdoc directive
   * @name sitProgressStepper
   * @module siemens.simaticit.common.widgets.progressStepper
   * @description
   * Displays the state of a task with number or label.
   * @usage
   * As an element:
   * ```
   *     <sit-progress-stepper sit-options="data"></sit-progress-stepper>
   * ```
   * @restrict E
   *
   * @param {Object} sit-options Specifies the required data to render the progress of the task. The object must contain the following fields:
   * * **type**: The type of the progress stepper. It must be one of the following values: "numeric" or "label".
   * * **mode**: The orientation of the widget to be displayed in case of the type "numeric".
    The two different modes are "horizontal" and "vertical". The default value is "horizontal".
   * * **steps**: The array of objects to be passed for displaying the various steps in the widget. Each object must contain the following data:
   *  * **id** : Id corresponding to the respective step.
   *  * **label**: The label for the corresponding step.
    * * **tooltip**: The label is displayed as tooltip when you mouse hover.
   *
   * @example
   * In a view template, the **sit-progress-stepper** directive is used as follows:
   *
   * ```
   *     <sit-progress-stepper sit-options="data"></sit-progress-stepper>
   *
    * In Controller:
     * For Type: numeric
     * (function () {
     *     'use strict';
     *     var app = angular.module('siemens.simaticit.app');
     *     app.controller('ProgressStepperController', function(){
     *     data = {
     *         type: 'numeric',
     *         mode: 'vertical',
     *         steps: [
     *            {
     *            id: 'ID1',
     *            label : 'Step1'
     *            },
     *            {
     *            id: 'ID2',
     *            label : 'Step2'
     *            },
     *            {
     *            id: 'ID3',
     *            label : 'Step3'
     *            }
     *         ]
     *       };
     *     }
     *   });
    *   For Type: label
     * (function () {
     *     'use strict';
     *     var app = angular.module('siemens.simaticit.app');
     *     app.controller('ProgressStepperController', function(){
     *     data = {
     *         type: 'label',
     *         steps: [
     *            {
     *            id: 'ID1',
     *            label : 'Step1'
     *            },
     *            {
     *            id: 'ID2',
     *            label : 'Step2'
     *            },
     *            {
     *            id: 'ID3',
     *            label : 'Step3'
     *            }
     *         ]
     *       };
     *     }
     *   });
   * ```
   *
   */
    /**
            * @ngdoc method
            * @module siemens.simaticit.common.widgets.progressStepper
            * @name progressStepperOptions#setActiveStep
            * @param {String} mode specify the step which you want to make as active.
            * The following value is allowed:
            * step id: Specify the ID of the step.
            * @description
            * An API method which sets the status of the step as active. {@link progressStepperoptions setActiveStep}
            *  */
    /**
           * @ngdoc method
           * @module siemens.simaticit.common.widgets.progressStepper
           * @name progressStepperOptions#getActiveStep
           * @description
           * An API method which gets the information on the active step.{@link progressStepperoptions getActiveStep}
           * @returns {object} the active step information
                  **/

    /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.progressStepper
       * @name progressStepperOptions#goToPreviousStep
       * @description
       * An API method which makes the previous step in the task as active.
       * */

    /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.progressStepper
       * @name progressStepperOptions#goToNextStep
       * @description
       * An API method which makes the next step in the task as active.
       * */

    angular.module('siemens.simaticit.common.widgets.progressStepper')
        .directive('sitProgressStepper', ProgressStepperDirective);

    ProgressStepperDirective.$inject = ['common.widgets.service', '$timeout'];

    function ProgressStepperDirective(widgetService, $timeout) {
        var TYPE = widgetService.ENUMS.ProgressStepperType;
        var MODE = widgetService.ENUMS.ProgressStepperMode

        ProgressStepperController.prototype = new widgetService.BaseWidget('Progress stepper Widget', {
            options: {
                'type': TYPE.NUMERIC,
                'mode': MODE.HORIZONTAL,
                'steps': []
            }
        }, ['goToNextStep', 'goToPreviousStep', 'setActiveStep', 'getActiveStep', 'onNextStep', 'onPreviousStep']);

        ProgressStepperController.$inject = ['$scope'];
        function ProgressStepperController($scope) {
            var vm = this;
            this.$init($scope);

            (function (vm) {
                init(vm);
            })(this);

            function init() {
            }
        }

        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                options: '=sitOptions'
            },
            controller: ProgressStepperController,
            controllerAs: 'progressStepperCtrl',
            link: function (scope, element, attrs, ctrl) {
                $timeout(function () {
                    ctrl.$invokeEvent('onLoad', { element: element });
                },0,false);
            },
            templateUrl: 'common/widgets/progressStepper/progress-stepper.html'
        };
    }

})();
