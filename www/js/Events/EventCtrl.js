/**
 * Created by 758orenh on 3/22/2015.
 */

angular.module('photofi.controllers', ['photofi.event.service', 'ngCordova'])

    .controller('EventsCtrl', function ($scope, $state, $ionicHistory, EventsService) {
        console.log('event ctrl');
        $ionicHistory.clearHistory();
        $scope.events = EventsService.events();

        $scope.eventCount = Object.keys($scope.events).length;

        $scope.addEvent = function () {
            $state.go('events-add');
        };

        $scope.deleteEvent = function (eventName) {
            EventsService.removeEvent(eventName);
            $state.go($state.current, {}, {reload: true});
        }
    })
    .controller('AddEventCtrl', function ($scope, $location, EventsService, QrCode) {

        $scope.eventData = {};

        $scope.close = function () {
            $location.path('/events');
        };

        $scope.addEvent = function () {
            EventsService.addEvent($scope.eventData.Id, $scope.close);
        };


        $scope.qrCode = function(){
                QrCode.readQrCode().then(function(barcodeData) {
                    try{
                        var eventCode = barcodeData.text.split("-");
                        if(eventCode[0]=="photofi") {
                            $scope.eventData.Id = eventCode[1];
                        }
                    }
                    catch(err){
                        alert("Qr code is invalid");
                    }

                }, function(error) {
                    alert("Qr code is invalid");
                });

        };
    })
    .controller('GalleryCtrl', function ($scope, $ionicModal, eventId, EventsService) {
        $scope.links = [];

        EventsService.getImagesLinks(eventId, function (images) {
            $scope.links = images;
        });

        $scope.doRefresh = function () {
            EventsService.getImagesLinks(eventId, function (images) {
                $scope.links = images;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $ionicModal.fromTemplateUrl('templates/image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function () {
            $scope.isOptionShown = false;
            $scope.modal.show();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.imageSrc = null;
            $scope.modal.remove();
        });

        $scope.$on('modal.shown', function () {
            console.log('Modal is shown!');
        });

        $scope.showImage = function (selectedImage) {
            $scope.imageSrc = selectedImage + '_c.jpg';
            $scope.openModal();
        };

    })
    .controller('FullImageCtrl', function ($scope, $cordovaSocialSharing, $cordovaToast, saveFileFrom, ReportImage) {

        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        $scope.showOptions = function ($event) {
            $event.stopPropagation();
            $scope.isOptionShown = !$scope.isOptionShown;
        };
        try {
            if (device && device.platform != 'iOS') {
                $scope.download = function ($event) {
                    $event.stopPropagation();
                    saveFileFrom($scope.imageSrc, $cordovaToast);
                };
            }
        }catch(err){

        }

        $scope.share = function ($event) {
            $event.stopPropagation();
            $cordovaSocialSharing
                .share("", "Share via Photofi", $scope.imageSrc, null) // Share via native share sheet
                .then(function (result) {
                    console.log(result);
                    $cordovaToast.show("shared successfully")
                }, function (err) {
                    alert("error occurred: " + err)
                });
        };

        $scope.report = function ($event, imageSrc) {
            ReportImage.report($event.eventId, imageSrc).then(function () {
                $cordovaToast.show("reported successfully");
            }, function () {
                $cordovaToast.show("report failed, try again later");
            });
        };
    })
;