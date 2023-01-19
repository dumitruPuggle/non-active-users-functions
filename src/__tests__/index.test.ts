import { getAuth } from "firebase-admin/auth";
import { fetchInactiveUsers, firestoreFuncObj } from "../index";

describe("fetchInactiveUsers", () => {
  test("inactive users are correctly queued for deletion", async () => {
    // create mock user data
    const users: any = [
      {
        uid: "CxhX0xvxSsQ0OWBADKat6hyb1Nb2",
        metadata: {
          creationTime: new Date("2020-01-01T00:00:00.000Z"), // More than 30 days
        },
        _firestoreCall: {
          updatedAt: new Date("2021-01-01T00:00:00.000Z"), // More than 90 days
        },
        addToDeletionQueue: true,
      },
      {
        uid: "Os3QtMpZRveDqFEwEWZc4R8JSGJ3",
        metadata: {
          creationTime: new Date("2020-03-01T00:00:00.000Z"),
        },
        _firestoreCall: {
          updatedAt: new Date("2021-01-01T00:00:00.000Z"),
        },
        addToDeletionQueue: true,
      },
      {
        uid: "PVCbIo6EcTha9K2t4v1wDpByE6o2",
        metadata: {
          creationTime: new Date("2020-04-01T00:00:00.000Z"),
        },
        _firestoreCall: {
          updatedAt: new Date("2023-01-01T00:00:00.000Z"), // Less than 90 days
        },
        addToDeletionQueue: false,
      },
    ];

    // Mock listUsers function
    jest
      .spyOn(getAuth(), "listUsers")
      .mockImplementation(() => Promise.resolve({ users }));

    // Mock getUserUpdatedAt firebase call
    const mapUserUpdatedAt = (uid: string) => {
      return users.find((user: any) => user.uid === uid)._firestoreCall
        .updatedAt;
    };
    jest
      .spyOn(firestoreFuncObj, "getUserUpdatedAt")
      .mockImplementation(mapUserUpdatedAt);

    const fnDeletionQueue = ((await fetchInactiveUsers()) as any)
      .usersDeletionQueue;
    const actualDeletionQueue = users
      .filter((user: any) => user.addToDeletionQueue === true)
      .map((result: any) => result.uid);
    console.log(fnDeletionQueue, actualDeletionQueue);
    expect(fnDeletionQueue).toStrictEqual(actualDeletionQueue);
  });
});
