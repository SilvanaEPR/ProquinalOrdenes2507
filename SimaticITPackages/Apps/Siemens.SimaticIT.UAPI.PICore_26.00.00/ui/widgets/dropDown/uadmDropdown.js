(function () {

    angular.module('Siemens.SimaticIT.UAPI.PICore').directive('uadmDropdown', [function () {

        var controller = ['$scope', function ($scope) {
            $scope.$watch('dropdownConfig', function () {
                if ($scope.dropdownConfig && $scope.dropdownConfig.items && $scope.dropdownConfig.items.length > 0) {
                    $scope.selected = $scope.dropdownConfig.items[0];

                    $scope.select = function (item) {
                        $scope.selected = item;
                        $scope.dropDownVisible = false;
                        if ($scope.dropdownConfig.onSelect) {
                            $scope.dropdownConfig.onSelect(item);
                        }
                    };

                    $scope.dropdownConfig.items.forEach(function (item) {
                        item.style = {
                            color: item.color
                        };
                    });
                }
            });
        }];

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                dropdownConfig: '='
            },
            templateUrl: 'Siemens.SimaticIT.UAPI.PICore/widgets/dropdown/uadmDropdown.html'
        };
    }]);
})();
