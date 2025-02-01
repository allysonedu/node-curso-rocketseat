import fastify from "fastify";
import { knex } from "./database";

const app = fastify();

app.get("/hello", async (req, reply) => {
  const tables = await knex("sqlite_schema").select("*");

  return { message: "Hello, World!", tables };
});

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
