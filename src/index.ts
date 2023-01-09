import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

const admin = initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const getNonActiveUsers = functions.https.onRequest(
  (request, response) => {
    functions.logger.info(admin);
    response.send("success");
  }
);
