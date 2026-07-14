/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @access internal
 * @name siemens.simaticit.common.widgets.tileConfigurator
 *
 * @description
 * This module provides functionalities related to display the tile propertyfields.
 */
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.tileConfigurator', []);

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.tileConfigurator').directive('sitTileConfigurator', TileConfiguratorDirective);


    function TileConfiguratorDirective() {
        return {
            scope: {},
            bindToController: {
                sitConfig: '=sitConfig'
            },
            controller: TileConfiguratorController,
            controllerAs: 'tileConfiguratorCtrl',
            templateUrl: 'common/widgets/tileConfigurator/tile-configurator.html'
        }
    }
    TileConfiguratorController.$inject = ['common', '$timeout'];
    function TileConfiguratorController(common, $timeout) {
        var vm = this;
        function activate() {
            init();
        }
        function init() {
            initializeTileMode();
            initializeVariables();
            initializeTileOptions();
            assignTileData();
            clearInvisiblePropertyFields();
            vm.updateTileMode = updateTileMode;
            vm.updateUserTitle = updateUserTitle;
            vm.updateUserDesc = updateUserDesc;
            vm.updateUserPropone = updateUserPropone;
            vm.updateUserProptwo = updateUserProptwo;
            vm.updateUserPropthree = updateUserPropthree;
            vm.updateUserPropfour = updateUserPropfour;
            vm.sitConfig.data.getTileSettings = getTileSettings;
            vm.initializeTileOptions = initializeTileOptions;
        }

        function initializeVariables() {
            vm.svgIcons = {
                reset: { path: './common/icons/cmdToPartial24.svg' }
            };
            vm.initialTileFields = [];
            vm.resetColumns = vm.sitConfig.reset.onClickCallback;
            vm.sitConfig.data.viewMode = 'medium';
            vm.sitConfig.data.isCell = true;
            assignAllFields();
            vm.tileModes = ['small', 'medium', 'large'];
            vm.titleField = {
                field: vm.sitConfig.data.userPreferences.titleField.field || vm.sitConfig.data.userPreferences.titleField,
                displayName: vm.sitConfig.data.userPreferences.titleField.displayName || vm.sitConfig.data.userPreferences.titleField
            };
            vm.titleFieldSource = vm.sitConfig.data.userPreferences.titleFieldSource || null;
            vm.titleFieldFilter = vm.sitConfig.data.userPreferences.titleFieldFilter;
            vm.descriptionField = {
                field: vm.sitConfig.data.userPreferences.descriptionField.field || vm.sitConfig.data.userPreferences.descriptionField,
                displayName: vm.sitConfig.data.userPreferences.descriptionField.displayName || vm.sitConfig.data.userPreferences.descriptionField
            };
            vm.descriptionFieldSource = vm.sitConfig.data.userPreferences.descriptionFieldSource || null;
            vm.descriptionFieldFilter = vm.sitConfig.data.userPreferences.descriptionFieldFilter;

            vm.select = {
                toKeep: 'field',
                toDisplay: 'displayName',
                validation: { required: false },
                readOnly: false
            };

            vm.isCell = vm.sitConfig.data.isCell;
        }

        function initializeTileOptions() {
            vm.options = {
                color: 'black',
                containerID: "tile-container",
                propertyFields: vm.sitConfig.data.userPreferences.propertyFields,
                selectStyle: 'standard',
                showPager: false,
                tileType: "item",
                tileSize: vm.sitConfig.data.viewMode,
                titleField: vm.sitConfig.data.userPreferences.titleField,
                descriptionField: vm.sitConfig.data.userPreferences.descriptionField,
                useCustomColors: false,
                enableResponsiveBehaviour: true,
                tileTemplate: vm.sitConfig.data.tileTemplate,
                isCell: vm.sitConfig.data.isCell,
                tileViewMode: 'c'
            };

        }
        function initializeTileMode() {
            var tilemode = vm.sitConfig.data.viewMode;
            if (tilemode === 's' || tilemode === 'c' || tilemode === 'medium') {
                vm.sitConfig.data.viewMode = 'medium';
                vm.tileSize = 'medium';
            } else if (tilemode === 'm' || tilemode === 'wide') {
                vm.sitConfig.data.viewMode = 'wide';
                vm.tileSize = 'medium';
            } else if (tilemode === 'l' || tilemode === 'large') {
                vm.sitConfig.data.viewMode = 'large';
                vm.tileSize = 'large';
            }
        }

        function updateTileMode() {
            if (vm.tileSize === 'small') {
                vm.options.tileSize = 'medium';
            } else if (vm.tileSize === 'medium') {
                vm.options.tileSize = 'wide';
            } else if (vm.tileSize === 'large') {
                vm.options.tileSize = 'large';
            }
        }
        function updateUserTitle(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                vm.sitConfig.data.userPreferences.titleField = newVal.field;
                vm.sitConfig.data.userPreferences.titleFieldDisplayName = newVal.displayName || newVal.field;
                vm.sitConfig.data.userPreferences.titleFieldSource = newVal.fieldSource || null
                vm.sitConfig.data.userPreferences.titleFieldFilter = null;
                if (newVal.dataType) {
                    vm.sitConfig.data.userPreferences.titleFieldFilter = {
                        dataType: newVal.dataType,
                        format: newVal.format
                    };
                }
                vm.options.titleField = vm.sitConfig.data.userPreferences.titleField;
                vm.options.titleFieldSource = vm.titleFieldSource = vm.sitConfig.data.userPreferences.titleFieldSource;
                vm.options.titleFieldFilter = vm.titleFieldFilter = vm.sitConfig.data.userPreferences.titleFieldFilter;
                vm.options.dataUpdated();
            }
        }

        function updateUserDesc(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                vm.sitConfig.data.userPreferences.descriptionField = null;
                vm.sitConfig.data.userPreferences.descriptionFieldSource = newVal.fieldSource || null
                vm.sitConfig.data.userPreferences.descriptionFieldFilter = null;
                if (newVal && newVal.field) {
                    vm.sitConfig.data.userPreferences.descriptionField = newVal.field;
                    vm.sitConfig.data.userPreferences.descriptionFieldDisplayName = newVal.displayName || newVal.field;
                    if (newVal.dataType) {
                        vm.sitConfig.data.userPreferences.descriptionFieldFilter = {
                            dataType: newVal.dataType,
                            format: newVal.format
                        };
                    }
                }
                vm.options.descriptionField = vm.sitConfig.data.userPreferences.descriptionField;
                vm.descriptionFieldSource = vm.sitConfig.data.userPreferences.descriptionFieldSource;
                vm.options.descriptionFieldFilter = vm.descriptionFieldFilter = vm.sitConfig.data.userPreferences.descriptionFieldFilter;
                vm.options.dataUpdated();
            }
        }
        function updateUserPropone(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                updateVisibility(vm.sitConfig.data.userPreferences.propertyFields[0], newVal);
                newVal && newVal.field ? (vm.sitConfig.data.userPreferences.propertyFields[0] = angular.copy(newVal)) : vm.sitConfig.data.userPreferences.propertyFields.splice(0, 1);
                vm.options.propertyFields = vm.sitConfig.data.userPreferences.propertyFields;
                vm.options.dataUpdated();
            }
        }
        function updateUserProptwo(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                updateVisibility(vm.sitConfig.data.userPreferences.propertyFields[1], newVal);
                newVal && newVal.field ? (vm.sitConfig.data.userPreferences.propertyFields[1] = angular.copy(newVal)) : vm.sitConfig.data.userPreferences.propertyFields.splice(1, 1);
                vm.options.propertyFields = vm.sitConfig.data.userPreferences.propertyFields;
                vm.options.dataUpdated();
            }
        }
        function updateUserPropthree(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                updateVisibility(vm.sitConfig.data.userPreferences.propertyFields[2], newVal);
                newVal && newVal.field ? (vm.sitConfig.data.userPreferences.propertyFields[2] = angular.copy(newVal)) : vm.sitConfig.data.userPreferences.propertyFields.splice(2, 1);
                vm.options.propertyFields = vm.sitConfig.data.userPreferences.propertyFields;
                vm.options.dataUpdated();
            }
        }
        function updateUserPropfour(oldVal, newVal) {
            if (!angular.equals(oldVal, newVal)) {
                updateVisibility(vm.sitConfig.data.userPreferences.propertyFields[3], newVal);
                newVal && newVal.field ? (vm.sitConfig.data.userPreferences.propertyFields[3] = angular.copy(newVal)) : vm.sitConfig.data.userPreferences.propertyFields.splice(3, 1);
                vm.options.propertyFields = vm.sitConfig.data.userPreferences.propertyFields;
                vm.options.dataUpdated();
            }
        }
        function updateVisibility(oldVal, newVal) {
            newVal && (newVal.visible = true);
            oldVal && (oldVal.visible = false);
        }

        function clearInvisiblePropertyFields() {
            var visibleFields = angular.copy(vm.sitConfig.data.userPreferences.propertyFields);
            if (visibleFields && visibleFields.length > 0) {
                visibleFields.forEach(function (field, index) {
                    if (field.visible === false) {
                        vm.sitConfig.data.userPreferences.propertyFields.splice(index);
                    }
                });
            }
        }

        function assignAllFields() {
            var tileConfig = vm.sitConfig.data.tileConfig;
            if (!tileConfig.titleField && tileConfig.propertyFields && tileConfig.propertyFields.length === 0) {
                tileConfig = $.extend(true, {}, vm.sitConfig.data.userPreferences);
            }
            for (var key in tileConfig) {
                if ((tileConfig[key] && typeof tileConfig[key] === "object")
                    && (key === 'titleField' || key === 'descriptionField')) {
                    vm.initialTileFields.push({
                        field: tileConfig[key].field,
                        displayName: tileConfig[key].displayName
                    });
                } else if ((tileConfig[key] && tileConfig[key].length !== 0)
                    && (key === 'titleField' || key === 'descriptionField')) {
                    vm.initialTileFields.push({
                        field: tileConfig[key],
                        displayName: tileConfig[key]
                    });
                } else if (key === 'propertyFields') {
                    angular.forEach(tileConfig[key], function (obj) {
                        if (obj.field && obj.field !== '' && typeof obj === 'object') {
                            vm.initialTileFields.push(obj);
                            vm.initialTileFields[vm.initialTileFields.length - 1].displayName = obj.displayName ? obj.displayName : obj.field;
                        } else if (obj && typeof obj === 'string') {
                            vm.initialTileFields.push({
                                field: obj,
                                displayName: obj
                            });
                        }
                    });
                }

                if (tileConfig[key + 'Filter']) {
                    vm.initialTileFields[vm.initialTileFields.length - 1].dataType = tileConfig[key + 'Filter'].dataType;
                    vm.initialTileFields[vm.initialTileFields.length - 1].format = tileConfig[key + 'Filter'].format;
                }

                if (tileConfig[key + 'Source']) {
                    vm.initialTileFields[vm.initialTileFields.length - 1].fieldSource = tileConfig[key + 'Source'];
                }
            }
        }
        function assignTileData() {
            vm.tiles = [];
            vm.tiles[0] = {};
            for (var key in vm.sitConfig.data.userPreferences) {
                if (key === 'titleField' || key === 'descriptionField' && vm.sitConfig.data.userPreferences[key]) {
                    vm.tiles[0][vm.sitConfig.data.userPreferences[key]] = vm.sitConfig.data.userPreferences[key + 'DisplayName'] || vm.sitConfig.data.userPreferences[key];
                    if (_.findIndex(vm.initialTileFields, { field: vm.sitConfig.data.userPreferences[key] }) === -1) {
                        vm.initialTileFields.push({ field: vm.sitConfig.data.userPreferences[key], displayName: vm.sitConfig.data.userPreferences[key] })
                    }
                }
                if (key === 'propertyFields') {
                    vm.initialTileFields.push({ field: '', displayName: '' });
                    angular.forEach(vm.sitConfig.data.userPreferences[key], function (obj, index) {
                        if (typeof obj === 'object' && obj.field && obj.field !== '') {
                            vm.tiles[0][obj.field] = obj.displayName || obj.field;
                            if (_.findIndex(vm.initialTileFields, { field: obj.field }) === -1) {
                                vm.initialTileFields.push({ field: obj.field, displayName: obj.displayName ? obj.displayName : obj.field })
                            }
                        } else if (typeof obj === 'string' && obj !== '') {
                            vm.tiles[0][obj] = obj;
                            vm.sitConfig.data.userPreferences.propertyFields[index] = { field: obj, displayName: obj };
                            if (_.findIndex(vm.initialTileFields, { field: obj }) === -1) {
                                vm.initialTileFields.push({ field: obj, displayName: obj })
                            }
                        }
                    })
                }
            }
            vm.titleDescriptionValues = JSON.parse(JSON.stringify(vm.initialTileFields));
            vm.initialTileFields.forEach(function (data) {
                if (data.field && !vm.tiles[0].hasOwnProperty(data.field)) {
                    vm.tiles[0][data.field] = data.displayName || data.field;
                }
            });
            var removeIndex = vm.titleDescriptionValues.map(function (item) { return item.field; }).indexOf('');
            vm.titleDescriptionValues.splice(removeIndex, 1);
        }


        function getTileSettings() {

            vm.usertileConfig = {
                "titleField": vm.titleField.field ? vm.titleField.field : undefined,
                "titleFieldSource": vm.titleFieldSource,
                "titleFieldFilter": vm.titleFieldFilter,
                "descriptionField": vm.descriptionField.field ? vm.descriptionField.field : undefined,
                "descriptionFieldSource": vm.descriptionFieldSource,
                "descriptionFieldFilter": vm.descriptionFieldFilter,
                "propertyFields": []
            };
            angular.forEach(vm.sitConfig.data.userPreferences.propertyFields, function (obj) {
                if (obj && obj.field) {
                    vm.usertileConfig.propertyFields.push(obj);
                }
            })

            return vm.usertileConfig;

        }
        activate();
    }
})();
