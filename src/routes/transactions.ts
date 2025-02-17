import { FastifyInstance } from "fastify";
import { db } from "../config/database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const transactions = await db("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getTransactionParamsSchema.parse(request.params);

      const sessionId = request.cookies.sessionId;

      const transaction = await db("transactions")
        .where({
          session_id: sessionId,
          id,
        })
        .first();

      if (!transaction) {
        return response.status(404).send();
      }

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId;

      const summary = await db("transactions")
        .where({ session_id: sessionId })
        .sum("content", { as: "amount" }) // content é o valor em numero
        .first();

      return { summary };
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        content: z.number(),
        type: z.enum(["credit", "debit"]),
      });

      const { title, content, type } = createTransactionBodySchema.parse(
        request.body
      );

      let sessionId = request.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID(); // cria um session id

        reply.setCookie("sessionId", sessionId, {
          path: "/", // mostrando em que pagina eu poderie ter esse cookie
          maxAge: 60 * 60 * 24 * 10,
        }); // 10 dias
      }

      await db("transactions").insert({
        id: randomUUID(),
        title,
        content: type === "credit" ? content : content * -1,
        session_id: sessionId,
      });

      return reply.status(201).send();
    }
  );
}
