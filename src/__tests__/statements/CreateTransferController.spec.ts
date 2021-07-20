import request from "supertest";
import createConnection from "../../database/index";
import { v4 as uuid } from "uuid";
import { Connection } from "typeorm";
import { app } from "../../app";
import { hash } from "bcryptjs";

const user_1_id = uuid();
const user_2_id = uuid();
const statement_id = uuid();

let connection: Connection;


describe("Create Transfer Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("1234", 8);

    await connection.query(`
      INSERT INTO users(id, name, email, password)
      VALUES ('${user_1_id}', 'User 1', 'user1@test.com', '${password}')
    `);

    await connection.query(`
      INSERT INTO users(id, name, email, password)
      VALUES ('${user_2_id}', 'User 2', 'user2@test.com', '${password}')
    `);

    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type)
      VALUES('${statement_id}', '${user_1_id}', 'deposit', 500, 'deposit')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });


  it("should be able to transfer an amount to an user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user1@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;
    console.log(token);
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user_2_id}`)
      .send({
        description: "transfer",
        amount: 100,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    delete response.body.user_id;

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a withdraw if the balance is insufficient", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "user1@test.com",
        password: "1234",
      });

    const { token } = responseToken.body;
    const responseWithdraw = await request(app)
      .post(`/api/v1/statements/transfer/${user_2_id}`)
      .send({
        description: "transfer",
        amount: 600,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(400);
  });
});
