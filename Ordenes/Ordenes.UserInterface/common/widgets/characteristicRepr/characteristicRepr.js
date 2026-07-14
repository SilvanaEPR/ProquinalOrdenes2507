/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.widgets.characteristicRepr
     * @description
     * This module provides functionalities related to Caracteristic Represenation (Quality Execution).
     */
    angular.module('siemens.simaticit.common.widgets.characteristicRepr', []);

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.characteristicRepr')
        .directive('characteristicRepr', characteristicRep)
        .filter('removeSpaces', [function () {
            return function (string) {
                if (!angular.isString(string)) {
                    return string;
                }
                return string.replace(/[\s]/g, '');
            };
        }]);

    characteristicRepController.$inject = ['$window',
        '$rootScope',
        '$scope',
        '$translate',
        'common',
        'common.services.runtime.backendService',
        'siemens.simaticit.common.characteristicReprService',
        '$q',
        '$timeout',
        'common.services.signalManager',
        'common.services.logger.service'
    ];
    /**
   * @ngdoc directive
   * @name characteristicRepr
   * @module siemens.simaticit.common.widgets.characteristicRepr
   * @description
   * Displays a characteristic representation container in a Quality Execution runtime scenerio.
   * It is not intended to be used "as is".
   *
   * @usage
   * As an element:
   * ```
   *     <characteristic-repr cr-id="myid" container-id="000-0000-00000" context="{{vm.Context}}" mtu="mymtu" hide-single-element-list="true"></characteristic-repr>
   * ```
   * @restrict E
   *
   * @param {Object[]} context {EquipmentNId: "myequipment",MaterialNId: "mymaterial", MaterialRevision: 1 }. All the members in the
   * Context object signature are mandatory.
   * @param {string} [cr-id] _(Optional)_ a string to set an Id for directive elements.
   * @param {string} [container-id] A GUID referring to the Runtime Characteristic Represtation Container.
   * @param {string} [mtu] the MTU Id
   * @param {string} [hideSingleElementList] _(Optional)_ A boolean flag providing OOTB functionality to hide the ICV list if there is only one Characteristic Representation.
   * @param {string} [genericChars=false] _(Optional)_ A boolean flag providing OOTB functionality to show/ hide the Generic characteristic Details in the Details pane of the Characteristic Representation.
   * @param {string} [contextChars=false] _(Optional)_ A boolean flag providing OOTB functionality to show/ hide the Context characteristic Details in the Details pane of the Characteristic Representation.
   * @param {string} [hideDetails=false] _(Optional)_ A boolean flag providing OOTB functionality to show/ hide characteristic Details in the Details pane of the Characteristic Representation.
   * @param {string} [inspectionOrderDetailsNeeded=false] _(Optional)_ A boolean flag providing OOTB functionality to use Inspection Order and Inspection Order operation details in Time based engine indicator query.
   * By default, it is set to false.
   * @param {number} [stepValue] _(Optional)_ A number to set the step value for the variable characteristic input.
   */
    function characteristicRep() {
        return {
            restrict: 'E',
            replace: true,
            controller: characteristicRepController,
            controllerAs: 'vm',
            templateUrl: 'common/widgets/characteristicRepr/characteristic-repr-dir.html',
            bindToController: {
                crId: '@',
                containerId: '@',
                context: '@',
                mtu: '@',
                notifyViolations:'@',
                hideSingleElementList: '@',
                genericChars: '@',
                contextChars: '@',
                hideDetails: '@',
                onSelectionChanged: '&',
                stepValue: '@',
                inspectionOrderDetailsNeeded: '@'
            },
            scope: {}
        };
    }

    function FailureReference() {
        this.Id= "";
        this.AId= "";
        this.IsFrozen= false;
        this.ConcurrencyVersion= 0;
        this.IsDeleted= 0;
        this.CreatedOn= Date.now();
        this.LastUpdatedOn= Date.now();
        this.EntityType= "Siemens.SimaticIT.MasterData.CHR_MS.MSModel.DataModel.FailureReference";
        this.OptimisticVersion= "";
        this.ConcurrencyToken= null;
        this.IsLocked= false;
        this.ToBeCleaned = false;
    }

    function characteristicRepController($window,
        $rootScope,
        $scope,
        $translate,
        common,
        backendService,
        characteristicRepService,
        $q,
        $timeout,
        signalService,
        loggerService)
    {
        var vm = this;
        vm.scenarioInstance = { ScenarioInstanceId: null };
        var globalDialogService = common.globalDialog;
        var logger, timerConnection;
        var INPUT_VARIABLE_STEP = 0.01;
        vm.isloaded = false;
        vm.isenabled = false;
        vm.hideICV = false;
        vm.viewerData = [];
        vm.Representation = {};
        vm.InspectionContext = {};
        vm.IsSignButtonVisible = false;
        vm.IsVisual = false;
        vm.IsAttributive = false;
        vm.IsVariable = false;
        vm.HasValue = false;
        vm.HasImage = false;
        vm.Quantity = null;
        vm.HasFailure = false;
        vm.HasAttribute = null;
        vm.ImageWidth = 0;
        vm.ImageHeight = 0;
        vm.ImageId = "_tmp_image_"+$scope.$id;
        vm.ImageSrc = "";
        vm.editable = false;
        vm.DisplayInfoBadge = false;
        vm.IsAddSampleBtnVisible = false;
        vm.IsNoFailureIconVisible = false;
        vm.SaveSample = saveSample;
        vm.FailureNId = null;
        vm.isSemiAutomatic = false;
        vm.ValueChanged = valueChanged;
        vm.SaveVisualSample = saveVisualSample;
        vm.CreateSample = createSample;
        vm.ConfirmSample = confirmSample;
        vm.showConfirmSample = false;
        vm.isQualityInspectionSelected = false;
        vm.SetTooltipPosition = setTooltipPosition;
        vm.onImageUploadRegisterApi = {};
        vm.FailuresToBeUpdated = [];
        vm.FNIdColorsAssociations = [];
        vm.propertyGridId = "pgrid_"+$scope.$id;
        vm.defaultColor = "#ddffdd";
        vm.canvasHeight = 480;
        vm.canvasWidth = 640;
        vm.stepValue = vm.stepValue ? vm.stepValue : INPUT_VARIABLE_STEP;
        vm.isGenericCharDetails = vm.genericChars ? JSON.parse(vm.genericChars) : false;
        vm.isContextCharDetails = vm.contextChars ? JSON.parse(vm.contextChars) : false;
        vm.UpperTolerance = $translate.instant('characteristicRepr.UpperTolerance');
        vm.NominalValue = $translate.instant('characteristicRepr.NominalValue');
        vm.LowerTolerance = $translate.instant('characteristicRepr.LowerTolerance');
        vm.FailuresOptions = {
            "sit-options": [],
            "sit-to-display": "label",
            "sit-to-keep": "color"
        };
        vm.FailuresLegenda = [];
        vm.Colors = [
            "#B44B28",
            "#78cdcd",
            "#DC0000",
            "#730900",
            "#0F789B",
            "#FBEEED",
            "#EDFBF5",
            "#5A5A5A",
            "#DC6914",
            "#E3700F",
            "#FFCD50",
            "#FFF7CD",
            "#003750",
            "#411432",
            "#ebaba7",
            "#bec32b"
        ];
        vm.onButtonClick = onButtonClick;
        vm.dialogTitle = $translate.instant('characteristicRepr.popupTitle');
        vm.templateUri = 'common/widgets/characteristicRepr/browse-failures-template.html';
        vm.addIcon = {
            path: "common/icons/cmdAdd16.svg",
            size: "16"
        };
        vm.attachmentIcon = {
            path: "common/icons/cmdFileText24.svg",
            size: "16"
        };
        vm.deleteIcon ={
            path: "common/icons/cmdDelete24.svg",
            size: "16"
        };
        vm.changesIcon ={
            path: "common/icons/indicatorContainsChange16.svg",
            size: "16"
        };
        vm.sampleIcon = {
            path: "common/icons/cmdSquareCheck24.svg",
            size: "16"
        };
        vm.noFailureIcon = {
            path: "common/icons/cmdSquare24.svg",
            size: "16"
        };

        vm.chosenFailure = {};
        vm.propertyGridData = [];
        vm.onPreview = false;

        vm.inspectionOrder = "";
        vm.inspectionOrderOperation = "";
        vm.recurringTimerEngineExpiration = "";

        $scope.$watch('vm.containerId', function (newVal, oldVal) {
            getViewerData();
        });

        vm.dialogApi = {};

        function removeSpaces(string) {
            if (!angular.isString(string)) {
                return string;
            }
            return string.replace(/[\s]/g, '');
        }

        vm.dialogTemplateData = {
            alreadyAssigned: [],
            hasSelection: false,
            selectedItem: {},
            dialogWidth: ($window.innerWidth - 200)+"px",
            dialogHeight: ($window.innerHeight - 300)+"px"
        };

        vm.buttonsList = [
            { id: "okButton", displayName: $translate.instant('common.ok'), disabled: !vm.dialogTemplateData.hasSelection, onClickCallback: function () { vm.addFailure(); } },
            { id: "cancelButton", displayName: $translate.instant('common.cancel'), disabled: false, onClickCallback: cancelButton }
        ];

        function cancelButton() {
            globalDialogService.hide();
            vm.chosenFailure = null;
        }

        $rootScope.$on('OnCloseSignatures', function (event, data) {
            if(data.Status === "Approved")
            {
                if(vm.scenarioInstance && vm.scenarioInstance.ScenarioInstanceId && data.Id){
                    checkForConfirSampleBtnVisibility(null, [], true);
                }
            }
        });

        $rootScope.$on('failuresModal.selection', function (event, hasselection) {
            vm.buttonsList[0].disabled = !hasselection;
        });
        // "mode" meaning:
        //  1 - Browse unassigned failures
        //  2 - Browse assigned failures
        //  3 - Just show attachment
        function onButtonClick(mode, failurenid) {
            if (vm.Representation.CharacteristicSpecification.FailureReferences) {
                vm.dialogTemplateData.alreadyAssigned = angular.copy(vm.Representation.CharacteristicSpecification.FailureReferences)
            }
            vm.dialogTemplateData.showMode = mode;
            vm.dialogTemplateData.dialogWidth = ($window.innerWidth - 200) + "px";
            vm.dialogTemplateData.dialogHeight = ($window.innerHeight - 300) + "px";
            if (mode === 2) {
                vm.dialogTemplateData.alreadyAssigned = [_.find(vm.dialogTemplateData.alreadyAssigned, function (ass) {
                    return ass.Failure.NId === failurenid
                })];
                vm.dialogTemplateData.dialogWidth = ($window.innerWidth / 2) + "px";
                vm.buttonsList[0].disabled = false;
            }
            var dialogData = {
                title: (mode === 2) ? $translate.instant('characteristicRepr.showAttachments'): $translate.instant('characteristicRepr.popupTitle'),
                templatedata: vm.dialogTemplateData,
                templateuri: 'common/widgets/characteristicRepr/browse-failures-template.html',
                buttons: vm.buttonsList,
                showClose:false
            }
            globalDialogService.set(dialogData);
            globalDialogService.show();
        }

        function createSample() {

            var visualValue = {
                InspectionAcquisitionContextId: vm.InspectionContext.Id,
                MTUNId: vm.mtu,
                FailureNId: "NoFailure",
                Count: 0,
                Coords: "[]"
            }
            //characteristicRepService.CreateSample({
            //    "InspectionAcquisitionContextId": vm.InspectionContext.Id,
            //    MTUNId: vm.mtu
            //})
            characteristicRepService.CreateVisualDetectedFailurewithES(visualValue).then(function (vue) {
                logger.logInfo($translate.instant("characteristicRepr.createSample"));
                getInspectionContext();
            }, backendService.error);
        }

        function confirmSample() {

            if(!vm.ActualValue ){
                loggerService.logError('vm.ActualValue is null or undefined!');
                return;
            }

            var InspectionId = vm.ActualValue.Id;
            var InspectionValue = {
                InspectionSampleId: InspectionId
            };

            characteristicRepService.ConfirmInspectionSample(InspectionValue).then(function (data) {
                if (data && data.succeeded) {
                    logger.logInfo($translate.instant("characteristicRepr.ConfirmInspectionSample"));
                    vm.ActualValue = null;
                    vm.Quantity = null;
                    vm.HasAttribute = null;
                    vm.showConfirmSample = false;
                    vm.HasFailure = false;
                    vm.chosenFailure = null;
                    vm.FailureNId = null;
                    vm.FailuresToBeUpdated = [];
                    for (var index = 0; index <  vm.FailuresLegenda.length; index++) {
                        vm.FailuresLegenda[index].count = 0;
                    }
                    vm.editable = false;
                    if (vm.imageUploadApi) {
                        vm.imageUploadApi.cleanpoints();
                        vm.imageUploadApi.drawImage();
                    }
                    setScenarioInstance(null);
                    getInspectionContext();
                }
            }, backendService.error);
        }

        vm.signalConnections = {};

        function initSignalConnection() {
            signalService.createConnection('WorkInstruction', 'InspectionExecutionChrReprRuntimeNumberChanged', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm.signalConnections['InspectionExecutionChrReprRuntimeNumberChanged'] = signalConnection;
                    loggerService.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToInspectionExecutionEvent();
                } else {
                    loggerService.log('Wrong signal');
                }
            }, function (error) {
                loggerService.log('Error in opening a connection \n' + angular.toJson(error, true));
            });

            signalService.createConnection('WorkInstruction', 'UpdateContainerUISignal', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm.signalConnections['UpdateContainerUI'] = signalConnection;
                    loggerService.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToContainerEvent();
                } else {
                    loggerService.log('Wrong signal');
                }
            }, function (error) {
                loggerService.log('Error in opening a connection \n' + angular.toJson(error, true));
            });

            signalService.createConnection('WorkInstruction', 'TimeBasedExecutionStatusChanged', connectionErrorCallback).then(function (signalConnection) {
                if (signalConnection.signalManager.isOpen) {
                    vm.signalConnections['TimeBasedExecutionStatusChanged'] = signalConnection;
                    loggerService.log('Connection has been established successfully. Connection State: ' + signalConnection.state());
                    subscribeToTimeBasedEvent();
                } else {
                    loggerService.log('Wrong signal');
                }
            }, function (error) {
                loggerService.log('Error in opening a connection \n' + angular.toJson(error, true));
            });

        }

        function subscribeToInspectionExecutionEvent() {
            vm.signalConnections["InspectionExecutionChrReprRuntimeNumberChanged"].subscribe("", onInspectionExecutionEvt, onError, onComplete).then(function (data) {
                loggerService.log("subscribe callback");
            }, function (error) {
                loggerService.log("subscribe error");
            });
        }

        function subscribeToContainerEvent() {
            vm.signalConnections["UpdateContainerUI"].subscribe("EnvelopeUserField1 eq '" + vm.containerId + "'",
                onContainerEvt, onError, onComplete).then(function (data) {
                    loggerService.log("subscribe callback");
                }, function (error) {
                    loggerService.log("subscribe error");
                });
        }

        function subscribeToTimeBasedEvent() {
            vm.signalConnections["TimeBasedExecutionStatusChanged"].subscribe("", getIndicatorsData, onError, onComplete)
                .then(function (data) {
                    loggerService.log("subscribe callback");
                }, function (error) {
                    loggerService.log("subscribe error");
                });
        }

        function onInspectionExecutionEvt(signal) {
            if (signal.InspectionExecutionCriteriaNId === "Default") {
                vm.viewerData.forEach(function (data) {
                    if (data.ChrReprNId === signal.CharacteristicRepresentationNId) {
                        data.NumberOfInspections = signal.CharacteristicRepresentationRuntimeNumber;
                        return;
                    }
                })
                vm.viewerOptions.refresh();
                $rootScope.$broadcast('grid.refreshList');
            }
            else if (signal.InspectionExecutionCriteriaNId === "Serial" && signal.RuntimeChrRepresentationContainerId === vm.containerId) {
                characteristicRepService.GetRuntimeCharacteristicNId(vm.containerId).then(function (data) {
                    vm.RuntimeCharacteristicNId = data.value[0].NId;
                    characteristicRepService.GetNumberofInspectionsForSerial(vm.mtu, vm.RuntimeCharacteristicNId).then(function (inspectionData) {
                        vm.InspectionDataSerial = inspectionData.value;
                        var inspectData = vm.InspectionDataSerial.find(function (item) {
                            if (item.Containers.length != 0) {
                                return true;
                            }
                        });
                        vm.viewerData.forEach(function (data) {
                            if (data.ChrReprNId === signal.CharacteristicRepresentationNId) {
                                data.NumberOfInspections = inspectData.NumberOfInspections;
                                return;
                            }
                        })
                        vm.viewerOptions.refresh();
                        $rootScope.$broadcast('grid.refreshList');
                    }, backendService.error)
                }, backendService.error)
            }
        }

        function onContainerEvt(signal) {
            if (signal.RuntimeCharacteristicRepresentationContainerId !== vm.containerId) {
                // Not current instance
                return;
            }

            var runtimeChrSpecIndex = -1;
            for (var i = 0; i < vm.viewerData.length; i++) {
                if (vm.viewerData[i].NId === signal.RuntimeCharacteristicRepresentationNId) {
                    runtimeChrSpecIndex = i;
                    break;
                }
            }
            var runtimeChrSpec = vm.viewerData[runtimeChrSpecIndex];

            if (runtimeChrSpec) {
                updateNumberOfInspections();
                runtimeChrSpec.MandatoryExecutionsCompleted = signal.MandatoryExecutionsCompleted;
            }

            vm.viewerOptions.refresh();
        }

        var counter = [];
        function connectionErrorCallback(conn, reason) {

            loggerService.log("Connection Error Callback: " + conn.name + "Reason:" + reason.reason);
            if (counter[conn.name] > 10) {
                return;
            }

            conn.reconnect().then(function () {
                counter[conn.name] = 0;
            }, function (err) {
                if (counter[conn.name] === undefined) {
                    counter[conn.name] = 0;
                } else {
                    counter[conn.name] = counter[conn.name] + 1;
                }
                loggerService.log("attempt number " + counter[conn.name] + " name: " + conn.name);
                if (counter[conn.name] > 10) {
                    return;
                }
                timerConnection = $timeout(function () {
                    connectionErrorCallback(conn, reason);
                }, 5000, false);
            });
        }

        function onError(error) {
            loggerService.log("An error occurred: \n" + angular.toJson(error, true));
        }

        function onComplete() {
            loggerService.log("Signal stopped sending messages.");
        }

        function destroySignalServiceConnections() {
            angular.forEach(vm.signalConnections, function (value, key) {
                signalService.destroyConnection(vm.signalConnections[key].id).then(function () {
                    vm.signalConnections[key] = undefined;
                    loggerService.log("Closed Connection " + key);
                }, function (error) {
                    loggerService.log("Error in Closing Connection \n" + angular.toJson(error, true));
                });
            });
        }

        vm.removeFailure = function () {
            var InspectionId = vm.ActualValue.InspectionValues[0].Id;
            vm.HasFailure = false;
            var InspectionValue = {
                Id: InspectionId
            };

            characteristicRepService.RemoveFailureToInspectionValue(InspectionValue).then(function (data) {
                if (data && data.succeeded) {
                    logger.logInfo($translate.instant("characteristicRepr.failuredisassociated"));
                    vm.HasFailure = false;
                    vm.FailureNId = null;
                }
            }, backendService.error);
        }

        vm.addFailure = function () {
            if (vm.dialogTemplateData.showMode === 2) {
                globalDialogService.hide();
                return;
            }

            if (vm.dialogTemplateData.showMode === 1) {
                if (!vm.ActualValue) {
                    vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                }
                associateFailure();
            }

            var idx = vm.FNIdColorsAssociations.length;
            if (vm.dialogTemplateData.hasSelection) {
                var item = vm.dialogTemplateData.selectedItem;
                addOptions(idx, item, vm.dialogTemplateData.selectedItem.hasAttachments);
                addLegendaItem(idx, item);
                addColoroFailureAssociation(idx, item);
            }
            var failureReference = new FailureReference();
            failureReference.CharacteristicSpecification_Id = vm.Representation.CharacteristicSpecification.Id;
            failureReference.Failure_Id = vm.dialogTemplateData.selectedItem.Id;
            failureReference.Failure = vm.dialogTemplateData.selectedItem;
            characteristicRepService.getAttachments(failureReference.Failure_Id).then(function (data) {
                failureReference.Failure.Attachments = data.value[0].Attachments;
            });

            var found = _.find(vm.Representation.CharacteristicSpecification.FailureReferences, function (ref)
            {
                return ref.Failure_Id === failureReference.Failure_Id;
            });
            if (typeof found === "undefined") {
                vm.Representation.CharacteristicSpecification.FailureReferences.push(failureReference);
            }
            globalDialogService.hide();
            vm.chosenFailure = null;
            vm.editable = false;
        }

        vm.getAcquireCharacteristicValues = function () {
            characteristicRepService.AcquireCharacteristicValues(vm.runtimeCharSelectedId, vm.context.EquipmentNId, vm.context.MaterialNId, vm.context.MaterialRevision).then(function (data) {
                    if (data && data.succeeded) {
                        vm.editable = true;
                        vm.acquireData = data.data.CharacteristicRepresentationItems[0];

                        if (vm.IsAttributive) {
                            vm.HasAttribute = vm.acquireData.RuntimeCharValue === 'True' ? true : false;
                        } else if (vm.IsVariable) {
                            vm.Quantity = parseFloat(vm.acquireData.RuntimeCharValue);
                        }
                    }
                }, backendService.error).then(function () {
                    saveSample();
                });
        }

        function addColoroFailureAssociation(idx, item) {
            vm.FNIdColorsAssociations.push({
                "color": vm.Colors[idx],
                "NId": item.NId
            });
        }

        function addOptions(idx, item, hasattachment) {
            vm.FailuresOptions["sit-options"].push({
                "color": vm.Colors[idx],
                "label": item.NId,
                "hasAttachments": hasattachment
            });
        }

        function addLegendaItem(idx, item) {
            vm.FailuresLegenda.push({
                "color": vm.Colors[idx],
                "label": item.Name === null || item.Name === "" ? item.NId : item.Name,
                "description": item.Description,
                "count": 0
            });
        }

        function associateFailure() {
            var InspectionId = vm.ActualValue.InspectionValues[0].Id;
            var FailureNId = vm.dialogTemplateData.selectedItem.NId;
            var FailureId = vm.dialogTemplateData.selectedItem.Id;
            characteristicRepService.AssociateFailureToInspectionValue(InspectionId, FailureId).then(function(data) {
                logger.logInfo($translate.instant("characteristicRepr.failureassociated"));
                vm.HasFailure = true;
                vm.FailureNId = FailureNId;
            }, backendService.error);
        }

        function getSpecification() {
            vm.IsAttributive = false;
            vm.IsVariable = false;
            vm.HasValue = false;
            vm.HasImage = false;
            characteristicRepService.GetCharacteristicRepresentation(vm.Id).then(function (data) {
                vm.Representation = data.value[0];
                //Setting the Tolerance based on Material Limit or Specification 
                if (vm.Representation.CharacteristicSpecification.Type === "Variable") {
                    setToleranceValue();
                }
                getAttachments().then(function () {

                    vm.IsVisual = vm.Representation.CharacteristicSpecification.EntityType.indexOf('VisualCharacteristicSpecification') !== -1;
                    vm.IsAttributive = vm.Representation.CharacteristicSpecification.EntityType.indexOf('AttributiveCharacteristicSpecification') !== -1;
                    vm.IsVariable = vm.Representation.CharacteristicSpecification.EntityType.indexOf('VariableCharacteristicSpecification') !== -1;

                    if (vm.Representation.CharacteristicSpecification.Sketch_Id_Id != null) {
                        vm.HasImage = true;
                    }

                    getInspectionContext().then(getSketch);
                    generateGridData();
                    vm.propertyGridId = vm.Representation.Id;
                });

                vm.viewerData.forEach(function (val) {
                    vm.isSemiAutomatic = false;
                    if(val.ChrSpecUId === vm.Representation.CharacteristicSpecification.UId) {
                        vm.runtimeCharSelectedId = val.Id;
                        if(val.AcquisitionBehaviour === "SemiAutomatic") {
                            $timeout(function () {
                                vm.isSemiAutomatic = true;
                            }, 0);
                        }
                    }
                });

            }, backendService.error);
        }

        function setToleranceValue() {
            if (!vm.RuntimeData) return;
            //Find the correct runtime characteristic Represenation
            var runtimeRepresentation = vm.RuntimeData.find(function (item) {
                if (item.ChrReprNId === vm.Id) {
                    return item;
                }
            });

            // Handling the new logic in order to take tolerance value from runtime characteristic reference 
            if (runtimeRepresentation && runtimeRepresentation.NominalValue && (runtimeRepresentation.NominalValue.UoMNId == "" || runtimeRepresentation.NominalValue.UoMNId == null)) {
                // Go with the old logic
                if (vm.Representation && vm.Representation.CharacteristicSpecification && vm.Representation.CharacteristicSpecification.LowerTolerance &&
                    vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue == null) {
                    vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue = '--';
                }
                if (vm.Representation && vm.Representation.CharacteristicSpecification && vm.Representation.CharacteristicSpecification.UpperTolerance &&
                    vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue == null) {
                    vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue = '--';
                }
            } else {
                // Go with the new logic
                vm.Representation.CharacteristicSpecification.NominalValue.QuantityValue = runtimeRepresentation.NominalValue.QuantityValue;
                vm.Representation.CharacteristicSpecification.NominalValue.UoMNId = runtimeRepresentation.NominalValue.UoMNId;

                if (runtimeRepresentation.LowerTolerance && runtimeRepresentation.LowerTolerance.UoMNId == "") {
                    vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue = '--';
                    vm.Representation.CharacteristicSpecification.LowerTolerance.UoMNId = '';

                } else {
                    vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue = runtimeRepresentation.LowerTolerance.QuantityValue;
                    vm.Representation.CharacteristicSpecification.LowerTolerance.UoMNId = runtimeRepresentation.LowerTolerance.UoMNId;
                }


                if (runtimeRepresentation.UpperTolerance && runtimeRepresentation.UpperTolerance.UoMNId == "") {
                    vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue = '--';
                    vm.Representation.CharacteristicSpecification.UpperTolerance.UoMNId = '';
                } else {
                    vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue = runtimeRepresentation.UpperTolerance.QuantityValue;
                    vm.Representation.CharacteristicSpecification.UpperTolerance.UoMNId = runtimeRepresentation.UpperTolerance.UoMNId;
                }
            }
        }

        function setScenarioInstance(scenarioInstanceId, isSignaturePending) {
            if (vm.IsSignButtonVisible && vm.scenarioInstance.ScenarioInstanceId && !scenarioInstanceId) {
                vm.IsSignButtonVisible = false;
                $timeout(function () {
                    vm.IsSignButtonVisible = true;
                }, 0);
            }
            vm.scenarioInstance.ScenarioInstanceId = scenarioInstanceId;
            vm.IsSignaturePending = isSignaturePending;
        }

        function getScenarioInstance() {
            if (!vm.IsSignButtonVisible) {
                return;
            }
            characteristicRepService.GetScenarioInstanceBySampleId(vm.ActualValue.Id).then(function (result) {
                if (result && result.value.length > 0) {
                    vm.scenarioInstance.ScenarioInstanceId = result.value[0].ScenarioInstanceId;
                    vm.IsSignaturePending = result.value[0].IsSignaturePending;
                }
            }, backendService.error);

        }

        function getAttachments() {
            var defer = $q.defer();
            var promises = [];
            _.each(vm.Representation.CharacteristicSpecification.FailureReferences, function (fref) {
                promises.push(characteristicRepService.getAttachments(fref.Failure_Id));
            });
            $q.all(promises).then(function (data) {
                _.each(data, function (datum) {
                    var failure = datum.value[0];
                    if (failure === null) {
                        return;
                    }
                    _.each(vm.Representation.CharacteristicSpecification.FailureReferences, function (ref) {
                        if (ref.Failure_Id === failure.Id) {
                            ref.Failure.Attachments = failure.Attachments;
                        }
                    });
                });
                defer.resolve();
            });
            return defer.promise;
        }

        function registerEvents() {
            vm.onImageUploadRegisterApi = onImageUploadRegisterApi;
            vm.imageUploadApi = null;

            function onImageUploadRegisterApi(api) {
                vm.imageUploadApi = api;
            }
        }

        var imageOnLoad = function () {
            var reload = restorePoints();
            var sketchId = vm.ActualValue ? vm.ActualValue.Sketch_Id_Id : null;
            var rows = 0;
            var columns = 0;

            if (sketchId) {
                rows = vm.ActualValue.SketchRows;
                columns = vm.ActualValue.SketchColumns;
            } else {
                rows = vm.Representation.CharacteristicSpecification.SketchRows;
                columns = vm.Representation.CharacteristicSpecification.SketchColumns;
            }
            if (vm.imageUploadApi) {
                vm.imageUploadApi.redrawPoints(reload);
                vm.imageUploadApi.load(rows, columns);
                vm.imageUploadApi.addPointClickedListener(clickedPoint);
            }
        };

        function getSketch() {
            var imageId = null;

            if (!vm.IsVisual) {
                return;
            }

            var sketchId = vm.ActualValue ? vm.ActualValue.Sketch_Id_Id : null;

            if (sketchId) {
                imageId = sketchId;
            } else {
                imageId = vm.Representation.CharacteristicSpecification.Sketch_Id_Id;
            }

            if (null === imageId) {
                return;
            }

            characteristicRepService.GetSketch(imageId).then(function (data) {
                vm.HasImage = data.value.length > 0;
                if (vm.HasImage) {
                    var src = "data:" + data.value[0].ImageType + ";base64," + data.value[0].ImageUrl;
                    var img = new Image();
                    img.id = vm.ImageId;
                    img.src = src;
                    img.style["display"] = "none";
                    angular.element("#tmpImagePlaceholder")[0].appendChild(img);
                    img.onload = imageOnLoad;
                    vm.FailuresOptions["sit-options"] = [];
                    vm.FailuresLegenda = [];
                    vm.FNIdColorsAssociations = [];
                    _.each(vm.Representation.CharacteristicSpecification.FailureReferences,
                        function (item, index, list) {
                            var hasattachment = item.Failure.Attachments && item.Failure.Attachments.length > 0;
                            var idx = angular.copy(index);
                            if (idx >= vm.Colors.length) {
                                idx = 0;
                            }
                            addOptions(idx, item.Failure, hasattachment);
                            addLegendaItem(idx, item.Failure);
                            addColoroFailureAssociation(idx, item.Failure)
                        });

                }
            }, backendService.error);

        }
        function generateGridData() {

            vm.genericCharsData = [
                {
                    label: $translate.instant('characteristicRepr.Name'),
                    value: vm.Representation.Name
                },
                {
                    label: $translate.instant('characteristicRepr.charReprRevision'),
                    value: vm.ChrReprRevision
                },
                {
                    label: $translate.instant('characteristicRepr.NId'),
                    value: vm.Representation.CharacteristicSpecification.NId
                },
                {
                    label: $translate.instant('characteristicRepr.Revision'),
                    value: vm.Representation.CharacteristicSpecification.Revision
                },
                {
                    label: $translate.instant('characteristicRepr.Criticality'),
                    value: vm.Representation.CharacteristicSpecification.CriticalityNId
                },
                {
                    label: $translate.instant('characteristicRepr.SpecifictionName'),
                    value: vm.Representation.CharacteristicSpecification.Name
                },
                {
                    label: $translate.instant('characteristicRepr.SpecifictionDescription'),
                    value: vm.Representation.CharacteristicSpecification.Description
                }
            ];

            vm.contextCharsData = [
                {
                    label: $translate.instant('characteristicRepr.EquipmentNId'),
                    value: vm.context.EquipmentNId
                },
                {
                    label: $translate.instant('characteristicRepr.MTU'),
                    value: vm.mtu
                },
                {
                    label: $translate.instant('characteristicRepr.MaterialNId'),
                    value: vm.context.MaterialNId
                },
                {
                    label: $translate.instant('characteristicRepr.MaterialRevision'),
                    value: vm.context.MaterialRevision
                }
            ];

            if (vm.isGenericCharDetails && vm.isContextCharDetails) {
                vm.propertyGridData = vm.genericCharsData.concat(vm.contextCharsData);
            } else if (vm.isGenericCharDetails && !vm.isContextCharDetails) {
                vm.propertyGridData = vm.genericCharsData;
            } else if (!vm.isGenericCharDetails && vm.isContextCharDetails) {
                vm.propertyGridData = vm.contextCharsData;
            } else {
                vm.propertyGridData = [];
            }

            if (vm.onSelectionChanged) {
                vm.onSelectionChanged({ details: vm.genericCharsData.concat(vm.contextCharsData) });
            }
        }

        function getActualValues(samples) {
            var actualValue = null;
            angular.forEach(samples,
                function(value, key) {
                    var firstValue = !value.IsConfirmed && value.InspectionValues ? value.InspectionValues[0] : null;
                    if (firstValue) {
                        if ((firstValue.MTUNId === vm.mtu) || (firstValue.MTUNId === null && vm.mtu === "")) {
                            actualValue = value;
                        }
                    }
                    var firstFailure = !value.IsConfirmed && value.VisualDetectedFailures?value.VisualDetectedFailures[0] : null;
                    if (firstFailure) {
                        if (firstFailure.MTUNId === vm.mtu) {
                            actualValue = value;
                        }
                    }
                });
            return actualValue;
        }

        function getUnlistedFailures(samples) {
            var defer = $q.defer();
            var listednids = _.map(vm.Representation.CharacteristicSpecification.FailureReferences, function (ref) {
                return ref.Failure.NId;
            });
            var nids = [];
            _.each(samples, function (sample) {
                _.each(sample.VisualDetectedFailures, function (failure) {
                    if (!_.contains(listednids, failure.FailureNId) && !_.contains(nids, failure.FailureNId)) {
                        nids.push(failure.FailureNId);
                    }
                });
            });
            characteristicRepService.getFailuresByNIds(nids).then(function (data) {
                if ((data) && (data.succeeded)) {
                    _.each(data.value, function (failure) {
                        var failureReference = new FailureReference();
                        failureReference.CharacteristicSpecification_Id = vm.Representation.CharacteristicSpecification.Id;
                        failureReference.Failure_Id =  failure.Id;
                        failureReference.Failure = failure;
                        vm.Representation.CharacteristicSpecification.FailureReferences.push(failureReference);
                    })
                }
                defer.resolve();
            }, backendService.error);
            return defer.promise;
        }

        function getInspectionContext() {
            var defer = $q.defer();
            characteristicRepService.GetInspectionContext(vm.context).then(function (data) {
                if (data.value.length > 0) {
                    vm.InspectionContext = data.value[0];

                    if (vm.InspectionContext.InspectionSamples.length > 0) {
                        checkForAddSampleBtnVisibility(vm.InspectionContext.InspectionSamples);
                        checkForNoFailureIconVisibility(vm.InspectionContext.InspectionSamples);
                        getUnlistedFailures(vm.InspectionContext.InspectionSamples).then(function () {
                            vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                            if (null !== vm.ActualValue) {
                                fillValues();
                            }
                            checkForConfirSampleBtnVisibility(vm.ActualValue, vm.InspectionContext.InspectionSamples);
                            defer.resolve();
                        });
                    }
                    else {
                        vm.IsNoFailureIconVisible = false;
                        vm.IsAddSampleBtnVisible = true;
                        vm.DisplayInfoBadge = false;
                        vm.HasAttribute = null;
                        vm.ActualValue = null;
                        vm.Quantity = null;
                        vm.HasFailure = false;
                        setScenarioInstance(null);
                        defer.resolve();
                    }
                }
                else {
                    vm.IsAddSampleBtnVisible = true;
                    vm.IsNoFailureIconVisible = false;
                    if (!vm.onPreview) {
                        createInspectionContext().then(function () {
                            defer.resolve();
                            getUpdatedRepresentationValues();
                        });
                    }
                    else {
                        defer.resolve();
                    }
                }

            }, backendService.error);
            return defer.promise;
        }

        function getUpdatedRepresentationValues() {
            characteristicRepService.GetRuntimeCharacteristicRepresentation(vm.containerId).then(function (data) {
                vm.RuntimeData = data.value;

                if (vm.Representation.CharacteristicSpecification.Type === "Variable") {
                    setToleranceValue();
                }
            }, backendService.error);
        }

        function checkForConfirSampleBtnVisibility(actualValue, samples, force) {

            if(vm.IsSignButtonVisible && actualValue && actualValue.IsSignaturePending) {
                vm.showConfirmSample = false;
                return;
            }

            var isExist = false;
            if(actualValue) {
                isExist = samples.some(function (sample) {
                    return !sample.IsConfirmed;
                });
            }

            if(force) isExist = force;

            vm.showConfirmSample = isExist ? true : false;
        }

        function checkForAddSampleBtnVisibility(samples) {

            var isExist = samples.some(function (sample) {
                return sample.VisualDetectedFailures.some(function (failure, index, array) {
                    if (!sample.IsConfirmed) {
                        return failure.MTUNId === vm.mtu;
                    }
                    return false;
                }, sample);
            });

            vm.IsAddSampleBtnVisible = isExist ? false : true;
        }

        function checkForNoFailureIconVisibility(samples) {

            var isNoFailureExist = samples.some(function (sample) {
                return sample.VisualDetectedFailures.every(function (failure, index, array) {
                    if (!sample.IsConfirmed && failure.IsNoFailure)
                        return failure.MTUNId === vm.mtu;
                    return false;
                }, sample);
            });

            vm.IsNoFailureIconVisible = isNoFailureExist ? true : false;
        }

        vm.selectFailure = function (oldvalue, newvalue) {
            if(newvalue !== "" && typeof newvalue !== "undefined")
            {
                vm.editable = true;
                vm.defaultColor = newvalue.color;
            }
        };

        function GetInspectionOrderDetails(containerId) {
            var defer = $q.defer();
            var containerNId = "";

            characteristicRepService.GetRuntimeCharacteristicContainer(containerId).then(function (data) {
                containerNId = data.value[0].NId;

                if (containerNId !== "") {
                    characteristicRepService.GetInspectionOrderOperationByContainerNId(containerNId).then(function (inspectionData) {
                        if (inspectionData.value.length > 0) {
                            vm.inspectionOrderOperation = inspectionData.value[0].NId;
                            vm.inspectionOrder = inspectionData.value[0].InspectionOrder.NId;
                            getIndicatorsData();
                            getInspectionNumber();
                            defer.resolve();
                        }
                        else {
                            characteristicRepService.GetInspectionOrderOperationWorkProcess(containerNId).then(function (inspectionOperationData) {
                                if (inspectionOperationData.value.length > 0) {
                                    var NId = inspectionOperationData.value[0].InspectionOrderOperationNId;
                                    characteristicRepService.GetInspectionOrderOperationByNId(NId).then(function (inspectionOrderData) {
                                        if (inspectionOrderData.value.length > 0) {
                                            vm.inspectionOrderOperation = inspectionOrderData.value[0].NId;
                                            vm.inspectionOrder = inspectionOrderData.value[0].InspectionOrder.NId;
                                            vm.recurringTimerEngineExpiration = inspectionOperationData.value[0].CreatedOn;
                                            getIndicatorsData();
                                            getInspectionNumber();
                                            defer.resolve();
                                        }
                                    }, backendService.error);
                                }
                            }, backendService.error);
                        }
                    }, backendService.error);
                }
            }, backendService.error);

            return defer.promise;
        }

        function getInspectionNumber() {
            var options = "";
            characteristicRepService.GetPartAndUnitBasedInspectionExecutionEngine(vm.contextData, vm.inspectionOrder, vm.inspectionOrderOperation).then(function (inspectionExecutiondata) {
                vm.InspectionData = inspectionExecutiondata.value;
                characteristicRepService.GetBehaviour(options).then(function (InspectionExecutionCritieraData) {
                    vm.InspectionExecutionCritieraData = InspectionExecutionCritieraData.value;
                    vm.InspectionData.forEach(function (inspectionData) {
                        vm.InspectionExecutionCriteria_Id = inspectionData.InspectionExecutionCriteria_Id;
                        var BehaviourNId = vm.InspectionExecutionCritieraData.find(function (item) {
                            if (item.Id === vm.InspectionExecutionCriteria_Id) {
                                return item;
                            }
                        })
                        inspectionData.Behaviour = BehaviourNId.NId;
                    })
                    updateNumberOfInspections();
                }, backendService.error);
            }, backendService.error)

            if (vm.viewerOptions.refresh) { vm.viewerOptions.refresh(); }
        }

        function restorePoints() {
            vm.imageUploadApi.cleanpoints();
            var requiresRedraw = false;
            if (!vm.ActualValue) {
                vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                if (!vm.ActualValue) return false;
            }

            var visualSamples = vm.ActualValue.VisualDetectedFailures;
            for (var j = 0; j < visualSamples.length; j++) {
                var coords;
                if (visualSamples[j].Coords === null) {
                    coords = generateCoords(visualSamples[j], j);
                }
                else {
                    coords = JSON.parse(visualSamples[j].Coords);
                }
                if (coords.length > 0) {
                    var color = coords[0].color;
                    var legendaentry = _.find(vm.FailuresLegenda, function (leg) {
                        return leg.color === color
                    });
                    if (legendaentry != null) {
                        legendaentry.count = coords.length;
                    }
                }

                for (var i = 0; i < coords.length; i++) {
                    requiresRedraw = true;
                    vm.imageUploadApi.setPoints(coords[i]);
                }
            }

            $scope.$apply();
            return requiresRedraw;
        }

        function generateCoords(visualSample, yfactor) {
            var c = [];
            var fcolor = _.find(vm.FNIdColorsAssociations, function (ass) {
                return ass.NId === visualSample.FailureNId
            });
            var color = (typeof fcolor === "undefined") ? vm.Colors[0] : fcolor.color;
            for (var i = 0; i < visualSample.Count; i++) {
                c.push({
                    x: 20 * (i+1),
                    y: 20 * (yfactor+1),
                    color: color
                })
            }
            return c;
        }

        function fillValues() {
            setScenarioInstance(vm.ActualValue.ScenarioInstanceId, vm.ActualValue.IsSignaturePending);
            if (vm.IsVariable) {
                vm.Quantity = vm.ActualValue.InspectionValues[0].MeasuredVariableValue;
                vm.FailureNId = vm.ActualValue.InspectionValues[0].FailureNId;
                vm.HasFailure = vm.FailureNId  !== null && vm.FailureNId !== "";
                //TODO: avoid display badge in case of null Lower or Upper tolerance
                vm.DisplayInfoBadge = vm.Quantity < vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue ||
                    vm.Quantity > vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue;
            }
            if (vm.IsAttributive) {
                vm.HasAttribute = vm.ActualValue.InspectionValues[0].MeasuredAttributeValue;
                vm.HasFailure = !!vm.ActualValue.InspectionValues[0].FailureNId;
                vm.FailureNId = vm.ActualValue.InspectionValues[0].FailureNId;
            }

            if (vm.IsVisual) {
                if (typeof vm.ActualValue === "undefined") {
                    return;
                }
                var visualSamples =  vm.ActualValue.VisualDetectedFailures;
                if (vm.HasImage) {
                    angular.forEach(visualSamples, function (value, key) {
                        vm.FailuresToBeUpdated.push({ Id: value.Id, FailureNId: value.FailureNId, Count: value.Count });
                    });
                    return;
                }

                angular.forEach(visualSamples, function (value, key) {
                    var element = angular.element("#failure_" + removeSpaces(value.FailureNId))[0];
                    if (element == undefined) {
                        var message = $translate.instant("characteristicRepr.FailureNotMigrated", { FailureNId: value.FailureNId });
                        logger.logError(message);
                        //TODO: it is a simple race condition to be managed with right sequence of XHR callbacks instead of horrible $timeout
                        $timeout(function () {
                            if (angular.element("#failure_" + removeSpaces(value.FailureNId))[0]) {
                                vm.FailuresToBeUpdated.push({ Id: value.Id, FailureNId: value.FailureNId, Count: value.Count });
                                angular.element("#failure_" + removeSpaces(value.FailureNId))[0].value = value.Count;
                            }
                        }, 500);
                    }
                    else {
                        vm.FailuresToBeUpdated.push({ Id: value.Id, FailureNId: value.FailureNId, Count: value.Count });
                        angular.element("#failure_" + removeSpaces(value.FailureNId))[0].value = value.Count;
                    }
                });
            }
        }

        function createInspectionContext() {
            vm.DisplayInfoBadge = false;
            vm.HasAttribute = null;
            vm.ActualValue = null;
            vm.Quantity = null;
            vm.HasFailure = false;
            return characteristicRepService.CreateInspectionContext(vm.context).then(function (value) {
                var inspectionContextId = value.data.Id;

                return characteristicRepService.GetInspectionContextById(inspectionContextId).then(function (data) {
                    if (data.value.length > 0)
                        vm.InspectionContext = data.value[0];
                }, backendService.error);
            }, backendService.error);
        }

        function valueChanged() {
            if (!vm.notifyViolations) {
                return false;
            }

            if (vm.Quantity == undefined) {
                if (vm.ActualValue) {
                    vm.Quantity = vm.ActualValue.InspectionValues[0].MeasuredVariableValue;
                }
                vm.HasFailure = vm.ActualValue.InspectionValues[0].FailureNId !== "";
                vm.DisplayInfoBadge = false;
                return false;
            }
            vm.DisplayInfoBadge = vm.Quantity < vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue ||
                vm.Quantity > vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue;
            return true;
        }

        function saveSample() {

            var validSample = false;

            if (vm.ActualValue !== null) {
                var sampleUpdateValue = {
                    Id: vm.ActualValue.InspectionValues[0].Id
                };

                if (vm.Quantity !== null) {
                    sampleUpdateValue.MeasuredVariableValue = vm.Quantity;
                    if (vm.Quantity < vm.Representation.CharacteristicSpecification.LowerTolerance.QuantityValue ||
                        vm.Quantity > vm.Representation.CharacteristicSpecification.UpperTolerance.QuantityValue) {
                        vm.HasFailure = false;
                        vm.FailureNId = null;
                    }
                    validSample = true;
                }

                if (vm.IsAttributive && vm.HasAttribute != null) {
                    sampleUpdateValue.MeasuredAttributeValue = vm.HasAttribute;
                    if (vm.HasAttribute) {
                        vm.HasFailure = false;
                        vm.FailureNId = null;
                    }
                    validSample = true;
                }

                if (validSample) {
                    characteristicRepService.UpdateInspectionValuewithES(sampleUpdateValue).then(function (value) {
                        logger.logInfo($translate.instant("characteristicRepr.sampleupdated"));
                        getScenarioInstance();
                    }, backendService.error);
                }
                return;
            }

            var sampleValue = {
                InspectionAcquisitionContextId: vm.InspectionContext.Id,
                MTUNId: vm.mtu
            }

            if (vm.Quantity !== null) {
                sampleValue.MeasuredVariableValue = vm.Quantity;
                validSample = true;
            }

            if (vm.IsAttributive && vm.HasAttribute !== null) {
                sampleValue.MeasuredAttributeValue = vm.HasAttribute;
                validSample = true;
            }

            if (validSample) {
                var runtimeChrRepresentationNId = vm.context.RuntimeChrRepresentationNId;
                if (!vm.onPreview) {
                    characteristicRepService.CreateInspectionValuewithES(sampleValue).then(function (value) {

                        logger.logInfo($translate.instant("characteristicRepr.samplesaved"));
                        var inspectionContextId = sampleValue.InspectionAcquisitionContextId;
                        // the inspection value id is on value.data.Id;
                        characteristicRepService.GetInspectionContextById(inspectionContextId).then(function (data) {
                            if (data.value.length > 0 && runtimeChrRepresentationNId === vm.context.RuntimeChrRepresentationNId) {
                                vm.InspectionContext = data.value[0];
                                vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                                setScenarioInstance(vm.ActualValue.ScenarioInstanceId, vm.ActualValue.IsSignaturePending);
                                checkForConfirSampleBtnVisibility(vm.ActualValue, vm.InspectionContext.InspectionSamples);
                            }
                            else if (vm.ActualValue == null) {
                                vm.DisplayInfoBadge = false;
                                vm.HasAttribute = null;
                                vm.Quantity = null;
                            }
                        }, backendService.error);
                    }, backendService.error);
                }
            }
        }

        function setTooltipPosition() {
            $(".icon-text").each(function (index)
            {
                $(this).css('left', -5 - $(this).width() * (1 - 1 / 1.618))
            });
        }

        function clickedPoint(point) {
            saveSketchSample();
        }

        function saveSketchSample() {
            var detectedFailures = vm.imageUploadApi.getpoints();
            var gby = _.groupBy(detectedFailures, function (element) {
                return element.color
            });
            angular.forEach(vm.Representation.CharacteristicSpecification.FailureReferences, function(value, key) {
                var failureNId = value.Failure.NId;
                var failureColor = _.find(vm.FNIdColorsAssociations, function(failure) {
                    return failure.NId === failureNId;
                });
                var count;
                var coords;
                _.each(gby,
                    function (element, index, list) {
                        if (index === failureColor.color) {
                            count = element.length;
                            coords = "[" +
                                _.map(list[index], function (elem) {
                                    return JSON.stringify(elem)
                                }).join(",") +
                                "]";
                        }
                    });
                var visualValue = {
                    InspectionAcquisitionContextId: vm.InspectionContext.Id,
                    MTUNId: vm.mtu,
                    FailureNId: failureNId,
                    Count: count,
                    Coords: coords
                }

                var foundLeg = _.find(vm.FailuresLegenda, function (option) {
                    return option.color === failureColor.color
                });
                if (foundLeg) {
                    foundLeg.count = (count !== undefined)?count:0;
                }

                var found = _.findWhere(vm.FailuresToBeUpdated, { FailureNId: failureNId });
                if (found && found.Count !== count && !isNaN(count)) {
                    characteristicRepService.UpdateVisualDetectedFailurewithES({ Id: found.Id, Count: count, Coords: coords }).then(function (vv) {
                        logger.logInfo($translate.instant("characteristicRepr.sampleupdated"));
                        checkForAddSampleBtnVisibility(vm.InspectionContext.InspectionSamples);
                        checkForNoFailureIconVisibility(vm.InspectionContext.InspectionSamples);
                        getScenarioInstance();
                    }, backendService.error);
                    return;
                }

                if (count !== null && isNaN(count) || (typeof found !== "undefined")) return;



                vm.FailuresToBeUpdated.push({ Id: null, FailureNId: failureNId, Count: count });
                characteristicRepService.CreateVisualDetectedFailurewithES(visualValue).then(function (val) {
                    logger.logInfo($translate.instant("characteristicRepr.samplesaved"));
                    var fnd = _.findWhere(vm.FailuresToBeUpdated, { FailureNId: failureNId });
                    fnd.Id = val.data.Id;
                    characteristicRepService.GetInspectionContextById(vm.InspectionContext.Id).then(function (data) {
                        if (data.value.length > 0) {
                            vm.InspectionContext = data.value[0];
                            vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                            checkForConfirSampleBtnVisibility(vm.ActualValue, vm.InspectionContext.InspectionSamples);
                            checkForAddSampleBtnVisibility(vm.InspectionContext.InspectionSamples);
                            checkForNoFailureIconVisibility(vm.InspectionContext.InspectionSamples);
                            getScenarioInstance();
                        }
                    }, backendService.error);
                }, backendService.error);
            });
        }

        function saveVisualSample() {

            angular.forEach(vm.Representation.CharacteristicSpecification.FailureReferences, function (value, key) {

                var failureNId = value.Failure.NId;
                var count = angular.element("#failure_" + removeSpaces(failureNId))[0].value;
                count = Number.parseInt(count);
                var visualValue = {
                    InspectionAcquisitionContextId: vm.InspectionContext.Id,
                    MTUNId: vm.mtu,
                    FailureNId: failureNId,
                    Count: count
                }

                var found = _.findWhere(vm.FailuresToBeUpdated, { FailureNId: failureNId });

                if (found && found.Count !== count && !isNaN(count)) {
                    characteristicRepService.UpdateVisualDetectedFailurewithES({ Id: found.Id, Count: count }).then(function (vl) {
                        logger.logInfo($translate.instant("characteristicRepr.sampleupdated"));
                        getScenarioInstance();
                    }, backendService.error);
                    return;
                }

                if (typeof found !== "undefined") {
                    if (isNaN(count)) {
                        var element = angular.element("#failure_" + removeSpaces(failureNId))[0];
                        element.value = found.Count;
                    }
                    return;
                }

                if (isNaN(count)) return;

                characteristicRepService.CreateVisualDetectedFailurewithES(visualValue).then(function (vue) {
                    logger.logInfo($translate.instant("characteristicRepr.samplesaved"));
                    vm.FailuresToBeUpdated.push({ Id: vue.data.Id, FailureNId: failureNId, Count: count });
                    characteristicRepService.GetInspectionContextById(vm.InspectionContext.Id).then(function (data) {
                        if (data.value.length > 0) {
                            vm.InspectionContext = data.value[0];
                            vm.ActualValue = getActualValues(vm.InspectionContext.InspectionSamples);
                            checkForConfirSampleBtnVisibility(vm.ActualValue, vm.InspectionContext.InspectionSamples);
                            getScenarioInstance();
                        }
                    }, backendService.error);
                }, backendService.error);

            });
        }

        function getViewerData() {

            if (vm.containerId === "" || (vm.containerId && vm.containerId.indexOf('{') !== -1)) {
                vm.HasImage = false;
                vm.isloaded = false;
                return;
            }

            if (vm.containerId === undefined) {
                characteristicRepService.GetCharacteristicRepresentation(vm.crId).then(function (data) {
                    var charRepData = {
                        'CanBeSkipped': data.value[0].CanBeSkipped,
                        'ChrSpecNId': data.value[0].CharacteristicSpecification.NId,
                        'ChrSpecRevision': data.value[0].CharacteristicSpecification.Revision,
                        'ChrReprFrequencyNId': data.value[0].CharacteristicRepresentationFrequency.NId,
                        'NumberOfInspections': 0,
                        'NId': data.value[0].NId,
                        'ChrReprRevision': data.value[0].Revision,
                        'ChrReprNId': data.value[0].NId,
                        'Label': data.value[0].NId
                    };
                    vm.onPreview = true;
                    vm.isloaded = true;
                    vm.viewerData.push(charRepData);
                    if (vm.viewerOptions.refresh) { vm.viewerOptions.refresh(); }
                    registerEvents();
                });
            }
            else {
                resetInitialValues();
                characteristicRepService.GetRuntimeCharacteristicRepresentation(vm.containerId).then(function (data) {
                    vm.HasFailure = false;
                    vm.HasImage = false;

                    vm.isloaded = characteristicRepService.IsEnabled();
                    vm.RuntimeData = data.value;
                    var options = "";

                    vm.contextData = vm.context ? JSON.parse(vm.context) : {};

                    var ChrReprFrequency = vm.RuntimeData.find(function (item) {
                        if (item.ChrReprFrequencyNId === "UnitBased" || item.ChrReprFrequencyNId === "PartBased") {
                            return true;
                        }
                    })

                    if (vm.inspectionOrderDetailsNeeded) {
                        GetInspectionOrderDetails(vm.containerId);
                    }
                    else {
                        getIndicatorsData();
                    }

                    if (ChrReprFrequency && !vm.inspectionOrderDetailsNeeded) {
                        characteristicRepService.GetInspectionExecutionEngine().then(function (inspectionExecutiondata) {
                            vm.InspectionData = inspectionExecutiondata.value;
                            characteristicRepService.GetBehaviour(options).then(function (InspectionExecutionCritieraData) {
                                vm.InspectionExecutionCritieraData = InspectionExecutionCritieraData.value;
                                vm.InspectionData.forEach(function (inspectionData) {
                                    vm.InspectionExecutionCriteria_Id = inspectionData.InspectionExecutionCriteria_Id;
                                    var BehaviourNId = vm.InspectionExecutionCritieraData.find(function (item) {
                                        if (item.Id === vm.InspectionExecutionCriteria_Id) {
                                            return item;
                                        }
                                    })
                                    inspectionData.Behaviour = BehaviourNId.NId;
                                })
                                updateNumberOfInspections();
                                updateViewerData();
                            }, backendService.error);
                        }, backendService.error);
                    }
                    else {
                        vm.viewerData = vm.RuntimeData;
                        updateViewerData();
                    }

                    if (vm.viewerOptions.refresh && !vm.inspectionOrderDetailsNeeded) { vm.viewerOptions.refresh(); }
                    
                    registerEvents();
                    if (vm.viewerData.length === 1 && vm.hideSingleElementList) {
                        vm.hideICV = true;
                        onSelectionChange(vm.viewerData);
                    }
                }, backendService.error);
            }
        }

        function updateViewerData() {
            if (vm.viewerOptions.refresh) { vm.viewerOptions.refresh(); }
            if (vm.inspectionOrderDetailsNeeded === 'true') {
                GetInspectionOrderDetails(vm.containerId);
            }
            else {
                getIndicatorsData();
            }
            registerEvents();
            if (vm.viewerData.length === 1 && vm.hideSingleElementList) {
                vm.hideICV = true;
                onSelectionChange(vm.viewerData);
            }
        }

        function updateNumberOfInspections() {
            vm.RuntimeData.forEach(function (runtimeData) {
                runtimeData.NumberOfInspections = runtimeData.NumberOfInspections ? runtimeData.NumberOfInspections : 0;
                var ExecutionData = vm.InspectionData.find(function (item) {
                    if (item.CharacteristicRepresentationNId === runtimeData.ChrReprNId && item.CharacteristicRepresentationRevision === runtimeData.ChrReprRevision
                        && item.MaterialNId === vm.contextData.MaterialNId && item.MaterialRevision === vm.contextData.MaterialRevision
                        && item.ReferencedOperation === runtimeData.ReferencedOperation && item.EquipmentNId === vm.contextData.EquipmentNId) {
                        return item;
                    }
                });
                if (ExecutionData && ExecutionData.Behaviour === "Default") {
                    runtimeData.NumberOfInspections = ExecutionData.CharacteristicRepresentationRuntimeNumber;
                    vm.viewerData = vm.RuntimeData;
                }
                else if (ExecutionData && ExecutionData.Behaviour === "Serial") {
                    characteristicRepService.GetRuntimeCharacteristicNId(vm.containerId).then(function (data) {
                        vm.RuntimeCharacteristicNId = data.value[0].NId;
                        characteristicRepService.GetNumberofInspectionsForSerial(vm.mtu, vm.RuntimeCharacteristicNId).then(function (inspectionData) {
                            vm.InspectionDataSerial = inspectionData.value;
                            var inspectData = vm.InspectionDataSerial.find(function (item) {
                                if (item.Containers.length != 0) {
                                    return item;
                                }
                            });
                            runtimeData.NumberOfInspections = inspectData !== undefined ? inspectData.NumberOfInspections : 0;
                            vm.viewerData = vm.RuntimeData;
                            vm.viewerOptions.refresh();
                            $rootScope.$broadcast('grid.refreshList');
                        }, backendService.error)
                    }, backendService.error);
                }
                else {
                    vm.viewerData = vm.RuntimeData;
                }
                vm.viewerData = vm.RuntimeData;
            })

            if (vm.viewerOptions.refresh && vm.inspectionOrderDetailsNeeded) { vm.viewerOptions.refresh(); }
        }

        function ConvertFrequencyToMinutes(thresholdValue, scheduleMode) {
            var frequencyValue = 0;
            switch (scheduleMode.toLowerCase()) {
                case "hourly":
                    frequencyValue = thresholdValue * 60 * 60000;
                    break;
                case "daily":
                    frequencyValue = thresholdValue * 24 * 60 * 60000;
                    break;
                default:
                    frequencyValue = thresholdValue * 60000;
                    break;
            }

            return frequencyValue;
        }

        function getIndicatorsData() {
            var updateIndicators = vm.viewerData.map(function (tileData) {
                //to get time based inspection execution engine data
                return characteristicRepService.GetTimeBasedInspectionExecutionEngine(tileData, vm.contextData, vm.inspectionOrder, vm.inspectionOrderOperation).then(function (timeBasedData) {
                    if (timeBasedData.value.length > 0) {
                        vm.TimeBasedInspection = timeBasedData.value[0];
                        tileData.State = vm.TimeBasedInspection.State;
                        tileData.LastTimerExpiration = vm.TimeBasedInspection.LastTimerExpiration;
                        tileData.activeExecution = false;
                        tileData.expiredExecution = false;
                        tileData.delayInExecution = false;

                        if (vm.TimeBasedInspection.State && vm.TimeBasedInspection.State === "Active") {
                            var currentDate = new Date().toISOString();
                            var delayTime;
                            var getDelayTime;

                            if (vm.TimeBasedInspection.CharacteristicRepresentationFrequency === "RecurringTimeBased") {
                                var convertFreqeuncytoMinutes = ConvertFrequencyToMinutes(vm.TimeBasedInspection.CharacteristicRepresentationFrequencyValue, vm.TimeBasedInspection.ScheduleMode)
                                tileData.LastTimerExpiration = vm.recurringTimerEngineExpiration;
                                var getExpiredTime = new Date(vm.recurringTimerEngineExpiration).getTime() + convertFreqeuncytoMinutes;
                                vm.TimeBasedInspection.CurrentTimerExpiration = new Date(getExpiredTime).toISOString();
                            }

                            if (vm.TimeBasedInspection.MandatoryInspectionWarningUoM === "minute") {
                                //calculating time as per delay in minutes
                                getDelayTime = new Date(vm.TimeBasedInspection.CurrentTimerExpiration).getTime() - vm.TimeBasedInspection.MandatoryInspectionWarningValue * 60000;
                                delayTime = new Date(getDelayTime).toISOString();
                            } else if (vm.TimeBasedInspection.MandatoryInspectionWarningUoM === "hour") {
                                //calculating time as per delay in hours
                                getDelayTime = new Date(vm.TimeBasedInspection.CurrentTimerExpiration).getTime() - vm.TimeBasedInspection.MandatoryInspectionWarningValue * 60 * 60000;
                                delayTime = new Date(getDelayTime).toISOString();
                            } else if (vm.TimeBasedInspection.MandatoryInspectionWarningUoM === "day") {
                                //calculating time as per delay in days
                                getDelayTime = new Date(vm.TimeBasedInspection.CurrentTimerExpiration).getTime() - vm.TimeBasedInspection.MandatoryInspectionWarningValue * 24 * 60 * 60000;
                                delayTime = new Date(getDelayTime).toISOString();
                            }

                            if (currentDate < delayTime) {
                                tileData.activeExecution = true;
                            }
                            if (currentDate < vm.TimeBasedInspection.CurrentTimerExpiration && currentDate >= delayTime) {
                                tileData.delayInExecution = true;
                            }
                            if (vm.TimeBasedInspection.CurrentTimerExpiration < currentDate) {
                                tileData.expiredExecution = true;
                            }
                        }
                    }

                }, backendService.error);
            });

            $q.all(updateIndicators).then(function () {
                if (vm.viewerOptions.refresh) { vm.viewerOptions.refresh(); }
            });
        }

        vm.currentTask = "";
        $scope.$on('common.widgets.containers.task-visible',  function (newVal, value) {
            if(value.taskId !== vm.currentTask)
            {
                vm.currentTask = value.taskId;
                resetInitialValues();
                initialize();
            }
        });

        function resetInitialValues() {
            vm.Specification = {};
            vm.InspectionContext = {};
            vm.IsVisual = false;
            vm.IsAttributive = false;
            vm.IsVariable = false;
            vm.HasValue = false;
            vm.HasImage = false;
            vm.Quantity = null;
            vm.HasFailure = false;
            vm.HasAttribute = null;
            vm.ImageWidth = 0;
            vm.ImageHeight = 0;
            vm.FailureNId = null;
            vm.FailuresToBeUpdated = [];
            vm.chosenFailure = {};
            vm.propertyGridData = [];
            vm.ActualValue = {};
            vm.hasAttachments = false;
        }


        vm.viewerOptions = {
            containerID: 'repritemlist',
            selectionMode: 'single',
            viewMode: 'c',
            svgIcon: 'common/icons/typeCharacteristicRepresentation48.svg',
            quickSearchOptions: {
                enabled: true,
                field: 'NId',
                filterText: ''
            },
            sortFields: ['NId'],
            filterBarOptions: "sq",
            tileConfig: {
                propertyFields: [
                    { field: 'CanBeSkipped', displayName: $translate.instant('characteristicRepr.CanBeSkipped') },
                    { field: 'ChrSpecNId', displayName: $translate.instant('characteristicRepr.NId') },
                    { field: 'ChrSpecRevision', displayName: $translate.instant('characteristicRepr.Revision') },
                    {
                        field: 'NumberOfInspections', displayName: $translate.instant('characteristicRepr.NumberOfInspections'),
                        visible: function (tile) {
                            if (tile.ChrReprFrequencyNId === "UnitBased" || tile.ChrReprFrequencyNId === "PartBased") {
                                return true;
                            }
                            return false;
                        }
                    }
                ],
                titleField: 'Label',
                descriptionField: 'ChrReprNId',
                isCell: true,
                indicators: [
                    {
                        svgIcon: 'common/icons/indicatorWarningTriangleYellow16.svg',
                        visible: function (tile) {
                            return tile.MandatoryExecutionsCompleted === true
                        },
                        tooltip: $translate.instant('characteristicRepr.mandatoryExecutionsCompleted')
                    },
                    {
                        svgIcon: 'common/icons/indicatorGreenCircle16.svg',
                        visible: function (tile) {
                            if (tile.State && tile.State === "Active" && tile.activeExecution) {
                                return true;
                            }
                            return false;
                        },
                        tooltip: $translate.instant('characteristicRepr.activeExecution')
                    },
                    {
                        svgIcon: 'common/icons/indicatorRedCircle16.svg',
                        visible: function (tile) {
                            if (tile.State && tile.State === "Active" && tile.expiredExecution) {
                                return true;
                            }
                            return false;
                        },
                        tooltip: $translate.instant('characteristicRepr.expiredExecution')
                    },
                    {
                        svgIcon: 'common/icons/indicatorYellowSquare16.svg',
                        visible: function (tile) {
                            if (tile.State && tile.State === "Active" && tile.delayInExecution) {
                                return true;
                            }
                            return false;
                        },
                        tooltip: $translate.instant('characteristicRepr.delayInExecution')
                    },
                    {
                        svgIcon: 'common/icons/cmdCheckmark16.svg',
                        visible: function (tile) {
                            if (tile.State && tile.State === "Completed") {
                                return true;
                            }
                            return false;
                        },
                        tooltip: $translate.instant('characteristicRepr.completedExecution')
                    },
                    {
                        svgIcon: 'common/icons/cmdPause24.svg',
                        visible: function (tile) {
                            if (tile.State && tile.State === "Paused") {
                                return true;
                            }
                            return false;
                        },
                        tooltip: $translate.instant('characteristicRepr.pausedExecution')
                    }
                ]
            },
            onSelectionChangeCallback: onSelectionChange
        };

        initialize();


        function initialize() {
            logger = common.logger;
            vm.isenabled = characteristicRepService.IsEnabled();
            if (typeof vm.context === "string") {
                vm.context = JSON.parse(vm.context);
            }
            if (vm.notifyViolations == undefined) {
                vm.notifyViolations = true;
            }
            var x = [];
            onSelectionChange(x);
            initSignalConnection();
            $scope.$on('$destroy', function () {
                destroySignalServiceConnections();
            });
        }


        function onSelectionChange(item) {

            var image = angular.element("#" + vm.ImageId);
            if (image.length > 0) {
                image[0].remove();
            }
            if (typeof vm.context === "string") {
                vm.context = JSON.parse(vm.context);
            }

            vm.IsVariable = false;
            vm.IsAttributive = false;
            vm.IsVisual = false;
            vm.HasImage = false;
            vm.hasattachment = false;
            vm.FailureNId = null;
            vm.DisplayInfoBadge = false;
            vm.HasAttribute = null;
            vm.ActualValue = null;
            vm.Quantity = null;
            vm.HasFailure = false;
            vm.chosenFailure = null;
            vm.editable = false;
            vm.IsSignButtonVisible = false;
            vm.scenarioInstance.ScenarioInstanceId =  null ;
            vm.IsSignaturePending = false;
            vm.showConfirmSample = false;
            vm.isQualityInspectionSelected = false;
            vm.FailuresToBeUpdated = [];
            if (item.length !== 0) {
                vm.isQualityInspectionSelected = true;
                vm.Label = item[0].Label;
                vm.Id = item[0].ChrReprNId;
                vm.context.RuntimeChrRepresentationNId = item[0].NId;
                vm.ChrReprRevision = item[0].ChrReprRevision;
                if (item[0].ScenarioConfiguration && item[0].ScenarioConfiguration.NId) {
                    var isAuditTrailInstalled = backendService.getAppEndPoint('AuditTrail');
                    vm.IsSignButtonVisible = !!isAuditTrailInstalled;
                    vm.ScenarioConfigurationNId = item[0].ScenarioConfiguration.NId;
                    vm.ScenarioConfigurationActionLabel = item[0].ScenarioConfiguration.ActionLabel;
                }

                getSpecification();

            }
        }
    }

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.characteristicRepr').service('siemens.simaticit.common.characteristicReprService', characteristicReprService);

    characteristicReprService.$inject = ['$q',  'common.services.runtime.backendService'];
    function characteristicReprService($q,  backendService) {
        var APP_NAME = "WorkInstruction";
        var isenabled = backendService.getAppEndPoint(APP_NAME) != null;

        this.IsEnabled = function()
        {
            return isenabled;
        }

        this.GetSketch = function(imageId)
        {
            var object = {
                "appName": APP_NAME,
                "functionName": "GeSketchImage",
                "params": { ImageId: imageId }
            };
            return backendService.read(object);
        }

        this.GetRuntimeCharacteristicRepresentation = function (containerid) {
            var options = containerid === "" ? "" : "$filter=RuntimeChrReprContainer_Id eq " + containerid;
            var query = {
                appName: APP_NAME,
                entityName: "RuntimeCharacteristicRepresentation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetRuntimeCharacteristicContainer = function (containerId) {
            var options = containerId === "" ? "" : "$filter=Id eq " + containerId;
            var query = {
                appName: APP_NAME,
                entityName: "RuntimeCharacteristicRepresentationContainer",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionOrderOperationWorkProcess = function (containerNId) {
            var options = containerNId === "" ? "" : "$filter=RuntimeCharacteristicRepresentationContainerNId eq '" + containerNId + "'";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionOrderOperationWorkProcess",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionOrderOperationByNId = function (InspectionOrderOperationNId) {
            var options = InspectionOrderOperationNId === "" ? "null" : "$filter=NId eq '" + InspectionOrderOperationNId + "'&$expand=InspectionOrder";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionOrderOperation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionOrderOperationByContainerNId = function (containerNId) {
            var options = containerNId === "" ? "" : "$filter=RuntimeCharacteristicRepresentationContainerNId eq '" + containerNId + "'&$expand=InspectionOrder";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionOrderOperation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionExecutionEngine = function () {
            var options = "";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionExecutionEngine",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetBehaviour = function (options) {
            var options = "";
            var query = {
                appName: APP_NAME,
                entityName: "PartBasedInspectionExecutionCriteria",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetRuntimeCharacteristicNId = function (runtimeChrRepresentationId) {
            var options = "$filter=Id eq " + runtimeChrRepresentationId;
            var query = {
                appName: APP_NAME,
                entityName: "RuntimeCharacteristicRepresentationContainer",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetNumberofInspectionsForSerial = function (mtu, runtimeChrRepresentationNId) {
            var options = "$filter=Serial eq '" + mtu + "'&$expand=Containers($filter=ContainerNId eq '" + runtimeChrRepresentationNId + "')";
            var query = {
                appName: APP_NAME,
                entityName: "CandidateSerial",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetCharacteristicRepresentation = function (characteristicrepresentationnid) {
            var options = characteristicrepresentationnid === "" ? "" : "$filter=NId eq '" + characteristicrepresentationnid +
                "'&$expand=CharacteristicSpecification($expand=FailureReferences($expand=Failure)),CharacteristicRepresentationFrequency($select=NId)";
            var query = {
                appName: APP_NAME,
                entityName: "CharacteristicRepresentation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionContext = function (context) {
            var options = "$filter=RuntimeCharacteristicRepresentationNId eq '" + context.RuntimeChrRepresentationNId +
                "' AND EquipmentNId eq '" + context.EquipmentNId +
                "' AND MaterialNId eq '" + context.MaterialNId +
                "'&$expand=InspectionSamples($expand=InspectionValues,VisualDetectedFailures)";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionAcquisitionContext",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetTimeBasedInspectionExecutionEngine = function (tileData, contextData, inspectionOrder, inspectionOrderOperation) {
            var options = "$filter=CharacteristicRepresentationNId eq '" + tileData.ChrReprNId +
                "' AND CharacteristicRepresentationRevision eq '" + tileData.ChrReprRevision +
                "' AND MaterialNId eq '" + contextData.MaterialNId +
                "' AND MaterialRevision eq '" + contextData.MaterialRevision +
                "' AND ReferencedOperation eq " + (tileData.ReferencedOperation ? "'" + tileData.ReferencedOperation + "'" : "null");

            if (inspectionOrder !== "") {
                options = "$filter=CharacteristicRepresentationNId eq '" + tileData.ChrReprNId +
                    "' AND CharacteristicRepresentationRevision eq '" + tileData.ChrReprRevision +
                    "' AND MaterialNId eq '" + contextData.MaterialNId +
                    "' AND MaterialRevision eq '" + contextData.MaterialRevision +
                    "' AND InspectionOrder eq '" + inspectionOrder + "'" +
                    " AND InspectionOrderOperation eq '" + inspectionOrderOperation + "'";
            }

            var query = {
                appName: APP_NAME,
                entityName: "TimeBasedInspectionExecutionEngine",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetPartAndUnitBasedInspectionExecutionEngine = function (contextData, inspectionOrder, inspectionOrderOperation) {
            var options = "$filter=MaterialNId eq '" + contextData.MaterialNId +
                "' AND MaterialRevision eq '" + contextData.MaterialRevision +
                "' AND InspectionOrder eq " + (inspectionOrder === "" ? "null" : "'" + inspectionOrder + "'") +
                " AND InspectionOrderOperation eq " + (inspectionOrderOperation === "" ? "null" : "'" + inspectionOrderOperation + "'");
            var query = {
                appName: APP_NAME,
                entityName: "InspectionExecutionEngine",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionContextById = function (Id) {
            var options = "$filter=Id eq " + Id +"&$expand=InspectionSamples($expand=InspectionValues,VisualDetectedFailures)";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionAcquisitionContext",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetScenarioInstanceBySampleId = function (Id) {
            var options = "$filter=Id eq " + Id + "&$select=ScenarioInstanceId,IsSignaturePending";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionSample",
                options: options
            }
            return backendService.findAll(query);
        }

        this.AcquireCharacteristicValues = function (CharacteristicRepresentationItemId, EquipmentNId, MaterialNId, MaterialRevision) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'AcquireCharacteristicValues',
                'params': {
                    'CharacteristicRepresentationItemId': CharacteristicRepresentationItemId,
                    'EquipmentNId': EquipmentNId, 'MaterialNId': MaterialNId, 'MaterialRevision': MaterialRevision
                }
            });
        }

        this.CreateInspectionContext = function(acquisitioncontext)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateInspectionAcquisitionContext',
                'params': acquisitioncontext
            });
        }

        this.CreateSample = function (sample) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'AddInspectionSample',
                'params': sample
            })
        }

        this.ConfirmInspectionSample = function (payload) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'ConfirmInspectionSample',
                'params': payload
            });
        }

        this.CreateInspectionValue = function (inspectionvalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateInspectionValue',
                'params': inspectionvalue
            });
        }

        this.CreateInspectionValuewithES = function (inspectionvalue) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateInspectionValuewithES',
                'params': inspectionvalue
            });
        }

        this.CreateVisualDetectedFailure = function (visualfailurevalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateVisualDetectedFailure',
                'params': visualfailurevalue
            });
        }


        this.CreateVisualDetectedFailurewithES = function (visualfailurevalue) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateVisualDetectedFailurewithES',
                'params': visualfailurevalue
            });
        }

        this.UpdateInspectionValue = function (inspectionvalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateInspectionValue',
                'params': inspectionvalue
            });
        }

        this.UpdateInspectionValuewithES = function (inspectionvalue) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateInspectionValuewithES',
                'params': inspectionvalue
            });
        }

        this.UpdateVisualDetectedFailure = function (visualfailurevalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateVisualDetectedFailure',
                'params': visualfailurevalue
            });
        }

        this.UpdateVisualDetectedFailurewithES = function (visualfailurevalue) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateVisualDetectedFailurewithES',
                'params': visualfailurevalue
            });
        }

        this.RemoveFailureToInspectionValue = function (visualfailurevalue) {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'DisassociateFailureFromInspectionValue',
                'params': visualfailurevalue
            });
        }

        this.AssociateFailureToInspectionValue = function (Id, FailureId) {
            var payload = {
                Id: Id,
                FailureId: FailureId
            }
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'AssociateFailureToInspectionValue',
                'params': payload
            });
        }

        this.getFailures = function (parentid) {
            var object = {
                "appName": "Defect",
                "functionName": "GetFailures",
                "params": { FailureId: parentid },
                "options": ""
            };

            return backendService.read(object);
        }

        this.getFailuresByNIds = function (nids) {
            if (nids.length <= 0) {
                return $q.resolve(null);
            }
            var options = "$expand=Attachments&$filter=";
            _.each(nids, function (nid, index) {
                if (index !== 0) {
                    options += " or ";
                }
                options += "NId eq '" + nid + "'";
            })

            var query = {
                appName: "Defect",
                entityName: "Failure",
                options: options
            }
            return backendService.findAll(query);
        }

        this.getAttachments = function (failureid) {
            var options = "$expand=Attachments&$filter=Id eq " + failureid;
            var query = {
                appName: "Defect",
                entityName: "Failure",
                options: options
            }
            return backendService.findAll(query);
        }

        this.getAttachmentFile = function(fileId, iconId) {
            var object = {
                "appName": "Defect",
                "functionName": "GetAttachmentFile",
                "params": { FileId: fileId, IconId: iconId }
            };
            return backendService.read(object);
        }
    }

})();

(function () {
    "use strict";
    angular.module('siemens.simaticit.common.widgets.characteristicRepr')
        .directive('sitFailuresBrowser', failuresBrowser);

    function failuresBrowser() {
        return {
            templateUrl: "common/widgets/characteristicRepr/sit-failures-browser-dir.html",
            controller: failuresBrowserController,
            restrict: "E",
            controllerAs: "vm",
            scope: {},
            bindToController: {
                alreadyAssigned: "=",
                selectedItem: "=",
                hasSelection: "=",
                displayMode: "="
            },
            link: {
                post: function postLink(scope, element, attrs, ctrl) {

                }
            }
        }
    }

    failuresBrowserController.$inject = ["$scope", "$rootScope","common.base","siemens.simaticit.common.characteristicReprService", "$translate", "$q"];

    function failuresBrowserController($scope, $rootScope, common, characteristicReprService, $translate, $q) {

        var vm = this;
        vm.onButtonClick = onButtonClick;
        vm.onGoBackClick = onGoBackClick;
        vm.id =  $scope.$id;
        vm.name = "failuresBrowser_" + $scope.$id;
        vm.ready = false;
        vm.viewerData = [];
        vm.viewerOptions = {};
        vm.attachmentsOnly = false;
        vm.NavigatingHierarchy = false;
        var backendService = common.services.runtime.backendService;
        function activate() {
            initGrid();
            resetDialog();
            /* "displayMode" meaning:
            1 - Browse unassigned failures
            2 - Browse assigned failures
            3 - Just show attachment  */
            switch (vm.displayMode) {
                case 0:
                    initData(null);
                    break;
                case 1:
                    _.each(vm.alreadyAssigned, function (ass) {
                        vm.viewerData.push(ass.Failure);
                    });
                    vm.ready = true;
                    break;
                case 2:
                    vm.attachmentsOnly = true;
                    getAttachments(vm.alreadyAssigned[0].Failure_Id);
                    break;
                default:

                    break;
            }
        }
        vm.homeIcon = {
            path: "common/icons/cmdHome24.svg",
            size: "16"
        };
        vm.browseIcon = {
            path: "common/icons/cmdGoToElement24.svg",
            size: "16"
        };
        vm.backIcon = {
            path: "common/icons/cmdBack24.svg",
            size: "16"
        };
        activate();

        function onGoBackClick() {
             vm.viewerData = [];
             _.each(vm.alreadyAssigned, function (ass) {
                vm.viewerData.push(ass.Failure);
            });
            vm.NavigatingHierarchy = false;
        }

        function onButtonClick() {
             vm.NavigatingHierarchy = true;
            initData(null);
        }

         function initGrid() {
             vm.viewerOptions = {

                 containerID: 'div_' + vm.name,
                 userPrefId: vm.id,
                 selectionMode: 'single',
                 viewMode: 'l',
                 viewOptions: 'l',
                 enablePaging: false,
                 alwaysShowPager:false,
                 svgIcon: 'common/icons/typeFMEAFailureSpecification48.svg',
                 tileConfig: {
                     isCell: true,
                     titleField: 'NId',
                     propertyFields: [
                         { field: 'Name', displayName: $translate.instant('characteristicRepr.Name') },
                         { field: 'Revision', displayName: $translate.instant('characteristicRepr.FailureRevision') }
                     ],
                     descriptionField: 'Description',
                     commands: [
                         {
                             cmdIcon: 'Open',
                             onClick: function (item) {
                                 initData(item.Id);
                                 vm.selectedItem = null;
                                 vm.hasSelection = false;
                                 vm.hasAttachments = false;
                             },
                             tooltip: $translate.instant('characteristicRepr.OpenChildrenFailures'),
                             visible: function (item) {return item.HasChildren }
                         }]
                 },
                 noDataMessage: $translate.instant('characteristicRepr.NoAssociatedFailures'),
                 onSelectionChangeCallback: onItemSelection
             };
        }


          vm.categories = [
                    {
                        "id": "1",
                        "label": $translate.instant('characteristicRepr.attachmentlist'),
                        "uploadEnabled": false,
                        "deleteEnabled": false
                    }
                ];
                vm.actions = [];
                vm.config = {
                    "title":  $translate.instant('characteristicRepr.document'),
                    "showFirstDocument": false,
                    "mode": "display",
                    "fullScreenMode": "toolbar",
                    "plugins": [{"format": "svg","viewer": "sit-vector-viewer"}]
                };

        function initData(id) {
            characteristicReprService.getFailures(id).then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.ready = true;
                    vm.viewerData = _.filter(data.value, function (failure) {
                        var found = _.find(vm.alreadyAssigned, function (already) {
                            return (already.Failure && already.Failure.NId === failure.NId && failure.HasChildren === false);
                        });
                        return !found;
                    });
                } else {
                    vm.viewerData = [];
                }
                vm.ready = true;
            }, backendService.backendError);
        }

        vm.attachmentData = {};
        vm.hasAttachments = false;
        function onItemSelection(items, item) {
            var found = _.find(vm.alreadyAssigned, function (already) {
                return already.Failure.NId === item.NId
            });
            if (found && vm.displayMode === 0) {
                resetDialog();
                return;
            }
            if (item && item.selected === true) {
                vm.selectedItem = item;
                vm.hasSelection = true;
                getAttachments(item.Id);
            } else {
                resetDialog();
            }
            $rootScope.$emit('failuresModal.selection', vm.hasSelection);
        }


        function resetDialog() {
            vm.selectedItem = null;
            vm.hasSelection = false;
            vm.hasAttachments = false;
        }

        function getAttachments(failureid) {
            characteristicReprService.getAttachments(failureid).then(function (data) {
                if ((data) && (data.succeeded)) {
                    if (data.value[0].Attachments.length > 0) {
                        vm.attachmentData = data.value[0].Attachments;
                        loadFailureAttachments(vm.attachmentData).then(function (result) {});
                    }
                    else {
                        vm.hasAttachments = false;
                    }
                }
                else {
                    vm.hasAttachments = false;
                }
            });
        }

        function loadFile(fileId, iconId) {
            return characteristicReprService.getAttachmentFile(fileId, iconId).then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.hasAttachments = true;
                    var len = vm.attachmentData.length;
                    vm.attachmentData[len] = {}
                    vm.attachmentData[len].name = data.value[0].File.name;
                    vm.attachmentData[len].category = "1";
                    vm.attachmentData[len].remote = "true";
                    vm.attachmentData[len].format = findFormat(data.value[0].File.type);
                    vm.attachmentData[len].source = data.value[0].File.data;
                    if (data.value[0].Icon !== undefined)
                        vm.attachmentData[len].thumbnail = data.value[0].Icon.data;
                }
            });
        }

         function findFormat(mimeType) {
             switch (mimeType) {
                case "text/plain":
                    return "text";
                case "image/svg+xml":
                    return "svg";
                case "application/pdf":
                    return "pdf";
                default:
                   if (mimeType.match(/^image\//))
                        return "image";
                   if (mimeType.match(/^video\//))
                       return "video";
             }
             return "unknown";
        }

        function loadFailureAttachments(data) {
                var defer = $q.defer();
                var promises = [];
                for (var ndx = 0; ndx < data.length; ndx++) {
                    var fileId = data[ndx].FileAttachment_Id_Id;
                    var iconId = data[ndx].IconAttachment_Id_Id;
                    promises.push(loadFile(fileId, iconId));
                }
                $q.all(promises).then(function () {
                    defer.resolve();
                });
                return defer.promise;
         }
    }
})();

(function () {
    "use strict";
    angular.module('siemens.simaticit.common.widgets.characteristicRepr')
        .directive('sitFailuresLegenda', failuresLegenda);

    function failuresLegenda() {
        return {
            template: "<div class='failures-legenda'><ul style='list-style:none'>" +
                "<li ng-repeat='option in options'><div style='padding: 8px' ><span class='badge'>{{option.count}}</span>" +
                "<div ng-style=\"{'background-color': option.color}\" " +
                "style='min-width:32px;width:32px;height:32px;display:inline-block;border:1px solid black;vertical-align:top;'>" +
                "&nbsp;</div>" +
                "<div style='display:inline-block;vertical-align:top;padding-left:16px;'><b>{{option.label}}</b><br>" +
                "<em>{{option.description}}</em></div></div>"+
                "<li></ul></div>",
            restrict: "E",
            scope: {
                options: "=?"
            }
        }
    }
})();

(function () {
    "use strict";
    angular.module('siemens.simaticit.common.widgets.characteristicRepr')
        .directive('sitImageGrid', imageGrid);

    function imageGrid() {
        return {
            templateUrl: "common/widgets/characteristicRepr/sit-image-grid-dir.html",
            controller: imageGridController,
            restrict: "E",
            controllerAs: "vm",
            scope: {},
            bindToController: {
                gheight: "=",
                gwidth: "=",
                uploaderid: "@",
                imageid: "@",
                onRegisterApi: "&",
                editable: "=",
                pointscolor: "=?"
            },
            link: {
                post: function postLink(scope, element, attrs, ctrl) {
                    if (!attrs.pointscolor) {
                        ctrl.pointscolor = "#c0c0c0";
                    }
                }
            }
        }
    }

    imageGridController.$inject = ["$document", "$scope", "$window"];

    function imageGridController($document, $scope, $window) {


        function isie11() {

            var ua = $window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
            {
                return true;
            }

            return false;
        }


        var vm = this;
        vm.strokecolor = "#000000";
        vm.points = [];
        vm.gid = "image_preview_canvas_" + $scope.$id;
        vm.drawingpoints = false;
        vm.gridRows = 0;
        vm.gridColumns = 0;
        vm.ctx = {};
        vm.canvas = {};
        vm.Radius = 5;

        function getFileUploader() {
            if (typeof XPathResult !== "undefined") {
                return $document[0] //NOSONAR
                    .evaluate("//sit-file-uploader[@sit-id='" + vm.uploaderid + "']/descendant::input[@type='file']",
                        $document[0],
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null).singleNodeValue;
            }
            else if ($("input[type='file']").length > 0) {
                return $("input[type='file']")[0];
            }
            else {
                return { files: [] };
            }
        }

        $scope.$on('common.widgets.containers.task-visible',  function (newVal, value) {
             activate();
        });

        function update(rows, columns) {
            var fileUploader = getFileUploader();
            vm.img = angular.element("#" + vm.imageid)[0];
            vm.canvas = angular.element("#" + vm.gid)[0];
            vm.ctx = vm.canvas.getContext("2d");
            vm.gridRows = rows;
            vm.gridColumns = columns;
            var file = fileUploader.files[0];
            if (file) {
                refresh(rows, columns);
            } else {
                load(rows, columns);
            }
        }

        function load(rows, columns) {
            vm.img = angular.element("#" + vm.imageid)[0];
            vm.canvas = angular.element("#" + vm.gid)[0];
            vm.ctx = vm.canvas.getContext("2d");
            vm.gridRows = rows;
            vm.gridColumns = columns;
            ImageLoad();
        }

        function ImageLoad() {
            vm.img.wrh = vm.img.naturalWidth / vm.img.naturalHeight;
            vm.img.width = vm.canvas.width;
            vm.img.height = vm.img.width / vm.img.wrh;
            if (vm.img.height > vm.canvas.height) {
                vm.img.height = vm.canvas.height;
                vm.img.width = vm.img.height * vm.img.wrh;
            }
            vm.img.posX = 0;
            vm.img.posY = 0;
            vm.drawImage();
        }


        $scope.$watch('vm.editable', function (newVal) {
            if (vm.editable) {
                if (vm.canvas.addEventListener) {
                    vm.canvas.addEventListener('click', addPointClick, false);
                }
            } else {
                if (vm.canvas.removeEventListener) {
                    vm.canvas.removeEventListener('click', addPointClick, false);
                }
            }
        });

        function refresh(rows, columns) {
            vm.gridRows = rows;
            vm.gridColumns = columns;
            vm.canvas = angular.element("#" + vm.gid)[0];

            if (vm.editable) {
                vm.canvas.addEventListener('click', addPointClick, false);
            }
            var fileUploader = getFileUploader();

            vm.img = new Image();
            if (vm.canvas) {

                vm.ctx = vm.canvas.getContext("2d");
                vm.canvas.height = vm.canvasHeight;
                vm.canvas.width = vm.canvasWidth;
                var file = fileUploader.files[0];
                var reader = new FileReader();
                if (file) {
                    reader.readAsDataURL(file);

                    reader.onload = function (e) {
                        vm.img.src = e.target.result;
                    }
                    vm.img.onload = function () {
                        ImageLoad();
                    }
                }
            }



        }
        vm.drawPoints = function () {
            if (vm.editable || vm.drawingpoints) {
                for (var p = 0; p < vm.points.length; p++) {
                    var x = vm.points[p].x;
                    var y = vm.points[p].y;
                    rescaleCoords(x, y, false);
                    x *= vm.img.width / vm.img.naturalWidth; //NOSONAR
                    y *= vm.img.height / vm.img.naturalHeight; //NOSONAR
                    x += vm.img.posX;  //NOSONAR
                    y += vm.img.posY;  //NOSONAR
                    vm.ctx.beginPath();
                    vm.ctx.arc(x, y, vm.Radius, 0, 2 * Math.PI, false);
                    vm.ctx.fillStyle = vm.points[p].color;
                    vm.ctx.fill();
                    vm.ctx.stroke();
                }
            }
        }


        vm.drawGrid = function () {
            if (vm.gridColumns <= 0 || vm.gridRows <= 0) {
                return;
            }
            vm.ctx.lineWidth = isie11()?0.5:0.1;
            var columns = vm.gridColumns;
            var rows = vm.gridRows;
            var columnSize = vm.img.width / columns;
            var rowSize = vm.img.height / rows;
            var errorMatrix = [];
            var i;
            var j;
            for (i = 0; i < errorMatrix.length; i++) {
                errorMatrix.push([]);
                for (j = 0; j < errorMatrix[i].length; j++) {
                    errorMatrix[i].push(0);
                }
            }

            for (i = 0; i < columns; i++) {
                for (j = 0; j < rows; j++) {
                    vm.ctx.beginPath();
                    vm.ctx.moveTo((i * columnSize) + vm.img.posX, vm.img.posY);
                    vm.ctx.lineTo((i * columnSize) + vm.img.posX, vm.img.height + vm.img.posY);

                    vm.ctx.strokeStyle = vm.strokecolor;
                    vm.ctx.stroke();

                    vm.ctx.beginPath();
                    vm.ctx.moveTo(vm.img.posX, (j * rowSize) + vm.img.posY);
                    vm.ctx.lineTo(vm.img.width + vm.img.posX, (j * rowSize) + vm.img.posY);

                    vm.ctx.strokeStyle = vm.strokecolor;
                    vm.ctx.stroke();
                }
            }
            vm.ctx.beginPath();
            vm.ctx.moveTo(vm.img.width + vm.img.posX, vm.img.posY);
            vm.ctx.lineTo(vm.img.width + vm.img.posX, vm.img.height + vm.img.posY);
            vm.ctx.strokeStyle = vm.strokecolor;
            vm.ctx.stroke();

            vm.ctx.beginPath();
            vm.ctx.moveTo(vm.img.posX, vm.img.height + vm.img.posY);
            vm.ctx.lineTo(vm.img.width + vm.img.posX, vm.img.height + vm.img.posY);
            vm.ctx.strokeStyle = vm.strokecolor;
            vm.ctx.stroke();
        }

        vm.drawImage = function () {
            vm.ctx.clearRect(0, 0, vm.canvas.width, vm.canvas.height);
            vm.ctx.drawImage(vm.img, vm.img.posX, vm.img.posY, vm.img.width, vm.img.height);
            vm.drawGrid();
            vm.drawPoints();
        }

        //realtoper -> real coordinates to percentage or viceversa
        function rescaleCoords(x, y, realtoper) {
            if (realtoper) {
                x = x * 100 / vm.canvas.width;
                y = y * 100 / vm.canvas.height;
            }
            else {
                x = x * vm.canvas.width / 100;
                y = y * vm.canvas.height / 100;
            }
        }

        function addPointClick(event) {
            var rect = vm.canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            x *= vm.img.naturalWidth / vm.img.width;
            y *= vm.img.naturalHeight / vm.img.height;

            x -= vm.img.posX * (vm.img.naturalWidth / vm.img.width);
            y -= vm.img.posY * (vm.img.naturalHeight / vm.img.height);

            rescaleCoords(x, y, true);

            var point = {
                x: x,
                y: y,
                color: vm.pointscolor
            };
            if (vm.editable && (x / vm.img.naturalWidth) <= 1 && (y / vm.img.naturalHeight) <= 1) {
                vm.points.push(point);
                _.each(vm.Listeners,
                    function (item) {
                        (item)(point);
                    });
            }

            vm.drawImage();
        }

        function clear() {
            vm.img = null;
            vm.ctx.clearRect(0, 0, vm.canvas.width, vm.canvas.height);
        }

        function cleanPoints() {
            vm.points = [];
        }

        function getPoints() {
            return vm.points;
        }

        function setPoints(point) {
            if (!_.contains(vm.points, point)) {
                vm.points.push(point);
            }

        }

        function redrawPoints(redraw) {
            vm.drawingpoints = redraw;
        }

        function drawImage() {
            vm.drawImage();
        }

        vm.Listeners = [];

        function addListener(callback) {
            if (typeof callback !== 'function') {
                return;
            }

            if (!_.contains(vm.Listeners, callback)) {
                vm.Listeners.push(callback);
            }
        }


        function removeListener(callback) {
            if (_.contains(vm.Listeners, callback)) {
                var idx = vm.Listeners.indexOf(callback);
                vm.Listeners.splice(idx, 1);
            }
        }

        function activate() {
            vm.strokecolor = "#000000";
            vm.points = [];
            vm.drawingpoints = false;
            vm.gridRows = 0;
            vm.gridColumns = 0;
            vm.ctx = {};
            vm.canvas = {};
            vm.canvasHeight = vm.gheight || 200;
            vm.canvasWidth = vm.gwidth || 320;
            vm.api = {
                clear: clear,
                refresh: refresh,
                load: load,
                update: update,
                setPoints: setPoints,
                redrawPoints:redrawPoints,
                drawImage:drawImage,
                getpoints: getPoints,
                cleanpoints: cleanPoints,
                addPointClickedListener: addListener,
                removePointClickedListener: removeListener
            }
            vm.onRegisterApi({ api: vm.api });
        }

        activate();

    }
})();
