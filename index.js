const config = require('config');
const { Telegraf } = require('telegraf')
const { MongoClient } = require('mongodb');
const { session } = require('telegraf-session-mongodb');

const bot = new Telegraf(config.get('token'))

const init = async () => {
    const db = (await MongoClient.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, useUnifiedTopology: true, dbName : 'telegram' })).db();

    bot.use(session(db));

    bot.use(async (ctx, next) => {

        const date = new Date();
    
        console.log('new code');
    
        ctx.session.date = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
        
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
	
    bot.launch();
}

init()