import { MyContext, OE_RPC_Client } from "../deps.ts";
import { Bot, hydrateFiles } from "../deps.ts";
import { BotMsg } from "./message.ts";
import { Queue } from "./queue.ts";

const envTokenVariable = "OE_TELGRAM_TOKEN";
if (!Deno.env.get(envTokenVariable)) {
  Deno.exit(1);
}
// DA is valid due to the env
const pendingIds: number[] = [];
const bot = new Bot(Deno.env.get(envTokenVariable)!);

const rpc = new OE_RPC_Client();
await rpc.init();
Deno.addSignalListener("SIGINT", clear);
Deno.addSignalListener("SIGTERM", clear);
Deno.addSignalListener("SIGQUIT", clear);

function clear() {
  const stopRpc = rpc.close();
  const stopBot = bot.stop();
  Promise.all([stopBot, stopRpc]).finally(Deno.exit());
}
main();

function main() {
  const queueMap = new Map<number, Queue>();

  bot.api.config.use(hydrateFiles(bot.token));
  bot.catch(console.error);
  bot.command(
    "start",
    (ctx) =>
      ctx.reply(
        "Hi! This is a bot that will transform a group of Telegram messages into Ace Attorney scenes. Just forward me the messages",
      ),
  );
  bot.command("about", (ctx) => {
    // ctx.pho
    ctx.reply(
      "Made with ❤ by @TLuigi003.\nSource code in https://github.com/LuisMayo/ace-attorney-telegram-bot\n\nDo you like my work? You could thank me by buying me a [ko-fi](https://ko-fi.com/luismayo)",
      { parse_mode: "Markdown" },
    );
  });
  bot.on("message:forward_date", (ctx) => {
    addQueueMessageToQueue(queueMap, ctx as MyContext);
  });
  bot.start();
}

function addQueueMessageToQueue(queueMap: Map<number, Queue>, ctx: MyContext) {
  if (!ctx.chat?.id) {
    throw new Error("InvalidChat");
  } else {
    const chatId = ctx.chat.id;
    if (!queueMap.has(chatId)) {
      queueMap.set(chatId, new Queue());
    }
    // Definite assignment due to the if up here
    const queue = queueMap.get(chatId)!;
    if (queue.lastTimer) {
      clearTimeout(queue.lastTimer);
    }
    queue.msgList.push(new BotMsg(ctx));
    queue.lastTimer = setTimeout(() => {
      doRender(queueMap, chatId, queue, ctx);
    }, 5 * 1000);
  }
}

function doRender(
  queueMap: Map<number, Queue>,
  chatId: number,
  queue: Queue,
  ctx: MyContext,
) {
  const dir = Deno.makeTempDirSync();
  const filename = dir + "/file.mp4";
  queueMap.delete(chatId);
  const pendingTasks = pendingIds.filter((num) => num === chatId).length;
  const priority = rpc.computeBestPriority({
    msgLength: queue.msgList.length,
    reptitions: pendingTasks,
  });
  pendingIds.push(chatId);
  rpc.getQueueLength().then((val) => {
    ctx.reply(
      `Render in progress, there are ${val} people in queue before you`,
    );
  }).catch(() => {
    ctx.reply("Render in progress");
  });
  rpc.render({
    comment_list: queue.msgList,
    avoid_spoiler_sprites: true,
    resolution_scale: 2,
    output_filename: filename,
  }, { priority }).then((value) => {
    ctx.replyWithVideo(value.url).catch(ctx.reply).finally(() =>
      Deno.remove(dir, { recursive: true })
    );
  }).catch((e) => {
    Deno.remove(dir, { recursive: true });
    ctx.reply(e);
  })
    .finally(() => {
      const id = pendingIds.findIndex((num) => num === chatId);
      pendingIds.splice(id, 1);
    });
}
