/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.documentViewer
    * @description
    * This module provides functionalities related to document viewer.
    */
    angular.module('siemens.simaticit.common.widgets.documentViewer', []);
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitImageViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: ImageViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/image/image-viewer.html'
        });

    ImageViewerController.$inject = ['$scope', '$timeout', 'common.services.swac.SwacUiModuleManager'];

    function ImageViewerController($scope, $timeout, swacUiModuleManager) {

        var vm = this;

        var imageViewerPromise;
        if (swacUiModuleManager.enabled) {
            swacUiModuleManager.eventBusServicePromise.promise.then(function (service) {
                imageViewerPromise = service;
                service.event.subscribe(function (event) {
                    if (event.data.topic === 'locationChange') {
                        closeFullScreen();
                        $('#document-viewer-full-screen-image').remove();
                    }
                });
            });
        }

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            checkToConvertData(vm.source);
            registerEvents();
        };

        function checkToConvertData(data) {
            vm.imageData = data;
            if (!vm.parent.isBase64(data)) {
                vm.imageData = "data:image/png;base64," + vm.parent.convertToBase64(data);
            }
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }
        }

        function showFullScreen() {
            vm.isImageFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-image').appendTo("body");
            }, 0, false);
            if (swacUiModuleManager.enabled) {
                imageViewerPromise && imageViewerPromise.publish('modal.overlay.show', {
                    style: {
                        'z-index': 99,
                        'background': "rgba(0, 0, 0, 0.25) 50% 50% no-repeat"
                    },
                    animationWaitTime: 0
                });

                // inform container to show the component from fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.showFullScreen();
                });
            }
        }

        function closeFullScreen() {
            $('#document-viewer-full-screen-image').on('click', function () {
                $(this).remove();
            });
            if (swacUiModuleManager.enabled) {
                imageViewerPromise && imageViewerPromise.publish('modal.overlay.hide');

                // inform container to close the component from fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.closeFullScreen();
                });
            }
            vm.isImageFullScreenMode = false;
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('imageMaximise', showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    checkToConvertData(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            vm = null;
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitPdfViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '<sitConfig'
            },
            controller: PdfViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/pdf/pdf-viewer.html'
        });

    PdfViewerController.$inject = ['$scope', '$element', '$timeout', '$window', 'common.services.swac.SwacUiModuleManager'];

    function PdfViewerController($scope, element, $timeout, $window, swacUiModuleManager) {

        var vm = this;
        var BASE64_MARKER = ';base64,';
        var timer;
        var timerOnResize;
        var fullscreenTimeout;
        var options = {
            isSinglePage: false,
            isFitPageWidth: false
        };

        var pdfViewerPromise;
        if (swacUiModuleManager.enabled) {
            swacUiModuleManager.eventBusServicePromise.promise.then(function (service) {
                pdfViewerPromise = service;
            });
        }

        vm.$onInit = function () {
            vm.pdfReference = $window.PDFJS;
            $window.PDFJS.cMapUrl = 'common/scripts/pdfjs/cmaps/';
            $window.PDFJS.cMapPacked = true;
            vm.pdfDocument = null;
            vm.eventListner = [];
            vm.DEFAULT_SCALE = 1;
            vm.getPdfDocument = getPdfDocument;
            vm.setPdfLayout = setPdfLayout;
            vm.setLayout = setLayout;
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            vm.isFullScreenMode = false;
            vm.viewerName = "viewer_" + $scope.$id;
            vm.renderInProgress = false;
            vm.PagesToRender = 20;
            vm.renderCycleOnScroll = 1;
            vm.renderCycle = 2;
            vm.viewerEvents = {
                loaded: 'pdf-fullscreen-viewer-loaded' + vm.viewerName,
                closed: 'pdf-full-screen-closed' + vm.viewerName,
                open: 'pdf-fullscreen-viewer-open' + vm.viewerName
            };
            registerEvents();

            if (vm.config.plugins && vm.config.plugins.length > 0) {
                var index = _.findIndex(vm.config.plugins, {
                    'format': 'pdf'
                });
                if (index >= 0 && vm.config.plugins[index].options) {
                    options = $.extend(options, vm.config.plugins[index].options);
                }
            }
        };

        vm.$postLink = function () {
            vm.setPdfLayout();
        };

        function getPdfDocument() {
        vm.renderInProgress = false;
            if (!vm.parent.isBase64(vm.source)) {
                vm.inputData = vm.parent.convertToBase64(vm.source);
                vm.source = "data:application/pdf;base64," + vm.inputData;
            }
            vm.sourceUrl = convertDataURIToBinary(vm.source);
            //clearing the canvas to display new requested pdf files
            vm.pdfReference.getDocument(vm.sourceUrl).promise.then(function (pdfDocs) {
                if (vm.pdfDocument) {
                    vm.pdfDocument.cleanup();
                    vm.pdfDocument.destroy();
                }
                vm.pdfDocument = pdfDocs;
                renderAllPages();
            });
        }

        function renderAllPages() {
            if (vm.renderInProgress) {
                return;
            }
            if (vm.pdfDocument) {
                vm.renderInProgress = true;
                var parentViewer = element.find('.pdf-viewer')[0];
                while (parentViewer.hasChildNodes()) {
                    parentViewer.removeChild(parentViewer.firstChild);
                }

                if (!parentViewer.hasChildNodes()) {
                    vm.totalPages = vm.pdfDocument.numPages;
                    vm.currentDoc = vm.pdfDocument.pdfInfo.fingerprint;
                    var num = 1;
                    vm.parent.isPdfPageRendering = true;
                    vm.renderCycleOnScroll = 1;
                    vm.renderCycle = 2;
                    renderPage(num, vm.PagesToRender, vm.currentDoc);
                }
            }
        }

        function renderPage(num, pagesToRender, currentDoc) {
            if (num > pagesToRender || vm.currentDoc !== currentDoc) {
                vm.parent.isPdfPageRendering = false;
                vm.renderInProgress = false;
                return;
            }

            // Using promise to fetch the page
            if (num <= pagesToRender && vm.parent.isPdfPageRendering) {
                if (num > vm.totalPages) {
                    return;
                }

                vm.pdfDocument.getPage(num).then(function (page) {
                    var canvasId = 'pdf-viewer-' + num;
                    var canvas = document.getElementById(canvasId);
                    element.find('.pdf-viewer').append($('<canvas/>', { 'id': canvasId }));
                    canvas = element.find('#' + canvasId)[0];
                    fitPages(canvas, page);
                    renderPage(num + 1, pagesToRender, currentDoc);
                });
            } else {
                vm.renderInProgress = false;
            }
        }

        //To fit single or multiple pages based on the config
        function fitPages(canvas, page) {
            var V_PADDING = 5;
            var SCROLL_WIDTH = 18;
            var pageWidthScale;
            var docViewerContainer = element.parents().find('.doc-content')[0];
            var pageHeightScale = (docViewerContainer.clientHeight - V_PADDING) / page.pageInfo.view[3] * vm.DEFAULT_SCALE;

            if (options.isSinglePage) {
                if (options.isFitPageWidth) {
                    pageHeightScale = docViewerContainer.clientHeight;
                    pageWidthScale = (docViewerContainer.clientWidth - SCROLL_WIDTH) / page.pageInfo.view[2] * vm.DEFAULT_SCALE;
                } else {
                    pageWidthScale = docViewerContainer.clientWidth;
                }

                var calculateScale = Math.min(pageWidthScale, pageHeightScale);
                var viewport = page.getViewport(calculateScale);

                var pdfViewer = element.find('.pdf-viewer');
                pdfViewer.css('width', viewport.width + 'px');
            } else {
                pageWidthScale = (docViewerContainer.clientWidth) / page.pageInfo.view[2] * vm.DEFAULT_SCALE;
                calculateScale = Math.min(pageWidthScale, pageHeightScale);
                viewport = page.getViewport(calculateScale);
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            vm.renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };

            page.render(vm.renderContext);
        }

        //To render pages on scroll event
        function renderPagesOnScroll(event) {
            var scrollHeight = event.target.scrollHeight;
            var containerHeight = event.target.offsetHeight;
            var trackLength = scrollHeight - containerHeight;
            var scrollTop = event.target.scrollTop;
            var scrollPercentage = Math.floor(scrollTop / trackLength * 100);

            if (scrollPercentage > 98) {
                vm.parent.isPdfPageRendering = true;
                renderPage(vm.renderCycleOnScroll * vm.PagesToRender + 1, vm.renderCycle * vm.PagesToRender, vm.currentDoc);
                vm.renderCycle++;
                vm.renderCycleOnScroll++;
            }
        }

        function setPdfLayout() {
            if (vm.isFullScreenMode) {
                return;
            }
            timer = $timeout(function () {
                vm.setLayout();
                vm.getPdfDocument();
            }, 0, false);
        }

        function renderOnResize() {
            timerOnResize = $timeout(function () {
                vm.setLayout();
                renderAllPages();
            }, 0, false);
        }

        function setLayout() {
            var pdfCanvas = element.find('.pdf-canvas');
            var docViewerContainer = element[0];
            if (docViewerContainer) {
                pdfCanvas.css('height', docViewerContainer.clientHeight + 'px');
                pdfCanvas.css('width', docViewerContainer.clientWidth + 'px');
            }
        }

        function convertDataURIToBinary(dataURI) {
            var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
            var base64 = dataURI.substring(base64Index);
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new window.Uint8Array(new window.ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        }

        //$scope.$id
        function onPDFFullScreenLoaded() {
            window.setTimeout(function () {
                if ((navigator.userAgent.indexOf('MSIE') !== -1) || (!!document.documentMode)) {
                    var event = document.createEvent("Event");
                    event.initEvent(vm.viewerEvents.open, false, true);
                    event.detail = {
                        source: vm.sourceUrl
                    };
                    window.document.dispatchEvent(event);
                } else {
                    window.document.dispatchEvent(new CustomEvent(vm.viewerEvents.open, {
                        detail: {
                            source: vm.sourceUrl
                        }
                    }, false));
                }
            }, 500);
        }

        function showFullScreen() {
            vm.isFullScreenMode = true;
            if (swacUiModuleManager.enabled) {
                pdfViewerPromise && pdfViewerPromise.publish('modal.overlay.show', {
                    style: {
                        'z-index': 99,
                        'background': "rgba(0, 0, 0, 0.25) 50% 50% no-repeat"
                    },
                    animationWaitTime: 0
                });

                // inform container to show the component from fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.showFullScreen();
                });
            }
        }

        function closeFullScreen() {
            $timeout(function () {
                vm.isFullScreenMode = false;
                if (swacUiModuleManager.enabled) {
                    pdfViewerPromise && pdfViewerPromise.publish('modal.overlay.hide');

                    // inform container to close the component from fullscreen mode
                    swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                        service.closeFullScreen();
                    });
                }
            }, 0);
        }

        vm.$onChanges = function (changes) {
            if (changes.source && !changes.source.isFirstChange()) {
                vm.setPdfLayout();
                if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                    $scope.$apply();
                }
            }
        };

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('sit-layout-change', renderOnResize);
            vm.eventListner[vm.eventListner.length] = $scope.$on('pdfMaximise', showFullScreen);
            window.document.addEventListener(vm.viewerEvents.closed, closeFullScreen, false);
            window.document.addEventListener(vm.viewerEvents.loaded, onPDFFullScreenLoaded);
            var pdfCanvas = element.find('.pdf-canvas');
            $(pdfCanvas).bind('scroll', renderPagesOnScroll);
        }

        vm.$onDestroy = function () {
            vm.source = null;
            vm.sourceUrl = null;
            vm.pdfReference = null;
            vm.renderContext = null;
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            $timeout.cancel(timer);
            $timeout.cancel(timerOnResize);
            $timeout.cancel(fullscreenTimeout);
            window.document.removeEventListener(vm.viewerEvents.closed, closeFullScreen, false);
            window.document.removeEventListener(vm.viewerEvents.loaded, onPDFFullScreenLoaded);
            var pdfCanvas = element.find('.pdf-canvas');
            $(pdfCanvas).unbind('scroll', renderPagesOnScroll);
            vm.pdfDocument.destroy();
            vm = null;
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitTextViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: TextViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/text/text-viewer.html'
        });

    TextViewerController.$inject = ['$scope', '$timeout', 'common.services.swac.SwacUiModuleManager'];

    function TextViewerController($scope, $timeout, swacUiModuleManager) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            checkToConvertData(vm.source);
            registerEvents();
        };

        function checkToConvertData(data) {
            vm.inputData = data;
            if (!vm.parent.isBase64(data)) {
                vm.inputData = "data:text/plain;base64," + vm.parent.convertToBase64(data);
            }
            dataToText(vm.inputData);

            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }
        }

        function dataToText(data) {
            vm.textContent = data.replace('data:text/plain;base64,', '');
            vm.textData = base64DecodeUnicode(vm.textContent);
        }

        function base64DecodeUnicode(string) {
            // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
            var percentEncodedString = atob(string).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('');

            return decodeURIComponent(percentEncodedString);
        }

        function showFullScreen() {
            vm.istextFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-text').appendTo("body");
            }, 0, false);

            if (swacUiModuleManager.enabled) {
                // inform container to show the component in fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.showFullScreen();
                });
            }
        }

        function closeFullScreen() {
            $('#document-viewer-full-screen-text').on('click', function () {
                $(this).remove();
            });
            vm.istextFullScreenMode = false;

            if (swacUiModuleManager.enabled) {
                // inform container to close the component from fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.closeFullScreen();
                });
            }
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on("textMaximise", showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    checkToConvertData(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            vm = null;
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').filter('textLineBreak', function () {
        return function (input) {
            return input.replace(/\n/g, '<br />');
        };
    });

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitVectorViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: VectorViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/vector/vector-viewer.html'
        });

    VectorViewerController.$inject = ['$scope', '$sce', '$timeout', 'common.services.swac.SwacUiModuleManager'];

    function VectorViewerController($scope, $sce, $timeout, swacUiModuleManager) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.isVectorFullScreenMode = false;
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            checkToConvertData(vm.source);
            registerEvents();
        };

        function checkToConvertData(data) {
            vm.inputData = data;
            if (!vm.parent.isBase64(data)) {
                vm.inputData = "data:image/svg+xml;base64," + vm.parent.convertToBase64(data);
            }

            dataToSvg(vm.inputData);
        }

        function dataToSvg(data) {
            vm.svgContent = data.replace('data:image/svg+xml;base64,', '');
            vm.svgData = atob(vm.svgContent);
            vm.finalSVG = $sce.trustAsHtml(vm.svgData);
        }

        function showFullScreen() {
            vm.isVectorFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-svg').appendTo("body");
            }, 0, false);

            if (swacUiModuleManager.enabled) {
                // inform container to show the component in fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.showFullScreen();
                });
            }
        }
        function closeFullScreen() {
            $('#document-viewer-full-screen-svg').remove();
            vm.isVectorFullScreenMode = false;

            if (swacUiModuleManager.enabled) {
                // inform container to close the component from fullscreen mode
                swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                    service.closeFullScreen();
                });
            }
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('svgMaximise', showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    checkToConvertData(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            vm = null;
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitVideoViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: VideoViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/video/video-viewer.html'
        }).
        filter("trustUrl", ['$sce', function ($sce) {
            return function (url) {
                return $sce.trustAsResourceUrl(url);
            };
        }]);

    VideoViewerController.$inject = ['$scope', 'common.services.swac.SwacUiModuleManager'];

    function VideoViewerController($scope, swacUiModuleManager) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            checkToConvertData(vm.source);
            registerEvents();
        };

        function checkToConvertData(data) {
            vm.videoData = data;
            if (!vm.parent.isBase64(data)) {
                vm.videoData = "data:video/mp4;base64," + vm.parent.convertToBase64(data);
            }
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }
        }

        function showFullScreen() {
            var videoElement = document.getElementById("video-element");
            var isInFullScreen;
            document.fullscreenElement !== undefined && (isInFullScreen = document.fullscreenElement === null ? false : true);
            document.msFullscreenElement !== undefined && (isInFullScreen = document.msFullscreenElement);

            if (videoElement && !isInFullScreen) {
                videoElement.requestFullscreen && videoElement.requestFullscreen();
                videoElement.msRequestFullscreen && videoElement.msRequestFullscreen();

                if (swacUiModuleManager.enabled && videoElement.requestFullscreen) {
                    // inform container to show the component in fullscreen mode
                    swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                        service.showFullScreen();
                    });
                }
            } else {
                document.exitFullscreen && document.exitFullscreen();
                document.msExitFullscreen && document.msExitFullscreen();

                if (swacUiModuleManager.enabled && document.exitFullscreen) {
                    // inform container to show the component in fullscreen mode
                    swacUiModuleManager.displayServicePromise.promise.then(function (service) {
                        service.closeFullScreen();
                    });
                }
            }
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('videoMaximise', showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    checkToConvertData(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            vm = null;
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitDocumentCarousel', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                data: '<sitData',
                config: '=sitConfig'
            },
            controller: DocumentCarouselController,
            templateUrl: 'common/widgets/documentViewer/document-carousel.html'
        });

    DocumentCarouselController.$inject = ['$scope', '$element'];

    function DocumentCarouselController($scope, element) {

        var vm = this;

        vm.$onInit = function () {
            vm.page = 1;
            vm.eventListner = [];
            vm.registerEvents();
        }

        vm.onThumbnailClick = function (document) {
            vm.parent.setDocument(document);
        }

        vm.nextItems = function () {
            vm.page += 1;
            vm.carouselData = vm.data.slice(vm.showItems * vm.page - vm.showItems, vm.showItems * vm.page);
            return vm.carouselData;
        }

        vm.prevItems = function () {
            vm.page -= 1;
            vm.carouselData = vm.data.slice(vm.showItems * vm.page - vm.showItems, vm.showItems * vm.page);
            return vm.carouselData;
        }

        function setCarouselLayout() {
            vm.carouselContainer = element.parents().find('.doc-list .tab-content')[0];
            var TOTAL_ARROW_WIDTH = 64;
            var THUMBNAIL_WIDTH = 50;
            if (vm.carouselContainer) {
                vm.showItems = (vm.carouselContainer.clientWidth - TOTAL_ARROW_WIDTH) / THUMBNAIL_WIDTH;
                vm.last = Math.ceil(vm.data.length / vm.showItems);
                vm.carouselData = vm.data.slice(0, vm.showItems);
            }
        }

        vm.$onChanges = function (changes) {
            if (changes.data && !changes.data.isFirstChange()) {
                vm.carouselData = changes.data.currentValue;
                vm.page = 1;
                setCarouselLayout();
            }
        };

        vm.registerEvents = function () {
            vm.eventListner[vm.eventListner.length] = $scope.$on('sit-layout-change', setCarouselLayout);
        }

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        };
    }
})();

(function () {
    'use strict';

    function DocumentPluginController() {
        var vm = this;

        function activate() {
            init();
            initPlugins();
        }

        function init() {
            vm.supportedPlugins = [];
        }

        function getSupportedPlugins() {
            var allPlugins = vm.plugins ? vm.plugins.concat(vm.defaultDocumentViewerPlugins) : vm.defaultDocumentViewerPlugins;
            vm.supportedPlugins = _.uniq(allPlugins, 'format');
        }

        function initPlugins() {
            vm.defaultDocumentViewerPlugins = [
                {
                    "format": "pdf",
                    "viewer": "sit-pdf-viewer"
                },
                {
                    "format": "image",
                    "viewer": "sit-image-viewer"
                },
                {
                    "format": "video",
                    "viewer": "sit-video-viewer"
                },
                {
                    "format": "text",
                    "viewer": "sit-text-viewer"
                }
            ];

            getSupportedPlugins();
        }

        activate();
    }

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        directive('sitDocumentPlugin', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                controller: DocumentPluginController,
                bindToController: {
                    plugins: '=?sitPlugins'
                },
                link: function (scope, element, attr, ctrl) {
                    var pluginTemplate = '';
                    if (typeof ctrl.supportedPlugins != 'undefined' && ctrl.supportedPlugins.length > 0) {
                        angular.forEach(ctrl.supportedPlugins, function (plugin) {
                            pluginTemplate += '<' + plugin.viewer + ' ng-if="$ctrl.documentFormat === \'' + plugin.format +
                                '\'" sit-source="$ctrl.documentSource" sit-config="$ctrl.config"></' + plugin.viewer + '>';
                        });
                    }
                    element.append($compile(pluginTemplate)(scope));
                }
            };
        }]);
})();

(function () {
    'use strict';
    /**
    * @ngdoc type
    * @name DocumentConfig
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object having the data related to the documents to be displayed.
    * @property {String} [name] The name of the document (used as tooltip). It should always contain the filename extension of the document (Ex.: .png, .mp4, .pdf).
    * @property {String/Function/Promise} [source] The data source of the document. It can be a **Base64** content, a **Function** that returns **Base64** content and a **Promise** that contains **Base64** content corresponding to the document to be displayed. **URL** can be configurable for image, video and svg files.
    * @property {String} [thumbnail] **Base64** content or **URL** corresponding to the document to be displayed as preview within **Category Tab** in document carousel section.
    * @property {String} [format] The format of the document. The corresponding plugin will be loaded from the default supported ones.
    * The following file formats are currently supported by the widget:-
    * * **image** : It is used to display image in the document viewer.
    * * **pdf** : It is used to display pdf file in the document viewer.
    * * **video** : It is used to display video file in the document viewer.
    * * **text** : It is used to display text file in the document viewer.
    * * **svg** : It is used to display svg file in the document viewer.
    * @property {String} [category] The ID of the category within which the document has to be displayed.
    */

    /**
    * @ngdoc type
    * @name DocumentCategory
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object having data about a category that has to be displayed as a tab in the document viewer footer.
    * @property {String} [id] The ID of the category.
    * @property {String} [label] The label of the category.
    */

    /**
    * @ngdoc type
    * @name DocumentAction
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object corresponding to the custom action to be included in the document viewer header bar.
    * @property {String} [label] A label for the action (used as a tooltip).
    * @property {String} icon A valid fa- or sit- class corresponding to an icon to display. [Deprecated]
    * @property {String} svgIcon A valid SVG icon to display.
    * @property {String} cmdIcon A valid command icon to display.

    * @property {function()} [action] A JavaScript function to be called when the action button is clicked.
    */

    /**
    * @ngdoc type
    * @name DocumentViewerConfig
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object to configure document viewer.
    * @property {String} [title=Documents] A title of the document viewer to be displayed.
    * @property {Boolean} [autoSelectFirstDocument=true] An option to prevent the default selection of document based on the argument **sitDocument**.
    * @property {Function} [onDocumentSelection] A callback method to get the details of the selected document.
    * @property {String} [mode=display] Sets the viewer in a specific mode.
    * It can be set to one of the following:
    * * **display** : It will display category tabset field and viewer.
    * * **details** : It will only display tabs in expanded mode.
    * @property {String} [fullScreenMode=viewer] Configures how to toggle full screen previews.
    * It can be set to one of the following:
    * * **viewer** : The document will be displayed in fullscreen mode when the user will click on the document from the viewer.
    * * **toolbar** : A dedicated fullscreen action button will be shown in the sit-document-viewer toolbar to trigger full screen mode.
    * @property {Array<object>} [plugins] To support different formats of documents in the widget, a custom plugin can be created. The external viewer to be used in the document viewer to load the document of corresponding format.
    * The user can also override the default viewer by specifying the below properties:-
    * * **format** : The format of the document.
    * * **viewer** : The external viewer.
    * * **options** : Specific to the PDF viewer.
    *   * **isSinglePage** (Boolean): To display PDF pages in a single page or multi-page view based on the container width.
    *   * **isFitPageWidth** (Boolean): The display PDF pages with full page width. This can be enabled only when **isSinglePage** is **true**.
    *
    * For Ex., To display the svg file, the framework supports **sit-vector-viewer** can be configured as below:-
    * ```
    * "plugins": [
    *               {
    *                   "format": "svg",
    *                   "viewer": "sit-vector-viewer"
    *               }
    *           ]
    * ```
    *
    * @example
    * Example of vector viewer directive to be used inside the document viewer widget as a plugin
    * ```
    * (function () {
    *   'use strict';
    *   angular.module('siemens.simaticit.common.widgets.documentViewer').
    *       component('sitVectorViewer', {
    *           transclude: true,
    *           require: {
    *               parent: '^sitDocumentViewer'
    *           },
    *           bindings: {
    *               source: '<sitSource', //object corresponding to the document to render
    *               config: '@sitConfig' //object used to further configure this plugin
    *           },
    *           controller: VectorViewerController,
    *           templateUrl: 'common/widgets/documentViewer/plugins/vector/vector-viewer.html' //Contains the HTML content of the vector viewer widget
    *       });
    *
    *   VectorViewerController.$inject = ['$scope', '$timeout'];
    *
    *   function VectorViewerController($scope, $timeout) {
    *       var vm = this;
    *
    *       vm.$onInit = function () {
    *           vm.eventListner = [];
    *           vm.isVectorFullScreenMode = false;
    *           vm.showFullScreen = showFullScreen;
    *           vm.closeFullScreen = closeFullScreen;
    *           registerEvents();
    *       };
    *
    *       function showFullScreen() { //method used to render the document at full-screen
    *           vm.isVectorFullScreenMode = true;
    *           $timeout(function () {
    *               $('#document-viewer-full-screen-svg').appendTo("body");
    *           }, 0, false);
    *       }
    *
    *       function closeFullScreen() { //method used to close the full-screen mode
    *           $('#document-viewer-full-screen-svg').remove();
    *           vm.isVectorFullScreenMode = false;
    *       }
    *
    *       function registerEvents() {
    *           vm.eventListner[vm.eventListner.length] = $scope.$on('svgMaximise', showFullScreen);
    *       }
    *
    *       vm.$onDestroy = function () {
    *           vm.eventListner.forEach(function (listner) {
    *               listner();
    *           });
    *       };
    *   }
    * })();
    * ```
    */

    /**
    * @ngdoc directive
    * @name sitDocumentViewer
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description
    * Displays the document viewer control.
    *
    * @usage
    * As an element:
    * ```
    * <sit-document-viewer
    *       sit-document="documentObject"
    *       sit-data="dataArray"
    *       sit-categories="categoriesArray"
    *       sit-actions="actionsArray">
    *       sit-config="configObject">
    * </sit-document-viewer>
    * ```
    * @restrict E
    *
    * @param {Object} [sitDocument] An object corresponding to the document that is currently displayed in the document viewer.
    * For a description of this object see {@link DocumentConfig}
    *
    * @param {Array<Object>} [sitData] An array of objects corresponding to the documents that are available in the widget to be displayed.
    * For a description of this object see {@link DocumentConfig}
    *
    * @param {Array<Object>} [sitCategories] An array of objects corresponding to the categories to be displayed as tabs in the document viewer footer.
    * For a description of this object see {@link DocumentCategory}
    *
    * @param {Array<Object>} [sitActions] An array of objects corresponding to the custom actions to be displayed in the header bar.
    * For a description of this object see {@link DocumentAction}
    *
    * @param {Object} [sitConfig] An object to configure document viewer.
    * For a description of this object see {@link DocumentViewerConfig}
    *
    * @example
    * In a view template, you can use the **sit-document-viewer** as follows:
    *  ```
    * <div style="height:75%; width:50%">
    *       <sit-document-viewer sit-document="documentViewerCtrl.document"
    *                            sit-data="documentViewerCtrl.data"
    *                            sit-categories="documentViewerCtrl.categories"
    *                            sit-actions="documentViewerCtrl.actions"
    *                            sit-config="documentViewerCtrl.config">
    *       </sit-document-viewer>
    * </div>
    * ```
    *
    * The following example shows how to configure a sit-document-viewer widget:
    *
    * In Controller:
    * ```
    *
    * (function () {
    * 'use strict';
    *      angular.module('siemens.simaticit.common.examples').controller('documentViewerController', DocumentViewerController);
    *
    *      function DocumentViewerController() {
    *          var vm = this;
    *          vm.document = {
    *              "name": "Image1.jpg",
    *              "source": "data:image/png;base64,iV.....",
    *              "thumbnail":"data:image/png;base64,iV....",
    *              "format": "image",
    *              "category": "SampleCategory"
    *          };
    *          vm.data = [
    *              {
    *                   "name": "testPdfData.pdf",
    *                   "source": "data:application/pdf;base64,J..",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "pdf",
    *                   "category": "Tools"
    *              },
    *              {
	*                   "name": "text1.txt",
	*                   "source": "data:text/plain;base64,iV.....",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "text",
	*                   "category": "Material"
    *              },
    *              {
	*                   "name": "siemensVideo.mp4",
    *                   "source": "data:video/mp4;base64,iV.....",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "video",
    *                   "category": "Tools"
    *              }
    *          ];
    *
    *          vm.categories = [
    *              {
    *                  "id": "Material",
    *                  "label": "Tools",
    *              },
    *              {
    *                  "id": "Tools",
    *                  "label": "Operation",
    *              }
    *          ];
    *
    *          vm.actions = [
    *              {
    *                  "label": "Edit",
    *                  "icon": "fa-edit",
    *                  "svgIcon":"common/icons/cmdRefresh24.svg",
    *                  "cmdIcon":"Open",
    *                  "action": "method"
    *              }
    *          ];
    *          vm.config =
    *              {
    *                  "title": "Document viewer",
    *                  "autoSelectFirstDocument": false,
    *                  "onDocumentSelection": onDocumentSelection,
    *                  "mode":"display",
    *                  "fullScreenMode": "toolbar",
    *                  "plugins": [
    *                      {
    *                          "format": "svg",
    *                          "viewer": "sit-vector-viewer"
    *                      }
    *                      {
    *                          "format": "pdf",
    *                          "viewer": "sit-pdf-viewer"
    *                          "options": {
    *                               isSinglePage: false
    *                          }
    *                      }
    *                   ]
    *              }
    *      }
    * })();
    *
    * ```
    *
    */

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitDocumentViewer', {
            transclude: true,
            bindings: {
                document: '=?sitDocument',
                data: '=sitData',
                categories: '=sitCategories',
                actions: '=sitActions',
                config: '=sitConfig'
            },
            controller: DocumentViewerController,
            templateUrl: 'common/widgets/documentViewer/document-viewer.html'
        });

    DocumentViewerController.$inject = ['$scope', '$translate', '$q', 'common.widgets.messageOverlay.service'];

    function DocumentViewerController($scope, $translate, $q, overlayService) {
        var vm = this;

        vm.$onInit = function () {
            vm.selectedTab = '';
            vm.tabContent = [];
            vm.docContent = false;
            vm.tileType = 'item';
            vm.selectStyle = 'standard';
            vm.useCustomColors = false;
            vm.title = typeof vm.config.title === 'string' ? vm.config.title : $translate.instant('documentViewer.defaultTitle');
            vm.defaultDocumentSelection = _.isEmpty(vm.document) ? '' : vm.document;
            vm.selectedMode = vm.config.mode === 'details' ? 'details' : 'display';
            vm.fullScreenMode = vm.config.fullScreenMode === 'toolbar' ? 'toolbar' : 'viewer';
            vm.config.selectCategory = selectCategory;
            vm.config.selectDocument = selectDocument;
            vm.pendingDocument = null;
            vm.config.setMode = setMode;
            vm.autoSelectFirstDocument = vm.config.autoSelectFirstDocument !== undefined ? vm.config.autoSelectFirstDocument : true;
            vm.downloadDocument = downloadDocument;
            vm.isBase64 = isBase64;
            vm.convertToBase64 = convertToBase64;
            vm.docTemplate = '';
            vm.onInitTiles();
            vm.populateData();
            vm.setMode();
            vm.items = [];
            setDisplayIcons();
        };

        function setDisplayIcons() {
            for (var i = 0; i < vm.actions.length; i++) {
                vm.actions[i].displayIcon = null;
                if (vm.actions[i].svgIcon) {
                    vm.actions[i].displayIcon = { path: vm.actions[i].svgIcon, size: '24px' };
                } else if (vm.actions[i].cmdIcon) {
                    vm.actions[i].displayIcon = {
                        prefix: "cmd", name: vm.actions[i].cmdIcon, suffix: "24", size: "24px"
                    };
                }
            }
        }

        vm.onInitTiles = function () {
            var customColors = {
                color: 'black',
                bgColor: 'orange',
                colorSelected: '#647887',
                bgColorSelected: 'blue'
            };

            vm.options = {
                containerID: 'tile-view-container',
                bgColor: customColors.bgColor,
                bgColorSelected: customColors.bgColorSelected,
                color: customColors.color,
                colorSelected: customColors.colorSelected,
                propertyFields: [
                    {
                        field: 'name',
                        displayName: 'Name'
                    }
                ],
                tileViewMode: "wide",
                selectStyle: vm.selectStyle,
                tileType: vm.tileType,
                useCustomColors: vm.useCustomColors,
                debug: true,
                enableResponsiveBehaviour: true,
                multiSelect: false,
                commands: [{
                    onClick: vm.downloadDocument
                }],
                tileTemplate:
                    '<div style="position:relative;" class="custom-large">' +
                    '<div style="float:left; padding: 0 9px 0 9px;">' +
                    '<div data-internal-type="image-vcenter" style="width: 54px;height: 68px; box-sizing: border-box;' +
                    'align-items: center; justify-content: center; display: flex; vertical-align: middle;">' +
                    '<img ng-if="itemTileCtrl.tileContent.thumbnail && itemTileCtrl.tileContent.thumbnail!==undefined"' +
                    'ng-src="{{itemTileCtrl.tileContent.thumbnail}}" style="max-height: 68px;width: 100%;height: auto;"/>' +
                    '<div ng-if="!itemTileCtrl.tileContent.thumbnail || itemTileCtrl.tileContent.thumbnail===undefined"' +
                    'class="doc-tile-thumbnail" ng-switch="itemTileCtrl.tileContent.format" >' +
                    '<em ng-switch-when="image" sit-mom-icon="{\'path\': \'common/icons/typeJpg48.svg\'}"> </em>' +
                    '<em ng-switch-when="pdf" sit-mom-icon="{\'path\': \'common/icons/typePdf48.svg\'}"></em>' +
                    '<em ng-switch-when="video" sit-mom-icon="{\'path\': \'common/icons/typeMp448.svg\'}"> </em>' +
                    '<em ng-switch-when="text" sit-mom-icon="{\'path\': \'common/icons/typeTxt48.svg\'}"></em>' +
                    '<em ng-switch-default sit-mom-icon="{\'path\': \'common/icons/typeFile48.svg\'}"> </em>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +

                    '<div style="float:left; padding: 15px 0 15px 8px; width: 192px;">' +
                    '<div ng-attr-title="{{itemTileCtrl.displayProp1.value}}" style="text-overflow: ellipsis; overflow: hidden;' +
                    'white-space: nowrap; color: #1e1e1e; font-size: 10.5pt; font-weight: 600;" data-internal-type="description">' +
                    '{{itemTileCtrl.displayProp1.value}}</div>' +
                    '<div style="color: #197fa2; font-size: 9pt; font-weight: 400;" data-internal-type="size">' +
                    '{{itemTileCtrl.tileContent.documentSize}}</div>' +
                    '</div>' +

                    '<div style="float: right; width: 62px; padding: 6px 16px 0 8px; height: 68px; text-align: right;">' +
                    '<div style="transition: all .2s ease-in-out" onMouseOver="this.style.transform=\'scale(1.1)\'"' +
                    'onMouseOut="this.style.transform=\'scale(1)\'" ng-attr-title="Download {{itemTileCtrl.tileContent.name}}"' +
                    'ng-click="itemTileCtrl.tileOptions.commands[0].onClick($event, itemTileCtrl.tileContent)">' +
                    '<em sit-mom-icon="{\'path\': \'common/icons/cmdDownload24.svg\'}"></em>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            };
        };

        //Populating the sit-document data if it's not there sit-data and sit-categories
        vm.populateData = function () {
            var index = '';
            vm.data = _.without(vm.data, undefined, null);
            if (vm.data === null || vm.data.length <= 0) return;

            if (vm.data !== undefined && vm.data.length) {
                index = vm.data.findIndex(function (data) {
                    return !!vm.document && data.name === vm.document.name
                });
                if (index < 0 && !!vm.document) {
                    vm.data[vm.data.length] = vm.document;
                }
            }
            else {
                vm.data = [];
                vm.data[0] = vm.document;
            }

            vm.data = _.without(vm.data, undefined, null);
            //adding document size and source type properties
            angular.forEach(vm.data, function (data) {
                if (typeof data.source === 'string') {
                    data.documentSize = ((data.source.length * 0.75) / 1024).toFixed().toString() + ' KB';
                } else {
                    data.documentSize = $translate.instant('documentViewer.sizeNotAvailable');
                }
            });

            if (vm.document) {
                if (vm.categories !== undefined && vm.categories.length) {
                    index = _.findIndex(vm.categories, {
                        'id': vm.document.category
                    });

                    if (index < 0) {
                        vm.categories[vm.categories.length] = {
                            'id': vm.document.category,
                            'label': vm.document.category,
                            'uploadEnabled': false,
                            'deleteEnabled': false
                        };
                    }
                }
                else {
                    vm.categories = [];
                    vm.categories[0] = {
                        'id': vm.document.category,
                        'label': vm.document.category,
                        'uploadEnabled': false,
                        'deleteEnabled': false
                    };
                }
            }
        };

        vm.setDocument = function (doc) {
            vm.isPdfPageRendering = false;
            vm.document = doc;

            angular.forEach(vm.tabContent, function (item) {
                item.selected = false;
                if (item.name === doc.name) {
                    item.selected = true;
                }
            });

            var deferred = $q.defer();
            if (doc) {
                if (doc._resolvedSource !== undefined && doc._resolvedSource !== null) {
                    deferred.resolve(doc._resolvedSource);
                    vm.binarySourcePromise = deferred.promise;
                }
                else if (typeof doc.source === 'function') {
                    vm.binarySourcePromise = doc.source();
                } else {
                    deferred.resolve(doc.source);
                    vm.binarySourcePromise = deferred.promise;
                }
                vm.binarySourcePromise.then(function (data) {
                    vm.documentSource = data;
                    doc.documentSize = ((typeof data === 'string') ?
                        ((data.length * 0.75) / 1024).toFixed().toString() :
                        ((data.byteLength * 0.75) / 1024).toFixed().toString()) + ' KB';
                    vm.documentFormat = doc.format;
                    doc._resolvedSource = data;
                    //callback to get the selected document data
                    window.$UIF.Function.safeCall(vm.config, 'onDocumentSelection', doc);
                }, function () {
                    vm.documentSource = null;

                    //display promise failure in an overlay
                    var overlay = {
                        text: $translate.instant('documentViewer.promiseError'),
                        buttons: [{
                            id: 'DocViewerOk',
                            displayName: "Ok",
                            onClickCallback: function () {
                                overlayService.hide();
                            }
                        }]
                    };
                    overlayService.set(overlay);
                    overlayService.show();
                });
            }
        };

        function removeDuplicatedocs(items) {
            var newItems = [];
            angular.forEach(items, function (value) {
                var exists = false;
                angular.forEach(newItems, function (val) {
                    if (angular.equals(value.name, val.name)) { exists = true }
                });
                if (exists == false && value.name != "") { newItems.push(value); }
            });
            return newItems;
        }

        vm.showDocument = function (value) {
            angular.forEach(vm.data,
                function (item) {
                    if (item.category === value) {
                        vm.tabContent.push(item);
                    }
                }
            );

            if (vm.pendingDocument) {
                vm.tabContent = removeDuplicatedocs(vm.tabContent);
            }
            vm.items = vm.tabContent;

            if (vm.pendingDocument) {
                vm.setDocument(vm.pendingDocument);
                vm.pendingDocument = null;
                return;
            }

            //selecting default document
            if (vm.defaultDocumentSelection !== '') {
                var index = _.findIndex(vm.items, vm.defaultDocumentSelection);
                index = vm.items.findIndex(function (item) { return item.name === vm.defaultDocumentSelection.name });
                vm.defaultDocumentSelection = '';
                vm.setDocument(vm.items[index]);
                return;
            }

            if (vm.items.length == 0) {
                return;
            }

            if (vm.autoSelectFirstDocument) {
                vm.setDocument(vm.items[0]);
            } else {
                vm.autoSelectFirstDocument = true;
            }
        };

        vm.enableTabs = function (value) {
            //selecting default document tab
            if (vm.defaultDocumentSelection !== '' && vm.defaultDocumentSelection.hasOwnProperty('name')) {
                vm.selectedTab = vm.document.category;
                var index = _.findIndex(vm.categories, {
                    'id': vm.selectedTab
                });
                vm.categories[index].tabActive = true;
                return;
            }
            vm.selectedTab = value;
        };

        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.documentViewer
       * @name DocumentViewerConfig#selectCategory
       *
       * @description
       * An API method to select the tab from tab categories.
       * @param {String} [Id] Id of the tab to be selected.
       *
       */
        function selectCategory(id) {
            _.each(vm.categories, function (element, index) {
                if (element.id === id) {
                    vm.categories[index].tabActive = true;
                }
                else {
                    vm.categories[index].tabActive = false;
                }
            });
            vm.enableTabs(id);
        }

        /**
      * @ngdoc method
      * @module siemens.simaticit.common.widgets.documentViewer
      * @name DocumentViewerConfig#selectDocument
      *
      * @description
      * An API method to select the tab from tab categories.
      * @param {Object} [Data] Data of the document to be selected
      * * @param {Boolean} [Refresh] Set true in case any new documents are added
      *
      */
        function selectDocument(doc, refresh) {
            if (refresh) {
                vm.document = doc;
                vm.populateData();
                if (vm.selectedTab === doc.category) {
                    vm.pendingDocument = doc;
                    vm.showDocument(doc.category);
                    return;
                }
            }

            if (vm.selectedTab === doc.category) {
                vm.setDocument(doc);
                return;
            }

            vm.pendingDocument = doc;
            selectCategory(doc.category);
        }

        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.documentViewer
       * @name DocumentViewerConfig#setMode
       *
       * @description
       * An API method to select the mode of the document viewer.
       * @param {String} [mode] The name of the mode in which document viewer should be displayed.
       *
       */
        function setMode(mode) {
            if (mode !== vm.selectedMode) {
                vm.toggleViewer();
            }
        }

        vm.maximizeClicked = function (doc) {
            if (doc.format) {
                $scope.$broadcast(doc.format + 'Maximise');
            }
        };

        function isBase64 (data) {
            if (typeof data !== "string") {
                return false;
            }
            return true;
        }

        function convertToBase64 (data) {
            var convertedData = btoa(Array.from(new window.Uint8Array(data)).map(function (b) {
                return String.fromCharCode(b);
            }).join(''));
            return convertedData;
        }

        /**
      * @ngdoc method
      * @module siemens.simaticit.common.widgets.documentViewer
      * @name DocumentViewerConfig#downloadDocument
      *
      * @description
      * An API method to download a document from the document viewer.
      * @param {String} [url] The url of the document to be downloaded from the document viewer.
      * @param {String} [name] The name of the document to be downloaded from the document viewer.
      *
      */
        function downloadDocument(evt, doc) {
            evt.stopPropagation();
            if (typeof doc.source === 'function') {
                doc.source().then(function (data) {
                    dataURItoBlob(data, doc);
                }, function () {
                    //display promise failure in an overlay
                    var overlay = {
                        text: $translate.instant('documentViewer.promiseError'),
                        buttons: [{
                            id: 'DocViewerOk',
                            displayName: "Ok",
                            onClickCallback: function () {
                                overlayService.hide();
                            }
                        }]
                    };
                    overlayService.set(overlay);
                    overlayService.show();
                    return;
                });
            } else {
                dataURItoBlob(doc.source, doc);
            }
        }

        function dataURItoBlob(dataURI, doc) {
            var fileName = doc.name;
            var fileFormat = doc.format;
            if (!vm.isBase64(dataURI)) {
                var docFormat;
                switch (fileFormat) {
                    case 'image':
                        docFormat = "image/png";
                        break;
                    case 'pdf':
                        docFormat = "application/pdf";
                        break;
                    case 'video':
                        docFormat = "video/mp4";
                        break;
                    case 'text':
                        docFormat = "text/plain";
                        break;
                    case 'svg':
                        docFormat = "image/svg+xml";
                        break;
                }
                dataURI = "data:" + docFormat + ";base64," + vm.convertToBase64(dataURI);
            }
            var byteString = atob(dataURI.split(',')[1]);
            var toArrayBuffer = new window.ArrayBuffer(byteString.length);
            var toIntArray = new window.Uint8Array(toArrayBuffer);
            for (var i = 0; i < byteString.length; i++) {
                toIntArray[i] = byteString.charCodeAt(i);
            }
            var finalBlob = new Blob([toArrayBuffer]);

            //If there is no extension present in the fileName
            if (fileName.indexOf('.') === -1) {
                var extString = dataURI.split(';')[0].split('/')[1];
                switch (extString) {
                    case 'plain':
                        extString = 'txt';
                        break;
                    case 'svg+xml':
                        extString = 'svg';
                        break;
                }
                fileName += '.' + extString;
            }

            var subFileName = fileName.substring(0, fileName.lastIndexOf('_'));
            if (subFileName !== "") { fileName = subFileName; }

            //For Internet Explorer
            if ((navigator.userAgent.indexOf('MSIE') !== -1) || (!!document.documentMode)) {
                window.navigator.msSaveBlob(finalBlob, fileName);
            } else {
                var link = document.createElement('a');
                link.download = fileName;
                link.innerHTML = 'download';
                link.href = URL.createObjectURL(finalBlob);
                link.click();
                link.removeAttribute('href');
            }
        }

        var watchListener = $scope.$watch(
            function () {
                return vm.selectedTab;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    vm.tabContent = [];
                    vm.showDocument(newValue);
                }
            }
        );

        var eventListener = $scope.$on('sit-item-selection-changed', function (event, selectedData, tilesData) {
            vm.docContent = false;
            if (selectedData.length <= 0) {
                selectedData = [{
                    "name": tilesData.name,
                    "source": tilesData.source,
                    "thumbnail": tilesData.thumbnail,
                    "format": tilesData.format,
                    "category": tilesData.category
                }];
            }
            vm.setDocument(selectedData[0]);
        });

        vm.setMode = function () {
            if (vm.selectedMode === 'details') {
                vm.docContent = true;
            } else {
                vm.docContent = false;
            }
        };

        vm.toggleViewer = function () {
            vm.docContent = !vm.docContent;
            vm.selectedMode = !vm.docContent ? 'display' : 'details';
        };

        vm.$onDestroy = function () {
            watchListener();
            eventListener();
            vm = null;
        };
    }
})();
