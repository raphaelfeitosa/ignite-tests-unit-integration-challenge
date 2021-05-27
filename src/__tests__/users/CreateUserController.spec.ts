import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import createConnection from "../../database/index";

import { Connection } from "typeorm";
import { app } from "../../app";


let connection: Connection;

describe("Create User", () => {


  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {

    const response = await request(app).post("/api/v1/users")
      .send({
        name: "Feitosa",
        email: "raphael2@teste.com",
        password: "raphael"
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with existing email", async () => {

    const response = await request(app).post("/api/v1/users")
      .send({
        name: "Feitosa",
        email: "raphael2@teste.com",
        password: "raphael"
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      message: "User already exists"
    });
  });

});
