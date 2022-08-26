
let storedPrompt;
let swjs;
const enableNotificationsButton = $('.enable_notification');
const pwaBtn = $('.addpwa');
const browser_lable = $('#browser-support');
const pwalable = $('#pwa-uninstall-lable');

pwaBtn[0].style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    storedPrompt = e;
    pwalable[0].style.display='none';
    pwaBtn[0].style.display = 'block';
    pwaBtn[0].addEventListener('click', () => {
        pwaBtn[0].style.display = 'none';

        storedPrompt.prompt();
        storedPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                pwalable[0].style.display='block';
            }
            storedPrompt = null;

        });
    });
});

function isInstalled() {
    if (navigator.userAgent.match(/chrome|chromium|crios/i)) {
        pwalable[0].style.display='block';
        browser_lable[0].style.display='none';
    }
    else {
        pwalable[0].style.display='none';
        browser_lable[0].style.display='block';
    }
}

isInstalled();


function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }




const display_confirmation = () => { 
    if ('serviceWorker' in navigator) { 
       const options = {
             body: 'You have successfully subscribed to Submitty Notification Services!',
             icon: 'img/pwa_512.png',
             dir: 'ltr',
             lang: 'en-US',
             badge: 'img/submitty-banner.png',
             tag: 'confirm-notification',
      };
      console.log("some notification")
      let notification = new Notification("Succesfully Subscribed", options);

      notification.onclick = () => {
             notification.close();
             window.parent.focus();
      }
}
}

function configurePushSub() {
    if (!('serviceWorker' in navigator)) {
      console.error('no service worker')
      return;
    }
    console.log("after service worker");
    navigator.serviceWorker.ready
      .then((reg) => {
        swjs = reg;
        console.log("got serviceworker");
        return swjs.pushManager.getSubscription();
      })
      .then(function(sub) {
        if (sub === null) {
          console.log("creating new subscription");
          // Create a new subscription
          var vapidPublicKey = 'BHIJ8RdT7YplbzghbLRP53dSrJVQnBAjKmAq-HBfclBMAG6qrqtf_6WSMveBVUKar5TOr36xL4Vmc21pBIWf8bA';
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
          console.group(convertedVapidPublicKey);
          console.group(swjs);
          return swjs.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          });
        } else {
          // We have a subscription
          console.log("already have subscription");
        }
      })
      .then(function(newSub) {
        console.log("sending subs");
        return fetch('http://localhost:3000/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSub)
        })
        
      })
      .then(function(res) {
        if (res.ok) {
          console.log("buddy")
          display_confirmation();
        }
      })
      .catch(function(err) {
        console.log(err);
      });
  }

 

  

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
      console.log('Permission', result);
      if (result !== 'granted') {
        console.log('Notification permission denied!');
      } else {
        configurePushSub();
      }
    });
  }
  
if ('Notification' in window) {
      console.log(enableNotificationsButton);
      enableNotificationsButton[0].style.display = 'block';
      enableNotificationsButton[0].addEventListener('click', askForNotificationPermission);
  }