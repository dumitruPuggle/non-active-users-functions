import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();
getFirestore();

export const getNonActiveUsers = functions.https.onRequest(
  async (request, response) => {
    try {
      const { users } = await getAuth().getUsers([
        { email: "dumitruiurie@gmail.com" },
      ]);
      users.forEach((user, index) => {
        console.log(user);
        const isUserInactive = user.metadata.creationTime;
        console.log();
        response.send(`${user.email} ${user.metadata.creationTime}`);
      });
    } catch (e) {
      // Handle the error
    }
  }
);
