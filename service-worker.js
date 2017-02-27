'use strict';

var port;

self.addEventListener('activate', function(event) {

  event.waitUntil(
    clients.claim().then(function() {
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage('The service worker has activated and ' + 
            'taken control.');
        }));
      });
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var title = 'Yay a message.';
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'We have received a push notification.';
  }
  var icon = '/images/icon-192x192.png';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      return client.postMessage('push event from SW');
    }
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      data: body,
      tag: tag
    })
  }));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  console.log("Notification Click");
});
