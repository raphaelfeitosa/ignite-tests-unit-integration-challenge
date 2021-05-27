import request from "supertest";
import createConnection from "../../database/index";
import { Connection } from "typeorm";
import { app } from "../../app";

let connection: Connection;

describe("Show Profile User", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able show profile user", async () => {

    const userCreated = await request(app).post("/api/v1/users")
      .send({
        name: "Feitosa",
        email: "raphael3@teste.com",
        password: "raphael"
      });

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "raphael3@teste.com",
        password: "raphael"
      });

    const { token } = responseToken.body

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send();

    expect(userCreated.status).toBe(201);
    expect(response.status).toBe(200);
  });

  it("should not be able to return information for a user with an tampered token", async () => {
    const userCreated = await request(app).post("/api/v1/users")
      .send({
        name: "Feitosa",
        email: "raphael5@teste.com",
        password: "raphael"
      });

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "raphael5@teste.com",
        password: "raphael"
      });

    let { token } = responseToken.body;

    // Remove o primeiro caractere para adulterar o token
    token = token.replace(/^./, "");

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(userCreated.status).toBe(201);
    expect(response.body.message).toEqual("JWT invalid token!");
    expect(response.status).toBe(401);
  });

  it("should not be able to return information user with invalid token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer `,
    });

    expect(response.body.message).toEqual("JWT invalid token!");
    expect(response.status).toBe(401);
  });

  it("should not be able to return information user with missing token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: ``,
    });

    expect(response.body.message).toEqual("JWT token is missing!");
    expect(response.status).toBe(401);
  });

});











