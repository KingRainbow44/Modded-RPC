import { webpack } from "replugged";
import { StatusUpdateMessage, UserSettingsModule, WebSocket } from "@app/types";
import { rCopy } from "@app/index";

const { filters, getModule } = webpack;
const userSettings: UserSettingsModule = getModule(
    filters.byProps("PreloadedUserSettingsActionCreators"),
)!;

interface ChangeStatusMessage {
    showGame?: boolean;
    status?: "online" | "dnd" | "idle" | "invisible";
    emoji?: {
        id: string;
        name: string;
    };
    expiresTime?: number;
    message?: string;
}

async function setStatus(status: StatusUpdateMessage): Promise<void> {
    await userSettings.PreloadedUserSettingsActionCreators.updateAsync(
        "status",
        (original) => {
            rCopy(original, status, true);
        },
        0,
    );
}

async function changeStatus(_: WebSocket, data: ChangeStatusMessage): Promise<void> {
    const status: StatusUpdateMessage = {
        customStatus: {},
        showCurrentGame: {},
        status: {},
    };

    if (data.emoji) {
        status.customStatus.emojiId = data.emoji.id;
        status.customStatus.emojiName = data.emoji.name;
    }
    if (data.expiresTime) {
        status.customStatus.expiresAtMs = (Date.now() + data.expiresTime).toString();
    }
    if (data.message) {
        status.customStatus.text = data.message;
    }
    if (data.status) {
        status.status.value = data.status;
    }
    if (data.showGame) {
        status.showCurrentGame.value = data.showGame;
    }

    await setStatus(status);
}

export default {
    changeStatus,
};
