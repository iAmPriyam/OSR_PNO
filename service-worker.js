'use strict';
var uid;

self.importScripts('helpers.js');

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
  var data = {};
  if (event.data != undefined) {
    body = event.data.text();
    data.msg = body;
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
      data: data,
      tag: tag,			/*please remove “tag” if you don’t want overwrite last message,
                          for further info goto https://www.w3.org/TR/notifications*/
						  
      requireInteraction: true,   // Interaction with the notification as it is received
				mozbehavior: {
					soundFile: '/ringtone/audio_video_silent_push.mp3'			//Set ringtone path if required when notification is received
				},
				actions: [{
					action: 'open', 		
					title: 'Open'			//Option to display to user	
				}, { 
					action: 'dismiss', 
					title: 'Dismiss'		//Option to display to user
				}],	  
	  
    })
	
  }));
});

self.addEventListener('pushsubscriptionchange', e => {
  console.log('Subscription expired');
  var _applicationKeys = {
    publicKey: base64UrlToUint8Array(
      'BIuoU7oJ1yjSv9081Kw2tpN10y6Zi3U7OQnHrbssrkVP8z1igHjKFfwQFNl1MnLBXvwyNMNulq-_nBdXzujrxUc'),
  };
  e.waitUntil(registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _applicationKeys.publicKey,
    })
    .then(subscription => {
      // TODO: Send new subscription to application server
	  /*Accessing cache in which User Id was saved. The cache is created in push.js when endpoint is registered*/
	caches.open('my-cache').then(function (cache) {
		cache.match('/test.json').then((response) => {
			response.json().then((jres) => {
				console.log(jres.id);
				uid = jres.id;
				console.log(uid);
		});
		});
	});
	
	/*Sending the new endpoint to server along with User Id*/
	   // return fetch('register', {
        // method: 'post',
        // headers: {
          // 'Content-type': 'application/json'
        // },
        // body: JSON.stringify({
		  // userid: uid,
          // endpoint: subscription
        // })
      // });
      console.log("subscription:new " + JSON.stringify(subscription.toJSON()));
    }));
});

self.addEventListener('notificationclick', function(event) {
  
  console.log("Notification Click");
   
  if (event.action === 'open') {			//Handling the Open option
			if (event.notification.data != undefined) {
				var openAppEvent = {
					msg: event.notification.data
				};
				  
			  	clients.openApp(openAppEvent);
			} else {
			  	event.notification.close();
			}
		} 
 
  else {
    clients.openApp();
  }
});
