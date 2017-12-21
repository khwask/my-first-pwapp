var cacheName = 'weatherPWA-step-6-2';
var dataCacheName = 'weatherData-v1';

var filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/clear.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

self.addEventListener('install', function(e){
    console.log('[SW] install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[SW] caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e){
    console.log('[SW] activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[SW] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[SW] fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.match(e.request).then(function(response){
                if (response) {
                    return response;
                }
//                var fetchReq = e.request.clone();
                return fetch(e.request).then(function(response){
                    var cacheRes = response.clone();
                    caches.open(dataCacheName).then(function(cache){
                        cache.put(e.request.url, cacheRes);
                    });
                    return response;
                })
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});