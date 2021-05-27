import request from "supertest";
import createConnection from "../../database/index";
import { Connection } from "typeorm";
import { app } from "../../app";
import { v4 as uuid } from "uuid";

let connection: Connection;

describe("Statements Operation", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const user = {
    name: "Feitosa",
    email: "raphael@teste.com",
    password: "raphael"
  }

  const deposit = {
    description: "Amount",
    amount: 100
  }

  const withdraw = {
    description: "withdraw",
    amount: 100
  }


  it("should be able create new user test deposit/withdraw", async () => {

    const userCreated = await request(app).post("/api/v1/users")
      .send(user);

    expect(userCreated.status).toBe(201);
  });

  it("should be able to return a deposit", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const user_id = responseToken.body.user.id;
    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({
        description: "Amount",
        amount: 300
      });

    const statement_id = deposit.body.id;

    const responseDeposit = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(deposit.status).toBe(201);
    expect(responseDeposit.body).toHaveProperty("id");
    expect(responseDeposit.body.id).toEqual(statement_id);
    expect(responseDeposit.body.user_id).toEqual(user_id);
    expect(responseDeposit.body.description).toEqual(deposit.body.description);
    expect(responseDeposit.body.amount).toEqual("300.00");
    expect(responseDeposit.body.type).toEqual("deposit");
    expect(responseDeposit.status).toBe(200);
  });

  it("should not be able to return a deposit with an incorrect id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    const falseStatementUUID = uuid();

    const response = await request(app)
      .get(`/api/v1/statements/${falseStatementUUID}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Statement not found");
  });

  it("should not be able to return a deposit without token", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = responseDeposit.body.id;

    const response = await request(app).get(
      `/api/v1/statements/${statement_id}`
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });

});
