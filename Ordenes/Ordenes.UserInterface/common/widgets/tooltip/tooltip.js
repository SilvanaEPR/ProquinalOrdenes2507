/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.tooltip
    *
    * @description
    * This module provides functionalities related to displaying textarea input fields.
    */
    angular.module('siemens.simaticit.common.widgets.tooltip', []);

})();

/*jshint -W098 */
(function () {
    'use strict';

    var app = angular.module('siemens.simaticit.common.widgets.tooltip');
    /**
    *   @ngdoc directive
    *   @name momTooltip
    *   @module siemens.simaticit.common.widgets.tooltip
    *   @description
    *   Displays a Tooltip.
    *   Tooltip is displayed on hover of an element where momTooltip is configured.
    *   Tooltip is closed when mouse is out of element.
    *
    *   @usage
    *   As attribute directive :
    *   ```
    *   <div id="top-right" data-tooltip-placement="top" mom-tooltip="Hi i am tooltip"></div>
    *   ```
    *
    *   @restrict 
    *   @param {string} mom-tooltip This the the text to be displayed as tooltip.
    *   @param {string} data-tooltip-placement Specifies the position of the tooltip relative to element. Valid values are:
    *   * **top-right**
    *   * **top**
    *   * **top-left**
    *   * **bottom-right**
    *   * **bottom**
    *   * **bottom-left**
    *   * **left-up**
    *   * **left**
    *   * **left-down**
    *   * **right-up**
    *   * **right**
    *   * **right-down**
    *   * ** ** ( if data-tooltip-placement is not provided or the values passed to data-tooltip-placement is empty, the Tooltip is automatically placed in a position that has sufficient space).
    *  
    *   
    * */



    app.directive('momTooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                var CARROTICONSIZE = 8;
                var WINDOW_HEIGHT = $(window).height();
                var WINDOW_WIDTH = $(window).width();
                ctrl.cancelTip = cancelTip;
                ctrl.createTip = createTip;
                function subscribeEvents() {
                    element.on('mouseenter', createTip);
                    element.on('mouseleave', cancelTip);
                }

                function unsubscribeEvents() {
                    element.off('mouseenter', createTip);
                    element.off('mouseleave', cancelTip);
                }

                function onscroll() {
                    cancelTip();
                }

                function unsubscribeScroll() {
                    document.removeEventListener('scroll', onscroll, true);
                }

                function subscribeScroll() {
                    document.addEventListener('scroll', onscroll, true);
                }

                function createElement(tag, title, cssClass) {
                    var ID = 'mom-tooltip';
                    var _tooltip = document.getElementById(ID) || document.createElement(tag);
                    _tooltip.setAttribute('id', ID);
                    _tooltip.setAttribute('class', cssClass);
                    _tooltip.innerText = title;
                    return _tooltip;
                }

                function setClass(popup, rect) {
                    popup.classList.add(rect.cssClass);
                    popup.style.top = rect.top + 'px';
                    popup.style.left = rect.left + 'px';
                }

                function calculateInitialTooltipPosition(elementRect, tooltipRect, iconWidth) {
                    var top, left;
                    if (elementRect.height >= tooltipRect.height) {
                        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
                        left = elementRect.left + elementRect.width + iconWidth + 8;

                    }
                    else {
                        top = elementRect.top - (tooltipRect.height - elementRect.height) / 2;
                        left = elementRect.left + elementRect.width + iconWidth + 8;

                    }
                    return {
                        top: top, left: left
                    };
                }

                function getTooltipBottomCssClass(elementRect, tooltipRect) {

                    var top, left;
                    var rect = {
                        cssClass: 'bottom'
                    };
                    if (elementRect.width >= tooltipRect.width) {
                        top = elementRect.top + elementRect.height + CARROTICONSIZE * 2;
                        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                    }
                    else {
                        top = elementRect.top + elementRect.height + CARROTICONSIZE * 2;
                        left = elementRect.left - (tooltipRect.width - elementRect.width) / 2;
                    }

                    if (left <= 0) {
                        left = elementRect.left; //8px space from left side
                        rect.cssClass = "bottom-right";
                    }
                    else if ((left + tooltipRect.width) >= WINDOW_WIDTH) {
                        // left = left - ((left + tooltipRect.width) - calculatedPosition.maxWidthAvailable + 8); //8px space from left side
                        left = (elementRect.left + elementRect.width) - tooltipRect.width;
                        rect.cssClass = "bottom-left";
                    }
                    rect.top = top;
                    rect.left = left;
                    return rect;
                }

                function getTooltipTopCssClass(elementRect, tooltipRect) {

                    var top, left;
                    var rect = {
                        cssClass: 'top'
                    };

                    //adjust top and left position to center align
                    if (elementRect.width >= tooltipRect.width) {
                        top = elementRect.top - tooltipRect.height - CARROTICONSIZE * 2;
                        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                    }
                    else {
                        top = elementRect.top - tooltipRect.height - CARROTICONSIZE * 2;
                        left = elementRect.left - (tooltipRect.width - elementRect.width) / 2;

                    }

                    if (left <= 0) {
                        left = elementRect.left; //8px space from left side
                        rect.cssClass = "top-right";
                    }
                    else if ((left + tooltipRect.width) >= WINDOW_WIDTH) {
                        left = (elementRect.left + elementRect.width) - tooltipRect.width; //8px space from left side
                        rect.cssClass = "top-left";
                    }

                    rect.top = top;
                    rect.left = left;
                    return rect;
                }

                function getCssClassByPosition(initialTooltipPosition, elementRect, tooltipRect) {
                    var rect = {
                        cssClass: 'right',
                        top: initialTooltipPosition.top,
                        left: initialTooltipPosition.left
                    };
                    if (initialTooltipPosition.top <= 0 || (initialTooltipPosition.left + tooltipRect.width) >= WINDOW_WIDTH)//bottom tooltip
                    {
                        rect = getTooltipBottomCssClass(elementRect, tooltipRect);
                    }
                    else if ((initialTooltipPosition.top + tooltipRect.height) >= WINDOW_HEIGHT)//top tooltip
                    {
                        rect = getTooltipTopCssClass(elementRect, tooltipRect);
                    }
                    return rect;
                }

                function getCssClassByValue(initialTooltipPosition, elementRect, tooltipRect, cssClass) {
                    var rect = {};
                    switch (cssClass) {
                        case "right":
                            rect.cssClass = 'right';
                            rect.top = initialTooltipPosition.top;
                            rect.left = initialTooltipPosition.left;
                            break;
                        case "right-up":
                            rect.cssClass = 'right-up';
                            rect.top = elementRect.top;
                            rect.left = initialTooltipPosition.left;
                            break;
                        case "right-down":
                            rect.cssClass = 'right-down';
                            rect.top = (elementRect.top + elementRect.height) - tooltipRect.height;
                            rect.left = initialTooltipPosition.left;
                            break;
                        case "left":
                            rect.cssClass = 'left';
                            rect.top = initialTooltipPosition.top;
                            rect.left = elementRect.left - (tooltipRect.left + tooltipRect.width + CARROTICONSIZE * 2);
                            break;
                        case "left-up":
                            rect.cssClass = 'left-up';
                            rect.top = elementRect.top;
                            rect.left = elementRect.left - (tooltipRect.left + tooltipRect.width + CARROTICONSIZE * 2);
                            break;
                        case "left-down":
                            rect.cssClass = 'left-down';
                            rect.top = (elementRect.top + elementRect.height) - tooltipRect.height;
                            rect.left = elementRect.left - (tooltipRect.left + tooltipRect.width + CARROTICONSIZE * 2);
                            break;
                        case "bottom":
                            rect.cssClass = 'bottom';
                            rect.top = elementRect.top + elementRect.height + CARROTICONSIZE * 2;
                            if (elementRect.width >= tooltipRect.width)
                                rect.left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                            else
                                rect.left = elementRect.left - (tooltipRect.width - elementRect.width) / 2;
                            break;
                        case "bottom-left":
                            rect.cssClass = 'bottom-left';
                            rect.top = elementRect.top + elementRect.height + CARROTICONSIZE * 2;
                            rect.left = elementRect.left;
                            break;
                        case "bottom-right":
                            rect.cssClass = 'bottom-right';
                            rect.top = elementRect.top + elementRect.height + CARROTICONSIZE * 2;
                            rect.left = (elementRect.left + elementRect.width) - tooltipRect.width;
                            break;
                        case "top":
                            rect.cssClass = 'top';
                            rect.top = elementRect.top - tooltipRect.height - CARROTICONSIZE * 2;
                            if (elementRect.width >= tooltipRect.width)
                                rect.left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                            else
                                rect.left = elementRect.left - (tooltipRect.width - elementRect.width) / 2;
                            break;
                        case "top-left":
                            rect.cssClass = 'top-left';
                            rect.top = elementRect.top - tooltipRect.height - CARROTICONSIZE * 2;
                            rect.left = elementRect.left;
                            break;
                        case "top-right":
                            rect.cssClass = 'top-right';
                            rect.top = elementRect.top - tooltipRect.height - CARROTICONSIZE * 2;
                            rect.left = (elementRect.left + elementRect.width) - tooltipRect.width;
                            break;



                    }
                    return rect;
                }

                function createTip(ev) {

                    var title = attrs['momTooltip'];//this.title;
                    var cssClass = attrs['tooltipPlacement'];
                    var popupElm = createElement('div', title, cssClass);
                    document.body.appendChild(popupElm);
                    var elementRect = element[0].getBoundingClientRect();
                    var tooltipRect = popupElm.getBoundingClientRect();
                    var initialTooltipPosition, rect;

                    if (cssClass) {
                        initialTooltipPosition = calculateInitialTooltipPosition(elementRect, tooltipRect, CARROTICONSIZE);
                        rect = getCssClassByValue(initialTooltipPosition, elementRect, tooltipRect, cssClass);
                        setClass(popupElm, rect);


                    }
                    else {
                        initialTooltipPosition = calculateInitialTooltipPosition(elementRect, tooltipRect, CARROTICONSIZE);
                        rect = getCssClassByPosition(initialTooltipPosition, elementRect, tooltipRect);
                        setClass(popupElm, rect);
                    }
                    subscribeScroll();
                }

                function cancelTip() {
                    unsubscribeScroll();
                    var tooltip = document.getElementById('mom-tooltip');
                    if (tooltip) {
                        tooltip.remove();
                    }
                }

                function active() {
                    subscribeEvents();
                    scope.$on('$destroy', function () {
                        unsubscribeEvents();
                    });
                }
                active();
            },
            controller: function () {

            }
        }
    });
})();


