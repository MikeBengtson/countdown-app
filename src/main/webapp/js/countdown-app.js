var promise;
var demoApp = angular.module('app', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.datetimepicker']);

demoApp.config(
    [
        '$routeProvider', function($routeProvider) {
        $routeProvider
            .when(
                '/', {
                    templateUrl: '../timer-list.html',
                    controller: 'DisplayController'
                }
            ).otherwise({redirectTo: '/'});
    }
    ]
);

// Region directives
demoApp.directive("editButton", function() {
    return {
        template: "<button type=\"button\" class=\"btn btn-danger btn-circle\" ng-show=\"$scope.editing\" ng-click=\"deleteTimer($index)\"><i class=\"glyphicon glyphicon-minus\"></i></button >"
    };
});

// Region services
demoApp.service('dataService', [
    function() {
        var countdowns = [
            {name: 'Cruise', date: 'Sep 24 2017 10:30:00 GMT-0400 (EDT)'},
            {name: 'Birthday', date: 'Oct 1 2017 00:00:00 GMT-0400 (EDT)'},
        ];

        var timers = countdowns.map(
            function(countdown) {
                var retval = new Object();
                retval.name = countdown.name;
                retval.date = new Date(countdown.date);
                return retval;
            }
        );

        this.getTimers = function() {
            return timers;
        }

        this.addTimer = function(name, dateString) {
            var timer = new Object();
            timer.name = name;
            timer.date = new Date(dateString);
            timers.push(timer);
        }

        this.deleteTimer = function(index) {
            timers.splice(index, 1);
        };
    }
]);

// Region controllers
demoApp.controller('testController', function($uibModalInstance) {
    var that = this;

    this.isOpen = false;

    this.openCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();

        that.isOpen = true;
    };

    this.ok = function() {
        $uibModalInstance.close({name: this.name, date: this.date});
    };
    this.close = function(result) {
        $uibModalInstance.dismiss('cancel');
    }
});

demoApp.controller(
    'DisplayController', function($scope, $interval, $uibModal, dataService) {
        $scope.display = [];

        $scope.addTimer = function() {
            var modalDefaults = {
                backdrop: true,
                keyboard: true,
                modalFade: true,
                templateUrl: '../add-timer.html',
                controller: 'testController',
                controllerAs: 'testController'
            };

            $uibModal.open(modalDefaults).result.then(function(result) {
                if (result.name != null && result.date != null) {
                    dataService.addTimer(result.name, result.date);
                }
            }, function() {
                console.log('Cancel');
            });

        };

        $scope.deleteTimer = function(index) {
            dataService.deleteTimer(index);
        };

        $scope.updateTimers = function() {
            $scope.display = dataService.getTimers().map(
                function(timer) {
                    var retval = new Object();
                    retval.name = timer.name;
                    var ts = countdown(
                        null, timer.date,
                        countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
                    );
                    retval.time = ts.toString();

                    if (ts.value < 0) {
                        retval.modifier = 'since';
                    }
                    else if (ts.value > 0) {
                        retval.modifier = 'until';
                    }

                    return retval;
                }
            );
        };

        $scope.start = function() {
            return $interval(
                $scope.updateTimers
                , 1000
            );
        };

        $scope.stop = function() {
            $interval.cancel(promise);
        };

        $scope.$on(
            '$destroy', function() {
                $scope.stop();
            }
        );

        promise = $scope.start();
        $scope.updateTimers();
        $scope.editing = false;

    }
)
;
