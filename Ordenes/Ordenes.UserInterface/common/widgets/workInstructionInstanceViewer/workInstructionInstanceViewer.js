/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.workInstructionInstanceViewer
    *
    * @description
    * This module provides functionalities related to Work Instruction Instance Viewer.
    */
    angular.module('siemens.simaticit.common.widgets.workInstructionInstanceViewer', []);

})();

(function () {
    'use strict';
    /**
   * @ngdoc directive
   * @name sitWorkInstructionInstanceViewer
   * @module siemens.simaticit.common.widgets.workInstructionInstanceViewer
   * @description
   * Displays the Section and Step information of a Work Instruction instance.
   *
   * @usage
   * As an element:
   * ```
   * <sit-work-instruction-instance-viewer
   *        sit-instance-id='instanceId'
   *        sit-wi-definition-id ='wiDefinitionId'
   *        sit-wi-definition-json='wiDefinitionJson'
   *        sit-acknowledge-callback='acknowledgeCallback'
   *        sit-confirm-data-collection-callback='confirmDataCollectionCallback'
   *        sit-re-edit-step-callback='reEditStepCallback'
   *        sit-auto-save-callback='autoSaveCallback'
   *        sit-read-only='true'>
   * </sit-work-instruction-instance-viewer>
   * ```
   * @restrict E
   * @param {String} sitInstanceId The Id of the Work Instruction instance.
   * @param {String} sitWiDefinitionId  _(Optional)_ The Id of the Work Instruction Definition instance.
   * @param {String} sitWiDefinitionJson _(Optional)_ The design of the Work Instruction Definition.
   * @param {Function} sitAcknowledgeCallback JavaScript function that is called when the acknowledge button is clicked for a specific step.
   * @param {Function} sitConfirmDataCollectionCallback JavaScript function that is called when the confirm button is clicked for a specific step.
   * @param {Function} sitReEditStepCallback JavaScript function that is called when the re-edit button is clicked for a specific step.
   * @param {Function} sitAutoSaveCallback _(Optional)_ JavaScript function that is called when focus is changed for a specific step item.
   * @param {Bool} sitReadOnly _(Optional)_ The bool value for read-only mode. The default value is false.
   *
   */

    angular.module('siemens.simaticit.common.widgets.workInstructionInstanceViewer').directive('htmlRenderComplete', ['$timeout',
        function ($timeout) {
            return {
                replace: false,
                scope: {
                    'ngModel': '='
                },
                link: function (scope, element) {
                    $timeout(function () {
                        var tables = element.find('table');
                        (tables && tables.length && (_.each(tables, function (item) {
                            item.style['border-spacing'] = item.getAttribute('cellspacing') + 'px';

                            var tData = item.getElementsByTagName("td");
                            (tData && tData.length && (_.each(tData, function (data) {
                                data.style['padding'] = item.getAttribute('cellpadding') + 'px';
                            })));

                            var tHead = item.getElementsByTagName("th");
                            (tHead && tHead.length && (_.each(tHead, function (data) {
                                data.style['padding'] = item.getAttribute('cellpadding') + 'px';
                            })));
                        })));

                    }, 0, false);
                }
            };
        }
    ]);

    angular.module('siemens.simaticit.common.widgets.workInstructionInstanceViewer').directive('sitWorkInstructionInstanceViewer', sitWorkInstructionInstanceViewer);
    function sitWorkInstructionInstanceViewer() {
        return {
            bindToController: {
                sitInstanceId: '@',
                sitWiDefinitionId: '@?',
                sitWiDefinitionNid: '@?',
                sitWiDefinitionJson: '@?',
                sitAcknowledgeCallback: '&',
                sitConfirmDataCollectionCallback: '&',
                sitAcquireDataCollectionCallback: '&',
                sitReadOnly: '@?',
                sitAutoSaveCallback: '&?',
                sitReEditStepCallback: '&'
            },
            scope: {},
            restrict: 'E',
            transclude: true,
            templateUrl: 'common/widgets/workInstructionInstanceViewer/work-instruction-instance-viewer.html',
            controller: WorkInstructionInstanceViewerCtr,
            controllerAs: 'instanceViewerCtr'
        };
    }
    WorkInstructionInstanceViewerCtr.$inject = ['$scope', '$window', '$element', '$timeout', '$filter', '$translate',
        'common.services.ui.authentication', 'common.services.signalManager', 'common.services.logger.service', 'common.widgets.workInstructionInstanceViewer.service',
        'common.services.globalization.globalizationService', 'common.services.runtime.backendService'];

    function WorkInstructionInstanceViewerCtr($scope, $window, $element, $timeout, $filter, $translate, authenticationService, signalService, loggerService, service, globalizationService, backendService) {
        var vm = this;
        var isSectionSingle, element, openSectionIndex, stepItemsBackup, timerToolBoxHeight, timerConnection;

        var appName = 'WorkInstruction';
        var reconnectRequestCount = 0;
        var MAX_RECONNECTION_REQUESTS = 30;
        activate();

        function activate() {
            init();
            initSignalConnection();
            getDesign();
            registerEvents();
        }

        function init() {
            isSectionSingle = false;
            element = $element;
            openSectionIndex = -1;

            vm.sections = [];
            vm.steps = [];
            vm.isAllExpanded = false;
            vm.signalConnections = {};
            vm.user = authenticationService.getIndentity().unique_name;
            vm.sitReadOnly = vm.sitReadOnly && vm.sitReadOnly.toLowerCase() === 'true' ? true : false;
            vm.isReEditEnabled = false;
            vm.semiAuto = 'SemiAutomatic';
            vm.warningPopupTitle = $translate.instant('instanceViewer.dataCollection.warningsPopupTitle');

            vm.toggleOpen = toggleOpen;
            vm.toggleExpand = toggleExpand;
            vm.hasAcquireField = hasAcquireField;
            vm.hasAcquireStep = hasAcquireStep;
            vm.saveStepItem = saveStepItem;
            vm.acknowledge = acknowledge;
            vm.confirmDataCollectionStep = confirmDataCollectionStep;
            vm.acquireDataCollectionStep = acquireDataCollectionStep;
            vm.reEditStep = reEditStep;
            vm.getLocaleString = getLocaleString;
            vm.addWarningsToDataCollectionItem = addWarningsToDataCollectionItem;
            vm.translateWarningMessages = translateWarningMessages;
            vm.updateFlyoutStyles = updateFlyoutStyles;
            vm.onSectionCompleted = onSectionCompleted;
            vm.onStepCompleted = onStepCompleted;
            vm.onStepPending = onStepPending;
            vm.onConnectionLost = onConnectionLost;
            vm.onComplete = onComplete;
            vm.onError = onError;
            vm.onPreview = false;
            vm.noSectionOrStepsWarningMessage = "";
            vm.sectionsWithSteps = [];

            //To translate the messages coming from the backend and it follows the structure based on the index.
            translateWarningMessages();

            //listener to the resize event to detect resizing
            angular.element($window).bind('resize', setToolboxHeight);

            $scope.$on('$destroy', onDestroy);
        }

        function translateWarningMessages() {
            vm.messagesToBeTranslated = [
                "Could not determine if the field is mandatory.",
                "Could not determine if the field is read only.",
                "Could not determine the Default value.",
                "Could not determine the UoM value.",
                "Could not determine the Format value.",
                "Could not determine the Length value.",
                "Could not determine the Low Limit value.",
                "Could not determine the High Limit value.",
                "Could not determine the Target value.",
                "The values set for Low/High Limits and Target are not valid. The inserted value will not be validated against the Limits.",
                "The value set for Target is not valid with respect to the Limits."
            ];

            vm.translatedMessages = [
                $translate.instant('instanceViewer.dataCollection.warningMessages.mandatoryMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.readonlyMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.defaultMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.notUomMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.formatMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.lenthMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.lowLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.highLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.lowAlertLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.highAlertLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.lowCautionLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.highCautionLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.targetMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.validateLimitMessage'),
                $translate.instant('instanceViewer.dataCollection.warningMessages.validMessage')
            ];
        }

        function getDesign() {
            service.getWIInstanceDesign(vm.sitInstanceId, vm.sitWiDefinitionId, vm.sitWiDefinitionNid, vm.sitWiDefinitionJson, vm.sitReadOnly).then(function (data) {
                vm.sections = data.sections;
                isSectionSingle = data.isSectionSingle;
                vm.isReEditEnabled = data.isReEditEnabled;
                vm.sectionsWithSteps = vm.sections.filter(function (item) { return item.Steps.length > 0 });
                vm.steps = _.chain(vm.sections).pluck('Steps').flatten().value();
                stepItemsBackup = angular.copy(_.chain(vm.steps).pluck('DataCollectionItems').flatten().value());

                if (vm.sitInstanceId !== undefined) {
                    addWarningsToDataCollectionItem(vm.sections);
                }

                if (vm.sitWiDefinitionId !== undefined || vm.sitWiDefinitionJson !== undefined) {
                    vm.onPreview = true;
                    if (data.sections.length > 0) {
                        vm.noSectionOrStepsWarningMessage = data.sectionWithoutSteps.length !== 0 ? $translate.instant('instanceViewer.noStepsWarningMessage')
                            .replace("{0}", data.sectionWithoutSteps.join()) : "";

                    } else {
                        vm.noSectionOrStepsWarningMessage = $translate.instant('instanceViewer.noSectionWarningMessage')
                            .replace("{0}", vm.sitWiDefinitionNid);
                    }
                }

                //Timeout used to fix IE rendering issue
                timerToolBoxHeight = $timeout(function () {
                    setToolboxHeight();
                }, 0, false);
            });
        }

        function addWarningsToDataCollectionItem(sectionsData) {
            sectionsData.forEach(function (section) {
                if (section.isOpen) {
                    section.Steps.forEach(function (step) {
                        if (step.isOpen && step.Type === "DataCollection") {
                            service.getValidateBoundParameterValues(vm.sitInstanceId, section.NId, step.NId).then(function (messages) {
                                vm.warningMessages = messages.data.WarningMessages;
                                vm.warningMessages.forEach(function (message) {
                                    step.DataCollectionItems.map(function (item) {
                                        if (!item.warnings) {
                                            item.warnings = [];
                                        }
                                        if (item.NId === message.DataCollectionItemNId) {
                                            vm.messagesToBeTranslated.map(function (msg, index) {
                                                if (msg === message.WarningMessage) {
                                                    message.WarningMessage = vm.translatedMessages[index];
                                                    item.warnings.push(message.WarningMessage);
                                                }
                                            });
                                        }
                                    });
                                });
                            }, function (error) {
                                loggerService.log('Error while getting warning messages \n' + angular.toJson(error, true));
                            });
                        }
                    });
                } else {
                    vm.sectionNid = '';
                    vm.stepNid = '';
                }
            });
        }

        function updateFlyoutStyles() {
            $timeout(function () {
                if ($('.sit-flyout-menu.popover') && $('.sit-flyout-menu.popover')[0]) {
                    $('.sit-flyout-menu.popover')[0].style.maxWidth = 'none';
                    $('.sit-flyout-menu .flyout')[0].style.maxWidth = '480px';
                    $('.sit-flyout-menu .flyout')[0].style.maxHeight = '360px';
                    $('.sit-flyout-menu .flyout')[0].style.minHeight = '32px';
                }
            }, 0, false);
        }

        function setToolboxHeight() {
            var instanceViewerContainer = element.find('.instance-viewer-content');
            var sectionContainer = element.find('.custom-accordion.sections');
            var height = instanceViewerContainer.height();
            if (vm.sections.length > 1) {
                height -= 32;
            }
            sectionContainer.css('height', height - 4 + 'px');
        }

        function toggleOpen(section) {
            if (!section.isOpen) {
                section.isOpen = true;

                var closedItemIndex = _.findIndex(vm.sections, function (sec) {
                    return sec.isOpen === false;
                });
                if (closedItemIndex === -1) {
                    vm.isAllExpanded = true;
                }
            } else {
                section.isOpen = false;

                var openItemIndex = _.findIndex(vm.sections, function (sec) {
                    return sec.isOpen === true;
                });
                if (openItemIndex === -1) {
                    vm.isAllExpanded = false;
                }
            }
        }

        function toggleExpand() {
            vm.isAllExpanded = !vm.isAllExpanded;
            _.each(vm.sections, function (section) {
                section.isOpen = vm.isAllExpanded;
            });
        }

        function hasAcquireField(step, item) {
            var acquireField = false;
            if (step.Type === 'DataCollection' && step.Items) {
                for (var i = 0; i < step.Items.length; i++) {
                    if (step.Items[i].id === item.id && step.Items[i].AcquisitionBehavior === vm.semiAuto) {
                        acquireField = true;
                        break;
                    }
                }
            }
            return acquireField ? true : false;
        }

        function hasAcquireStep(step) {
            var hasAcquire = false;
            if (step.Type === 'DataCollection' && step.Items) {
                for (var i = 0; i < step.Items.length; i++) {
                    if (step.Items[i].AcquisitionBehavior === vm.semiAuto) {
                        hasAcquire = true;
                        break;
                    }
                }
            }
            return hasAcquire ? true : false;
        }

        function saveStepItem(stepItem) {
            //Auto Save not configured
            if (typeof vm.sitAutoSaveCallback === "undefined") {
                return;
            }

            var item = _.find(stepItemsBackup, function (oldItem) {
                return oldItem && oldItem.Id === stepItem.Id;
            });
            var originalValue = stepItem.formData.value;
            var oldValue = '';
            var newvalue = '';
            if (stepItem.UIControl === 'Checkbox') {
                oldValue = item.formData.value[0].checked.toString();
                newvalue = stepItem.formData.value[0].checked.toString();
            } else if (stepItem.UIControl === 'Dropdown') {
                oldValue = item.formData.value.value;
                newvalue = stepItem.formData.value.value;
            } else if (stepItem.UIControl === 'Datetime') {
                oldValue = item.formData.value && item.formData.value != 'Invalid Date' ? item.formData.value.toISOString() : '';
                newvalue = stepItem.formData.value ? stepItem.formData.value.toISOString() : '';
            } else if (stepItem.UIControl === 'Decimal' && stepItem.formData.format > 0) {
                oldValue = item.formData.value;
                newvalue = stepItem.formData.value !== "" ? stepItem.formData.value : '';
                var val = newvalue.toString().split('.');
                if (val.length === 2 && val[1].length > stepItem.formData.format) {
                    val[1] = val[1].substring(0, item.Data.Format);
                    val = val.join('.');
                    newvalue = val;
                }
                stepItem.formData.value = newvalue;
                if (originalValue !== newvalue) {
                    stepItem.formData.isFormatted = true;
                    stepItem.formData.originalValue = originalValue;
                } else {
                    stepItem.formData.isFormatted = false;
                }
            } else {
                oldValue = item.formData.value;
                newvalue = stepItem.formData.value;
                stepItem.formData.isFormatted = false;
                stepItem.formData.originalValue = originalValue;
            }

            if (oldValue === originalValue) {
                return;
            }
            stepItem.formData.originalValue = originalValue;
            item.formData.value = angular.copy(stepItem.formData.value);
            vm.sitAutoSaveCallback({
                itemId: stepItem.Id,
                value: stepItem.UIControl === 'Decimal' ? originalValue : newvalue
            });
        }

        function formatDecimalValue(value, format) {
            if (!format || !value) {
                return value;
            } else {
                var val = value.toString().split('.');
                if (val.length === 2 && format !== '' && val[1].length > format) {
                    val[1] = val[1].substring(0, format);
                    value = val.join('.');
                }
                return value;
            }
        }

        function acknowledge(step) {
            vm.sitAcknowledgeCallback({
                stepId: step.Id
            });
        }

        function confirmDataCollectionStep(step) {
            var itemValues = [];
            step.DataCollectionItems.forEach(function (item, index) {
                var value = '';
                if (item.UIControl === 'Checkbox') {
                    value = item.formData.value[0].checked.toString();
                } else if (item.UIControl === 'Dropdown') {
                    value = item.formData.value ? item.formData.value.value : '';
                } else if (item.UIControl === 'Datetime') {
                    value = item.formData.value ? item.formData.value.toISOString() : '';
                } else if (item.UIControl === 'Decimal') {
                    value = item.formData.value;
                } else {
                    value = item.formData.value;
                }
                itemValues[index] = {
                    NId: item.NId,
                    ItemValue: value || value == 0 ? value.toString() : ''
                };
            });

            vm.sitConfirmDataCollectionCallback({
                stepId: step.Id,
                items: itemValues
            });
        }

        function acquireDataCollectionStep(step) {
            var indices = findStepAndSectionIndex(step.Id);
            var ids = {
                sectionId: vm.sections[indices[1]].Id,
                stepId: step.Id
            }
            var itemIds = [];
            if (step.Type === 'DataCollection' && step.Items) {
                step.Items.forEach(function (item, index) {
                    if (item.AcquisitionBehavior === vm.semiAuto) {
                        itemIds.push(item.Id);
                    }
                });
            }
            vm.sitAcquireDataCollectionCallback({ ids: ids, items: itemIds }).then(function (itemsIdValue) {
                itemsIdValue.forEach(function (itemIdValue, indexIdValue) {
                    step.DataCollectionItems.forEach(function (item, index) {
                        if (itemIdValue.Id === item.Id) {
                            acquireDataCollectionStepCheck(item, itemIdValue);
                        }
                    });
                });
            }, function (err) {

            });
        }

        function acquireDataCollectionStepCheck(item, itemIdValue) {
            if (item.UIControl === 'Checkbox') {
                item.formData.value[0].checked = (itemIdValue.ItemValue === 'true');
            } else if (item.UIControl === 'Dropdown') {
                item.formData.value = $filter('filter')(item.formData.options, { value: itemIdValue.ItemValue }, true)[0];
                if (!item.formData.value) {
                    item.formData.value = { value: "" };
                }
            } else if (item.UIControl === 'Datetime') {
                item.formData.value = itemIdValue.ItemValue ? new Date(itemIdValue.ItemValue) : '';
            } else if (item.UIControl === 'Number') {
                item.formData.value = Number(itemIdValue.ItemValue);
            } else {
                item.formData.value = itemIdValue.ItemValue;
            }
        }

        function reEditStep(stepId) {
            vm.sitReEditStepCallback({
                stepId: stepId
            });

            var indices = findStepAndSectionIndex(stepId);
            var reEditedStepIndex = indices[0];
            var reEditedSectionIndex = indices[1];

            if (!checkPreviousStep(reEditedStepIndex, reEditedSectionIndex)) {
                vm.sections[reEditedSectionIndex].Steps[reEditedStepIndex].isDisabled = false;
            }
            vm.sections[reEditedSectionIndex].Steps[reEditedStepIndex].IsCompleted = false;
            vm.sections[reEditedSectionIndex].Steps[reEditedStepIndex].isOpen = true;
            vm.sections[reEditedSectionIndex].Steps[reEditedStepIndex].isReEdited = true;
            vm.sections[reEditedSectionIndex].IsCompleted = false;

            for (var i = reEditedStepIndex + 1; i < vm.sections[reEditedSectionIndex].Steps.length; i++) {
                vm.sections[reEditedSectionIndex].Steps[i].isDisabled = true;
                vm.sections[reEditedSectionIndex].Steps[i].isOpen = false;
            }

            for (var j = reEditedSectionIndex + 1; j < vm.sections.length; j++) {
                for (i = 0; i < vm.sections[j].Steps.length; i++) {
                    vm.sections[j].Steps[i].isDisabled = true;
                    vm.sections[j].Steps[i].isOpen = false;
                }
            }
            addWarningsToDataCollectionItem(vm.sections);
        }

        function checkPreviousStep(stepIndex, sectionIndex) {
            var isPreviousStepReedited = false;
            if (stepIndex > 0) {
                var previousSteps = vm.sections[sectionIndex].Steps.slice(0, stepIndex);
                if (previousSteps && previousSteps.length > 0) {
                    var previousReeditedStep = _.findIndex(previousSteps, function (step) {
                        return step.isReEdited === true;
                    });

                    if (previousReeditedStep >= 0) {
                        isPreviousStepReedited = true;
                    }
                }
            }

            var previousSections = vm.sections.slice(0, sectionIndex);
            if (!isPreviousStepReedited && previousSections && previousSections.length > 0) {
                previousSections.forEach(function (sec) {
                    var reEditedStep = _.findIndex(sec.Steps, function (step) {
                        return step.isReEdited === true;
                    });

                    if (reEditedStep >= 0) {
                        isPreviousStepReedited = true;
                        previousSections = [];
                    }
                });

            }

            return isPreviousStepReedited;
        }
        /**
         * Returns the section and step index for the first 'isCompleted' step.
         */
        function enableStep() {
            var sec = -1;
            var step = -1;
            for (var i = 0; i < vm.sections.length; i++) {
                for (var j = 0; j < vm.sections[i].Steps.length; j++) {
                    if (!vm.sections[i].Steps[j].IsCompleted) {
                        step = j;
                        sec = i;
                        break;
                    }
                }
                if (step !== -1) {
                    break;
                }
            }
            return [sec, step];
        }
        /**
         * Returns the page no, for a step, which is located in any section.
         * @param {any} sec
         * @param {any} step
         */
        function stepNumber(sec, step) {
            var num = 0;
            var i = 1;
            while (i <= (sec + 1)) {
                if (i === (sec + 1)) {
                    num = num + (step + 1);
                } else {
                    num = num + (vm.sections[i - 1].Steps.length);
                }
                i++;
            }
            return num;
        }

        function onStepCompleted(signal) {
            if (signal.WorkInstructionId !== vm.sitInstanceId) {
                // Not current instance
                return;
            }
            var completedStepIndex = -1;
            openSectionIndex = -1;
            //Find Step
            var indices = findStepAndSectionIndex(signal.WorkInstructionStepId);
            completedStepIndex = indices[0];
            openSectionIndex = indices[1];

            var arr = [];
            if (vm.sections[openSectionIndex].Steps[completedStepIndex].hasOwnProperty('isReEdited')
                && vm.sections[openSectionIndex].Steps[completedStepIndex].isReEdited) {
                vm.sections[openSectionIndex].Steps[completedStepIndex].isReEdited = false;
            }
            vm.sections[openSectionIndex].Steps[completedStepIndex].isOpen = false;
            vm.sections[openSectionIndex].Steps[completedStepIndex].IsCompleted = true;
            vm.sections[openSectionIndex].Steps[completedStepIndex].IsSignaturePending = false;
            vm.sections[openSectionIndex].Steps[completedStepIndex].CompletedBy = signal.CompletedBy;
            vm.sections[openSectionIndex].Steps[completedStepIndex].AcknowledgeOn = signal.AcknowledgeOn;
            if (signal.Items) {
                updateDataCollectionItemValues(signal.Items, openSectionIndex, completedStepIndex);
            }

            if (vm.sections[openSectionIndex].currentPage + 1 <= vm.sections[openSectionIndex].Steps.length) {
                arr = enableStep();
                /**
                 * Checks for the first step which is in re-edit mode from the the current step.
                 */
                if (arr.length > 0 && arr[0] <= openSectionIndex
                    && (stepNumber(arr[0], arr[1]) < stepNumber(openSectionIndex, completedStepIndex))) {
                    vm.sections[openSectionIndex].Steps[completedStepIndex + 1].isDisabled = true;
                } else {
                    vm.sections[openSectionIndex].Steps[completedStepIndex + 1].isDisabled = vm.sections[openSectionIndex].Steps[completedStepIndex + 1].IsCompleted;
                }
                if (signal.CompletedBy === vm.user) {
                    //Open next step
                    if (arr.length > 0 && arr[0] <= openSectionIndex
                        && (stepNumber(arr[0], arr[1]) < stepNumber(openSectionIndex, completedStepIndex))) {
                        vm.sections[arr[0]].Steps[arr[1]].isOpen = true;
                    } else {
                        vm.sections[openSectionIndex].currentPage += 1;
                        vm.sections[openSectionIndex].Steps[completedStepIndex + 1].isOpen = true;
                    }
                }
            }
            addWarningsToDataCollectionItem(vm.sections);
            $scope.$apply();
        }

        function onSectionCompleted(signal) {
            if (signal.WorkInstructionId !== vm.sitInstanceId) {
                // Not current instance
                return;
            }

            //Find Section
            var completedSectionIndex = -1;
            for (var i = 0; i < vm.sections.length; i++) {
                if (vm.sections[i].Id === signal.WorkInstructionSectionId) {
                    completedSectionIndex = i;
                    break;
                }
            }
            var completedSection = vm.sections[completedSectionIndex];

            completedSection.IsCompleted = true;

            if (completedSectionIndex + 1 < vm.sections.length) {
                //Open next section
                vm.sections[completedSectionIndex + 1].isOpen = true;
                for (i = 0; i < vm.sections[completedSectionIndex + 1].Steps.length; i++) {
                    if (!vm.sections[completedSectionIndex + 1].Steps[i].IsCompleted) {
                        vm.sections[completedSectionIndex + 1].Steps[i].isDisabled = false;
                        vm.sections[completedSectionIndex + 1].Steps[i].isOpen = true;
                        break;
                    } else {
                        vm.sections[completedSectionIndex + 1].Steps[i].isDisabled = true;
                        vm.sections[completedSectionIndex + 1].Steps[i].isOpen = false;
                    }
                }
            }

            if (signal.CompletedBy === vm.user) {
                completedSection.isOpen = isSectionSingle || false;

                var openItemIndex = _.findIndex(vm.sections, function (section) {
                    return section.isOpen === true;
                });
                if (openItemIndex === -1) {
                    vm.isAllExpanded = false;
                }
            }
            addWarningsToDataCollectionItem(vm.sections);
            $scope.$apply();
        }

        function onStepPending(signal) {
            if (signal.WorkInstructionId !== vm.sitInstanceId) {
                // Not current instance
                return;
            }
            var acknowledgeStepIndex = -1;
            openSectionIndex = -1;
            //Find Step
            var indices = findStepAndSectionIndex(signal.WorkInstructionStepId);
            acknowledgeStepIndex = indices[0];
            openSectionIndex = indices[1];

            vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].isOpen = true;
            vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].IsSignaturePending = signal.IsSignaturePending;
            vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].CompletedBy = signal.CompletedBy;
            vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].AcknowledgeOn = signal.AcknowledgedOn;
            if (signal.ScenarioInstanceId) {
                vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].ScenarioInstanceId = signal.ScenarioInstanceId;
                vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].ScenarioInstance = {
                    ScenarioInstanceId: signal.ScenarioInstanceId
                }
            } else {
                vm.sections[openSectionIndex].Steps[acknowledgeStepIndex].ScenarioInstance = null;
            }
            if (signal.Items) {
                updateDataCollectionItemValues(signal.Items, openSectionIndex, acknowledgeStepIndex);
            }
            addWarningsToDataCollectionItem(vm.sections);
            $scope.$apply();
        }

        function findStepAndSectionIndex(stepId) {
            var sec = -1;
            var step = -1;
            for (var i = 0; i < vm.sections.length; i++) {
                for (var j = 0; j < vm.sections[i].Steps.length; j++) {
                    if (vm.sections[i].Steps[j].Id === stepId) {
                        step = j;
                        sec = i;
                        break;
                    }
                }
                if (step !== -1) {
                    break;
                }
            }
            return [step, sec];
        }

        function updateDataCollectionItemValues(items, openSectionIndex, completedStepIndex) {
            var isStepOutOfSpecValues = false;
            vm.sections[openSectionIndex].Steps[completedStepIndex].DataCollectionItems.map(function (item) {
                var signalItem = _.findWhere(items, { NId: item.NId });
                if (signalItem) {
                    switch (item.UIControl) {
                        case 'Checkbox':
						if (typeof signalItem.ItemValue === 'string') 
						{
                            switch (signalItem.ItemValue.toLowerCase()) {
                                case 'null':
                                    item.formData.value[0].checked = 'null';
                                    break;
                                case 'true':
                                    item.formData.value[0].checked = true;
                                    break;
                                default:
                                    item.formData.value[0].checked = false;
                            }
						}
						else
						{
							item.formData.value[0].checked = false;
                            }
                            break;
                        case 'Dropdown':
                            item.formData.value = signalItem.ItemValue ? _.findWhere(item.formData.options, { value: signalItem.ItemValue }) : '';
                            break;
                        case 'Datetime':
                            item.formData.value = signalItem.ItemValue ? new Date(signalItem.ItemValue) : '';
                            break;
                        case 'Number':
                            item.formData.value = signalItem.ItemValue ? parseFloat(signalItem.ItemValue) : '';
                            break;
                        case 'Integer':
                            item.formData.value = signalItem.ItemValue ? signalItem.ItemValue : '';
                            break;
                        case 'Decimal':
                            item.formData.value = signalItem.ItemValue ? formatDecimalValue(signalItem.ItemValue, item.formData.format) : '';
                            break;
                        default:
                            item.formData.value = signalItem.ItemValue;
                    }
                    if (!isStepOutOfSpecValues && signalItem.IsOutOfSpec) {
                        isStepOutOfSpecValues = true;
                    }
                }
                return item.formData.value;
            });
            vm.sections[openSectionIndex].Steps[completedStepIndex].IsOutOfSpecValues = isStepOutOfSpecValues;
        }

        function initSignalConnection() {
            reconnectRequestCount = 0;
            loggerService.log(appName + ": WebSocket Opened Successfully");
            subscribeToStepCompleted();
            subscribeToSectionCompleted();
            subscribeToStepPending();
        }

        function onConnectionLost() {
            // On socket connection error, try to connect to the socket again
            loggerService.log("Error in socket connection...");
            if (reconnectRequestCount === MAX_RECONNECTION_REQUESTS) {
                loggerService.log('maximum reconnection request reached...');
                return;
            }
            reconnectRequestCount++;
            setTimeout(reconnect, 5000);
        }

        function reconnect() {
            loggerService.log("Reconnecting...");
            backendService.reconnectSignals(appName).then(function () {
                reconnectRequestCount = 0;
                loggerService.log(appName + ": WebSocket Reconnected Successfully");
            }, function (error) {
                loggerService.log("Error in reconnecting a web socket \n" + angular.toJson(error, true));
                onConnectionLost();
            });
        }

        function subscribeToStepCompleted() {
            var subscribeFilter = "EnvelopeModule eq 'WorkInstruction' and EnvelopeTopic eq 'WorkInstruction'";
            var connectionObj = {
                appName: appName,
                signalName: 'WorkInstructionStepCompletedSignal',
                options: subscribeFilter,
                onMessage: onStepCompleted,
                onConnectionError: onConnectionLost,
                onSubscriptionError: onError,
                onComplete: onComplete
            }
            backendService.subscribe(connectionObj).then(function (id) {
                vm.signalConnections['WorkInstructionStepCompletedSignal'] = id;
                loggerService.log("WorkInstructionStepCompletedSignal subscribe callback");
            }, function () {
                loggerService.log("WorkInstructionStepCompletedSignal Subscription error");
            });
        }

        function subscribeToSectionCompleted() {
            var subscribeFilter = "EnvelopeModule eq 'WorkInstruction' and EnvelopeTopic eq 'WorkInstruction'";
            var connectionObj = {
                appName: appName,
                signalName: 'WorkInstructionSectionCompletedSignal',
                options: subscribeFilter,
                onMessage: onSectionCompleted,
                onConnectionError: onConnectionLost,
                onSubscriptionError: onError,
                onComplete: onComplete
            }
            backendService.subscribe(connectionObj).then(function (id) {
                vm.signalConnections['WorkInstructionSectionCompletedSignal'] = id;
                loggerService.log("WorkInstructionSectionCompletedSignal subscribe callback");
            }, function () {
                loggerService.log("WorkInstructionSectionCompletedSignal Subscription error");
            });
        }

        function subscribeToStepPending() {
            var subscribeFilter = "EnvelopeModule eq 'WorkInstruction' and EnvelopeTopic eq 'WorkInstruction'";

            var connectionObj = {
                appName: appName,
                signalName: 'OnWorkInstructionStepInPendingSignal',
                options: subscribeFilter,
                onMessage: onStepPending,
                onConnectionError: onConnectionLost,
                onSubscriptionError: onError,
                onComplete: onComplete
            }
            backendService.subscribe(connectionObj).then(function (id) {
                vm.signalConnections['OnWorkInstructionStepInPendingSignal'] = id;
                loggerService.log("OnWorkInstructionStepInPendingSignal subscribe callback");
            }, function () {
                loggerService.log("OnWorkInstructionStepInPendingSignal Subscription error");
            });
        }

        function onError(error) {
            loggerService.log("An error occurred: \n" + angular.toJson(error, true));
        }

        function onComplete() {
            loggerService.log("Signal stopped sending messages.");
        }

        function destroySignalServiceConnections() {
            for (var connectionid in vm.signalConnections) {
                closeConnection(connectionid);
            }
        }

        function closeConnection(connId) {
            // When the second argument is passed as true, the websocket for the App will be closed after the last active subscription closes.
            backendService.unsubscribe(vm.signalConnections[connId], true).then(function () {
                delete vm.signalConnections[connId];
                loggerService.log("Closed Connection " + connId);
            }, function (error) {
                loggerService.log("Error in Closing Connection \n" + angular.toJson(error, true));
            });
        }

        function getLocaleString(value) {
            if (value === null || value === undefined || value === "") {
                return '--';
            }
            if (typeof value === 'string') {
                value = Number(value);
            }
            var culture = globalizationService.getLocale();
            var tempValue = value.toString().split('.');
            if (tempValue.length === 2) {
                var digits = Math.min(20, tempValue[1].length);
                return value.toLocaleString(culture, { minimumFractionDigits: digits, maximumFractionDigits: digits });
            } else {
                return value.toLocaleString(culture);
            }
        }

        function registerEvents() {
            vm.propertyGridValidityChangedEvent = $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function onPropertyGridValidityChange(event, params) {
            for (var i = 0; i < vm.steps.length; i++) {
                var tempStep = vm.steps[i];
                var tempStepItems = tempStep.Items !== undefined ? tempStep.Items : tempStep.DataCollectionItems;
                if (params.id === 'content_fields_form_' + tempStep.sectionNId + "_" + tempStep.NId) {

                    tempStep.validInputs = params.validity;
                    break;
                }

            }
        }

        function onDestroy() {
            angular.element($window).unbind('resize', setToolboxHeight);
            destroySignalServiceConnections();
            vm.propertyGridValidityChangedEvent();
            $timeout.cancel(timerToolBoxHeight);
            $timeout.cancel(timerConnection);
        }
    }
})();

"use strict";
var sit;
(function (sit) {
    var framework;
    (function (framework) {
        var WorkInstructionInstanceViewerService = /** @class */ (function () {
            function WorkInstructionInstanceViewerService($q, $sce, backendService, $translate, $filter, globalizationService, commonService) {
                this.$q = $q;
                this.$sce = $sce;
                this.backendService = backendService;
                this.$translate = $translate;
                this.$filter = $filter;
                this.globalizationService = globalizationService;
                this.commonService = commonService;
                this.rangeObject = {
                    minBigInt: -9007199254740992,
                    maxBigInt: 9007199254740991,
                    minDecimalValue: -7.9 * Math.pow(10, 28),
                    maxDecimalValue: 7.9 * Math.pow(10, 28)
                };
                this.baseService = commonService.services.runtime.backendService;
            }
            WorkInstructionInstanceViewerService.prototype.getWIInstanceDesign = function (Id, WIDefinitionId, WIDefinitionNId, WIDefinitionJson, isReadOnly) {
                var workInstruction;
                var dcItemsAndLimits;
                var defer = this.$q.defer();
                var inputParams = {
                    'WorkInstruction_Id': Id
                };
                var thisObj = this;
                if (Id !== undefined && Id !== "") { //If WIInstanceId exists
                    this.execReadingFunction('RetrieveWorkInstructionSectionsAndSteps', inputParams, '', 'WorkInstruction').then(function (result) {
                        workInstruction = result.value[0];
                        thisObj.execReadingFunction('RetrieveWorkInstructionItemsAndLimit', inputParams, '', 'WorkInstruction').then(function (result) {
                            dcItemsAndLimits = result.value[0];
                            var designQuery = {
                                appName: 'WorkInstruction',
                                entityName: 'WorkInstruction',
                                options: '$select=Id,NId,Design&$filter=Id eq ' + Id
                            };
                            thisObj.getInstanceViewerSection(designQuery, workInstruction, dcItemsAndLimits, isReadOnly).then(function (obj) {
                                defer.resolve(obj);
                            });
                        }, function (err) {
                            defer.reject(err);
                        });
                    }, function (err) {
                        defer.reject(err);
                    });
                }
                else if (WIDefinitionId !== "" && WIDefinitionId !== undefined) { //If  only WI Definition Id exists
                    var designQuery = {
                        appName: 'WorkInstruction',
                        entityName: 'WorkInstructionDefinition',
                        options: '$select=Id,NId,Design&$filter=Id eq ' + WIDefinitionId
                    };
                    thisObj.getInstanceViewerSection(designQuery, undefined, undefined, isReadOnly).then(function (obj) {
                        defer.resolve(obj);
                    }, function (err) {
                        defer.reject(err);
                    });
                }
                else { //If only wiDefinitionJson exists (on click of apply in WIDefinition Page)
                    var model = JSON.parse(WIDefinitionJson);
                    var returnObj = thisObj.getSectionObject(model, undefined, undefined, false);
                    defer.resolve(returnObj);
                }
                return defer.promise;
            };
            WorkInstructionInstanceViewerService.prototype.getInstanceViewerSection = function (designQuery, workInstruction, dcItemsAndLimits, isReadOnly) {
                var _this = this;
                var defer = this.$q.defer();
                this.backendService.findAll(designQuery).then(function (data) {
                    var model = JSON.parse(data.value[0].Design.Model);
                    var returnObj = _this.getSectionObject(model, workInstruction, dcItemsAndLimits, isReadOnly);
                    defer.resolve(returnObj);
                }, function (err) {
                    defer.reject(err);
                });
                return defer.promise;
            };
            WorkInstructionInstanceViewerService.prototype.getSectionObject = function (model, workInstruction, dcItemsAndLimits, isReadOnly) {
                var svc = this;
                var sectionObj;
                var itemObj;
                var sce = this.$sce;
                var isSectionSingle = false;
                var isAuditTrailInstalled = this.backendService.getAppEndPoint('AuditTrail');
                var sections = model.WorkInstruction.Sections;
                isSectionSingle = model.WorkInstruction.Sections.length === 1;
                var sectionWithoutSteps = [];
                sections.forEach(function (section) {
                    var modelSteps = section.Steps;
                    if (workInstruction !== undefined) {
                        _.extend(section, _.findWhere(workInstruction.Sections, { NId: section.NId }));
                    }
                    section.Steps = _.sortBy(section.Steps, function (step) { return step.Sequence; });
                    if (section.Steps.length === 0 && workInstruction === undefined) {
                        sectionWithoutSteps.push(section.NId);
                    }
                    section.Steps.forEach(function (step) {
                        _.extend(step, _.findWhere(modelSteps, { NId: step.NId }));
                        step.sectionNId = section.NId;
                        step.stepInstruction = sce.trustAsHtml(svc.validateAnchorTag(step));
                        step.isOpen = !step.IsCompleted;
                        step.displayName = step.NId;
                        if (step.Title) {
                            step.displayName += ' - ' + step.Title;
                        }
                        if (step.Type === 'DataCollection') {
                            if (dcItemsAndLimits !== undefined) {
                                sectionObj = _.findWhere(dcItemsAndLimits.Sections, { NId: section.NId });
                                itemObj = _.findWhere(sectionObj.Steps, { NId: step.NId });
                                _.extend(step.Items, itemObj.Items);
                            }
                            if (step.Items || step.DataCollectionItems) {
                                svc.getDataCollectionItems(step);
                            }
                        }
                        if (isAuditTrailInstalled !== null && (step.ScenarioConfiguration && step.ScenarioConfiguration.NId !== null || (step.ScenarioInstanceId && (step.IsSignaturePending || step.IsCompleted)))) {
                            step.IsSignButtonVisible = true;
                        }
                        step.ScenarioInstance = {
                            ScenarioInstanceId: step.ScenarioInstanceId
                        };
                    });
                    section.isOpen = isSectionSingle || !section.IsCompleted;
                    section.noOfSteps = section.Steps.length;
                    section.currentPage = 1;
                    section.displayName = section.NId;
                    if (section.Title) {
                        section.displayName += ' - ' + section.Title;
                    }
                });
                if (workInstruction !== undefined && (isReadOnly || workInstruction.Status.StatusNId === 'Completed' || workInstruction.Status.StatusNId === 'Aborted')) {
                    sections = svc.getReadOnlyMode(sections);
                }
                else if (sections.length > 0) {
                    this.findFirstSectionStepOpen(sections, isSectionSingle);
                }
                var isReEditEnabled = workInstruction ? (workInstruction.IsReEditEnabled && (workInstruction.Status.StatusNId === 'Completed' || workInstruction.Status.StatusNId === 'InEditing')) : false;
                var Obj = {
                    'sections': sections,
                    'isSectionSingle': isSectionSingle,
                    'isReEditEnabled': isReEditEnabled,
                    'sectionWithoutSteps': sectionWithoutSteps
                };
                return Obj;
            };
            WorkInstructionInstanceViewerService.prototype.execCommand = function (publicName, params, projectName) {
                return this.baseService.invoke({
                    'appName': (projectName !== undefined ? projectName : 'WorkInstruction'),
                    'commandName': publicName,
                    'params': params
                }).catch(this.baseService.backendError);
            };
            WorkInstructionInstanceViewerService.prototype.execReadingFunction = function (readingFunctionName, readingFunctionParameters, readingFunctionOptions, projectName) {
                return this.baseService.read({
                    'appName': (projectName !== undefined ? projectName : 'WorkInstruction'),
                    'functionName': readingFunctionName,
                    'params': readingFunctionParameters,
                    'options': readingFunctionOptions
                }).catch(this.baseService.backendError);
            };
            WorkInstructionInstanceViewerService.prototype.getValidateBoundParameterValues = function (WorkInstructionId, SectionNId, StepNId) {
                var obj = {
                    WorkInstructionId: WorkInstructionId,
                    SectionNId: SectionNId,
                    StepNId: StepNId
                };
                var defer = this.$q.defer();
                this.execCommand('ValidateBoundParameterValuesForStep', obj, 'WorkInstruction').then(function (result) {
                    defer.resolve(result);
                }, function (err) {
                    defer.reject(err);
                });
                return defer.promise;
            };
            WorkInstructionInstanceViewerService.prototype.validateAnchorTag = function (step) {
                //adding attribute 'target=_blank' for all anchor tag to fix the page crash
                var addTarget = '<a href';
                return step.Instructions.safeReplaceAll(addTarget, '<a target=\"_blank\" href');
            };
            WorkInstructionInstanceViewerService.prototype.getDataCollectionItems = function (step) {
                var svc = this;
                var re, isOutOfRange;
                var max_supported_digit = 15;
                step.DataCollectionItems.map(function (item) {
                    var defaultOrBindedValue;
                    var target = item.Data.Limits.filter(function (a) { return a.Name === 'Target'; })[0];
                    var highLimit = item.Data.Limits.filter(function (a) { return a.Name === 'HighLimit'; })[0];
                    var lowLimit = item.Data.Limits.filter(function (a) { return a.Name === 'LowLimit'; })[0];
                    var highAlertLimit = item.Data.Limits.filter(function (a) { return a.Name === 'AlertMax'; })[0];
                    var lowAlertLimit = item.Data.Limits.filter(function (a) { return a.Name === 'AlertMin'; })[0];
                    var highCautionLimit = item.Data.Limits.filter(function (a) { return a.Name === 'CautionMax'; })[0];
                    var lowCautionLimit = item.Data.Limits.filter(function (a) { return a.Name === 'CautionMin'; })[0];
                    _.extend(item, _.findWhere(step.Items, {
                        ItemNId: item.NId,
                        WorkInstructionStep_Id: step.Id
                    }));
                    if (item.IsOutOfSpec && !step.IsOutOfSpecValues) {
                        step.IsOutOfSpecValues = item.IsOutOfSpec;
                    }
                    var itemFormDataTarget = item.Limit && item.Limit.length > 0 && item.Limit[0].Target ? item.Limit[0].Target : target.Value;
                    var itemFormDataHighLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].HighLimit ? item.Limit[0].HighLimit : highLimit.Value;
                    var itemFormDataLowLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].LowLimit ? item.Limit[0].LowLimit : lowLimit.Value;
                    if (highAlertLimit && highAlertLimit.Value) {
                        var itemFormDataHighAlertLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].HighAlertLimit ? item.Limit[0].HighAlertLimit : highAlertLimit.Value;
                    }
                    else {
                        var itemFormDataHighAlertLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].HighAlertLimit ? item.Limit[0].HighAlertLimit : '';
                    }
                    if (lowAlertLimit && lowAlertLimit.Value) {
                        var itemFormDataLowAlertLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].LowAlertLimit ? item.Limit[0].LowAlertLimit : lowAlertLimit.Value;
                    }
                    else {
                        var itemFormDataLowAlertLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].LowAlertLimit ? item.Limit[0].LowAlertLimit : '';
                    }
                    if (highCautionLimit && highCautionLimit.Value) {
                        var itemFormDataHighCautionLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].HighCautionLimit ? item.Limit[0].HighCautionLimit : highCautionLimit.Value;
                    }
                    else {
                        var itemFormDataHighCautionLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].HighCautionLimit ? item.Limit[0].HighCautionLimit : '';
                    }
                    if (lowCautionLimit && lowCautionLimit.Value) {
                        var itemFormDataLowCautionLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].LowCautionLimit ? item.Limit[0].LowCautionLimit : lowCautionLimit.Value;
                    }
                    else {
                        var itemFormDataLowCautionLimit = item.Limit && item.Limit.length > 0 && item.Limit[0].LowCautionLimit ? item.Limit[0].LowCautionLimit : '';
                    }
                    item.formData = {};
                    item.formData.Label = item.Data.Annotations.filter(function (a) { return a.Name === 'Label'; })[0].Value;
                    item.formData.Caption = item.Data.Annotations.filter(function (a) { return a.Name === 'Caption'; })[0].Value;
                    switch (item.UIControl) {
                        case 'Text': {
                            defaultOrBindedValue = item.DefaultValue ? item.DefaultValue : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? item.ItemValue : defaultOrBindedValue;
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            item.formData.Validation = {
                                required: item.IsRequired,
                                maxlength: item.Length
                            };
                            if (item.Format) {
                                item.formData.Validation.custom = function (value, ngModel) {
                                    var re = new RegExp(item.Format);
                                    if (value) {
                                        re.test(value) ? item.formData.validationMessage = '' : item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.formatMismatch');
                                    }
                                    else {
                                        item.formData.validationMessage = '';
                                    }
                                    return ngModel;
                                };
                            }
                            break;
                        }
                        case 'Number':
                            defaultOrBindedValue = item.DefaultValue ? parseFloat(item.DefaultValue) : '';
                            item.formData.value = item.ItemValue ? parseFloat(item.ItemValue) : defaultOrBindedValue;
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            item.formData.IsHighLimitVisible = highLimit.IsVisible;
                            item.formData.IsLowLimitVisible = lowLimit.IsVisible;
                            item.formData.lowLimit = itemFormDataLowLimit;
                            item.formData.highLimit = itemFormDataHighLimit;
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    var checkDigit = true;
                                    var val = value.toString().split('.');
                                    if (val.length === 2 && val[0].length + val[1].length > max_supported_digit) {
                                        item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                        checkDigit = false;
                                    }
                                    else if (val[0].length > max_supported_digit) {
                                        item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                        checkDigit = false;
                                    }
                                    if (checkDigit) {
                                        svc.validateNumber(value, item, false);
                                    }
                                }
                            };
                            item.formData.Uom = item.UoM === undefined ? item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Value : item.UoM;
                            item.formData.UomBinding = item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Binding;
                            break;
                        case 'Integer':
                            defaultOrBindedValue = item.DefaultValue && !isNaN(item.DefaultValue) ? item.DefaultValue : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? item.ItemValue : defaultOrBindedValue;
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            item.formData.IsHighLimitVisible = highLimit.IsVisible;
                            item.formData.IsLowLimitVisible = lowLimit.IsVisible;
                            item.formData.lowLimit = itemFormDataLowLimit;
                            item.formData.highLimit = itemFormDataHighLimit;
                            item.formData.lowAlertLimit = itemFormDataLowAlertLimit;
                            item.formData.highAlertLimit = itemFormDataHighAlertLimit;
                            item.formData.lowCautionLimit = itemFormDataLowCautionLimit;
                            item.formData.highCautionLimit = itemFormDataHighCautionLimit;
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    if (value !== "") {
                                        ngModel.$setValidity(ngModel.$$parentForm.$$parentForm.$name, true);
                                        item.formData.Validation.patternInfo = "";
                                        var checkDigit = true;
                                        if (value.length > max_supported_digit) {
                                            item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                            checkDigit = false;
                                        }
                                        if (checkDigit) {
                                            svc.validateNumber(value, item, true);
                                            isOutOfRange = svc.validateByType(value, { Id: 'BigInt' });
                                            if (!isOutOfRange) {
                                                item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.bigintRangeMessage');
                                            }
                                        }
                                    }
                                    else {
                                        item.formData.validationMessage = "";
                                    }
                                }
                            };
                            item.formData.Uom = item.UoM === undefined ? item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Value : item.UoM;
                            item.formData.UomBinding = item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Binding;
                            break;
                        case 'Decimal':
                            defaultOrBindedValue = item.DefaultValue && !isNaN(item.DefaultValue) ? item.DefaultValue : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ?
                                item.ItemValue : defaultOrBindedValue;
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            item.formData.IsHighLimitVisible = highLimit.IsVisible;
                            item.formData.IsLowLimitVisible = lowLimit.IsVisible;
                            item.formData.lowLimit = itemFormDataLowLimit;
                            item.formData.highLimit = itemFormDataHighLimit;
                            item.formData.lowAlertLimit = itemFormDataLowAlertLimit;
                            item.formData.highAlertLimit = itemFormDataHighAlertLimit;
                            item.formData.lowCautionLimit = itemFormDataLowCautionLimit;
                            item.formData.highCautionLimit = itemFormDataHighCautionLimit;
                            item.formData.format = item.Data.Format;
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    if (value !== "") {
                                        var val = value.toString().split('.');
                                        var checkDigit = true;
                                        if (item.Data.Format && item.Data.Format < max_supported_digit) {
                                            if (val.length === 2) {
                                                var digitAfterDecimal = (val[1].length > item.Data.Format) ? item.Data.Format : val[1].length;
                                                if (val[0].length > (max_supported_digit - digitAfterDecimal)) {
                                                    item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                                    checkDigit = false;
                                                }
                                            }
                                            else if (val[0].length > max_supported_digit) {
                                                item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                                checkDigit = false;
                                            }
                                        }
                                        else {
                                            if (val.length === 2 && val[0].length + val[1].length > max_supported_digit) {
                                                item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                                checkDigit = false;
                                            }
                                            else if (val[0].length > max_supported_digit) {
                                                item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.supportedDigit');
                                                checkDigit = false;
                                            }
                                        }
                                        if (checkDigit) {
                                            svc.validateNumber(value, item, true);
                                            isOutOfRange = svc.validateByType(value, { Id: 'Decimal' });
                                            if (!isOutOfRange) {
                                                item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.decimalRangeMessage');
                                            }
                                        }
                                    }
                                    else {
                                        item.formData.validationMessage = "";
                                    }
                                }
                            };
                            item.formData.originalValue = item.ItemValue;
                            if (item.Data.Format > 0) {
                                item.formData.value = svc.formatDecimalValue(item.formData.value, item.Data.Format);
                                item.formData.lowLimit = svc.formatDecimalValue(item.formData.lowLimit, item.Data.Format);
                                item.formData.highLimit = svc.formatDecimalValue(item.formData.highLimit, item.Data.Format);
                                item.formData.lowAlertLimit = svc.formatDecimalValue(item.formData.lowAlertLimit, item.Data.Format);
                                item.formData.highAlertLimit = svc.formatDecimalValue(item.formData.highAlertLimit, item.Data.Format);
                                item.formData.lowCautionLimit = svc.formatDecimalValue(item.formData.lowCautionLimit, item.Data.Format);
                                item.formData.highCautionLimit = svc.formatDecimalValue(item.formData.highCautionLimit, item.Data.Format);
                                item.formData.Target = svc.formatDecimalValue(item.formData.Target, item.Data.Format);
                            }
                            item.formData.Uom = item.UoM === undefined ? item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Value : item.UoM;
                            item.formData.UomBinding = item.Data.Annotations.filter(function (a) { return a.Name === 'Uom'; })[0].Binding;
                            break;
                        case 'Multiline':
                            defaultOrBindedValue = item.DefaultValue ? item.DefaultValue : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? item.ItemValue : defaultOrBindedValue;
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            item.formData.Size = item.Data.Limits.filter(function (a) { return a.Name === 'Size'; })[0].Value.toLowerCase();
                            item.formData.Validation = {
                                required: item.IsRequired,
                                maxlength: item.Length
                            };
                            if (item.Format) {
                                item.formData.Validation.custom = function (value, ngModel) {
                                    var re = new RegExp(item.Format);
                                    if (value) {
                                        re.test(value) ? item.formData.validationMessage = '' : item.formData.validationMessage = svc.$translate.instant('instanceViewer.dataCollection.formatMismatch');
                                    }
                                    else {
                                        item.formData.validationMessage = '';
                                    }
                                    return ngModel;
                                };
                            }
                            break;
                        case 'Checkbox':
                            if (typeof item.DefaultValue === 'string') {
                                switch (item.DefaultValue.toLowerCase()) {
                                    case 'true':
                                        defaultOrBindedValue = true;
                                        break;
                                    case 'false':
                                        defaultOrBindedValue = false;
                                        break;
                                    default:
                                        defaultOrBindedValue = 'null';
                                }
                            }
                            else {
                                defaultOrBindedValue = 'null';
                            }
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            var checkBoxValue = item.Data.Annotations.filter(function (a) { return a.Name === 'CheckBoxValue'; })[0];
                            if (typeof item.ItemValue === 'string') {
                                switch (item.ItemValue.toLowerCase()) {
                                    case 'true':
                                        item.formData.value = [{
                                                label: checkBoxValue ? checkBoxValue.Value : '',
                                                checked: true
                                            }];
                                        break;
                                    case 'false':
                                        item.formData.value = [{
                                                label: checkBoxValue ? checkBoxValue.Value : '',
                                                checked: false
                                            }];
                                        break;
                                    default:
                                        item.formData.value = [{
                                                label: checkBoxValue ? checkBoxValue.Value : '',
                                                checked: "null"
                                            }];
                                }
                            }
                            else {
                                item.formData.value = [{
                                        label: checkBoxValue ? checkBoxValue.Value : '',
                                        checked: defaultOrBindedValue
                                    }];
                            }
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    svc.validateTarget(value, item);
                                }
                            };
                            break;
                        case 'Dropdown':
                            item.formData.options = [];
                            item.formData.validation = {
                                required: item.IsRequired
                            };
                            item.Data.Items.forEach(function (option, index) {
                                item.formData.options[index] = {
                                    label: option.label,
                                    value: option.value
                                };
                            });
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            if (item.DefaultValue && _.findIndex(item.formData.options, { value: item.DefaultValue }) === -1) {
                                item.formData.options.push({ label: item.DefaultValue, value: item.DefaultValue });
                            }
                            defaultOrBindedValue = item.DefaultValue ? _.findWhere(item.formData.options, { value: item.DefaultValue }) : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? _.findWhere(item.formData.options, { value: item.ItemValue }) : defaultOrBindedValue;
                            break;
                        case 'MultipleChoice':
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? item.ItemValue : '';
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            item.formData.options = [];
                            item.Data.Items.forEach(function (option, index) {
                                item.formData.options[index] = {
                                    label: option,
                                    value: option
                                };
                            });
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    svc.validateTarget(value, item);
                                }
                            };
                            if (item.DefaultValue && _.findIndex(item.formData.options, { value: item.DefaultValue }) === -1) {
                                item.formData.options.push({ label: item.DefaultValue, value: item.DefaultValue });
                            }
                            defaultOrBindedValue = item.DefaultValue ? item.DefaultValue : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? item.ItemValue : defaultOrBindedValue;
                            break;
                        case 'Datetime':
                            target = item.Data.Limits.filter(function (a) { return a.Name === 'Target'; })[0];
                            highLimit = item.Data.Limits.filter(function (a) { return a.Name === 'HighLimit'; })[0];
                            lowLimit = item.Data.Limits.filter(function (a) { return a.Name === 'LowLimit'; })[0];
                            item.formData.Target = itemFormDataTarget;
                            item.formData.IsTargetVisible = target.IsVisible;
                            item.formData.IsHighLimitVisible = highLimit.IsVisible;
                            item.formData.IsLowLimitVisible = lowLimit.IsVisible;
                            item.formData.lowLimit = itemFormDataLowLimit;
                            item.formData.highLimit = itemFormDataHighLimit;
                            item.formData.Validation = {
                                required: item.IsRequired,
                                custom: function (value, ngModel) {
                                    svc.validateDatetime(value, item);
                                }
                            };
                            defaultOrBindedValue = item.DefaultValue ? new Date(item.DefaultValue) : '';
                            item.formData.value = item.ItemValue === "" || item.ItemValue ? new Date(item.ItemValue) : defaultOrBindedValue;
                            item.formData.Placeholder = item.Data.Annotations.filter(function (a) { return a.Name === 'Placeholder'; })[0].Value;
                            item.formData.format = item.Format;
                            break;
                    }
                    return item;
                });
            };
            WorkInstructionInstanceViewerService.prototype.formatDecimalValue = function (value, format) {
                if (!format || !value) {
                    return value;
                }
                else {
                    var val = value.toString().split('.');
                    if (val.length === 2 && format !== '' && val[1].length > format) {
                        val[1] = val[1].substring(0, format);
                        value = val.join('.');
                    }
                    return value;
                }
            };
            WorkInstructionInstanceViewerService.prototype.validateNumber = function (value, item, applyCulture) {
                if (value && item) {
                    value = parseFloat(value);
                    var lowLimit = parseFloat(item.formData.lowLimit);
                    var highLimit = parseFloat(item.formData.highLimit);
                    var lowAlertLimit = parseFloat(item.formData.lowAlertLimit);
                    var highAlertLimit = parseFloat(item.formData.highAlertLimit);
                    var lowCautionLimit = parseFloat(item.formData.lowCautionLimit);
                    var highCautionLimit = parseFloat(item.formData.highCautionLimit);
                    if (!isNaN(lowLimit) && value < lowLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.lowLimitMessage', {
                            lowLimit: applyCulture ? this.getLocaleString(item.formData.lowLimit) : item.formData.lowLimit
                        });
                    }
                    else if (!isNaN(lowAlertLimit) && value < lowAlertLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.lowAlertLimitMessage', {
                            lowAlertLimit: applyCulture ? this.getLocaleString(item.formData.lowAlertLimit) : item.formData.lowAlertLimit
                        });
                    }
                    else if (!isNaN(lowCautionLimit) && value < lowCautionLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.lowCautionLimitMessage', {
                            lowCautionLimit: applyCulture ? this.getLocaleString(item.formData.lowCautionLimit) : item.formData.lowCautionLimit
                        });
                    }
                    else if (!isNaN(highCautionLimit) && value > highCautionLimit && value <= highAlertLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.highCautionLimitMessage', {
                            highCautionLimit: applyCulture ? this.getLocaleString(item.formData.highCautionLimit) : item.formData.higCautionhLimit
                        });
                    }
                    else if (!isNaN(highAlertLimit) && value > highAlertLimit && value <= highLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.highAlertLimitMessage', {
                            highAlertLimit: applyCulture ? this.getLocaleString(item.formData.highAlertLimit) : item.formData.higAlerthLimit
                        });
                    }
                    else if (!isNaN(highLimit) && value > highLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.highLimitMessage', {
                            highLimit: applyCulture ? this.getLocaleString(item.formData.highLimit) : item.formData.highLimit
                        });
                    }
                    else {
                        item.formData.validationMessage = '';
                    }
                }
                else {
                    item.formData.validationMessage = "";
                }
            };
            WorkInstructionInstanceViewerService.prototype.getLocaleString = function (value) {
                if (typeof value === 'string') {
                    value = Number(value);
                }
                var culture = this.globalizationService.getLocale();
                var tempValue = value.toString().split('.');
                if (tempValue.length === 2) {
                    var digits = Math.min(20, tempValue[1].length);
                    return value.toLocaleString(culture, { minimumFractionDigits: digits, maximumFractionDigits: digits });
                }
                else {
                    return value.toLocaleString(culture);
                }
            };
            WorkInstructionInstanceViewerService.prototype.validateByType = function (val, selectedType) {
                var value;
                var result = {
                    isValid: true
                };
                if (val && selectedType) {
                    var parameterType = selectedType.Id;
                }
                switch (parameterType) {
                    case 'BigInt':
                        result.isValid = !isNaN(val);
                        value = parseFloat(val);
                        if (result.isValid && (value < this.rangeObject.minBigInt || value > this.rangeObject.maxBigInt)) {
                            result.isValid = false;
                        }
                        break;
                    case 'Decimal':
                        result.isValid = $.isNumeric(val);
                        value = parseFloat(val);
                        if (result.isValid && (value < this.rangeObject.minDecimalValue || value > this.rangeObject.maxDecimalValue)) {
                            result.isValid = false;
                        }
                        break;
                }
                return result.isValid;
            };
            WorkInstructionInstanceViewerService.prototype.validateDatetime = function (value, item) {
                if (value && item) {
                    value = Date.parse(value);
                    var lowLimit = item.formData.lowLimit ? Date.parse(item.formData.lowLimit) : '';
                    var highLimit = item.formData.highLimit ? Date.parse(item.formData.highLimit) : '';
                    var lowDate = item.formData.lowLimit ? this.$filter('date')(new Date(item.formData.lowLimit), item.formData.format) : '';
                    var highDate = item.formData.highLimit ? this.$filter('date')(new Date(item.formData.highLimit), item.formData.format) : '';
                    if (lowLimit && highLimit && (value < lowLimit || value > highLimit)) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.rangeMessage', { lowLimit: lowDate, highLimit: highDate });
                    }
                    else if (lowLimit && value < lowLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.lowLimitMessage', { lowLimit: lowDate });
                    }
                    else if (highLimit && value > highLimit) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.highLimitMessage', { highLimit: highDate });
                    }
                    else {
                        item.formData.validationMessage = '';
                    }
                }
                else {
                    item.formData.validationMessage = "";
                }
            };
            WorkInstructionInstanceViewerService.prototype.validateTarget = function (value, item) {
                if (item.formData.Target && value.toString() && item) {
                    var target = item.UIControl == 'Checkbox' ? item.formData.Target.toLowerCase() : item.formData.Target;
                    if (value.toString() !== target) {
                        item.formData.validationMessage = this.$translate.instant('instanceViewer.dataCollection.targetMessage');
                    }
                    else {
                        item.formData.validationMessage = '';
                    }
                }
                else {
                    item.formData.validationMessage = '';
                }
            };
            WorkInstructionInstanceViewerService.prototype.getReadOnlyMode = function (sections) {
                sections.forEach(function (section) {
                    section.Steps.forEach(function (step) {
                        step.isDisabled = true;
                    });
                });
                return sections;
            };
            WorkInstructionInstanceViewerService.prototype.findFirstSectionStepOpen = function (sections, isSectionSingle) {
                var firstSectionOpenIndex = _.findIndex(sections, function (section) {
                    return section.isOpen === true;
                });
                for (var i = firstSectionOpenIndex + 1; i < sections.length; i++) {
                    sections[i].isOpen = false;
                    for (var j = 0; j < sections[i].Steps.length; j++) {
                        sections[i].Steps[j].isOpen = false;
                        sections[i].Steps[j].isDisabled = true;
                    }
                }
                var firstStepOpenIndex = _.findIndex(sections[firstSectionOpenIndex].Steps, function (step) {
                    return step.isOpen === true;
                });
                for (var k = firstStepOpenIndex + 1; k < sections[firstSectionOpenIndex].Steps.length; k++) {
                    sections[firstSectionOpenIndex].Steps[k].isOpen = false;
                    sections[firstSectionOpenIndex].Steps[k].isDisabled = true;
                }
                sections[firstSectionOpenIndex].currentPage = firstStepOpenIndex + 1;
            };
            WorkInstructionInstanceViewerService.$inject = [
                '$q',
                '$sce',
                'common.services.runtime.backendService',
                '$translate',
                '$filter',
                'common.services.globalization.globalizationService',
                'common.base'
            ];
            return WorkInstructionInstanceViewerService;
        }());
        framework.WorkInstructionInstanceViewerService = WorkInstructionInstanceViewerService;
        angular.module('siemens.simaticit.common.widgets.workInstructionInstanceViewer')
            .service('common.widgets.workInstructionInstanceViewer.service', WorkInstructionInstanceViewerService);
    })(framework = sit.framework || (sit.framework = {}));
})(sit || (sit = {}));
//# sourceMappingURL=sit-work-instruction-instance-viewer-svc.js.map