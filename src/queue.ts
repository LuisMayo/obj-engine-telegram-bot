import { BotMsg } from "./message.ts";

export class Queue {
    public msgList: BotMsg[] = [];
    public lastTimer?: number;
}