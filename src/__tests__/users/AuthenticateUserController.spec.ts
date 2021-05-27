import request from "supertest";
import createConnection from "../../database/index";
import { verify } from 'jsonwebtoken';
import authConfig from '../../config/auth';

import { Connection } from "typeorm";
import { app } from "../../app";
import { hash } from "bcryptjs";
import { UsersRepository } from "../../modules/users/repositories/UsersRepository";

let connection: Connection;

describe("authenticate User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate User", async () => {
    const usersRepository = new UsersRepository();

    const user = { name: "Feitosa", email: "raphael@teste.com", password: "raphael" };
    const userCreated = await usersRepository.create({
      name: user.name,
      email: user.email,
      password: await hash(user.password, 8)
    });

    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "raphael@teste.com",
        password: "raphael"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        user: {
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
        },
        token: expect.any(String)
      }),
    );
    expect(() => {
      verify(response.body.token, authConfig.jwt.secret);
    }).not.toThrowError();
  });

  it("Should not be able to authenticate a user with wrong email", async () => {

    const user = await request(app).post("/api/v1/users")
      .send({
        name: "Feitosa",
        email: "teste1@teste.com",
        password: "teste"
      });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "raphael123@teste.com",
      password: "teste"
    })

    expect(user.status).toBe(201);
    expect(response.status).toBe(401);
    //expect(response.body).toMatchObject({
    // message: "Incorrect email or password"
    // });
    expect(response.body.message).toEqual("Incorrect email or password");
  });

});











