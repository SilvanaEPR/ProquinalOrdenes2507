/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
(function () {
    'use strict';
    HomeCardScreenController.$inject = ['common.services.homeCard.config', '$rootScope', '$scope', '$translate', '$state'];
    function HomeCardScreenController(homeCardConfigService, $rootScope, $scope, $translate, $state) {
        var vm = this;
        var defaultCards, homeConfig, configuredHomeCards, element;
        var ANIMATION_DELAY = 800,
            SEARCH_CONTAINER_HEIGHT = 64;

        function activate() {
            init();
        }

        function init() {
            vm.cards = [];
            vm.tileConfig = [];
            vm.tiles = [];
            vm.homeType = homeCardConfigService.getHomeType();
            defaultCards = homeCardConfigService.getCardInfo();
            homeConfig = homeCardConfigService.getHomeConfiguration();
            configuredHomeCards = homeCardConfigService.getConfiguredHomeCards();
            generateHomeCards(configuredHomeCards);

            $rootScope.isCanvasTransparent = true;
            $scope.$on('$destroy', destroyController);

            if (vm.homeType === 'single') {
                vm.searchText = '';
                vm.isTilesSearchOn = false;
                vm.showMoveUpButton = false;
                vm.moveTopIcon = {
                    path: 'common/icons/miscUpArrow16.svg',
                    size: '24px'
                };
                vm.scrollToTop = scrollToTop;
                vm.change = onSearchTextChange;
                vm.singlePageLoadComplete = onContentLoaded;
                generateTileConfigObject();
            }
        }

        function generateHomeCards(homeCards) {
            homeCards.forEach(function (homeCard) {
                var cardInfo = defaultCards[homeCard];
                var card = {
                    id: homeCard,
                    title: $translate.instant(cardInfo.titleKey),
                    description: $translate.instant(cardInfo.descriptionKey),
                    image: cardInfo.imagePath,
                    callback: onCardClick.bind(null, cardInfo.id)
                }
                vm.cards.push(card);
            });
        }

        function onCardClick(id) {
            if (vm.homeType === 'single') {
                var position = $(element).find('#' + id)[0].offsetTop - SEARCH_CONTAINER_HEIGHT;
                $(element).animate({
                    scrollTop: position
                }, {
                        duration: ANIMATION_DELAY,
                        complete: function () {
                            vm.showMoveUpButton = true;
                        }
                    });

            }
            else {
                $state.go('home.homeCard.homeTile', { category: id });
            }
        }

        function generateTileConfigObject() {
            configuredHomeCards.forEach(function (card) {
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
                    vm.tiles.push(tile);
                    tileConfig.tiles.push(tile);
                });
                vm.tileConfig.push(tileConfig);
            });
        }

        function onTileClick(state) {
            $state.go(state);
        }

        function onSearchTextChange(text) {
            vm.isTilesSearchOn = text ? true : false
            vm.searchText = text;
        }

        function scrollToTop() {
            vm.showMoveUpButton = false;
            unsubscribeScrollEvents();
            $(element).animate({
                scrollTop: 0
            }, {
                    duration: ANIMATION_DELAY,
                    complete: function () {
                        subscibeScrollEvent();
                    }
                });
        }

        function onContentLoaded() {
            element = angular.element('.home-card-tile-container')[0];
            subscibeScrollEvent();
            
        }

        function onScroll() {
            vm.showMoveUpButton = this.firstElementChild.scrollHeight < this.scrollTop ? true : false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
       function subscibeScrollEvent(){
            $(element).on('scroll', onScroll);
        }

        function destroyController() {
            $rootScope.isCanvasTransparent = false;
            unsubscribeScrollEvents();
        }

        function unsubscribeScrollEvents() {
            $(element).off('scroll', onScroll);
        }

        activate();
    }

    angular
        .module('siemens.simaticit.common.services.layout')
        .controller('HomeCardScreenController', HomeCardScreenController);
}());

(function () {
    'use strict';
    angular
        .module('siemens.simaticit.common.services.layout')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state({
                name: 'home.homeCard',
                url: '/homeCard',
                views: {
                    'Canvas@': {
                        templateUrl: 'common/layout/homeCard/home-card.html',
                        controller: 'HomeCardScreenController',
                        controllerAs: 'homeCardCtrl'
                    }
                },
                data: {
                    title: 'Home Card',
                    sideBarIsHidden: true,
                    afxBackground: true,
                    isNavigationScreen: true
                }
            });
        }]);
}());
