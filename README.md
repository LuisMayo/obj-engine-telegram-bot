# obj-engine-telegram-bot
 A telegram bot that https://github.com/LuisMayo/Objection-Engine-Rabbit-Worker
 More info: https://github.com/LuisMayo/objection-engine-docs

## Getting Started

### Prerequisites

 - [Deno Typescript runtime](https://deno.land/)
 - An AMQP broker. I personally use RabbitMQ
 - A working [objection engine worker](https://github.com/LuisMayo/Objection-Engine-Rabbit-Worker)
 - A token from BotFather

### Installing

1. Clone the repository

```
git clone https://github.com/LuisMayo/obj-engine-telegram-bot
```
2. Set the telegram token into the `OE_TELGRAM_TOKEN` environmental variable

2. Run the bot
``` bash
deno run --allow-read --allow-write --allow-net --allow-env ./src/main.ts
```

## Contributing
Since this is a tiny project we don't have strict rules about contributions. Just open a Pull Request to fix any of the project issues or any improvement you have percieved on your own. Any contributions which improve or fix the project will be accepted as long as they don't deviate too much from the project objectives. If you have doubts about whether the PR would be accepted or not you can open an issue before coding to ask for my opinion
