// dockerService.js

import Docker from 'dockerode';
import { promisify } from 'util';
import stream from 'stream';
import { uniqueName } from '../utils/uniqueNameGenerator';

const docker = new Docker();
const streamPipeline = promisify(stream.pipeline);
const CONTAINER_PORT = 9000;

export class DockerService {
    async createContainer(): Promise<string> {
        try {

            const containerName = uniqueName()
            const container = await docker.createContainer({
                Image: 'inderharrysingh/remote-terminal:node',
                name: containerName,
                Tty: true,
                OpenStdin: true,
                Labels: {
                    "traefik.enable": "true",
                    [`traefik.http.routers.${containerName}.rule`]: `Host(\`${containerName}.localhost\`)`,
                    [`traefik.http.services.${containerName}.loadbalancer.server.port`]: "9000"
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        ['terminal-network']: {}
                    }
                }
            });

            await container.start();
            return containerName

        } catch (error) {
            console.error('Container creation failed:', error);
            throw error;
        }
    }

    async executeCommand(containerName: string, command: string) {
        try {
            const response = await fetch(`http://${containerName}.localhost/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command })
            });
            const data = await response.json();
            return data as { "status": string };

        } catch (error) {
            console.error('Command execution failed:', error);
        }
    }

    async removeContainer(containerName: string): Promise<void> {
        try {
            const container = docker.getContainer(containerName);
            await container.remove({ force: true });
        } catch (error) {
            console.error('Container removal failed:', error);
            throw error;
        }
    }

}
