import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { DockerService } from "@/common/service/DockerService";


export class ContainerService {



  // Retrieves all users from the database

  private dockerService: DockerService;

  constructor() {
    this.dockerService = new DockerService();
  }

  async createContainer(): Promise<ServiceResponse<{ containerName: string } | null>> {
    try {
      const containerName = await this.dockerService.createContainer();
      return ServiceResponse.success<{ containerName: string }>("Container created", { containerName })
    } catch (ex) {

      const errorMessage = `Error creating container: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating container.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async executeCommand(containerName: string, command: string): Promise<ServiceResponse<{ output: string } | null>> {
    try {
      const output = await this.dockerService.executeCommand(containerName, command);

      if (!output) {
        return ServiceResponse.failure(
          "An error occurred while executing command.",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return ServiceResponse.success<{ output: string }>("Command executed", { output: output?.status });
    } catch (ex) {
      const errorMessage = `Error executing command: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while executing command.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


export const containerService = new ContainerService();
