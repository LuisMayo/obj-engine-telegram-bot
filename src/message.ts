import { Comment, MyContext } from "../deps.ts";

export class BotMsg extends Comment {
  constructor(ctx: MyContext) {
    super();
    const msg = ctx.message!;
    if (ctx.message?.photo || ctx.message?.sticker) {
      ctx.getFile().then(file => {
          file.download().then((str) => this.evidence_path = str).catch(console.error);
      }).catch(() => {});
    }
    this.text_content = msg.text ?? msg.caption;
    this.user_id = msg.forward_from?.id.toString();
    this.user_name = msg.forward_from?.first_name ?? msg.forward_sender_name;
  }
}
