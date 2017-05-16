const version = 8;

self.addEventListener("install", function (e) {
    console.log("LegoPDB SW v%s installed at ", version, new Date().toLocaleTimeString());

    e.waitUntil(
        caches.open(version)
            .then(function (cache) {
                return cache.addAll(["offline.html"]);
            }));
});

self.addEventListener("activate", function (e) {
    console.log("LegoPDB SW v%s activated at ", version, new Date().toLocaleTimeString());

    e.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.filter(function (key) {
                    return key !== version;
                }).map(function (key) {
                    return caches.delete(key);
                }));
            }));
});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (res) {
                if (res)
                    return res;

                if (!navigator.onLine)
                    return caches.match(new Request("/offline.html"));

                return fetchAndUpdate(e.request);
            }));
});

self.addEventListener("push", function(e) {
    console.log("Received push event");
    console.log(`Push data: "${e.data.text()}"`);

    const title = "Lego PDB";
    const options = {
        body: "Some bricks could use restocking",
        icon: "/assets/media/pushicon.jpg",
        badge: "/assets/media/pushicon.jpg"
    };

    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function(e) {
    console.log("Notification clicked");

    e.notification.close();

    e.waitUntil(
        clients.openWindow("https://www.youtube.com/watch?v=y9K18CGEeiI")
    );
});

function fetchAndUpdate(request) {
    return fetch(request)
        .then(function (res) {
            if (res) {
                return caches.open(version)
                    .then(function (cache) {
                        return cache.put(request, res.clone())
                            .then(function () {
                                return res;
                            });
                    });
            }
        });
}