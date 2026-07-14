/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    HomeTileScreenController.$inject = ['common.services.homeCard.config', '$stateParams', '$state', '$translate', '$rootScope', '$scope'];
    function HomeTileScreenController(homeCardConfigService, $stateParams, $state, $translate, $rootScope, $scope) {
        var vm = this;
        var card, homeConfig, defaultCards;

        function activate() {
            init();
        }

        function init() {
            vm.tileConfig = [];
            card = $stateParams.category;
            defaultCards = homeCardConfigService.getCardInfo();
            homeConfig = homeCardConfigService.getHomeConfiguration();
            generateTileConfigObject(card);
            $rootScope.isCanvasTransparent = true;
        }

        function generateTileConfigObject(card) {
            var tileConfig = {
                id: '',
                title: '',
                tiles: []
            };
            tileConfig.id = card;
            tileConfig.title = $translate.instant(defaultCards[card].titleKey);
            homeConfig[card].forEach(function (screen) {
                var tile = {
                    title: screen.titleKey ? $translate.instant(screen.titleKey) : $translate.instant(screen.title),
                    icon: screen.icon,
                    callback: onTileClick.bind(null, screen.state)
                }
                tileConfig.tiles.push(tile);
            });
            vm.tileConfig.push(tileConfig);
        }

        function onTileClick(state) {
            $state.go(state);
        }

        $scope.$on("$destroy", function () {
            $rootScope.isCanvasTransparent = false;
        });

        activate();
    }

    angular
        .module('siemens.simaticit.common.services.layout')
        .controller('HomeTileScreenController', HomeTileScreenController);
}());

(function () {
    'use strict';
    angular
        .module('siemens.simaticit.common.services.layout')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state({
                name: 'home.homeCard.homeTile',
                url: '/homeTile/:category',
                views: {
                    'Canvas@': {
                        templateUrl: 'common/layout/homeTile/home-tile.html',
                        controller: 'HomeTileScreenController',
                        controllerAs: 'homeTileCtrl'
                    }
                },
                data: {
                    title: 'Home Tile',
                    sideBarIsHidden: true,
                    afxBackground: true,
                    isNavigationScreen: true
                },
                params: {
                    category: null
                }
            });
        }]);
}());
