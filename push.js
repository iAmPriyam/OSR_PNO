var registerBtn = document.querySelector("#register button");

var _applicationKeys = {
    publicKey: window.base64UrlToUint8Array(
        "BCcKGIMVX8uZNBQOnPZXItWB06gpy-lRj2lSiaCNLVvLi9R-TZ2siVaYmeKOwFxTe0DuZUgmE4KE6PKTm7nR_lw"
    ),
    privateKey: window.base64UrlToUint8Array(
        "EG1jPTq_K8j-QnEmKv7e3ySpBhmq_kZpCbuobi9GDJ8"
    ),
};

navigator.mozSetMessageHandler("serviceworker-notification", function (m) {
    console.log("Push notification = " + m.msg);
});

window.addEventListener("load", function () {
    registerBtn.addEventListener("click", function () {
        register();
    });

    // Check that service workers are supported, if so, progressively
    // enhance and add push messaging support, otherwise continue without it.
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/OSR_PNO/service-worker.js")
            .then(function (reg) {
                if (reg.installing) {
                    console.log("Service worker installing");
                } else if (reg.waiting) {
                    console.log("Service worker installed");
                } else if (reg.active) {
                    console.log("Service worker active");
                }

                navigator.serviceWorker.addEventListener("message", function (
                    event
                ) {
                    console.log(event.data);
                });

                initialiseState(reg);
            });
    } else {
        console.log("Service workers aren't supported in this browser.");
    }
});

function register() {
    navigator.serviceWorker.ready
        .then((serviceWorkerRegistration) => {
            return serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: _applicationKeys.publicKey,
            });
        })
        .then((subscription) => {
            /*Creating cache for storing UserId*/
            const options = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            caches.open("my-cache").then(function (cache) {
                console.log("cache created");
                return cache.put(
                    "/test.json",
                    new Response('{"id": "UserId"}', options)
                );
            });
            /*END*/
            console.debug("subscription: " + JSON.stringify(subscription));
            document.getElementById("subscription").innerHTML = sub_details;
        })
        .catch((subscriptionErr) => {
            console.debug("subscriptionErr: " + subscriptionErr);
        });
}

function initialiseState(reg) {
    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function (reg) {
        // Do we already have a push message subscription?
        reg.pushManager
            .getSubscription()
            .then(function (subscription) {
                if (!subscription) {
                    console.log("Not yet subscribed to Push");
                    // We aren't subscribed to push, so set UI
                    // to allow the user to enable push
                    return;
                }
                console.log(
                    "subscription: " + JSON.stringify(subscription.toJSON())
                );
            })
            .catch(function (err) {
                console.log("Error during getSubscription()", err);
            });
    });
}

window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "SoftRight":
            register();
            break;
    }
});
