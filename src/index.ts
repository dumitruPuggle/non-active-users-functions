import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();
getFirestore();

const isDateExpired = (date: string): boolean => {
  // Get current date
  let today = new Date();

  // Subtract 30 days from current date
  let thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parse the given date string
  let givenDate = new Date(date);

  // return if given date is older than 30 days
  return givenDate < thirtyDaysAgo;
};

export const getNonActiveUsers = functions.https.onRequest(
  async (request, response) => {
    try {
      const { users } = await getAuth().getUsers([
        { email: "dumitruiurie@gmail.com" },
      ]);
      users.forEach((user, index) => {
        const isUser30DaysOld = isDateExpired(user.metadata.creationTime);
        response.send(
          `Email: ${user.email} CreationTime: ${user.metadata.creationTime} isExpired: ${isUser30DaysOld}`
        );
      });
    } catch (e) {
      // Handle the error
    }
  }
);
