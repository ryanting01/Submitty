const db_cred= require('../config/database.json'); 


const { Client } = require("pg");
const webpush = require('web-push');

// VAPID keys for validations and security
const vapidKeys = {
  publicKey:
    'BBE6zGMtikC3Wdkma0TF4A6Qs-ehdhv_PpJX1hxkSUgVut6fijqO8OkbzQ5oXZ8zZBugvhj0ztlMgyYeWkmYBao',
  privateKey: 'yegbxXOSn3M5zF9UCvLAU8iOi-qh6iyFhZNet_G7Cx8'
};

// might want to have it stored in vagrant machine
webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


// This is the hard coded push subsciption , this needs to be loaded from a database of stored pushURLS
const pushSubscription = {endpoint:"https://fcm.googleapis.com/fcm/send/f9RRGp32wGQ:APA91bGoXkEHmBsIP2WsGVi-okE5GXu6iaNutyZ_Gr904dtq6FYzBirg1cjc7y7YGk3cdqelApUZbfPv6EJWp9paXQIJctixGyaFAt0DyuUc01ZhgOD7TyNdzZtucvTX4TqEdhtQFM34",
expirationTime:null,
keys:
{p256dh:"BNJVvIcG5u6OoRXeIW-FK5RqlXIid7nCbbEQ12tVTOfjCwvtbJ2NZYMecF5UOzoShzdZJdK8S8BCWSxOBWHCglw",
auth:"Ba4JuXuoyAHSFHsbApQ92w"}}



// Connecting the database
const connectDB = async () => {
  try {
      const client = new Client({
          user: db_cred.database_user,
          host: db_cred.database_host,
          database: "submitty_s22_sample",
          password: db_cred.database_password,
          port: db_cred.database_port
      })

      await client.connect();
      const notifications = await client.query('SELECT * FROM notifications ');
      await client.end();
      return notifications;

  } catch (error) {
      console.log(error);
  }
}


// sending the push notifications

  const send_push_notifications = async () => {
  const notifications_fetched = await connectDB();
  notifications_fetched.rows.forEach(row => {
    webpush.sendNotification(pushSubscription, JSON.stringify({
      title: row.component,
      content: row.content
    }));
    
  });
  console.log("notifications sent successfully")

  }


send_push_notifications();