/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */

/**
 * @license XLTS for AngularJS v1.8.7
 * (c) 2021 XLTS.dev All Rights Reserved. https://xlts.dev/angularjs
 * License: Obtain a commercial license from XLTS.dev before using this software.
 */
/**
 * @license AngularJS
 * (c) 2010-2020 Google LLC. http://angularjs.org
 * License: MIT
 */
 (function(window, angular) {'use strict';

 /**
  * @name ngCompileExtPreAssignBindings
  * @packageName angular-compile-ext-pre-assign-bindings
  *
  * @description
  *
  * ## Description
  *
  * The `ngCompileExtPreAssignBindings` module extends the AngularJS {@link ng.$compile $compile}
  * service and its provider to allow enabling/disabling binding pre-assignment, i.e. whether
  * directive controllers are assigned bindings before calling the controller's constructor.
  */
 
 angular.module('ngCompileExtPreAssignBindings', [])
   .info({ angularVersion: '1.8.7' })
   .config(['$compileProvider', '$provide', function config($compileProvider, $provide) {
     var isDefined = angular.isDefined;
 
     /**
      * @name  $compileProvider#preAssignBindingsEnabled
      *
      * @param {boolean=} enabled update the preAssignBindingsEnabled state if provided, otherwise just return the
      * current preAssignBindingsEnabled state
      * @returns {*} current value if used as getter or itself (chaining) if used as setter
      *
      * @kind function
      *
      * @description
      * Call this method to enable/disable whether directive controllers are assigned bindings before
      * calling the controller's constructor.
      * If enabled (true), the compiler assigns the value of each of the bindings to the
      * properties of the controller object before the constructor of this object is called.
      *
      * If disabled (false), the compiler calls the constructor first before assigning bindings.
      *
      * The default value is false.
      */
     var preAssignBindingsEnabled = false;
     $compileProvider.preAssignBindingsEnabled = function(enabled) {
       if (isDefined(enabled)) {
         preAssignBindingsEnabled = enabled;
         return this;
       }
       return preAssignBindingsEnabled;
     };
 
     $provide.decorator('$compile', ['$delegate', function decorate($compile) {
       $compile.$$customAssignBindings = function(
           bindings, controller, controllerDirective, controllerScope, $element, attrs,
           initializeDirectiveBindings) {
         if (preAssignBindingsEnabled) {
           if (bindings) {
             controller.bindingInfo =
               initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
           } else {
             controller.bindingInfo = {};
           }
 
           var controllerResult = controller();
           if (controllerResult !== controller.instance) {
             // If the controller constructor has a return value, overwrite the instance
             // from setupControllers
             controller.instance = controllerResult;
             $element.data('$' + controllerDirective.name + 'Controller', controllerResult);
             if (controller.bindingInfo.removeWatches) {
               controller.bindingInfo.removeWatches();
             }
             controller.bindingInfo =
               initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
           }
         }
 
         // Return whether custom logic was applied or not.
         return preAssignBindingsEnabled;
       };
 
       return $compile;
     }]);
   }]);
 
 
 })(window, window.angular); 