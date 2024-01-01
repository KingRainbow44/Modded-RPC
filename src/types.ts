export interface Settings {
    port?: number;
}

export type WebSocketEvents
    = "message";

export interface WebSocket {
    close: () => any;
    emit: () => any;
    on: (event: WebSocketEvents, handler: (props: any) => void) => any;
    once: () => any;
    send: (content: string) => void;
    upgradeReq: () => {
        url: string;
    };
}

export interface UserSettingsModule {
    PreloadedUserSettingsActionCreators: {
        updateAsync(what: string, fn: (value: any) => void, any: 0): Promise<void>
    }
}

export interface StatusUpdateMessage {
    customStatus?: {
        emojiId?: string | "0";
        emojiName?: string | "";
        expiresAtMs?: string | "0";
        text?: string | "";
    };
    showCurrentGame: {
        value?: boolean;
    }
    status: {
        value?: "online" | "dnd" | "idle" | "invisible";
    }
}
