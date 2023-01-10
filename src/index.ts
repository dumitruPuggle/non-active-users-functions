import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();
getFirestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const getNonActiveUsers = functions.https.onRequest(
  async (request, response) => {
    try {
      const { users } = await getAuth().getUsers([
        { email: "dumitruiurie@gmail.com" },
      ]);
      users.forEach((user, index) => {
        console.log(user);
        response.send(`${user.email} ${user.metadata.creationTime}`);
      });
    } catch (e) {
      // Handle the error
    }
  }
);
