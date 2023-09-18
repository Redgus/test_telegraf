const config = require('config');
const { Telegraf } = require('telegraf')

const bot = new Telegraf(config.get('token'))

bot.use(async (ctx, next) => {

    const date = new Date();

    console.log('new code');
    console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] Пользователь ${ctx.from.id}`);
    await next();
});

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.catch((err, ctx) => {
    console.error(`⚠️ Error on ${ctx.updateType}: ${err.message}`, err)
});

bot.launch()