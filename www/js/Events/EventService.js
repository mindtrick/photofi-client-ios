/**
 * Created by 758orenh on 3/22/2015.
 */
//var apiUrl = 'http://prod-photofi.rhcloud.com';
var apiUrl = 'http://api.photofi.co.il';
//var apiUrl = 'http://localhost:8080';
var privateKey = "Photofi.,-K3y-4_different=httprequests";

angular.module('photofi.event.service', ['ngCordova'])
    .factory('EventsService', function ($http) {


        var GetEvents = function () {
            var events = JSON.parse(localStorage.getItem('events'));
            if (!events) {
                events = {};
            }
            return events;
        };


        var GetEventById = function (id, callback) {
            var url = '/event/' + id;
            var hash = CryptoJS.HmacSHA1(url, privateKey);
            url = apiUrl + url + "?hash="+hash.toString(CryptoJS.enc.Hex);
            $http.get(url).success(function (response) {
                if (response["type"]) {
                    var data = response["data"];
                    var event = {
                        description: data["description"],
                        eventId: data["eventId"],
                        title: data["title"]
                    };

                    var events = GetEvents();
                    events[data["eventId"]] = event;
                    localStorage.setItem('events', JSON.stringify(events));
                    callback();

                } else {
                    alert("קוד אירוע לא נכון");
                }
            }).error(function (err) {
                alert("קוד אירוע לא נכון");
            });

        };


        var GetImagesLinks = function (eventId, success_callback) {
            var url = '/event/' + eventId;
            var hash = CryptoJS.HmacSHA1(url, privateKey);
            url = apiUrl + url + "?hash="+hash.toString(CryptoJS.enc.Hex);
            $http.get(url).then(function (response) {

                var event = response.data["data"];
                success_callback(event.Images);

            });
        };

        var DeleteEvent = function (eventName) {
            var events = GetEvents();
            delete events[eventName];
            localStorage.setItem('events', JSON.stringify(events));
        };


        // Return a reference to the function
        return {
            events: (GetEvents),
            addEvent: (GetEventById),
            getImagesLinks: (GetImagesLinks),
            removeEvent: (DeleteEvent)
        };

    })

    .factory('saveFileFrom', [function () {

        return function (url, $cordovaToast) {


            var success = function(msg){
                $cordovaToast.show("התמונה הועלתה בהצלחה");
            };

            var error = function(err){
                alert(err);
            };

            function saveImageToPhone(url_temp, success, error) {
                var canvas, context, imageDataUrl, imageData;
                var img = new Image();
                img.onload = function() {
                    canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context = canvas.getContext('2d');
                    context.drawImage(img, 0, 0);
                    try {
                        imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
                        imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
                        cordova.exec(
                            success,
                            error,
                            'Canvas2ImagePlugin',
                            'saveImageDataToLibrary',
                            [imageData]
                        );
                    }
                    catch(e) {
                        error(e.message);
                    }
                };

                img.onerror = error;
                try {
                    img.src = url_temp;
                }
                catch(e) {
                    error(e.message);
                }
            }
            saveImageToPhone(url, success, error);
        };
    }])


    .factory('ReportImage', function($http, $q, HttpRequestHash){
        var Report = function(eventId, imgSrc){
            var deffer = $q.defer();

            var url = '/report',
                body = {eventId: eventId, imgSrc: imgSrc},
                new_url = HttpRequestHash.createHash(url, body);
            $http.post(new_url, JSON.stringify(body)).success(function (response) {
                deffer.resolve();
            }).error(function(response){
                console.log(response);
                deffer.reject();
            });

            return deffer.promise;
        };

        return {
            report: Report
        }

    })

    .factory('HttpRequestHash', function () {

        var key = "Photofi.,-K3y-4_different=httprequests";

        var CreateHash = function (url, body) {
            var jsonBody = JSON.stringify(body);
            var text = jsonBody ? url + jsonBody : url;
            var hash = CryptoJS.HmacSHA1(text, key).toString(CryptoJS.enc.Hex);
            if (url.indexOf('?') == -1) {
                return apiUrl + url + '?hash=' + hash;
            }
            else {
                return apiUrl + url + '&hash=' + hash;
            }
        };

        return {
            createHash: (CreateHash)
        }
    })


    .factory('QrCode', function ($cordovaBarcodeScanner) {

        var self = this;

        self.readQrCode = function(){
            return $cordovaBarcodeScanner.scan();
        };

        return self;

    })
;