import { FastifyInstance } from "fastify";
import { db } from "../config/database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await db("transactions").select();

    return { transactions };
  });

  app.get("/:id", async (request, response) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await db("transactions").where("id", id).first();

    if (!transaction) {
      return response.status(404).send();
    }

    return { transaction };
  });

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      content: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, content, type } = createTransactionBodySchema.parse(
      request.body
    );

    await db("transactions").insert({
      id: randomUUID(),
      title,
      content: type === "credit" ? content : content * -1,
    });

    return reply.status(201).send();
  });
}
