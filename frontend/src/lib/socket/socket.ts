
const HOSTNAME = process.env.NEXT_PUBLIC_SOCKET_HOSTNAME;

import { io, type Socket } from 'socket.io-client';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket | null = null;

    private constructor() { }

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    connect(containerName: string, isHttps: boolean) {
        if (this.socket) {
            this.socket.close();
        }
        const url = isHttps ? `https://${containerName}.${HOSTNAME}` : `http://${containerName}.${HOSTNAME}`;
        this.socket = io(url);
        return this.socket;
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketManager = SocketManager.getInstance();
