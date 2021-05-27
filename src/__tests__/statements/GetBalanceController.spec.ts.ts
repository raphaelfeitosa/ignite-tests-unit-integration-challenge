import request from "supertest";
import createConnection from "../../database/index";
import { Connection } from "typeorm";
import { app } from "../../app";

let connection: Connection;

describe("Balance", () => {

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

  it("should be able get balance", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const user_id = responseToken.body.user.id;
    const { token } = responseToken.body


    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send(deposit);


    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send(withdraw);

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({ user_id });

    expect(responseDeposit.status).toBe(201);
    expect(responseWithdraw.status).toBe(201);
    expect(responseBalance.status).toBe(200);
  });

});
