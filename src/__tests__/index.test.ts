import * as admin from "firebase-admin";
import test from "firebase-functions-test";

describe("fetchInactiveUsers", () => {
  let index, adminStub;
  let testEnv: any;
  beforeAll(() => {
    testEnv = test(
      {
        databaseURL:
          "https://non-active-users-prototype-default-rtdb.firebaseio.com",
        projectId: "non-active-users-prototype",
        storageBucket: "non-active-users-prototype.appspot.com",
      },
      "./serviceKey.json"
    );
    adminStub = jest.spyOn(admin, "initializeApp");
    index = require("./index");
    return;
  });
});
