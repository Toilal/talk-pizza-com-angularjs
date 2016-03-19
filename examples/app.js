angular.module('Examples', []);


angular.module('Examples')
    .controller('ResetCtrl', function() {
        this.value = 'lorem ipsum';

        this.reset = function() {
            this.value = '';
        }
    })

    .controller('ResetDirectiveCtrl', function($scope) {
        // $scope est obtenu par injection de dépendance
        if (!$scope.value) {
            $scope.value = 'lorem ipsum';
        }

        if (!$scope.resetValue) {
            $scope.resetValue = '';
        }

        this.reset = function() {
            $scope.value = $scope.resetValue;
        }
    })

    .directive('resetInput', function() {
        return {
            scope: {
                label: '@',
                value: '=?',
                resetValue: '=?'
            },
            templateUrl: 'examples/reset.html',
            controller: 'ResetDirectiveCtrl',
            controllerAs: 'ctrl'
        };
    })

    .controller('AngularDirectivesCtrl', function() {
        this.components = [
            {label: '#1', value: 'Premier', resetValue: 'Le numero 1'},
            {label: '#2', value: 'Deuxième', resetValue: 'Le numero 2'},
            {label: '#3', value: 'Troisième', resetValue: 'Le numero 3', hidden: true},
            {label: '#4', value: 'Quatrième', resetValue: 'Le numero 4'}
        ];

        this.handleClick = function(component) {
            // On sélectionne le composant s'il n'est pas déja selectionné, sinon le le déselectionne.
            this.selectedComponent = component != this.selectedComponent ? component : null;
        }
    });

