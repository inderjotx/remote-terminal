import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { containerController } from "./containerController";

export const containerRegistry = new OpenAPIRegistry();
export const containerRouter: Router = express.Router();


containerRegistry.registerPath({
  method: "get",
  path: "/container",
  tags: ["Create Container"],
  responses: createApiResponse(z.null(), "Success"),
});


containerRegistry.registerPath({
  method: "post",
  path: "/execute-command",
  tags: ["Execute Command"],
  responses: createApiResponse(z.object({ output: z.string() }), "Success"),
});


containerRouter.get("/create", containerController.createContainer);
containerRouter.post("/execute-command", containerController.executeCommand);
