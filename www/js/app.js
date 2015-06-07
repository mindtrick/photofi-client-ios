// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('photofi', ['ionic', 'photofi.controllers', 'ngCordova'])

    .run(function ($ionicPlatform, $cordovaSplashscreen) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            $cordovaSplashscreen.show();
            setTimeout(function() {
                $cordovaSplashscreen.hide()
            }, 5000)
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider


            .state('events-index', {
                url: "/events",
                templateUrl: "templates/events.html",
                controller: 'EventsCtrl'
            })

            .state('events-details', {
                url: "/event/:event",
                templateUrl: "templates/gallery.html",
                controller: 'GalleryCtrl',
                resolve: {
                    eventId: function ($stateParams) {
                        return $stateParams.event;
                    }
                }

            })

            .state('events-add', {
                url: "/events/add",
                templateUrl: "templates/add-event.html",
                controller: 'AddEventCtrl'

            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/events');
    });

