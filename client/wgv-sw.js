/*global Promise*/
/*eslint no-undef: "error"*/
const CACHE_NAME = "weatherbyGV-static-cache-v1"
const FILES_TO_CACHE = [
	"/",
	"/icons/favicon.ico",
	"/index.html",
	"/images/UV-index-scale-mini.jpg",
	"/dist/index.js",
	"/dist/weather.png",
]
const DATA_CACHE_NAME = "weatherbyGV-data-cache-v1"

// install
self.addEventListener("install", function (evt) {
	console.log("[SW] Install")
	// FOLLOWING COMMENTS TAKEN FROM MDN Website
	// for more information see: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
	evt.waitUntil(
		/*
		caches is a special CacheStorage object available in the scope of the given Service Worker to enable saving data —
		 saving to web storage won't work, because web storage is synchronous. 
		 With Service Workers, we use the Cache API instead
		*/
		// Here, we open a cache with a given name (CACHE_NAME),
		caches.open(CACHE_NAME).then(cache => {
			console.log("[SW] Your files were pre-cached successfully!")
			/*
			then add all the files our app uses to the cache, 
			so they are available next time it loads (identified by request URL).
			*/
			return cache.addAll(FILES_TO_CACHE)
		}),
	)

	self.skipWaiting()
})

// activate
self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then(keyList => {
			return Promise.all(
				keyList.map(key => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log("[SW] Removing old cache data", key)
						// This ensures we have only the files we need in the cache, so we don't leave any garbage behind;
						return CacheStorage.delete(key)
					}
				}),
			)
		}),
	)

	self.clients.claim()
})

// fetch
self.addEventListener("fetch", function (evt) {
	// for future specificity
	// if (evt.request.url.includes("/api/")) {
	// }
	evt.respondWith(
		caches
			.open(DATA_CACHE_NAME)
			.then(async cache => {
				try {
					const response = await fetch(evt.request)
					// If the response was good, clone it and store it in the cache.
					if (response.status === 200) {
						// caching new response
						cache.put(evt.request.url, response.clone())
					}
					return response
				} catch (err) {
					return cache.match(evt.request)
				}
			})
			.catch(err => console.log(err)),
	)
})
