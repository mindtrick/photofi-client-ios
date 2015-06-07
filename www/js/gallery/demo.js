/*
 * blueimp Gallery Demo JS 2.12.1
 * https://github.com/blueimp/Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global blueimp, $ */

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

$(document).ready(function () {
    'use strict';
    var host = "http://photofim-mindtrick.rhcloud.com/";
    // Load demo images from flickr:
    $.ajax({
        // Flickr API is SSL only:
        // https://code.flickr.net/2014/04/30/flickr-api-going-ssl-only-on-june-27th-2014/
        url: host + "event/" + getUrlParameter("eventid"),
        dataType: 'json'
    }).done(function (result) {
        var carouselLinks = [],
            linksContainer = $('#links'),
            baseUrl;
        // Add the demo images as links with thumbnails to the page:
        $.each(result.data.Images, function (index, photo) {
            var photoId = photo.image.substring(photo.image.lastIndexOf('/') + 1)
            if (photoId.indexOf('.png') == -1) {
                $.ajax({
                    // Flickr API is SSL only:
                    // https://code.flickr.net/2014/04/30/flickr-api-going-ssl-only-on-june-27th-2014/
                    url: 'https://api.flickr.com/services/rest/',
                    data: {
                        format: 'json',
                        method: 'flickr.photos.getInfo',
                        photo_id: photoId,
                        secret: '54d8fa97497e1a20',
                        api_key: '7fd5098f759f7dab60f02cc869e5f916' // jshint ignore:line
                    },
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback'
                }).done(function (result) {
                    var baseUrl = 'https://farm' + result.photo.farm + '.static.flickr.com/' +
                        result.photo.server + '/' + result.photo.id + '_' + result.photo.secret;
                    $('<a/>')
                        .append($('<img>').prop('src', baseUrl + '_s.jpg'))
                        .prop('href', baseUrl + '_b.jpg')
                        .prop('title', result.photo.title)
                        .attr('data-gallery', '')
                        .appendTo(linksContainer);
                    carouselLinks.push({
                        href: baseUrl + '_c.jpg',
                        title: ''
                    });
                });
            }
        });
        // Initialize the Gallery as image carousel:
        blueimp.Gallery(carouselLinks, {
            container: '#blueimp-image-carousel',
            carousel: true
        });
    });

    // Initialize the Gallery as video carousel:
    blueimp.Gallery([], {
        container: '#blueimp-video-carousel',
        carousel: true
    });

});
