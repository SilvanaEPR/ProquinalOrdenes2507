/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
  * @ngdoc module
  * @name siemens.simaticit.common.widgets.fileUpload
  * @description This module provides functionalities to select files and upload or remove uploaded files.
  */
    angular.module('siemens.simaticit.common.widgets.fileUpload', []);

})();

(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name sitFileUploader
    * @module siemens.simaticit.common.widgets.fileUpload
    * @description
    * The **File uploader** widget can be configured as either single or multiple **File uploader**:
    * The **File uploader** widget allows the user to select a file, read the contents and store it in an object exposing:
    * * the name of the file
    * * the contents (base64-encoded) of the file
    * * the content type of the file
    *
    * In case of multiple **File uploader** it stores the data in array of objects.
    *
    * @usage
    * As an element:
    * ```
    *     <sit-file-uploader sit-value="vm.currentItem"
                       accept="'image/*,video/*,audio/*,application/x-zip-compressed,application/octet-stream'"
                       sit-min-size="'1KB'"
                       sit-max-size="'10MB'"
                       sit-validation="{required: true}">
            File 1
         </sit-file-uploader>
    * ```
    * @restrict E
    *
    * @param {Object} sit-value Object to which the uploaded file's data will be stored.
    * @param {String} [accept="'image/*,video/*,audio/*,application/x-zip-compressed'"] List of comma separated values representing MIME types.
    * @param {String} sit-min-size Minimum size of the file.
    * @param {Number} sit-max-size Maximum file size allowed. It can support upto 50MB.
    * @param {boolean} sit-read-as-text _(Optional)_ If true specifies, that the file must be read as text.
    * @param {ValidationModel} sit-validation See {@link ValidationModel}.
    * @param {string} [sit-change] _(Optional)_ An expression to evaluate on change of value.
    * @param {string} [ng-disabled] _(Optional)_ If this expression is truthy, the element will be disabled.
    * @param {string} [ng-readonly] _(Optional)_ If this expression is truthy, the element will be set as read-only.
    * @param {string} [sit-multiple-files] _(Optional)_ If this expression is truthy, the element will be set as multiple file uploader.
    * @param {Number} [sit-max-limit] _(Optional)_ An option to set the Maximum Number of files to be uploaded, in case the field is empty default value set to 5.
    *
    * @example
    * In a view template, the **sit-file-uploader** directive is used as follows:
    *
    * ```
    *  <sit-file-uploader sit-value="vm.currentItem"
                       accept="'image/*,video/*,audio/*,application/x-zip-compressed'"
                       sit-min-size="'1KB'"
                       sit-max-size="'10MB'"
                       sit-validation="{required: true}">
            File 1
         </sit-file-uploader>
    * ```
    * Note that:
    *
    *   * If the name of the selected file is too long, then the file name is ellipsed and the complete file name is shown in the tooltip.
    *   * However the text length in the tooltip is restricted to around 80 characters, depending upon the browser.
    *
    */
    angular.module('siemens.simaticit.common.widgets.fileUpload').directive('sitFileUploader', ['$rootScope', '$window', '$document', '$translate', '$timeout','common.services.swac.SwacUiModuleManager', FileUploader]);
    function FileUploader($rootScope, $window, $document, $translate, $timeout,swacManager) {
        return {
            restrict: 'E',
            replace: false,
            scope: {},
            transclude: true,
            controller: FileUploaderController,
            controllerAs: 'uploadCtrl',
            bindToController: {
                readOnly: '=sitReadOnly',
                value: '=sitValue',
                accept: '=?accept',
                minSize: '=?sitMinSize',
                maxSize: '=?sitMaxSize',
                maxLimit: '=?sitMaxLimit',
                readAsText: '=?sitReadAsText',
                validation: '=sitValidation',
                sitChange: '=?',
                ngDisabled: '=?',
                ngReadonly: '=?',
                sitMultipleFiles: '=?sitMultipleFiles'
            },
            templateUrl: 'common/widgets/fileUpload/file-upload.html',
            compile: compile
        }

        function compile(element, attributes) {
            if (attributes.sitMultipleFiles) {
                $('input[data-internal-type="fileInput"]', element).attr("multiple", "multiple");
                $('input[data-internal-type="fileStatus"]', element).attr("title", "{{uploadCtrl.uploadedFile.name}}");
            }
            return {
                post: postLink
            }
        }

        function postLink(scope, element, attrs, ctrl) {
            ctrl.uploadedFile = '';
            ctrl.multipleFiles = [];
            ctrl.filesBuffer = 0;
            var minFileSize = "0KB";
            var maxFileSize = "50MB";
            var defaultMaxSizeInBytes = getSizeInBytes(maxFileSize);
           
            ctrl.domElement = {
                inputButton: $('input[data-internal-type="fileInput"]', element)[0],
                uploadButton: $('a[data-internal-type="uploadButton"]', element)[0],
                showStatus: $('input[data-internal-type="fileStatus"]', element)[0]
            };

            var dialogPromise;

            if (swacManager.enabled) {
                swacManager.eventBusServicePromise.promise.then(function (eventBusSvc) {
                    dialogPromise = eventBusSvc;
                });
            }
            //identify tablet device
            function tabletCheck() {
                var check = false;
                (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a)) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
                return check;
            }
            var isTabletDevice = tabletCheck();
            ctrl.domElement.uploadButton.addEventListener("click", onUploadButtonClick);
            function onUploadButtonClick() {
                ctrl.domElement.inputButton.click();
                if (isTabletDevice) {
                    return null;
                }
                if (swacManager.enabled) {
                        dialogPromise && dialogPromise.publish('modal.overlay.show', {
                            style: {
                                'z-index': 101,
                                'opacity': 0.75,
                                'background': 'rgba(0,0,0,0.75)'
                            },
                            animationWaitTime: 0
                        });
                }
                else {
                    var blur = angular.element("<div class='blur'></div>");
                    var body = angular.element(document).find('body').eq(0);
                    body.append(blur)
                }

                $document.on('focusin', function (e) {
                    if (swacManager.enabled) {
                        //publishing the event twice because the mom-ui modal overlay will not be hidden when published once
                        //this issue to be fixed by mom-ui team
                        dialogPromise && dialogPromise.publish('modal.overlay.hide');
                        dialogPromise && dialogPromise.publish('modal.overlay.hide');
                    }
                    else {
                        var elem = document.getElementsByClassName("blur")[0];
                        elem && elem.remove();
                    }
                });

            }

            function initValidation() {
                ctrl.isError = false;
                ctrl.isValidType = false;
                ctrl.isValidSize = false;
                ctrl.isFileLoaded = false;
                ctrl.isValidLimit = false;
            }

            ctrl.domElement.inputButton.onchange = (function () {
                if (ctrl.domElement.inputButton) {
                    if (ctrl.sitMultipleFiles) {
                        ctrl.filesBuffer = ctrl.domElement.inputButton.files.length;
                        if (!ctrl.filesBuffer) {
                            return;
                        }
                        ctrl.multipleFiles = [];
                        ctrl.isError = false;
                        ctrl.value = [];
                        ctrl.fileNames = [];
                        var i = 0;
                        while (i < ctrl.filesBuffer) {
                            ctrl.fileUploadHandler(ctrl.domElement.inputButton.files[i]);
                            if (ctrl.isError) {
                                break;
                            } else {
                                i++;
                            }

                        }
                    } else {
                        ctrl.fileUploadHandler(ctrl.domElement.inputButton.files[0]);
                       
                    }
                }
            })

            function formValidation(ngModel) {
                if (!ctrl.isValidType) {
                    ngModel.$setValidity('fileForm', false);
                    ngModel.$setValidity('required', true);
                    ctrl.validation.patternInfo = $translate.instant('fileUploader.error.fileType');
                } else if (!ctrl.isValidSize) {
                    ngModel.$setValidity('fileForm', false);
                    ngModel.$setValidity('required', true);
                    ctrl.validation.patternInfo = $translate.instant('fileUploader.error.fileSize', { maxSize: ctrl.maxSize, minSize: ctrl.minSize });
                } else if (!ctrl.isValidLimit) {
                    ngModel.$setValidity('fileForm', false);
                    ngModel.$setValidity('required', true);
                    ctrl.validation.patternInfo = $translate.instant('fileUploader.error.fileLimit', { maxLimit: ctrl.maxLimit });
                } else {
                    ngModel.$setValidity('fileForm', true);
                }
                //setting  dirty to triggern warning icon for untouched file upload
                if (!ngModel.$dirty) {
                    ngModel.$setDirty(true);
                }
                //Auto display warning notification
                $timeout(function () {
                    element.find('div[data-internal-type=formWarning] i').triggerHandler('mousedown');
                }, 0, false);
            }

            function isSiemensFileSupport(file) {
                if (file.type !== "") {
                    return false;
                }

                var siemensFileFormts = ["plmx", "jt"];
                var fileFormat = file.name.split(".").pop();
                return siemensFileFormts.find(function (format) {
                    if (format === fileFormat) return true;
                });
            }

            ctrl.fileUploadHandler = function (fileObj) {
                if (undefined !== fileObj && null !== fileObj) {
                    initValidation();
                    if (ctrl.accept && ctrl.validation.required) {
                        ctrl.isValidType = isValidFileType(fileObj);
                    }
                    else {
                        ctrl.isValidType = true;
                    }

                    ctrl.isValidSize = isFileSizeValid(fileObj);

                    ctrl.isValidLimit = (ctrl.maxLimit >= ctrl.filesBuffer) ? true : false;

                    formValidation(scope.fileForm.$$controls[0]);

                    if (ctrl.isValidSize && ctrl.isValidType && ctrl.isValidLimit) {
                        ctrl.reader = new $window.FileReader();
                        ctrl.addEvents(ctrl.reader);
                        ctrl.reader.fileName = fileObj.name;
                        ctrl.reader.fileType = isSiemensFileSupport(fileObj) ? "application/octet-stream" : fileObj.type;
                        (ctrl.readAsText) ? (ctrl.reader.readAsText(fileObj)) : (ctrl.reader.readAsDataURL(fileObj));
                        ctrl.multipleFiles.push(fileObj);
                        if (ctrl.sitMultipleFiles && ctrl.multipleFiles.length > 1) {
                            ctrl.selectedFile = $translate.instant('fileUploader.multipleFile');

                        } else {
                            ctrl.selectedFile = fileObj.name;
                        }
                        scope.$apply();
                    }
                    else {
                        ctrl.isError = true;
                        ctrl.isFileLoaded = false;
                        ctrl.selectedFile = $translate.instant('fileUploader.noFile');
                        ctrl.uploadedFile = '';
                        ctrl.fileNames = [];
                        ctrl.multipleFiles = [];
                        $rootScope.$broadcast(ctrl.broadcastEvents.uploaderError);
                        scope.$apply();
                    }
                }
            }

            function canUploadFile(currentFileType, selectedFileInfo) {
                var canUpload = false;
                // checking if there is no restriction on the submedia type ( eg : image/* should allow all image files like .png,.jpg etc)
                var allSubMediaAllowed = (currentFileType.slice(-1) === '*');
                if (allSubMediaAllowed) {
                    var currentMediaType = currentFileType.substring(0, currentFileType.lastIndexOf('/'))
                    // Incase of accept='image/*' and the selected file info from browser does not supply 'mediaType', we should ensure user can still upload the file.
                    if (selectedFileInfo.mediaType === currentMediaType || selectedFileInfo.mediaType === "") {
                        canUpload = true;
                    }
                } else {
                    var subMediaMatched = currentFileType.slice(-selectedFileInfo.subMediaType.length) === selectedFileInfo.subMediaType;
                    var fileExtensionMatched;
                    if (!subMediaMatched) {
                        fileExtensionMatched = currentFileType.slice(-selectedFileInfo.fileNameExtension.length) === selectedFileInfo.fileNameExtension;
                    }
                    if (subMediaMatched || fileExtensionMatched) {
                        canUpload = true;
                    }
                }
                return canUpload;
            }

            function isValidFileType(file) {
                var validFile = false;
                var allowedMediaTypes = ctrl.accept.replace(/ +/g, "").toLowerCase().split(',');// to remove all white spaces and convert to lower case and split
                var selectedFileType = isSiemensFileSupport(file) ? "application/octet-stream" : file.type;
                var selectedFileName = file.name;
                var selectedFileInfo = {
                    subMediaType: selectedFileType.substring(selectedFileType.lastIndexOf("/") + 1),
                    mediaType: selectedFileType.substring(0, selectedFileType.lastIndexOf('/')),
                    fileNameExtension: selectedFileName.substring(selectedFileName.lastIndexOf(".") + 1)
                }
                for (var i = 0; i < allowedMediaTypes.length; i++) {
                    var currentFileType = "";
                    currentFileType = allowedMediaTypes[i];
                    validFile = canUploadFile(currentFileType, selectedFileInfo);
                    if (validFile) {
                        break;
                    }
                }
                return validFile;
            }

            function isFileSizeValid(file) {
                if (file.size > defaultMaxSizeInBytes) {
                    return false;
                }

                validateSizes();
                var minSizeInBytes = getSizeInBytes(ctrl.minSize);
                var maxSizeInBytes = getSizeInBytes(ctrl.maxSize);

                return file.size >= minSizeInBytes && file.size <= maxSizeInBytes;
            }

            function validateSizes() {
                var pattern = new RegExp("^[0-9]+[KMGT]B");
                if ((undefined === ctrl.minSize) || (false === pattern.test(ctrl.minSize))) {
                    ctrl.logErrorFn("Minimum size specified is invalid - ", ctrl.minSize);
                    ctrl.minSize = minFileSize;
                }

                if (((undefined === ctrl.maxSize) || (false === pattern.test(ctrl.maxSize)))) {
                    ctrl.logErrorFn("Maximum size specified is invalid - ", ctrl.maxSize);
                    ctrl.maxSize = maxFileSize;
                }
            }

            function getSizeInBytes(fileSize) {
                var size, unit, actualSize;
                var bytesPerKB = 1024;
                size = parseInt(fileSize, 10);
                unit = fileSize.slice(-2);
                for (var i = 0; i < ctrl.fileSizes.length; i++) {
                    if (unit === ctrl.fileSizes[i]) {
                        actualSize = size * Math.pow(bytesPerKB, i + 1)
                    }
                }
                return actualSize;
            }

            ctrl.removeFile = function (event) {
                ctrl.uploadedFile = '';
                ctrl.fileNames = [];
                $(event.target).parents('.uploadSection').find('.File').val('');
                if (ctrl.sitMultipleFiles) {
                    ctrl.value = [];
                } else {
                    ctrl.value.name = '';
                    ctrl.value.type = '';
                    ctrl.value.contents = '';
                }
                ctrl.selectedFile = $translate.instant('fileUploader.noFile');
                ctrl.isFileLoaded = false;
                $rootScope.$broadcast('sit-file-uploader-file-removed');
            }

            scope.$on('$destroy', function () {
                ctrl.domElement.uploadButton.removeEventListener("click", onUploadButtonClick);
            });

        }

    }

    FileUploaderController.$inject = ['$rootScope', '$scope', 'common', '$translate', '$timeout', '$element'];
    function FileUploaderController($rootScope, scope, common, $translate, $timeout, $element) {
        var vm = this;
        var customValidation = null;
        vm.selectedFile = $translate.instant('fileUploader.noFile');
        vm.isFileLoaded = false;
        vm.isError = false;
        vm.currentPercentage = '';
        vm.fileNames = [];
        vm.broadcastEvents = {
            uploaderSuccess: 'sit-file-uploader-success',
            uploaderError: 'sit-file-uploader-error'
        };
        vm.fileSizes = ["KB", "MB", "GB"] // Contents of the array must be in the increasing order of their size
        vm.accept = vm.accept ? vm.accept : 'image/*,video/*,audio/*,application/x-zip-compressed,application/octet-stream';
        vm.maxLimit = vm.maxLimit ? vm.maxLimit : 5;
        if (vm.validation) {
            !vm.validation.hasOwnProperty("required") && angular.extend(vm.validation, { required: false });
        } else {
            vm.validation = { required: false };
        }

        if (vm.sitMultipleFiles) {
            vm.value = (vm.value && vm.value.constructor === Array) ? vm.value : [];
        }

        if (typeof vm.validation.custom === 'function') {
            customValidation = vm.validation.custom;
            vm.validation.custom = fileuploadValidation;
        } else {
            angular.extend(vm.validation, {
                custom: fileuploadValidation
            });
        }

        function fileuploadValidation(value, ngModel) {
            customValidation && customValidation(value, ngModel);
            $timeout(function () {
                $element.find('div[data-internal-type=formWarning] i').triggerHandler('mousedown');
            }, 0, false);
            return ngModel;
        }

        vm.deleteAction = {
            path: 'common/icons/cmdClosePanel24.svg'
        };
        vm.addEvents = function (fileReader) {
            fileReader.onload = function () {
                vm.isFileLoaded = true;
                scope.$apply();
            }

            fileReader.onprogress = function (event) {
                if (event.lengthComputable) {
                    vm.currentPercentage = parseInt(((event.loaded * 100) / event.total), 10) + '%';
                    scope.$apply();
                }
            }

            fileReader.onloadend = vm.reader.onabort = function (event) {
                vm.currentPercentage = '';
                var payload = (vm.readAsText) ? (event.target.result) : (event.target.result.substr(event.target.result.lastIndexOf(',') + 1));
                if (vm.sitMultipleFiles) {
                    var file = {};
                    file["name"] = event.target.fileName;
                    file["type"] = event.target.fileType;
                    file["contents"] = payload;
                    vm.value.push(file);
                    vm.fileNames.push(event.target.fileName);
                    if (vm.filesBuffer === vm.value.length) {
                        vm.uploadedFile = vm.fileNames;
                        scope.$apply();
                        $rootScope.$broadcast(vm.broadcastEvents.uploaderSuccess);
                    }


                } else {
                    if (!vm.value) {
                        vm.value = {
                            name: event.target.fileName,
                            type: event.target.fileType,
                            contents: payload
                        };
                    } else {
                        vm.value.name = event.target.fileName;
                        vm.value.type = event.target.fileType;
                        vm.value.contents = payload;
                    }
                    vm.uploadedFile = event.target.fileName;
                    scope.$apply();
                    $rootScope.$broadcast(vm.broadcastEvents.uploaderSuccess);
                }
            }

            fileReader.onerror = function () {
                vm.currentPercentage = '';
                vm.uploadedFile = '';
                vm.fileNames = [];
                vm.isError = true;
                vm.selectedFile = $translate.instant('fileUploader.error.readError');
                scope.$apply();
                $rootScope.$broadcast(vm.broadcastEvents.uploaderError);
            }
        }

        vm.logErrorFn = function (message, attributes) {
            common.logger.logError(message, attributes, 'siemens.simaticit.common.widgets.fileUpload');
        };
    }
})();
