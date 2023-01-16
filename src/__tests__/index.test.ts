import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { fetchInactiveUsers } from "../index";

describe("fetchInactiveUsers", () => {
  beforeAll(() => {
    var serviceKey = require("./serviceKey.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceKey),
      databaseURL:
        "https://non-active-users-prototype-default-rtdb.firebaseio.com",
    });
  });
  it("test", async () => {
    // create mock user data
    const mockUsers = [
      {
        uid: "CxhX0xvxSsQ0OWBADKat6hyb1Nb2",
        metadata: {
          creationTime: new Date("2020-01-01T00:00:00.000Z"),
        },
      },
      {
        uid: "Os3QtMpZRveDqFEwEWZc4R8JSGJ3",
        metadata: {
          creationTime: new Date("2020-03-01T00:00:00.000Z"),
        },
      },
      {
        uid: "PVCbIo6EcTha9K2t4v1wDpByE6o2",
        metadata: {
          creationTime: new Date("2020-04-01T00:00:00.000Z"),
        },
      },
    ];
    const listUsersStub = jest.spyOn(getAuth(), "listUsers");

    listUsersStub.mockResolvedValue({
      users: mockUsers as any,
      pageToken: undefined,
    });

    const getUserUpdatedAt = jest
      .spyOn(
        admin.firestore().doc("UserDetails/PVCbIo6EcTha9K2t4v1wDpByE6o2"),
        "get"
      )
      .mockResolvedValue(() => {
        return {
          data: jest.fn().mockImplementation(() => {
            return {
              updatedAt: new Date("2020-05-01T00:00:00.000Z"),
            };
          }),
        };
      });

    const result = await fetchInactiveUsers();
    // check if the correct inactive users were added to the deletion queue
    expect(result).toEqual({
      usersDeletionQueue: [],
      nextToken: undefined,
    });

    listUsersStub.mockRestore();
    getUserUpdatedAt.mockRestore();
  });
});
