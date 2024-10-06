import type { Request, RequestHandler, Response } from "express";

import { containerService } from "@/api/container/containerService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class ContainerController {
  public createContainer: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await containerService.createContainer();
    return handleServiceResponse(serviceResponse, res);
  };

  public executeCommand: RequestHandler = async (req: Request, res: Response) => {
    const { containerName, command } = req.body;
    const serviceResponse = await containerService.executeCommand(containerName, command);
    return handleServiceResponse(serviceResponse, res);
  };

}

export const containerController = new ContainerController();
