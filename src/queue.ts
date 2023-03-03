import { BotMsg } from "./message.ts";

export class Queue {
    public msgList: BotMsg[] = [];
    public lastTimer?: number;
    public dir = Deno.makeTempDirSync();

    clear() {
        Deno.removeSync(this.dir, {recursive: true})
    }
}