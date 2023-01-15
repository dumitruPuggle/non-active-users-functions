import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { Response } from "express";
// import { Notification } from "./notifyUser";
// import { database } from "firebase-admin";

initializeApp();
const firestore_db = getFirestore();
// const db = database();

const isDateExpired = (date: string, daysFromNow: number): boolean => {
  if (!date) return false;
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
  } catch (e) {
    console.log(e);
  }
  return null;
};

// const getScheduledPostReference = () => {
//   return db.ref("/ScheduledPost/content-projects/selectedProjectId");
// };

// const getLastAddedPostRTDB = async () => {
//   const postRef = getScheduledPostReference();
//   return await postRef.get();
// };

type fetchInactiveUsersType = {
  usersDeletionQueue: any[];
  nextToken: string | undefined;
};
export const fetchInactiveUsers =
  async (): Promise<fetchInactiveUsersType | null> => {
    try {
      const usersInstance = await getAuth().listUsers(100);
      const { users } = usersInstance;
      // const addUserToQueue = (uid: string) => deletionQueue.push(uid);

      const userScan = async (user: UserRecord) => {
        const userCreatedAt = user.metadata.creationTime;
        const userUpdatedAt = await getUserUpdatedAt(user.uid);

        const isUser30DaysOld = isDateExpired(userCreatedAt, 30);
        const isUserInactiveFor90Days = isDateExpired(userUpdatedAt, 90);

        if (isUser30DaysOld && isUserInactiveFor90Days) {
          const userUid = user.uid;
          // const lastAddedPostOn = await getLastAddedPostRTDB().val();
          return userUid;
        }
        return null;
      };

      const deletionQueue: any[] = await Promise.all(users.map(userScan));
      const output = {
        usersDeletionQueue: deletionQueue.filter((user) => user),
        nextToken: usersInstance?.pageToken,
      };
      return output;
    } catch (e) {
      // Handle error
    }
    return null;
  };

const fetchInactiveUsersCloudFn = async function (
  request: any,
  response: Response
) {
  const output = await fetchInactiveUsers();
  const successFetch = Boolean(output);

  if (successFetch) {
    response.send(output);
    return;
  }
  response.sendStatus(500);
};

export const getNonActiveUsers = functions.https.onRequest(
  fetchInactiveUsersCloudFn
);
