/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
    * @access internal
    * @name siemens.simaticit.common.widgets.highlight
     *
     * @description
    * The module consist of directive to highlight a code snippet.
     */
    angular.module('siemens.simaticit.common.widgets.highlight', []);

})();

(function () {
    'use strict';

    function sitCodeHighlight($timeout, $window) {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element) {
                var timer = $timeout(function () {
                    scope.$apply(function () {
                        var codeBlock = element.html();
                        codeBlock = codeBlock.replace(/\&lt;/g, '<')
                            .replace(/\&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>');
                        var divElem = document.createElement("div");
                        var textAreaElem = document.createElement("textarea");
                        textAreaElem.innerHTML = codeBlock;
                        divElem.appendChild(textAreaElem);

                        var highlitedCode = $window.CodeMirror.fromTextArea(textAreaElem, {
                            mode: { name: 'javascript', json: true },
                            theme: 'default',
                            smartIndent: true
                        });
                        highlitedCode.save();

                        element[0].innerText = highlitedCode.getValue();
                        element.parent()[0].setAttribute('style', '');
                        element.parent()[0].style.backgroundColor = '#DCDCDC';
                    });
                }, 0, false);

                scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                    timer = null;
                });
            }
        };
    }

    /**
     * @ngdoc directive
     * @access internal
     * @name sitHighlight
     * @module siemens.simaticit.common.widgets.highlight
     * @restrict A
     *
     * @description
     * The directive is used to highlight code snippets. The directive uses the **codemirror** library
     * for highlighting code snippets based on the language.
     *
     * @example
     * As an attribute:
     * ```
     *   <code sit-code-highlight>
     * ```
     * The directive is used within the view template, by simply adding **highlight** to the **code** html
     * element.
     *
     */

    angular.module('siemens.simaticit.common.widgets.highlight')
        .directive('sitCodeHighlight', ['$timeout', '$window', sitCodeHighlight]);

})();
