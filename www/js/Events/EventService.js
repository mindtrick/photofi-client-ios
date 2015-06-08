/**
 * Created by 758orenh on 3/22/2015.
 */
var apiUrl = 'http://prod-photofi.rhcloud.com';
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

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }



        return function (url, $cordovaFileTransfer) {


//            var targetPath = "Pictures/Photofi/" + guid() + ".png";
//            if (cordova.file.externalRootDirectory) {
//                targetPath = cordova.file.externalRootDirectory + targetPath;
//            }
//            else {
//                targetPath = cordova.file.applicationDirectory + targetPath;
//            }
//
//            if(device.platform == "iOS") {
//                targetPath = cordova.file.applicationDirectory + guid() + ".png";
//            }



            function onError(error) {
                alert(JSON.stringify(error));
            }

            function onSuccess(fileSystem) {
                alert("sucess" + url);
                var fileTransfer = new FileTransfer();
                var filePath = fileSystem.root.toNativeURL() + guid() + ".png";
                alert("path: " + filePath);
                fileTransfer.download(
                    encodeURI(url),
                    filePath,
                    function(entry) {
                        alert("download complete: " + entry.fullPath);
                    },
                    function(error) {
                        alert("download error source " + error.source);
                        alert("download error target " + error.target);
                        alert("upload error code" + error.code);
                    },
                    false,
                    {
                        headers: {
                            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                        }
                    }
                );
                console.log(fileSystem.name);
            }

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccess, onError);
//            alert(targetPath);
//            var trustHosts = true;
//            var options = {};
//
//            $cordovaFileTransfer.download(encodeURI(url), targetPath, options, trustHosts)
//                .then(function (result) {
//                    console.log("download complete: " + result);
//                    //TODO: change to toast
//                    alert("הקובץ ירד בהצלחה!");
//                }, function (err) {
//                    alert("error occured" + JSON.stringify(err));
//                }, function (progress) {
//                    console.log(progress);
//                });
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