import { test, beforeAll, afterAll, describe } from "vitest";

import request from "supertest";

import { app } from "../app";

describe("Transaction routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("user can cerate a new trasnsaction", async () => {
    const response = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        content: 5000,
        type: "credit",
      })
      .expect(401);
  });
});
