/*
* SIMATIC IT Unified Architecture for Process Industries V1.1.
* Copyright (C) Siemens AG 2017. All Rights Reserved.
*/
(function () {
    'use strict';

    angular.module('Siemens.SimaticIT.UAPI.PICore')
        .service('uapi_presentationService', presentationService);

    presentationService.$inject = ['common.base', '$translate', '$q'];

    function presentationService(commonBase, $translate, $q) {
        var self = this;

        self._backendService = commonBase.services.runtime.backendService;

        var service = {
            getInstance: getInstance,
            genericError: genericError
        };
        return service;

        function getInstance(service) {
            var instance = {
                _backendService: self._backendService,
                _service: service,
                remove: remove,
                callMethodWithConfirm: callMethodWithConfirm,
                unset: unset
            };
            return instance;

            function callMethodWithConfirm(methodName, entity, translate) {
                var self = this;
                var def = $q.defer();
                var title = translate && translate.title ? translate.title : $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.' + methodName);
                var text = translate && translate.confirmation
                    ? translate.confirmation + ' \'' + entity.NId + '\'?'
                    : $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.' + methodName + '_confirmation') + ' \'' + entity.NId + '\'?';
                self._backendService.confirm(text, function confirmCallback() {
                    self._service[methodName](entity).then(onSuccess);
                }, title);
                return def.promise;

                function onSuccess() {
                    def.resolve();
                }
            }

            function remove(entity) {
                var self = this;
                var def = $q.defer();
                var title = $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.remove');
                var text = $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.remove_confirmation') + ' \'' + entity.NId + '\'?';
                self._backendService.confirm(text, function confirmCallback() {
                    self._service.remove(entity).then(onRemoveSuccess);
                }, title);
                return def.promise;

                function onRemoveSuccess() {
                    def.resolve();
                }
            }

            function unset(entitiesName, parentEntity, childEntities) {
                var self = this;
                var def = $q.defer();
                var title = $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.delete');
                var text = $translate.instant('Siemens.SimaticIT.UAPI.PICore.OperatorTask.common.delete_link_confirmation') + ' \'' + parentEntity.NId + '\'?';
                self._backendService.confirm(text, function confirmCallback() {
                    self._service['unset' + entitiesName].call(self._service, parentEntity, childEntities).then(onRemoveSuccess);
                }, title);
                return def.promise;

                function onRemoveSuccess() {
                    def.resolve();
                }
            }

        }

        function genericError(title, message) {
            self._backendService.genericError(message, title);
        }
    }
})();
