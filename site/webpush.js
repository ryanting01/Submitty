 

const webpush = require('web-push');

// VAPID keys should only be generated only once.
const vapidKeys = {
  publicKey:
    'BBE6zGMtikC3Wdkma0TF4A6Qs-ehdhv_PpJX1hxkSUgVut6fijqO8OkbzQ5oXZ8zZBugvhj0ztlMgyYeWkmYBao',
  privateKey: 'yegbxXOSn3M5zF9UCvLAU8iOi-qh6iyFhZNet_G7Cx8'
};



webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {endpoint:"https://fcm.googleapis.com/fcm/send/f9RRGp32wGQ:APA91bGoXkEHmBsIP2WsGVi-okE5GXu6iaNutyZ_Gr904dtq6FYzBirg1cjc7y7YGk3cdqelApUZbfPv6EJWp9paXQIJctixGyaFAt0DyuUc01ZhgOD7TyNdzZtucvTX4TqEdhtQFM34",
expirationTime:null,
keys:
{p256dh:"BNJVvIcG5u6OoRXeIW-FK5RqlXIid7nCbbEQ12tVTOfjCwvtbJ2NZYMecF5UOzoShzdZJdK8S8BCWSxOBWHCglw",
auth:"Ba4JuXuoyAHSFHsbApQ92w"}}






webpush.sendNotification(pushSubscription, JSON.stringify({
    title: 'New Notification',
    content: "This is a push notification!"
  }));


