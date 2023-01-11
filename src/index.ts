import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
// import { database } from "firebase-admin";

initializeApp();
const firestore_db = getFirestore();
// const db = database();

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
  return firestore_db.collection("UserDetails").doc(uid);
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

// const getScheduledPostReference = () => {
//   return db.ref("/ScheduledPost/content-projects/selectedProjectId");
// };

// const getLastAddedPostRTDB = async () => {
//   const postRef = getScheduledPostReference();
//   return await postRef.get();
// };
const userDeletionQueue = {
  queue: [],
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
    users.forEach(async (user) => {
      const userCreatedAt = user.metadata.creationTime;
      const isUser30DaysOld = isDateExpired(userCreatedAt, 1);

      if (isUser30DaysOld) {
        const userUpdatedAt = await getUserUpdatedAt(user.uid);
        const isUserInactiveFor90Days = isDateExpired(userUpdatedAt, 90);

        if (isUserInactiveFor90Days) {
          // const lastAddedPostOn = await getLastAddedPostRTDB().val();
        }
      }
      console.log(userDeletionQueue);
    });
    if (isInsideCloudFunctions) {
      response.send(JSON.stringify(userDeletionQueue));
    }
  } catch (e) {
    response.send("An unexpected error has occurred");
  }
};

export const getNonActiveUsers = functions.https.onRequest(fetchInactiveUsers);
