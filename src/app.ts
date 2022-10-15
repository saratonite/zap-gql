import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { createServer } from "@graphql-yoga/node";

export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  // GraphQL Server
  const graphQLServer = createServer<{
    req: FastifyRequest;
    reply: FastifyReply;
  }>({
    // Integrate Fastify logger
    logging: {
      debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
      info: (...args) => args.forEach((arg) => app.log.info(arg)),
      warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
      error: (...args) => args.forEach((arg) => app.log.error(arg)),
    },
    // Schema
    schema: {
      typeDefs: /* GraphQL */ `
        type Query {
          hello: String
        }
      `,
      resolvers: {
        Query: {
          hello: () => "Hello from Yoga!",
        },
      },
    },
  });

  // register Graphql Route
  /**
   * We pass the incoming HTTP request to GraphQL Yoga
   * and handle the response using Fastify's `reply` API
   * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
   **/
  app.route({
    url: "/graphql",
    method: ["GET", "POST", "OPTIONS"],
    async handler(req: FastifyRequest, reply: FastifyReply) {
      // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
      const response = await graphQLServer.handleIncomingMessage(req, {
        req,
        reply,
      });
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);

      reply.send(response.body);

      return reply;
    },
  });

  await app.ready();

  return app;
}