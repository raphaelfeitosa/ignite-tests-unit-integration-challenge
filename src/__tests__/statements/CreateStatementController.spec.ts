import request from "supertest";
import createConnection from "../../database/index";
import { Connection } from "typeorm";
import { app } from "../../app";
import { IUsersRepository } from "../../modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";

let connection: Connection;

let inMemoryUsersRepository: IUsersRepository;

let createUserUseCase: CreateUserUseCase;

describe("Create Statements", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
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
    amount: 500
  }

  const withdraw = {
    description: "withdraw",
    amount: 100
  }

  const transfer = {
    description: "transfer",
    amount: 100
  }

  it("should be able create new user test deposit/withdraw", async () => {

    const userCreated = await request(app).post("/api/v1/users")
      .send(user);

    expect(userCreated.status).toBe(201);
  });

  it("should be able create an deposit", async () => {

    await request(app).post("/api/v1/users")
      .send(user);

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const user_id = responseToken.body.user.id;
    console.log(user_id);
    const { token } = responseToken.body;
    console.log(token);

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send(deposit);

    console.log(responseDeposit.body);

    // expect(responseDeposit.body).toHaveProperty("id");
    expect(responseDeposit.body.user_id).toEqual(user_id);
    expect(responseDeposit.status).toBe(201);
  });

  it("should not be able to create an deposit with invalid token", async () => {
    const token = "fakeToken";

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.body.message).toEqual("JWT invalid token!");
    expect(responseDeposit.status).toBe(401);
  });

  it("should not be able to create an deposit with missing token", async () => {

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: ``,
      });

    expect(responseDeposit.body.message).toEqual("JWT token is missing!");
    expect(responseDeposit.status).toBe(401);
  });

  it("should not be able to create an deposit without authorization", async () => {

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit);

    expect(responseDeposit.status).toBe(401);
  });

  it("should not be able to create an deposit without amount", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit.description)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(500);
  });

  it("should not be able to create an deposit without description", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body

    const deposit = {
      amount: 100
    };

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(500);
  });

  it("should not be able to create an deposit without amount and without description - Not Send Object", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(500);
  });

  it("should not be able to create an deposit without amount and without description - Send Empty Object", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({})
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.status).toBe(500);
  });
  //---End Deposit---

  // WITHDRAW
  it("should be able create an withdraw", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const user_id = responseToken.body.user.id;
    const { token } = responseToken.body

    await request(app)
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

    expect(responseWithdraw.body).toHaveProperty("id");
    expect(responseWithdraw.body.user_id).toEqual(user_id);
    expect(responseWithdraw.status).toBe(201);
  });


  it("should not be able to create an withdraw with invalid token", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    let { token } = responseToken.body

    // Remove o primeiro caractere para adulterar o token
    token = token.replace(/^./, "");

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.body.message).toEqual("JWT invalid token!");
    expect(responseWithdraw.status).toBe(401);
  });

  it("should not be able to create an withdraw with missing token", async () => {

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({
        Authorization: ``,
      });

    expect(responseWithdraw.body.message).toEqual("JWT token is missing!");
    expect(responseWithdraw.status).toBe(401);
  });

  it("should not be able to create an withdraw without authorization", async () => {

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw);

    expect(responseWithdraw.body.message).toEqual("JWT token is missing!");
    expect(responseWithdraw.status).toBe(401);
  });

  it("should not be able to create an withdraw without amount", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw.description)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(500);
  });

  it("should not be able to create an withdraw without description", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const withdraw = {
      amount: 100,
    };

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(500);
  });

  it("should not be able to create an withdraw without amount and without description - Not Send Object", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(500);
  });

  it("should not be able to create an withdraw without amount and without description - Send Empty Object", async () => {

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({})
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(500);
  });
});
