import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();
const db = getFirestore();

const isDateExpired = (date: string, daysFromNow: number): boolean => {
  // Get current date
  let today = new Date();

  // Subtract days from current date
  let daysAgo = new Date(today.getTime() - daysFromNow * 24 * 60 * 60 * 1000);

  // Parse the given date string
  let givenDate = new Date(date);

  return givenDate < daysAgo;
};

const getUserReference = async (uid: string) => {
  return db.collection("UserDetails").doc(uid);
};

const getUserUpdatedAt = async (uid: string) => {
  const userRef = await getUserReference(uid);
  try {
    const doc = await userRef.get();
    if (doc.exists) {
      const data: any = doc.data();
      const updatedAt = data?.updatedAt;
      return updatedAt.toDate().toDateString();
    }
  } catch (e) {}
  return null;
};

const fetchInactiveUsers = async function () {
  const [isInsideCloudFunctions, , response] = [
    arguments.length > 0,
    arguments[0],
    arguments[1],
  ];
  try {
    const { users } = await getAuth().getUsers([
      { email: "dumitruiurie@gmail.com" },
    ]);
    const userDeletionQueue: string[] = [];
    users.forEach(async (user) => {
      const userCreatedAt = user.metadata.creationTime;
      const userUpdatedAt = await getUserUpdatedAt(user.uid);

      const isUser30DaysOld = isDateExpired(userCreatedAt, 30);
      const isUserInActiveFor90Days = isDateExpired(userUpdatedAt, 90);

      const triggerSecondAttempt = isUser30DaysOld && isUserInActiveFor90Days;
      console.log(triggerSecondAttempt);
    });
    if (isInsideCloudFunctions) {
      response.send(JSON.stringify(userDeletionQueue));
    }
  } catch (e) {
    response.send("An unexpected error has occurred");
  }
};

export const getNonActiveUsers = functions.https.onRequest(fetchInactiveUsers);
