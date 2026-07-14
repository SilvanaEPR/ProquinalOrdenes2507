(function () {

    angular.module('Siemens.SimaticIT.UAPI.PICore').directive('homeTile', [function () {

        var controller = ['$scope', '$state', function ($scope, $state) {

            $scope.$watch('tileConfig', function () {
                if ($scope.tileConfig) {
                    $scope.style = {
                        color: $scope.tileConfig.iconColor
                    };

                    $scope.navigate = function () {
                        if ($scope.tileConfig.state) {
                            $state.go($scope.tileConfig.state);
                        }
                    };
                }
            });


        }];

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                tileConfig: '='
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/homeTile/homeTile.html'
        };
    }]);
})();
