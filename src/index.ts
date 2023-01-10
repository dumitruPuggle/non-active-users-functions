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

const fetchInactiveUsers = async function () {
  const [isInsideCloudFunctions, request, response] = [
    arguments.length > 0,
    arguments[0],
    arguments[1],
  ];
  try {
    const { users } = await getAuth().getUsers([
      { email: "dumitruiurie@gmail.com" },
    ]);
    const verifiedUsersToken: string[] = [];
    users.forEach((user, index) => {
      const isUser30DaysOld = isDateExpired(user.metadata.creationTime);
      console.log(isUser30DaysOld);
    });
    if (isInsideCloudFunctions) {
      response.send(JSON.stringify(verifiedUsersToken));
    }
  } catch (e) {
    response.send("An unexpected error has occurred");
  }
};

export const getNonActiveUsers = functions.https.onRequest(fetchInactiveUsers);
