import { Injector, Logger, webpack } from "replugged";
import type { WebSocket } from "@app/types";

const inject = new Injector();
const logger = Logger.plugin("Modded RPC");
const { filters, getModule } = webpack;

import status from "@features/status";

const handlers: { [key: string]: (socket: WebSocket, data: any) => void } = {
    "status": status.changeStatus
};

/**
 * Copies available target properties to the source object.
 *
 * @param source The source object.
 * @param target The target object.
 * @param copy Should the result be copied to the source object?
 */
export function rCopy(source: any, target: any, copy = false): any {
    const final = { ...source };
    for (const key in target) {
        if (typeof target[key] === "object") {
            final[key] = rCopy(final[key], target[key]);
        } else {
            final[key] = target[key];
        }
    }

    if (copy) {
        for (const key in final) {
            source[key] = final[key];
        }
    }

    return final;
}

// Connect to the local server using 'ws://127.0.0.1:6463/rpc?v=1'.
export async function start(): Promise<void> {
    const module = getModule(filters.bySource("RPCServer:WSS"));
    if (!module) return logger.error("RPCServer:WSS module not found!");

    inject.instead(module, "handleConnection" as never, (args, orig) => {
        const socket = args[0] as WebSocket;
        const url = socket.upgradeReq().url;
        if (url != "/rpc?v=1") return orig(...args);

        socket.on("message", (data: string) => {
            try {
                const message: any = JSON.parse(data);
                if (!message["cmd"]) return;

                const handler = handlers[message["cmd"]];
                if (handler) handler(socket, message);
            } catch (error) {
                logger.error("Failed to parse JSON message.", error);
            }
        });
    });

    logger.log("WebSocket hooked successfully. Connect on 'ws://127.0.0.1:6463/rpc?v=1'.")
}

export function stop(): void {
    inject.uninjectAll();
}
